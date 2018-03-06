'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('main', {
    url: '/',
    template: '<main></main>',
    authenticate: true
  })
  .state('discoursesso', {
    url: '/discoursesso?sso&sig',
        template: '<main></main>'
  });
}
