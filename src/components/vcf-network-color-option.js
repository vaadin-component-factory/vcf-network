/**
 * @license
 * Copyright (C) 2015 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 * See the file LICENSE.md distributed with this software for more information about licensing.
 * See [the website]{@link https://vaadin.com/license/cval-3} for the complete license.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { addColorStyles, colorVars } from '../utils/vcf-network-shared';

/**
 * Displays component color option.
 * Used in drop downs or for displaying color of component templates.
 * @private
 */
class VcfNetworkColorOption extends ThemableMixin(PolymerElement) {
  static get template() {
    addColorStyles();
    return html`
      <style include="vcf-network-colors">
        :host {
          border-radius: 50%;
          box-shadow: inset 0 0 0 1px var(--lumo-contrast-20pct);
          display: block;
          height: var(--lumo-icon-size-m);
          width: var(--lumo-icon-size-m);
        }

        :host([disabled]) {
          opacity: 0.5;
        }
      </style>
    `;
  }

  static get is() {
    return 'vcf-network-color-option';
  }

  static get properties() {
    return {
      color: {
        type: String,
        observer: '_colorChanged'
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  _colorChanged(color) {
    this.style.backgroundColor = `var(${colorVars[color].name})`;
  }
}

customElements.define(VcfNetworkColorOption.is, VcfNetworkColorOption);
