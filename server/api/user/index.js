'use strict';

import {
  Router
}
from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/validate/*', controller.validEmail);
router.put('/resetpwd/', controller.resetPassword);
router.get('/lostpwd/', controller.lostPassword);
//router.get('//*', controller.validEmail);
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id/update', auth.hasRole('admin'), controller.update);
router.get('/demandes', auth.hasRole('admin'), controller.demandes);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/discoursesso', auth.isAuthenticated(), controller.discourseSso);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id/updateme', auth.isAuthenticated(), controller.updateMe);

router.post('/', controller.create);


module.exports = router;
