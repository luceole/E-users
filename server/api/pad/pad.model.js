'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './pad.events';

var PadSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(PadSchema);
export default mongoose.model('Pad', PadSchema);
