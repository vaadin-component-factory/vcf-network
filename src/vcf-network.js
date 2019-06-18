import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import './lib/vis-network.web.js';
import './components/vcf-network-tool-panel';
import './components/vcf-network-breadcrumbs';
import './components/vcf-network-info-panel';

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
          background-color: var(--lumo-contrast-5pct);
          flex-grow: 1;
        }
      </style>
      <vcf-network-tool-panel id="toolpanel"></vcf-network-tool-panel>
      <main>
        <vcf-network-breadcrumbs id="breadcrumbs" context="{{contextStack}}"></vcf-network-breadcrumbs>
        <div id="main" class="canvas-container"></div>
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
      data: {
        type: Object,
        value: () => ({
          nodes: new vis.DataSet(),
          edges: new vis.DataSet(),
          components: []
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
      },
      scale: {
        type: Number,
        value: 2
      },
      _options: {
        type: Object
      },
      _network: {
        type: Object
      },
      _addNodeCount: {
        type: Number,
        value: 0
      }
    };
  }

  get context() {
    return this.contextStack[this.contextStack.length - 1];
  }

  connectedCallback() {
    super.connectedCallback();
    this._initNetwork();
    this._initComponents();
    this._initEventListeners();
    this._initMultiSelect();
  }

  _initNetwork() {
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
        addNode: this._addingNodeCallback.bind(this),
        addEdge: this._addingEdgeCallback.bind(this),
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
    this._network = new vis.Network(this.$.main, this.data, this._options);
    this.contextStack = [];
    this._manipulation = this._network.manipulation;
    this._canvas = this.shadowRoot.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');
    if (!this.dataContext.nodes.length) {
      this._restoreZoom();
    }
  }

  _initComponents() {
    this.$.infopanel._parent = this;
    this.$.toolpanel._parent = this;
    this.$.breadcrumbs._parent = this;
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
        this._addComponent(opt);
      }
    });
    this._network.on('doubleClick', opt => {
      const selectedNode = this.$.infopanel._selectedNode;
      if (selectedNode.options.cid) {
        this.set('contextStack', [
          ...this.$.breadcrumbs.context,
          {
            parentContext: this.dataContext,
            data: selectedNode.options
          }
        ]);
      }
    });
    this._network.on('zoom', opt => {
      this.scale = opt.scale;
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
        const curNode = this.dataContext.nodes.get(nodeIndices[i]);
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
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _dataChanged() {}

  _addingNodeCallback(data, callback) {
    const newNode = {
      id: data.id,
      label: `Node ${++this._addNodeCount}`,
      x: data.x,
      y: data.y
    };
    this.dataContext.nodes.add(newNode);
    if (this.context && this.context.parentContext !== this.dataContext) {
      this.context.data.nodes.push(newNode);
      this.context.parentContext.nodes.update({
        id: this.context.data.id,
        nodes: this.context.data.nodes
      });
    }
    this.addingNode = false;
    this.$.toolpanel.clear();
    this._canvas.style.cursor = 'default';
  }

  _addingEdgeCallback(data, callback) {
    const newEdge = {
      from: data.from,
      to: data.to
    };
    this.dataContext.edges.add(newEdge);
    if (this.context) {
      this.context.data.edges.push(newEdge);
      this.context.parentContext.nodes.update({
        id: this.context.data.id,
        edges: this.context.data.edges
      });
    }
    this.addingEdge = false;
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

  _addComponent(opt) {
    const idMap = {};
    const importData = this.addingComponent;
    const setNodeUUIDs = nodes => {
      return nodes.map(node => {
        const coords = this._network.DOMtoCanvas(opt.event.center);
        idMap[node.id] = vis.util.randomUUID();
        if (node.cid) {
          node.nodes = setNodeUUIDs(node.nodes);
          node.edges = setEdgeUUIDs(node.edges);
        }
        return {
          ...node,
          id: idMap[node.id],
          x: node.x + coords.x,
          y: node.y + coords.y
        };
      });
    };
    const setEdgeUUIDs = edges => {
      return edges.map(edge => {
        idMap[edge.id] = vis.util.randomUUID();
        return {
          ...edge,
          from: idMap[edge.from],
          to: idMap[edge.to],
          id: idMap[edge.id]
        };
      });
    };
    this.dataContext.nodes.add(setNodeUUIDs(importData.nodes));
    this.dataContext.edges.add(setEdgeUUIDs(importData.edges));
    this.addingComponent = null;
  }

  _restoreZoom() {
    this._network.moveTo({ scale: this.scale });
  }

  _contextChanged(context) {
    if (context.length) {
      const contextObj = context[context.length - 1];
      this.dataContext = {
        nodes: new vis.DataSet(contextObj.data.nodes),
        edges: new vis.DataSet(contextObj.data.edges)
      };
    } else {
      this.dataContext = this.data;
    }
    this._network.setData(this.dataContext);
    this._restoreZoom();
  }
}

customElements.define(VcfNetwork.is, VcfNetwork);
