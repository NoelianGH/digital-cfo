const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Middleware untuk memverifikasi token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
    return res.status(401).json({ success: false, error: 'Token not provided' });
  }

    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    req.user = decoded; // Menyimpan data user yang didekode dari token di request object
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };