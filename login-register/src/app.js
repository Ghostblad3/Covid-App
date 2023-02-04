const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const { User } = require("./models/user");
const { logRequestType } = require("./middlewares/log-request-type");
const { isClientAuthorized } = require("./middlewares/is-client-authorized");
const { isAuthenticated } = require("./middlewares/is-authenticated");

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

// Verifies the cookie
app.post("/login-register/verify-cookie", isAuthenticated, async (req, res) => {
  return res.send({
    hasAccessPermission: true,
    data: null,
    errorMessage: "",
  });
});

// Handles the login
app.post("/login-register/login", async (req, res, next) => {
  const { username, password } = req.body;

  const result = await User.findOne({
    username: username,
  });

  if (result) {
    const validate = await bcrypt.compare(password, result.password);

    if (validate) {
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.user = {
          userId: result._id,
          username: result.username,
          isAdmin: result.is_admin,
        };

        req.session.save((err) => {
          if (err) return next(err);

          return res.send({
            hasAccessPermission: true,
            data: { isAdmin: result.is_admin },
            errorMessage: "",
          });
        });
      });
    } else {
      res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "Incorrect username or password",
      });
    }
  } else {
    return res.send({
      hasAccessPermission: true,
      data: null,
      errorMessage: "Incorrect username or password",
    });
  }
});

// Handles the register
app.post("/login-register/register", async (req, res) => {
  const { username, password, email } = req.body;

  const result = await User.find({
    $or: [{ username: username }, { email: email }],
  });

  if (result.length === 0) {
    var hashedPassword = await bcrypt.hash(password, 10);

    const user = User({
      username: username,
      password: hashedPassword,
      email: email,
      is_admin: 0,
    });

    await user.save();

    return res.send({
      hasAccessPermission: true,
      data: null,
      errorMessage: "",
    });
  } else {
    const usernameResult = await User.findOne({
      username: username,
    });

    const emailResult = await User.findOne({ email: email });

    if (usernameResult && emailResult) {
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "Username and email are already taken.",
      });
    } else if (usernameResult) {
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "Username is already taken.",
      });
    } else {
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "Email is already taken.",
      });
    }
  }
});

// Returns the username of a user
app.post(
  "/login-register/request-credentials",
  isClientAuthorized,
  async (req, res) => {
    const { username } = req.session.user;
    res.send({
      hasAccessPermission: true,
      data: { username },
      errorMessage: "",
    });
  }
);

// Handles the username and password change
app.post(
  "/login-register/change",
  isClientAuthorized,
  async (req, res, next) => {
    const { userId, username } = req.session.user;

    const currentUserCredentials = await User.findOne({
      _id: userId,
      username: username,
    });

    if (currentUserCredentials) {
      const { newUsername, newPassword } = req.body;

      let isAlreadyUsed = false;

      if (username !== newUsername) {
        const user = await User.findOne({
          username: newUsername,
        });

        if (user) {
          isAlreadyUsed = true;
        }
      }

      if (!isAlreadyUsed) {
        var hashedPassword = await bcrypt.hash(newPassword, 10);

        currentUserCredentials.username = newUsername;
        currentUserCredentials.password = hashedPassword;

        await currentUserCredentials.save();

        req.session.regenerate((err) => {
          if (err) next(err);

          req.session.user = {
            userId: currentUserCredentials._id,
            username: currentUserCredentials.username,
            password: currentUserCredentials.password,
            isAdmin: currentUserCredentials.is_admin,
          };

          req.session.save((err) => {
            if (err) return next(err);

            return res.send({
              hasAccessPermission: true,
              data: null,
              errorMessage: "",
            });
          });
        });
      } else {
        return res.send({
          hasAccessPermission: true,
          data: null,
          errorMessage: "Username is already taken.",
        });
      }
    } else {
      // User not found
      return res.send({
        hasAccessPermission: true,
        data: null,
        errorMessage: "User not found.",
      });
    }
  }
);

app.post("/login-register/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.send({
    hasAccessPermission: true,
    data: null,
    errorMessage: "",
  });
});

const connectAsync = async () => {
  try {
    await mongoose.connect("mongodb://mongo-users-db-srv:27017/users");
    console.log("Connected to login-register service database.");
  } catch (e) {
    setTimeout(async () => await connectAsync(), 5000);
  }
};

const start = async () => {
  app.listen(3000, () => {
    console.log("Listening on port 3000.");
  });

  await connectAsync();
};

start();
