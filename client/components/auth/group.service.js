'use strict';

export function GroupResource($resource) {
  'ngInject';

  return $resource('/api/groups/:id/:controller', {
    id: '@_id'
  }, {
    listopengroups: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'isopen'
      }
    },

    commun: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'commun'
      }
    },
    eventsofgroup: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'eventsofgroup'
      }
    },
    eventupdate: {
      method: 'PUT',
      isArray: true,
      params: {
        controller: 'eventupdate'
      }
    },
    eventparticipate: {
      method: 'PUT',
      isArray: true,
      params: {
        controller: 'eventparticipate'
      }
    },
    eventdelete: {
      method: 'PUT',
      isArray: true,
      params: {
        controller: 'eventdelete'
      }
    },
    update: {
      method: 'PUT',
    }
  });
}