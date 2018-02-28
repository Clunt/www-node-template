const router = require('express').Router();

const commonController = require('../../controllers/api/common');


router.get('/ip', commonController.ip);

module.exports = router;
