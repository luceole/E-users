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
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
