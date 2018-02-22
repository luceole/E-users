/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';

import User from './api/user/user.model';

// Etherpad ?
global.etherpad = false;
if (config.etherpad) {
  var ether_api = require('etherpad-lite-client');

  global.etherpad = ether_api.connect({
    apikey: config.etherpad.apikey,
    host: config.etherpad.host,
    port: config.etherpad.port,
  });
    console.log(" - Link Etherpad=" + config.etherpad.host + ":" + config.etherpad.port)
    console.log(global.etherpad);
}

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Populate databases with sample data
if (config.seedDB) {
  require('./config/seed');
}
// Setup server
var app = express();
app.use(cors());
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);
User.count({}, function(err, count){
    console.log( "Number of User: ", count );
});
// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));


  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
