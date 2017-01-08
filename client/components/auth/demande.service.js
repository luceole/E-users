'use strict';

export function DemandeResource($resource) {
  'ngInject';
  return $resource('/api/users/demandes/');

}
