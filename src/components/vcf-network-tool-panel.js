import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/editor-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/social-icons';
import './vcf-network-color-option';

class VcfNetworkToolPanel extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          position: absolute;
          top: 0;
          bottom: 0;
          font-size: var(--lumo-font-size-s);
        }

        :host([hidden]) {
          display: none !important;
        }

        .panel-container {
          color: var(--lumo-secondary-text-color);
          background: var(--lumo-base-color);
          border-right: 1px solid var(--lumo-shade-20pct);
          width: 200px;
          height: 100%;
        }

        .section:first-child {
          border-bottom: 1px solid var(--lumo-shade-20pct);
        }

        .section.collapsed > .section-items {
          max-height: 0 !important;
        }

        .section.collapsed > .section-header > iron-icon {
          transform: rotate(90deg);
        }

        .section-header {
          display: flex;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          text-transform: uppercase;
          cursor: pointer;
        }

        .section-header > iron-icon {
          margin-left: auto;
          transform: rotate(0);
          transition: transform 0.2s;
        }

        .section-items {
          transform-origin: top;
          transition: max-height 0.2s;
          overflow: hidden;
        }

        .section-item {
          display: flex;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          background-color: transparent;
          transition: background-color 0.2s;
        }

        .section-item > iron-icon {
          color: var(--lumo-primary-color);
        }

        .section-item > .icon {
          margin-right: var(--lumo-space-m);
        }

        .section-item > span {
          line-height: 1;
          margin: auto 0;
        }

        .section-item-label.first::first-letter {
          text-decoration: underline;
        }

        .section-item:hover {
          cursor: pointer;
          background-color: var(--lumo-shade-5pct);
        }

        .section-item.active {
          background-color: var(--lumo-shade-10pct);
        }

        .section-item > .green {
          color: var(--lumo-error-text-color);
        }

        .section-item > .red {
          color: var(--lumo-success-text-color);
        }
      </style>
      <div id="main" class="panel-container">
        <div class="section">
          <div class="section-header">
            <span>Default</span>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items">
            <div id="add-node" class="section-item">
              <iron-icon icon="editor:format-shapes" class="icon"></iron-icon>
              <span class="section-item-label first">Node</span>
            </div>
            <div id="add-input-node" class="section-item">
              <iron-icon icon="icons:exit-to-app" class="green icon"></iron-icon>
              <span class="section-item-label first">Input Node</span>
            </div>
            <div id="add-output-node" class="section-item">
              <iron-icon icon="icons:exit-to-app" class="red icon"></iron-icon>
              <span class="section-item-label first">Output Node</span>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="section-header">
            <span>Custom</span>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items" id="custom">
            <template is="dom-if" if="{{components.length}}">
              <div class="section-item">
                <vcf-network-color-option color="2" class="icon"></vcf-network-color-option>
                <span class="section-item-label">Component</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-tool-panel';
  }

  static get properties() {
    return {
      components: {
        type: Array,
        observer: '_componentsChanged'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._initToolbar();
    this._initEventListeners();
  }

  clear() {
    this._sectionItems.forEach(item => item.classList.remove('active'));
  }

  _initEventListeners() {
    /* section-header */
    const sectionHeaders = this.shadowRoot.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
      const section = header.parentElement;
      header.addEventListener('click', () => {
        if (section.classList.contains('collapsed')) {
          section.classList.remove('collapsed');
        } else {
          section.classList.add('collapsed');
        }
      });
    });
    /* buttons */
    this.$['add-node'].addEventListener('click', this._addNode.bind(this));
  }

  _initToolbar() {
    this._sectionItems = this.shadowRoot.querySelectorAll('.section-item');
    // Set max-height of section-items for collapse animation
    const sectionItems = this.shadowRoot.querySelector('.section-items');
    sectionItems.style.maxHeight = `${sectionItems.clientHeight}px`;
  }

  _addNode() {
    this._setMode(this.$['add-node'], 'addingNode', true);
  }

  _addComponent(item) {
    this._setMode(item, 'addingComponent', this.components[0]);
  }

  _setMode(item, mode, value) {
    this.clear();
    if (item.classList.contains('active')) {
      item.classList.remove('active');
    } else {
      item.classList.add('active');
      this._parent[mode] = value;
    }
  }

  _componentsChanged(components) {
    if (components.length) {
      this.$.custom.addEventListener('click', e => {
        if (e.target.matches('.section-item') || e.target.parentElement.matches('.section-item')) {
          const item = e.target.matches('.section-item') ? e.target : e.target.parentElement;
          this._addComponent(item);
        }
      });
    }
  }
}

customElements.define(VcfNetworkToolPanel.is, VcfNetworkToolPanel);
