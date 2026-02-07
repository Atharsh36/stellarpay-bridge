const jwt = require('jsonwebtoken');
const authRoutes = require('../routes/auth');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const users = authRoutes.getUsers();
    console.log('Available users:', users.length);
    
    const user = users.find(u => u.id === decoded.userId);
    console.log('Found user:', user ? user.email : 'Not found');
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token - user not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token: ' + error.message });
  }
};

module.exports = { authenticateToken };