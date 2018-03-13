'use strict';

export function MessageResource($resource) {
  'ngInject';
  return $resource('/api/messages');
}
