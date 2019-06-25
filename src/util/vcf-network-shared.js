import styleModule from './style-module';
import { pSBC } from './pSBC';
import '../lib/vis-network.web';

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

export const colors = () => {
  styleModule({
    themeName: 'vcf-network-colors',
    styles: `
      :host {
      ${colorVars.map((c, i) => `  ${c.name}: ${c.value};\n`).join('')}
      }
    `
  });
};

export class Node {
  constructor(options) {
    this.label = options.label || 'Node';
    this.id = options.id || vis.util.randomUUID();
    Object.assign(this, options);
  }
}

export class Edge {
  constructor(options) {
    if (!options.from) throw new Error("'from' is required to create an edge");
    if (!options.to) throw new Error("'to' is required to create an edge");
    this.from = options.from;
    this.to = options.to;
    Object.assign(this, options);
  }
}

export class ComponentNode extends Node {
  constructor(options) {
    super(options);
    this.componentColor = options.componentColor || 0;
    this.type = 'component';
    this.nodes = options.nodes || [];
    this.edges = options.edges || [];
    this.cid = `c:${vis.util.randomUUID()}`;
    Object.assign(this, ComponentNode.getComponentNodeStyles(this.componentColor));
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
  constructor(options) {
    super(options);
    this.type = options.type || 'input';
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
