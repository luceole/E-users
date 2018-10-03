'use strict';

export default class LoginController {
  /*@ngInject*/
  constructor(Auth, appConfig, Message, $state, $window) {
    this.Auth = Auth;
    this.Message = Message;
    this.$state = $state;
    this.$window = $window
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
        this.ForceSSO = this.myconfig.ForceSSO;
        if (this.ForceSSO)
          this.$window.location.href = `/auth/openid`;
      });
  }
  login(form) {
    this.submitted = true;
    this.msg = '';
    if (form.$valid) {
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