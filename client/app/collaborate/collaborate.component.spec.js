'use strict';

describe('Component: CollaborateComponent', function() {
  // load the controller's module
  beforeEach(module('eUsersApp.collaborate'));

  var CollaborateComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    CollaborateComponent = $componentController('collaborate', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
