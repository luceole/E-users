'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

// See config/environment for this 3 parameters
//DeviseSite : "Eco-système Logiciels Libres ",
//TitreSite  : "Libre Communaute",
//OauthActif :  false,

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: 'This-is-my-secret',

  GOOGLE_ID: 'app-id',
  GOOGLE_SECRET: 'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',


  mail: {
    user: 'login SMTP',
    password: 'Password SMTP',
    sender: 'admin@mydomaine',
    host: 'Host SMTP',
    ssl: true,
    site: 'http://localhost:3000',
    url: 'http://localhost:3000/api/users/validate/'
  },

  discourse_sso: {
    secret: '1234567890',
    url: 'http://mydiscourse.domain.lan/session/sso_login?'
  },
  OauthActif: true,
  openid: {
    discover: 'https://server.mondomaine.fr/.well-known/openid-configuration',
    issuer: {
      issuer: 'https://server.mondomaine.fr/auth/realms/sso/',
    //   authorization_endpoint: `${process.env.OPENID_ISSUER}/auth`,
    //   token_endpoint: `${process.env.OPENID_ISSUER}/token`,
    //   userinfo_endpoint: `${process.env.OPENID_ISSUER}/userinfo`,
    //   jwks_uri: `${process.env.OPENID_ISSUER}/certs`,
    //   end_session_endpoint: `${process.env.OPENID_ISSUER}/logout`
    },
    client: {
      client_id: 'e-users',
      client_secret: '...................................',
      redirect_uris: [`${process.env.DOMAIN || ''}/auth/openid/callback`],
    }
  }


};
