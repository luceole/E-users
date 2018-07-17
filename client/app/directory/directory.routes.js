'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('directory', {
      url: '/directory/:grpID',
      template: '<directory></directory>',
      authenticate: true
    });
}
