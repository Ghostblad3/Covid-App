const express = require("express");
var cors = require("cors");
const crypto = require("crypto");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const { logRequestType } = require("./middlewares/log-request-type");
const { isClientAuthorized } = require("./middlewares/is-client-authorized");
const { natsWrapper } = require("./nats/nats-wrapper");
const { NatsPublisher } = require("./nats/nats-publisher");
const { connection } = require("./mysql/connection");
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

// Returns all the visits for a specific user
app.post(
  "/visits/fetch-visits-for-specific-user",
  isClientAuthorized,
  async (req, res) => {
    const { userId } = req.session.user;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select name, address, visit_date, visit_timestamp 
      from pois inner join visits on visits.poi_id = pois.id 
      where visits.user_id = ? order by visit_timestamp desc`,
      [userId]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Adds a new visit
app.post("/visits/add-visit", isClientAuthorized, async (req, res) => {
  const { userId } = req.session.user;
  const { poiId } = req.body;

  const con = connection.getConnection();

  const [timeDifference] = await con.query(
    `select TIMESTAMPDIFF(MINUTE, max(visit_timestamp), NOW()) as diff 
    from visits 
    where user_id = ? and poi_id = ?`,
    [userId, poiId]
  );

  if (timeDifference[0].diff === null || timeDifference[0].diff > 180) {
    const visitId = crypto.randomBytes(12).toString("hex");

    await con.query(
      `insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values (?, ?, ?, current_date(), now())`,
      [visitId, userId, poiId]
    );

    const [result] = await con.query(
      `select * from visits
      where id = ?`,
      [visitId]
    );

    new NatsPublisher(natsWrapper.getClient()).publish(
      "visit:created",
      result[0]
    );

    return res.send({
      hasAccessPermission: true,
      data: null,
      errorMessage: "",
    });
  } else {
    return res.send({
      hasAccessPermission: true,
      data: null,
      errorMessage:
        "You can't visit the same place again in less than 2 hours.",
    });
  }
});

// Returns the average visits for a specific POI for the previous 2 hours
app.post(
  "/visits/fetch-average-visits-for-specific-poi-for-previous-two-hours",
  isClientAuthorized,
  async (req, res) => {
    const { poi } = req.body;

    const con = connection.getConnection();

    var results = [];

    await Promise.all(
      poi.map(async (currentPoi) => {
        const [selectResults] = await con.query(
          `select count(*) / if(timestampdiff(week, min(visit_date), max(visit_date)) = 0, 1 , timestampdiff(week, min(visit_date), max(visit_date))) as average, poi_id 
          from pois 
          inner join visits on visits.poi_id = pois.id 
          where mod(timestampdiff(minute, NOW(), visits.visit_timestamp), 10080) >= -120 
          and mod(timestampdiff(minute, NOW(), visits.visit_timestamp), 10080) <= 0 
          and pois.id = ?`,
          [currentPoi]
        );

        const obj = {
          poi_id: currentPoi,
          average:
            selectResults[0].average !== null ? selectResults[0].average : 0,
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

      console.log("Connected to visits service database.");

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
        "visits-poi-queue-group"
      ).listen("poi:created");

      app.listen(3000, () => {
        console.log("Listening on port 3000.");
      });

      clearInterval(interval);
    } catch (ex) {}
  }, 5000);
};

start();
