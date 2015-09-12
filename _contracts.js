/**
 * @interface IYammyEntityFieldDefinition
 * @property name {String}
 * @property type {String}
 * @property source {String}
 * @property converter {Function|String}
 */

/** @typedef {{}.<String, IYammyEntityFieldDefinition>} YammyEntityDefinition */

/**
 * @interface IYammyConfiguration
 * @property adapters {{}.<String, *>}
 * @property [converters] {Array<Function>}
 * @property entities {{}.<String, IEntityDescription>}
 */

/**
 * @interface IYammyAdapter
 * @param name {String}
 * @param createWrapper {String}
 */

/**
 * @interface IYammyQueryResultWrapper
 * @property nextRow {function(): Boolean}
 * @property hasField {function(String): Boolean}
 * @property getValue {function(String): *}
 */

/** @typedef {function(*, Boolean): *} YammyValueConverter */
/** @typedef {function(Object.<String, YammyValueConverter>, IYammyQueryResultWrapper): *} YammyCompiledMapping */

/**
 * @typedef {Object} YammyMappingOptions
 * @property [silentConversionErrors=false] {Boolean} Silent database errors on database values conversion to entity values
 * @property [skipNonPresentFields=false] {Boolean} Skip field assignment with default values if this fields missing from query result
 */

(function () {
    // converters registration
    // entities registration
    // adapter registration
    // query result mapping
    // mapping compilation && cache support

    /** @type {{}.<String, YammyEntityDefinition>} */
    var definition = {
        'TemplateAccessory': {
            'id': 'number',
            'friendlyId': { type: 'string', source: 'placeId' },
            'position': 'number',
            'width': { type: 'number', converter: 'stringToInt' },
            'height': { type: 'number', converter: 'stringToInt' }
        },

        'ClickActionSchema': {

        },

        'ClickActionParameter': {

        },

        'ContentFormatInfo': {

        }
    };
})();