/**
 * @license
 * Copyright (C) 2015 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 * See the file LICENSE.md distributed with this software for more information about licensing.
 * See [the website]{@link https://vaadin.com/license/cval-3} for the complete license.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

/**
 * Used for displaying node options in the `vcf-network-io-dialog`.
 */
class VcfNetworkIOOption extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        .type {
          color: var(--lumo-tertiary-text-color);
          font-family: monospace;
        }
      </style>
      <span>[[label]]</span>
      <span id="type" class$="type [[type]]">[[type]]</span>
    `;
  }

  static get is() {
    return 'vcf-network-io-option';
  }

  static get properties() {
    return {
      label: Object,
      type: {
        type: String,
        observer: '_typeChanged'
      }
    };
  }

  _typeChanged(type) {
    if (type === 'input') this.$.type.style.color = 'var(--lumo-success-text-color)';
    else if (type === 'output') this.$.type.style.color = 'var(--lumo-error-text-color)';
  }
}

customElements.define(VcfNetworkIOOption.is, VcfNetworkIOOption);
