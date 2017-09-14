'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './groupes.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class ModalEditGroupComponent {
  constructor(Auth, User, Group, $uibModalInstance,gp) {
    'ngInject'
    this.Auth = Auth;
    this.listadmin = User.listadmin();
    this.listadmgrp = User.listadmgrp();
    this.$uibModalInstance = $uibModalInstance;
    this.groupe = new Group(gp);
    this.person = {};
    this.person.selected = this.groupe.owner;
    this.admin = {};
    this.forms = {};
    this.typeoptions = [{
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
    //this.groupe.type = 0;

  };

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };
  ok (form) {
    this.submitted = true;
    console.log(this.forms.tab1.$valid)
    if (this.forms.tab1.$valid) {
      var Nadm = [];
      angular.forEach(this.groupe.adminby, function (user) {
        Nadm.push(user._id)
      });
      this.Auth.updateGroup(this.groupe._id, {
          info: this.groupe.info,
          type: this.groupe.type,
          owner: this.person.selected._id,
          adminby: Nadm
        })
        .then(function (r) {
          Sgroupe.info = r.info;
          Sgroupe.type = r.type;
          Sgroupe.owner.uid = this.person.selected.uid;
          $modalInstance.close();
        })
        .catch(function (err) {
          err = err.data;
          $window.alert("Erreur de mise à jour: " + err);
          this.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function (error, field) {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  };

  addAdm(user, grpadm) {
    grpadm.push(user)
  }

  delAdm (user, grpadm) {
    grpadm.splice(grpadm.indexOf(user), 1);
  }

} //FIN CLASS ModalEditAdminGroupCtrl

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
    this.typeoptions = [{
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


  ok(form) {
    this.submitted = true
    if (form.$valid) {
      if (this.admin.selected == undefined) this.admin.selected = this.person.selected;
      this.Auth.createGroup({
          name: this.groupe.name,
          info: this.groupe.info,
          type: this.groupe.type,
          owner: this.person.selected._id,
          adminby: {
            _id: this.admin.selected._id,
            uid: this.admin.selected._uid
          }
        })
        .then((r) => {
          console.log(r)
          console.log("Add is OK " + r.name + " " + r.info);
          r.owner = {
            _id: this.person.selected._id,
            uid: this.person.selected.uid
          };
          this.$uibModalInstance.close(r);
        })
        .catch((err) => {
          err = err.data
          alert("Erreur en création");
          console.log(err.errors);
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
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
  }

  add() {
    var ModalInstance = this.$uibModal.open({
      controller: ModalAddGroupComponent,
      controllerAs: "ModalAddAdminGroupCtrl",
      templateUrl: 'modalAddAdminGroup.html',
    });

    ModalInstance.result.then((s) => {
      console.log(s)
      this.groups = this.Group.query();
    }, () => {
      this.groups = this.Group.query()
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  edit(gp) {

    var ModalInstance = this.$uibModal.open({
      controller: ModalEditGroupComponent,
      controllerAs: "ModalEditAdminGroupCtrl",
      templateUrl: 'modalEditAdminGroup.html',
      backdrop: 'static',
      resolve: {
        gp: function() {
          return gp
        }
      }
    });
    ModalInstance.result.then((s) => {
      console.log(s)
      this.groups = this.Group.query();
    }, () => {
      this.groups = this.Group.query()
      console.log('Modal dismissed at: ' + new Date());
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
