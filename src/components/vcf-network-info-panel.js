import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { colorVars, Edge, ComponentNode, IONode } from '../util/vcf-network-shared';
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
          width: 240px;
          flex-shrink: 0;
        }

        .panel-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        span.selection {
          align-items: center;
          box-shadow: inset 0 -1px 0 0 var(--lumo-shade-10pct);
          color: var(--lumo-tertiary-text-color);
          display: flex;
          flex-shrink: 0;
          font-size: var(--lumo-font-size-s);
          font-weight: 500;
          height: var(--lumo-size-l);
          padding: 0 var(--lumo-space-m);
        }

        span.selection.active {
          background-color: var(--lumo-primary-color-10pct);
          color: var(--lumo-primary-text-color);
        }

        .button-container {
          align-items: center;
          box-shadow: inset 0 -1px 0 0 var(--lumo-shade-10pct);
          display: flex;
          flex-shrink: 0;
          height: var(--lumo-size-xl);
        }

        .button-container vaadin-button {
          width: calc(100% / 4);
        }

        .details-container {
          flex-grow: 1;
          overflow: auto;
          padding: 0 var(--lumo-space-m) var(--lumo-space-m) var(--lumo-space-m);
        }

        .details {
          display: flex;
          flex-direction: column;
          opacity: 1;
          transition: all 0.2s;
        }

        .details.hidden {
          display: none;
          opacity: 0;
          transition: all 0.2s;
        }

        .coords vaadin-text-field {
          width: 45%;
        }

        .coords vaadin-text-field:first-child {
          margin-right: var(--lumo-space-m);
        }
      </style>
      <div class="panel-container">
        <span id="selection" class="selection">[[selectionText]]</span>
        <div class="button-container">
          <vaadin-button id="create-component-button" theme="tertiary" title="Create component">
            <iron-icon icon="icons:cached"></iron-icon>
          </vaadin-button>
          <vaadin-button id="export-button" theme="tertiary" title="Export component">
            <iron-icon icon="icons:swap-vert"></iron-icon>
          </vaadin-button>
          <vaadin-button id="copy-button" theme="tertiary" title="Copy">
            <iron-icon icon="icons:content-copy"></iron-icon>
          </vaadin-button>
          <vaadin-button id="delete-button" theme="tertiary error" title="Delete">
            <iron-icon icon="icons:delete"></iron-icon>
          </vaadin-button>
        </div>
        <div class="details-container">
          <div class="details hidden" id="node-details">
            <vaadin-text-field id="node-name" label="Name" theme="small"></vaadin-text-field>
            <vaadin-text-field id="node-id" label="ID" readonly autoselect theme="small"></vaadin-text-field>
            <div class="coords">
              <vaadin-text-field id="node-x" label="x" readonly autoselect theme="small"></vaadin-text-field>
              <vaadin-text-field id="node-y" label="y" readonly autoselect theme="small"></vaadin-text-field>
            </div>
          </div>
          <div class="details hidden" id="edge-details">
            <vaadin-text-field id="edge-id" label="Id" readonly autoselect theme="small"></vaadin-text-field>
            <vaadin-text-field id="edge-from" label="From" readonly autoselect theme="small"></vaadin-text-field>
            <vaadin-text-field id="edge-to" label="To" readonly autoselect theme="small"></vaadin-text-field>
          </div>
          <div class="details hidden" id="component-details">
            <vaadin-text-field id="component-name" label="Name" theme="small"></vaadin-text-field>
            <vaadin-select id="component-color" label="Color">
              <template>
                <vaadin-list-box>
                  <template is="dom-repeat" items="[[_colors]]">
                    <vaadin-item>
                      <vcf-network-color-option color="[[index]]">[[index]]</vcf-network-color-option>
                    </vaadin-item>
                  </template>
                </vaadin-list-box>
              </template>
            </vaadin-select>
            <vaadin-text-field id="component-id" label="ID" readonly autoselect theme="small"></vaadin-text-field>
            <vaadin-text-field
              id="component-cid"
              label="Component ID"
              readonly
              autoselect
              theme="small"
            ></vaadin-text-field>
            <div class="coords">
              <vaadin-text-field id="component-x" label="x" readonly autoselect theme="small"></vaadin-text-field>
              <vaadin-text-field id="component-y" label="y" readonly autoselect theme="small"></vaadin-text-field>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-info-panel';
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

  get componentLabel() {
    if (!this._componentCount) {
      this._componentCount = 0;
    }
    return `Component ${++this._componentCount}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._initEventListeners();
  }

  _initEventListeners() {
    this.$['node-name'].addEventListener('input', this._updateNode('label'));
    this.$['component-name'].addEventListener('input', this._updateNode('label'));
    this.$['component-color'].addEventListener('change', this._updateNode('componentColor'));
    this.$['create-component-button'].addEventListener('click', () => this._createComponent());
    this.$['export-button'].addEventListener('click', () => this._exportComponent());
    this.$['delete-button'].addEventListener('click', () => this._deleteSelected());
  }

  _selectionChanged(selection) {
    this._setSelectionText();
    this.$['node-details'].classList.add('hidden');
    this.$['edge-details'].classList.add('hidden');
    this.$['component-details'].classList.add('hidden');
    /* Set selection text class */
    if (this.selectionText === 'No selection') {
      this.$['selection'].classList.remove('active');
    } else {
      this.$['selection'].classList.add('active');
    }
    /* Show component, node, or edge details */
    if (selection) {
      if (selection.nodes.length === 1 && !selection.edges.length) {
        this._selectedNode = this.main.data.nodes.get(selection.nodes[0]);
        if (this._selectedNode.cid) {
          this._showComponentDetails();
        } else {
          this._showNodeDetails();
        }
      } else if (selection.edges.length === 1 && !selection.nodes.length) {
        this._selectedEdge = this.main.data.edges.get(this.selection.edges[0]);
        this._setEdgeDetails();
      }
    } else {
      this._selectedNode = null;
    }
  }

  _showComponentDetails() {
    this.$['component-name'].value = this._selectedNode.label;
    this.$['component-color'].value = String(this._selectedNode.componentColor);
    this.$['component-id'].value = this._selectedNode.id;
    this.$['component-id'].title = this._selectedNode.id;
    this.$['component-cid'].value = this._selectedNode.cid;
    this.$['component-cid'].title = this._selectedNode.cid;
    this.$['component-x'].value = this._selectedNode.x;
    this.$['component-y'].value = this._selectedNode.y;
    this.$['component-details'].classList.remove('hidden');
  }

  _showNodeDetails() {
    this.$['node-name'].value = this._selectedNode.label;
    this.$['node-id'].value = this._selectedNode.id;
    this.$['node-id'].title = this._selectedNode.id;
    this.$['node-x'].value = this._selectedNode.x;
    this.$['node-y'].value = this._selectedNode.y;
    this.$['node-details'].classList.remove('hidden');
  }

  _setEdgeDetails() {
    this.$['edge-id'].value = this._selectedEdge.id;
    this.$['edge-from'].value = this._selectedEdge.from;
    this.$['edge-to'].value = this._selectedEdge.to;
    this.$['edge-details'].classList.remove('hidden');
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
    const setNodeTemplateIds = nodes => {
      return nodes.map(node => {
        templateIdMap[node.id] = templateId++;
        if (node.cid) {
          node.nodes = setNodeTemplateIds(node.nodes);
          node.edges = setEdgeTemplateIds(node.edges);
        }
        return this._removeExtraProperties({
          ...node,
          id: templateIdMap[node.id]
        });
      });
    };
    const setEdgeTemplateIds = edges => {
      return edges.map(edge => {
        templateIdMap[edge.id] = templateId++;
        return {
          ...edge,
          from: templateIdMap[edge.from],
          to: templateIdMap[edge.to],
          id: templateIdMap[edge.id]
        };
      });
    };
    const obj = {
      nodes: setNodeTemplateIds(this._getSelectedNodes()),
      edges: setEdgeTemplateIds(this._getConnectedEdges(this.selection.nodes))
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
    const download = document.createElement('a');
    download.setAttribute('href', dataStr);
    download.setAttribute('download', 'component.json');
    download.click();
  }

  _createComponent() {
    const nodeIds = this.selection.nodes;
    const posNode = this.main.data.nodes.get(nodeIds[0]);
    const nodes = this._getSelectedNodes();
    const edges = this._getConnectedEdges(nodeIds);
    /* Generate I/O nodes */
    const first = nodes[0];
    let firstx = first;
    let lastx = first;
    let x0 = first.x;
    let x1 = first.x;
    let y0 = first.y;
    let y1 = first.y;
    let hasInput = false;
    let hasOutput = false;
    nodes.forEach((node, i) => {
      if (node.x < x0) {
        x0 = node.x;
        firstx = node;
      }
      if (node.x > x1) {
        x1 = node.x;
        lastx = node;
      }
      if (node.y < y0) y0 = node.y;
      if (node.y > y1) y1 = node.y;
      if (node.type === 'input') hasInput = true;
      if (node.type === 'output') hasOutput = true;
    });
    if (!hasInput) {
      const inputId = vis.util.randomUUID();
      const inputNode = new IONode({
        id: inputId,
        label: `Input ${++this.main._addInputCount}`,
        x: x0 - 100,
        y: y0 + (y1 - y0) / 2
      });
      const edge = new Edge({
        from: inputId,
        to: firstx.id
      });
      nodes.push(inputNode);
      nodeIds.push(inputNode.id);
      edges.push(edge);
    }
    if (!hasOutput) {
      const outputId = vis.util.randomUUID();
      const outputNode = new IONode({
        type: 'output',
        id: outputId,
        label: `Output ${++this.main._addOutputCount}`,
        x: x1 + 100,
        y: y0 + (y1 - y0) / 2
      });
      const edge = new Edge({
        from: lastx.id,
        to: outputId
      });
      nodes.push(outputNode);
      nodeIds.push(outputNode.id);
      edges.push(edge);
    }
    /* Create component node */
    const component = new ComponentNode({
      label: this.componentLabel,
      x: posNode.x,
      y: posNode.y,
      nodes,
      edges
    });
    const edgesCopy = component.edges.slice(0);
    const externalEdges = edgesCopy.filter(edge => {
      const isExternal = !nodeIds.includes(edge.to) || !nodeIds.includes(edge.from);
      if (isExternal) {
        component.edges.splice(component.edges.indexOf(edge), 1);
      }
      return isExternal;
    });
    /* Update nodes */
    this.main._removeFromDataSet('nodes', nodeIds);
    this.main._addToDataSet('nodes', component);
    /* Update edges */
    this.main._removeFromDataSet('edges', component.edges);
    externalEdges.forEach(edge => {
      if (nodeIds.includes(edge.from)) {
        edge.from = component.id;
      }
      if (nodeIds.includes(edge.to)) {
        edge.to = component.id;
      }
      this.main._updateDataSet('edges', edge);
    });
  }

  _updateNode(property) {
    return e => {
      let componentStyles = {};
      if (property === 'componentColor') {
        componentStyles = ComponentNode.getComponentNodeStyles(Number.parseInt(e.target.value));
      }
      this.main._updateDataSet('nodes', {
        id: this._selectedNode.id,
        [property]: e.target.value,
        ...componentStyles
      });
    };
  }

  _updateCoords(opt) {
    const node = this.main._network.body.nodes[opt.nodes[0]];
    if (node !== this._selectedNode) {
      this.selection = opt;
    }
    const x = Number.parseInt(node.x);
    const y = Number.parseInt(node.y);
    clearTimeout(this._updateCoordsTimeout);
    this._updateCoordsTimeout = setTimeout(() => {
      this.main._updateDataSet('nodes', { id: node.id, x, y });
    }, 200);
    if (node.options.cid) {
      this.$['component-x'].value = x;
      this.$['component-y'].value = y;
    } else {
      this.$['node-x'].value = x;
      this.$['node-y'].value = y;
    }
  }

  _getSelectedNodes() {
    return this.selection.nodes.map(id => this.main.data.nodes.get(id));
  }

  _getConnectedEdges(nodeIds) {
    /* create set of unique connected egde ids */
    const edgeIdSet = new Set();
    nodeIds.forEach(node => {
      this.main._network.getConnectedEdges(node).forEach(edge => {
        edgeIdSet.add(edge);
      });
    });
    /* create array of edge objects from set */
    const edges = [...edgeIdSet].map(id => this.main.data.edges.get(id));
    return edges;
  }

  _removeExtraProperties(node) {
    delete node.isRoot;
    delete node.color;
    delete node.margin;
    delete node.shapeProperties;
    delete node.font;
    return node;
  }

  _deleteSelected() {
    this.main._removeFromDataSet('nodes', this.selection.nodes);
    this.main._removeFromDataSet('edges', this.selection.edges);
  }
}

customElements.define(VcfNetworkInfoPanel.is, VcfNetworkInfoPanel);
