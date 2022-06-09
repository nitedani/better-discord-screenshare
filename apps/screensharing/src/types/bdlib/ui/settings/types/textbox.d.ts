import SettingField from "../settingfield";
/**
 * Creates a textbox using discord's built in textbox.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */
declare class Textbox extends SettingField {
    /**
     * @param {string} name - name label of the setting
     * @param {string} note - help/note to show underneath or above the setting
     * @param {string} value - current text in box
     * @param {callable} onChange - callback to perform on setting change, callback receives text
     * @param {object} [options] - object of options to give to the setting
     * @param {string} [options.placeholder=""] - placeholder for when textbox is empty
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     */
    constructor(name: any, note: any, value: any, onChange: any, options?: {});
}
export default Textbox;
