'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './param.events';

var ParamSchema = new mongoose.Schema({
  DeviseSite: String,
  TitreSite: String,
  userRoles: Array,
  onlineServices: Array
});

registerEvents(ParamSchema);
export default mongoose.model('Param', ParamSchema);
