# &lt;vcf-network&gt;

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin/web-components?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://badgen.net/npm/v/@vaadin-component-factory/vcf-network)](https://www.npmjs.com/package/@vaadin-component-factory/vcf-network)
[![Published on Vaadin Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadin-component-factoryvcf-network)

[Live Demo ↗](https://vcf-network.netlify.com)
|
[API documentation ↗](https://vcf-network.netlify.com/api/#/elements/Vaadin.VcfNetwork)

## Installation

Install `vcf-network`:

```sh
npm i @vaadin-component-factory/vcf-network --save
```

## Usage

Once installed, import it in your application:

```js
import '@vaadin-component-factory/vcf-network/vcf-network.js';
```

Add `<vcf-network>` element to the page.

```html
<vcf-network></vcf-network>
```

## Creating networks

The hierarchical network visualization consists of nodes, edges and components. A component is a grouping of nodes, edges and other components.

#### Add nodes

Click the button for the node type you would like to add on the left tool panel. This will activate the "Add node mode" for this node type. You can then click anywhere on the middle canvas area to create a node at that position.

![add-nodes](https://user-images.githubusercontent.com/3392815/63940106-7e43d280-ca71-11e9-84b0-74fc0fad6a81.gif)

#### Add edges

To add an edge between two nodes, first click and hold on the node you would like the edge to begin from. The cursor will change and you will be able to drag an edge to another node. When you release the mouse button over another node, an edge will be created.

![add-edges](https://user-images.githubusercontent.com/3392815/63940134-8dc31b80-ca71-11e9-80e0-fa386c052167.gif)

#### Creating components

In order to create components you must first select the nodes that will be in that component. You can select a single node by clicking with the left mouse button but to select multiple nodes, you must click and drag with the **right mouse button**. Once you have selected nodes, click the Create Component button on the right panel. You can then edit the components name and color using the fields also found on the right panel.

![create-components](https://user-images.githubusercontent.com/3392815/63940164-99164700-ca71-11e9-9a7e-703da4c5e28a.gif)

## Hotkeys

#### Mouse

- **Double Click:** Create node if on empty space
- **Right Click:** Right click and drag to create selection rectangle

#### Keyboard

- **N:** Create normal node at cursor position or activate add node mode if add-node-toggle is enabled
- **I:** Create input node at cursor position or activate add node mode if add-node-toggle is enabled
- **O:** Create output node at cursor position or activate add node mode if add-node-toggle is enabled
- **C:** Create component from current selection
- **D:** Duplicate current selection
- **E:** Export current selection
- **Backspace:** Delete current selection

## Running demo

1. Fork the `vcf-network` repository and clone it locally.

1. Make sure you have [npm](https://www.npmjs.com/) installed.

1. When in the `vcf-network` directory, run `npm install` to install dependencies.

1. Run `npm start` to open the demo.

## Contributing

To contribute to the component, please read [the guideline](https://github.com/vaadin/vaadin-core/blob/master/CONTRIBUTING.md) first.

## Vaadin Pro

This component is available in the Vaadin Pro subscription. It is still open source, but you need to have a valid CVAL license in order to use it. Read more at: [Pricing](https://vaadin.com/pricing)
## License

Commercial Vaadin Add-on License version 3 (CVALv3). For license terms, see LICENSE.

Vaadin collects development time usage statistics to improve this product. For details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.
