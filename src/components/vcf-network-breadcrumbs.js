import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

class VcfNetworkBreadcrumbs extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          align-items: center;
          box-shadow: inset 0 -1px 0 0 var(--lumo-shade-10pct);
          display: flex;
          flex-shrink: 0;
          height: var(--lumo-size-l);
          padding: 0 var(--lumo-space-m);
        }

        span {
          font-size: var(--lumo-font-size-s);
          font-weight: 500;
        }

        .breadcrumbs-container {
          display: flex;
          height: 24px;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          background-color: var(--lumo-base-color);
          border-bottom: 1px solid var(--lumo-shade-20pct);
          color: var(--lumo-primary-text-color);
        }

        .breadcrumbs-container iron-icon {
          margin: 0 var(--lumo-space-s);
        }

        .breadcrumbs-container .active {
          color: var(--lumo-secondary-text-color);
        }

        .breadcrumbs-container .item:not(.active):hover {
          text-decoration: underline;
          cursor: pointer;
        }
      </style>
      <div id="main" class="breadcrumbs-container">
        <div id="root" class$="[[_setRootClasses(context)]]">Root</div>
        <template is="dom-repeat" items="[[context]]">
          <iron-icon icon="hardware:keyboard-arrow-right"></iron-icon>
          <span class$="[[_setClasses(index)]]">[[item.label]]</span>
        </template>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-breadcrumbs';
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
    this.$.root.addEventListener('click', e => {
      if (!this.$.root.classList.contains('active')) {
        this._parent._loadRoot();
      }
    });
  }

  _parentChanged() {}

  _setClasses(index) {
    let classes = 'item';
    if (index === this.context.length - 1) {
      classes += ' active';
    }
    return classes;
  }

  _setRootClasses(context) {
    let classes = 'item';
    if (!context.length) {
      classes += ' active';
    }
    return classes;
  }
}

customElements.define(VcfNetworkBreadcrumbs.is, VcfNetworkBreadcrumbs);
