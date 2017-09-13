'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './groupes.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class ModalAddGroupComponent {
  constructor(Auth, User, Group, $uibModalInstance) {
    'ngInject';
    this.Auth = Auth;
    this.listadmin = User.listadmin();
    this.listadmgrp = User.listadmgrp();
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
  ]
    this.groupe.type = 0;



  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };

  ok(form) {
    this.submitted = true
    if (form.$valid) {
      if (this.admin.selected == undefined) this.admin.selected = this.person.selected;
      this.Auth.createGroup({
          name: this.groupe.name,
          info: this.groupe.info,
          type: this.groupe.type,
          owner: this.person.selected._id,
          adminby: this.admin.selected._id
        })
        .then((r) => {

          console.log("Add is OK " + r.name + " " + r.info);
          r.owner = {
            _id: this.person.selected._id,
            uid: this.person.selected.uid
          };
          this.$uibModalInstance.close('ok');
        })
        .catch((err) => {
          err = err.data
          alert("Erreur en création");
          console.log(err.errors);
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function (error, field) {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });

    }
  };


}

export class GroupesComponent {
  /*@ngInject*/
  constructor(User, Group, $uibModal, socket) {
    'ngInject';
    this.Group = Group;
    this.groups = Group.query();
    this.$uibModal = $uibModal;
    /* this.$on('$destroy', function () {
   socket.unsyncUpdates('groupe');
 });
    socket.syncUpdates('groupe', this.groups, function (event, item, object) {
      this.groups = Group.query();
      console.log(item);
    });*/
  }

  add() {
    var ModalInstance = this.$uibModal.open({
      controller: ModalAddGroupComponent,
      controllerAs: "ModalAddAdminGroupCtrl",
      templateUrl: 'modalAddAdminGroup.html',
    });
  };



  delete(grp) {
    grp.$remove();
    /*this.Group.remove({
      id: grp._id
    });*/
    this.groups.splice(this.groups.indexOf(grp), 1);
  }

} // End class GroupesComponent




export default angular.module('E-userApp.groupes', [uiRouter, modal])
  .config(routes)
  .component('groupes', {
    template: require('./groupes.html'),
    controller: GroupesComponent,
    controllerAs: 'groupesCtrl'
  })
  .name;