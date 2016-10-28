'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var messageCtrlStub = {
  index: 'messageCtrl.index',
  show: 'messageCtrl.show',
  create: 'messageCtrl.create',
  upsert: 'messageCtrl.upsert',
  patch: 'messageCtrl.patch',
  destroy: 'messageCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var messageIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './message.controller': messageCtrlStub
});

describe('Message API Router:', function() {
  it('should return an express router instance', function() {
    expect(messageIndex).to.equal(routerStub);
  });

  describe('GET /api/messages', function() {
    it('should route to message.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'messageCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/messages/:id', function() {
    it('should route to message.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'messageCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/messages', function() {
    it('should route to message.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'messageCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/messages/:id', function() {
    it('should route to message.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'messageCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/messages/:id', function() {
    it('should route to message.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'messageCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/messages/:id', function() {
    it('should route to message.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'messageCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
