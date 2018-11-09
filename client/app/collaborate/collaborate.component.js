'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './collaborate.routes';
//import JitsiMeetExternalAPI from './external_api'

export class PollComponent {
  /*@ngInject*/
  constructor($uibModalInstance, $window, $timeout, Auth, User, Group, Poll, selectedPoll) {
    this.$uibModalInstance = $uibModalInstance;
    this.Auth = Auth;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = Auth.getCurrentUserSync();
    this.$window = $window;
    this.repuser = [];
    this.totx = [];
    this.doTxt = function(r, i) {
      if (r) {
        this.totx[i] = this.totx[i] + 1;
      }
    };
    this.subHeaders = function() {
      var subs = [];
      this.totx = [];
      var self = this;
      this.propositions.forEach(function(col) {
        col.sttime.forEach(function(sub) {
          //console.log(sub);
          subs.push(sub);
          self.repuser.push(false);
          self.totx.push(0);
        });
      });
      return subs;
    };


    this.poll = new Poll(selectedPoll);
    //console.log(this.poll);
    this.found = [];
    this.propositions = this.poll.propositions;
    this.subDate = this.subHeaders();
    this.resultats = this.poll.resultats;
    this.resultats.forEach((resultat) => {
      resultat.reponses.forEach((r, index) => {
        if (r) this.totx[index] = this.totx[index] + 1;
      });
    });
    this.found = this.resultats.filter(o => o.user.email === this.user.email);
    if (this.found.length) {
      // Remplacer directement
      var i = this.resultats.indexOf(this.found[0]);
      // console.log(this.resultats[i].reponses)
      this.repuser = this.resultats[i].reponses;
      this.resultats.splice(this.resultats.indexOf(this.found[0]), 1);
    }
  }

  rep(r) {
    //  console.log(r)
    return r.reponses;
  }
  ok() {
    var self = this;
    var newRep = {
      user: {
        email: this.user.email
      },
      reponses: this.repuser
    };
    this.Auth.votePoll(this.poll._id, {
        resultats: this.poll.resultats,
        vote: newRep
      })
      .then(function(r) {
        //console.log('Maj is OK ');
        self.$uibModalInstance.close();
      })
      .catch(function(err) {
        err = err.data;
        console.log(err);
        //  $window.alert('Erreur en modification : ' + err);
      });
  }

  cancel() {
    //this.resultats = this.poll.resultats;
    this.$uibModalInstance.dismiss('cancel');
  }
}

export class NoteComponent {
  /*@ngInject*/
  constructor(Group, Auth, $uibModalInstance, grp) {
    //'ngInject';
    this.groupe = grp;
    this.Auth = Auth;
    this.options = {
      language: 'fr',
      // uiColor: "#66AB16",
      //readOnly: true,
      width: '98%',
      height: 400
    };
    this.isAdmin = Auth.isAdmin;
    this.isAdmin_grp = Auth.isAdmin_grp;
    // console.log(this.Auth.getCurrentUserSync().adminOf);
    // console.log(this.groupe._id);
    // this.isAdminOf = this.Auth.getCurrentUserSync().adminOf.find(o => {
    //   return o._id === this.groupe._id;
    // });
    var r = this.Auth.getCurrentUserSync().adminOf.filter(o => o._id === this.groupe._id);
    this.isAdminOf = r.length;


    //this.isAdminOf = this.Auth.getCurrentUserSync().adminOf == this.groupe._id;
    this.$uibModalInstance = $uibModalInstance;
    this.msg = '';
  }


  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  save() {
    this.Auth.updateGroup(this.groupe._id, this.groupe)
      .then(r => {
        this.$uibModalInstance.close();
      })
      .catch(err => {
        console.log(err);
        this.msg = `Erreur :${err.statusText}`;
      });
  }
}


