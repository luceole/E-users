'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './directory.routes';

export class DirectoryComponent {
  /*@ngInject*/
  constructor(Auth, Group, User, $stateParams) {
    'ngInject';
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
    this.$stateParams = $stateParams;
    this.groupe = [];
    this.myfilterlist = [];
    this.groupe = Group.get({id: $stateParams.grpID});
  }

  mailtoAdr() {
    var liste = '';
    this.myfilterlist.forEach(function(o, index) {
      liste = liste + o.email + ', ';
    });
    window.location.href = 'mailto:' + liste;
  }
  copyAdr() {
    var liste = '';
    this.myfilterlist.forEach(function(o, index) {
      liste = liste + o.email + ', ';
    });
    alert('Copié! Ctrl-V pour coller');

    const el = document.createElement('textarea');
    el.value = liste;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

export default angular.module('eUsersApp.directory', [uiRouter])
  .config(routes)
  .component('directory', {
    template: require('./directory.html'),
    controller: DirectoryComponent,
    controllerAs: 'directoryCtrl'
  })
  .name;
