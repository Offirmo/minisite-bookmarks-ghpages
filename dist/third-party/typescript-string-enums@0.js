"use strict";
function Enum() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var result = {};
    values.forEach(function (value) { return result[value] = value; });
    return result;
}
exports.Enum = Enum;
//# sourceMappingURL=index.js.map