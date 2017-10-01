'use strict';

export default class SettingsController {

  /*@ngInject*/
  constructor(Auth, Group) {
    this.Auth = Auth;
    this.Group = Group;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
    //  this.errors = {};
    this.editMessage = '';
    this.groups = Group.listopengroups(); // Groupe OPEN
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

  isMemberOf(groupe) {
    var grpId = groupe._id
    // var r = this.user.memberOf.filter(function (obj) {
    //   return obj._id == grpId;
    // });
    var r = this.user.memberOf.filter(o => o == grpId)
    //console.log("isMember " + grpId + " ?" + this.user.memberOf + " " + r[0])
    return r[0] ? 1 : null
  };

  addusergroup(groupe) {
    var grpId = groupe._id
  //  var groupeInfo = groupe.info;
    this.Auth.addUserGroup(grpId, (err, u) => {
      if (err) {
        alert("Erreur MAJ " + err);
        console.log(err)
      }
      this.user = this.Auth.getCurrentUserSync();
      this.groups = this.Group.listopengroups()
    });

  };

  delusergroup(groupe) {
    var grpId = groupe._id
    var groupeInfo = groupe.info
    this.Auth.delUserGroup(grpId, (err, u) => {
      if (err) {
        alert("Erreur MAJ " + err.data);
        console.log(err)
      }
      //      console.log(u)
      //      this.user=u;  // Pas utilisable ??  problème mongoose pull avec populate
      /*      console.log(this.user.memberOf);
            angular.forEach(this.user.memberOf, (o, i) => {
              console.log(o + "=?"+grpId)
              if (o== grpId) {
                  console.log(this.user.memberOf)
                this.user.memberOf.splice(i, 1);
                console.log(this.user.memberOf)
              }
            });
            */

      this.user = this.Auth.getCurrentUserSync();
      this.groups = this.Group.listopengroups();
    });

  };



}
