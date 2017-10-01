'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var groupCtrlStub = {
  index: 'groupCtrl.index',
  show: 'groupCtrl.show',
  create: 'groupCtrl.create',
  upsert: 'groupCtrl.upsert',
  patch: 'groupCtrl.patch',
  destroy: 'groupCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var groupIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './group.controller': groupCtrlStub
});

describe('Group API Router:', function() {
  it('should return an express router instance', function() {
    expect(groupIndex).to.equal(routerStub);
  });

  describe('GET /api/groups', function() {
    it('should route to group.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'groupCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/groups/:id', function() {
    it('should route to group.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'groupCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/groups', function() {
    it('should route to group.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'groupCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/groups/:id', function() {
    it('should route to group.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'groupCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/groups/:id', function() {
    it('should route to group.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'groupCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/groups/:id', function() {
    it('should route to group.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'groupCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
