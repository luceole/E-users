'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('adminpoll', {
      url: '/adminpoll',
      template: '<adminpoll></adminpoll>',
      authenticate: true
    });
}
