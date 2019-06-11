import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

class VcfNetworkBreadcrumbs extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          font-size: var(--lumo-font-size-s);
        }

        .breadcrumbs-container {
          height: 24px;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          background-color: var(--lumo-base-color);
          border-bottom: 1px solid var(--lumo-shade-20pct);
        }
      </style>
      <div id="main" class="breadcrumbs-container">
        Root
      </div>
    `;
  }

  static get is() {
    return 'vcf-hn-breadcrumbs';
  }

  static get properties() {
    return {
      _parent: {
        type: Object,
        observer: '_parentChanged'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _parentChanged() {
    this.style.left = `${this._parent.$.toolpanel.clientWidth}px`;
    this.style.right = `${this._parent.$.infopanel.clientWidth}px`;
  }
}

customElements.define(VcfNetworkBreadcrumbs.is, VcfNetworkBreadcrumbs);
