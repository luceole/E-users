import passport from 'passport';
import {
  Strategy
} from 'openid-client';
import config from '../../config/environment';

export function setup(User, config) {
  const Issuer = require('openid-client').Issuer;

  if (config.OauthActif) {
    var urlDiscover = `${config.openid.discover}.well-known/openid-configuration`;
    Issuer.discover(urlDiscover) // => Promise
      .then(function(myIssuer) {
        console.log('OPenID: Discovered issuer %s', myIssuer.issuer);
        const client = new myIssuer.Client({
          client_id: config.openid.client.client_id,
          client_secret: config.openid.client.client_secret,
        }); // => Client
        client.CLOCK_TOLERANCE = 5;
        passport.use('openid', new Strategy({
          client,
          params: {
            redirect_uri: config.openid.client.redirect_uris,
            scope: 'openid profile email',
            nonce: config.openid.nonce
          }
          // [passReqToCallback],
          // [usePKCE]
        }, (tokenset, userinfo, done) => {
          // console.log('tokenset', tokenset);
          // console.log('access_token', tokenset.access_token);
          // console.log('id_token', tokenset.id_token);
          // console.log('claims', tokenset.claims);
          // console.log('userinfo', userinfo);

          User.findOne({
              email: userinfo.email
            },
            function(err, user) {
              if (err) return done(err);
              if (!user) return done(err, false, 'Compte inconnu !');
              user.openid = {
                tokenset,
                issuer: config.openid.issuer,
                client: config.openid.client
              };
              return done(null, user);
            });
        }));
      })


      //   passport.use('openid', new Strategy({
      //     client,
      //     params: {
      //       redirect_uri: config.openid.client.redirect_uris,
      //       scope: 'openid profile email',
      //       nonce: config.openid.nonce
      //     },&client_id=grp
      //   }, function(tokenSet,  userInfo, done) {
      //     User.findOne({email: userInfo.email}).exec()
      //     .then(user => {
      //       if(!user) return done(null, false, 'Compte inconnu !');
      //       user.openid = {tokenSet, issuer: config.openid.issuer, client: config.openid.client };
      //       return done(null, user);
      //     })
      //        .catch(err => done(err));
      //   }));
      // })
      .catch(err => {
        console.log('Le serveur Oauth ne répond pas : ' + urlDiscover);
        return err;
      })
  } else {
    console.log('Warning: OpenID not active ');
  }
}