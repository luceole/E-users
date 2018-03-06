'use strict';

exports = module.exports = {
  DeviseSite: 'Eco-système Logiciels Libres ',
  TitreSite: 'Libre Communauté',
  OauthActif: true,

  // List of user roles
  userRoles: ['guest', 'user', 'admin_grp', 'admin'],

  onlineServices: [
   {glyphicon: 'glyphicon-bullhorn', url: 'https://forum.libre-communaute.fr', title: ' Forum Libre Communauté'},
   {glyphicon: 'glyphicon-certificate', url: 'https://chat.libre-communaute.fr', title: 'Chat Libre Communauté'}
  ],


  etherpad: {
    apikey: '10c8423ace54f0c1bc3c39f417fd2d73cfb3f2194e25b91bd29a5429e0ed961b',
    host: 'localhost',
    port: '9001',
    url: 'http://localhost:9001'
  }
};
