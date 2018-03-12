'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './poll.routes';

export class PollComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('eUsersApp.poll', [uiRouter])
  .config(routes)
  .component('poll', {
    template: require('./poll.html'),
    controller: PollComponent,
    controllerAs: 'pollCtrl'
  })
  .name;
