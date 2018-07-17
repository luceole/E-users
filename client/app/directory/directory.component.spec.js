'use strict';

describe('Component: DirectoryComponent', function() {
  // load the controller's module
  beforeEach(module('eUsersApp.directory'));

  var DirectoryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    DirectoryComponent = $componentController('directory', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
