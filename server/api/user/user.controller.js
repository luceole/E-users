'use strict';

import User from './user.model';
import jsonpatch from 'fast-json-patch';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import email from 'emailjs/email';
import randtoken from 'rand-token';
import discourse_sso from 'discourse-sso';

var _ = require('lodash');
// var server = email.server.connect({
//   user: config.mail.user,
//   password: config.mail.password,
//   host: config.mail.host,
//   ssl: config.mail.ssl
// });



function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }
    return entity.save();
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function sendM(user) {

  var server = email.server.connect({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    ssl: config.mail.ssl
  });

  server.send({
    text: "Bonjour, Pour changer votre mot de passe  cliquez sur le lien : " + config.mail.site + "/resetpwd/" + user.pwdToken,
    from: config.mail.sender,
    to: user.email,
    subject: "Perte de votre mot de passe"
  }, function(err, message) {
    console.log(err || message);
  });

}
/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  //  console.log("Serveur User")
  return User.find({}, '-salt -password').exec()
    .then(users => {

      res.status(200).json(users);
    })
    .catch(handleError(res));
}

exports.demandes = function(req, res) {
  var query = {
    isdemande: true
  };
  var page = req.query.page;
  //console.log("Serveur Demandes page=>"+page);
  var options = {
    select: 'uid name surname creationDate email structure isactif mailValid',
    page: page,
    limit: 12,
    sort: "email"
  };

  return User.paginate(query, options, function(err, result) {
    //console.log(result);
    if (err) return res.send(500, err);
    res.json(200, {
      docs: result.docs,
      total: result.total
    });
  });
}


/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.urlToken = randtoken.generate(16);
  newUser.mailValid = false;
  newUser.isdemande = true;
  /**
   * Envoie du Mail de confirmation
   */
  var server = email.server.connect({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    ssl: config.mail.ssl
  });
  server.send({
    text: "Bonjour, Ceci est un courriel de confirmation d'inscription; Pour activer votre compte cliquez sur le lien : " + config.mail.url  + newUser.urlToken,
    from: config.mail.sender,
    to: newUser.email,
    subject: "Votre inscription"
  }, function(err, message) {
    console.log(err || message);
  });

  newUser.save()
    .then(function(user) {
      var token = jwt.sign({
        _id: user._id
      }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({
        token
      });
    })
    .catch(validationError(res));
}
/**
 * Valid Mail of new User
 **/
export function validEmail(req, res) {
  //  console.log(req.params);
  var urlToken = req.params[0];
  User.findOne({
    urlToken: urlToken
  }, '-salt -hashedPassword', function(err, user) {
    if (!user) return res.send(404);
    user.mailValid = true;
    // Ajouter Validation automatique si Domaine mail dans la liste blanche
    user.save(function(err) {
      res.set('Content-Type', 'text/html');
      res.send(new Buffer('<p>hello ' + user.surname + '. <br>Votre mail est validé.<br></p> <a href="' + config.mail.site + '">Connexion</a>'));
    })
  });
}

/**
 * Lost Password
 **/
export function lostPassword(req, res) {

  var email = req.query.email;
  console.log("Lost PWD =>" + email);
  if (!email) return res.sendStatus(404);
  return User.findOne({
      email: email
    }).exec()
    .then(user => {
      if (!user) return res.sendStatus(404);
      user.pwdToken = randtoken.generate(16)
      console.log(user)
      user.save()
        .then(user => {
          sendM(user);
          return res.sendStatus(204);
        })
        .catch(validationError(res));
    })
}


export function resetPassword(req, res) {

  var pwdToken = req.body.pwdToken;
  console.log(pwdToken)
  if (!pwdToken) return res.sendStatus(404);
  var newPass = String(req.body.newPassword);
  User.findOne({
      pwdToken: pwdToken
    }).exec()
    .then(user => {
      if (!user) return res.sendStatus(404);
      console.log("ReInit PASSWD" + user.name)
      user.password = newPass;
      console.log("ReInit PASSWD" + user.password)
      user.pwdToken = '';
      return user.save()
        .then(() => {
          var token = jwt.sign({
            _id: user._id
          }, config.secrets.session, {
            expiresIn: 60 * 60 * 5
          });
          res.json({
            token
          });
          return res.status(200).end();
        })
    });
}


/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;
  return User.findById(userId).exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 *  Update a user
 *
 */
// Updates an existing user. (prop isactif)
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  console.log(req.body)
  // return User.findById(req.params.id).exec()
  //   .then(handleEntityNotFound(res))
  //   .then(patchUpdates(req.body))
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));

  return User.findById(req.params.id).exec()
    .then(user => {
      var updated = _.merge(user, req.body);
      updated.isdemande = false;
      updated.isactif = req.body.isactif;
      return updated.save()
        .then(user => {
          //console.log(user)
          //res.status(200).json(user);
          res.status(204).end();
        })
        .catch(validationError(res));
    });
}



// SSO Discourse
exports.discourseSso = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  //  console.log("server discourseSso " + req.params.id);

  User.findById(req.params.id, function(err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      //  console.log("user not find")
      return res.send(404);
    }
    if (!user.isactif) {
      return res.send(404);
    }

    var sso = new discourse_sso(config.discourse_sso.secret); // Mettre en config :-)
    var payload = String(req.body.sso);
    var sig = String(req.body.sig);
    //console.log("payload=" + payload);
    //console.log("sig=" + sig)
    if (sso.validate(payload, sig)) {
      //console.log("sso valide secret="+config.discourse_sso.secret)
      var nonce = sso.getNonce(payload);
      var userparams = {
        // Required, will throw exception otherwise
        "nonce": nonce,
        "external_id": user.uid,
        "email": user.email,
        // Optional
        "username": user.name,
        "name": user.surname + " " + user.name,
        "admin": (user.role == "admin")
      };
      var q = sso.buildLoginString(userparams);
      var url = config.discourse_sso.url + q;
      var reponse = {
        sso: q,
        url: url
      };
      return res.json(200, reponse);
    }
  });
}




// Self Update
export function updateMe(req, res) {
  var userId = req.user._id;
  var newUser = new User(req.body);
  var MailChange = false;

  return User.findById(userId).exec()
    .then(user => {
      user.name = newUser.name;
      user.surname = newUser.surname;
      user.structure = newUser.structure;
      if (user.email != newUser.email) {
        MailChange = true;
        newUser.urlToken = randtoken.generate(16);
        user.email = newUser.email;
        user.urlToken = newUser.urlToken;
        user.mailValid = false;
      }
      return user.save()
        .then(user => {
          if (MailChange) {
            var server = email.server.connect({
              user: config.mail.user,
              password: config.mail.password,
              host: config.mail.host,
              ssl: config.mail.ssl
            });
            server.send({
                text: "Bonjour, Ceci est un courriel de confirmation suite à la modification de votre courriel; Pour ré-activer votre compte cliquez sur le lien : " + config.mail.url + newUser.urlToken,
                from: config.mail.sender,
                to: user.email,
                subject: "Votre inscription"
              },
              function(err, message) {
                console.log(err || message);
              });
          }
          res.status(204).end();
        })
        .catch(validationError(res));
    });
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            return res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({
      _id: userId
    }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      return res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
