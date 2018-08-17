'use strict';

import User from './user.model';
import Group from '../group/group.model';

import jsonpatch from 'fast-json-patch';
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

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }
    return entity.save();
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
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
    text: `Bonjour, Pour changer votre mot de passe  cliquez sur le lien : ${config.mail.site}/resetpwd/${user.pwdToken}`,
    from: config.mail.sender,
    to: user.email,
    subject: 'Perte de votre mot de passe'
  }, function(err, message) {
    console.log(err || message);
  });
}

export function index(req, res) {
  return User.find({}, '-salt -password')
    .populate('memberOf', 'name info note digest groupPadID')
    .populate('adminOf', 'name info  groupPadID ')
    .exec()
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function listadmgrp(req, res) {
  return User.find({
    role: {
      $in: ['admin', 'admin_grp']
    },
  }, '-salt -password', ).exec()
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function listadmin(req, res) {
  return User.find({
    role: {
      $in: ['admin']
    },
  }, '-salt -password', ).exec()
    .then(users => {
      return res.status(200).json(users);
    })
    .catch(handleError(res));
}


export function demandes(req, res) {
  var query = {
    isdemande: true
  };
  var page = req.query.page;
  var options = {
    select: 'uid name surname creationDate email structure isactif mailValid',
    page,
    limit: 12,
    sort: 'email'
  };

  return User.paginate(query, options, function(err, result) {
    if(err) return res.send(500, err);
    res.json(200, {
      docs: result.docs,
      total: result.total
    });
  });
}

export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.urlToken = randtoken.generate(16);
  newUser.mailValid = false;
  newUser.isdemande = true;
  newUser.authorPadID = '';
  /**
   * Envoie du Mail de confirmation
   */
  // var server = email.server.connect({
  //   user: config.mail.user,
  //   password: config.mail.password,
  //   host: config.mail.host,
  //   ssl: config.mail.ssl
  // });
  // var whiteDomain = /^ac\-[a-z\-]*\.fr/;
  // var domaineMail = newUser.email.split('@')[1]
  // console.log(whiteDomain.test(domaineMail) )
  //  whiteDomain = /^[a-z\-]*\.gouv\.fr/;
  //  console.log(whiteDomain.test(domaineMail) ).j

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
      var server = email.server.connect({
        user: config.mail.user,
        password: config.mail.password,
        host: config.mail.host,
        ssl: config.mail.ssl
      });
      server.send({
        text: `Bonjour, Ceci est un courriel de confirmation d'inscription; Pour activer votre compte cliquez sur le lien : ${config.mail.url}${newUser.urlToken}`,
        from: config.mail.sender,
        to: newUser.email,
        subject: 'Votre inscription'
      }, function(err, message) {
        console.log(err || message);
      });
    })
    .catch(validationError(res));
}
/**
 * Valid Mail of new User
 **/
export function validEmail(req, res) {
  var urlToken = req.params[0];
  User.findOne({
    urlToken
  }, '-salt -hashedPassword', function(err, user) {
    user.mailValid = true;
    // Validation automatique si Domaine mail dans la liste blanche
    var domaineMail = user.email.split('@')[1];
    //Put  whiteDomain in config ?
    var whiteDomain1 = /^ac-[a-z\-]*\.fr/;
    var whiteDomain2 = /^[a-z\-]*\.gouv\.fr/;
    if((whiteDomain1.test(domaineMail)) || (whiteDomain2.test(domaineMail))) {
      user.isdemande = false;
      user.isactif = true;
      console.log('Validation auto :' + user.email);
    } else {
      var server = email.server.connect({
        user: config.mail.user,
        password: config.mail.password,
        host: config.mail.host,
        ssl: config.mail.ssl
      });
      server.send({
        text: `Bonjour, vous avez une nouvelle demande de validation de ${user.email} (${user.surname} ${user.name}) sur le site :${config.mail.site}`,
        from: config.mail.sender,
        to: config.mail.sender,
        subject: 'E-User : Nouvelle Demande'
      }, function(err, message) {
        console.log(err || message);
      });
    }
    user.save(function(err) {
      res.set('Content-Type', 'text/html');
      res.send(new Buffer(`<p>hello ${user.surname}. <br>Votre mail est validé.<br></p> <a href="${config.mail.site}">Connexion</a>`));
    });
  });
}

