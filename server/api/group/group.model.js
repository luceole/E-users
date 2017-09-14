'use strict';

//var User = require('../user/user.model');
import User from '../user/user.model';
mongoose.Promise = require('bluebird');
var mongoosePaginate = require('mongoose-paginate');
import mongoose, {
  Schema
} from 'mongoose';


var GroupSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

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
GroupSchema.pre('save', function (next) {
  var grpId = this._id
  this.adminby.forEach(function (id) {
    console.log(id)
    var query = {
      "_id": id
    };
    var update = {
      // $push: { adminOf:{$each: [this._id]} , $position: 0}
      $addToSet: {
        adminOf: grpId
      }
    };

    User.findOneAndUpdate(query, update, function (err, user) {
      if (err) {
        console.log("erreur Admin groupe : " + err);
      }

      next(); // Continue même en erreur !?!
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
      if (err) throw err;
      if (user) {
        return respond(true);
      }
      return respond(false);
    });
  }, 'Utilsateur inconnu!!');

export default mongoose.model('Group', GroupSchema);
