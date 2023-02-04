const express = require("express");
var cors = require("cors");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const { logRequestType } = require("./middlewares/log-request-type");
const { isAdminAuthorized } = require("./middlewares/is-admin-authorized");
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

// Returns the number of visits by active cases grouped by poi category
app.post(
  "/visits-cases-stats/fetch-visits-by-active-cases-grouped-by-poi-category",
  isAdminAuthorized,
  async (req, res) => {
    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number, type 
    from visits 
    inner join cases on visits.user_id = cases.user_id 
    inner join types on types.poi_id = visits.poi_id 
    where (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= -7 
    and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 0) 
    or (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 14 
    and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= 0) 
    group by types.type`,
      []
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the number of visits by active cases grouped by day
app.post(
  "/visits-cases-stats/fetch-visits-by-active-cases-for-specific-period-grouped-by-day",
  isAdminAuthorized,
  async (req, res) => {
    const { startDate, endDate } = req.body;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number, visits.visit_date  from visits 
    inner join cases on cases.user_id = visits.user_id 
    where (visits.visit_date >= ? and visits.visit_date <= ?) 
    and (((timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= -7 
    and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 0) 
    or (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 14 
    and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= 0))) 
    group by visits.visit_date`,
      [startDate, endDate]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the number of visits by active cases for specific day grouped by hour
app.post(
  "/visits-cases-stats/fetch-visits-by-active-cases-for-specific-day-grouped-by-hour",
  isAdminAuthorized,
  async (req, res) => {
    const { date } = req.body;
    const dateTimestamp = `${date} 00:00:00`;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select timestampdiff(hour, ?, visit_timestamp) as hour, count(*) as number 
      from visits 
      inner join cases on cases.user_id = visits.user_id 
      where visits.visit_date = ? 
      and ((timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= -7 
      and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 0) 
      or (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 14 
      and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= 0)) 
      group by timestampdiff(hour, ?, visit_timestamp) 
      order by timestampdiff(hour, ?, visit_timestamp) asc`,
      [dateTimestamp, date, dateTimestamp, dateTimestamp]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the number of visits by active cases
app.post(
  "/visits-cases-stats/fetch-active-cases-visits-number",
  isAdminAuthorized,
  async (req, res) => {
    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number 
      from visits 
      inner join cases on visits.user_id = cases.user_id 
      where (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= -7 
      and timestampdiff(day, cases.case_date, date(visits.visit_timestamp))) <= 0 
      or (timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) <= 14 
      and timestampdiff(day, cases.case_date, date(visits.visit_timestamp)) >= 0)`,
      []
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult[0],
      errorMessage: "",
    });
  }
);

// Returns the number of visits grouped by poi category
app.post(
  "/visits-cases-stats/fetch-visits-number-grouped-by-poi-category",
  isAdminAuthorized,
  async (req, res) => {
    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number, types.type as type 
      from visits 
      inner join types on types.poi_id = visits.poi_id 
      group by types.type`,
      []
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the visits for a specific day grouped by hour
app.post(
  "/visits-cases-stats/fetch-visits-for-specific-day-grouped-by-hour",
  isAdminAuthorized,
  async (req, res) => {
    const { date } = req.body;
    const dateTimestamp = `${date} 00:00:00`;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select timestampdiff(hour, ? , visit_timestamp) as hour, count(*) as number 
      from visits where visits.visit_date = ? 
      group by timestampdiff(hour, ?, visit_timestamp) 
      order by timestampdiff(hour, ?, visit_timestamp) asc`,
      [dateTimestamp, date, dateTimestamp, dateTimestamp]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the visits for each day of a period of days
app.post(
  "/visits-cases-stats/fetch-visits-for-specific-period-grouped-by-day",
  isAdminAuthorized,
  async (req, res) => {
    const { startDate, endDate } = req.body;

    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number, visits.visit_date 
      from visits where visit_date >= ? and visit_date <= ? 
      group by visits.visit_date`,
      [startDate, endDate]
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult,
      errorMessage: "",
    });
  }
);

// Returns the total number of visits
app.post(
  "/visits-cases-stats/fetch-visits-number",
  isAdminAuthorized,
  async (req, res) => {
    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number
      from visits`,
      []
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult[0],
      errorMessage: "",
    });
  }
);

// Returns the number of cases
app.post(
  "/visits-cases-stats/fetch-user-cases-number",
  isAdminAuthorized,
  async (req, res) => {
    const con = connection.getConnection();

    const [selectResult] = await con.query(
      `select count(*) as number 
      from cases`,
      []
    );

    return res.send({
      hasAccessPermission: true,
      data: selectResult[0],
      errorMessage: "",
    });
  }
);

const start = async () => {
  const interval = setInterval(async () => {
    try {
      await connection.connnectToMySqlDb();

      console.log("Connected to visits-cases-stats service database.");

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
        "visits-cases-stats-visit-queue-group"
      ).listen("visit:created");

      new NatsCaseListener(
        natsWrapper.getClient(),
        "visits-cases-stats-case-queue-group"
      ).listen("case:created");

      new NatsPoiListener(
        natsWrapper.getClient(),
        "visits-cases-stats-poi-queue-group"
      ).listen("poi:created");

      app.listen(3000, () => {
        console.log("Listening on port 3000. ");
      });

      clearInterval(interval);
    } catch (e) {}
  }, 5000);
};

start();
