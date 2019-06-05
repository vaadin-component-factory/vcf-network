import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import './lib/vis-network.web.js';
import './vcf-hn-tool-panel';
import './vcf-hn-breadcrumbs';
import './vcf-hn-info-panel';

class VcfHierarchicalNetwork extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style include="vis-styles">
        :host {
          display: flex;
          position: relative;
        }

        :host([hidden]) {
          display: none !important;
        }

        .canvas-container {
          background: #fafafa;
          width: 100%;
          height: 75vh;
          z-index: 1;
        }
      </style>
      <vcf-hn-tool-panel id="toolpanel"></vcf-hn-tool-panel>
      <vcf-hn-breadcrumbs id="breadcrumbs"></vcf-hn-breadcrumbs>
      <div id="main" class="canvas-container"></div>
      <vcf-hn-info-panel id="infopanel"></vcf-hn-info-panel>
    `;
  }

  static get is() {
    return 'vcf-hierarchical-network';
  }

  static get version() {
    return '0.1.0';
  }

  static get properties() {
    return {
      data: {
        type: Object,
        value: () => ({
          nodes: [],
          edges: []
        }),
        observer: '_dataChanged'
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
        type: Boolean,
        observer: '_addingComponentChanged'
      },
      _options: {
        type: Object
      },
      _network: {
        type: Object
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._initNetwork();
    this._initEventListeners();
    this._initMultiSelect();
    this._setMargins();
  }

  _setMargins() {
    this.$.main.style.marginTop = `${this.$.breadcrumbs.clientHeight}px`;
    this.$.main.style.marginRight = `${this.$.infopanel.clientWidth}px`;
    this.$.main.style.marginLeft = `${this.$.toolpanel.clientWidth}px`;
  }

  _initNetwork() {
    this._options = {
      physics: false,
      layout: {
        randomSeed: 42
      },
      nodes: {
        fixed: false,
        shape: 'box',
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
          size: 10,
          color: 'rgba(27, 43, 65, 0.72)'
        },
        margin: {
          top: 6,
          right: 15,
          bottom: 6,
          left: 15
        }
      },
      edges: {
        arrows: 'to',
        length: 400,
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
        multiselect: true,
        selectConnectedEdges: false,
        dragNodes: true
      }
    };
    this._network = new vis.Network(this.$.main, this._visDataset, this._options);
    this._manipulation = this._network.manipulation;
    this._canvas = this.shadowRoot.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');
    this.$.infopanel._network = this._network;
  }

  _initEventListeners() {
    this.$.toolpanel.addEventListener('adding-node', e => (this.addingNode = true));
    this.$.toolpanel.addEventListener('adding-edge', e => (this.addingEdge = true));
    this._network.on('dragStart', opt => {
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
    this._network.on('release', () => {
      this._network.moveTo({ scale: 3 });
    });
    this._network.on('select', opt => {
      this.$.infopanel.selection = opt;
    });
  }

  _addingNodeChanged() {
    if (this.addingNode) {
      this._network.addNodeMode();
      this.addingEdge = false;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _addingEdgeChanged() {
    if (this.addingEdge) {
      this._network.addEdgeMode();
      this.addingNode = false;
      this._canvas.style.cursor = 'crosshair';
    } else {
      this._canvas.style.cursor = 'default';
    }
  }

  _dataChanged(data) {
    if (this._network && (data.nodes.length || data.edges.length)) {
      this._network.setData({
        nodes: new vis.DataSet(data.nodes),
        edges: new vis.DataSet(data.edges)
      });
      setTimeout(() => {
        this._network.fit({
          nodes: this.data.nodes.map(n => n.id)
        });
      });
    }
  }

  _addingNodeCallback(data, callback) {
    this.data.nodes.push({
      id: data.id,
      label: data.label
    });
    this.addingNode = false;
    this.$.toolpanel.clear();
    this._canvas.style.cursor = 'default';
    callback(data);
  }

  _addingEdgeCallback(data, callback) {
    this.data.edges.push({
      from: data.from,
      to: data.to
    });
    this.addingEdge = false;
    this._canvas.style.cursor = 'default';
    callback(data);
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

  _initMultiSelect() {
    this._selectionRect = {};
    const saveDrawingSurface = () => {
      this._drawingSurfaceImageData = this._ctx.getImageData(
        0,
        0,
        this._canvas.width,
        this._canvas.height
      );
    };
    const restoreDrawingSurface = () => {
      this._ctx.putImageData(this._drawingSurfaceImageData, 0, 0);
    };
    const getStartToEnd = (start, length) => {
      return length > 0
        ? { start: start, end: start + length }
        : { start: start + length, end: start };
    };
    const selectNodesFromHighlight = () => {
      const nodesIdInDrawing = [];
      const xRange = getStartToEnd(this._selectionRect.startX, this._selectionRect.w);
      const yRange = getStartToEnd(this._selectionRect.startY, this._selectionRect.h);
      const allNodes = this._network.body.nodes;
      for (let i = 0; i < allNodes.length; i++) {
        const curNode = allNodes[i];
        const nodePosition = this._network.getPositions([curNode.id]);
        const nodeXY = this._network.canvasToDOM({
          x: nodePosition[curNode.id].x,
          y: nodePosition[curNode.id].y
        });
        if (
          xRange.start <= nodeXY.x &&
          nodeXY.x <= xRange.end &&
          yRange.start <= nodeXY.y &&
          nodeXY.y <= yRange.end
        ) {
          nodesIdInDrawing.push(curNode.id);
        }
      }
      this._network.selectNodes(nodesIdInDrawing);
    };
    this.$.main.addEventListener('mousemove', e => {
      if (this._selectionDrag) {
        restoreDrawingSurface();
        this._selectionRect.w = e.pageX - this.offsetLeft - this._selectionRect.startX;
        this._selectionRect.h = e.pageY - this.offsetTop - this._selectionRect.startY;
        this._ctx.setLineDash([5]);
        this._ctx.strokeStyle = 'rgb(0, 102, 0)';
        this._ctx.strokeRect(
          this._selectionRect.startX,
          this._selectionRect.startY,
          this._selectionRect.w,
          this._selectionRect.h
        );
        this._ctx.setLineDash([]);
        this._ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
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
        this._selectionRect.startX = e.pageX - this.offsetLeft;
        this._selectionRect.startY = e.pageY - this.offsetTop;
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
}

customElements.define(VcfHierarchicalNetwork.is, VcfHierarchicalNetwork);
