import Listenable from "../../structs/listenable";
/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */
declare class SettingGroup extends Listenable {
    /**
     * @param {string} groupName - title for the group of settings
     * @param {object} [options] - additional options for the group
     * @param {callback} [options.callback] - callback called on settings changed
     * @param {boolean} [options.collapsible=true] - determines if the group should be collapsible
     * @param {boolean} [options.shown=false] - determines if the group should be expanded by default
     */
    constructor(groupName: any, options?: {});
    /** @returns {HTMLElement} - root node for the group. */
    getElement(): any;
    /**
     * Adds multiple nodes to this group.
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes - list of nodes to add to the group container
     * @returns {module:Settings.SettingGroup} - returns self for chaining
     */
    append(...nodes: any[]): this;
    /**
     * Appends this node to another
     * @param {HTMLElement} node - node to attach the group to.
     * @returns {module:Settings.SettingGroup} - returns self for chaining
     */
    appendTo(node: any): this;
    /** Fires onchange to listeners */
    onChange(): void;
}
export default SettingGroup;
