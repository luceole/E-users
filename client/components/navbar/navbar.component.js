'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [
    {
      title: 'Mes services',
      state: 'main'
    },
    {
      title: 'Mes groupes',
      state: 'collaborate'
    }];
  isCollapsed = true;
  constructor(Auth) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.isAdmin_grp = Auth.isAdmin_grpSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.isActif = Auth.isActif;
    this.status = {
      isopen: false,
      isopen0: false
    };
  }
}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
