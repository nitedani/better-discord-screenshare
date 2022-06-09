/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */
/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */
export declare class Filters {
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {Array<string>} props - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byProperties(props: any, filter?: (m: any) => any): (module: any) => boolean;
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
     * @param {Array<string>} fields - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
     */
    static byPrototypeFields(fields: any, filter?: (m: any) => any): (module: any) => boolean;
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
     * @param {RegExp} search - A RegExp to check on the module
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byCode(search: any, filter?: (m: any) => any): (module: any) => boolean;
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
     * @param {...String} search - A RegExp to check on the module
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
     */
    static byString(...strings: any[]): (module: any) => boolean;
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {string} name - Name the module should have
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byDisplayName(name: any): (module: any) => any;
    /**
     * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
     * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
     * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
     */
    static combine(...filters: any[]): (module: any) => boolean;
}
export default class WebpackModules {
    static find(filter: any, first?: boolean): never[] | undefined;
    static findAll(filter: any): never[] | undefined;
    static findByUniqueProperties(props: any, first?: boolean): never[] | undefined;
    static findByDisplayName(name: any): never[] | undefined;
    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModule(filter: any, first?: boolean): never[] | undefined;
    /**
     * Gets the index in the webpack require cache of a specific
     * module using a filter.
     * @param {Function} filter A function to use to filter modules
     * @return {Number|null}
     */
    static getIndex(filter: any): string | null;
    /**
     * Gets the index in the webpack require cache of a specific
     * module that was already found.
     * @param {Any} module An already acquired module
     * @return {Number|null}
     */
    static getIndexByModule(module: any): string | null;
    /**
     * Finds all modules matching a filter function.
     * @param {Function} filter A function to use to filter modules
     */
    static getModules(filter: any): never[] | undefined;
    /**
     * Finds a module by its name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static getModuleByName(name: any, fallback: any): any;
    /**
     * Finds a module by its display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static getByDisplayName(name: any): never[] | undefined;
    /**
     * Finds a module using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static getByRegex(regex: any, first?: boolean): never[] | undefined;
    /**
     * Finds a single module using properties on its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getByPrototypes(...prototypes: any[]): never[] | undefined;
    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getAllByPrototypes(...prototypes: any[]): never[] | undefined;
    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getByProps(...props: any[]): never[] | undefined;
    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getAllByProps(...props: any[]): never[] | undefined;
    /**
     * Finds a single module using a set of strings.
     * @param {...String} props Strings to use to filter modules
     * @return {Any}
     */
    static getByString(...strings: any[]): never[] | undefined;
    /**
     * Finds all modules with a set of strings.
     * @param {...String} strings Strings to use to filter modules
     * @return {Any}
     */
    static getAllByString(...strings: any[]): never[] | undefined;
    /**
     * Gets a specific module by index of the webpack require cache.
     * Best used in combination with getIndex in order to patch a
     * specific function.
     *
     * Note: this gives the **raw** module, meaning the actual module
     * is in returnValue.exports. This is done in order to be able
     * to patch modules which export a single function directly.
     * @param {Number} index Index into the webpack require cache
     * @return {Any}
     */
    static getByIndex(index: any): any;
    /**
     * Discord's __webpack_require__ function.
     */
    static get require(): any;
    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules(): any;
    static get chunkName(): string;
    static initialize(): void;
    /**
     * Adds a listener for when discord loaded a chunk. Useful for subscribing to lazy loaded modules.
     * @param {Function} listener - Function to subscribe for chunks
     * @returns {Function} A cancelling function
     */
    static addListener(listener: any): () => any;
    /**
     * Removes a listener for when discord loaded a chunk.
     * @param {Function} listener
     * @returns {boolean}
     */
    static removeListener(listener: any): any;
    static handlePush(chunk: any): any;
}
