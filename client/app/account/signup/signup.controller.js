'use strict';
import angular from 'angular';
export default class SignupController {
  /*@ngInject*/
  constructor(Auth, Message, $state) {
    this.Auth = Auth;
    this.Message = Message;
    this.$state = $state;
  }

  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.TitreSite = this.myconfig.TitreSite;
        this.DeviseSite = this.myconfig.DeviseSite;
        this.OauthActif = this.myconfig.OauthActif;
      });
  }
  myInit(form, field) {
    form[field].$setValidity('mongoose', true);
    if(!this.user.uid) this.user.uid = this.user.email;
  }

  myReset(form, field) {
    form[field].$setValidity('mongoose', true);
  }

  register(form) {
    this.submitted = true;
    if(form.$valid) {
      return this.Auth.createUser({
        uid: this.user.uid,
        surname: this.user.surname,
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        structure: this.user.structure,
        isactif: false
      })
        .then(() => {
          // Account created, redirect to home
          this.$state.go('main');
        })
        .catch(err => {
          err = err.data;
          console.log(err.errors);
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }
}
