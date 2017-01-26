/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';

Thing.find({}).remove()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, ' +
        'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, ' +
        'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
        'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
        'tests alongside code. Automatic injection of scripts and ' +
        'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
        'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
        'payload, minifies your scripts/css/images, and rewrites asset ' +
        'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
        'and openshift subgenerators'
    });
  });

User.find({}).remove()
  .then(() => {
    User.create({
        provider: 'local',
        role: 'admin_grp',
        name: 'Test',
        uid: 'test',
        surname: 'User',
        email: 'test@test.com',
        urlToken: 'token',
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
        urlToken: 'token',
        mailValid: true,
        structure: 'MEN',
        isactif: true,
        password: 'admin'

      })
      .then(() => {
        console.log('finished populating users');
      });


    var uT = [];
    for (var i = 0; i < 20; i++) {
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
    User.create(uT, function() {
      console.log('finished populating users eole');
    });


  });
