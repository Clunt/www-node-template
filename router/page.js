const router = require('express').Router();
const auth = require('../middlewares/auth');

const pageController = require('../controllers/page');


router.get('/', auth.login, pageController.home);
router.get('/login', pageController.login);
router.get('/logout', pageController.logout);


module.exports = router;
