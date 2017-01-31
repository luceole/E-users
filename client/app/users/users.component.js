'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './users.routes';
import modal from 'angular-ui-bootstrap/src/modal';

export class UsersModalComponent {
  constructor(User, $uibModalInstance, usr) {
    'ngInject';
    this.User = User;
    this.user = new User(usr);
    this.Save_user = usr;
    this.$uibModalInstance = $uibModalInstance;
  }
  ok() {
    //  console.log("OK 1 ");
    this.user.isdemande = false;
    this.User.update(this.user._id, this.user, () => {
        this.Save_user.structure = this.user.structure;
        this.Save_user.name = this.user.name;
        this.Save_user.surname = this.user.surname;
        this.Save_user.email = this.user.email;
        this.Save_user.structure = this.user.structure;
        this.Save_user.role = this.user.role;
        this.Save_user.isactif = this.user.isactif;
        this.$uibModalInstance.close('ok');
      },
      err => {
        alert("Adresse mail utiliséé avec un autre compte!");
        console.log(err.data)
      }

    );
    //this.$uibModalInstance.close('ok');  // Ferme san attendre le retour => Gestion des erreurs ???
  };
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };
} // UserModal

export class UsersComponent {
  /*@ngInject*/
  constructor(User, $uibModal) {
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
      if (!confirm("Déactivation d'un utilisateur avec role  ADMIN A: Etes vous sur ?")) {
        return;
      }
    }
    user.isactif = false;
    user.isdemande = false;
    this.User.update(user._id, user, () => {});
  };

  validmail(user) {
    user.mailValid = true;
    this.User.update(user._id, user, () => {});
  }

  invalidmail(user) {
    if (user.role === "admin") {
      if (!confirm("Utilsateur avec role  ADMIN : Etes vous sur ?")) {
        return;
      }
    }
    user.mailValid = false;
    this.User.update(user._id, user, () => {});
  }

  delete(user) {
    if (!confirm(" Efface l'utilisateur " + user.uid + " : Etes vous sur ?")) {
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
        usr: function() {
          return usr
        }
      }
    });

    ModalInstance.result.then(function() {
      console.log("ok2")
    }, function() {
      console.log('Modal dismissed at: ' + new Date());
    });
  }


} // Constructor

export default angular.module('E-userApp.users', [uiRouter, modal])
  .config(routes)
  .component('users', {
    template: require('./users.html'),
    controller: UsersComponent,
    controllerAs: 'usersCtrl'
  })
  .name;
