const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error as a simple message so frontend toast works
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }),
  handleValidationErrors
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateScheme = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('required_docs').isArray().withMessage('Required documents must be an array'),
  handleValidationErrors
];

const validateApplication = [
  body('scheme_id').notEmpty().withMessage('Scheme ID is required').isInt().withMessage('Invalid Scheme ID'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateScheme,
  validateApplication
};