/**
 * Lost Password
 **/
export function lostPassword(req, res) {
  var email = req.query.email;
  console.log(`Lost PWD =>${email}`);
  if(!email) return res.sendStatus(404);
  return User.findOne({
    email
  }).exec()
    .then(user => {
      if(!user) return res.sendStatus(404);
      user.pwdToken = randtoken.generate(16);
      user.save()
        .then(user => {
          sendM(user);
          return res.sendStatus(204);
        })
        .catch(validationError(res));
    });
}


export function resetPassword(req, res) {
  var pwdToken = req.body.pwdToken;
  if(!pwdToken) return res.sendStatus(404);
  var newPass = String(req.body.newPassword);
  User.findOne({
    pwdToken
  }).exec()
    .then(user => {
      if(!user) return res.sendStatus(404);
      console.log(`ReInit PASSWD${user.name}`);
      user.password = newPass;
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
        });
    });
}


/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;
  return User.findById(userId, '-salt -hashedPassword')
    .populate('memberOf', 'name info note digest groupPadID')
    .populate('adminOf', 'info note groupPadID name')
    .exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

export function me(req, res, next) {
  var userId = req.user._id;
  return User.findOne({
    _id: userId
  }, '-salt -password')
    .populate('memberOf', 'name info note digest groupPadID')
    .populate('adminOf', 'name info  groupPadID ')
    .exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      return res.json(user);
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
      return res.status(204).end();
    })
    .catch(handleError(res));
}

export function update(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
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
          //res.status(200).json(user);
          return res.status(204).end();
        })
        .catch(validationError(res));
    });
}
export function usersupgroup(req, res) {
  var listusers = req.body.listusers;
  var idgrp = req.body.idgrp;
  //console.log('del memberOf');
  listusers.forEach(function(userId) {
    User.findById(userId).exec()
        .then(user => {
          user.memberOf.pull(idgrp);
          user.save();
        });
  });
}
export function usersupcandidat(req, res) {
  var listusers = req.body.listusers;
  var idgrp = req.body.idgrp;
  //console.log('del candidat');
  listusers.forEach(function(userId) {
    User.findById(userId).exec()
        .then(user => {
          user.candidatOf.pull(idgrp);
          user.save();
        });
  });
}
//export function useraddcandidat(req, res) {
  // var listusers = req.body.listusers;
  // var idgrp = req.body.idgrp;
  // console.log('add candidat to groupe');
  // listusers.forEach(function(userId) {
  //   User.findById(userId).exec()
  //       .then(user => {
  //         user.candidatOf.pull(idgrp);
  //         user.memberOf.push(idgrp);
  //         user.save();
  //       });
  // });
//}
export function useradmingroup(req, res) {
  var listusers = req.body.listusers;
  var idgrp = req.body.idgrp;

  listusers.forEach(function(userId) {
    //console.log(`grp=${idgrp}`);
    User.findById(userId, function(err, user) {
      if(err) {
        return err;
      }
      user.adminOf.pull(idgrp);
      user.save(function(err) {
        if(err) {
          return err;
        }
        return res.status(200).end();
      });
    });
  });
}

// Revoir le coté "transaction" de la double ecriture.  Utilser le middleware pre(save) ?


export function addusergroup(req, res) {
  var userId = req.params.id;
  var groupId = String(req.body.idGroup);
  return User.findById(userId, '-salt -hashedPassword')
    .populate('memberOf', 'info')
    .exec()
    .then(user => {
      user.memberOf.push(groupId);
      return user.save()
        .then(user => {
          Group.findById(groupId, function(err, group) {
            if(err) {
              console.log(err);
              return err;
            }
            group.participants.push(userId);
            group.save(function(err) {
              if(err) {
                console.log(err);
              }
            });
          });
          return res.status(200).json(user);
        });
      //return res.status(200).json(user)
    });
}

