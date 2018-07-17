'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';
import ngMaterial from 'angular-material';
import mwlCalendar from 'angular-bootstrap-calendar';
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
import directory from './directory/directory.component';
import adminpoll from './adminpoll/adminpoll.component';
import poll from './poll/poll.component';
import groupes from './groupes/groupes.component';
import demandes from './demandes/demandes.component';
import users from './users/users.component';
import events from './events/events.component';
import collaborate from './collaborate/collaborate.component';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.scss';
import '../assets/dirPagination';
angular.module('E-userApp', [ngCookies, ngResource, ngSanitize, ngMaterial, mwlCalendar, 'btford.socket-io', ngValidationMatch, uiRouter,
  uiBootstrap, uiSelect, 'ckeditor',
  _Auth, account, groupes, collaborate, navbar, footer, main, constants, socket, util, demandes, users, events, poll, adminpoll, directory
])
.config(['calendarConfig', function(calendarConfig) {
  calendarConfig.dateFormatter = 'moment'; // use moment to format dates
  calendarConfig.dateFormats.hour = 'HH:mm';
}])
  .config(routeConfig)
  .filter('ouinon', function() {
    return function(input) {
      return input ? 'Oui' : 'Non';
    };
  })
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
