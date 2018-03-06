'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var padCtrlStub = {
  index: 'padCtrl.index',
  show: 'padCtrl.show',
  create: 'padCtrl.create',
  upsert: 'padCtrl.upsert',
  patch: 'padCtrl.patch',
  destroy: 'padCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var padIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './pad.controller': padCtrlStub
});

describe('Pad API Router:', function() {
  it('should return an express router instance', function() {
    expect(padIndex).to.equal(routerStub);
  });

  describe('GET /api/pads', function() {
    it('should route to pad.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'padCtrl.index')
      ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/pads/:id', function() {
    it('should route to pad.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'padCtrl.show')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/pads', function() {
    it('should route to pad.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'padCtrl.create')
      ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/pads/:id', function() {
    it('should route to pad.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'padCtrl.upsert')
      ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/pads/:id', function() {
    it('should route to pad.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'padCtrl.patch')
      ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/pads/:id', function() {
    it('should route to pad.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'padCtrl.destroy')
      ).to.have.been.calledOnce;
    });
  });
});
