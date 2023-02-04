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
const { NatsCaseListener } = require("./nats/nats-case-listener");
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

// Returns the visits for a specific user where there is possible contact with active coronavirus case
app.post(
  "/contact-with-cases/fetch-contacts-with-cases",
  isClientAuthorized,
  async (req, res) => {
    const { userId } = req.session.user;

    const con = connection.getConnection();

    const [userVisits] = await con.query(
      `
      select visits.poi_id, visits.visit_timestamp, visits.user_id, visits.visit_timestamp, name, address
      from visits 
      inner join pois on visits.poi_id = pois.id
      where user_id = ?
    `,
      [userId]
    );

    let results = [];

    await Promise.all(
      userVisits.map(async (visit) => {
        const [result] = await con.query(
          `
      select count(*) as count
      from visits
      inner join cases on cases.user_id = visits.user_id
      where poi_id = ?
      and abs(TIMESTAMPDIFF(MINUTE , visit_timestamp, ?)) <= 120
      and visits.user_id != ?
      and abs(TIMESTAMPDIFF(DAY, cases.case_date, ?)) <= 14
      `,
          [
            visit.poi_id,
            visit.visit_timestamp
              .toISOString()
              .substring(0, 19)
              .replace("T", " "),
            visit.user_id,
            visit.visit_timestamp.toISOString().substring(0, 10),
          ]
        );

        if (result[0].count > 0) {
          results.push({
            name: visit.name,
            address: visit.address,
            visit_timestamp: visit.visit_timestamp,
          });
        }
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

      console.log("Connected to contact-with-cases service database.");

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
        "contact-cases-visit-queue-group"
      ).listen("visit:created");

      new NatsCaseListener(
        natsWrapper.getClient(),
        "contact-cases-case-queue-group"
      ).listen("case:created");

      new NatsPoiListener(
        natsWrapper.getClient(),
        "contact-cases-poi-queue-group"
      ).listen("poi:created");

      app.listen(3000, () => {
        console.log("Listening on port 3000.");
      });

      clearInterval(interval);
    } catch (e) {}
  }, 5000);
};

start();
