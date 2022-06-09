/**
 * Representation of a Selector
 * @memberof module:DOMTools
 **/
declare class Selector {
    /**
     *
     * @param {string} classname - class to create selector for
     */
    constructor(className: any);
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */
    toString(): any;
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */
    valueOf(): any;
    selector(symbol: any, other: any): this;
    /**
     * Adds another selector as a direct child `>` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as child
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    child(other: any): this;
    /**
     * Adds another selector as a adjacent sibling `+` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as adjacent sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    adjacent(other: any): this;
    /**
     * Adds another selector as a general sibling `~` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    sibling(other: any): this;
    /**
     * Adds another selector as a descendent `(space)` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as descendent
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    descend(other: any): this;
    /**
     * Adds another selector to this one via `,`.
     * @param {string|DOMTools.Selector} other - Selector to add
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    and(other: any): this;
}
export default Selector;
