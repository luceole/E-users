'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: 'This-is-my-secret',

  GOOGLE_ID: 'app-id',
  GOOGLE_SECRET: 'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',


  mail: {
  user: 'login SMTP',
  password : 'Password SMTP',
  sender: 'admin@votredomaine" ,
  host: 'Host SMTP',
  ssl: true,
  url: 'http://localhost:3000/api/users/validate/'   
}

};
