import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { colorVars } from '../util/vcf-network-colors';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-select';
import './vcf-network-color-option';

class VcfNetworkInfoPanel extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          font-size: var(--lumo-font-size-s);
        }

        .panel-container {
          background: var(--lumo-base-color);
          border-left: 1px solid var(--lumo-shade-20pct);
          width: 200px;
          height: 100%;
        }

        .selection {
          height: 24px;
          position: relative;
          padding: var(--lumo-space-s) var(--lumo-space-m);
          border-bottom: 1px solid var(--lumo-shade-20pct);
          color: var(--lumo-primary-text-color);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .selectionText::before,
        .selectionText::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: var(--lumo-primary-color-50pct);
          opacity: 0.05;
        }

        .button-container {
          display: flex;
          border-bottom: 1px solid var(--lumo-shade-20pct);
        }

        .button-container > vaadin-button {
          width: 50px;
          height: 50px;
          border-radius: 0;
          background-color: var(--lumo-base-color);
          padding: 8px calc((var(--lumo-button-size) / 4) + 4px);
          margin: 0;
          cursor: pointer;
        }

        .details-container {
          padding: var(--lumo-space-s) var(--lumo-space-m);
        }

        .details-container vaadin-text-field {
          width: 100%;
          font-size: var(--lumo-font-size-xs);
        }

        .details-container vaadin-select {
          width: 50%;
        }

        .details {
          transition: display 0.2s, opacity 0.2s;
          opacity: 1;
        }

        .details.hidden {
          transition: display 0.2s, opacity 0.2s;
          opacity: 0;
          display: none;
        }
      </style>
      <div id="main" class="panel-container">
        <div class="selection">
          <div class="selectionText">[[selectionText]]</div>
        </div>
        <div class="button-container">
          <vaadin-button id="create-component-button" theme="icon" title="Create component">
            <iron-icon icon="icons:cached"></iron-icon>
          </vaadin-button>
          <vaadin-button id="export-button" theme="icon" title="Export component">
            <iron-icon icon="icons:swap-vert"></iron-icon>
          </vaadin-button>
          <vaadin-button id="copy-button" theme="icon" title="Copy">
            <iron-icon icon="icons:content-copy"></iron-icon>
          </vaadin-button>
          <vaadin-button id="delete-button" theme="icon error" title="Delete">
            <iron-icon icon="icons:delete"></iron-icon>
          </vaadin-button>
        </div>
        <div class="details-container">
          <div class="details hidden" id="node-details">
            <vaadin-text-field id="node-name" label="Name"></vaadin-text-field>
            <vaadin-text-field id="node-id" label="Id" readonly autoselect></vaadin-text-field>
          </div>
          <div class="details hidden" id="edge-details">
            <vaadin-text-field id="edge-from" label="From" readonly autoselect></vaadin-text-field>
            <vaadin-text-field id="edge-to" label="To" readonly autoselect></vaadin-text-field>
          </div>
          <div class="details hidden" id="component-details">
            <vaadin-text-field id="component-name" label="Name"></vaadin-text-field>
            <vaadin-text-field id="component-id" label="Id" readonly autoselect></vaadin-text-field>
            <vaadin-select id="component-color" label="Color">
              <template>
                <vaadin-list-box>
                  <template is="dom-repeat" items="[[_colors]]">
                    <vaadin-item>
                      <vcf-hn-color-option color="[[index]]"></vcf-hn-color-option>
                    </vaadin-item>
                  </template>
                </vaadin-list-box>
              </template>
            </vaadin-select>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-hn-info-panel';
  }

  static get properties() {
    return {
      selection: {
        type: Object,
        observer: '_selectionChanged'
      },
      selectionText: {
        type: String,
        value: 'No selection'
      },
      _colors: {
        type: Array,
        value: () => colorVars
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._initEventListeners();
  }

  _initEventListeners() {
    this.$['create-component-button'].addEventListener('click', () => {
      this._parent._network.clustering.cluster({
        joinCondition: n => this._parent._network.body.nodes[n.id].selected
      });
    });
    this.$['node-name'].addEventListener('change', this._updateNode('label'));
    this.$['export-button'].addEventListener('click', () => this._exportComponent());
  }

  _selectionChanged(selection) {
    this._setSelectionText();
    this.$['node-details'].classList.add('hidden');
    this.$['edge-details'].classList.add('hidden');
    this.$['component-details'].classList.add('hidden');
    if (selection.nodes.length === 1 && !selection.edges.length) {
      this._selectedNode = this._parent._network.body.nodes[selection.nodes[0]];
      this.$['node-name'].value = this._selectedNode.options.label;
      this.$['node-id'].value = this._selectedNode.id;
      this.$['node-id'].title = this._selectedNode.id;
      this.$['node-details'].classList.remove('hidden');
    } else if (selection.edges.length === 1 && !selection.nodes.length) {
      this._selectedEdge = this._parent._network.body.edges[selection.edges[0]];
      this.$['edge-from'].value = this._selectedEdge.options.from;
      this.$['edge-to'].value = this._selectedEdge.options.to;
      this.$['edge-details'].classList.remove('hidden');
    }
  }

  _setSelectionText() {
    let selectionText = '';
    if (this.selection) {
      const nodeCount = this.selection.nodes.length;
      const edgeCount = this.selection.edges.length;
      if (nodeCount) {
        selectionText = nodeCount === 1 ? '1 node' : `${nodeCount} nodes`;
      }
      if (edgeCount) {
        selectionText += selectionText && ', ';
        selectionText += edgeCount === 1 ? '1 edge' : `${edgeCount} edges`;
      }
      selectionText += selectionText && ' selected';
    }
    this.selectionText = selectionText || 'No selection';
  }

  _exportComponent() {
    let templateId = 0;
    const templateIdMap = {};
    const obj = {
      nodes: this.selection.nodes.map(id => {
        const node = this._parent.data.nodes.get(id);
        templateIdMap[id] = templateId++;
        return {
          ...node,
          id: templateIdMap[id]
        };
      }),
      edges: this.selection.edges.map(id => {
        const edge = this._parent.data.edges.get(id);
        templateIdMap[id] = templateId++;
        return {
          ...edge,
          from: templateIdMap[edge.from],
          to: templateIdMap[edge.to],
          id: templateIdMap[id]
        };
      })
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
    const download = document.createElement('a');
    download.setAttribute('href', dataStr);
    download.setAttribute('download', 'component.json');
    download.click();
  }

  _updateNode(property) {
    return e => {
      this._parent.data.nodes.update({
        id: this._selectedNode.id,
        [property]: e.target.value
      });
    };
  }
}

customElements.define(VcfNetworkInfoPanel.is, VcfNetworkInfoPanel);
