const express = require("express");
var cors = require("cors");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const { logRequestType } = require("./middlewares/log-request-type");
const { isClientAuthorized } = require("./middlewares/is-client-authorized");
const { connection } = require("./mysql/connection");
const { natsWrapper } = require("./nats/nats-wrapper");
const { NatsVisitListener } = require("./nats/nats-visit-listener");
const { NatsPopularTimesListener } = require("./nats/nats-pop-times-listener");

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

// Returns the popularity for specific poi (many) for a specific day
app.post(
  "/popular-times/fetch-poi-pop-times",
  isClientAuthorized,
  async (req, res) => {
    const { poi, dayIndex } = req.body;

    const con = connection.getConnection();

    var results = [];

    await Promise.all(
      poi.map(async (currentPoi) => {
        const [selectResults] = await con.query(
          `select popularity 
          from popular_times 
          where poi_id = ? and day = ?`,
          [currentPoi, dayIndex]
        );

        const obj = {
          poi_id: currentPoi,
          popular_times: selectResults.map((item) => item.popularity),
        };

        results.push(obj);
      }, results)
    );

    return res.send({
      hasAccessPermission: true,
      data: results,
      errorMessage: "",
    });
  }
);

const start = async () => {
  const interval = setInterval(async () => {
    try {
      await connection.connnectToMySqlDb();

      console.log("Connected to popular-times service database.");

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

      new NatsVisitListener(
        natsWrapper.getClient(),
        "popular-times-visit-queue-group"
      ).listen("visit:created");

      new NatsPopularTimesListener(
        natsWrapper.getClient(),
        "popular-times-pop-times-queue-group"
      ).listen("poi-pop-times:created");

      app.listen(3000, () => {
        console.log("Listening on port 3000.");
      });

      clearInterval(interval);
    } catch (ex) {}
  }, 5000);
};

start();
