'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './directory.routes';

export class DirectoryComponent {
  /*@ngInject*/
  constructor(Auth, Group, User, $stateParams) {
    'ngInject';
    this.Auth = Auth;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
    this.$stateParams = $stateParams;
    this.myfilterlist = [];
    this.groupe = Group.get({
      id: $stateParams.grpID
    });
    this.isAdminOf = 0;
    this.getCurrentUser().then(u => {
      var r = u.adminOf.filter(o => o._id === $stateParams.grpID);
      this.isAdminOf = r.length
      if ((this.groupe.name == "Tous") && !this.isAdminOf) {
        alert("Opération Interdite")
        return
      }
    })

  }

  mailtoAdr() {
    if ((this.groupe.name == "Tous") && !this.isAdminOf) {
      alert("Opération Interdite")
      return
    }
    var liste = '';
    this.myfilterlist.forEach(function(o, index) {
      liste = liste + o.email + ', ';
    });
    window.location.href = 'mailto:' + liste;
  }
  copyAdr() {
    if ((this.groupe.name == "Tous") && !this.isAdminOf) {
      alert("Opération Interdite")
      return
    }
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