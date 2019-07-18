import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import tippy from 'tippy.js';

class VcfNetworkIOPanel extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          width: 220px;
          height: 100%;
        /*  position: absolute;
          left: 240px;
          top: 44px;
          z-index: 1;*/
        }

        :host([hidden]) {
          display: none !important;
        }

        h6 {
          text-align: center;
          font-size: var(--lumo-font-size-xs);
          margin: 0;
          padding: var(--lumo-space-s) 0;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--lumo-secondary-text-color);
        }

        .io-container {
          height: 100%;
          border: 1px dashed var(--lumo-shade-10pct);
          border-width: 0 2px 0 0;
          background: var(--lumo-shade-5pct);
        }

        .io-container.output {
          border-width: 0 0 0 2px;
        }

        .node {
          font-size: var(--lumo-font-size-xs);
          color: var(--lumo-secondary-text-color);
          background: var(--lumo-base-color);
          border: 1px solid var(--lumo-shade-20pct);
          border-radius: 10px;
          margin: var(--lumo-space-s) 0;
          width: 100%;
          text-align: center;
          user-select: none;
          padding: 1px;
        }

        .node.selectable:hover {
          cursor: pointer;
          background-color: #d2e5ff;
          border: 2px solid #2c7cea;
          font-weight: bold;
          padding: 0;
        }

        .node.input {
          border-color: var(--lumo-success-text-color);
        }

        .node.output {
          border-color: var(--lumo-error-text-color);
        }

        .io-item {
          width: 80%;
          margin: auto;
          padding: var(--lumo-space-s) 0;
          border-top: 1px solid var(--lumo-shade-10pct);
        }

        .io-item:first-of-type {
          border-top: none;
        }

        .arrow-down::before {
          content: '';
          width: 0;
          height: 10px;
          border-left: 1px solid var(--lumo-shade-20pct);
          border-right: 1px solid var(--lumo-shade-20pct);
          display: block;
          margin: auto;
        }

        .arrow-down::after {
          content: '';
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid var(--lumo-shade-20pct);
          display: block;
          margin: auto;
        }
      </style>
      <div id="container" class="io-container">
        <h6>[[label]]</h6>
        <template id="io-list" is="dom-repeat" items="[[data]]">
          <template is="dom-if" if="[[!output]]">
            <div class="io-item">
              <template is="dom-repeat" items="[[item.paths]]" on-dom-change="_setTooltips">
                <div
                  class$="node selectable [[item.type]]"
                  data-tippy-content$="[[item.tooltip]]"
                  data-path$="[[item.path]]"
                  on-click="_selectEdge"
                >
                  [[item.label]]
                </div>
              </template>
              <div class="arrow-down"></div>
              <div class="node input" data-tippy-content$="[[item.mainTooltip]]">[[item.label]]</div>
            </div>
          </template>
          <template is="dom-if" if="[[output]]">
            <div class="io-item">
              <div class="node output" data-tippy-content$="[[item.mainTooltip]]">[[item.label]]</div>
              <div class="arrow-down"></div>
              <template is="dom-repeat" items="[[item.paths]]" on-dom-change="_setTooltips">
                <div
                  class$="node selectable [[item.type]]"
                  data-tippy-content$="[[item.tooltip]]"
                  data-path$="[[item.path]]"
                  on-click="_selectEdge"
                >
                  [[item.label]]
                </div>
              </template>
            </div>
          </template>
        </template>
      </div>
    `;
  }

  static get is() {
    return 'vcf-network-io-panel';
  }

  static get properties() {
    return {
      input: {
        type: Boolean,
        value: false
      },
      output: {
        type: Boolean,
        value: false
      },
      label: {
        type: String,
        value: 'input'
      },
      contextStack: {
        type: Array,
        observer: '_contextStackChanged'
      },
      data: {
        type: Array
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.output) {
      this.label = 'output';
      this.style.left = 'unset';
      this.style.right = '240px';
      this.$.container.classList.add('output');
    }
  }

  _setTooltips(e) {
    const nodes = this.$.container.querySelectorAll('.node');
    if (this._tooltips) this._tooltips.forEach(tooltip => tooltip.destroy());
    this._tooltips = tippy(nodes);
  }

  _contextStackChanged(contextStack) {
    if (contextStack.length) {
      const component = contextStack[contextStack.length - 1].component;
      const type = this.output ? 'output' : 'input';
      this.data = Object.entries(component[`${type}s`]).map(item => {
        const node = component.nodes.filter(node => node.id === item[0])[0];
        return {
          id: node.id,
          label: node.label,
          mainTooltip: this._getTooltip(node.label),
          paths: this._getPaths(item[1])
        };
      });
    }
  }

  _getTooltip(label) {
    let tooltip = '';
    this.contextStack.forEach((context, i) => {
      tooltip += context.component.label + ' > ';
    });
    return tooltip + label;
  }

  /**
   * @param {string[]} path
   */
  _getPaths(paths) {
    return paths.map(obj => {
      const path = obj.path;
      const edgeId = obj.id;
      let data = this.main.rootData.nodes;
      let label = '';
      let type = '';
      let tooltip = '';
      path.forEach((id, i) => {
        const node = data instanceof vis.DataSet ? data.get(id) : data.filter(i => i.id === id)[0];
        if (i < path.length - 1) data = node.nodes;
        else {
          label = node.label;
          type = node.type || '';
        }
        if (i !== 0) tooltip += ' > ';
        tooltip += node.label;
      });
      return { label, type, tooltip, path, edgeId };
    });
  }

  _selectEdge(e) {
    console.log(e);
  }
}

customElements.define(VcfNetworkIOPanel.is, VcfNetworkIOPanel);
