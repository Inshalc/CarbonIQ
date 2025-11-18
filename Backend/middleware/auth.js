// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Add user object to req.session for consistency
    req.session.user = {
      id: req.session.userId,
      username: req.session.username,
      first_name: req.session.firstName,
      last_name: req.session.lastName
    };
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

module.exports = {
  authenticate
};