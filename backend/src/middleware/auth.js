const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Token aus Authorization Header oder x-auth-token
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'Kein Token - Authentifizierung erforderlich' });
    }

    // JWT verifizieren
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-2025';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token abgelaufen' });
    }
    res.status(401).json({ error: 'Ungültiger Token' });
  }
};

module.exports = auth;
