import Selector from "./selector";
/**
 * Representation of a Class Name
 * @memberof module:DOMTools
 **/
declare class ClassName {
    /**
     *
     * @param {string} name - name of the class to represent
     */
    constructor(name: any);
    /**
     * Concatenates new class names to the current one using spaces.
     * @param {string} classNames - list of class names to add to this class name
     * @returns {ClassName} returns self to allow chaining
     */
    add(...classNames: any[]): this;
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */
    toString(): any;
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */
    valueOf(): any;
    /**
     * Returns the classname represented as {@link module:DOMTools.Selector}.
     * @returns {Selector} selector representation of this class name.
     */
    get selector(): Selector;
    get single(): any;
    get first(): any;
}
export default ClassName;
