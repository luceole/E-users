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
    this.users = User.query();
    this.$uibModalInstance = $uibModalInstance;
    this.groupe = new Group(gp);
    this.participantsOld = [];
    this.supParticipants = [];
    this.addParticipants = [];
    this.adminbyOld = [];
    this.SuppCandidat = [];
    this.addCandidat = [];
    var w = [];
    angular.forEach(this.groupe.participants, function(o) {
      w.push(o);
    });
    this.participantsOld = w.slice();
    //  console.log(this.participantsOld);
    var w = [];
    angular.forEach(this.groupe.adminby, function(o) {
      w.push(o);
    });
    this.adminbyOld = w.slice();
    w = [];
    angular.forEach(this.groupe.demandes, function(o) {
      w.push(o);
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

    if (this.forms.tab1.$valid) {
      var Nadm = [];
      var SuppAdm = [];
      var Nparticipants = [];
      var SuppParticipants = [];
      angular.forEach(this.groupe.adminby, function(user) {
        if (Nadm.indexOf(user._id) === -1) Nadm.push(user._id);
      });
      angular.forEach(this.groupe.participants, (user) => {
        if (Nparticipants.indexOf(user._id) === -1) Nparticipants.push(user._id);
      });

      angular.forEach(this.participantsOld, (u) => {
        if (this.groupe.participants.findIndex(x => x._id === u._id) == -1) SuppParticipants.push(u);
      });
      angular.forEach(this.adminbyOld, (u) => {
        if (this.groupe.adminby.findIndex(x => x._id === u._id) == -1) SuppAdm.push(u);
      });

      angular.forEach(this.addCandidat, u => {
        Nparticipants.push(u);
      });

      this.Auth.updateGroup(this.groupe._id, {
          info: this.groupe.info,
          type: this.groupe.type,
          owner: this.person.selected._id,
          demandes: this.groupe.demandes,
          participants: Nparticipants,
          adminby: Nadm
        })
        .then(r => {
          if (SuppAdm.length) {
            this.Auth.userAdmingroup(this.groupe._id, SuppAdm).then(
              //console.log('Maj adminby ' + SuppAdm)
            );
          }
          if (this.SuppCandidat.length) {
            this.Auth.userSuppCandidat(this.groupe._id, this.SuppCandidat).then(
              // console.log('Maj candidatOf ')
            );
          }
          if (SuppParticipants.length) {
            this.Auth.userSupGroup(this.groupe._id, SuppParticipants).then(
              //console.log('Maj memberOf ')
            );
          }
          // This is made in pre update now
          // if(this.addCandidat.length) {
          //   this.Auth.userAddCandidat(this.groupe._id, this.addCandidat).then(
          //        console.log('Maj candidatOf ')
          //     );
          // }

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
    if (user == undefined) return;
    if (grpadm.findIndex(x => x._id === user._id) == -1) grpadm.push(user);
  }

  delAdm(user, grpadm) {
    if (user == undefined) return;
    grpadm.splice(grpadm.indexOf(user), 1);
  }
  delDemande(user, grpdem) {
    if (user == undefined) return;
    grpdem.splice(grpdem.indexOf(user), 1);
    this.SuppCandidat.push(user._id);
  }
  addDemande(user, grpdem) {
    if (user == undefined) return;
    grpdem.splice(grpdem.indexOf(user), 1);
    this.addCandidat.push(user._id);
  }
  addUser(user, grppar) {
    if (user == undefined) return;
    if (grppar.findIndex(x => x._id === user._id) == -1) grppar.push(user);
  }

  delUser(user, grppar) {
    grppar.splice(grppar.indexOf(user), 1);
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
          if (err.code == 11000) msg = ' Ce groupe existe dèja!';
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
  }).name;