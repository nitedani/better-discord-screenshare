import SettingField from "../settingfield";
/**
 * Creates a file picker using chromium's default.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */
declare class FilePicker extends SettingField {
    /**
     * @param {string} name - name label of the setting
     * @param {string} note - help/note to show underneath or above the setting
     * @param {callable} onChange - callback to perform on setting change, callback receives File object
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     * @param {Array<string>|string} [options.accept] - what file types should be accepted
     * @param {boolean} [options.multiple=false] - should multiple files be accepted
     */
    constructor(name: any, note: any, onChange: any, options?: {});
}
export default FilePicker;
