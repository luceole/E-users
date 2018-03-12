'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var pollCtrlStub = {
  index: 'pollCtrl.index',
  show: 'pollCtrl.show',
  create: 'pollCtrl.create',
  upsert: 'pollCtrl.upsert',
  patch: 'pollCtrl.patch',
  destroy: 'pollCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var pollIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './poll.controller': pollCtrlStub
});

describe('Poll API Router:', function() {
  it('should return an express router instance', function() {
    expect(pollIndex).to.equal(routerStub);
  });

  describe('GET /api/polls', function() {
    it('should route to poll.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'pollCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/polls/:id', function() {
    it('should route to poll.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'pollCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/polls', function() {
    it('should route to poll.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'pollCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/polls/:id', function() {
    it('should route to poll.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'pollCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/polls/:id', function() {
    it('should route to poll.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'pollCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/polls/:id', function() {
    it('should route to poll.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'pollCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
