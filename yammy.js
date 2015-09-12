'use strict';

// TODO: ? Implement using default mappings from Yammy object instance
// TODO: ! Implement entity validation before yammy initialization

var builtInConverters = require('built-in-converters.js'),
    errors = require('errors.js'),
    utils = require('utils.js');

/**
 * yammy mapper constructor
 * @param config {IYammyConfiguration|Object.<String, YammyEntityDefinition>}
 * @param [adapters] {Object.<String, IYammyAdapter>}
 * @param [converters] {Object.<String, YammyValueConverter>}
 * @constructor
 */
function Yammy(config, adapters, converters) {
    if (!arguments.length)
        throw errors.invalidArguments();

    if (arguments.length === 1) {
        this.adapters = loadAdapters(config.adapters);
        this.converters = utils.extend(null, builtInConverters, config.converters);
        this.entities = config.entities || {}
    }
    else {
        this.adapters = loadAdapters(adapters || {});
        this.converters = utils.extend(null, builtInConverters, converters);
        this.entities = config || {};
    }
}

Yammy.prototype = {
    /**
     * Executes query && maps it to produces entities
     * @param query {String} Query to execute
     * @returns {YammyQuery}
     */
    query: function (query) {
        return new YammyQuery(this, query);
    }
};

function loadAdapters(adapters) {
    return utils.map(adapters, function (adapter, name) {
        if (typeof adapter == 'string')
            return require(adapter);
        else if (typeof adapter == 'function')
            return new adapter(name);
        else return adapter;
    });
}

/** @type {YammyMappingOptions} */
var defaultQueryOptions = {
    silentConversionErrors: false,
    skipNonPresentFields: false
};

function YammyQuery(yammy, query){
    /** @type Yammy */
    this._yammy = yammy;

    /** @type IYammyAdapter */
    this._adapter = yammy.adapters.length === 1 ? yammy.adapters[0] : null;

    /** @type YammyEntityDefinition */
    this._entity = null;

    /** @type YammyMappingOptions */
    this._options = defaultQueryOptions;

    /** @type YammyCompiledMapping */
    this._mapping = null;

    /** @type {Object.<String, YammyValueConverter>} */
    this._converters = null;

    /** @type String */
    this.query = query;
}

YammyQuery.prototype = {
    /**
     * Sets result entity
     * @param entity {String|YammyEntityDefinition} Entity to use for result conversion
     * @returns {YammyQuery}
     */
    'for': function (entity) {
        for(var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg == 'string')
                arg = this._yammy.entities[arg];

            this._entity = arg || null;
        }

        return this;
    },

    /**
     * Sets adapter to use for query
     * @param adapter {String|IYammyAdapter}
     * @returns {YammyQuery}
     */
    usingAdapter: function(adapter) {
        if (typeof adapter == 'string')
            this._adapter = this._yammy.adapters.filter(function (a) { return a.name == adapter; })[0];
        else
            this._adapter = adapter;

        return this;
    },

    /**
     * Sets query mapping options
     * @param options
     * @returns {YammyQuery}
     */
    withOptions: function (options) {
        this._options = utils.extend(this._options, options);
        return this;
    },

    /**
     * Executes query
     * @param queryParameters {Object.<String, *>} query parameters
     * @param callback {function(Error, Array)}
     */
    execute: function (queryParameters, callback) {
        var self = this;
        this._adapter.query(this.query, queryParameters, function (err, /** @type IYammyQueryResultWrapper */wrapper) {
            if (err) {
                callback(err, null);
                return;
            }

            if (!self._mapping) {
                self._converters = mapConverters(self._entity, self._yammy.converters);
                self._mapping = createMapping(self._entity, self._yammy.converters, self._options, wrapper);
            }

            var result = [];
            while(wrapper.nextRow()) {
                var entity;
                try {
                    entity = new self._mapping(wrapper, self._converters);

                }
                catch(ex) {
                    callback(ex, null);
                    return;
                }

                result.push(entity);
            }

            callback(null, result);
        });
    }
};

var eoln = ';\r\n';

function mapConverters(entity, converters) {
    var result = {};
    utils.forEach(entity, function (/** @type IYammyEntityFieldDefinition */ fieldDefinition, /** @type String */ fieldName, entity) {
        if (!fieldDefinition.hasOwnProperty('converter')) return;

        result[fieldName] = typeof fieldDefinition.converter == 'string'
            ? converters[fieldDefinition.converter]
            : fieldDefinition.converter;
    });

    return result;
}

/**
 * Creates mapping
 * @param entity {YammyEntityDefinition}
 * @param converters {String|Object.<String, YammyValueConverter>}
 * @param options {YammyMappingOptions}
 * @param wrapper {IYammyQueryResultWrapper}
 * @returns {YammyCompiledMapping}
 */
function createMapping(entity, converters, options, wrapper) {
    var fnBodyLines = [];

    utils.forEach(entity, function(/** @type IYammyEntityFieldDefinition */ fieldDefinition, fieldName) {
        if (!wrapper.hasField(fieldDefinition.source) && options.skipNonPresentFields)
            return;

        fnBodyLines.push('this["' + fieldName + '"] = ');

        if (wrapper.hasField(fieldDefinition.source)) {
            if (fieldDefinition.converter)
                fnBodyLines.push('converters["' + fieldName + '"](wrapper.getValue("' + fieldDefinition.source + '"))');
            else
                fnBodyLines.push('wrapper.getValue("' + fieldDefinition.source + '")');
        }
        else fnBodyLines.push(getDefaultValue(fieldDefinition.type));

        fnBodyLines.push(eoln);
    });

    var fnBodyText = fnBodyLines.join();
    return new Function('wrapper', 'converters', fnBodyText);
}

function getDefaultValue(type) {
    if (type == 'number') return '0';
    if (type == 'boolean') return 'false';
    return 'null';
}

exports = Yammy;
