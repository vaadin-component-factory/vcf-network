import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

class VcfNetworkIOPanel extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          width: 160px;
          height: 100%;
        }

        :host([hidden]) {
          display: none !important;
        }

        h6 {
          text-align: center;
          font-size: var(--lumo-font-size-xs);
          margin: 0;
          padding: var(--lumo-space-s) 0;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--lumo-secondary-text-color);
        }

        .io-container {
          height: 100%;
          border: 1px dashed var(--lumo-shade-10pct);
          border-width: 0 2px 0 0;
          background: var(--lumo-shade-5pct);
        }

        .io-container.output {
          border-width: 0 0 0 2px;
        }
      </style>
      <div id="container" class="io-container">
        <h6>[[label]]</h6>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-io-panel';
  }

  static get properties() {
    return {
      output: {
        type: Boolean,
        value: false
      },
      label: {
        type: String,
        value: 'input'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.output) {
      this.label = 'output';
      this.$.container.classList.add('output');
    }
  }
}

customElements.define(VcfNetworkIOPanel.is, VcfNetworkIOPanel);
