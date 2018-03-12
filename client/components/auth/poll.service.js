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
      method: 'GETt',
      params: {
        controller: 'mypolls'
      }
    },
    update: {
      method: 'PUT',
    }
  }
  );
}
