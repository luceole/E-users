/**
 * Pad model events
 */

'use strict';

import {EventEmitter} from 'events';
var PadEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PadEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Pad) {
  for(var e in events) {
    let event = events[e];
    Pad.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    PadEvents.emit(`${event}:${doc._id}`, doc);
    PadEvents.emit(event, doc);
  };
}

export {registerEvents};
export default PadEvents;
