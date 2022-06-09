import Listenable from "../../structs/listenable";
import { DiscordModules } from "../../modules";
/**
 * Setting field to extend to create new settings
 * @memberof module:Settings
 */
declare class SettingField extends Listenable {
    /**
     * @param {string} name - name label of the setting
     * @param {string} note - help/note to show underneath or above the setting
     * @param {callable} onChange - callback to perform on setting change
     * @param {(ReactComponent|HTMLElement)} settingtype - actual setting to render
     * @param {object} [props] - object of props to give to the setting and the settingtype
     * @param {boolean} [props.noteOnTop=false] - determines if the note should be shown above the element or not.
     */
    constructor(name: any, note: any, onChange: any, settingtype: any, props?: {});
    /** @returns {HTMLElement} - root element for setting */
    getElement(): any;
    /** Fires onchange to listeners */
    onChange(): void;
    /** Fired when root node added to DOM */
    onAdded(): void;
    /** Fired when root node removed from DOM */
    onRemoved(): void;
}
export default SettingField;
declare class ReactSetting extends DiscordModules.React.Component {
    get noteElement(): any;
    get dividerElement(): any;
    render(): any;
}
export { ReactSetting };
