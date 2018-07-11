import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
export class MainController {
  /*@ngInject*/
  constructor($http, $timeout, $state, $stateParams, $window, $scope, socket, appConfig, Auth, calendarConfig, moment, Message) {
    this.w = $window;
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    //this.$timeout = $timeout;
    this.socket = socket;
    this.Message = Message;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.isAdmin = Auth.isAdminSync;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.MSG = '';
    this.DeviseSite = appConfig.DeviseSite || 'Eco-système ';
    this.TitreSite = appConfig.TitreSite || 'Libre Communaute';
    this.onlineServices = [];
    this.OauthActif = appConfig.OauthActif || false;
    this.sso = this.$state.current.name == 'discoursesso';
  }


  $onDestroy() {
    socket.unsyncUpdates('thing');
  };

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.TitreSite = this.myconfig.TitreSite;
        this.DeviseSite = this.myconfig.DeviseSite;
        this.OauthActif = this.myconfig.OauthActif;
        this.onlineServices = this.myconfig.onlineServices;
        //console.log(this.myconfig);
      });

    if (this.$state.current.name == 'disc  this.Auth = Auth;oursesso') {
      this.MSG = ' ***  REDIRECTION Forum Discourse en cours ..';
      this.Auth.getCurrentUser()
        .then(u => {
          if (u._id) {
            var sso = this.$stateParams.sso;
            var sig = this.$stateParams.sig;
            this.Auth.discourseSso(u._id, {
                sso,
                sig
              })
              .then(rep => {
                this.w.location.href = rep.url;
              });
          }
        });
    }
    this.MSG = '';
  }
  addThing() {
    if (this.newThing) {
      this.$http.post('/api/things', {
        info: this.newThing.info,
        name: this.newThing.name
      });

      this.newThing.info = '';
      this.newThing.name = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete('/api/things/' + thing._id);
  }

  Formlogin(form) {
    this.submitted = true;
    this.msg = '';


    if (form.$valid) {
      this.Auth.login({
          uid: this.user.uid,
          password: this.user.password
        })
        .then(u => {
          if (this.$state.current.name == 'discoursesso') {
            this.MSG = ' ***  REDIRECTION en cours ..';
            var sso = this.$stateParams.sso;
            var sig = this.$stateParams.sig;
            this.Auth.discourseSso(u._id, {
                sso,
                sig
              })
              .then(rep => {
                this.w.location.href = rep.url;
              });
          } else {
            //Logged in , redirect to home
            this.$state.go('main');
          }
        })
        .catch(err => {
          console.log(err);
          this.msg = err.message;
          this.$state.go('main');
        });
    }
  }
}

export default angular.module('E-userApp.main', [uiRouter, 'angularUtils.directives.dirPagination'])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;