import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  /*@ngInject*/
  constructor($http, $timeout, $state, $stateParams, $window, socket, appConfig, Auth, calendarConfig, moment, Message) {
    this.w = $window;
    this.$http = $http;
    //this.$timeout = $timeout;
    this.socket = socket;
    this.Message = Message;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.Auth = Auth;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.MSG = '';
    // this.alert = {
    //   type: 'success',
    //   msg: 'cliquez sur un évément pour vous inscrire ou dé-inscrire.'
    // };
    this.DeviseSite = appConfig.DeviseSite || 'Eco-système ';
    this.TitreSite = appConfig.TitreSite || 'Libre Communaute';
    //this.onlineServices = appConfig.onlineServices;
    this.onlineServices = [];
    this.OauthActif = appConfig.OauthActif || false;
    this.sso = this.$state.current.name == 'discoursesso';
    // moment.locale('fr');
    // this.calendarView = 'week';
    // this.cellIsOpen = false;
    //
    // this.calendarConfig = calendarConfig;
    // this.viewDate = moment();
    // //console.log(this.calendarConfig)
    // this.calendarConfig.i18nStrings.weekNumber = 'Semaine {week}';
    // this.eventSources = [{
    //   title: 'Réunion !',
    //   color: this.calendarConfig.colorTypes.info,
    //   startsAt: moment().add(1, 'days').toDate(),
    //   //startsAt: moment().startOf('week').subtract(2, 'days').add(8, 'hours').toDate(),
    //   endsAt: moment().add(1, 'days').add(1, 'hours').toDate(),
    //   allDay: false,
    //   draggable: false,
    //   resizable: false
    // }
    // ];

    //   $scope.$on('$destroy', function() {
    //     socket.unsyncUpdates('thing');
    //   });
  }
  // eventClicked(event) {
  //   var message = '';
  //   var self = this;
  //   var myUid = this.getCurrentUser()._id;
  //   if(event.participants.filter(function(item) {
  //     return ((item) && item._id == myUid);
  //   }).length) {
  //     message = 'Dé-inscription de ' + event.title + ' effectuée';
  //   } else {
  //     message = 'Inscription à ' + event.title + ' effectuée';
  //   }
  //   this.alert.msg = message;
  //   this.alert.type = 'warning';
  //   this.$timeout(function() {
  //     self.alert = {
  //       type: 'info',
  //       msg: 'cliquez sur un évément pour vous inscrire ou dé-inscrire.'
  //     };
  //   }, 2000);
  // }
  //
  // refreshEvents() {
  //   var eventsGroupe = {};
  //   var Auth = this.Auth;
  //   var calendarConfig = this.calendarConfig;
  //   var eventSources = this.eventSources;
  //       //var workEvents = [];
  //       //var couleur = ['DotgerBlue', 'chocolate', 'ForestGreen', 'DarkRed', 'FireBrick', 'Tan', 'Peru', 'oliveDrab', 'Lavender', 'GoldenRod', 'CornFlowerBlue', 'LightSkyBlue', 'grey'];
  //   var myUid = this.getCurrentUser()._id;
  //   var userGroupes = this.getCurrentUser().memberOf;
  //   //console.log(userGroupes);
  //   angular.forEach(userGroupes, function(grp, index) {
  //     //console.log(grp._id);
  //     Auth.eventsofgroup(grp._id)
  //           .then(function(data) {
  //             if(data.length > 0) {
  //               //eventsGroupe.events = data;
  //               angular.forEach(data, function(ev, ind) {
  //                 if(ev.participants.filter(function(item) {
  //                   return ((item) && item._id == myUid);
  //                 }).length) {
  //                   ev.color = calendarConfig.colorTypes.info;
  //                   // { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
  //                   //   primary: '#e3bc08', // the primary event color (should be darker than secondary)
  //                   //   secondary: '#fdf1ba' // the secondary event color (should be lighter than primary)
  //                   // };
  //                 } else {
  //                   ev.color = calendarConfig.colorTypes.important;
  //                 }
  //                 ev.startsAt = new Date(ev.startsAt);
  //                 ev.endsAt = new Date(ev.endsAt);
  //               });
  //
  //               eventsGroupe.events = angular.copy(data);
  //               eventsGroupe.index = index;
  //               eventsGroupe.group_id = grp._id;
  //               // eventsGroupe.startsAt = new Date(eventsGroupe.startsAt);
  //               // eventsGroupe.endsAt = new Date(eventsGroupe.endsAt);
  //               eventsGroupe.group = {
  //                 _id: grp._id,
  //                 info: grp.info
  //               };
  //
  //               Array.prototype.push.apply(eventSources, eventsGroupe.events);
  //
  //             //  console.log(grp._id);
  //           //    console.log(eventSources[index]);
  //               eventsGroupe = {};
  //             }
  //           });
  //   });
  // }

  $onInit() {
    // this.$http.get('/api/things')
    //   .then(response => {
    //     this.awesomeThings = response.data;
    //     this.socket.syncUpdates('thing', this.awesomeThings);
    //   });
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        this.TitreSite = this.myconfig.TitreSite;
        this.DeviseSite = this.myconfig.DeviseSite;
        this.OauthActif = this.myconfig.OauthActif;
        this.onlineServices = this.myconfig.onlineServices;
        //this.refreshEvents();
        //console.log(this.myconfig);
      });

    if(this.$state.current.name == 'discoursesso') {
      this.MSG = ' ***  REDIRECTION Forum Discourse en cours ..';
      this.Auth.getCurrentUser()
        .then(u => {
          if(u._id) {
            var sso = this.$stateParams.sso;
            var sig = this.$stateParams.sig;
            this.Auth.discourseSso(u._id, {
              sso,
              sig
            })
              .then(rep => {
                this.w.location.href = rep.url;
              });
          }
        });
    }
    this.MSG = '';
  }


  Formlogin(form) {
    this.submitted = true;
    this.msg = '';


    if(form.$valid) {
      this.Auth.login({
        uid: this.user.uid,
        password: this.user.password
      })
        .then(u => {
          if(this.$state.current.name == 'discoursesso') {
            this.MSG = ' ***  REDIRECTION en cours ..';
            var sso = this.$stateParams.sso;
            var sig = this.$stateParams.sig;
            this.Auth.discourseSso(u._id, {
              sso,
              sig
            })
              .then(rep => {
                this.w.location.href = rep.url;
              });
          } else {
            //Logged in , redirect to home
            this.$state.go('main');
          }
        })
        .catch(err => {
          console.log(err);
          this.msg = err.message;
          this.$state.go('main');
        });
    }
  }
}

export default angular.module('E-userApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
