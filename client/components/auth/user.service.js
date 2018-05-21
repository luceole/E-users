'use strict';

export function UserResource($resource) {
  'ngInject';

  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    updateMe: {
      method: 'PUT',
      params: {
        controller: 'updateme'
      }
    },
    listadmgrp: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'listadmgrp'
      }
    },
    listadmin: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'listadmin'
      }
    },
    candidatusergroup: {
      method: 'PUT',
      params: {
        controller: 'candidatusergroup'
      }
    },

    nocandidatusergroup: {
      method: 'PUT',
      params: {
        controller: 'nocandidatusergroup'
      }
    },
    addusergroup: {
      method: 'PUT',
      params: {
        controller: 'addusergroup'
      }
    },
    delusergroup: {
      method: 'PUT',
      params: {
        controller: 'delusergroup'
      }
    },
    userAdmingroup: {
      method: 'PUT',
      params: {
        controller: 'useradmingroup'
      }
    },
    userSupCandidat: {
      method: 'PUT',
      params: {
        controller: 'usersupcandidat'
      }
    },
    userAddCandidat: {
      method: 'PUT',
      params: {
        controller: 'useraddcandidat'
      }
    },
    discourseSso: {
      method: 'PUT',
      params: {
        controller: 'discoursesso'
      }
    },
    validate: {
      method: 'get',
      params: {
        //  controller: 'validate'
      }
    },
    update: {
      method: 'PUT',
      params: {
        controller: 'update'
      }
    },
    lostPassword: {
      method: 'GET',
      params: {
        controller: 'lostpwd'
      }
    },
    changeResetedPassword: {
      method: 'PUT',
      params: {
        controller: 'resetpwd'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
