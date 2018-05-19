'use strict';
export default class SettingsController {
  /*@ngInject*/
  constructor(Auth, Group, Message) {
    this.Auth = Auth;
    this.Group = Group;
    this.Message = Message;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
    //  this.errors = {};
    this.editMessage = '';
    this.groups = Group.listopengroups(); // Groupe OPEN
  }
  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.Structures = this.myconfig.Structures;
      });
  }
  edit(form) {
    this.submitted = true;
    this.editMessage = '';
    if(form.$valid) {
      return this.Auth.updateMe(this.user._id, {
        name: this.user.name,
        surname: this.user.surname,
        structure: this.user.structure,
        email: this.user.email
      })
        .then(() => {
          this.editMessage = 'Mise à jour prise en compte';
        })
        .catch(err => {
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
  }

  myInit(form, field) {
    form[field].$setValidity('mongoose', true);
  }

  changePassword(form) {
    this.submitted = true;
    //  console.log(this.user.oldPassword, this.user.newPassword)
    if(form.$valid) {
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
    var grpId = groupe._id;
    //this.user = this.Auth.getCurrentUserSync();
    var r = this.user.memberOf.filter(o => o._id == grpId);
    return r.length;
  }

  isCandidatOf(groupe) {
    var grpId = groupe._id;
    //this.user = this.Auth.getCurrentUserSync();
    // console.log(this.user.candidatOf);
    // console.log(grpId);
    var r = this.user.candidatOf.filter(o => o == grpId);
    return r.length;
  }

  addusergroup(groupe) {
    var grpId = groupe._id;
    if(groupe.type == 0)   //Ouvert
    {
      this.Auth.addUserGroup(grpId, (err, u) => {
        if(err) {
          alert(`Erreur MAJ ${err.data}`);
          console.log(err);
        }
      //console.log(u);
      // Force =>  Read User
        this.user = this.Auth.getCurrentUserSync();
        this.groups = this.Group.listopengroups();
      //console.log(  this.groups)
      });
    } else // Reservé
  {
      console.log('reservé');
      this.Auth.candidatUserGroup(grpId, (err, u) => {
        if(err) {
          alert(`Erreur MAJ ${err.data}`);
          console.log(err);
        }
      //console.log(u);
      // Force =>  Read User
        this.user = this.Auth.getCurrentUserSync();
        console.log(this.user);
        this.groups = this.Group.listopengroups();
      //console.log(  this.groups)
      });
    }
  }

  delusergroup(groupe) {
    var grpId = groupe._id;
    if(groupe.type == 0)   //Ouvert
    {
      this.Auth.delUserGroup(grpId, (err, u) => {
        if(err) {
          alert(`Erreur MAJ ${err.data}`);
          console.log(err);
        }
      //  console.log(u)
      // Force =>  Read User
        this.user = this.Auth.getCurrentUserSync();
        this.groups = this.Group.listopengroups();
      });
    } else // Reservé
  {
      console.log('reservé');
      this.Auth.nocandidatUserGroup(grpId, (err, u) => {
        if(err) {
          alert(`Erreur MAJ ${err.data}`);
          console.log(err);
        }
    //console.log(u);
    // Force =>  Read User
        this.user = this.Auth.getCurrentUserSync();
        this.groups = this.Group.listopengroups();
    //console.log(  this.groups)
      });
    }
  }
}
