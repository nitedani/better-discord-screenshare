import SettingField from "../settingfield";
/**
 * @interface
 * @name module:Settings~DropdownItem
 * @property {string} label - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 */
/**
 * Creates a dropdown using discord's built in dropdown.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */
declare class Dropdown extends SettingField {
    /**
     * @param {string} name - name label of the setting
     * @param {string} note - help/note to show underneath or above the setting
     * @param {*} defaultValue - currently selected value
     * @param {Array<module:Settings~DropdownItem>} values - array of all options available
     * @param {callable} onChange - callback to perform on setting change, callback item value
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.clearable=false] - should be able to empty the field value
     * @param {boolean} [options.searchable=false] - should user be able to search the dropdown
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     */
    constructor(name: any, note: any, defaultValue: any, values: any, onChange: any, options?: {});
}
export default Dropdown;
