'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './collaborate.routes';

export class NoteComponent {
  /*@ngInject*/
  constructor(Group, Auth, $uibModalInstance, grp) {
    //'ngInject';
    this.groupe = grp;
    this.Auth = Auth;
    this.options = {
      language: 'fr',
      // uiColor: "#66AB16",
      //readOnly: true,
      width: '98%',
      height: 400
    };
    this.isAdmin = Auth.isAdmin;
    this.isAdmin_grp = Auth.isAdmin_grp;
    console.log( this.Auth.getCurrentUserSync().adminOf )
    this.isAdminOf = this.Auth.getCurrentUserSync().adminOf.find(o => o === this.groupe._id);
    //this.isAdminOf = this.Auth.getCurrentUserSync().adminOf == this.groupe._id;
    this.$uibModalInstance = $uibModalInstance;
    this.msg = "";
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };

  save() {
    this.Auth.updateGroup(this.groupe._id, this.groupe)
      .then((r) => {
        this.$uibModalInstance.close();
      })
      .catch((err) => {
        console.log(err)
        this.msg = "Erreur :" + err.statusText;
      });
  };
}


export class CollaborateComponent {
  /*@ngInject*/
  constructor($http, $scope, $state, $stateParams, $cookies, $window, socket, appConfig, $uibModal, Auth, Group) {
    this.$http = $http;
    this.$cookies = $cookies;
    this.$window = $window;
    this.socket = socket;
    this.Auth = Auth;
    this.Group = Group;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.isActif = Auth.isActif;
    this.$uibModal = $uibModal;
    this.OauthActif = true;
    this.DeviseSite = appConfig.DeviseSite || "Eco-système Libre";
    this.TitreSite = appConfig.TitreSite || "Libre Communaute";
    /* $scope.$on('$destroy', function () {
       socket.unsyncUpdates('thing');
     });*/
  }

  openNote(grp) {
    this.$uibModal.open({
      templateUrl: 'modalNote.html',
      controller: NoteComponent,
      controllerAs: "NC",
      resolve: {
        grp: function () {
          return grp;
        }
      }
    });
  }

  openPad(grp) {
    console.log(this.getCurrentUser());
    var auhorID = this.getCurrentUser().authorPadID;
    this.$http.post('/api/pads', {
      authorID: auhorID,
      groupID: grp.groupPadID
    }).success((data) => {
      if (data) {
        console.log(data)
        this.$cookies.put('sessionID', data.sessionID);
        this.$window.open('//localhost:9001/p/' + grp.groupPadID + "$" + grp.name + "?userName=" + this.getCurrentUser().name);
      } else alert("Pad  non trouvé ou vous n'êtes pas autorisé");
    }).error(function (err) {
      console.log("err :" + err)
      alert("Serveur Pad  non actif");
    });
  };
}


export default angular.module('eUsersApp.collaborate', [uiRouter])
  .config(routes)
  .component('collaborate', {
    template: require('./collaborate.html'),
    controller: CollaborateComponent,
    controllerAs: 'collaborateCtrl'
  })
  .name;
