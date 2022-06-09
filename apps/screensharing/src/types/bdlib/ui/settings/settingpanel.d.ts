import Listenable from "../../structs/listenable";
/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */
declare class SettingPanel extends Listenable {
    /**
     * Creates a new settings panel
     * @param {callable} onChange - callback to fire when settings change
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
     */
    constructor(onChange: any, ...nodes: any[]);
    /**
     * Creates a new settings panel
     * @param {callable} onChange - callback to fire when settings change
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
     * @returns {HTMLElement} - root node for the panel.
     */
    static build(onChange: any, ...nodes: any[]): any;
    /** @returns {HTMLElement} - root node for the panel. */
    getElement(): any;
    /**
     * Adds multiple nodes to this panel.
     * @param {(...HTMLElement|...jQuery|...SettingField|...SettingGroup)} nodes - list of nodes to add to the panel container
     * @returns {module:Settings.SettingPanel} - returns self for chaining
     */
    append(...nodes: any[]): this;
    /** Fires onchange to listeners */
    onChange(): void;
}
export default SettingPanel;
