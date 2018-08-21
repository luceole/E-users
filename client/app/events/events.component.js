'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './events.routes';


export class ModalEditEvComponent {
  constructor(Auth, Group, $uibModalInstance, moment, updateEvent) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.Auth = Auth;
    this.Group = Group;
    this.moment = moment;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.updateEvent = updateEvent;
    if(updateEvent.group) {
      this.titre = 'Modification: ';
      this.libDate = moment(updateEvent.startsAt).format('LLLL');
      this.newEv = false;
    } else {
      this.titre = 'Création: ';
      this.libDate = '';
      this.newEv = true;
      this.updateEvent = {
        title: 'Réunion',
        startsAt: moment().startOf('hour').toDate(),
        endsAt: moment().startOf('hour').add(1, 'hours').toDate(),
        allDay: true,
        info: '',
        lieu: '',
        groupe: '',
        participants: new Array()
      };
    }
    this.submitted = false;
    this.grp = '';
    //this.event = angular.copy(this.updateEvent);
    this.event = this.updateEvent;
    this.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'short'];
    this.format = this.formats[2];
    this.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      showWeeks: true,
      minDate: this.event.startsAt
    };
    this.format = 'dd/MM/yyyy';
    this.hstep = 1;
    this.mstep = 15;
  }
  openDD($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.openedDD = true;
  }

  openDF($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.openedDF = true;
  }
  cancel() {
    var self = this;
    this.$uibModalInstance.dismiss('cancel');
  }

  change() {

  }

  delete() {
    var self = this;
    if(this.event.participants.length > 0) {
      if(!confirm('Attention des participants sont inscrits \nConfirmez vous la suppression?')) {
        return;
      }
    }
    this.Auth.eventdelete(this.event.group._id, {
      id: this.event._id
    })
      .then(function() {
        self.$uibModalInstance.close();
      })
      .catch(function(err) {
        err = err.data;
        //$window.alert("Maj Erreur " + err);
        console.log(err);
        self.$uibModalInstance.close();
      });
  }

  copyAdr() {
    var liste = '';
    this.event.participants.forEach(function(o, index) {
      console.log(o);
      liste = liste + o.name + ', ' + o.surname + ', ' + o.email + ', ' + o.structure + '\n';
    });
    alert('Copié! Ctrl-V pour coller');

    const el = document.createElement('textarea');
    el.value = liste;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  mailtoAdr() {
    var liste = '';
    this.event.participants.forEach(function(o, index) {
      liste = liste + o.email + ', ';
    });
    window.location.href = 'mailto:' + liste;
  }
  ok(form) {
    var message = '';
    var self = this;
    self.submitted = true;
    self.editMessage = '';
    if(form.$valid) {
      if(self.newEv) {
        self.event.group = self.grp;
        self.event.title = self.grp.info;
      }
      if(this.moment(self.event.endsAt).isBefore(self.event.startsAt)) {
        self.event.endsAt = self.event.startsAt;
      }
      return self.Auth.eventupdate(self.event.group._id, {
        _id: self.event._id,
        title: self.event.title,
        startsAt: new Date(self.event.startsAt),
        endsAt: new Date(self.event.endsAt),
        allDay: self.event.allDay,
        info: self.event.info,
        lieu: self.event.lieu,
        groupe: self.event.group.info,
        eventPadID: String,
        participants: self.event.participants
      })
        .then(() => {
          this.editMessage = 'Mise à jour prise en compte';
          self.$uibModalInstance.close();
        })
        .catch(err => {
          err = err.data;
          this.errors = {};
          console.log(err.data);
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            form[field].$setDirty();
            this.errors[field] = error.message;
          });
        });
    }
  }

} // End class


