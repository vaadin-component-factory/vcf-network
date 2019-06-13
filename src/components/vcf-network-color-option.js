import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { colors, colorVars } from '../util/vcf-network-colors';

class VcfNetworkColorOption extends ThemableMixin(PolymerElement) {
  static get template() {
    colors();
    return html`
      <style include="vcf-network-colors">
        :host {
          display: block;
          width: calc(var(--lumo-space-s) * 2);
          height: calc(var(--lumo-space-s) * 2);
          border-radius: 50%;
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
      }
    };
  }

  _colorChanged(color) {
    this.style.backgroundColor = `var(${colorVars[color]})`;
  }
}

customElements.define(VcfNetworkColorOption.is, VcfNetworkColorOption);
