const router = require('express').Router();
const apiRouter = require('./api');
const pageRouter = require('./page');


router.use('/api', apiRouter);
router.use(pageRouter);


module.exports = router;
