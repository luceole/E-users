'use strict';

export default class LoginController {

  /*@ngInject*/
  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
  }

  login(form) {
    this.submitted = true;
    this.msg="";
     console.log(form.$valid);

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
