'use strict';

exports.forEach = function (object, handler) {
    for(var prop in object)
        if (object.hasOwnProperty(prop))
            handler(object[prop], prop, object);

};

exports.filter = function (object, filter) {
    var result = [];
    for(var prop in object)
        if (object.hasOwnProperty(prop) && filter(object[prop], prop, object))
            result.push(object[prop]);

    return result;
};

exports.first = function (object) {
    for(var prop in object)
        if (object.hasOwnProperty(prop)) return object[prop];

    return undefined;
};

/**
 *
 * @param object {Object.<String, *>|Array}
 * @param mapper {function (*, String=, Object|Array=): Array}
 * @returns {Array}
 */
exports.map = function (object, mapper) {
    var result = [];
    for(var prop in object)
        if (object.hasOwnProperty(prop))
            result.push(mapper(object[prop], prop, object));

    return result;
};

exports.extend = function extend(target) {
    if (arguments.length < 2) return target;

    target = target || null;
    for(var index = 1; index < arguments.length; index++) {
        var arg = arguments[index];

        if(!arg) continue;

        if (!target) target = clone(arg);

        else if ((arg instanceof Array) && (target instanceof Array))
            for (var i = 0; i < arg.length; i++)
                target[i] = clone(arg[i]);

        else if ((typeof arg == 'object') && (typeof target == 'object'))
            for(var prop in arg)
                if (arg.hasOwnProperty(prop))
                    target[prop] = clone(arg[prop]);
    }
};

/**
 * Object, array, or function to clone
 * @param source {*}
 * @returns {*}
 */
function clone(source) {
    return source instanceof Array
        ? cloneArray(source)
        : typeof source == 'object' ? cloneObject(source) : source;
}

/**
 * Clones object recursively
 * @param source {Object} Object to clone
 * @returns {Object} Object clone
 */
function cloneObject(source) {
    var result = {};
    for(var prop in source)
        if (source.hasOwnProperty(prop))
            result[prop] = clone(source[prop]);

    return result;
}

/**
 * Clones array recursively
 * @param source {Array} Array to clone
 * @returns {Array} Array clone
 */
function cloneArray(source) {
    var result = [];
    for(var i = 0; i < source.length; i++)
        result.push(clone(source[i]));

    return result;
}
