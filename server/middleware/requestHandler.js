/**
 * # Request Handler API
 * @description Shared helper utilities for this  module
 * @author Damola Mabogunje <damola@mathforum.org>, Amir Tahvildaran <amir@mathforum.org>
 * @since 1.0.0
 */

//REQUIRE MODULES
const logger = require('log4js').getLogger('server');
const crypto = require('crypto');
const _ = require('underscore');

//REQUIRE FILES
const userApi = require('../datasource/api/userApi');
const path = require('./path');
const models = require('../datasource/schemas');
const config = require('../config');
const nconf = config.nconf;
const powConf = nconf.get('cache');
  /**

/**
  * @public
  * @method sendResponse
  * @description Utility callback to send some data with a response
  * @param {ServerResponse} res The response object
  * @param {Object} data The data to send
 */
function sendResponse(res, data) {
  if (!data) {
    res.status(404).json({
      error: 'Not found'
    });
  } else {
    res.send(data);
  }
}

/**
  * @public
  * @method sendError
  * @description Send error has a bunch of methods to return specific error types
  * @description The error types are copies of the restify error types to reduce refactoring https: //github.com/restify/errors
  * @param {HttpError} error The error to send
  * @param {ServerResponse} res The response object
  * @todo We shouldn't need to fix the error code with res.send - The error bubbled up should
  *       always be an instance of HttpError with its own error code.
  */

const sendError = {
  InternalError: function (err, res) {
      res.status(500).json({
        error: err || 'Internal Error'
      });
    },
  BadMethodError: function (err, res) {
    res.status(405).json({
      error: err || 'Bad Method'
    });
  },
  NotAuthorizedError: function (err, res) {
    res.status(403).json({
      error: err || 'Not Authorized'
    });
  },
  InvalidCredentialsError: function (err, res) {
    console.log('err: ', err);
    res.status(401).json({
      error: err || 'Invalid Credentials'
    });
  },
  InvalidArgumentError: function (err, res) {
    res.status(409).json({
      error: err || 'Invalid Argument'
    });
  },
  InvalidContentError: function (err, res) {
    res.status(400).json({
      error: err || 'Invalid Content'
    });
  },
  RestError: function (err, res) {
    res.status(400).json({
      error: err || 'Rest error'
    });
    }
};

// function sendError(error, res) {
//   logger.error(error);
//   res.send(500, error);
// }
/**
  * @public
  * @method buildCriteria
  * @description Utility callback to compose the request criteria from expected parameters
  * @param {HttpError} error The error to send
  * @param {ServerRequest} req The resquest object
  * @todo At the moment, the only criteria we have is ID. Ideally we should support more criteria
  *       for greater filtering on request. We also need default criteria in place so people can't
  *       just get everything
  * @howto Ideally, this should go hand in hand with the type of grouping provided by the [Mongoose
  *        aggregate method](http://mongoosejs.com/docs/api.html#aggregate_Aggregate):
  *        Allowing for matching, sorting, and ordering of requested objects.
  */
function buildCriteria(req) {
  var criteria = {};
  criteria.$and = [ //ENC-494
    {
      $or: [
        { isTrashed: { $exists: false } },
        { isTrashed: false }
      ]
    }
  ];
  if(req.mf.auth.workspaces) {
    criteria.$and.push({ workspace: { $in: req.mf.auth.workspaces } });
  }

  if(req.params.id) {
    criteria._id = req.params.id;
  } else {
    var ids = req.query.ids;
    if(ids) {
      criteria._id = { $in: ids };
    }
  }
  return criteria;
}

/**
  * @public
  * @method modelize
  * @description This takes an external submission and recursively massages
  *              all of its properties to conform to our own JSON standards.
  * @param {Object} obj The external submission we're formatting (only from the PoWs for now)
  * @param {String} currentField The name of the current field we're formatting
  * @return {Object} An Encompass JSON submission
  */
function modelize(obj, currentField) {
  var model = (_.isArray(obj)) ? [] : {};
  var keywords = ["id", "type"];
  var singular = { teachers: "teacher"}; // A way to decouple this would be better

  var recurse = function(elem, index, arr) {
    return modelize(elem, currentField);
  };

  for (var key in obj) {
    if( obj.hasOwnProperty(key) ) {
      var value = obj[key];
      var property = key;

      if(_.isArray(obj) && _.isFinite(key)) {
        property = singular[currentField];
      }

      /* If the field we're looking at has a property containing any keyword,
         rename the property using camelcase.
         i.e obj.prop.id => obj.prop.propId
      */
      if(keywords.indexOf(key) > -1) {
        var splitKey = [
          key.charAt(0).toUpperCase(),
          key.slice(1)
        ];

        property = currentField + splitKey.join('');
      }

      // Recurse over nested objects
      if ( value && _.isObject(value) ) {
        model[key] = modelize(value, property);
      }
      else if (value && _.isArray(value) ) {
        var array = model[key].map(recurse);

        model[key] = array;
      }
      else { model[property] = value; }
    }
  }

  return model;
}

/**
  * @public
  * @method generateApiSecret
  * @description This method generates an encrypted string using a given `time`
  *              for communication between Encompass and the PoWs
  * @param {Int} time A timestamp
  * @return {String} The encrypted secret
  */
function generateApiSecret(time) {
  var timestamp = (!!arguments.length) ? time : Date.now(),
      salt = powConf.key,
      hash = 'md5',
      secret = timestamp + salt;

  return crypto.createHash(hash).update(secret, 'utf-8').digest('hex').toUpperCase();
}

/**
  * @public
  * @method generateApiKey
  * @description This method generates an api `key` object
  *               consisting of all necessary fields for validating an API key
  * @howto The real key generation is done by `generateApiSecret`
  *        This function merely provides a consistent way to define what we expect
  *        in the request header sending the key
  * @see [generateApiSecret](../../middleware/requestHandler.js)
  * @param {Int} time A timestamp
  * @return {Object} An "API key" object.
  */
function generateApiKey(time) {
  var key = {
    'Secret': generateApiSecret(time),
    'Time':   time
  };

  return key;
}


/**
  * @public
  * @method isValidApiKey
  * @description This method verifies that an API key is valid.
  * @see [generateApiSecret](../../middleware/requestHandler.js)
  * @todo Accept an "API key" object instead
  * @param {String} secret An encypted secret key
  * @param {Int} timestamp The timestamp from which the `secret` was generated
  * @return {Boolean} True if valid, otherwise false.
  */
function isValidApiKey(secret, timestamp) {
  if( _.isUndefined(secret) ) {
    return false;
  }

  var now = Date.now(),
      diff = now - timestamp,
      expiry = 5000, // Keys within this time (in ms) are acceptable
      expected = generateApiSecret(timestamp);

  //  console.log(diff, expiry);
  if ( diff <= expiry ) {
    return (secret === expected);
  }

  return false;
}

module.exports.sendResponse = sendResponse;
module.exports.sendError = sendError;
module.exports.buildCriteria = buildCriteria;
module.exports.modelize = modelize;
module.exports.generateApiSecret = generateApiSecret;
module.exports.generateApiKey = generateApiKey;
module.exports.isValidApiKey = isValidApiKey;
