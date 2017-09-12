'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './groupes.routes';
import modal from 'angular-ui-bootstrap/src/modal';


export class ModalAddGroupComponent {
  constructor(Group, $uibModalInstance) {
    'ngInject';
  this.$uibModalInstance = $uibModalInstance;
  this.groupe = new Group();
  this.person = {};
  this.admin = {};
  this.typeoptions = [
    {
      id: 0,
      name: "Ouvert"
   },
    {
      id: 5,
      name: "Modéré"
    },
    {
      id: 10,
      name: "Réservé"
    }
  ];

  this.groupe.type = 0;
  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };




}

export class GroupesComponent {
  /*@ngInject*/
  constructor(User, Group, $uibModal) {
  'ngInject';
  this.Group=Group;
  this.groups = Group.query();
  this.$uibModal = $uibModal;

  }

  add () {
   var ModalInstance = this.$uibModal.open({
    controller: ModalAddGroupComponent,
    controllerAs: "ModalAddAdminGroupCtrl",
    templateUrl: 'modalAddAdminGroup.html'

  });
};


} // End class GroupesComponent

export default angular.module('E-userApp.groupes', [uiRouter,modal])
  .config(routes)
  .component('groupes', {
    template: require('./groupes.html'),
    controller: GroupesComponent,
    controllerAs: 'groupesCtrl'
  })
  .name;
