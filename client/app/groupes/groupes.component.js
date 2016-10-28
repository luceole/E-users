'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './groupes.routes';

export class GroupesComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('newfullstackApp.groupes', [uiRouter])
  .config(routes)
  .component('groupes', {
    template: require('./groupes.html'),
    controller: GroupesComponent,
    controllerAs: 'groupesCtrl'
  })
  .name;
