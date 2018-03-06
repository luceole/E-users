'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('groupes', {
      url: '/groupes',
      template: '<groupes></groupes>',
      authenticate: 'admin'
    });
}
