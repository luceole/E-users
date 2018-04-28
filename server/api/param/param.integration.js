'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newParam;

describe('Param API:', function() {
  describe('GET /api/params', function() {
    var params;

    beforeEach(function(done) {
      request(app)
        .get('/api/params')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          params = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(params).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/params', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/params')
        .send({
          name: 'New Param',
          info: 'This is the brand new param!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newParam = res.body;
          done();
        });
    });

    it('should respond with the newly created param', function() {
      expect(newParam.name).to.equal('New Param');
      expect(newParam.info).to.equal('This is the brand new param!!!');
    });
  });

  describe('GET /api/params/:id', function() {
    var param;

    beforeEach(function(done) {
      request(app)
        .get(`/api/params/${newParam._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          param = res.body;
          done();
        });
    });

    afterEach(function() {
      param = {};
    });

    it('should respond with the requested param', function() {
      expect(param.name).to.equal('New Param');
      expect(param.info).to.equal('This is the brand new param!!!');
    });
  });

  describe('PUT /api/params/:id', function() {
    var updatedParam;

    beforeEach(function(done) {
      request(app)
        .put(`/api/params/${newParam._id}`)
        .send({
          name: 'Updated Param',
          info: 'This is the updated param!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedParam = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedParam = {};
    });

    it('should respond with the updated param', function() {
      expect(updatedParam.name).to.equal('Updated Param');
      expect(updatedParam.info).to.equal('This is the updated param!!!');
    });

    it('should respond with the updated param on a subsequent GET', function(done) {
      request(app)
        .get(`/api/params/${newParam._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let param = res.body;

          expect(param.name).to.equal('Updated Param');
          expect(param.info).to.equal('This is the updated param!!!');

          done();
        });
    });
  });

  describe('PATCH /api/params/:id', function() {
    var patchedParam;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/params/${newParam._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Param' },
          { op: 'replace', path: '/info', value: 'This is the patched param!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedParam = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedParam = {};
    });

    it('should respond with the patched param', function() {
      expect(patchedParam.name).to.equal('Patched Param');
      expect(patchedParam.info).to.equal('This is the patched param!!!');
    });
  });

  describe('DELETE /api/params/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/params/${newParam._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when param does not exist', function(done) {
      request(app)
        .delete(`/api/params/${newParam._id}`)
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
