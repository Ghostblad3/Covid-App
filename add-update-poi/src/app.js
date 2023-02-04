const express = require("express");
var cors = require("cors");
const mysql = require("mysql2/promise");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const _ = require("lodash");
const { createClient } = require("redis");
const { logRequestType } = require("./middlewares/log-request-type");
const { isAdminAuthorized } = require("./middlewares/is-admin-authorized");
const { natsWrapper } = require("./nats/nats-wrapper");
const { NatsPublisher } = require("./nats/nats-publisher");

var con = undefined;

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

// Adds new poi (many) to the system
app.post("/add-update-poi/add-poi", isAdminAuthorized, async (req, res) => {
  const { poi } = req.body;

  const con = await getConnection();

  const [poiIds] = await con.query(
    `select id
  from pois`,
    []
  );

  const poiFiltered = poi.filter((x) => !poiIds.find((y) => y.id === x.id));

  const poiData = poiFiltered.map((item) =>
    _.values({
      id: item.id,
      name: item.name,
      address: item.address,
      latitude: item.coordinates.lat.toString(),
      longitude: item.coordinates.lng.toString(),
    })
  );

  await con.query(
    "insert into pois (id, name, address, latitude, longitude) values ?",
    [poiData]
  );

  var poiPopularTimesData = [];

  poiFiltered.forEach((curr_poi) => {
    var day = 1;

    curr_poi.populartimes.forEach((item) => {
      var hour = 1;

      item.data.forEach((item) => {
        poiPopularTimesData.push([curr_poi.id, day, hour, item]);
        hour = hour + 1;
      });

      day = day + 1;
    });
  });

  var poiTypesData = [];

  poiFiltered.forEach((item) => {
    item.types.forEach((type) => {
      poiTypesData.push([item.id, type]);
    });
  });

  new NatsPublisher(natsWrapper.getClient()).publish("poi:created", {
    poiData,
    poiTypesData,
  });

  new NatsPublisher(natsWrapper.getClient()).publish(
    "poi-pop-times:created",
    poiPopularTimesData
  );

  return res.send({
    hasAccessPermission: true,
    data: {},
    errorMessage: "",
  });
});

const getConnection = async () => {
  if (con) return con;

  con = await mysql.createConnection({
    host: "mysql-poi-info-db-srv",
    user: "root",
    password: "123",
  });

  return con;
};

const start = async () => {
  const interval = setInterval(async () => {
    try {
      con = await mysql.createConnection({
        host: "mysql-add-update-poi-db-srv",
        user: "root",
        database: "add_update_poi_db",
        password: "123",
      });

      console.log("Connected to add-update-poi service database.");

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

      app.listen(3000, () => {
        console.log("Listening on port 3000.");
      });

      clearInterval(interval);
    } catch (e) {}
  }, 5000);
};

start();
