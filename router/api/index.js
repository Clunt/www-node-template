const router = require('express').Router();
const auth = require('../../middlewares/auth');

const authRouter = require('./auth');
const commonRouter = require('./common');


router.use('/auth', authRouter);
router.use('/common', auth.login, auth.api, commonRouter);

module.exports = router;
