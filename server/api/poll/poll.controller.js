/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/polls              ->  index
 * POST    /api/polls              ->  create
 * GET     /api/polls/:id          ->  show
 * PUT     /api/polls/:id          ->  upsert
 * PATCH   /api/polls/:id          ->  patch
 * DELETE  /api/polls/:id          ->  destroy
 */

'use strict';


import jsonpatch from 'fast-json-patch';
import Poll from './poll.model';

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

// Gets a list of Polls
export function index(req, res) {
  return Poll.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

exports.mypolls = function(req, res) {
  //console.log(req.query);
  returnPoll.find({
    isActif: true,
    groupeName: {
      $in: req.query.mygrp
    }}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};


// Gets a single Poll from the DB
export function show(req, res) {
  return Poll.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Poll in the DB
export function create(req, res) {
  console.log('create');
  console.log(req.body);
  return Poll.create(req.body).then(respondWithResult(res, 201))
      .catch(handleError(res));
}

// Upserts the given Poll in the DB at the specified ID
export function upsert(req, res) {
  console.log('upsert');
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Poll.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Poll in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Poll.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function mypolls(req, res) {
  console.log(req.query);
    /* var grp = [];
    req.query.mygrp.forEach(function (v) {
      grp.push(new ObjectId(v));
    })
    console.log(grp)*/
  Poll.find({
    isActif: true,
    groupeName: {
      $in: req.query.mygrp
    }
  }, function(err, polls) {
    if(err) {
      console.log(err);
      return handleError(res, err);
    }
    return res.status(200).json(polls);
  });
}

// vote an existing poll in the DB.
exports.vote = function(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  Poll.findById(req.params.id, function(err, poll) {
    if(err) {
      return handleError(res, err);
    }
    if(!poll) {
      return res.status(404).send('Not Found');
    }
    console.log('VOTE');
    var updated = _.findLastIndex(poll.resultats, function(v) {
      return v.user.email == req.body.vote.user.email;
    });
    console.log(updated);
    if(updated == -1) {
      console.log('Nouveau');
      poll.resultats.push(req.body.vote);
    } else {
      console.log('Modif');
      poll.resultats[updated].reponses = req.body.vote.reponses;
    }
    console.log(poll.resultats);
    poll.save(function(err) {
      if(err) {
        return handleError(res, err);
      }
      return res.status(200).json(poll);
    });
  });
};


// Deletes a Poll from the DB
export function destroy(req, res) {
  return Poll.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
