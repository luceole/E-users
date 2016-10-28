/**
 * Message model events
 */

'use strict';

import {EventEmitter} from 'events';
import Message from './message.model';
var MessageEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
MessageEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Message.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    MessageEvents.emit(event + ':' + doc._id, doc);
    MessageEvents.emit(event, doc);
  };
}

export default MessageEvents;
