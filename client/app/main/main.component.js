import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http, $scope, $state, socket,Auth) {
    this.$http = $http;
    this.socket = socket;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.Auth = Auth;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$state = $state

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete('/api/things/' + thing._id);
  }

Formlogin(form) {
  this.submitted = true;
  this.msg="";

  if(form.$valid) {
    this.Auth.login({
      uid: this.user.uid,
      password: this.user.password
    })
      .then(() => {
        // Logged in, redirect to home
        this.$state.go('main');
      })
      .catch(err => {
        console.log(err);
        this.msg = err.message;
        this.$state.go('main');
      });
  }
}
}

export default angular.module('fullrefApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
