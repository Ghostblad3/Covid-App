const logRequestType = (req, res, next) => {
  console.log("Request: " + req.path);
  next();
};

module.exports = { logRequestType };