export class EventsComponent {
  /*@ngInject*/
  constructor($timeout, $http, $uibModal, $cookies, $window, Auth, Group, User, calendarConfig, calendarEventTitle, Message, moment) {
    //  'ngInject';
    this.$timeout = $timeout;
    this.$uibModal = $uibModal;
    this.$cookies = $cookies;
    this.$window = $window;
    this.$http = $http;
    this.Auth = Auth;
    this.Group = Group;
    this.Message = Message;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.admGroupes = [];
    this.adminOf = [];
    this.moment = moment;
    moment.locale('fr');
    this.calendarView = 'week';
    this.cellIsOpen = false;
    this.calendarConfig = calendarConfig;
    this.calendarEventTitle = calendarEventTitle;
    this.viewDate = moment();
    //console.log(this.calendarConfig);
    this.calendarConfig.i18nStrings.weekNumber = 'Semaine {week}';
    this.calendarConfig.allDateFormats.moment.title = {
      day: 'dddd LL',
      week: ' {year} - Semaine {week} ',
      month: 'MMMM YYYY',
      year: 'YYYY'
    };
    this.openPad = (args) => {
      var padID = args.calendarEvent.eventPadID;
      var grpID = padID.split('\$')[0];
      console.log('grpID:' + grpID);
      var authorID = this.getCurrentUser().authorPadID;
      this.$http.post('/api/pads', {
        authorID,
        groupID: grpID
      }).success(data => {
        if(data) {
          this.$cookies.put('sessionID', data.sessionID);
          var mydomain = this.extractRootDomain(this.urlPad);
          this.$cookies.put('sessionID', data.sessionID, {
            domain: mydomain
          });
          var url = `${this.urlPad}/p/${padID}?userName=${this.getCurrentUser().name}`;
            //this.$window.open('//localhost:9001/p/' + grp.groupPadID + "$" + grp.name + "?userName=" + this.getCurrentUser().name);
          this.$window.open(url);
        } else alert(' Pad  non trouvé ou vous n\'êtes pas autorisé');
      })
        .error(function(err) {
          console.log(`err :${err}`);
          alert('Serveur Pad  non actif');
        });
    };

    var args;
    var self = this;
    this.actions = [{
      label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
      onClick(args) {
        self.openPad(args);
      }
    }];
    this.eventSources = [];
    this.alert = {
      type: '',
      msg: ' Créez ou Modifiez un évenement'
    };

    this.calendarEventTitle.monthViewTooltip = this.calendarEventTitle.weekViewTooltip = this.calendarEventTitle.dayViewTooltip = function(event) {
      var msg = 'Participants : ' + event.participants.length;
      return event.info + '<br>Lieu :' + event.lieu + '<br> ' + msg;
    };
  }
  extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if(url.indexOf('://') > -1) {
      hostname = url.split('/')[2];
    } else {
      hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
  }
  extractRootDomain(url) {
    var domain = this.extractHostname(url),
      splitArr = domain.split('.'),
      arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain
    if(arrLen > 2) {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
      //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if(splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
        //this is using a ccTLD
        domain = splitArr[arrLen - 3] + '.' + domain;
      }
    }
    return domain;
  }

  refreshEvents(raz) {
    var eventsGroupe = {};
    var Auth = this.Auth;
    var calendarConfig = this.calendarConfig;
    //console.log(calendarConfig);
    self = this;
    if(raz) this.eventSources = [];
    //var workEvents = [];
    //var couleur = ['DotgerBlue', 'chocolate', 'ForestGreen', 'DarkRed', 'FireBrick', 'Tan', 'Peru', 'oliveDrab', 'Lavender', 'GoldenRod', 'CornFlowerBlue', 'LightSkyBlue', 'grey'];
    // var myUid = self.getCurrentUser()._id;
    // var userGroupes = self.getCurrentUser().adminOf;
    var myUid = this.getCurrentUser()._id;
    var userGroupes = this.getCurrentUser().adminOf;
    //console.log(userGroupes);
    angular.forEach(userGroupes, function(grp, index) {
      //console.log(grp._id);
      Auth.eventsofgroup(grp._id)
        .then(function(data) {
          if(data.length > 0) {
            //eventsGroupe.events = data;
            angular.forEach(data, function(ev, ind) {
              //console.log(ev.eventPadID);
              ev.startsAt = new Date(ev.startsAt);
              //if(self.moment(ev.endsAt).isbefore(self.moment(ev.startsAt))) ev.endsAt = ev.startsAt;
              if(!ev.endsAt) ev.endsAt = ev.startsAt;
              //if(ev.allDay) ev.endsAt = ev.startsAt;
              ev.endsAt = new Date(ev.endsAt);
              ev.draggable = true;
              ev.resizable = true;
              ev.actions = self.actions;
              ev.group = {
                _id: grp._id,
                info: grp.info
              };
            });

            // eventsGroupe.events = angular.copy(data);
            // eventsGroupe.index = index;
            //   eventsGroupe.events.group_id = grp._id;
            //   // eventsGroupe.startsAt = new Date(eventsGroupe.startsAt);
            // eventsGroupe.eventgroup = {
            //     _id: grp._id,
            //     info: grp.info
            //   };
            Array.prototype.push.apply(self.eventSources, data);
            return self.eventSources;
            //  console.log(grp._id);
            //    console.log(eventSources[index]);
            // eventsGroupe = {};
          }
        });
    });
  }

  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        if(this.myconfig.etherpadUrl) {
          this.urlPad = this.myconfig.etherpadUrl;
        }
        if(this.myconfig.etherpadHost) {
          this.hostPad = this.myconfig.etherpadHost;
        }
        if(this.myconfig.ethercalcUrl) {
          this.urlCal = this.myconfig.ethercalcUrl;
        }
        this.refreshEvents(true);
      });
  }

  eventClicked(ev) {
    self = this;
    var uibModalInstance = this.$uibModal.open({
      controller: ModalEditEvComponent,
      controllerAs: 'modalEditEvCtrl',
      templateUrl: 'modalEv.html',
      backdrop: 'static',

      resolve: {
        Sdate() {
          return ev.startsAt;
        },
        updateEvent() {
          return ev;
        }
      }
    });
    uibModalInstance.closed.then(function() {
      self.refreshEvents(true);
    });
  }
  timespanClicked(calendarDate, calendarCell) {

  }
  eventTimesChanged(event) {
    self = this;
    this.viewDate = event.startsAt;
    //  console.log(event);
    if(event.participants.length > 0) {
      if(!confirm('Des participants sont déja inscrits: Etes vous sur ?')) {
        self.refreshEvents(true);
        return;
      }
    }
    this.Auth.eventupdate(event.group._id, {
      _id: event._id,
      allDay: event.allDay,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt)
    }).then(function(data) {
      self.alert = {
        type: 'error',
        msg: 'Modification Effectuée'
      };
      self.refreshEvents(true);
    })
      .catch(function(err) {
        self.refreshEvents(true);
        self.alert = {
          type: 'error',
          msg: 'Erreur : Modification Imposible'
        };
        //console.log(err);
      });
    this.$timeout(function() {
      self.alert = {
        type: 'info',
        msg: 'Créez ou Modifiez un événement'
      };
    }, 2000);
  }
}

export default angular.module('eUsersApp.events', [uiRouter])
  .config(routes)
  .component('events', {
    template: require('./events.html'),
    controller: EventsComponent,
    controllerAs: 'eventsCtrl'
  })
  .name;
