'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPad;

describe('Pad API:', function() {
  describe('GET /api/pads', function() {
    var pads;

    beforeEach(function(done) {
      request(app)
        .get('/api/pads')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pads = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(pads).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/pads', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/pads')
        .send({
          name: 'New Pad',
          info: 'This is the brand new pad!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPad = res.body;
          done();
        });
    });

    it('should respond with the newly created pad', function() {
      expect(newPad.name).to.equal('New Pad');
      expect(newPad.info).to.equal('This is the brand new pad!!!');
    });
  });

  describe('GET /api/pads/:id', function() {
    var pad;

    beforeEach(function(done) {
      request(app)
        .get(`/api/pads/${newPad._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pad = res.body;
          done();
        });
    });

    afterEach(function() {
      pad = {};
    });

    it('should respond with the requested pad', function() {
      expect(pad.name).to.equal('New Pad');
      expect(pad.info).to.equal('This is the brand new pad!!!');
    });
  });

  describe('PUT /api/pads/:id', function() {
    var updatedPad;

    beforeEach(function(done) {
      request(app)
        .put(`/api/pads/${newPad._id}`)
        .send({
          name: 'Updated Pad',
          info: 'This is the updated pad!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPad = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPad = {};
    });

    it('should respond with the updated pad', function() {
      expect(updatedPad.name).to.equal('Updated Pad');
      expect(updatedPad.info).to.equal('This is the updated pad!!!');
    });

    it('should respond with the updated pad on a subsequent GET', function(done) {
      request(app)
        .get(`/api/pads/${newPad._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let pad = res.body;

          expect(pad.name).to.equal('Updated Pad');
          expect(pad.info).to.equal('This is the updated pad!!!');

          done();
        });
    });
  });

  describe('PATCH /api/pads/:id', function() {
    var patchedPad;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/pads/${newPad._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Pad' },
          { op: 'replace', path: '/info', value: 'This is the patched pad!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPad = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPad = {};
    });

    it('should respond with the patched pad', function() {
      expect(patchedPad.name).to.equal('Patched Pad');
      expect(patchedPad.info).to.equal('This is the patched pad!!!');
    });
  });

  describe('DELETE /api/pads/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/pads/${newPad._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when pad does not exist', function(done) {
      request(app)
        .delete(`/api/pads/${newPad._id}`)
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
