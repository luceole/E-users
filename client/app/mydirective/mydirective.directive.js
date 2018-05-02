'use strict';
const angular = require('angular');

export default angular.module('eUsersApp.mydirective', [])
  .directive('mydirective', function() {
    return {
      template: '<div></div>',
      restrict: 'EA',
      link: function(scope, element, attrs) {
        element.text('this is the mydirective directive');
      }
    };
  })
  .name;
