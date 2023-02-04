const express = require("express");
var cors = require("cors");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { connection } = require("./mysql/connection");
const { createClient } = require("redis");
const { logRequestType } = require("./middlewares/log-request-type");
const { isClientAuthorized } = require("./middlewares/is-client-authorized");
const { natsWrapper } = require("./nats/nats-wrapper");
const { NatsPoiListener } = require("./nats/nats-poi-listener");

let redisClient = createClient({
  url: "redis://redis-session-srv:6379",
  legacyMode: true,
});
redisClient.connect().catch();
redisClient.on("error", (err) => {});

const app = express();

app.use(cors());
app.set("trust proxy", true);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: "keyboard cat",
    resave: false,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);

app.use(logRequestType);

// Returns all the poi based on distance
app.post("/poi-info/fetch-poi", isClientAuthorized, async (req, res) => {
  const { latitude, longitude, distance } = req.body;
  const distanceInKm = distance / 1000;

  const con = connection.getConnection();

  const [selectResult] = await con.query(
    `select id, name, address, latitude, longitude 
    from pois 
    where 111.045 * DEGREES(ACOS(LEAST(1.0,COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(?) - RADIANS(longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude))))) <= ?`,
    [latitude, longitude, latitude, distanceInKm]
  );

  res.send({
    hasAccessPermission: true,
    data: selectResult,
    errorMessage: "",
  });
});

// Returns all categories
app.post("/poi-info/fetch-categories", isClientAuthorized, async (req, res) => {
  const con = connection.getConnection();

  const [selectResult] = await con.query(
    `select distinct type 
    from types`,
    []
  );

  return res.send({
    hasAccessPermission: true,
    data: selectResult,
    errorMessage: "",
  });
});

// Returns all the poi for a specific category
app.post(
  "/poi-info/fetch-poi-based-on-category",
  isClientAuthorized,
  async (req, res) => {
    const { category } = req.body;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select pois.id, name, address, latitude, longitude 
    from pois inner join types on types.poi_id = pois.id 
    where type = ?`,
      [category]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

const start = async () => {
  const interval = setInterval(async () => {
    try {
      await connection.connnectToMySqlDb();

      console.log("Connected to poi-info service database.");

      await natsWrapper.connect(
        process.env.CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.URL
      );

      natsWrapper.getClient().on("close", () => {
        console.log("Connection closed.");
        process.exit();
      });

      process.on("SIGTERM", () => natsWrapper.getClient().close());
      process.on("SIGINT", () => natsWrapper.getClient().close());

      new NatsPoiListener(
        natsWrapper.getClient(),
        "poi-info-poi-queue-group"
      ).listen("poi:created");

      app.listen(3000, () => {
        console.log("Listening on port 3000.");
      });

      clearInterval(interval);
    } catch (e) {}
  }, 5000);
};

start();
