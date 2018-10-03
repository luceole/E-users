'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
      title: 'Mes services',
      state: 'main'
    },
    {
      title: 'Mes groupes',
      state: 'collaborate'
    }
  ];
  isCollapsed = true;
  constructor(Auth, Message) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.isAdmin_grp = Auth.isAdmin_grpSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.isActif = Auth.isActif;
    this.Message = Message
    this.ForceSSO = false;
    this.status = {
      isopen: false,
      isopen0: false
    };
  }

  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.ForceSSO = this.myconfig.ForceSSO;
      })
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;