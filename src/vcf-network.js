import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import { Node, Edge, IONode, ComponentNode } from './util/vcf-network-shared';
import './lib/vis-network.web';
import './components/vcf-network-tool-panel';
import './components/vcf-network-breadcrumbs';
import './components/vcf-network-info-panel';
import './components/vcf-network-io-panel';
import './components/vcf-network-io-dialog';

/**
 * @class VcfNetwork
 * @extends {PolymerElement}
 * @mixes ElementMixin
 * @mixes ThemableMixin
 */
class VcfNetwork extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          overflow: hidden;
          position: relative;
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

        .vis-network-container {
          background-color: var(--lumo-contrast-5pct);
          height: 100%;
          width: 100%;
        }
      </style>
      <vcf-network-tool-panel id="toolpanel"></vcf-network-tool-panel>
      <vcf-network-io-panel input id="inputs" context-stack="[[contextStack]]"></vcf-network-io-panel>
      <main>
        <vcf-network-breadcrumbs id="breadcrumbs" context="{{contextStack}}"></vcf-network-breadcrumbs>
        <div class="vis-network-container"></div>
      </main>
      <vcf-network-io-panel output id="outputs" context-stack="[[contextStack]]"></vcf-network-io-panel>
      <vcf-network-info-panel id="infopanel">
        <div slot="node-form">
          <slot name="node-form"></slot>
        </div>
      </vcf-network-info-panel>
      <vcf-network-io-dialog id="iodialog" from-node="[[_ioFromNode]]" to-node="[[_ioToNode]]"></vcf-network-io-dialog>
    `;
  }

  static get is() {
    return 'vcf-network';
  }

  static get version() {
    return '1.0.0-alpha.4';
  }

  static get properties() {
    return {
      data: Object,
      rootData: {
        type: Object,
        value: () => ({
          nodes: new vis.DataSet(),
          edges: new vis.DataSet()
        }),
        notify: true
      },
      import: {
        type: String,
        observer: '_importChanged'
      },
      contextStack: {
        type: Array,
        observer: '_contextChanged'
      },
      vis: Object,
      addingNode: {
        type: Boolean,
        observer: '_addingNodeChanged'
      },
      addingComponent: {
        type: Boolean,
        observer: '_addingComponentChanged'
      },
      addingCopy: {
        type: Boolean,
        observer: '_addingCopyChanged'
      },
      components: {
        type: Array,
        observer: () => []
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._initNetwork();
    this._initComponents();
    this._initEventListeners();
    this._initMultiSelect();
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
    return this._scale || 2;
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
      return {
        nodes: this.nodes,
        edges: this.edges
      };
    }
  }

  get noMode() {
    return !this.addingNode && !this.addingComponent && !this.addingCopy;
  }

  /**
   * @param {{ nodeIds: string[], edgeIds: string[] }} data
   */
  select(data) {
    this._network.selectNodes(data.nodeIds, false);
    this._network.selectEdges(data.edgeIds);
    this.$.infopanel.selection = { nodes: data.nodeIds, edges: data.edgeIds };
  }

  /**
   * @param {Node | Node[]} nodes
   */
  addNodes(nodes) {
    this._addToDataSet('nodes', nodes);
  }

  /**
   * @param {Node | Node[]} nodes
   */
  confirmAddNodes(nodes) {
    this._confirmAddToDataSet('nodes', nodes);
  }

  /**
   * @param {string[]} nodeIds
   */
  deleteNodes(nodeIds) {
    this._removeFromDataSet('nodes', nodeIds);
  }

  /**
   * @param {string[]} nodeIds
   */
  confirmDeleteNodes(nodeIds) {
    this._confirmRemoveFromDataSet('nodes', nodeIds);
  }

  /**
   * @param {Node | Node[]} nodes
   */
  updateNodes(nodes) {
    this._updateDataSet('nodes', nodes);
  }

  /**
   * @param {Node | Node[]} nodes
   */
  confirmUpdateNodes(nodes) {
    this._confirmUpdateDataSet('nodes', nodes);
  }

  /**
   * @param {Edge | Edge[]} edges
   */
  addEdges(edges) {
    this._addToDataSet('edges', edges);
  }

  /**
   * @param {Edge | Edge[]} edges
   */
  confirmAddEdges(edges) {
    this._confirmAddToDataSet('edges', edges);
  }

  /**
   * @param {string[]} edgeIds
   */
  deleteEdges(edgeIds) {
    this._removeFromDataSet('edges', edgeIds);
  }

  /**
   * @param {string[]} edgeIds
   */
  confirmDeleteEdges(edgeIds) {
    this._confirmRemoveFromDataSet('edges', edgeIds);
  }

  /**
   * @param {Edge | Edge[]} edges
   */
  updateEdges(edges) {
    this._updateDataSet('edges', edges);
  }

  /**
   * @param {Edge | Edge[]} edges
   */
  confirmUpdateEdges(edges) {
    this._confirmUpdateDataSet('edges', edges);
  }

  /**
   * @param {string[]} nodeIds
   */
  createComponent(nodeIds) {
    this.select(nodeIds);
    this.$.infopanel._createComponent();
  }

  confirmAddTemplate(component) {
    this.$.toolpanel.confirmAddTemplate(component);
  }

  confirmUpdateTemplate(component) {
    this.$.toolpanel.confirmUpdateTemplate(component);
  }

  confirmDeleteTemplate(id) {
    this.$.toolpanel.confirmDeleteTemplate(id);
  }

  hideEditTemplateButton() {
    this.$.toolpanel.hideEditTemplateButton();
  }
  showEditTemplateButton() {
    this.$.toolpanel.showEditTemplateButton();
  }

  hideTemplatePanel() {
    this.$.toolpanel.hideTemplatePanel();
  }
  showTemplatePanel() {
    this.$.toolpanel.showTemplatePanel();
  }
  closeLeftPanel() {
    this.$.toolpanel.closePanel();
  }
  openLeftPanel() {
    this.$.toolpanel.openPanel();
  }
  closeRightPanel() {
    this.$.infopanel.closePanel();
  }
  openRightPanel() {
    this.$.infopanel.openPanel();
  }
  /**
   * @param {string} id
   */
  getNode(id) {
    return this.data.nodes.get(id);
  }

  getNodes() {
    return this._network.body.nodeIndices.map(id => this.data.nodes.get(id));
  }

  getNodeIds() {
    return this._network.body.nodeIndices;
  }

  /**
   * @param {string} id
   */
  getEdge(id) {
    return this.data.edges.get(id);
  }

  getEdges() {
    return this._network.body.edgeIndices.map(id => this.data.edges.get(id));
  }

  getEdgeIds() {
    return this._network.body.edgeIndices;
  }

  clearData() {
    this.contextStack = [];
    this.data.nodes.clear();
    this.data.edges.clear();
  }

  /**
   * @param {{nodes: Node[], edges: Edge[]}} data
   */
  setData(data) {
    this.clearData();
    this.rootData = {
      nodes: vis.DataSet(data.nodes),
      edges: vis.DataSet(data.edges)
    };
    this.data = this.rootData;
    this._network.setData(this.data);
  }

  _initNetwork() {
    this.vis = this.shadowRoot.querySelector('.vis-network-container');
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
        dragNodes: true,
        hover: true
      }
    };
    this._network = new vis.Network(this.vis, this.rootData, this._options);
    this.contextStack = [];
    this._manipulation = this._network.manipulation;
    this._canvas = this.shadowRoot.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');
    if (!this.data.nodes.length) {
      this._restoreZoom();
    }
  }

  _initComponents() {
    Object.values(this.$).forEach(i => (i.main = this));
  }

  _initEventListeners() {
    this._network.on('hold', opt => {
      if (this.noMode && opt.nodes.length === 1) {
        const startNodeId = opt.nodes[0];
        this._network.addEdgeMode();
        this._canvas.style.cursor = 'grabbing';
        this._manipulation._handleConnect(opt.event);
        this._manipulation._temporaryBindUI('onRelease', e => {
          const node = this._detectNode(e);
          if (node && node.id !== startNodeId) {
            const fromNode = this.data.nodes.get(startNodeId);
            const toNode = this.data.nodes.get(node.id);
            if (toNode.type === 'component' || fromNode.type === 'component') {
              this._clearDataManipulation();
              this._ioFromNode = fromNode;
              this._ioToNode = toNode;
              this.$.iodialog.open();
            } else {
              this._manipulation._finishConnect(e);
            }
          } else {
            this._clearDataManipulation();
          }
        });
      }
    });

    this._network.on('select', opt => {
      if (this.noMode && (opt.nodes.length || opt.edges.length)) {
        this.dispatchEvent(
          new CustomEvent('vcf-network-selection', { detail: { nodes: opt.nodes, edges: opt.edges } })
        );
      }
      this.$.infopanel.selection = opt;
    });

    this._network.on('click', opt => {
      if (!opt.nodes.length) {
        if (this.addingComponent) {
          this._addComponent(opt);
        } else if (this.addingCopy) {
          this.$.infopanel._addCopy(opt);
        }
      }
    });

    this._network.on('doubleClick', opt => {
      if (opt.nodes.length) {
        const selectedNode = this.$.infopanel._selectedNode;
        if (selectedNode.type === 'component') {
          this.$.infopanel.selection = null;
          this.set('contextStack', [
            ...this.$.breadcrumbs.context,
            {
              component: selectedNode,
              parent: this.data,
              data: {
                ...this.data,
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

    this._network.on('dragEnd', opt => {
      if (opt.nodes.length === 1) {
        const node = this._network.body.nodes[opt.nodes[0]];
        const x = Number.parseInt(node.x);
        const y = Number.parseInt(node.y);
        const evt = new CustomEvent('vcf-network-update-coordinates', {
          detail: { id: opt.nodes[0], x: x, y: y },
          cancelable: true
        });
        const cancelled = !this.dispatchEvent(evt);
        if (!cancelled) {
          this.$.infopanel._updateCoords(opt);
        } else {
          this.$.infopanel._refreshCoords(opt, x, y);
        }
      }
    });

    this._network.on('hoverNode', opt => {
      this.dispatchEvent(new CustomEvent('vcf-network-hover-node', { detail: { id: opt.node } }));
    });

    this._network.on('hoverEdge', opt => {
      this.dispatchEvent(new CustomEvent('vcf-network-hover-edge', { detail: { id: opt.edge } }));
    });

    this.setAttribute('tabindex', '0');
    this.addEventListener('mouseenter', () => this.focus());
    this.addEventListener('keyup', e => {
      if (e.defaultPrevented) return;
      const handled = false;
      switch (e.key) {
        case 'n': // -> Add node mode
          this.$.toolpanel.$['add-node'].click();
          break;
        case 'i': // -> Add input node mode
          this.$.toolpanel.$['add-input-node'].click();
          break;
        case 'o': // -> Add output node mode
          this.$.toolpanel.$['add-output-node'].click();
          break;
      }
      if (handled) e.preventDefault();
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
      const nodeIdsInDrawing = [];
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
          nodeIdsInDrawing.push(curNode.id);
        }
      }
      this._network.selectNodes(nodeIdsInDrawing);
      this.$.infopanel.selection = { nodes: nodeIdsInDrawing, edges: this._getConnectedEdgeIds(nodeIdsInDrawing) };
      if (nodeIdsInDrawing.length) {
        this.dispatchEvent(new CustomEvent('vcf-network-selection', { detail: this.$.infopanel.selection }));
      }
    };
    this.vis.addEventListener('mousemove', e => {
      if (this._selectionDrag) {
        restoreDrawingSurface();
        const offsetLeft = this.vis.offsetLeft + this.offsetLeft;
        const offsetTop = this.vis.offsetTop + this.offsetTop;
        this._selectionRect.w = e.pageX - offsetLeft - this._selectionRect.startX;
        this._selectionRect.h = e.pageY - offsetTop - this._selectionRect.startY;
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
    this.vis.addEventListener('mousedown', e => {
      if (e.button == 2) {
        saveDrawingSurface();
        const offsetLeft = this.vis.offsetLeft + this.offsetLeft;
        const offsetTop = this.vis.offsetTop + this.offsetTop;
        this._selectionRect.startX = e.pageX - offsetLeft;
        this._selectionRect.startY = e.pageY - offsetTop;
        this._selectionDrag = true;
        this.vis.style.cursor = 'crosshair';
      }
    });
    this.vis.addEventListener('mouseup', e => {
      if (e.button == 2) {
        restoreDrawingSurface();
        this._selectionDrag = false;
        this.vis.style.cursor = 'default';
        selectNodesFromHighlight();
      }
    });
    this.vis.oncontextmenu = () => false;
  }

  _addingNodeChanged() {
    if (this.addingNode) {
      this._network.addNodeMode();
      this.addingComponent = false;
      this.addingCopy = false;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._clearDataManipulation();
      this._canvas.style.cursor = 'default';
    }
  }

  _addingComponentChanged() {
    if (this.addingComponent) {
      this.addingNode = false;
      this.addingCopy = false;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addingCopyChanged() {
    if (this.addingCopy) {
      this.addingNode = false;
      this.addingComponent = false;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addNodeCallback(data, callback) {
    const nodeType = this._nodeType;
    let newNode;
    if (nodeType === 'input' || nodeType === 'output') {
      newNode = {
        id: data.id,
        label: this._getLabel(nodeType),
        x: data.x,
        y: data.y,
        type: nodeType
      };
    } else {
      newNode = {
        id: data.id,
        label: this._getLabel(),
        x: data.x,
        y: data.y
      };
    }
    this._addToDataSet('nodes', newNode);
  }

  _addEdgeCallback(data, callback) {
    const newEdge = {
      id: vis.util.randomUUID(),
      from: data.from,
      to: data.to
    };
    this._addToDataSet('edges', newEdge);
    this._canvas.style.cursor = 'default';
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

  _importChanged(src) {
    fetch(src)
      .then(res => res.json())
      .then(json => {
        this.$.toolpanel.set('components', json);
      });
  }

  _addComponent(opt) {
    // const importData = this._componentTemplate;
    const importData = { nodes: [this._componentTemplate], edges: [] };
    const parsedData = this._setUUIDs(importData);
    const setDeepEdges = edges => {
      return edges.map(edge => {
        const deepEdge = { ...edge };
        if (deepEdge.displayTo) {
          deepEdge.deepTo = deepEdge.to;
          deepEdge.to = deepEdge.displayTo;
          delete deepEdge.displayTo;
        }
        if (deepEdge.displayFrom) {
          deepEdge.deepFrom = deepEdge.from;
          deepEdge.from = deepEdge.displayFrom;
          delete deepEdge.displayFrom;
        }
        return deepEdge;
      });
    };
    const setNodeStyles = nodes => {
      return nodes.map(node => {
        const coords = opt.event.center;
        const canvasCoords = this._network.DOMtoCanvas({
          x: coords.x - this.vis.offsetLeft - this.offsetLeft,
          y: coords.y - this.vis.offsetTop - this.offsetTop
        });
        /* Recursively set styles on nested nodes */
        if (node.type === 'component') {
          node.nodes = setNodeStyles(node.nodes);
          node.edges = setDeepEdges(node.edges);
        }
        node.x = node.isRoot ? canvasCoords.x : node.x;
        node.y = node.isRoot ? canvasCoords.y : node.y;
        return this._wrapItemClass(node);
      });
    };
    parsedData.nodes.forEach(node => (node.isRoot = true));
    this._addToDataSet('nodes', setNodeStyles(parsedData.nodes));
    this._addToDataSet('edges', parsedData.edges);
  }

  _restoreZoom() {
    this._network.moveTo({ scale: this.scale });
  }

  _contextChanged(contextStack) {
    let id = '';
    if (contextStack.length) {
      const context = contextStack[contextStack.length - 1];
      this.data = context.data;
      const hasInputs = Object.keys(context.component.inputs).length;
      const hasOutputs = Object.keys(context.component.outputs).length;
      this._setIOPanelVisibility('input', !hasInputs);
      this._setIOPanelVisibility('output', !hasOutputs);
      id = context.component.id;
    } else {
      this.data = this.rootData;
      this._setIOPanelVisibility('input', true);
      this._setIOPanelVisibility('output', true);
    }
    this._network.setData(this.data);
    this._restoreZoom();
    this.dispatchEvent(new CustomEvent('vcf-network-navigate-to', { detail: { id } }));
  }

  _addToDataSet(dataset, items) {
    const evt = new CustomEvent(`vcf-network-new-${dataset}`, { detail: { items }, cancelable: true });
    const cancelled = !this.dispatchEvent(evt);
    if (!cancelled) {
      this._confirmAddToDataSet(dataset, items);
      this.dispatchEvent(new CustomEvent(`vcf-network-after-new-${dataset}`, { detail: { items } }));
    }
  }

  _confirmAddToDataSet(dataset, items) {
    if (Array.isArray(items)) {
      items = items.map(item => this._wrapItemClass(item));
    } else {
      items = this._wrapItemClass(items);
    }
    this.data[dataset].add(items);
    if (this.context) {
      if (Array.isArray(items)) {
        this.context.component[dataset] = this.context.component[dataset].concat(items);
      } else {
        this.context.component[dataset].push(items);
      }
      this._propagateUpdates();
    }
    this._notifyRoot();
    // Keep add node mode active
    if (this.addingNode) {
      this._network.addNodeMode();
    }
  }

  _removeFromDataSet(dataset, items) {
    const event = new CustomEvent(`vcf-network-delete-${dataset}`, { detail: { ids: items }, cancelable: true });
    const cancelled = !this.dispatchEvent(event);
    if (!cancelled) {
      this._confirmRemoveFromDataSet(dataset, items);
      this.dispatchEvent(new CustomEvent(`vcf-network-after-delete-${dataset}`, { detail: { ids: items } }));
    }
  }

  _confirmRemoveFromDataSet(dataset, items) {
    if (dataset === 'edges') {
      this._removeIO(items);
    } else {
      this._removeConnectedEdges(items);
    }
    this.data[dataset].remove(items);
    if (this.context) {
      if (Array.isArray(items)) {
        this.context.component[dataset] = this.context.component[dataset].filter(item => !items.includes(item.id));
      } else {
        this.context.component[dataset].splice(this.context.component[dataset].indexOf(items.id), 1);
      }
      this._propagateUpdates();
    }
    this._notifyRoot();
  }

  _removeConnectedEdges(nodeIds) {
    this._removeFromDataSet('edges', this._getConnectedEdgeIds(nodeIds));
  }

  _getConnectedEdgeIds(nodeIds) {
    const edgeIdSet = new Set();
    nodeIds.forEach(nodeId => {
      this._network.getConnectedEdges(nodeId).forEach(edge => {
        edgeIdSet.add(edge);
      });
    });
    return [...edgeIdSet];
  }

  _removeIO(edgeIds) {
    edgeIds.forEach(edgeId => {
      const edge = this.data.edges.get(edgeId);
      if (edge.deepFrom) {
        const path = edge.deepFromPath;
        let component = this.rootData.nodes.get(path.shift());
        path.forEach(id => (component = component.nodes.filter(node => node.id === id)[0]));
        component.outputs[edge.deepFrom] = component.outputs[edge.deepFrom].filter(pathObj => pathObj.id !== edge.id);
        if (!component.outputs[edge.deepFrom].length) delete component.outputs[edge.deepFrom];
      }
      if (edge.deepTo) {
        const path = edge.deepToPath;
        let component = this.rootData.nodes.get(path.shift());
        path.forEach(id => (component = component.nodes.filter(node => node.id === id)[0]));
        component.inputs[edge.deepTo] = component.inputs[edge.deepTo].filter(pathObj => pathObj.id !== edge.id);
        if (!component.inputs[edge.deepTo].length) delete component.inputs[edge.deepTo];
      }
    });
  }

  _updateDataSet(dataset, items) {
    const evt = new CustomEvent(`vcf-network-update-${dataset}`, { detail: { items }, cancelable: true });
    const cancelled = !this.dispatchEvent(evt);
    if (!cancelled) {
      this._confirmUpdateDataSet(dataset, items);
      this.dispatchEvent(new CustomEvent(`vcf-network-after-update-${dataset}`, { detail: { ids: items } }));
    }
  }

  _confirmUpdateDataSet(dataset, items) {
    this.data[dataset].update(items);
    if (this.context) {
      if (Array.isArray(items)) {
        items.forEach(item => this._updateComponentProperties(this.context.component[dataset], item));
      } else {
        this._updateComponentProperties(this.context.component[dataset], items);
      }
      this._propagateUpdates();
    }
    this._notifyRoot();
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

  _setIOPanelVisibility(type, hidden) {
    if (hidden) this.$[`${type}s`].setAttribute('hidden', true);
    else this.$[`${type}s`].removeAttribute('hidden');
  }

  _getLabel(type = 'node') {
    const counter = `__${type}Count`;
    const prefix = type[0].toUpperCase() + type.slice(1);
    return `${prefix} ${this.data[counter] ? ++this.data[counter] : (this.data[counter] = 1)}`;
  }

  _getPath(id) {
    const path = [id];
    if (this.context) {
      const stack = this.contextStack.slice();
      for (const context of stack) {
        path.unshift(context.id);
      }
    }
    return path;
  }

  _wrapItemClass(item) {
    if (item.from) {
      return new Edge(item);
    } else if (item.type === 'component') {
      return new ComponentNode(item);
    } else if (item.type === 'input' || item.type === 'output') {
      return new IONode(item);
    } else {
      return new Node(item);
    }
  }

  _notifyRoot() {
    this.rootData = Object.assign({}, this.rootData);
  }

  _setUUIDs(data) {
    const json = JSON.stringify(data);
    const idMap = {};
    const idRegex = /"id":(\d+)|"(\d+)":/g;
    const pathRegex = /\[([\d,]+)\]/g;
    const fromToRegex = /"(from|displayFrom)":(\d+)|"(to|displayTo)":(\d+)/g;
    let idMatches;
    let pathMatches;
    let fromToMatches;
    let parsed = json.slice();
    /* Replace node and edge template ids */
    while ((idMatches = idRegex.exec(json)) !== null) {
      const match = idMatches[0];
      const templateId = idMatches[1] || idMatches[2];
      const uuid = idMap[templateId] || vis.util.randomUUID();
      const replaceString = idMatches[1] ? `"${uuid}"` : uuid;
      const uuidString = match.replace(templateId, replaceString);
      parsed = parsed.replace(match, uuidString);
      if (!idMap[templateId]) idMap[templateId] = uuid;
    }
    /* Replace edge from and to template ids */
    while ((fromToMatches = fromToRegex.exec(json)) !== null) {
      const match = fromToMatches[0];
      const isFrom = match.includes('"from"') || match.includes('"displayFrom"');
      const templateId = isFrom ? fromToMatches[2] : fromToMatches[4];
      const uuid = idMap[templateId];
      const uuidString = match.replace(templateId, `"${uuid}"`);
      parsed = parsed.replace(match, uuidString);
    }
    /* Replace input/output path template ids */
    while ((pathMatches = pathRegex.exec(json)) !== null) {
      const match = pathMatches[0];
      const templateIds = pathMatches[1];
      const uuids = templateIds
        .split(',')
        .map(id => `"${idMap[id]}"`)
        .join(',');
      const uuidString = match.replace(templateIds, uuids);
      parsed = parsed.replace(match, uuidString);
    }
    return JSON.parse(parsed);
  }

  _clearDataManipulation() {
    this._manipulation._clean();
    this._manipulation._restore();
    this._canvas.style.cursor = 'default';
  }
}

customElements.define(VcfNetwork.is, VcfNetwork);
