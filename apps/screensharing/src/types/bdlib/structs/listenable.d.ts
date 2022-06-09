/**
 * Acts as an interface for anything that should be listenable.
 */
declare class Listenable {
    constructor();
    /**
     * Adds a listener to the current object.
     * @param {callable} callback - callback for when the event occurs
     * @returns {callable} - a way to cancel the listener without needing to call `removeListener`
     */
    addListener(callback: any): (() => void) | undefined;
    /**
     * Removes a listener from the current object.
     * @param {callable} callback - callback that was originally registered
     */
    removeListener(callback: any): void;
    /**
     * Alerts the listeners that an event occurred. Data passed is optional
     * @param {*} [...data] - Any data desired to be passed to listeners
     */
    alertListeners(...data: any[]): void;
}
export default Listenable;
