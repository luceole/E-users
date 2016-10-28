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
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
