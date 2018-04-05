'use strict';
import angular from 'angular';
export default class LostpwdController {
  /*@ngInject*/
  constructor(Auth, Message, $state) {
    this.Auth = Auth;
    this.$state = $state;
    this.Message = Message;
    this.email = '';
    this.message = ' ';
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
