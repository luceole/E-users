import passport from 'passport';
import {Strategy, Issuer} from 'openid-client';

export function setup(User, config) {
  const issuer = new Issuer(config.openid.issuer);
  const client = new issuer.Client(config.openid.client);

  passport.use('openid', new Strategy({
    client,
    params: {
      scope: 'openid profile email'
    },
  }, function(tokenSet, userInfo, done) {
	  console.log(userInfo);
    User.findOne({email: userInfo.email}).exec()
      .then(user => {
        if(!user) return done(null, false, 'Compte inconnu !');
        user.openid = {tokenSet, issuer: config.openid.issuer, client: config.openid.client };
        return done(null, user);
      })
      .catch(err => done(err));
  }));
}
