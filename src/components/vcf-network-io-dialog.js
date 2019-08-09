import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { Edge } from '../util/vcf-network-shared';

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

        .content {
          padding: var(--lumo-space-m) var(--lumo-space-l);
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

        .content {
          display: flex;
        }

        .content h6 {
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
      <div id="backdrop" class="backdrop">
        <div class="dialog">
          <div class="content" id="content">
            <div>
              <h6>From</h6>
              <div id="from"></div>
            </div>
            <div class="arrow-right"></div>
            <div>
              <h6>To</h6>
              <div id="to"></div>
            </div>
          </div>
          <div class="button-container">
            <vaadin-button theme="primary" id="save">Save</vaadin-button>
            <vaadin-button theme="tertiary" id="cancel">Cancel</vaadin-button>
          </div>
        </div>
      </div>
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
    this.$.backdrop.addEventListener('click', e => e.target.id === 'backdrop' && this.close());
    this.$.save.addEventListener('click', () => {
      if (this.isValid) {
        const edge = new Edge({ from: this.fromNode.id, to: this.toNode.id });
        if (this.toComponent) {
          const inputNode = this._activeInputSelect.value;
          const component = this._activeInputSelect.node || this.toNode;
          const paths = component.inputs[inputNode.id] || [];
          paths.push(this._getPathObj('input', edge.id));
          edge.deepTo = inputNode.id;
          edge.deepToPath = this._getDeepPath('input');
          component.inputs[inputNode.id] = paths;
        }
        if (this.fromComponent) {
          const outputNode = this._activeOutputSelect.value;
          const component = this._activeOutputSelect.node || this.fromNode;
          const paths = component.outputs[outputNode.id] || [];
          paths.push(this._getPathObj('output', edge.id));
          edge.deepFrom = outputNode.id;
          edge.deepFromPath = this._getDeepPath('output');
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
    this.style.opacity = 1;
    this.style.display = 'block';
  }

  close() {
    this.style.opacity = 0;
    setTimeout(() => {
      this.$.to.innerHTML = '';
      this.$.from.innerHTML = '';
      this.fromNode = null;
      this.toNode = null;
      this.style.display = 'none';
    }, 200);
  }

  _toNodeChanged(toNode) {
    if (toNode) {
      this.toComponent = toNode.type === 'component';
      if (this.toComponent) {
        const inputs = toNode.nodes.filter(node => node.type === 'component' || node.type === 'input');
        this._createSelect(this.$.to, inputs, 'input').label = toNode.label;
      } else {
        const parent = this.main.context ? this.main.context.component.label : 'Root';
        this._activeInputSelect = { value: this.toNode };
        this._createSelect(this.$.to, null, 'input', false).label = parent;
      }
    }
  }

  _fromNodeChanged(fromNode) {
    if (fromNode) {
      this.fromComponent = fromNode.type === 'component';
      if (this.fromComponent) {
        const inputs = fromNode.nodes.filter(node => node.type === 'component' || node.type === 'output');
        this._createSelect(this.$.from, inputs, 'output').label = fromNode.label;
      } else {
        const parent = this.main.context ? this.main.context.component.label : 'Root';
        this._activeOutputSelect = { value: this.fromNode };
        this._createSelect(this.$.from, null, 'output', false).label = parent;
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
    return element;
  }

  _getPathObj(type, edgeId) {
    let path = [];
    const oppositeType = type === 'input' ? 'output' : 'input';
    const oppositeActiveSelect = this[`_active${oppositeType[0].toUpperCase() + oppositeType.slice(1)}Select`];
    const isComponent = oppositeType === 'input' ? this.toComponent : this.fromComponent;
    const parent = oppositeType === 'input' ? this.toNode : this.fromNode;
    if (isComponent) path.push(parent.id);
    if (this.main.context) path = this.main.contextStack.map(context => context.component.id);
    path.push(oppositeActiveSelect.value.id);
    return { id: edgeId, path };
  }

  _getDeepPath(type) {
    let path = [];
    const content = type === 'input' ? this.$.to : this.$.from;
    const component = type === 'input' ? this.toNode : this.fromNode;
    if (this.main.context) path = this.main.contextStack.map(context => context.component.id);
    path.push(component.id);
    content.querySelectorAll('vaadin-select').forEach(select => {
      path.push(select.value.id);
    });
    path.pop();
    return path;
  }
}

customElements.define(VcfNetworkIODialog.is, VcfNetworkIODialog);
