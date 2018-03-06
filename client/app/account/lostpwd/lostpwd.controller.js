'use strict';
import angular from 'angular';
export default class LostpwdController {
  /*@ngInject*/
  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
    this.email = '';
    this.message = ' ';
  }


  register(form) {
    this.submitted = true;
    if(form.$valid) {
      this.Auth.lostPassword(this.email)
        .then(() => {
          this.message = `Initialisation du mot de passe: courriel envoyé à ${this.email}`;
        })
        .catch(err => {
          console.log(err);
          this.message = 'ERREUR : Adresse non trouvée';
        });
    }
  }
}
