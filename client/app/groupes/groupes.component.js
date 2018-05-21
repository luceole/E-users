'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './groupes.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class ModalEditGroupComponent {
  constructor(Auth, User, Group, $uibModalInstance, gp) {
    'ngInject';
    this.Auth = Auth;
    this.listadmin = User.listadmin();
    this.listadmgrp = User.listadmgrp();
    this.$uibModalInstance = $uibModalInstance;
    this.groupe = new Group(gp);

    this.adminbyOld = [];
    this.supCandidat = [];
    this.addCandidat = [];
    var w = [];
    angular.forEach(this.groupe.adminby, function(o) {
      w.push(o._id);
    });
    this.adminbyOld = w.slice();
    w = [];
    angular.forEach(this.groupe.demenades, function(o) {
      w.push(o._id);
    });
    this.demandesOld = w.slice();
    this.person = {};
    this.person.selected = this.groupe.owner;
    this.admin = {};
    this.forms = {};

    this.typeoptions = [{
      id: 0,
      name: 'Ouvert'
    },
    {
      id: 5,
      name: 'Modéré'
    },
    {
      id: 10,
      name: 'Réservé'
    }
    ];
    //this.groupe.type = 0;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok(form) {
    this.submitted = true;

    if(this.forms.tab1.$valid) {
      console.log(this.supCandidat);
      var Nadm = [];
      var Supp = [];
      angular.forEach(this.groupe.adminby, function(user) {
        if(Nadm.indexOf(user._id) === -1) Nadm.push(user._id);
      });
      angular.forEach(this.adminbyOld, function(u) {
        if(Nadm.indexOf(u) === -1) Supp.push(u);
      });
      angular.forEach(this.addCandidat, u => {
        this.groupe.participants.push(u);
      });

      this.Auth.updateGroup(this.groupe._id, {
        info: this.groupe.info,
        type: this.groupe.type,
        owner: this.person.selected._id,
        demandes: this.groupe.demandes,
        participants: this.groupe.participants,
        adminby: Nadm
      })
        .then(r => {
          //console.log("Old "+this.adminbyOld)
          //console.log("new "+Nadm)
          //console.log("supp="+Supp)
          if(Supp.length) {
            this.Auth.userAdmingroup(this.groupe._id, Supp).then(
              // console.log('MAj adminby ')
            );
          }
          if(this.supCandidat.length) {
            this.Auth.userSupCandidat(this.groupe._id, this.supCandidat).then(
                 console.log('Maj candidatOf ')
              );
          }
          if(this.addCandidat.length) {
            this.Auth.userAddCandidat(this.groupe._id, this.addCandidat).then(
                 console.log('Maj candidatOf ')
              );
          }

          /*  Sgroupe.info = r.info;
  Sgroupe.type = r.type;
  Sgroupe.owner.uid = this.person.selected.uid;*/
          this.$uibModalInstance.close();
        })
        .catch(err => {
          err = err.data;
          alert(`Erreur de mise à jour: ${err}`);
          /* this.errors = {};

           // Update validity of form fields that match the mongoose errors
           angular.forEach(err.errors, function (error, field) {
             form[field].$setValidity('mongoose', false);
             this.errors[field] = error.message;
           });*/
        });
    }
  }

  addAdm(user, grpadm) {
    grpadm.push(user);
  }

  delAdm(user, grpadm) {
    grpadm.splice(grpadm.indexOf(user), 1);
  }
  delDemande(user, grpdem) {
    grpdem.splice(grpdem.indexOf(user), 1);
    this.supCandidat.push(user._id);
  }
  addDemande(user, grpdem) {
    console.log('add dem');
    grpdem.splice(grpdem.indexOf(user), 1);
    this.addCandidat.push(user._id);
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
      name: 'Ouvert'
    },
    {
      id: 5,
      name: 'Modéré'
    },
    {
      id: 10,
      name: 'Réservé'
    }
    ];
    this.groupe.type = 0;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok(form) {
    this.submitted = true;
    if(form.$valid) {
      if(this.admin.selected == undefined) this.admin.selected = this.person.selected;
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
        .then(r => {
          //console.log(r)
          //console.log("Add is OK " + r.name + " " + r.info);
          r.owner = {
            _id: this.person.selected._id,
            uid: this.person.selected.uid
          };
          this.$uibModalInstance.close(r);
        })
        .catch(err => {
          var msg = ' ';
          err = err.data;
          if(err.code == 11000) msg = ' Ce groupe existe dèja!';
          else msg = err.errmsg;
          alert(`Erreur en création:${msg}`);
          console.log(err);
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }
}

export class GroupesComponent {
  /*@ngInject*/
  constructor(User, Group, $uibModal) {
    'ngInject';
    this.Group = Group;
    this.groups = Group.query();
    this.$uibModal = $uibModal;
  }

  add() {
    var ModalInstance = this.$uibModal.open({
      controller: ModalAddGroupComponent,
      controllerAs: 'ModalAddAdminGroupCtrl',
      templateUrl: 'modalAddAdminGroup.html',
    });

    ModalInstance.result.then(s => {
      //console.log(s)
      this.groups = this.Group.query();
    }, () => {
      this.groups = this.Group.query();
      //console.log('Modal dismissed at: ' + new Date());
    });
  }

  edit(gp) {
    var ModalInstance = this.$uibModal.open({
      controller: ModalEditGroupComponent,
      controllerAs: 'ModalEditAdminGroupCtrl',
      templateUrl: 'modalEditAdminGroup.html',
      backdrop: 'static',
      resolve: {
        gp() {
          return gp;
        }
      }
    });
    ModalInstance.result.then(s => {
      //console.log(s)
      this.groups = this.Group.query();
    }, () => {
      this.groups = this.Group.query();
      //console.log('Modal dismissed at: ' + new Date());
    });
  }

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
