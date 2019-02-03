/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/params', require('./api/param'));
  app.use('/api/pads', require('./api/pad'));
  app.use('/api/groups', require('./api/group'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/polls', require('./api/poll'));
  //  app.use('/api/demandes', require('./api/demande'));

  //
  // app.get('/logout', (req, res, next) => {
  //   req.url = `/auth/${req.session.authProvider}/logout`;
  //   return next();
  // });
  //
  // app.use('/auth', (req, res, next) => {
  //   // Save the authentication provider to permit future logout forwarding
  //   //req.session.authProvider = req.path.split('/')[1];
  //   return next();
  // },
  //  require('./auth').default);
  app.use('/auth', require('./auth').default);


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
