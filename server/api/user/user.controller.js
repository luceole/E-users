'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import email from 'emailjs/email';
import randtoken from 'rand-token';
import discourse_sso from 'discourse-sso';

var _ = require('lodash');

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

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  console.log("Serveur User")
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
   * Envoie du Mail
   */

  var server = email.server.connect({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    ssl: config.mail.ssl
  });

  server.send({
    text: "Bonjour, Ceci est un courriel de confirmation d'inscription; Pour activer votre compte cliquez sur le lien : " + config.mail.url + newUser.urlToken,
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
    //   res.send('hello '+user.surname+'. Votre mail est validé.');

    user.mailValid = true;
    user.save(function(err) {
      res.set('Content-Type', 'text/html');
      res.send(new Buffer('<p>hello ' + user.surname + '. <br>Votre mail est validé.<br></p> <a href="config.mail.site>Connexion</a>'));
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
  User.findById(req.params.id, function(err, user) {
    //if (err) { return handleError(res, err); }
    if (err) {
      return err;
    }
    if (!user) {
      return res.send(404);
    }
    //  console.log("--------- USER ---------------");
    //  console.log(req.body)
    var updated = new User(_.merge(user, req.body));
    updated.isactif = req.body.isactif;
    updated.isdemande = false;
    user.save(function(err) {
      //if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
}



// SSO Discourse
exports.discourseSso = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  console.log("server discourseSso " + req.params.id);
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      console.log("user not find")
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
        "username": user.name
      };
      var q = sso.buildLoginString(userparams);
      var url=config.discourse_sso.url+q;
      var reponse = {
        sso: q,
        url: url
      };
      return res.json(200, reponse);
    }
  });
}




// Updates ME
exports.updateMe = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  console.log("server updateMe ");
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      return res.send(404);
    }
    var newUser = new User(req.body);
    user.name = newUser.name;
    user.surname = newUser.surname;
    user.structure = newUser.structure;
    user.email = newUser.email;
    user.save(function(err) {
      //if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
};

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
            res.status(204).end();
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
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
