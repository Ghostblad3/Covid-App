const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.send({
      hasAccessPermission: false,
      data: null,
      errorMessage: "",
    });
  }
};

module.exports = { isAuthenticated };
