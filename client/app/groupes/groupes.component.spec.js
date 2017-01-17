'use strict';

describe('Component: GroupesComponent', function() {
  // load the controller's module
  beforeEach(module('E-userApp.groupes'));

  var GroupesComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    GroupesComponent = $componentController('groupes', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
