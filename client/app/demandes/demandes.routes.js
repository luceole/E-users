'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('demandes', {
      url: '/demandes',
      template: '<demandes></demandes>',
      authenticate: 'admin'
    });
}
