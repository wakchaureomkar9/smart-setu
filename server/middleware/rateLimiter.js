const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each user/IP to 10 upload requests per windowMs
    message: { message: 'Too many upload attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { uploadLimiter };
