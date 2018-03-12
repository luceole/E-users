'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './poll.events';

var PollSchema = new mongoose.Schema({
  name: String,
  info: String,
  isActif: Boolean,
  groupe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Groupe'
  },
  groupeInfo: String,
  groupeName: String,

  propositions: [{
    date: Date,
    stdate: String,
    sttime: []
      // ,allDay: Boolean
  }],

  resultats: [{
    user: {
      name: String,
      email: {
        type: String,
        unique: true
      }
    },
    reponses: []
  }]
    /*resultats: [{
    user: {
      name: String,
      email: String
    },
    reponses: [{
      date: Date,
      stdate: String,
      sttime: []
        // ,allDay: Boolean
      }]
}]*/
});


registerEvents(PollSchema);
export default mongoose.model('Poll', PollSchema);
