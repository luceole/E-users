'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';
import ngMaterial from 'angular-material';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import uiSelect from 'ui-select';
import ckeditor from 'angular1-ckeditor';
// import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';


import {
  routeConfig
}
  from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
//import admin from './admin';
import groupes from './groupes/groupes.component';
import demandes from './demandes/demandes.component';
import users from './users/users.component';
import collaborate from './collaborate/collaborate.component';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('E-userApp', [ngCookies, ngResource, ngSanitize, ngMaterial, 'btford.socket-io', ngValidationMatch, uiRouter,
  uiBootstrap, uiSelect, 'ckeditor',
  _Auth, account, groupes, collaborate, navbar, footer, main, constants, socket, util, demandes, users
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['E-userApp'], {
      strictDi: true
    });
  });
