'use strict';

describe('Component: AdminpollComponent', function() {
  // load the controller's module
  beforeEach(module('eUsersApp.adminpoll'));

  var AdminpollComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    AdminpollComponent = $componentController('adminpoll', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