export class CollaborateComponent {
  /*@ngInject*/
  constructor($http, $scope, $state, $stateParams, $timeout, $cookies, $window, socket, appConfig, calendarConfig, calendarEventTitle, moment, $uibModal, Auth, Group, Message) {
    this.$http = $http;
    this.$cookies = $cookies;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$state = $state;
    this.socket = socket;
    this.Auth = Auth;
    this.Group = Group;
    this.moment = moment;

    this.myconfig = {};
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.user = Auth.getCurrentUserSync();
    var self = this;
    this.Auth.getCurrentUser()
      .then(data => {
        var userGroupes = data.memberOf;
        // Force Group Commun
        if (!userGroupes.filter(item => {
            return ((item) && item.name == 'Tous');
          }).length) {
          console.log('inscription');
          this.Auth.groupecommun().then(r => {
            //console.log(r[0]._id)
            this.Auth.addUserGroup(r[0]._id);
          });
        }


        var userGrp = [];
        userGroupes.forEach(function(p) {
          userGrp.push(p.name);
        });
        self.Auth.mypolls(userGrp)
          .then(function(data) {
            self.polls = data;
          });
      });


    this.isActif = Auth.isActif;
    this.$uibModal = $uibModal;
    this.Message = Message;
    this.alert = {
      type: 'success',
      msg: 'cliquez sur un évément pour vous inscrire ou dé-inscrire.'
    };
    //this.polls = this.Auth.mypolls(['eole']);
    // this.OauthActif = true;
    // this.DeviseSite = appConfig.DeviseSite || 'Eco-système Libre';
    // this.TitreSite = appConfig.TitreSite || 'Libre Communauté';

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
    this.actions = [{
      label: '<i class=\'glyphicon glyphicon-eye-open\'></i>',
      onClick(args) {
        self.openPadEv(args);
      }
    }];
    this.calendarEventTitle.monthViewTooltip = this.calendarEventTitle.weekViewTooltip = this.calendarEventTitle.dayViewTooltip = (event) => {
      var msg = '<br>Participation: Oui';
      if (event.color == calendarConfig.colorTypes.important)
        msg = '<br>Participation: Non';
      return event.info + '<br>' + event.lieu + msg;
    };
    this.eventSources = [
      //   {
      //   title: 'Réunion !',
      //   color: this.calendarConfig.colorTypes.info,
      //   startsAt: moment().add(1, 'days').toDate(),
      //   //startsAt: moment().startOf('week').subtract(2, 'days').add(8, 'hours').toDate(),
      //   endsAt: moment().add(1, 'days').add(1, 'hours').toDate(),
      //   allDay: false,
      //   draggable: false,
      //   resizable: false
      // }
    ];
    this.urlPad = '';
    this.hostPad = '';
    this.urlCal = '';
    this.urlBoard = '';
    this.urlVisio = '';
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  }

  gteToday(ev) {
    var evDate = new Date(ev).setHours(0, 0, 0, 0);
    var toDay = new Date().setHours(0, 0, 0, 0);
    return evDate >= toDay;
  }
  eventClicked(event) {
    var message = '';
    var self = this;
    var color = {};
    var myUid = this.getCurrentUser()._id;
    if (!event.newEv) return;
    if (event.participants.filter(function(item) {
        return ((item) && item._id == myUid);
      }).length) {
      message = 'Dé-inscription de ' + event.title + ' effectuée';
      //  color = self.calendarConfig.colorTypes.important;
    } else {
      message = 'Inscription à ' + event.title + ' effectuée';
      //  color = self.calendarConfig.colorTypes.info;
    }
    this.Auth.eventparticipate(event.group._id, {
        _id: event._id,
        UserId: myUid
      })
      .then((data) => {
        self.refreshEvents(true);
        self.alert = {
          type: 'success',
          msg: message
        };
      })
      .catch((err) => {
        self.refreshEvents(true);
        self.alert = {
          type: 'error',
          msg: 'Erreur : Inscription Imposible'
        };
        console.log(err.statusText);
      });

    this.$timeout(function() {
      self.alert = {
        type: 'info',
        msg: 'cliquez sur un évément pour vous inscrire ou dé-inscrire.'
      };
    }, 2000);
  }

