'use strict';

export default class LoginController {
  /*@ngInject*/
  constructor(Auth, appConfig, $state) {
    this.Auth = Auth;
    this.$state = $state;
    this.TitreSite = appConfig.TitreSite;
    this.DeviseSite = appConfig.DeviseSite;
    this.OauthActif = appConfig.OauthActif;
  }

  login(form) {
    this.submitted = true;
    this.msg = '';
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
        });
    }
  }
}
