import passport from 'passport';
import {
  Strategy
} from 'openid-client';
import config from '../../config/environment';
import sleep from 'sleep';

function retry(maxRetries, fn) {
  return fn().catch(function(err) {
    //  yield setTimeout(suspend.resume(), 1000);
    if(maxRetries <= 0) {
      throw err;
    }
    console.log('Fail to contact SSO : retry ');
    sleep.sleep(6);
    return retry(maxRetries - 1, fn);
  });
}

export function setup(User, config) {
  const Issuer = require('openid-client').Issuer;

  if(config.OauthActif) {
    var urlDiscover = `${config.openid.discover}.well-known/openid-configuration`;


    //  Issuer.discover(urlDiscover) // => Promise
    retry(20, function() {
      return Issuer.discover(urlDiscover);
    })
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
              if(err) return done(err);
              if(!user) return done(err, false, 'Compte inconnu !');
              user.openid = {
                tokenset,
                issuer: config.openid.issuer,
                client: config.openid.client
              };
              var query = {
                'uid': user.uid
              };
              var d = Date(Date.now());
              var update = {
                lastloginDate: d
              };
              console.log(d.toString() + ' login : ' + user.name);
              User.findOneAndUpdate(query, update, function(err, user) {
                if(err) {
                  console.log(err);
                }
              });
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
      });
  } else {
    console.log('Warning: OpenID not active ');
  }
}
