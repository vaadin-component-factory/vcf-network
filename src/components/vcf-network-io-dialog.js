import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import './vcf-network-io-option';

class VcfNetworkIODialog extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: none;
          opacity: 0;
          transition: opacity 0.2s;
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
      </style>
      <div id="backdrop" class="backdrop">
        <div class="dialog">
          <div class="content" id="content"></div>
          <div class="button-container">
            <vaadin-button theme="primary">Save</vaadin-button>
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
      startNode: {
        type: Object
      },
      endNode: {
        type: Object,
        observer: '_endNodeChanged'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.cancel.addEventListener('click', () => this.cancel());
    this.$.backdrop.addEventListener('click', e => {
      if (e.target.id === 'backdrop') this.cancel();
    });
  }

  open() {
    this.style.opacity = 1;
    this.style.display = 'block';
  }

  close() {
    this.style.opacity = 0;
    setTimeout(() => {
      this.$.content.innerHTML = '';
      this.startNode = null;
      this.endNode = null;
      this.style.display = 'none';
    }, 200);
  }

  cancel() {
    this.close();
    this.main._removelastEdge();
  }

  _endNodeChanged(endNode) {
    if (endNode && endNode.type === 'component') {
      const inputs = endNode.nodes.filter(node => node.type === 'component' || node.type === 'input');
      this._createSelect(this.$.content, inputs, 'input').label = endNode.label;
    }
  }

  _createSelect(slot, nodes, type) {
    const container = document.createElement('div');
    const select = document.createElement('vaadin-select');
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
      const activeSelect = `_active${type[0].toUpperCase() + type.slice(1)}Select`;
      const node = e.target.value;
      if (node.type === 'component') {
        const nodes = node.nodes.filter(node => node.type === 'component' || node.type === type);
        this[activeSelect] = this._createSelect(container, nodes, type);
        this[activeSelect].label = node.label;
      } else {
        const selectContainer = e.target.parentElement.querySelector('.select-container');
        if (selectContainer) {
          selectContainer.remove();
          this[activeSelect] = select;
        }
      }
    });
    return select;
  }
}

customElements.define(VcfNetworkIODialog.is, VcfNetworkIODialog);
