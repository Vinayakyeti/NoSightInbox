const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nosightinbox-secret-key');
    
    req.user = decoded;
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Token verification failed.' 
    });
  }
};

module.exports = authMiddleware;
