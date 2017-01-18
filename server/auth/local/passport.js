import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, uid, password, done) {
  console.log(uid+ " "+password);
  User.findOne({
    uid: uid,
    mailValid: true
  }).exec()
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'Erreur Identification'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'Erreur Identification' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new LocalStrategy({
    usernameField: 'uid',
    passwordField: 'password' // this is the virtual field on the model
  }, function(uid, password, done) {
    return localAuthenticate(User, uid, password, done);
  }));
}
