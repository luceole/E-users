'use strict';

export function GroupResource($resource) {
  'ngInject';
  return $resource('/api/groups/');

}
