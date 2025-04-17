const roleMiddleware = (roles) => (req, res, next) => {
  // Convert single role to array if string is passed
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  console.log('User role:', req.user.role);
  console.log('Required roles:', allowedRoles);
  
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'User role not found' });
  }
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  
  next();
};

module.exports = roleMiddleware;