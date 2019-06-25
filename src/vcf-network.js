import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import { Node, Edge, IONode, ComponentNode } from './util/vcf-network-shared';
import './lib/vis-network.web';
import './components/vcf-network-tool-panel';
import './components/vcf-network-breadcrumbs';
import './components/vcf-network-info-panel';
import './components/vcf-network-io-panel';

class VcfNetwork extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          overflow: hidden;
        }

        :host([hidden]) {
          display: none !important;
        }

        main {
          box-shadow: inset -1px 0 0 0 var(--lumo-shade-10pct);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .canvas-container {
          display: flex;
          background-color: var(--lumo-contrast-5pct);
          flex-grow: 1;
          height: calc(100% - var(--lumo-size-l));
        }

        .canvas-container #main {
          height: 100%;
          width: 100%;
        }
      </style>
      <vcf-network-tool-panel id="toolpanel"></vcf-network-tool-panel>
      <main>
        <vcf-network-breadcrumbs id="breadcrumbs" context="{{contextStack}}"></vcf-network-breadcrumbs>
        <div class="canvas-container">
          <vcf-network-io-panel></vcf-network-io-panel>
          <div id="main"></div>
          <vcf-network-io-panel output></vcf-network-io-panel>
        </div>
      </main>
      <vcf-network-info-panel id="infopanel"></vcf-network-info-panel>
    `;
  }

  static get is() {
    return 'vcf-network';
  }

  static get version() {
    return '0.1.0';
  }

  static get properties() {
    return {
      data: Object,
      rootData: {
        type: Object,
        value: () => ({
          nodes: new vis.DataSet(),
          edges: new vis.DataSet()
        })
      },
      import: {
        type: String,
        observer: '_importChanged'
      },
      addingEdge: {
        type: Boolean,
        observer: '_addingEdgeChanged'
      },
      addingNode: {
        type: Boolean,
        observer: '_addingNodeChanged'
      },
      addingComponent: {
        type: Object,
        observer: '_addingComponentChanged'
      },
      contextStack: {
        type: Array,
        observer: '_contextChanged'
      }
    };
  }

  get nodes() {
    return this.getNodes();
  }

  get nodeIds() {
    return this.getNodeIds();
  }

  get edges() {
    return this.getEdges();
  }

  get edgeIds() {
    return this.getEdgeIds();
  }

  get scale() {
    return this._scale;
  }

  set scale(value) {
    this._scale = value;
    this._restoreZoom();
  }

  get context() {
    return this.contextStack[this.contextStack.length - 1];
  }

  get parentContext() {
    if (this.contextStack.length > 1) {
      return this.contextStack[this.contextStack.length - 2].data;
    } else {
      return this.rootData;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._initNetwork();
    this._initComponents();
    this._initEventListeners();
    this._initMultiSelect();
  }

  select(nodeIds = [], edgeIds = []) {
    if (nodeIds.length) this._network.selectNodes(nodeIds, false);
    if (edgeIds.length) this._network.selectEdges(edgeIds);
    this.$.infopanel.selection = { nodes: nodeIds, edges: edgeIds };
  }

  addNode(label, x, y, options) {
    this._addToDataSet(
      'nodes',
      new Node({
        label,
        x,
        y,
        ...options
      })
    );
  }

  deleteNodes(nodeIds) {
    this._removeFromDataSet('nodes', nodeIds);
  }

  addEdge(from, to, options) {
    this._addToDataSet(
      'edges',
      new Edge({
        from,
        to,
        ...options
      })
    );
  }

  deleteEdge(edgeIds) {
    this._removeFromDataSet('edges', edgeIds);
  }

  createComponent(nodeIds) {
    this.select(nodeIds);
    this.$.infopanel._createComponent();
  }

  getNode(id) {
    this.data.nodes.get(id);
  }

  getNodes() {
    return this._network.body.nodeIndices.map(id => this.data.nodes.get(id));
  }

  getNodeIds() {
    return this._network.body.nodeIndices;
  }

  getEdge(id) {
    this.data.edges.get(id);
  }

  getEdges() {
    return this._network.body.edgeIndices.map(id => this.data.edges.get(id));
  }

  getEdgeIds() {
    return this._network.body.edgeIndices;
  }

  _initNetwork() {
    this._scale = 2;
    this._addNodeCount = 0;
    this._addInputCount = 0;
    this._addOutputCount = 0;
    this._options = {
      physics: false,
      nodes: {
        fixed: false,
        shape: 'box',
        shapeProperties: {
          borderRadius: 50
        },
        borderWidth: 2,
        color: {
          background: '#ffffff',
          border: '#dadfe5',
          highlight: {
            background: '#ffffff',
            border: '#1576f3'
          }
        },
        font: {
          size: 8,
          color: 'rgba(27, 43, 65, 0.72)'
        },
        margin: {
          top: 8,
          right: 15,
          bottom: 8,
          left: 15
        }
      },
      edges: {
        arrows: 'to',
        length: 200,
        color: {
          color: '#dadfe5',
          highlight: '#90bbf9'
        }
      },
      manipulation: {
        enabled: false,
        addNode: this._addNodeCallback.bind(this),
        addEdge: this._addEdgeCallback.bind(this),
        controlNodeStyle: {
          shape: 'dot',
          size: 2,
          color: {
            background: '#1576f3'
          },
          borderWidth: 0,
          borderWidthSelected: 0
        }
      },
      interaction: {
        multiselect: false,
        selectConnectedEdges: false,
        dragNodes: true
      }
    };
    this._network = new vis.Network(this.$.main, this.rootData, this._options);
    this.contextStack = [];
    this._manipulation = this._network.manipulation;
    this._canvas = this.shadowRoot.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');
    if (!this.data.nodes.length) {
      this._restoreZoom();
    }
  }

  _initComponents() {
    this.$.infopanel.main = this;
    this.$.toolpanel.main = this;
    this.$.breadcrumbs.main = this;
  }

  _initEventListeners() {
    this._network.on('hold', opt => {
      if (opt.nodes.length === 1) {
        const nodeId = opt.nodes[0];
        this.addingEdge = true;
        this._manipulation._handleConnect(opt.event);
        this._manipulation._temporaryBindUI('onRelease', e => {
          const node = this._detectNode(e);
          if (node && node.id !== nodeId) {
            this._manipulation._finishConnect(e);
          } else {
            this._reset();
          }
        });
      }
    });
    this._network.on('select', opt => {
      this.$.infopanel.selection = opt;
    });
    this._network.on('click', opt => {
      if (this.addingComponent && !opt.nodes.length) {
        this._addComponentHelper(opt);
      }
    });
    this._network.on('doubleClick', opt => {
      if (opt.nodes.length) {
        const selectedNode = this.$.infopanel._selectedNode;
        if (selectedNode.cid) {
          this.$.infopanel.selection = null;
          this.set('contextStack', [
            ...this.$.breadcrumbs.context,
            {
              component: selectedNode,
              parent: this.data,
              data: {
                nodes: new vis.DataSet(selectedNode.nodes),
                edges: new vis.DataSet(selectedNode.edges)
              }
            }
          ]);
        }
      }
    });
    this._network.on('zoom', opt => {
      this._scale = opt.scale;
    });
    this._network.on('dragging', opt => {
      if (opt.nodes.length === 1) {
        this.$.infopanel._updateCoords(opt);
      }
    });
  }

  _initMultiSelect() {
    this._selectionRect = {};
    const saveDrawingSurface = () => {
      this._drawingSurfaceImageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    };
    const restoreDrawingSurface = () => {
      this._ctx.putImageData(this._drawingSurfaceImageData, 0, 0);
    };
    const getStartToEnd = (start, length) => {
      return length > 0 ? { start: start, end: start + length } : { start: start + length, end: start };
    };
    const selectNodesFromHighlight = () => {
      const nodesIdInDrawing = [];
      const xRange = getStartToEnd(this._selectionRect.startX, this._selectionRect.w);
      const yRange = getStartToEnd(this._selectionRect.startY, this._selectionRect.h);
      const nodeIndices = this._network.body.nodeIndices;
      for (let i = 0; i < nodeIndices.length; i++) {
        const curNode = this.data.nodes.get(nodeIndices[i]);
        const nodePosition = this._network.getPositions([curNode.id]);
        const nodeXY = this._network.canvasToDOM({
          x: nodePosition[curNode.id].x,
          y: nodePosition[curNode.id].y
        });
        if (xRange.start <= nodeXY.x && nodeXY.x <= xRange.end && yRange.start <= nodeXY.y && nodeXY.y <= yRange.end) {
          nodesIdInDrawing.push(curNode.id);
        }
      }
      this._network.selectNodes(nodesIdInDrawing, false);
      this.$.infopanel.selection = { nodes: nodesIdInDrawing, edges: [] };
    };
    this.$.main.addEventListener('mousemove', e => {
      if (this._selectionDrag) {
        restoreDrawingSurface();
        this._selectionRect.w = e.pageX - this.$.main.offsetLeft - this._selectionRect.startX;
        this._selectionRect.h = e.pageY - this.$.main.offsetTop - this._selectionRect.startY;
        this._ctx.strokeStyle = 'rgb(121, 173, 249)';
        this._ctx.strokeRect(
          this._selectionRect.startX,
          this._selectionRect.startY,
          this._selectionRect.w,
          this._selectionRect.h
        );
        this._ctx.setLineDash([]);
        this._ctx.fillStyle = 'rgba(121, 173, 249, 0.2)';
        this._ctx.fillRect(
          this._selectionRect.startX,
          this._selectionRect.startY,
          this._selectionRect.w,
          this._selectionRect.h
        );
      }
    });
    this.$.main.addEventListener('mousedown', e => {
      if (e.button == 2) {
        saveDrawingSurface();
        this._selectionRect.startX = e.pageX - this.$.main.offsetLeft;
        this._selectionRect.startY = e.pageY - this.$.main.offsetTop;
        this._selectionDrag = true;
        this.$.main.style.cursor = 'crosshair';
      }
    });
    this.$.main.addEventListener('mouseup', e => {
      if (e.button == 2) {
        restoreDrawingSurface();
        this._selectionDrag = false;
        this.$.main.style.cursor = 'default';
        selectNodesFromHighlight();
      }
    });
    this.$.main.oncontextmenu = () => false;
  }

  _addingNodeChanged() {
    if (this.addingNode) {
      this._network.addNodeMode();
      this.addingEdge = false;
      this.addingComponent = null;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addingEdgeChanged() {
    if (this.addingEdge) {
      this._network.addEdgeMode();
      this.addingNode = false;
      this.addingComponent = null;
      this._canvas.style.cursor = 'grabbing';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addingComponentChanged() {
    if (this.addingComponent) {
      this.addingEdge = false;
      this.addingNode = false;
      this._network.disableEditMode();
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addNodeCallback(data, callback) {
    const nodeType = this.addingNode;
    let newNode;
    if (nodeType === 'input' || nodeType === 'output') {
      const labelPrefix = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
      newNode = new IONode({
        id: data.id,
        label: `${labelPrefix} ${++this[`_add${labelPrefix}Count`]}`,
        x: data.x,
        y: data.y,
        type: nodeType
      });
    } else {
      newNode = new Node({
        id: data.id,
        label: `Node ${++this._addNodeCount}`,
        x: data.x,
        y: data.y
      });
    }
    this._addToDataSet('nodes', newNode);
    this.$.toolpanel.clear();
    this.addingNode = false;
  }

  _addEdgeCallback(data, callback) {
    const newEdge = {
      from: data.from,
      to: data.to
    };
    this._addToDataSet('edges', newEdge);
    this.addingEdge = false;
  }

  _detectNode(event) {
    const pointer = this._manipulation.body.functions.getPointer(event.center);
    const pointerObj = this._manipulation.selectionHandler._pointerToPositionObject(pointer);
    const nodeIds = this._manipulation.selectionHandler._getAllNodesOverlappingWith(pointerObj);
    let node = undefined;
    for (const id of nodeIds) {
      if (this._manipulation.temporaryIds.nodes.indexOf(id) === -1) {
        node = this._manipulation.body.nodes[id];
        break;
      }
    }
    return node;
  }

  _reset() {
    this.addingNode = false;
    this.addingEdge = false;
    this.$.toolpanel.clear();
    this._manipulation._clean();
    this._manipulation._restore();
  }

  _importChanged(src) {
    fetch(src)
      .then(res => res.json())
      .then(json => {
        this.$.toolpanel.set('components', [json]);
      });
  }

  _addComponentHelper(opt) {
    const idMap = {};
    const importData = { nodes: [this.addingComponent], edges: [] };
    importData.nodes.forEach(node => (node.isRoot = true));
    const setNodeUUIDs = nodes => {
      return nodes.map(templateNode => {
        let instanceNode;
        const coords = opt.event.center;
        const canvasCoords = this._network.DOMtoCanvas({
          x: coords.x - this.$.main.offsetLeft,
          y: coords.y - this.$.main.offsetTop
        });
        idMap[templateNode.id] = vis.util.randomUUID();
        if (templateNode.type === 'component') {
          templateNode.nodes = setNodeUUIDs(templateNode.nodes);
          templateNode.edges = setEdgeUUIDs(templateNode.edges);
          instanceNode = new ComponentNode(templateNode);
        } else if (templateNode.type === 'input' || templateNode.type === 'output') {
          instanceNode = new IONode(templateNode);
        } else {
          instanceNode = new Node(templateNode);
        }
        instanceNode.id = idMap[templateNode.id];
        instanceNode.x = instanceNode.isRoot ? canvasCoords.x : instanceNode.x;
        instanceNode.y = instanceNode.isRoot ? canvasCoords.y : instanceNode.y;
        return instanceNode;
      });
    };
    const setEdgeUUIDs = edges => {
      return edges.map(templateEdge => {
        idMap[templateEdge.id] = vis.util.randomUUID();
        const instanceEdge = new Edge(templateEdge);
        instanceEdge.from = idMap[templateEdge.from];
        instanceEdge.to = idMap[templateEdge.to];
        instanceEdge.id = idMap[templateEdge.id];
        return instanceEdge;
      });
    };
    this._addToDataSet('nodes', setNodeUUIDs(importData.nodes));
    this._addToDataSet('edges', setEdgeUUIDs(importData.edges));
    this.$.toolpanel.clear();
    this.addingComponent = null;
  }

  _restoreZoom() {
    this._network.moveTo({ scale: this.scale });
  }

  _contextChanged(contextStack) {
    if (contextStack.length) {
      const context = contextStack[contextStack.length - 1];
      this.data = context.data;
      // this._setIOPanelsVisibility(true);
    } else {
      this.data = this.rootData;
      this._setIOPanelsVisibility(false);
    }
    this._network.setData(this.data);
    this._restoreZoom();
  }

  _addToDataSet(dataset, items) {
    this.data[dataset].add(items);
    if (this.context) {
      if (Array.isArray(items)) {
        this.context.component[dataset] = this.context.component[dataset].concat(items);
      } else {
        this.context.component[dataset].push(items);
      }
      this._propagateUpdates();
    }
  }

  _removeFromDataSet(dataset, items) {
    this.data[dataset].remove(items);
    if (this.context) {
      if (Array.isArray(items)) {
        this.context.component[dataset] = this.context.component[dataset].filter(item => !items.includes(item.id));
      } else {
        this.context.component[dataset].splice(this.context.component[dataset].indexOf(items.id), 1);
      }
      this._propagateUpdates();
    }
  }

  _updateDataSet(dataset, items) {
    this.data[dataset].update(items);
    if (this.context) {
      if (Array.isArray(items)) {
        items.forEach(item => this._updateComponentProperties(this.context.component[dataset], item));
      } else {
        this._updateComponentProperties(this.context.component[dataset], items);
      }
      this._propagateUpdates();
    }
  }

  _updateComponentProperties(dataset, changes) {
    const updateNode = dataset.filter(node => node.id === changes.id)[0];
    Object.keys(changes).forEach(key => (updateNode[key] = changes[key]));
  }

  _propagateUpdates() {
    for (let i = this.contextStack.length - 1; i >= 0; i--) {
      const last = i === 0;
      const context = this.contextStack[i];
      const parent = !last && this.contextStack[i - 1];
      const parentContext = last ? this.rootData : parent.data;
      parentContext.nodes.update({
        id: context.component.id,
        nodes: context.component.nodes,
        edges: context.component.edges
      });
      if (parent) {
        const component = parent.component.nodes.filter(node => node.id === context.component.id)[0];
        component.nodes = context.component.nodes;
        component.edges = context.component.edges;
      }
    }
  }

  _setIOPanelsVisibility(show) {
    this.shadowRoot.querySelectorAll('vcf-network-io-panel').forEach(el => {
      if (show) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', true);
      }
    });
  }
}

customElements.define(VcfNetwork.is, VcfNetwork);
