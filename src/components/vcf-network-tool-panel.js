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
      <style include="lumo-typography">
        :host {
          box-shadow: inset -1px 0 0 0 var(--lumo-shade-10pct);
          display: block;
          overflow: auto;
          width: 240px;
          flex-shrink: 0;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Section */
        .section:not(.collapsed) {
          padding-bottom: var(--lumo-space-s);
        }

        .section:not(:last-child) {
          box-shadow: inset 0 -1px 0 0 var(--lumo-shade-10pct);
        }

        .section.collapsed .section-items {
          max-height: 0 !important;
        }

        /* Section header */
        .section-header {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: var(--lumo-size-l);
          padding: 0 var(--lumo-space-m);
        }

        .section-header h6 {
          color: var(--lumo-secondary-text-color);
          margin: 0 auto 0 0;
        }

        .section-header iron-icon {
          color: var(--lumo-secondary-text-color);
          transition: all 0.2s;
        }

        .section.collapsed .section-header iron-icon {
          transform: rotate(180deg);
        }

        /* Section items */
        .section-items {
          overflow: hidden;
          transform-origin: top;
          transition: all 0.2s;
        }

        .section-item {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: var(--lumo-size-l);
          padding: 0 var(--lumo-space-m);
          transition: all 0.2s;
        }

        .section-item iron-icon {
          color: var(--lumo-primary-color);
          margin-right: var(--lumo-space-m);
        }

        .section-item vcf-network-color-option {
          margin-right: var(--lumo-space-m);
        }

        .section-item span {
          color: var(--lumo-body-text-color);
          font-size: var(--lumo-font-size-s);
          transition: all 0.2s;
        }

        .section:first-child .section-item span::first-letter {
          text-decoration: underline;
        }

        .section-item:hover {
          background-color: var(--lumo-shade-5pct);
        }

        .section-item.active {
          background-color: var(--lumo-primary-color-10pct);
        }

        .section-item.active span {
          color: var(--lumo-primary-text-color);
          font-weight: 500;
        }

        iron-icon.green {
          color: var(--lumo-success-text-color);
        }

        iron-icon.red {
          color: var(--lumo-error-text-color);
        }
      </style>
      <div class="panel-container">
        <div class="section">
          <div class="section-header">
            <h6>Default</h6>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items">
            <div id="add-node" class="section-item">
              <iron-icon icon="editor:format-shapes"></iron-icon>
              <span>Node</span>
            </div>
            <div id="add-input-node" class="section-item">
              <iron-icon icon="icons:exit-to-app" class="green"></iron-icon>
              <span>Input Node</span>
            </div>
            <div id="add-output-node" class="section-item">
              <iron-icon icon="icons:exit-to-app" class="red"></iron-icon>
              <span>Output Node</span>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="section-header">
            <h6>Custom</h6>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items" id="custom">
            <template is="dom-if" if="{{components}}">
              <div class="section-item">
                <vcf-network-color-option color="[[components.componentColor]]" class="icon"></vcf-network-color-option>
                <span>[[components.label]]</span>
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

  get _sectionItems() {
    return this.shadowRoot.querySelectorAll('.section-item');
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
    this.$['add-node'].addEventListener('click', () => this._addNode());
    this.$['add-input-node'].addEventListener('click', () => this._addNode('input'));
    this.$['add-output-node'].addEventListener('click', () => this._addNode('output'));
  }

  _initToolbar() {
    // Set max-height of section-items for collapse animation
    const sectionItems = this.shadowRoot.querySelector('.section-items');
    sectionItems.style.maxHeight = `${sectionItems.clientHeight}px`;
  }

  _addNode(type = true) {
    let button = 'add-node';
    if (type === 'input' || type === 'output') {
      button = `add-${type}-node`;
    }
    this._setMode(this.$[button], 'addingNode', type);
  }

  _addComponent(item) {
    this._setMode(item, 'addingComponent', this.components);
  }

  _setMode(item, mode, value) {
    this.clear();
    if (item.classList.contains('active')) {
      item.classList.remove('active');
    } else {
      item.classList.add('active');
      this.main[mode] = value;
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
      if (Array.isArray(components)) {
        this.set('components', components[0].nodes[0]);
      }
    }
  }
}

customElements.define(VcfNetworkToolPanel.is, VcfNetworkToolPanel);
