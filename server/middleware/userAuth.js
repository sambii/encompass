
//REQUIRE MODULES
const cookie = require('cookie');
const logger = require('log4js').getLogger('auth');
const _ = require('underscore');

//REQUIRE FILES
const path = require('./path');
const cache = require('../datasource/api/cache');
const utils = require('./requestHandler');
const models = require('../datasource/schemas');
const User = require("../datasource/schemas/user");

/*
  @returns {Object} user as cached from processToken, fetchUser
  consider protecting against nulls (misconfigured restify plugins)
  consider doing this lazily instead of with plugins
  consider processing the req (token, fetchUser) if not cached
*/
function getUser(req) {
  return req.user;
}

function requireUser(req) {
  var user = getUser(req);
  if (!user) {
    logger.error('user required but not found');
    throw new Error('user required but not found');
  }
  return req.mf.auth.user;
}


/*
  Pull the token from the request
  Stores the token in req.mf.auth.token
  Presently authorization is cookie based only, however we could switch to a token
  header if/when we run into cross server issues (or mobile, etc)
*/
function processToken(options) {
  function _processToken(req, res, next) {
    if (!path.apiRequest(req)) {
      return next();
    }

    _.defaults(req, {
      mf: {
        auth: {}
      }
    });

    var header = req.header('Cookie');
    if (!header) {
      logger.debug('no token found');
      return (next());
    }

    var key = cookie.parse(header).EncAuth;
    req.mf.auth.token = key;
    logger.trace('token processed: ' + key);

    return (next());
  }

  return (_processToken);
}

/*
  Based on the token set on the request (req.mf.auth.token) this
  pulls the user from the database and stores in req.mf.auth.user
  Updates the user's lastSeen time (findAndModify)
*/
function fetchUser(options) {
  function _fetchUser(req, res, next) {
    if (!path.apiRequest(req)) {
      return next();
    }
   _.defaults(req, {
      mf: {
        auth: {}
      }
    });
    var user = req.user;
    if (!user) {
      logger.warn('no user logged in');
      return (next());
    }

    models.User.findOneAndUpdate({
      username: req.user.username
    }, {
      lastSeen: new Date()
    }, {
      new: true
    }, function (err, user) {
      if (err) {
        logger.error(err);
        return utils.sendError.InternalError(err, res);
      } else {
        if (user) {
          var url = req.url;
          var len = url.length;
          if (len > 50) {
            url = url.substring(0, 50) + '... (' + len + ')';
          }
          logger.info(user.get('username') + ' ' + req.method + ' ' + url);
          req.mf.auth.user = user.toObject();
          return (next());
        } else {
          return utils.sendError.InvalidCredentialsError('No user with username' + req.user.username);
        }
      }
    });
  }

  return (_fetchUser);
}

/*
  General layer of protection for all requests
*/
function protect(options) {
  function _protect(req, res, next) {
    // we're not interested in protecting non-api requests
    if (!path.apiRequest(req)) {
      return next();
    }
    _.defaults(req, {
      mf: {
        auth: {}
      }
    });

    var user = getUser(req);
    var openPaths = ['/api/users', '/api/stats'];
    // /api/user - people need this to login; allows new users to see the user list
    // /api/stats - nagios checks this
    var openRequest = _.contains(openPaths, req.path);
    if (openRequest && req.method === 'GET') {
      return next();
    }

    var userAuthenticated = req.isAuthenticated && req.isAuthenticated();
    console.log('is user authenticated in protect: ', userAuthenticated);
    var userAuthorized = (userAuthenticated && (user.isAdmin || user.isAuthorized));

    var notAuthenticated = !userAuthenticated;
    var notAuthorized = !userAuthorized;

    if (notAuthenticated) {
      return utils.sendResponse(res, {"error": 'not auth'});
    }

    if (notAuthorized) {
      res.redirect('/#/');
      return;
    }
    return next();
  }

  return (_protect);
}

function accessibleWorkspacesQuery(user) {
  return {
    $or: [{
        owner: user
      },
      {
        mode: 'public'
      },
      {
        editors: user
      }
    ],
    isTrashed: false
  };
}

function loadAccessibleWorkspaces(options) {
  function _loadAccessibleWorkspaces(req, res, next) {
    var user = getUser(req);
    var schema = path.getSchema(req);
    if (!user || !path.schemaHasWorkspace(schema)) {
      return (next()); //no user, no workspaces - revisit when public means public
    }
    models.Workspace.find(accessibleWorkspacesQuery(user)).select('_id').lean().exec(function (err, workspaces) {
      var ids = workspaces.map(function (w) {
        return w._id;
      });
      req.mf.auth.workspaces = ids;
      return (next());
    });
  }

  return (_loadAccessibleWorkspaces);
}


function test(options) {
  function _test(req, res, next) {
    return (next());
  }

  return (_test);
}

module.exports.processToken = processToken;
module.exports.fetchUser = fetchUser;
module.exports.protect = protect;
module.exports.test = test;
module.exports.getUser = getUser;
module.exports.requireUser = requireUser;
module.exports.loadAccessibleWorkspaces = loadAccessibleWorkspaces;
module.exports.accessibleWorkspacesQuery = accessibleWorkspacesQuery;
