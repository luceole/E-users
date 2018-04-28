'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var paramCtrlStub = {
  index: 'paramCtrl.index',
  show: 'paramCtrl.show',
  create: 'paramCtrl.create',
  upsert: 'paramCtrl.upsert',
  patch: 'paramCtrl.patch',
  destroy: 'paramCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var paramIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './param.controller': paramCtrlStub
});

describe('Param API Router:', function() {
  it('should return an express router instance', function() {
    expect(paramIndex).to.equal(routerStub);
  });

  describe('GET /api/params', function() {
    it('should route to param.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'paramCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/params/:id', function() {
    it('should route to param.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'paramCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/params', function() {
    it('should route to param.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'paramCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/params/:id', function() {
    it('should route to param.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'paramCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/params/:id', function() {
    it('should route to param.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'paramCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/params/:id', function() {
    it('should route to param.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'paramCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
