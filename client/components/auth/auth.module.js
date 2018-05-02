'use strict';

import angular from 'angular';
import constants from '../../app/app.constants';
import util from '../util/util.module';
import ngCookies from 'angular-cookies';
import {
  authInterceptor
}
  from './interceptor.service';
import {
  routerDecorator
} from './router.decorator';
import {
  AuthService
} from './auth.service';
import {
  UserResource
} from './user.service';
import {
  DemandeResource
} from './demande.service';
import {
  GroupResource
} from './group.service';
import {
  PollResource
} from './poll.service';
import {
  MessageResource
} from './message.service';

import uiRouter from 'angular-ui-router';

function addInterceptor($httpProvider) {
  'ngInject';
  $httpProvider.interceptors.push('authInterceptor');
}

export default angular.module('E-userApp.auth', [constants, util, ngCookies, uiRouter])
  .factory('authInterceptor', authInterceptor)
  .run(routerDecorator)
  .factory('Auth', AuthService)
  .factory('User', UserResource)
  .factory('Group', GroupResource)
  .factory('Demande', DemandeResource)
  .factory('Poll', PollResource)
  .factory('Message', MessageResource)
  .config(['$httpProvider', addInterceptor])
  .name;
