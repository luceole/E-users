'use strict';
import angular from 'angular';
export default class LostpwdController {
  /*@ngInject*/
  constructor(Auth, $state, $stateParams) {
    this.Auth = Auth;
    this.$state = $state;
    this.newPassword = '';
    this.passcode = $stateParams.passcode;
    this.message = '';
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
