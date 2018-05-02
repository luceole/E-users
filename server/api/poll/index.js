'use strict';

var express = require('express');
var controller = require('./poll.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', controller.index);
router.get('/mypolls', auth.isAuthenticated(), controller.mypolls);
router.get('/myadminpolls', auth.hasRole('admin_grp'), controller.myadminpolls);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin_grp'), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.upsert);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.hasRole('admin_grp'), controller.destroy);
router.put('/:id/vote', auth.isAuthenticated(), controller.vote);


module.exports = router;
