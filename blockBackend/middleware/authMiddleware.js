const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const t = req.header('Authorization')?.split(' ')[1];
  if (!t) return res.status(401).send('No token');
  try { req.user = jwt.verify(t, process.env.JWT_SECRET); next(); }
  catch { res.status(401).send('Invalid token'); }
}