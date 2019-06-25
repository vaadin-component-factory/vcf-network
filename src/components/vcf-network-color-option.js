import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { colors, colorVars } from '../util/vcf-network-shared';

class VcfNetworkColorOption extends ThemableMixin(PolymerElement) {
  static get template() {
    colors();
    return html`
      <style include="vcf-network-colors">
        :host {
          border-radius: 50%;
          box-shadow: inset 0 0 0 1px var(--lumo-contrast-20pct);
          display: block;
          height: var(--lumo-icon-size-m);
          width: var(--lumo-icon-size-m);
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
    this.style.backgroundColor = `var(${colorVars[color].name})`;
  }
}

customElements.define(VcfNetworkColorOption.is, VcfNetworkColorOption);
