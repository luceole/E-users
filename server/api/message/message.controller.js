/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/messages              ->  index
 * POST    /api/messages              ->  create
 * GET     /api/messages/:id          ->  show
 * PUT     /api/messages/:id          ->  upsert
 * PATCH   /api/messages/:id          ->  patch
 * DELETE  /api/messages/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Message from './message.model';
import config from '../../config/environment';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
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

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  }; return Message.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Messages
export function index(req, res) {
  var ethercalcUrl = config.ethercalc ? config.ethercalc.url : '';
  var etherpadUrl = config.etherpad ? config.etherpad.url : '';
  var etherHost = config.etherpad ? config.etherpad.host : '';
  var boardUrl = config.board ? config.board.url : '';
  var Infos = config.Infos ? config.Infos : '';
  var DeviseSite = config.DeviseSite ? config.DeviseSite : 'DeviseSite';
  var TitreSite = config.TitreSite ? config.TitreSite : 'TitreSite';
  var onlineServices = config.onlineServices ? config.onlineServices : [];
  var Structures = config.Structures ? config.Structures : [];
  return res.status(200).json({OauthActif: config.OauthActif, boardUrl, ethercalcUrl, etherpadUrl, etherHost, DeviseSite, TitreSite, onlineServices, Structures, Infos});
    // return Message.find().exec(),
    //   .then(respondWithResult(res))
    //   .catch(handleError(res));
}

// Gets a single Message from the DB
export function show(req, res) {
  return Message.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Message in the DB
export function create(req, res) {
  return Message.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Message in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Message.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Message in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Message.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Message from the DB
export function destroy(req, res) {
  return Message.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
