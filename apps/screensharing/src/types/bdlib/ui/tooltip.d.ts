/**
 * Tooltip that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a MutationObserver.
 *
 * Note this is not using Discord's internals but normal DOM manipulation and emulates
 * Discord's own tooltips as closely as possible.
 *
 * @module Tooltip
 */
export default class Tooltip {
    /**
     *
     * @constructor
     * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
     * @param {string} tip - string to show in the tooltip
     * @param {object} options - additional options for the tooltip
     * @param {string} [options.style=black] - correlates to the discord styling/colors (black, brand, green, grey, red, yellow)
     * @param {string} [options.side=top] - can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.isTimestamp=false] - adds the timestampTooltip class (disables text wrapping)
     * @param {boolean} [options.disablePointerEvents=false] - disables pointer events
     * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
     */
    constructor(node: any, text: any, options?: {});
    /** Alias for the constructor */
    static create(node: any, text: any, options?: {}): Tooltip;
    /** Container where the tooltip will be appended. */
    get container(): any;
    /** Boolean representing if the tooltip will fit on screen above the element */
    get canShowAbove(): boolean;
    /** Boolean representing if the tooltip will fit on screen below the element */
    get canShowBelow(): boolean;
    /** Boolean representing if the tooltip will fit on screen to the left of the element */
    get canShowLeft(): boolean;
    /** Boolean representing if the tooltip will fit on screen to the right of the element */
    get canShowRight(): boolean;
    /** Hides the tooltip. Automatically called on mouseleave. */
    hide(): void;
    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */
    show(): void;
    /** Force showing the tooltip above the node. */
    showAbove(): void;
    /** Force showing the tooltip below the node. */
    showBelow(): void;
    /** Force showing the tooltip to the left of the node. */
    showLeft(): void;
    /** Force showing the tooltip to the right of the node. */
    showRight(): void;
    centerHorizontally(): void;
    centerVertically(): void;
}
