'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('collaborate', {
      url: '/collaborate',
      template: '<collaborate></collaborate>',
      authenticate: true
    });
}
