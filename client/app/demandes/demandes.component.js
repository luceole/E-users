
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import './dirPagination'

import routes from './demandes.routes';

export class DemandesComponent {
  /*@ngInject*/
  constructor($http,User,Auth,Demande) {
    'ngInject';
    this.$http = $http;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.Auth = Auth;
    this.User = User;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync
    this.Demande=Demande;
    this.usersPerPage = 12;  //Idem Paginate Server Side
    this.current=1;
    this.pagination = { current: 1};
    this.demandes={};
    this.users=this.demandes;
    this.totalUsers=0;
}  //Contructor


$onInit(){
this.Demande.get(this.pagination.current)
 .$promise
 .then(result => {
   this.users  = result.docs;
   this.demandes  = result;
   this.totalUsers = result.total;
 });
 }

pageChanged(newPage) {
  console.log(newPage)
  this.Demande.get({page: newPage})
   .$promise
   .then(result => {
     console.log(this.demandes.docs[0])
     this.users  = result.docs;
     this.demandes  = result;
     this.totalUsers = result.total;
   });
   }

traite(ds){
  console.log("traite");
       angular.forEach(this.users, u => {
         console.log(" "+u.isactif+" "+u.uid)
         if (u.isactif) {
           u.isdemande = false;
          this.User.update(u._id, u, () => {});
         }
     });
     this.Demande.get(this.pagination.current)
      .$promise
      .then(result => {
        this.users  = result.docs;
        this.demandes  = result;
        this.totalUsers = result.total;
      });
     };

checkAll() {
  angular.forEach(this.users, function(u) {
    u.isactif = true;
  });
};

uncheckAll() {
  angular.forEach(this.users, function(u) {
    u.isactif = false;
  });
};


}  // Class

export default angular.module('newfullstackApp.demandes', [uiRouter,'angularUtils.directives.dirPagination'])
  .config(routes)
  .component('demandes', {
    template: require('./demandes.html'),
    controller: DemandesComponent,
    controllerAs: 'demandesCtrl'
  })
  .name;
