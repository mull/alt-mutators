'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Mutator;

var _altUtilsLibFunctions = require('alt-utils/lib/functions');

function registerMutator(mutatorDef) {
  var _this = this;

  var loadCounter = 0;

  var asyncMethods = (0, _altUtilsLibFunctions.isFunction)(mutatorDef) ? mutatorDef(this.alt) : mutatorDef;

  var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
    var desc = asyncMethods[methodName];
    var spec = (0, _altUtilsLibFunctions.isFunction)(desc) ? desc(_this) : desc;

    var validHandlers = ['success', 'error', 'writing'];
    validHandlers.forEach(function (handler) {
      if (spec[handler] && !spec[handler].id) {
        throw new Error(handler + ' handler must be an action function');
      }
    });

    publicMethods[methodName] = function (args) {
      if (args !== Object(args)) {
        throw new Error(methodName + ' only accepts an object as its sole argument');
      }

      var makeActionHandler = function makeActionHandler(action, isError) {
        return function (x) {
          var fire = function fire() {
            loadCounter -= 1;
            args.result = x;
            action(args);
            if (isError) throw x;
            return args;
          };
          return _this.alt.trapAsync ? function () {
            return fire();
          } : fire();
        };
      };

      loadCounter += 1;
      spec.writing(args);

      var currentState = _this.getInstance().getState();
      args.state = currentState;

      return spec.write(args).then(makeActionHandler(spec.success), makeActionHandler(spec.error, 1));
    };

    return publicMethods;
  }, {});

  this.exportPublicMethods(toExport);
  this.exportPublicMethods({
    isLoading: function isLoading() {
      return loadCounter > 0;
    }
  });
}

function Mutator(StoreModel) {
  StoreModel.prototype.registerMutator = registerMutator;
  return StoreModel;
}

module.exports = exports['default'];