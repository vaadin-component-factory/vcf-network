import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';

class VcfNetworkToolPanel extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="lumo-typography">
        .panel-container {
          box-shadow: inset -1px 0 0 0 var(--lumo-shade-10pct);
          display: flex;
          flex-direction: column;
          overflow: auto;
          width: 240px;
          flex-shrink: 0;
          height: 100%;
          transition: width 0.2s;
        }
        .panel-container.add-node-toggle .section-item.active {
          animation: active 5s linear infinite;
        }
        @keyframes active {
          0% {
            box-shadow: inset 0px 0px 0px 1px var(--lumo-shade-10pct);
          }
          50% {
            box-shadow: inset 0px 0px 20px 2px var(--lumo-shade-20pct);
          }
          100% {
            box-shadow: inset 0px 0px 0px 1px var(--lumo-shade-10pct);
          }
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
          padding-left: var(--lumo-space-m);
          transition: all 0.2s;
        }
        iron-icon.blue,
        iron-icon.green,
        iron-icon.red {
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
        iron-icon.blue {
          color: var(--lumo-primary-color);
        }
        iron-icon.green {
          color: var(--lumo-success-text-color);
        }
        iron-icon.red {
          color: var(--lumo-error-text-color);
        }
        .section-item {
          display: flex;
          align-items: center;
        }
        .section-item div {
          flex-grow: 1;
          display: flex;
        }
        .hidden {
          display: none;
        }
        .edit-hidden .edit-template,
        .edit-hidden .delete-template,
        .edit-hidden #new-template-button {
          display: none;
        }
        .section-grow {
          flex-grow: 1;
        }
        .template-item {
          margin: var(--lumo-space-s) var(--lumo-space-m);
        }
        .section-footer {
          text-align: right;
          cursor: pointer;
        }
        .no-templates {
          margin: var(--lumo-space-s) var(--lumo-space-m);
          color: var(--lumo-disabled-text-color);
        }
        /** Closed **/
        .panel-container.closed {
          width: 36px;
        }
        .closed span,
        .closed h6,
        .closed #template-panel {
          display: none;
        }
        .closed .section-header {
          padding: 0;
          justify-content: center;
        }
        .closed .section-header,
        .closed .section-item {
          padding: 0;
          justify-content: center;
        }
        .closed iron-icon.blue,
        .closed iron-icon.green,
        .closed iron-icon.red {
          margin-right: 0;
        }
        .closed .section-footer iron-icon {
          transform: rotate(180deg);
        }
        .closed .section-footer {
          text-align: center;
        }
      </style>
      <div id="tool-panel" class="panel-container">
        <div class="section">
          <div class="section-header">
            <h6>Default</h6>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items">
            <div id="add-node" class="section-item">
              <iron-icon icon="editor:format-shapes" class="blue"></iron-icon>
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
        <div id="template-panel" class="section edit-hidden">
          <div class="section-header">
            <h6>Template</h6>
            <iron-icon icon="hardware:keyboard-arrow-down"></iron-icon>
          </div>
          <div class="section-items" id="custom">
            <template is="dom-if" if="[[components.length]]">
              <template is="dom-repeat" items="[[components]]" on-dom-change="_initToolbar">
                <div class="section-item">
                  <div on-click="_addComponentListener">
                    <vcf-network-color-option color="[[item.componentColor]]" class="icon"></vcf-network-color-option>
                    <span>[[item.label]]</span>
                  </div>
                  <vaadin-button
                    class="edit-template"
                    theme="tertiary small"
                    title="Edit template"
                    on-click="_updateTemplateListener"
                  >
                    <iron-icon icon="icons:create" slot="prefix"></iron-icon>
                  </vaadin-button>
                  <vaadin-button
                    class="delete-template"
                    theme="tertiary error small"
                    title="Delete template"
                    on-click="_deleteTemplateListener"
                  >
                    <iron-icon icon="icons:delete" slot="prefix"></iron-icon>
                  </vaadin-button>
                </div>
              </template>
            </template>
            <template is="dom-if" if="[[!components.length]]" on-dom-change="_initToolbar">
              <div class="no-templates">No templates</div>
            </template>
            <div id="new-template-button" class="template-item">
              <vaadin-button style="flex-grow:1;" title="Add template" on-click="_addTemplateListener">
                <iron-icon icon="icons:add" slot="prefix"></iron-icon>
                New template
              </vaadin-button>
            </div>
          </div>
        </div>
        <div class="section section-grow"></div>
        <div class="section-footer">
          <iron-icon icon="hardware:keyboard-arrow-left"></iron-icon>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-tool-panel';
  }

  static get properties() {
    return {
      addNodeToggle: {
        type: Boolean,
        observer: '_addNodeToggleChanged'
      },
      components: {
        type: Array,
        value: []
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

  clear(exclude = null) {
    this._sectionItems.forEach(item => {
      if (!exclude || (exclude && exclude !== item)) item.classList.remove('active');
    });
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
    const sectionFooters = this.shadowRoot.querySelectorAll('.section-footer');
    sectionFooters.forEach(footer => {
      const section = footer.parentElement;
      footer.addEventListener('click', () => {
        if (section.classList.contains('closed')) {
          section.classList.remove('closed');
        } else {
          section.classList.add('closed');
        }
        this.main._network.redraw();
      });
    });
    /* buttons */
    this.$['add-node'].addEventListener('click', () => this._addNode());
    this.$['add-input-node'].addEventListener('click', () => this._addNode('input'));
    this.$['add-output-node'].addEventListener('click', () => this._addNode('output'));
  }

  _initToolbar() {
    // Set max-height of sections for collapse animation
    const sections = this.shadowRoot.querySelectorAll('.section-items');
    sections.forEach(section => {
      section.style.maxHeight = 'unset';
      section.style.maxHeight = `${section.clientHeight}px`;
    });
  }

  _addNode(type = true) {
    let button = 'add-node';
    if (type === 'input' || type === 'output') {
      button = `add-${type}-node`;
      this.main._nodeType = type;
    } else {
      this.main._nodeType = '';
    }
    this._setMode(this.$[button], 'addingNode');
  }

  _addComponentListener(event) {
    var sectionItem = event.target.matches('.section-item') ? event.target : event.target.parentElement;
    sectionItem = sectionItem.matches('.section-item') ? sectionItem : sectionItem.parentElement;
    this.main._componentTemplate = event.model.item;
    this._setMode(sectionItem, 'addingComponent');
  }

  _setMode(item, mode) {
    this.clear(item);
    if (item.classList.contains('active')) {
      item.classList.remove('active');
      this.main[mode] = false;
    } else {
      item.classList.add('active');
      this.main[mode] = true;
    }
  }

  /**
   * call new-template-event
   */
  _addTemplateListener() {
    const evt = new CustomEvent('vcf-network-new-template', {
      cancelable: true
    });
    const cancelled = !this.main.dispatchEvent(evt);
    if (!cancelled) {
      // JCG todo default behaviour for the client side
      this.confirmAddTemplate({ label: 'new template' });
    }
  }

  /**
   * Refresh the client model
   */
  confirmAddTemplate(component) {
    const components = this.components;
    this.components = [];
    components.push(component);
    this.components = components;
    console.info('template added');
  }

  /**
   * call delete-template-event
   */
  _deleteTemplateListener(event) {
    const evt = new CustomEvent('vcf-network-delete-template', {
      detail: { id: event.model.item.id },
      cancelable: true
    });
    const cancelled = !this.main.dispatchEvent(evt);
    if (!cancelled) {
      this.confirmDeleteTemplate(event.model.item.id);
    }
  }

  /**
   * Refresh the client model
   */
  confirmDeleteTemplate(id) {
    this.components = this.components.filter(template => template.id !== id);
  }

  /**
   * call update-template-event
   */
  _updateTemplateListener(event) {
    const evt = new CustomEvent('vcf-network-update-template', {
      detail: { id: event.model.item.id },
      cancelable: true
    });
    const cancelled = !this.main.dispatchEvent(evt);
    if (!cancelled) {
      this.confirmUpdateTemplate(event.model.item);
    }
  }

  confirmUpdateTemplate(component) {
    const index = this.components.findIndex(item => item.id === component.id);
    const components = this.components;
    this.components.splice(index, 1, component);
    this.components = [];
    this.components = components;
    console.info(`template updated component=${component}`);
  }

  hideEditTemplateButton() {
    this.$['template-panel'].classList.add('edit-hidden');
  }

  showEditTemplateButton() {
    this.$['template-panel'].classList.remove('edit-hidden');
  }

  hideTemplatePanel() {
    this.$['template-panel'].classList.add('hidden');
  }

  showTemplatePanel() {
    this.$['template-panel'].classList.remove('hidden');
  }

  closePanel() {
    this.$['tool-panel'].classList.add('closed');
  }

  openPanel() {
    this.$['tool-panel'].classList.remove('closed');
  }

  _addNodeToggleChanged(addNodeToggle) {
    if (addNodeToggle) this.$['tool-panel'].classList.add('add-node-toggle');
    else this.$['tool-panel'].classList.remove('add-node-toggle');
  }
}

customElements.define(VcfNetworkToolPanel.is, VcfNetworkToolPanel);
