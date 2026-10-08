const passport = require("passport");

const authenticateJwt = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authenticateJwt;
