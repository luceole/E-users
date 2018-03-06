/**
 * Populate empty DB with ADMIN
 */

'use strict';
import User from '../api/user/user.model';


User.count({}, function(err, count) {
  console.log('Number of User: ', count);
  if(count == 0) {
    console.log('Create the fist Admin');
  }
});
