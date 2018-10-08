'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
      url: '/login',
      template: require('./login/login.html'),
      controller: 'LoginController',
      controllerAs: 'vm'
    })
    .state('logout', {
      url: '/logout?referrer',
      referrer: 'main',
      template: '',
      controller($state, Auth) {
        'ngInject';
        var referrer = $state.params.referrer || $state.current.referrer || 'main';
        Auth.logout();
        //$state.go('main');
        $state.go(referrer);
      }
    })
    .state('logoutSSO', {
      url: '/logoutSSO',
      template: '',
      controller($state, $window, Auth) {
        'ngInject';
        var referrer = $state.params.referrer || $state.current.referrer || 'main';
        Auth.logout();
        $window.location.href = `/auth/openid/logout`;
      }
    })
    .state('signup', {
      url: '/signup',
      template: require('./signup/signup.html'),
      controller: 'SignupController',
      controllerAs: 'vm'
    })
    .state('lostpwd', {
      url: '/lostpwd',
      template: require('./lostpwd/lostpwd.html'),
      controller: 'LostpwdController',
      controllerAs: 'vm'
    })
    .state('resetpwd', {
      url: '/resetpwd/:passcode',
      template: require('./resetpwd/resetpwd.html'),
      controller: 'ResetpwdController',
      controllerAs: 'vm'
    })
    .state('settings', {
      url: '/settings/:Tab',
      template: require('./settings/settings.html'),
      controller: 'SettingsController',
      controllerAs: 'vm',
      authenticate: true
    });
}