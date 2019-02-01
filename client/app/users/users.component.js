'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './users.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class UsersModalComponent {
  constructor(User, Message, $uibModalInstance, socket, usr) {
    'ngInject';
    this.User = User;
    this.Message = Message;
    this.user = new User(usr);
    this.socket = socket;
    this.Save_user = usr;
    this.Structures = [];
    this.$uibModalInstance = $uibModalInstance;
    this.myfilterlist = [];
  }
  $onInit() {
    this.Message.get().$promise.then(result => {
      this.myconfig = result;
      // this.TitreSite = this.myconfig.TitreSite;
      // this.DeviseSite = this.myconfig.DeviseSite;
      // this.OauthActif = this.myconfig.OauthActif;
      this.Structures = this.myconfig.Structures;
    });
  }
  ok() {
    this.user.isdemande = false;
    this.User.update(this.user._id, this.user, () => {
      this.Save_user.structure = this.user.structure;
      this.Save_user.name = this.user.name;
      this.Save_user.surname = this.user.surname;
      this.Save_user.email = this.user.email;
      this.Save_user.structure = this.user.structure;
      this.Save_user.role = this.user.role;
      //this.Save.user.authorPadID = this.user.authorPadID;
      this.Save_user.isactif = this.user.isactif;

      this.$uibModalInstance.close('ok');
    }, err => {
      alert('Adresse mail utiliséé avec un autre compte!');
      console.log(err.data);
    });
  }
  initPadId() {
    //console.log(this.user.authorPadID);
    this.user.authorPadID = '';
    this.ok();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
} // UserModal

export class AddGroupComponent {
  /* @ngInject */
  constructor(User, Group, Auth, $uibModalInstance, selectedUsers) {
    this.Auth = Auth;
    this.$uibModalInstance = $uibModalInstance;
    this.selectedUsers = selectedUsers;
    this.groups = Group.query();
  }

  ok(grp) {
    //console.log(grp.participants.length);
    angular.forEach(this.selectedUsers, (u) => {
      if (grp.participants.findIndex(x => x._id === u._id) == -1)
        grp.participants.push(u);
    });
    //console.log(grp.participants.length);
    this.Auth.updateGroup(grp._id, {
      // info: this.groupe.info,
      // type: this.groupe.type,
      // owner: this.person.selected._id,
      // demandes: this.groupe.demandes,
      participants: grp.participants
    }).then(r => {
      this.$uibModalInstance.close();
    });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

//    PAGE Principale

export class UsersComponent {
  /* @ngInject */
  constructor(User, socket, $uibModal) {
    'ngInject';
    this.$uibModal = $uibModal;
    this.User = User;
    this.socket = socket;
    this.users = User.query();
    this.myfilterlist = [];
    this.propertyName = 'name';
    this.Reverse = false;
    // this.socket.syncUpdates('user', this.users);
    // this.$onDestroy = function() {
    //   console.log("destroy");
    //   socket.unsyncUpdates('user');
    // };
  }

  sortBy(propertyName) {
    this.Reverse = (this.propertyName === propertyName) ? !this.Reverse : false;
    this.propertyName = propertyName

  }
  active(user) {
    user.isactif = true;
    user.isdemande = false;
    this.User.update(user._id, user, () => {});
  }

  activeselected() {
    this.myfilterlist.forEach((user, index) => {
      user.isactif = true;
      user.isdemande = false;
      this.User.update(user._id, user, () => {});
    });
  }

  addgroupselected() {
    var filterlist = this.myfilterlist;
    if (filterlist.length == 0) return;
    var ModalInstance = this.$uibModal.open({
      templateUrl: 'modalAddGroup.html',
      controller: AddGroupComponent,
      controllerAs: 'modalAddGrouptCtrl',
      backdrop: 'static',
      resolve: {
        selectedUsers() {
          return filterlist;
        }
      }
    });

    ModalInstance.result.then(function() {}, function() {
      console.log(`Modal dismissed at: ${new Date()}`);
    });
  }
  validmailselected() {
    this.myfilterlist.forEach((user, index) => {
      user.mailValid = true;
      this.User.update(user._id, user, () => {});
    });
  }
  deactive(user) {
    if (user.role === 'admin') {
      if (!confirm('Déactivation d\'un utilisateur avec role  ADMIN: Etes vous sur ?')) {
        return;
      }
    }
    user.isactif = false;
    user.isdemande = false;
    this.User.update(user._id, user, () => {});
  }

  validmail(user) {
    user.mailValid = true;
    this.User.update(user._id, user, () => {});
  }

  invalidmail(user) {
    if (user.role === 'admin') {
      if (!confirm('Utilsateur avec role  ADMIN : Etes vous sur ?')) {
        return;
      }
    }
    user.mailValid = false;
    this.User.update(user._id, user, () => {});
  }

  delete(user) {
    if (!confirm(` Efface l'utilisateur ${user.uid} : Etes vous sur ?`)) {
      return;
    }
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }

  edit(usr) {
    var ModalInstance = this.$uibModal.open({
      templateUrl: 'modalEdit.html',
      controller: UsersModalComponent,
      controllerAs: 'ModalEditCtrl',
      backdrop: 'static',
      resolve: {
        usr() {
          return usr;
        }
      }
    });

    ModalInstance.result.then(function() {}, function() {
      console.log(`Modal dismissed at: ${new Date()}`);
    });
  }
} // Constructor

export default angular.module('E-userApp.users', [uiRouter, modal]).config(routes).component('users', {
  template: require('./users.html'),
  controller: UsersComponent,
  controllerAs: 'usersCtrl'
}).name;
