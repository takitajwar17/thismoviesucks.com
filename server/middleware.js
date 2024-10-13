// Logging middleware
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next(); // Proceed to the next middleware or route
  };
  
  // Authentication middleware: Check if user name is provided
  const checkLogin = (req, res, next) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    next(); // Proceed to the next middleware or route
  };
  
  module.exports = { requestLogger, checkLogin };
  