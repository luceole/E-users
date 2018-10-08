'use strict';
import express from 'express';
import config from '../config/environment';
import User from '../api/user/user.model';

// Passport Configuration
require('./local/passport').setup(User, config);
// require('./google/passport').setup(User, config);
require('./openid/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);
// router.use('/google', require('./google').default);
router.use('/openid', require('./openid').default);
//router.use('/mytoken', require('./mytoken').default);

// logout default catch-all
router.use('/:provider/logout', function(req, res) {
  return res.status(204).end();
});

export default router;