import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  /*@ngInject*/
  constructor($http, $scope, $state, $stateParams, $window, socket, appConfig, Auth) {
    this.w = $window;
    this.$http = $http;
    this.socket = socket;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.Auth = Auth;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.MSG = '';
    this.DeviseSite = appConfig.DeviseSite || 'Eco-système ';
    this.TitreSite = appConfig.TitreSite || 'Libre Communaute';
    this.OauthActif = appConfig.OauthActif || false;
    this.sso = this.$state.current.name == 'discoursesso';

    //   $scope.$on('$destroy', function() {
    //     socket.unsyncUpdates('thing');
    //   });
  }

  $onInit() {
    // this.$http.get('/api/things')
    //   .then(response => {
    //     this.awesomeThings = response.data;
    //     this.socket.syncUpdates('thing', this.awesomeThings);
    //   });
    if(this.$state.current.name == 'discoursesso') {
      this.MSG = ' ***  REDIRECTION Forum Discourse en cours ..';
      this.Auth.getCurrentUser()
        .then(u => {
          if(u._id) {
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

  // addThing() {
  //   if (this.newThing) {
  //     this.$http.post('/api/things', {
  //       name: this.newThing
  //     });
  //     this.newThing = '';
  //   }
  // }
  //
  // deleteThing(thing) {
  //   this.$http.delete('/api/things/' + thing._id);
  // }

  Formlogin(form) {
    this.submitted = true;
    this.msg = '';


    if(form.$valid) {
      this.Auth.login({
        uid: this.user.uid,
        password: this.user.password
      })
        .then(u => {
          if(this.$state.current.name == 'discoursesso') {
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

export default angular.module('E-userApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
