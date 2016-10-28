'use strict';

import mongoose from 'mongoose';

var MessageSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Message', MessageSchema);
