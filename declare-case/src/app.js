const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const differenceInHours = require("date-fns/differenceInHours");
const { UserCase } = require("./models/user-case");
const { logRequestType } = require("./middlewares/log-request-type");
const { isClientAuthorized } = require("./middlewares/is-client-authorized");
const { isAdminAuthorized } = require("./middlewares/is-admin-authorized");
const { NatsPublisher } = require("./nats/nats-publisher");
const { natsWrapper } = require("./nats/nats-wrapper");

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

// Adds a new coronavirus case
app.post("/cases/add-case", isClientAuthorized, async (req, res) => {
  const { userId } = req.session.user;
  const { date } = req.body;

  var result = await UserCase.findOne({ user_id: userId }).sort({
    case_date: "desc",
  });

  if (!result) {
    const userCase = new UserCase({ user_id: userId, case_date: date });

    await userCase.save();

    new NatsPublisher(natsWrapper.getClient()).publish("case:created", {
      id: userCase._id.toString("hex"),
      user_id: userCase.user_id,
      case_date: userCase.case_date,
    });

    return res.send({
      hasAccessPermission: true,
      data: null,
      errorMessage: "",
    });
  } else {
    const dateSplit = date.split("-");

    const declaredDate = new Date(
      parseInt(dateSplit[0]),
      parseInt(dateSplit[1]),
      parseInt(dateSplit[2]),
      0,
      0,
      0
    );

    const lastDeclaredDateSplit = result.case_date
      .toISOString()
      .split("T")[0]
      .split("-");

    const lastDeclaredDate = new Date(
      parseInt(lastDeclaredDateSplit[0]),
      parseInt(lastDeclaredDateSplit[1]),
      parseInt(lastDeclaredDateSplit[2]),
      0,
      0,
      0
    );

    const difference = differenceInHours(declaredDate, lastDeclaredDate) / 24;

    if (difference <= 0) {
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage:
          "Cannot declare a new case that is chronologically older or equal to your previous case.",
      });
    } else if (difference <= 14) {
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage:
          "Cannot declare a new case before 14 days pass from your last declared case.",
      });
    } else {
      const userCase = new UserCase({ user_id: userId, case_date: date });
      await userCase.save();

      new NatsPublisher(natsWrapper.getClient()).publish("case:created", {
        id: userCase._id.toString("hex"),
        user_id: userCase.user_id,
        case_date: userCase.case_date,
      });

      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "",
      });
    }
  }
});

// Returns the declared cases for a specific user
app.post("/cases/fetch-user-cases", isClientAuthorized, async (req, res) => {
  const { userId } = req.session.user;

  const userCases = await UserCase.find(
    { user_id: userId },
    { case_date: 1, _id: 0 }
  );

  return res.send({
    hasAccessPermission: true,
    data: userCases,
    errorMessage: "",
  });
});

// Returns the number of all declared cases
app.post(
  "/cases/fetch-user-cases-number",
  isAdminAuthorized,
  async (req, res) => {
    const number = await UserCase.count({});

    return res.send({
      hasAccessPermission: true,
      data: number,
      errorMessage: "",
    });
  }
);

const connectAsync = async () => {
  try {
    await mongoose.connect("mongodb://mongo-user-cases-db-srv/cases");
    console.log("Connected to declare-case service database.");
  } catch (e) {
    setTimeout(async () => await connectAsync(), 5000);
  }
};

const start = async () => {
  await connectAsync();

  const interval = setInterval(async () => {
    try {
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
    } catch (ex) {}
  }, 5000);
};

start();
