'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('events', {
      url: '/events',
      template: '<events></events>'
    });
}
