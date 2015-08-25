'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Mutator;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _altUtilsFunctions = require('alt/utils/functions');

var fn = _interopRequireWildcard(_altUtilsFunctions);

function registerMutator(mutatorDef) {
  var _this = this;

  var loadCounter = 0;

  var asyncMethods = fn.isFunction(mutatorDef) ? mutatorDef(this.alt) : mutatorDef;

  var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
    var desc = asyncMethods[methodName];
    var spec = fn.isFunction(desc) ? desc(_this) : desc;

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