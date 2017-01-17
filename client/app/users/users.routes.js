'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('users', {
      url: '/users',
      template: '<users></users>',

    });
}
