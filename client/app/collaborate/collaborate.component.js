'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');

import routes from './collaborate.routes';

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
    this.isAdminOf = this.Auth.getCurrentUserSync().adminOf.find(o => o === this.groupe._id);
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
  constructor($http, $scope, $state, $stateParams, $cookies, $window, socket, appConfig, $uibModal, Auth, Group, Message) {
    this.$http = $http;
    this.$cookies = $cookies;
    this.$window = $window;
    this.socket = socket;
    this.Auth = Auth;
    this.Group = Group;
    this.myconfig = {};
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.isActif = Auth.isActif;
    this.$uibModal = $uibModal;
    this.Message = Message;
    // this.OauthActif = true;
    // this.DeviseSite = appConfig.DeviseSite || 'Eco-système Libre';
    // this.TitreSite = appConfig.TitreSite || 'Libre Communauté';


    this.urlPad = '';
    this.hostPad = '';
    this.urlCal = '';

    /* $scope.$on('$destroy', function () {
       socket.unsyncUpdates('thing');
     });*/
  }
  extractHostname(url) {
    var hostname;
      //find & remove protocol (http, ftp, etc.) and get hostname

    if(url.indexOf('://') > -1) {
      hostname = url.split('/')[2];
    }
    else {
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

        console.log(this.myconfig);
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

  openPad(grp) {
    var authorID = this.getCurrentUser().authorPadID;
    this.$http.post('/api/pads', {
      authorID,
      groupID: grp.groupPadID
    }).success(data => {
      if(data) {
        this.$cookies.put('sessionID', data.sessionID);
        var mydomain = this.extractRootDomain(this.urlPad);
        console.log(mydomain);
        this.$cookies.put('sessionID', data.sessionID, {domain: mydomain});
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
}
export default angular.module('eUsersApp.collaborate', [uiRouter])
  .config(routes)
  .component('collaborate', {
    template: require('./collaborate.html'),
    controller: CollaborateComponent,
    controllerAs: 'collaborateCtrl'
  })
  .name;
