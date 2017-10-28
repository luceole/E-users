/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */
'use strict';
import config from '../config/environment';
import User from '../api/user/user.model';
import Group from '../api/group/group.model';
if (config.env !== 'production') {
  User.find({}).remove()
    .then(() => {
      User.create({
          provider: 'local',
          role: 'admin_grp',
          name: 'Test',
          uid: 'test',
          surname: 'User',
          email: 'luc.bourdot@ac-dijon.fr',
          mailValid: true,
          structure: 'Education',
          isactif: true,
          password: 'test'
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          surname: 'Alfred',
          uid: 'admin',
          email: 'admin@admin.com',
          mailValid: true,
          structure: 'MEN',
          isactif: true,
          password: 'admin'
        })
        .then(() => {
          console.log('finished populating users');
        });
      var uT = [];
      for (var i = 0; i < 15; i++) {
        uT.push({
          provider: 'local',
          name: 'EOLE' + i,
          uid: 'eole' + i,
          surname: 'Luc',
          email: 'luc@test.com' + i,
          urlToken: 'token' + i,
          mailValid: false,
          structure: 'Education',
          isactif: false,
          isdemande: true,
          //firstdate : "2016/1/12",
          password: 'test'
        });
      }
      User.create(uT, function () {
        console.log('finished populating users eole');

        Group.find({}).remove(function () {

          User.findOne({
            uid: 'admin'
          }, function (err, UserAdmin) {

            Group.create(
	    {
              name: 'dream',
              info: 'The Dream Team',
              note: 'Bonjour le groupe Dream Team',
              type: 0,
              active: true,
              owner: UserAdmin._id,
              adminby: [UserAdmin._id],
              participants: [],
              events: [{
                title: 'The Dream Team',
                start: '2015-04-2',
                lieu: 'Dijon',
                allDay: true
              }]
            },
	   {
              name: 'eole',
              info: ' Eole Team',
              note: 'Bonjour le groupe Eole Team',
              type: 1,
              active: true,
              owner: UserAdmin._id,
              adminby: [UserAdmin._id],
              participants: [],
              events: []
            },
           {
              name: 'Private',
              info: ' Private Team',
              note: 'Bonjour le groupe Eole Team',
              type: 2,
              active: true,
              owner: UserAdmin._id,
              adminby: [UserAdmin._id],
              participants: [],
              events: []
            })
          });
        }); // Fin Groups
      });
    });
} else { // Mode Production Create first Admin if empty User
  User.count({}, function (err, count) {
    if (count == 0) {
      User.create({
          provider: 'local',
          role: 'admin',
          name: 'Administrator',
          surname: 'Alfred',
          urlToken: '',
          mailValid: true,
          structure: 'MEN',
          isactif: true,
          password: 'admin'
        })
        .then(() => {
          console.log('finished populating Administrator => Connect and change password');
        });
    }
  });
}
