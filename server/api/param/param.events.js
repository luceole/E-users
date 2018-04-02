/**
 * Param model events
 */

'use strict';

import {EventEmitter} from 'events';
var ParamEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ParamEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Param) {
  for(var e in events) {
    let event = events[e];
    Param.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    ParamEvents.emit(event + ':' + doc._id, doc);
    ParamEvents.emit(event, doc);
  };
}

export {registerEvents};
export default ParamEvents;