  refreshEvents(raz) {
    var eventsGroupe = {};
    var Auth = this.Auth;
    var calendarConfig = this.calendarConfig;
    var self = this;

    // this.Auth.getCurrentUser()
    // .then(function(data) {
    //   var userGroupes = data.memberOf;
    //   console.log(data);
    //   self.Auth.mypolls(userGroupes)
    // .then(function(data) {
    //   self.polls = data;
    //   console.log(self.polls);
    // });
    // });

    if (raz) this.eventSources = [];

    //var workEvents = [];
    //var couleur = ['DotgerBlue', 'chocolate', 'ForestGreen', 'DarkRed', 'FireBrick', 'Tan', 'Peru', 'oliveDrab', 'Lavender', 'GoldenRod', 'CornFlowerBlue', 'LightSkyBlue', 'grey'];
    var myUid = this.getCurrentUser()._id;
    var userGroupes = this.getCurrentUser().memberOf;
    //console.log(userGroupes);
    angular.forEach(userGroupes, (grp, index) => {
      //console.log(grp._id);
      Auth.eventsofgroup(grp._id)
        .then((data) => {
          if (data.length > 0) {
            //eventsGroupe.events = data;
            angular.forEach(data, (ev, ind) => {
              if (ev.participants.filter((item) => {
                  return ((item) && item._id == myUid);
                }).length) {
                ev.color = calendarConfig.colorTypes.info;
                ev.participate = true;
              } else {
                ev.color = calendarConfig.colorTypes.important;
                ev.participate = false;
              }
              ev.newEv = this.gteToday(ev.startsAt);
              ev.actions = self.actions;
              ev.startsAt = new Date(ev.startsAt);
              ev.endsAt = new Date(ev.endsAt);
              if (ev.allDay)
                ev.start = this.moment(ev.startsAt).format('ll');
              else {
                ev.start = this.moment(ev.startsAt).format('ll') + '<br>' + this.moment(ev.startsAt).format('LT') + ' - ' + this.moment(ev.endsAt).format('LT');
              }
              ev.group = {
                _id: grp._id,
                info: grp.info
              };
            });

            eventsGroupe.events = angular.copy(data);
            eventsGroupe.index = index;
            //   eventsGroupe.events.group_id = grp._id;
            //   // eventsGroupe.startsAt = new Date(eventsGroupe.startsAt);
            // eventsGroupe.eventgroup = {
            //     _id: grp._id,
            //     info: grp.info
            //   };
            Array.prototype.push.apply(self.eventSources, data);

            //  console.log(grp._id);
            //    console.log(eventSources[index]);
            eventsGroupe = {};
          }
        });
    });
  }
  extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('://') > -1) {
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
    if (arrLen > 2) {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
      //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
        //this is using a ccTLD
        domain = splitArr[arrLen - 3] + '.' + domain;
      }
    }
    return domain;
  }

  $onInit() {
    this.Message.get()
      .$promise
      .then(result => {
        this.myconfig = result;
        if (this.myconfig.etherpadUrl) {
          this.urlPad = this.myconfig.etherpadUrl;
        } else {
          this.actions = [];
        }
        if (this.myconfig.etherpadHost) {
          this.hostPad = this.myconfig.etherpadHost;
        }
        if (this.myconfig.ethercalcUrl) {
          this.urlCal = this.myconfig.ethercalcUrl;
        }
        if (this.myconfig.boardUrl) {
          this.urlBoard = this.myconfig.boardUrl;
        }
        if (this.myconfig.visioUrl) {
          this.urlVisio = this.myconfig.visioUrl;
        }

        //console.log(this.myconfig);
        this.refreshEvents(false);
      });
  }

  openNote(grp) {
    this.$uibModal.open({
      templateUrl: 'modalNote.html',
      controller: NoteComponent,
      controllerAs: 'NC',
      resolve: {
        grp() {
          return grp;
        }
      }
    });
  }

  rep(poll) {
    var resultats = poll.resultats;
    var found = resultats.filter(o => o.user.email === this.user.email);
    return found.length;
  }

  openPoll(poll) {
    var modalInstance = this.$uibModal.open({
      controller: PollComponent,
      controllerAs: 'NP',
      templateUrl: 'modalRepPoll.html',
      size: 'lg',
      resolve: {
        selectedPoll() {
          return poll;
        }
      }
    });
    modalInstance.result.then(res => {
      var self = this;
      this.Auth.getCurrentUser()
        .then(function(data) {
          var userGroupes = data.memberOf;
          var userGrp = [];
          userGroupes.forEach(function(p) {
            userGrp.push(p.name);
          });
          self.Auth.mypolls(userGrp)
            .then(function(data) {
              self.polls = data;
            });
        });
    }, () => {
      var self = this;
      this.Auth.getCurrentUser()
        .then(function(data) {
          var userGroupes = data.memberOf;
          var userGrp = [];
          userGroupes.forEach(function(p) {
            userGrp.push(p.name);
          });
          self.Auth.mypolls(userGrp)
            .then(function(data) {
              self.polls = data;
            });
        });
    });
  }
  goSettings() {
    this.$state.go('settings', {
      'Tab': 2
    });
  }
  goDirectory(gp) {
    this.$state.go('directory', {
      'grpID': gp._id
    });
  }

  openPadEv(args) {
    if (args.calendarEvent) {
      var padID = args.calendarEvent.eventPadID
    } else var padID = args.eventPadID
    console.log(padID)
    var grpID = padID.split('\$')[0];
    console.log('grpID:' + grpID);
    var authorID = this.getCurrentUser().authorPadID;
    this.$http.post('/api/pads', {
        authorID,
        groupID: grpID
      }).success(data => {
        if (data) {
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
  }

  openPad(grp) {
    var authorID = this.getCurrentUser().authorPadID;
    this.$http.post('/api/pads', {
        authorID,
        groupID: grp.groupPadID
      }).success(data => {
        if (data) {
          this.$cookies.put('sessionID', data.sessionID);
          var mydomain = this.extractRootDomain(this.urlPad);
          this.$cookies.put('sessionID', data.sessionID, {
            domain: mydomain
          });
          var url = `${this.urlPad}/p/${grp.groupPadID}$${grp.name}?userName=${this.getCurrentUser().name}`;
          //this.$window.open('//localhost:9001/p/' + grp.groupPadID + "$" + grp.name + "?userName=" + this.getCurrentUser().name);
          this.$window.open(url);
        } else alert(`${url}\n Pad  non trouvé ou vous n'êtes pas autorisé`);
      })
      .error(function(err) {
        console.log(`err :${err}`);
        alert('Serveur Pad  non actif');
      });
  }

  openCalc(grp) {
    var url = `${this.urlCal}/${grp.name}?auth=${grp.digest}`;
    //console.log(url);
    this.$window.open(url);
  }
  openBoard(grp) {
    var url = `${this.urlBoard}/${grp.name}`;
    //console.log(url);
    this.$window.open(url);
  }

  openVisio(grp) {
    var url = `${this.urlVisio}/Mim${grp.name}`;
    this.$window.open(url);
  }
  // this.$uibModal.open({
  //   template: 'modalVisio.html',
  //   controller: function() {
  //     var domain = "jitsi.mim.ovh";
  //     var options = {
  //       roomName: "JitsiMeetAPIExample",
  //       height: 700,
  //       parent: undefined
  //     }
  //     //var meet = new JitsiMeetExternalAPI(domain, options);
  //   },
  //   //controllerAs: 'VC',
  //   resolve: {
  //     grp() {
  //       return grp;
  //     }
  //   }
  // });
  // }
}
export default angular.module('eUsersApp.collaborate', [uiRouter])
  .config(routes)
  .component('collaborate', {
    template: require('./collaborate.html'),
    controller: CollaborateComponent,
    controllerAs: 'collaborateCtrl'
  })
  .name;