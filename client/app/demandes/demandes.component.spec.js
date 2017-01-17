'use strict';

describe('Component: DemandesComponent', function() {
  // load the controller's module
  beforeEach(module('E-userApp.demandes'));

  var DemandesComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    DemandesComponent = $componentController('demandes', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
