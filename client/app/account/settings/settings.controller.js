'use strict';

export default class SettingsController {

  /*@ngInject*/
  constructor(Auth,Group) {
    this.Auth = Auth;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
  //  this.errors = {};
    this.editMessage = '';
    this.groups = Group.query();
  }

  edit(form) {
    this.submitted = true;
    this.editMessage = '';
    if (form.$valid) {
      return this.Auth.updateMe(this.user._id, {
          name: this.user.name,
          surname: this.user.surname,
          structure: this.user.structure,
          email: this.user.email
        })
        .then(() => {
          this.editMessage = 'Mise à jour prise en compte';
        })
        .catch((err) => {
          err = err.data;
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            form[field].$setDirty();
            this.errors[field] = error.message;
          });
        });
    }
  };

  myInit(form, field) {
    console.log(form)
    form[field].$setValidity('mongoose', true);
  }

  changePassword(form) {
    this.submitted = true;
    //  console.log(this.user.oldPassword, this.user.newPassword)
    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Modification du mot de passe effectuée.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Mot de passe incorrect';
          this.message = '';
        });
    }
  }
}
