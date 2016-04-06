/*jslint nomen: true, plusplus: true */
var rhapsody = (function () {
  "use strict";

  var _publ,

    _modules = {},

    _moduleDefs = {},

    _moduleUsers = {},

    _isArray = function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },

    _each = function (arr, func, thisArg) {
      var i, len;

      if (arr === null || typeof arr.length !== "number") {
        /*
         * don't do _isArray because allowing arguments as
         * well.
         */
        throw new TypeError(arr + " is not an array");
      }

      if (typeof arr.forEach === "function") {
        arr.forEach(func, thisArg);
      } else {

        if (typeof func !== "function") {
          throw new TypeError(func + " is not a function");
        }

        for (i = 0, len = arr.length; i < len; i++) {
          func.call(thisArg, arr[i], i, arr);
        }
      }
    },

    _map = function (arr, func, thisArg) {
      var res;

      if (typeof arr.map === "function") {
        return arr.map(func, thisArg);
      }

      if (typeof func !== "function") {
        throw new TypeError(func + " is not a function");
      }
      res = [];
      _each(arr, function (element, index, array) {
        res.push(func.call(thisArg, element, index, array));
      }, thisArg);
      return res;
    },

    _initModuleNoCheck = function (def) {
      var module = def.init.call(undefined, _publ);

      _modules[def.name] = module;
      return module;
    },

    _initModule = function (def) {
      var module = _modules[def.name];

      if (!module) {
        module = _initModuleNoCheck(def);
      }
      return module;
    },

    _getModule = function (moduleName) {
      var module = _modules[moduleName];

      if (module) {
        return module;
      }
      return _initModuleNoCheck(_moduleDefs[moduleName]);
    },

    _notifyUsers = function (moduleName) {
      var users = _moduleUsers[moduleName];

      if (users === undefined) {
        return;
      }

      _each(users, function (user) {
        user.requestLength--;

        if (user.requestLength === 0) {

          (function (user) {
            setTimeout(function () {
              var modules = _map(user.requests, _getModule);

              user.callback.apply(user.scope, modules);

              // delete the user from the moduleUsers
              _each(user.requests, function (moduleName) {
                var users = _moduleUsers[moduleName];

                if (users !== undefined) {
                  users.splice(users.indexOf(user), 1);

                  if (users.length === 0) {
                    delete _moduleUsers[moduleName];
                  }
                }
              });

            }, 0);
          }(user));
        }
      });
    };

  /*
   * Generic error.
   */
  function RhapsodyError(message) {
    this.message = message;
  }

  RhapsodyError.prototype = new Error();

  function checkArgument(message, condition) {
    if (!condition) {
      throw new RhapsodyError("Illegal argument: " + message);
    }
  }

  /*
   * Public members.
   */
  _publ = {

    RhapsodyError: RhapsodyError,

    define: function (moduleName, moduleDef, modulesToUse) {
      var def;

      checkArgument("moduleName has to be a non empty string", typeof
          moduleName === "string" && moduleName.length > 0);
      checkArgument("Module <" + moduleName + "> is already defined.",
          _moduleDefs[moduleName] === undefined);
      checkArgument("module definition has to be a function", typeof
          moduleDef === "function");

      if (modulesToUse === undefined) {
        def = {
          init: moduleDef,
          name: moduleName
        };
        _moduleDefs[moduleName] = def;
        _notifyUsers(moduleName, def);
      } else {
        checkArgument("modulesToUse must be an array", _isArray(
            modulesToUse));

        _publ.use(modulesToUse, function () {
          var args = arguments;

          _publ.define(moduleName, function () {
            return moduleDef.apply(undefined, args);
          });
        });
      }
    },

    undefine: function () {
      _each(arguments, function (moduleName) {
        delete _moduleDefs[moduleName];
        delete _modules[moduleName];
      });
    },

    use: function (moduleNames, callback, scope) {
      var moduleNamesCopy, users, user,
        existingModuleDefs = [],
        modulesToRequest = [],
        containsAsync = false,
        usersModules = [];

      if (typeof moduleNames === "string") {
        moduleNames = [moduleNames];
      } else {
        checkArgument("specify required modules as an array or string" +
             "<" + moduleNames + ">", _isArray(moduleNames));
      }

      checkArgument("specify callback as a function <" + callback + ">",
          typeof callback === "function");

      moduleNamesCopy = moduleNames.slice();
      user = {
        requests: moduleNamesCopy,
        requestLength: moduleNamesCopy.length,
        callback: callback,
        scope: scope
      };

      _each(moduleNames, function (moduleName) {
        var moduleDef = _moduleDefs[moduleName];

        if (moduleName === "rhapsody._async") {
          containsAsync = true;
        }

        if (!moduleDef) {
          modulesToRequest.push(moduleName);
          users = _moduleUsers[moduleName];

          if (!users) {
            users = [];
            _moduleUsers[moduleName] = users;
          }

          users.push(user);
        } else {
          existingModuleDefs.push(moduleDef);
        }
      });

      if (existingModuleDefs.length === moduleNames.length) {
        usersModules = _map(existingModuleDefs, _initModule);
        callback.apply(scope, usersModules);
      } else {
        user.requestLength -= existingModuleDefs.length;

        /*
         * if none of the modules requested is "rhapsody._async"
         * and async loading is supported.
         */
        if (!containsAsync && rhapsody.defineBundles) {
          rhapsody.use("rhapsody._async", function (async) {
            async(modulesToRequest);
          });
        }
      }

    }
  };

  /*
   * Since we already created these methods,
   * we may as well expose it.
   */
  _publ.define("rhapsody.arrays", function () {
    return {

      forEach: _each,

      map: _map,

      isArray: _isArray
    };
  });

  return _publ;
}());