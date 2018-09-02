import passport from 'passport';
import {
  Strategy as LocalStrategy
} from 'passport-local';
import email from 'emailjs/email';
import config from '../../config/environment';

function localAuthenticate(User, uid, password, done) {
  var email = uid.toLowerCase();
  User.findOne({
    //uid,
    $or: [{ uid}, { email}]
  }).exec()
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'Erreur Identification!'
        });
      }


      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, {
            message: 'Erreur Identification!'
          });
        } else if(!user.mailValid) {
          if(!email.server) {
            return done(null, false, {message: 'Compte avec courriel non validé.'});
          }
          var server = email.server.connect({
            user: config.mail.user,
            password: config.mail.password,
            host: config.mail.host,
            ssl: config.mail.ssl
          });
          server.send({
            text: `Bonjour, Ceci est un courriel de confirmation d'inscription; Pour activer votre compte cliquez sur le lien : ${config.mail.url}${user.urlToken}`,
            from: config.mail.sender,
            to: user.email,
            subject: 'Votre inscription'
          }, function(err, message) {
            console.log(err || message);
          });
          return done(null, false, {
            message: 'Compte avec courriel non validé. Message envoyé à nouveau '
          });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User /*, config*/) {
  passport.use(new LocalStrategy({
    usernameField: 'uid',
    passwordField: 'password' // this is the virtual field on the model
  }, function(uid, password, done) {
    return localAuthenticate(User, uid, password, done);
  }));
}
