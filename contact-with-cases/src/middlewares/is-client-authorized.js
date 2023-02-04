const isClientAuthorized = (req, res, next) => {
  if (req.session.user && !req.session.user.isAdmin) {
    next();
  } else {
    return res.send({
      hasAccessPermission: false,
      data: null,
      errorMessage: "",
    });
  }
};

module.exports = { isClientAuthorized };
