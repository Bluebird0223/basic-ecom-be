const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Authentication
 */

// Register
/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      tags: [Auth]
 *      summary: Register a new user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - email
 *                          - password
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: John Doe
 *                          email:
 *                              type: string
 *                              example: john.doe@example.com
 *                          password:
 *                              type: string
 *                              example: password
 *      responses:
 *          201:
 *              description: User registered successfully
 *          400:
 *              description: Invalid input
 *          500:
 *              description: Server error
 */

// profile
/**
 * @swagger
 * /api/auth/profile:
 *  get:
 *      tags: [Auth]
 *      summary: Get user profile
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: User profile
 *          401:
 *              description: Unauthorized
 *          500:
 *              description: Server error
 */

