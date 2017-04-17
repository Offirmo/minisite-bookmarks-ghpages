"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Enum() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    if (typeof values[0] === "string") {
        var result = {};
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            result[value] = value;
        }
        return result;
    }
    else {
        return values[0];
    }
}
exports.Enum = Enum;
(function (Enum) {
    function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    function keys(e) {
        var result = [];
        for (var prop in e) {
            if (hasOwnProperty(e, prop)) {
                result.push(prop);
            }
        }
        return result;
    }
    Enum.keys = keys;
    function values(e) {
        var result = [];
        for (var _i = 0, _a = keys(e); _i < _a.length; _i++) {
            var key = _a[_i];
            result.push(e[key]);
        }
        return result;
    }
    Enum.values = values;
})(Enum = exports.Enum || (exports.Enum = {}));
//# sourceMappingURL=index.js.map