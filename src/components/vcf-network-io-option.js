import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

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
      <span class$="type [[type]]">[[type]]</span>
    `;
  }

  static get is() {
    return 'vcf-network-io-option';
  }

  static get properties() {
    return {
      label: Object,
      type: Object
    };
  }
}

customElements.define(VcfNetworkIOOption.is, VcfNetworkIOOption);
