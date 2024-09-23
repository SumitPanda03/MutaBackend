const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decodedToken.userId, email:decodedToken.email };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};