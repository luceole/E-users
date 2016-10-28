'use strict';

var app = require('../..');
import request from 'supertest';

var newMessage;

describe('Message API:', function() {
  describe('GET /api/messages', function() {
    var messages;

    beforeEach(function(done) {
      request(app)
        .get('/api/messages')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          messages = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(messages).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/messages', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/messages')
        .send({
          name: 'New Message',
          info: 'This is the brand new message!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newMessage = res.body;
          done();
        });
    });

    it('should respond with the newly created message', function() {
      expect(newMessage.name).to.equal('New Message');
      expect(newMessage.info).to.equal('This is the brand new message!!!');
    });
  });

  describe('GET /api/messages/:id', function() {
    var message;

    beforeEach(function(done) {
      request(app)
        .get(`/api/messages/${newMessage._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          message = res.body;
          done();
        });
    });

    afterEach(function() {
      message = {};
    });

    it('should respond with the requested message', function() {
      expect(message.name).to.equal('New Message');
      expect(message.info).to.equal('This is the brand new message!!!');
    });
  });

  describe('PUT /api/messages/:id', function() {
    var updatedMessage;

    beforeEach(function(done) {
      request(app)
        .put(`/api/messages/${newMessage._id}`)
        .send({
          name: 'Updated Message',
          info: 'This is the updated message!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedMessage = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedMessage = {};
    });

    it('should respond with the original message', function() {
      expect(updatedMessage.name).to.equal('New Message');
      expect(updatedMessage.info).to.equal('This is the brand new message!!!');
    });

    it('should respond with the updated message on a subsequent GET', function(done) {
      request(app)
        .get(`/api/messages/${newMessage._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let message = res.body;

          expect(message.name).to.equal('Updated Message');
          expect(message.info).to.equal('This is the updated message!!!');

          done();
        });
    });
  });

  describe('PATCH /api/messages/:id', function() {
    var patchedMessage;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/messages/${newMessage._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Message' },
          { op: 'replace', path: '/info', value: 'This is the patched message!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedMessage = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedMessage = {};
    });

    it('should respond with the patched message', function() {
      expect(patchedMessage.name).to.equal('Patched Message');
      expect(patchedMessage.info).to.equal('This is the patched message!!!');
    });
  });

  describe('DELETE /api/messages/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/messages/${newMessage._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when message does not exist', function(done) {
      request(app)
        .delete(`/api/messages/${newMessage._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
