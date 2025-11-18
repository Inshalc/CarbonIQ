const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

const validateRegistration = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('last_name')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  handleValidationErrors
];

const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateActivity = [
  body('activity_name')
    .notEmpty()
    .trim()
    .withMessage('Activity name is required'),
  body('category_id')
    .isInt({ min: 1, max: 6 })
    .withMessage('Category ID must be between 1 and 6'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('unit')
    .notEmpty()
    .trim()
    .withMessage('Unit is required'),
  body('start_date')
    .isDate()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateActivity
};