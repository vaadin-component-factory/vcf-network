import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

class VcfHNBreadcrumbs extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          left: 201px;
          right: 201px;
          font-size: var(--lumo-font-size-s);
        }

        .breadcrumbs-container {
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
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

customElements.define(VcfHNBreadcrumbs.is, VcfHNBreadcrumbs);
