'use strict';

import User from '../user/user.model';
mongoose.Promise = require('bluebird');
var mongoosePaginate = require('mongoose-paginate');
import mongoose, {
  Schema
} from 'mongoose';
const crypto = require('crypto');
var config = require('../../config/environment');
var EventSchema = new Schema({
  title: String,
  start: Date,
  end: Date,
  allDay: Boolean,
  info: String,
  lieu: String,
  groupe: String,
  eventPadID: String,
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

var GroupSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  info: String,
  note: String,
  active: Boolean,
  groupPadID: String,
  digest: String,
  type: Number, // 0 Ouvert, 5 Modéré, 10 Fermé
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true

  },
  adminby: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  demandes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  events: [EventSchema]
});

/**
 * MiddleWare
 */


// Modify User adminOf
GroupSchema.pre('save', function (next) {
  var grpId = this._id;
  if(this.isModified('adminby')) {
    this.adminby.forEach(function (id) {
      var query = {
        "_id": id
      };
      var update = {
        $addToSet: {
          adminOf: grpId
        }
      };
      User.findOneAndUpdate(query, update, function (err, user) {
        if(err) {
          console.log("erreur Adminby  : " + err);
        }
        return next(); // Always go on !
      });
    });
  }
  return next(); // Always go on !
});

//.pre(save) for EtherCalc
GroupSchema.pre('save', function (next) {
  const secret = "secret"; // Mettre en fichier local.env.js
  const hash = crypto.createHmac('sha256', secret)
    .update(this.name)
    .digest('hex');
  this.digest = hash;
  return next();
});


//.pre(save) for EtherPad
GroupSchema.pre('save', function (next) {
  //  Digest Ethercalc

  if(config.etherpad) {
    var groupID = this.groupPadID;
    if(groupID != undefined) {
      return next();
    }
    etherpad.createGroup((error, data) => {
      //etherpad.createGroupIfNotExistsFor({groupMapper: groupID},(error, data) => {
      if(error) console.error('Error creating group: ' + groupID + ' ' + error.message);
      else {
        this.groupPadID = data.groupID;
        var args = {
          groupID: data.groupID,
          padName: this.name,
          text: 'Bienvenu sur le PAD du groupe ' + this.name
        };
        etherpad.createGroupPad(args, (error, data) => {
          if(error) console.error('Error creating pad: ' + error.message);
          else {
            console.log('New pad for group' + this.name + ' created: ' + data.padID);
          }
        });
      }
      return next(); // Always create Group
    });
  } else
    return next();
});

GroupSchema.pre('remove', function (next) {
  var grpId = this._id;
  this.adminby.forEach(function (id) {
    var query = {
      "_id": id
    };
    var update = {
      $addToSet: {
        adminOf: grpId
      }
    };
    User.findOneAndUpdate(query, update, function (err, user) {
      if(err) {
        console.log("erreur Adminby : " + err);
      }
      return next(); // Always go on !
    });
  });
});
/**
 * Validations
 */
GroupSchema
  .path('name')
  .validate(function (name) {
    return name.length;
  }, 'Nom de groupe obligatoire');

GroupSchema
  .path('owner')
  .validate(function (owner) {
    return owner.length;
  }, 'Propriétaire obligatoire');

GroupSchema
  .path('owner')
  .validate(function (value, respond) {
    var self = this;
    //console.log(value)
    User.findById(value, function (err, user) {
      if(err) throw err;
      if(user) {
        return respond(true);
      }
      return respond(false);
    });
  }, 'Utilsateur inconnu!!');

export default mongoose.model('Group', GroupSchema);
