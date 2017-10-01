/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/groups              ->  index
 * POST    /api/groups              ->  create
 * GET     /api/groups/:id          ->  show
 * PUT     /api/groups/:id          ->  upsert
 * PATCH   /api/groups/:id          ->  patch
 * DELETE  /api/groups/:id          ->  destroy
 */

'use strict';
import jsonpatch from 'fast-json-patch';
import Group from './group.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }
    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Groups
export function index(req, res) {
  return Group.find()
    .populate('owner', 'uid')
    .populate('participants', 'uid')
    .populate('adminby', 'uid')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
// Get list of groups of one owner

export function byowner(req, res) {
  var owner = req.query.owner;
  Group.find({
      owner: owner
    })
    .populate('participants', 'uid')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get list of open groupes
export function isopen(req, res) {
  console.log("IsOpen")
  Group.find({
      type: {
        $lt: 10
      }
    })
    .populate('owner', 'uid')
    .populate('participants', 'uid')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single Group from the DB
export function show(req, res) {
  return Group.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Group in the DB
export function create(req, res) {
  return Group.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Group in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Group.findOneAndUpdate({
      _id: req.params.id
    }, req.body, {
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Group in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Group.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Group from the DB
export function destroy(req, res) {
  return Group.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
