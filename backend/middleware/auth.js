const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header or cookie
  let token = req.header('Authorization') || req.header('x-auth-token');

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token provided, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    req.userId = decoded.id || decoded.user?.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is invalid or expired' });
  }
};
