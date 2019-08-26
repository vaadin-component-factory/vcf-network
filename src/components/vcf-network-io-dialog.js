import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { Edge } from '../../utils/vcf-network-shared';
import '@vaadin/vaadin-confirm-dialog';

class VcfNetworkIODialog extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="lumo-typography">
        :host {
          display: none;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 1;
        }

        .backdrop {
          display: flex;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: var(--lumo-shade-20pct);
        }

        .dialog {
          margin: auto;
          box-shadow: 0 0 0 1px var(--lumo-shade-5pct), var(--lumo-box-shadow-xl);
          background-color: var(--lumo-base-color);
          border-radius: var(--lumo-border-radius);
          color: var(--lumo-body-text-color);
          min-width: 400px;
        }

        .button-container {
          background-color: var(--lumo-shade-5pct);
          padding: var(--lumo-space-s) var(--lumo-space-l);
          display: flex;
          flex-direction: row-reverse;
        }

        .button-container vaadin-button {
          min-width: 90px;
          margin-left: var(--lumo-space-m);
        }
      </style>
      <vaadin-confirm-dialog id="dialog" cancel confirm-text="Save">
        <vcf-network-io-dialog-content id="content"></vcf-network-io-dialog-content>
        <vaadin-button id="save" slot="confirm-button" theme="primary">
          Save
        </vaadin-button>
        <vaadin-button id="cancel" slot="cancel-button" theme="tertiary">
          Cancel
        </vaadin-button>
      </vaadin-confirm-dialog>
    `;
  }

  static get is() {
    return 'vcf-network-io-dialog';
  }

  static get properties() {
    return {
      fromComponent: {
        type: Boolean,
        value: false
      },
      toComponent: {
        type: Boolean,
        value: false
      },
      fromNode: {
        type: Object,
        observer: '_fromNodeChanged'
      },
      toNode: {
        type: Object,
        observer: '_toNodeChanged'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.cancel.addEventListener('click', () => this.close());
    this.$.save.addEventListener('click', () => {
      if (this.isValid) {
        const edge = new Edge({ from: this.fromNode.id, to: this.toNode.id });
        if (this.toComponent) {
          const inputNode = this._activeInputSelect.value;
          const component = this._activeInputSelect.node || this.toNode;
          const paths = component.inputs[inputNode.id] || [];
          paths.push(this._getIOPathObj('input', edge.id));
          edge.deepTo = inputNode.id;
          edge.deepToPath = this._getParentDeepPath('input');
          component.inputs[inputNode.id] = paths;
        }
        if (this.fromComponent) {
          const outputNode = this._activeOutputSelect.value;
          const component = this._activeOutputSelect.node || this.fromNode;
          const paths = component.outputs[outputNode.id] || [];
          paths.push(this._getIOPathObj('output', edge.id));
          edge.deepFrom = outputNode.id;
          edge.deepFromPath = this._getParentDeepPath('output');
          component.outputs[outputNode.id] = paths;
        }
        this.main.addEdges(edge);
        this.close();
      }
    });
  }

  get isValid() {
    let inputValid = true;
    let outputValid = true;
    if (this.toComponent) inputValid = this._activeInputSelect.validate();
    if (this.fromComponent) outputValid = this._activeOutputSelect.validate();
    return inputValid && outputValid;
  }

  open() {
    if (this._autoSelectInput && this._autoSelectOutput) {
      this.$.save.click();
    } else {
      this.$.dialog.opened = true;
      const overlay = document.querySelector('vaadin-dialog-overlay');
      const overlayPart = overlay.shadowRoot.querySelector('[part="overlay"]');
      overlayPart.style.width = 'calc(462px + 2 * var(--lumo-space-l))';
    }
  }

  close() {
    this.$.dialog.opened = false;
    setTimeout(() => {
      this.$.content.$.to.innerHTML = '';
      this.$.content.$.from.innerHTML = '';
      this.fromNode = null;
      this.toNode = null;
    }, 200);
  }

  _toNodeChanged(toNode) {
    if (toNode) {
      this._autoSelectInput = false;
      this.toComponent = toNode.type === 'component';
      if (this.toComponent) {
        const inputs = toNode.nodes.filter(node => node.type === 'component' || node.type === 'input');
        const inputSelect = this._createSelect(this.$.content.$.to, inputs, 'input');
        inputSelect.label = toNode.label;
        if (inputs.length === 1 && inputs[0].type === 'input') {
          inputSelect.value = inputs[0];
          this._autoSelectInput = true;
        }
      } else {
        const parent = this.main.context ? this.main.context.component.label : 'Root';
        this._activeInputSelect = { value: this.toNode };
        this._createSelect(this.$.content.$.to, null, 'input', false).label = parent;
        this._autoSelectInput = true;
      }
    }
  }

  _fromNodeChanged(fromNode) {
    if (fromNode) {
      this._autoSelectOutput = false;
      this.fromComponent = fromNode.type === 'component';
      if (this.fromComponent) {
        const outputs = fromNode.nodes.filter(node => node.type === 'component' || node.type === 'output');
        const outputSelect = this._createSelect(this.$.content.$.from, outputs, 'output');
        outputSelect.label = fromNode.label;
        if (outputs.length === 1 && outputs[0].type === 'output') {
          outputSelect.value = outputs[0];
          this._autoSelectOutput = true;
        }
      } else {
        const parent = this.main.context ? this.main.context.component.label : 'Root';
        this._activeOutputSelect = { value: this.fromNode };
        this._createSelect(this.$.content.$.from, null, 'output', false).label = parent;
        this._autoSelectOutput = true;
      }
    }
  }

  _createSelect(slot, nodes, type, isComponent = true) {
    let element;
    if (isComponent) {
      const select = document.createElement('vaadin-select');
      const container = document.createElement('div');
      const activeSelect = `_active${type[0].toUpperCase() + type.slice(1)}Select`;
      select.renderer = root => {
        if (root.firstChild) return;
        const listBox = document.createElement('vaadin-list-box');
        nodes.forEach(node => {
          const item = document.createElement('vaadin-item');
          const option = document.createElement('vcf-network-io-option');
          option.setAttribute('label', node.label);
          option.setAttribute('type', node.type || '');
          item.label = node.label;
          item.value = node;
          item.appendChild(option);
          listBox.appendChild(item);
        });
        root.appendChild(listBox);
      };
      container.classList.add('select-container');
      container.appendChild(select);
      slot.appendChild(container);
      select.setAttribute('required', true);
      select.addEventListener('change', e => {
        const node = e.target.value;
        if (node.type === 'component') {
          const nodes = node.nodes.filter(node => node.type === 'component' || node.type === type);
          this[activeSelect] = this._createSelect(container, nodes, type);
          this[activeSelect].label = node.label;
          this[activeSelect].node = node;
          if (nodes.length === 1) {
            this[activeSelect].value = nodes[0];
          }
        } else {
          const selectContainer = e.target.parentElement.querySelector('.select-container');
          if (selectContainer) selectContainer.remove();
          this[activeSelect] = select;
        }
      });
      this[activeSelect] = select;
      element = select;
    } else {
      const textField = document.createElement('vaadin-text-field');
      textField.value = type === 'input' ? this.toNode.label : this.fromNode.label;
      textField.readonly = true;
      slot.appendChild(textField);
      element = textField;
    }
    element.classList.add('io-dialog-field');
    return element;
  }

  _getIOPathObj(type, edgeId) {
    let path = [];
    const oppositeType = type === 'input' ? 'output' : 'input';
    const oppositeActiveSelect = this[`_active${oppositeType[0].toUpperCase() + oppositeType.slice(1)}Select`];
    const container = oppositeType === 'input' ? this.$.content.$.to : this.$.content.$.from;
    const fields = container.querySelectorAll('.io-dialog-field');
    const isComponent = oppositeType === 'input' ? this.toComponent : this.fromComponent;
    const parent = oppositeType === 'input' ? this.toNode : this.fromNode;
    if (this.main.context) path = this.main.contextStack.map(context => context.component.id);
    if (isComponent) path.push(parent.id);
    if (typeof fields[0].value === 'string') {
      path.push(oppositeActiveSelect.value.id);
    } else {
      fields.forEach(field => {
        path.push(field.value.id);
      });
    }
    return { id: edgeId, path };
  }

  _getParentDeepPath(type) {
    let path = [];
    const container = type === 'input' ? this.$.content.$.to : this.$.content.$.from;
    const fields = container.querySelectorAll('.io-dialog-field');
    const component = type === 'input' ? this.toNode : this.fromNode;
    if (this.main.context) path = this.main.contextStack.map(context => context.component.id);
    path.push(component.id);
    fields.forEach(select => {
      path.push(select.value.id);
    });
    path.pop();
    return path;
  }
}

customElements.define(VcfNetworkIODialog.is, VcfNetworkIODialog);

class VcfNetworkIODialogContent extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="lumo-typography">
        :host {
          display: flex;
          min-width: 400px;
        }

        h6 {
          margin: 0 auto 0 0;
        }

        .arrow-right {
          margin: auto var(--lumo-space-l);
        }

        .arrow-right::before {
          content: '';
          width: 20px;
          height: 0;
          border-top: 1px solid var(--lumo-shade-10pct);
          border-bottom: 1px solid var(--lumo-shade-10pct);
          display: inline-block;
          margin-bottom: 9px;
        }

        .arrow-right::after {
          content: '';
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-left: 10px solid var(--lumo-shade-20pct);
          display: inline-block;
          margin: auto;
        }
      </style>
      <div>
        <h6>From</h6>
        <div id="from"></div>
      </div>
      <div class="arrow-right"></div>
      <div>
        <h6>To</h6>
        <div id="to"></div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-io-dialog-content';
  }
}

customElements.define(VcfNetworkIODialogContent.is, VcfNetworkIODialogContent);
