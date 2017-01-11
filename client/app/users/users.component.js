'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './users.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class UsersModalComponent {
  constructor(User,$uibModalInstance,usr ) {
    'ngInject';
    this.User = User;
    this.user=usr;
    this.$uibModalInstance = $uibModalInstance;
  }
  ok() {
     console.log("OK 1 ");
     this.user.isdemande = false;
     this.User.update(this.user._id, this.user, () => {});
     this.$uibModalInstance.close('ok');
   };
  cancel() {
     this.$uibModalInstance.dismiss('cancel');
   };
}  // UserModal

export class UsersComponent {
  /*@ngInject*/
  constructor(User,$uibModal) {
    'ngInject';
    this.$uibModal = $uibModal;
    this.User = User;
    this.users = User.query();
  }

active(user) {
     user.isactif = true;
     user.isdemande = false;
     this.User.update(user._id, user, () => {});
   };

deactive(user) {

     if (user.role === "admin") {
       if (!confirm("Déactivation ADMIN : Etes vous sur ?")) {
         return;
       }
     }
     user.isactif = false;
     user.isdemande = false;
     this.User.update(user._id, user, () => {});
   };

delete(user) {
     user.$remove();
     this.users.splice(this.users.indexOf(user), 1);
   }

edit(usr) {
         var ModalInstance = this.$uibModal.open({
           templateUrl: 'modalEdit.html',
           controller: UsersModalComponent,
           controllerAs: 'ModalEditCtrl',
           resolve: {
           usr : function() {
            return usr
          }}
         });

         ModalInstance.result.then(function () {
     console.log("ok2")
   }, function () {
     console.log('Modal dismissed at: ' + new Date());
   });
}


 } // Constructor

export default angular.module('newfullstackApp.users', [uiRouter,modal])
  .config(routes)
  .component('users', {
    template: require('./users.html'),
    controller: UsersComponent,
    controllerAs: 'usersCtrl'
  })
  .name;
