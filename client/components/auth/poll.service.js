'use strict';

export function PollResource($resource) {
  'ngInject';

  return $resource('/api/polls/:id/:controller', {
    id: '@_id'
  }, {

    vote: {
      method: 'PUT',
      params: {
        controller: 'vote'
      }
    },
    mypolls: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'mypolls'
      }
    },
    myadminpolls: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'myadminpolls'
      }
    },
    update: {
      method: 'PUT',
    }
  }
  );
}
