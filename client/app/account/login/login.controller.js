'use strict';

export default class LoginController {
  /*@ngInject*/
  constructor(Auth, appConfig, Message, $state) {
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
        this.Infos = this.myconfig.Infos;
      });
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
