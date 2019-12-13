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
 * Top bar of VCF Network.
 * Displays breadcrumb links for context/hierarchy levels.
 * A new breadcrumb is added every time you enter a nested component.
 */
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

        :host([hidden]) {
          display: none !important;
        }

        .breadcrumbs-container {
          display: flex;
          height: 25px;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          background-color: var(--lumo-base-color);
          border-bottom: 1px solid var(--lumo-shade-20pct);
          color: var(--lumo-primary-text-color);
          font-size: var(--lumo-font-size-s);
          font-weight: 500;
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
      <div class="breadcrumbs-container">
        <div id="root" class$="[[_rootStyle(context)]]">Root</div>
        <div id="container">
          <template is="dom-repeat" items="[[context]]">
            <iron-icon icon="vcf-network:keyboard-arrow-right"></iron-icon>
            <span class$="[[_itemStyle(index, context)]]" data-index="[[index]]">[[item.component.label]]</span>
          </template>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-breadcrumbs';
  }

  static get properties() {
    return {
      context: {
        type: Array,
        notify: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.root.addEventListener('click', e => {
      if (!this.$.root.classList.contains('active')) {
        this.context = [];
      }
    });
    this.$.container.addEventListener('click', e => {
      const el = e.target;
      if (el.tagName === 'SPAN' && !el.classList.contains('active')) {
        this.context = this.context.slice(0, el.dataIndex + 1);
      }
    });
  }

  _itemStyle(index, context) {
    let classes = 'item';
    if (index === context.length - 1) {
      classes += ' active';
    }
    return classes;
  }

  _rootStyle(context) {
    let classes = 'item';
    if (!context.length) {
      classes += ' active';
    }
    return classes;
  }
}

customElements.define(VcfNetworkBreadcrumbs.is, VcfNetworkBreadcrumbs);
