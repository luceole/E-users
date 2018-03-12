'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './adminpoll.routes';

export class modalAddAdminPoll {

  constructor(Auth, User, Group, Poll, selectedPoll, $timeout, $uibModalInstance) {
    'ngInject';
    this.Auth = Auth;
    this.$timeout = $timeout;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.poll = new Poll(selectedPoll);
    this.titre = 'Création d\'un sondage';
    this.$uibModalInstance = $uibModalInstance;
    this.isAdmin_grp = Auth.isAdmin_grp;
    this.user = Auth.getCurrentUserSync();
    this.isadminOf = this.user.adminOf;
    this.uiConfig = {
      calendar: {
        lang: 'fr',
        height: 260,
        editable: false,
        timezone: 'local',
        defaultView: 'month',
        header: {
          center: 'title',
          left: ' month, basicWeek',
          right: ' prev today next'
        },
        dayClick: this.alertOnDayClick
      }
    };
    this.uiConfig.calendar.dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    this.uiConfig.calendar.monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
    this.uiConfig.calendar.monthNamesShort = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec'];
    this.uiConfig.calendar.dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    if(!angular.isObject(selectedPoll)) { //CREATE
      console.log('CREATE');
      this.newPoll = true;
      this.disable = {
        tab0: false,
        tab1: true,
        tab2: true
      };
      this.propositions = [];
      this.grp = {};
    } else // MODIFY

    {
      console.log('MODIFY');
      newPoll = false;
      this.titre = 'Modification du sondage';
      this.disable = {
        tab0: false,
        tab1: false,
        tab2: false
      };
    }
  } // End Constructor

  initCalendar() {
    if(this.disable.tab1 != true) {
      // Calendar in Tabset need this !
      this.$timeout(function() {
    //    $('#calendar').fullCalendar('render');
      }, 0);
    } else {
      /*  this.active = {};
        this.active.tab0 = true;*/
      //alert("Merci de remplir le premier onglet")
    }
  }

  ok1(form) {
    this.submitted = true;
    if(form.$valid) {
      this.disable.tab1 = false;
      this.active = {};
      this.active.tab1 = true;
      // this.$timeout(function() {
      //   $('#calendar').fullCalendar('render');
      // }, 0);
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }


}


export class AdminpollComponent {
  /*@ngInject*/
  constructor(User, Group, Poll, $uibModal) {
    this.message = 'Hello';
    this.$uibModal = $uibModal;
    this.polls = [];
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  add() {
    var ModalInstance = this.$uibModal.open({
      controller: modalAddAdminPoll,
      controllerAs: 'modalAddAdminPollCtrl',
      templateUrl: 'modalAddAdminPoll.html',
     //  size: 'lg',
      resolve: {
        selectedPoll() {
          //return poll;
          return null;
        }
      }
    });
  }
}

export default angular.module('eUsersApp.adminpoll', [uiRouter])
  .config(routes)
  .component('adminpoll', {
    template: require('./adminpoll.html'),
    controller: AdminpollComponent,
    controllerAs: 'adminpollCtrl'
  })
  .name;
