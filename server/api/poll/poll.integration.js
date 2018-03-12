'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPoll;

describe('Poll API:', function() {
  describe('GET /api/polls', function() {
    var polls;

    beforeEach(function(done) {
      request(app)
        .get('/api/polls')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          polls = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(polls).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/polls', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/polls')
        .send({
          name: 'New Poll',
          info: 'This is the brand new poll!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPoll = res.body;
          done();
        });
    });

    it('should respond with the newly created poll', function() {
      expect(newPoll.name).to.equal('New Poll');
      expect(newPoll.info).to.equal('This is the brand new poll!!!');
    });
  });

  describe('GET /api/polls/:id', function() {
    var poll;

    beforeEach(function(done) {
      request(app)
        .get(`/api/polls/${newPoll._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          poll = res.body;
          done();
        });
    });

    afterEach(function() {
      poll = {};
    });

    it('should respond with the requested poll', function() {
      expect(poll.name).to.equal('New Poll');
      expect(poll.info).to.equal('This is the brand new poll!!!');
    });
  });

  describe('PUT /api/polls/:id', function() {
    var updatedPoll;

    beforeEach(function(done) {
      request(app)
        .put(`/api/polls/${newPoll._id}`)
        .send({
          name: 'Updated Poll',
          info: 'This is the updated poll!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPoll = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPoll = {};
    });

    it('should respond with the updated poll', function() {
      expect(updatedPoll.name).to.equal('Updated Poll');
      expect(updatedPoll.info).to.equal('This is the updated poll!!!');
    });

    it('should respond with the updated poll on a subsequent GET', function(done) {
      request(app)
        .get(`/api/polls/${newPoll._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let poll = res.body;

          expect(poll.name).to.equal('Updated Poll');
          expect(poll.info).to.equal('This is the updated poll!!!');

          done();
        });
    });
  });

  describe('PATCH /api/polls/:id', function() {
    var patchedPoll;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/polls/${newPoll._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Poll' },
          { op: 'replace', path: '/info', value: 'This is the patched poll!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPoll = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPoll = {};
    });

    it('should respond with the patched poll', function() {
      expect(patchedPoll.name).to.equal('Patched Poll');
      expect(patchedPoll.info).to.equal('This is the patched poll!!!');
    });
  });

  describe('DELETE /api/polls/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/polls/${newPoll._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when poll does not exist', function(done) {
      request(app)
        .delete(`/api/polls/${newPoll._id}`)
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
