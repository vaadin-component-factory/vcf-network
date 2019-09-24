/**
 * @license
 * Copyright (C) 2015 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 * See the file LICENSE.md distributed with this software for more information about licensing.
 * See [the website]{@link https://vaadin.com/license/cval-3} for the complete license.
 */

import styleModule from './style-module';
import { pSBC } from './pSBC';
import vis from 'vis-network/dist/vis-network.esm';

export const colorVars = [
  { name: '--vcf-network-red', value: 'rgb(208,2,28)' },
  { name: '--vcf-network-orange', value: 'rgb(245,166,35)' },
  { name: '--vcf-network-yellow', value: 'rgb(248,232,29)' },
  { name: '--vcf-network-green', value: 'rgb(125,212,33)' },
  { name: '--vcf-network-dark-green', value: 'rgb(65,117,6)' },
  { name: '--vcf-network-blue', value: 'rgb(73,144,226)' },
  { name: '--vcf-network-purple', value: 'rgb(144,19,254)' },
  { name: '--vcf-network-violet', value: 'rgb(189,16,224)' },
  { name: '--vcf-network-brown', value: 'rgb(138,86,43)' }
];

export const addColorStyles = () => {
  styleModule({
    themeName: 'vcf-network-colors',
    styles: `
      :host {
      ${colorVars.map((c, i) => `  ${c.name}: ${c.value};\n`).join('')}
      }
    `
  });
};

export const randomColor = () => {
  return Math.floor(Math.random() * colorVars.length);
};

export class Node {
  /**
   * @param {Object} options Object containing `label`, `id` and any other data to be contained in this node.
   */
  constructor(options = {}) {
    /**
     * @property {String} label Text displayed on the node.
     */
    this.label = options.label || 'Node';
    /**
     * @property {String} id Unique ID of the node.
     */
    this.id = options.id || vis.util.randomUUID();
    Object.assign(this, options);
  }
}

export class Edge {
  /**
   * @param {Object} options Object containing `from`, `to` and any other data to be contained in this edge.
   */
  constructor(options = {}) {
    if (!options.from) throw new Error("'from' is required to create an edge");
    if (!options.to) throw new Error("'to' is required to create an edge");
    /**
     * @property {String} from Unique ID of the edge
     */
    this.id = options.id || vis.util.randomUUID();
    /**
     * @property {String} from ID of node this edge comes from.
     */
    this.from = options.from;
    /**
     * @property {String} to ID of node this edge goes to.
     */
    this.to = options.to;
    this.modelFrom = this.from;
    this.modelTo = this.to;
    Object.assign(this, options);
  }
}

export class ComponentNode extends Node {
  /**
   * @param {Object} options
   * Object containing `label`, `edges`, `nodes` and any other data to be contained in this component.
   */
  constructor(options = {}) {
    super(options);
    this.type = 'component';
    this.label = options.label || 'Component';
    /**
     * @property {Node[]} nodes Array of nodes in this component.
     */
    this.nodes = options.nodes || [];
    /**
     * @property {Edge[]} edges Array of edges in this component.
     */
    this.edges = options.edges || [];
    this.inputs = options.inputs || {};
    this.outputs = options.outputs || {};
    /**
     * @property {number} componentColor Number from 0-8. Sets color of this component.
     */
    this.componentColor = options.componentColor;
    this.setComponentColor(options.componentColor);
    Object.assign(this, ComponentNode.getComponentNodeStyles(this.componentColor));
  }

  setComponentColor(color) {
    let colorId = parseInt(color);
    if (color === undefined || colorId < 0 || colorId > 8) {
      colorId = randomColor();
    }
    this.componentColor = colorId;
  }

  static getComponentNodeStyles(colorId) {
    const color = colorVars[colorId].value;
    return {
      color: {
        background: shade(0.8, color),
        border: shade(0.1, color),
        highlight: {
          background: shade(0.7, color),
          border: color
        }
      },
      margin: {
        top: 10,
        right: 15,
        bottom: 10,
        left: 15
      },
      font: {
        size: 9
      }
    };
  }
}

export class IONode extends Node {
  constructor(options = {}) {
    super(options);
    this.type = options.type || 'input';
    this.label = options.label || 'Input';
    Object.assign(this, IONode.getIONodeStyles(this.type === 'input'));
  }

  static getIONodeStyles(input) {
    const color = input ? 'rgb(0,163,67)' : 'rgb(245,36,24)';
    return {
      color: {
        background: 'white',
        border: shade(0.1, color),
        highlight: {
          background: 'white',
          border: color
        }
      }
    };
  }
}

export function shade(percent, color) {
  return pSBC.bind(window)(percent, color);
}
