import passport from 'passport';
import {Strategy} from 'openid-client';

export function setup(User, config) {
  //console.log(config.openid);
  //const issuer = new Issuer(config.openid.issuer);
  //const client = new issuer.Client(config.openid.client);
  const Issuer = require('openid-client').Issuer;
  Issuer.discover(config.openid.discover) // => Promise
  .then(function(myIssuer) {
    console.log('OPenID: Discovered issuer %s', myIssuer.issuer);
    const client = new myIssuer.Client({
    // client_id: 'e-users',
    // client_secret: '4428b8ef-7aac-4f92-aa51-b83d6bf30d92'
      client_id: config.openid.client.client_id,
      client_secret: config.openid.client.client_secret

    }); // => Client

    passport.use('openid', new Strategy({
      client,
      params: {
        redirect_uri: 'http://localhost:3000/auth/openid/callback',
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
