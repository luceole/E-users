'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import email from 'emailjs/email';

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
    select: 'uid name surname creationDate email structure isactif',
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
  /**
   * Envoie du Mail OK
   *  TODO => Faire  mecanisme de validation
   */

  var server = email.server.connect({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    ssl: config.mail.ssl
  });

  server.send({
     text:    "Bonjour, Ceci est un courriel de confirmation d'inscription",
     from:    config.mail.sender,
     to:      newUser.email,
     subject: "Votre inscription"
  }, function(err, message) { console.log(err || message); });

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