export function candidatusergroup(req, res) {
  var userId = req.params.id;
  var groupId = String(req.body.idGroup);
  return User.findById(userId, '-salt -hashedPassword')
  //  .populate('memberOf', 'info')
    .exec()
    .then(user => {
      user.candidatOf.push(groupId);
      return user.save()
        .then(user => {
          Group.findById(groupId, function(err, group) {
            if(err) {
              console.log(err);
              return err;
            }
            group.demandes.push(userId);
            group.save(function(err) {
              if(err) {
                console.log(err);
              }
            });
          });
          return res.status(200).json(user);
        });
      //return res.status(200).json(user)
    });
}
export function delusergroup(req, res) {
  var userId = req.params.id;
  var groupId = String(req.body.idGroup);
  return User.findById(userId, '-salt -hashedPassword')
    .populate('memberOf', 'info')
    .exec()
    .then(user => {
      user.memberOf.pull(groupId);
      return user.save()
        .then(user => {
          Group.findById(groupId, function(err, group) {
            if(err) {
              console.log(err);
              return err;
            }
            group.participants.pull(userId);
            group.save(function(err) {
              if(err) {
                console.log(err);
              }
            });
          });
          return res.status(200).json(user);
        });
      //  return res.status(200).json(user)
    });
}


export function nocandidatusergroup(req, res) {
  var userId = req.params.id;
  var groupId = String(req.body.idGroup);
  return User.findById(userId, '-salt -hashedPassword')
    .populate('memberOf', 'info')
    .exec()
    .then(user => {
      user.candidatOf.pull(groupId);
      return user.save()
        .then(user => {
          Group.findById(groupId, function(err, group) {
            if(err) {
              console.log(err);
              return err;
            }
            group.demandes.pull(userId);
            group.save(function(err) {
              if(err) {
                console.log(err);
              }
            });
          });
          return res.status(200).json(user);
        });
      //  return res.status(200).json(user)
    });
}

export function discourseSso(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  User.findById(req.params.id, function(err, user) {
    if(err) {
      return handleError(res, err);
    }
    if(!user) {
      return res.send(404);
    }
    if(!user.isactif) {
      return res.send(404);
    }
    var sso = new discourse_sso(config.discourse_sso.secret);
    var payload = String(req.body.sso);
    var sig = String(req.body.sig);
    if(sso.validate(payload, sig)) {
      var nonce = sso.getNonce(payload);
      var userparams = {
        // Required, will throw exception otherwise
        nonce,
        external_id: user.uid,
        email: user.email,
        // Optional
        username: user.name,
        name: `${user.surname} ${user.name}`,
        admin: user.role == 'admin'
      };
      var q = sso.buildLoginString(userparams);
      var url = config.discourse_sso.url + q;
      var reponse = {
        sso: q,
        url
      };
      return res.json(200, reponse);
    }
  });
}

export function updateMe(req, res) {
  var userId = req.user._id;
  var newUser = new User(req.body);
  var MailChange = false;
  return User.findById(userId).exec()
    .then(user => {
      user.name = newUser.name;
      user.surname = newUser.surname;
      user.structure = newUser.structure;
      if(user.email != newUser.email) {
        MailChange = true;
        newUser.urlToken = randtoken.generate(16);
        user.email = newUser.email;
        user.urlToken = newUser.urlToken;
        user.mailValid = false;
      }
      return user.save()
        .then(user => {
          if(MailChange) {
            var server = email.server.connect({
              user: config.mail.user,
              password: config.mail.password,
              host: config.mail.host,
              ssl: config.mail.ssl
            });
            server.send({
              text: `Bonjour, Ceci est un courriel de confirmation suite à la modification de votre courriel; Pour ré-activer votre compte cliquez sur le lien : ${config.mail.url}${newUser.urlToken}`,
              from: config.mail.sender,
              to: user.email,
              subject: 'Votre inscription'
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

export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => res.status(204).end())
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}


export function authCallback(req, res) {
  res.redirect('/');
}
