//@ts-nocheck

import SettingField from "../settingfield";
import { DiscordModules } from "../../../modules";

/**
 * Creates a keybind setting using discord's built in keybind recorder.
 * @memberof module:Settings=
 * @extends module:Settings.SettingField
 */
class Keybind extends SettingField {
  /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {Array<number>} value - array of keycodes
   * @param {callable} onChange - callback to perform on setting change, callback receives array of keycodes
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */
  constructor(label, help, value, onChange, options = {}) {
    const { disabled = false } = options;
    super(label, help, onChange, DiscordModules.Keybind, {
      disabled: disabled,
      defaultValue: value.map((a) => [0, a || 0, 1]),
      onChange: (element) => (val) => {
        if (!Array.isArray(val)) return;
        element.props.value = val;
        this.onChange(val.map((a) => a[1]));
      },
    });
  }
}

export default Keybind;
