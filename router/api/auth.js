const router = require('express').Router();

const authController = require('../../controllers/api/auth');


router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
