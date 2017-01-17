'use strict';

import angular from 'angular';

export default angular.module('E-userApp.constants', [])
  .constant('appConfig', require('../../server/config/environment/shared'))
  .name;
