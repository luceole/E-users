'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
var mongoosePaginate = require('mongoose-paginate');
import mongoose, {
  Schema
} from 'mongoose';

const authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  uid: {
    required: true,
    type: String,
    unique: true
  },
  surname: String,
  name: String,
  email: {
    required: true,
    type: String,
    lowercase: true,
  },
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    required: true
  },
  provider: String,
  structure: String,
  isactif: Boolean,
  isdemande: Boolean,
  hashedPassword: String,
  pwdToken: String,
  urlToken: String,
  mailValid: Boolean,
  firstdate: Date,
  creationDate: {
    type: Date,
    'default': Date.now
  },
  'authorPadID': String,
  memberOf: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }],
  adminOf: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }],
  salt: String,
  google: {},
  github: {},
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      name: this.name,
      surname: this.surname,
      isactif: this.isactif,
      mailValid: this.mailValid,
      email: this.email,
      structure: this.structure,
      role: this.role,
      authorPadID: this.authorPadID,
      memberOf: this.memberOf,
      adminOf: this.adminOf
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate empty uid
UserSchema
  .path('uid')
  .validate(function (uid) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return uid.length;
  }, 'Identifiant Obligatoire');

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Courriel Obligatoire');

// Validate empty password
UserSchema
  .path('password')
  .validate(function (password) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'Mot de passe Obligatoire');

// Validate uid is not taken
UserSchema
  .path('uid')
  .validate(function (value, respond) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return respond(true);
    }

    return this.constructor.findOne({
        uid: value
      }).exec()
      .then(user => {
        if (user) {
          if (this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function (err) {
        throw err;
      });
  }, 'Cette identifiant est dèja utilisé!');


// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return respond(true);
    }

    return this.constructor.findOne({
        email: value
      }).exec()
      .then(user => {
        if (user) {
          if (this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function (err) {
        throw err;
      });
  }, 'Cette adresse est utilisée avec un autre identifiant!');


var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    // Handle new/update passwords
    if (!this.isModified('password')) {
      return next();
    }

    if (!validatePresenceOf(this.password)) {
      if (authTypes.indexOf(this.provider) === -1) {
        return next(new Error('Invalid password'));
      } else {
        return next();
      }
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if (saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if (encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        return next();
      });
    });
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      throw new Error('Missing Callback');
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, (err, key) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  }
};

UserSchema.plugin(mongoosePaginate);
export default mongoose.model('User', UserSchema);
