const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('rate-limit').RateLimit;

module.exports = {
  helmet: helmet(),
  cors: cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  }),
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
};
