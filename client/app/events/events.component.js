'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './events.routes';

export class EventsComponent {
  /*@ngInject*/
  constructor($timeout, Auth, Group, User, calendarConfig, calendarEventTitle, Message, moment) {
  //  'ngInject';
    this.$timeout = $timeout;
    this.Auth = Auth;
    this.Group = Group;
    this.Message = Message;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.admGroupes = [];
    this.adminOf = [];
    moment.locale('fr');
    this.calendarView = 'week';
    this.cellIsOpen = false;
    this.calendarConfig = calendarConfig;
    this.calendarEventTitle = calendarEventTitle;
    this.viewDate = moment();
    //console.log(this.calendarConfig);
    this.calendarConfig.i18nStrings.weekNumber = 'Semaine {week}';
    this.calendarConfig.allDateFormats.moment.title = {
      day: 'EEEE d MMMM, yyyy',
      week: ' {year} - Semaine {week} ',
      month: 'MMMM YYYY',
      year: 'YYYY'
    };
    this.eventSources = [];
    this.alert = {
      type: '',
      msg: ' Créez ou Modifiez un évenement'
    };

    this.calendarEventTitle.monthViewTooltip = this.calendarEventTitle.weekViewTooltip = this.calendarEventTitle.dayViewTooltip = function(event) {
      var msg = 'Participants : ' + event.participants.length;
      return event.title + '<br>' + 'Lieu :' + event.lieu + '<br> ' + msg;
    };
  }

  refreshEvents(raz) {
    var eventsGroupe = {};
    var Auth = this.Auth;
    var calendarConfig = this.calendarConfig;
    var self = this;
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
                //   console.log(ev.participants);
                //   if(ev.participants.filter(function(item) {
                //     return ((item) && item._id == myUid);
                //   }).length) {
                //     ev.color = calendarConfig.colorTypes.info;
                //   } else {
                //     ev.color = calendarConfig.colorTypes.important;
                //   }
                  ev.startsAt = new Date(ev.startsAt);
                  ev.endsAt = new Date(ev.endsAt);
                  ev.draggable = true;
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
        this.refreshEvents(true);
      });
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
