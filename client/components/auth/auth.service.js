'use strict';
class _User {}
export function AuthService($window, $location, $http, $cookies, $q, appConfig, Util, User, Group, Poll) {
  'ngInject';

  var safeCb = Util.safeCb;
  var currentUser = new _User();
  var userRoles = appConfig.userRoles || [];
  /**
   * Check if userRole is >= role
   * @param {String} userRole - role of current user
   * @param {String} role - role to check against
   */
  var hasRole = function(userRole, role) {
    return userRoles.indexOf(userRole) >= userRoles.indexOf(role);
  };

  if ($cookies.get('token') && $location.path() !== '/logout') {
    currentUser = User.get();
  }

  var Auth = {
    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - function(error, user)
     * @return {Promise}
     */
    login({
      uid,
      password
    }, callback) {
      return $http.post('/auth/local', {
          uid,
          password
        })
        .then(res => {
          $cookies.put('token', res.data.token);
          currentUser = User.get();
          return currentUser.$promise;
        })
        .then(user => {
          safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          Auth.logout();
          safeCb(callback)(err.data);
          return $q.reject(err.data);
        });
    },


    /**
     * Delete access token and user info
     */


    logout() {
      $cookies.remove('token');
      currentUser = new _User();
    },

    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - function(error, user)
     * @return {Promise}
     */
    createUser(user, callback) {
      return User.save(user, function(data) {
          $cookies.put('token', data.token);
          currentUser = User.get();
          return safeCb(callback)(null, user);
        }, function(err) {
          Auth.logout();
          return safeCb(callback)(err);
        })
        .$promise;
    },
    createGroup(group, callback) {
      return Group.save(group, function(data) {
          return safeCb(callback)(null, group);
        }, function(err) {
          return safeCb(callback)(err);
        })
        .$promise;
    },
    updateGroup(id, groupe, callback) {
      return Group.update({
          id
        }, groupe,
        function(data) {
          return safeCb(callback)(null, groupe);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },


    updateMe(id, user, callback) {
      return User.updateMe({
            id
          }, user, function(data) {
            return safeCb(callback)(null, user);
          },
          function(err) {
            console.log(err);
            return safeCb(callback)(err);
          })
        .$promise;
    },

    updateUser(id, user, callback) {
      return User.update({
          id
        }, user,
        function(data) {
          return safeCb(callback)(null, user);
        },
        function(err) {
          return safeCb(callback)(null, err);
        }).$promise;
    },

    addUserGroup(idGroup, callback) {
      return User.addusergroup({
          id: currentUser._id
        }, {
          idGroup
        },
        function(user) {
          currentUser = User.get();
          return safeCb(callback)(null, user);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    candidatUserGroup(idGroup, callback) {
      return User.candidatusergroup({
          id: currentUser._id
        }, {
          idGroup
        },
        function(user) {
          currentUser = User.get();
          return safeCb(callback)(null, user);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    nocandidatUserGroup(idGroup, callback) {
      return User.nocandidatusergroup({
          id: currentUser._id
        }, {
          idGroup
        },
        function(user) {
          currentUser = User.get();
          return safeCb(callback)(null, user);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },


    delUserGroup(idGroup, callback) {
      var cb = callback || angular.noop;
      return User.delusergroup({
          id: currentUser._id
        }, {
          idGroup
        },
        function(user) {
          currentUser = User.get();
          return safeCb(callback)(null, user);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    eventparticipate(id, ev, callback) {
      var cb = callback || angular.noop;
      return Group.eventparticipate({
          id
        }, ev,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    eventdelete(id, ev, callback) {
      var cb = callback || angular.noop;
      return Group.eventdelete({
          id
        }, ev,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    eventsofgroup(id, callback) {
      var cb = callback || angular.noop;
      return Group.eventsofgroup({
          id
        },
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    eventupdate(id, ev, callback) {
      var cb = callback || angular.noop;
      return Group.eventupdate({
          id
        }, ev,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },
    groupecommun(callback) {
      var cb = callback || angular.noop;
      return Group.commun({},
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise
    },
    // Create Poll
    createPoll(poll, callback) {
      var cb = callback || angular.noop;
      return Poll.save(poll,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    updatePoll(id, poll, callback) {
      var cb = callback || angular.noop;
      return Poll.update({
          id
        }, poll,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    votePoll(id, poll, callback) {
      var cb = callback || angular.noop;
      return Poll.vote({
          id
        }, poll,
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    mypolls(mygrp, callback) {
      var cb = callback || angular.noop;
      return Poll.mypolls({
          mygrp
        },
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    myadminpolls(mygrp, callback) {
      var cb = callback || angular.noop;
      return Poll.myadminpolls({
          mygrp
        },
        function(data) {
          return safeCb(callback)(null, data);
        },
        function(err) {
          return safeCb(callback)(err);
        }).$promise;
    },

    userAdmingroup(idgrp, listusers, callback) {
      var cb = callback || angular.noop;
      return User.userAdmingroup({
          idgrp,
          listusers
        }, function() {
          return safeCb(callback)(null);
        }, function(err) {
          return safeCb(callback)(err);
        })
        .$promise;
    },
    userSupGroup(idgrp, listusers, callback) {
      var cb = callback || angular.noop;
      return User.userSupGroup({
          idgrp,
          listusers
        }, function() {
          return safeCb(callback)(null);
        }, function(err) {
          return safeCb(callback)(err);
        })
        .$promise;
    },
    userSuppCandidat(idgrp, listusers, callback) {
      var cb = callback || angular.noop;
      return User.userSupCandidat({
          idgrp,
          listusers
        }, function() {
          return safeCb(callback)(null);
        }, function(err) {
          return safeCb(callback)(err);
        })
        .$promise;
    },
    // userAddCandidat(idgrp, listusers, callback) {
    //   var cb = callback || angular.noop;
    //   return User.userAddCandidat({
    //     idgrp, listusers
    //   }, function() {
    //     return safeCb(callback)(null);
    //   }, function(err) {
    //     return safeCb(callback)(err);
    //   })
    //       .$promise;
    // },

    discourseSso(id, params, callback) {
      var sso = params.sso;
      var sig = params.sig;
      return User.discourseSso({
            id,
          }, {
            sso,
            sig
          }, function(data) {
            //console.log(`data ${data}`);
            return safeCb(callback)(null, data);
          },
          function(err) {
            console.log(err);
            return safeCb(callback)(err);
          })
        .$promise;
    },
    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - function(error, user)
     * @return {Promise}
     */
    changePassword(oldPassword, newPassword, callback) {
      return User.changePassword({
          id: currentUser._id
        }, {
          oldPassword,
          newPassword
        }, function() {
          return safeCb(callback)(null);
        }, function(err) {
          return safeCb(callback)(err);
        })
        .$promise;
    },
    lostPassword(email, callback) {
      return User.lostPassword({
        email
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },

    ResetPassword(pwdToken, newPassword, callback) {
      return User.changeResetedPassword({
        pwdToken,
        newPassword
      }, function(data) {
        $cookies.put('token', data.token);
        currentUser = User.get();
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(null);
      }).$promise;
    },


    /**
     * Gets all available info on a user
     *
     * @param  {Function} [callback] - function(user)
     * @return {Promise}
     */
    getCurrentUser(callback) {
      var value = _.get(currentUser, '$promise') ? currentUser.$promise : currentUser;

      return $q.when(value)
        .then(user => {
          safeCb(callback)(user);
          return user;
        }, () => {
          safeCb(callback)({});
          return {};
        });
    },

    /**
     * Gets all available info on a user
     *
     * @return {Object}
     */
    getCurrentUserSync() {
      return currentUser;
    },

    /**
     * Check if a user is logged in
     *
     * @param  {Function} [callback] - function(is)
     * @return {Promise}
     */
    isLoggedIn(callback) {
      return Auth.getCurrentUser(undefined)
        .then(user => {
          let is = _.get(user, 'role');

          safeCb(callback)(is);
          return is;
        });
    },

    /**
     * Check if a user is logged in
     *
     * @return {Bool}
     */
    isLoggedInSync() {
      return !!_.get(currentUser, 'role');
    },

    /**
     * Check if a user has a specified role or higher
     *
     * @param  {String}     role     - the role to check against
     * @param  {Function} [callback] - function(has)
     * @return {Promise}
     */
    hasRole(role, callback) {
      return Auth.getCurrentUser(undefined)
        .then(user => {
          let has = hasRole(_.get(user, 'role'), role);

          safeCb(callback)(has);
          return has;
        });
    },

    /**
     * Check if a user has a specified role or higher
     *
     * @param  {String} role - the role to check against
     * @return {Bool}
     */
    hasRoleSync(role) {
      //  console.log(_.get(currentUser, 'role'));
      return hasRole(_.get(currentUser, 'role'), role);
    },

    /**
     * Check if a user is an admin
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */
    isAdmin() {
      return Auth.hasRole(...[].concat.apply(['admin'], arguments));
    },
    isAdmin_grp() {
      return Auth.hasRole(...[].concat.apply(['admin_grp'], arguments));
    },

    /**
     * Check if a user is an admin
     *
     * @return {Bool}
     */
    isAdminSync() {
      return Auth.hasRoleSync('admin');
    },
    isAdmin_grpSync() {
      return Auth.hasRoleSync('admin_grp');
    },
    isActif() {
      return currentUser.isactif;
    },

    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
    getToken() {
      return $cookies.get('token');
    },
    /**
     *
     * Session Etherpad
     *
     **/
    openPad(pad, callback) {
      var cb = callback || angular.noop;
      $http.post('/api/pads', {
          groupID: pad.groupID,
          authorID: pad.authorID,
        })
        .success(function(data) {
          // console.log("session PAD: " + data.sessionID);
          $cookieStore.put('sessionID', data.sessionID);
          return cb(data);
        })
        .error(function(err) {
          console.lo(`err :${err}`);
          return cb(err);
        }).$promise;
    },
  };
  return Auth;
}