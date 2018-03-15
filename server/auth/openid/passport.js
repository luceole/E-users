import passport from 'passport';
import {Strategy} from 'openid-client';
import config from '../../config/environment';
export function setup(User, config) {
  const Issuer = require('openid-client').Issuer;
  if(config.OauthActif) {
    Issuer.discover(config.openid.discover) // => Promise
  .then(function(myIssuer) {
    console.log('OPenID: Discovered issuer %s', myIssuer.issuer);
    const client = new myIssuer.Client({
      client_id: config.openid.client.client_id,
      client_secret: config.openid.client.client_secret,
    }); // => Client

    passport.use('openid', new Strategy({
      client,
      params: {
        redirect_uri: config.openid.client.redirect_uris,
        scope: 'openid profile email'
      },
    }, function(tokenSet, userInfo, done) {
      User.findOne({email: userInfo.email}).exec()
      .then(user => {
        if(!user) return done(null, false, 'Compte inconnu !');
        user.openid = {tokenSet, issuer: config.openid.issuer, client: config.openid.client };
        return done(null, user);
      })
      .catch(err => done(err));
    }));
  });
  }
  else { console.log('Warning: OpenID not active ');}
}
