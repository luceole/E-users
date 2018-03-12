'use strict';

describe('Directive: mydirective', function() {
  // load the directive's module
  beforeEach(module('eUsersApp.mydirective'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<mydirective></mydirective>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the mydirective directive');
  }));
});
