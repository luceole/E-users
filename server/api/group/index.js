'use strict';

var express = require('express');
var controller = require('./group.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.hasRole('admin'),controller.index);
router.get('/byowner', auth.isAuthenticated(), controller.byowner);
router.get('/isopen',  auth.isAuthenticated(), controller.isopen);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin_grp'), controller.patch);
router.delete('/:id',auth.hasRole('admin_grp'), controller.destroy);



module.exports = router;
