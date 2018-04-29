'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './adminpoll.routes';

export class modalAddAdminPoll {

  constructor(Auth, User, Group, Poll, selectedPoll, $timeout, $uibModalInstance, moment) {
    'ngInject';
    this.Auth = Auth;
    this.$timeout = $timeout;
    this.getCurrentUser = Auth.getCurrentUserSync;
    //this.polls = Poll.query();
    this.poll = new Poll(selectedPoll);
    this.newPoll = true;
    this.titre = 'Création d\'un sondage';
    this.$uibModalInstance = $uibModalInstance;
    this.isAdmin_grp = Auth.isAdmin_grp;
    this.user = Auth.getCurrentUserSync();
    this.isadminOf = this.user.adminOf;
    this.disable = {};
    this.active = 0;
    this.moment = moment;
    moment.locale('fr');
    this.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'short'];
    this.format = this.formats[2];
    this.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      showWeeks: true,
      minDate: moment().toDate(),
    };
    this.format = 'dd/MM/yyyy';
    this.hstep = 1;
    this.mstep = 15;

    if(!angular.isObject(selectedPoll)) { //CREATE
    //  console.log('CREATE');
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
    //  console.log('MODIFY');
    //  console.log(this.poll);
      this.newPoll = false;
      this.titre = 'Modification du sondage';
      this.disable = {
        tab0: false,
        tab1: false,
        tab2: false
      };
      this.grp = {};
    //  this.propositions = angular.copy(this.poll.propositions);
      this.propositions = this.poll.propositions;
      self = this;
      var r = [];
      r = this.isadminOf.filter(function(item) {
      //  console.log(self.poll.groupe + ' ' + item._id);
        return (self.poll.groupe == item._id);
      });
    //  console.log(r);
      if(r.length) this.grp.selected = r[0];
    }
  } // End Constructor

  selectDate(date) {
    var prop = {
      date: new Date(date),
      stdate: this.moment(date).format('dddd LL'),
      sttime: []
    };
    //this.propositions.push(prop);
    if(!this.propositions.filter(function(item) {
      return (item.stdate == prop.stdate);
    }).length)
    {
      this.propositions.push(prop);
    }
  }
  delChx(chx) {
    this.propositions.splice(this.propositions.indexOf(chx), 1);
  }

  dup(x) {
    var self = this;
    angular.forEach(self.propositions, function(p) {
      p.sttime[x] = self.propositions[0].sttime[x];
    });
  }
  openDD($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.openedDD = true;
  }

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
      this.active = 1;
      // this.$timeout(function() {
      //   $('#calendar').fullCalendar('render');
      // }, 0);
    }
  }

  ok2() {
    this.disable.tab2 = false;
    this.active = 2;
  }
  ok() {
    var self = this;
      /* self.submitted = true
       if (form.$valid) {*/
    if(self.newPoll) {
      this.Auth.createPoll({
        name: self.poll.name,
        info: self.poll.info,
        groupe: self.grp.selected._id,
        groupeInfo: self.grp.selected.info,
        groupeName: self.grp.selected.name,
        isActif: false,
        propositions: self.propositions
      })
        .then(function(r) {
        //  console.log('Add is OK ');
          this.$uibModalInstance.close();
        })
        .catch(function(err) {
          err = err.data;
          console.log(err);
          //$window.alert('Erreur en création : ' + err);
          // self.errors = {};
          // // Update validity of form fields that match the mongoose errors
          // angular.forEach(err.errors, function(error, field) {
          //   form[field].$setValidity('mongoose', false);
          //   self.errors[field] = error.message;
          //  });
        });
      //}
    } else {
    //  console.log(self.poll);
      this.Auth.updatePoll(self.poll._id, {
        name: self.poll.name,
        info: self.poll.info,
        groupe: self.grp.selected._id,
        groupeInfo: self.grp.selected.info,
        groupeName: self.grp.selected.name,
        propositions: self.propositions
      })
        .then(function(data) {
      //    console.log('Maj is OK ');
          self.$uibModalInstance.close();
        })
        .catch(function(err) {
          console.log('Maj Not OK ');
          err = err.data;
          console.log(err);
          //$window.alert('Erreur en modification : ' + err);
          self.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            self.errors[field] = error.message;
          });
        });
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

}


export class AdminpollComponent {
  /*@ngInject*/
  constructor(User, Auth, Group, Poll, $uibModal) {
    this.message = 'Hello';
    this.Auth = Auth;
    this.Poll = Poll;
    this.$uibModal = $uibModal;
    this.polls = Poll.query();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  add(poll) {
    var ModalInstance = this.$uibModal.open({
      controller: modalAddAdminPoll,
      controllerAs: 'modalAddAdminPollCtrl',
      templateUrl: 'modalAddAdminPoll.html',
      size: 'lg',
      resolve: {
        selectedPoll() {
          return poll;
          //return null;
        }
      }
    });
  }
  active(poll) {
    poll.isActif = !poll.isActif;
    this.Auth.updatePoll(poll._id, {
      isActif: poll.isActif
    }).then(function(r) {
      console.log('Maj is OK ');
    })
      .catch(function(err) {
        err = err.data;
        console.log(err);
      });
  }
  delete(poll) {
    if(confirm('Suppression de ' + poll.name)) {
      this.Poll.remove({
        id: poll._id
      });
    }
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
