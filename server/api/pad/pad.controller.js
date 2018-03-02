/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/pads              ->  index
 * POST    /api/pads              ->  create
 * GET     /api/pads/:id          ->  show
 * PUT     /api/pads/:id          ->  upsert
 * PATCH   /api/pads/:id          ->  patch
 * DELETE  /api/pads/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Pad from './pad.model';

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
      // eslint-disable-next-line prefer-reflect
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
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Pads
export function index(req, res) {
  return Pad.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Pad from the DB
export function show(req, res) {
  return Pad.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Pad in the DB
export function createOri(req, res) {
  return Pad.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates session for Etherpad
export function create(req, res) {
  console.log("openPad");
  console.log(req.body);
  var args = {
    groupID: req.body.groupID,
    authorID: req.body.authorID,
    validUntil: Math.floor(Date.now() / 1000) + 6000,
  }
  etherpad.createSession(args,
    function (error, data) {
      if (error) {

        console.error('Error creating Session on PAD: ' + error.message)
      }
      else {
        console.log('New pad Session created: ' + data.sessionID)
      }
      return res.json(200, data);

    });
};



// Upserts the given Pad in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Pad.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Pad in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Pad.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Pad from the DB
export function destroy(req, res) {
  return Pad.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
