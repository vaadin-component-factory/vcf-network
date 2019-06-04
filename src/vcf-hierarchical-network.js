import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import { getFileText } from './util/get-file-text';
import { styleModule } from './util/style-module';
import './lib/vis-network.web.js';
import './vcf-hierarchical-network-toolbar';

(async () => {
  const visStyles = await getFileText('../node_modules/vis/dist/vis.css');

  class VcfHierarchicalNetwork extends ElementMixin(ThemableMixin(PolymerElement)) {
    static get template() {
      styleModule({
        themeName: 'vis-styles',
        styles: visStyles
      });

      return html`
        <style include="vis-styles">
          :host {
            display: flex;
          }

          :host([hidden]) {
            display: none !important;
          }

          .canvas-container {
            background: #fafafa;
          }
        </style>
        <vcf-hierarchical-network-toolbar id="toolbar"></vcf-hierarchical-network-toolbar>
        <div id="main" class="canvas-container"></div>
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
        width: {
          type: Number,
          value: 800
        },
        height: {
          type: Number,
          value: 600
        },
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
        _parent: {
          type: Object
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
      this._setDimensions();
    }

    _setDimensions() {
      this._parent = this.parentElement;
      const toolbarWidth = this.$.toolbar.clientWidth;
      if (this._parent && !this._parent.style.width) {
        const parentStyles = window.getComputedStyle(this._parent);
        this.$.main.style.width = `${parseInt(parentStyles.width) - toolbarWidth}px`;
      } else {
        this.$.main.style.width = `${this._parent.style.width - toolbarWidth}px`;
      }
      if (this._parent && !this._parent.style.height) {
        const parentBoundingRect = this._parent.getBoundingClientRect();
        this.$.main.style.height = `calc(80vh - ${parentBoundingRect.top}px)`;
      } else {
        this.$.main.style.height = `${this._parent.style.height}px`;
      }
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
            top: 12,
            right: 15,
            bottom: 12,
            left: 15
          }
        },
        edges: {
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
        }
      };
      this._network = new vis.Network(this.$.main, this._visDataset, this._options);
      this._manipulation = this._network.manipulation;
      this._canvas = this.shadowRoot.querySelector('canvas');
    }

    _initEventListeners() {
      this.$.toolbar.addEventListener('adding-node', e => (this.addingNode = true));
      this.$.toolbar.addEventListener('adding-edge', e => (this.addingEdge = true));
      this._network.on('hold', opt => {
        if (opt.nodes.length) {
          this.addingEdge = true;
          this._manipulation._handleConnect(opt.event);
          this._manipulation._temporaryBindUI('onRelease', e => {
            if (this._detectNode(e)) {
              this._manipulation._finishConnect(e);
            } else {
              this._reset();
            }
          });
        }
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
      this.data.nodes = this.data.nodes || [];
      this.data.nodes.push({
        id: data.id,
        label: data.label
      });
      this.addingNode = false;
      this.$.toolbar.clear();
      this._canvas.style.cursor = 'default';
      callback(data);
    }

    _addingEdgeCallback(data, callback) {
      this.data.edges = this.data.edges || [];
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
      this.$.toolbar.clear();
      this._manipulation._clean();
      this._manipulation._restore();
    }
  }

  customElements.define(VcfHierarchicalNetwork.is, VcfHierarchicalNetwork);
})();
