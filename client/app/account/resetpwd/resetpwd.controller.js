'use strict';
import angular from 'angular';
export default class LostpwdController {
  /*@ngInject*/
  constructor(Auth, $state, Message, $stateParams) {
    this.Auth = Auth;
    this.$state = $state;
    this.Message = Message;
    this.newPassword = '';
    this.passcode = $stateParams.passcode;
    this.message = '';
  }

  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.TitreSite = this.myconfig.TitreSite;
        this.DeviseSite = this.myconfig.DeviseSite;
        this.OauthActif = this.myconfig.OauthActif;
      })
  }
  changeResetedPassword(form) {
    this.submitted = true;
    if(form.$valid) {
      return this.Auth.ResetPassword(this.passcode, this.newPassword)
        .then(() => {
          this.message = 'Modification du mot de passe OK';
          this.$state.go('main');
        })
        .catch(err => {
        //  console.log(err)
          this.message = 'ERREUR : passcode non trouvée';
        });
    }
  }
}
