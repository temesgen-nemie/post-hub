const jwt = require("jsonwebtoken");

exports.identifier = (req, res, next) => {
  let token = req.headers.authorization || req.cookies["Authorization"];

  if (!token) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const userToken = token.includes(" ") ? token.split(" ")[1] : token;
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    req.user = jwtVerified;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
