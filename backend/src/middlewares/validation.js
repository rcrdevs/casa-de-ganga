import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').isLength({ min: 3 }).trim().escape()
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}