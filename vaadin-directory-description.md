## Usage

Add `<vcf-network>` element to the page.

```html
<vcf-network></vcf-network>
```

## Creating networks

The hierarchical network visualization consists of nodes, edges and components. A component is a grouping of nodes, edges and other components.

#### Add nodes

Click the button for the node type you would like to add on the left tool panel. This will activate the "Add node mode" for this node type. You can then click anywhere on the middle canvas area to create a node at that position.

![vcf-network-add-nodes](https://user-images.githubusercontent.com/3392815/63554015-e744bb00-c544-11e9-8d8f-e24811eccc9d.gif)

#### Add edges

To add an edge between two nodes, first click and hold on the node you would like the edge to begin from. The cursor will change and you will be able to drag an edge to another node. When you release the mouse button over another node, an edge will be created.

![vcf-network-add-edges](https://user-images.githubusercontent.com/3392815/63554051-02172f80-c545-11e9-9ac5-3a48a2a70424.gif)

#### Creating components

In order to create components you must first select the nodes that will be in that component. You can select a single node by clicking with the left mouse button but to select multiple nodes, you must click and drag with the **right mouse button**. Once you have selected nodes, click the Create Component button on the right panel. You can then edit the components name and color using the fields also found on the right panel.

![vcf-network-create-component](https://user-images.githubusercontent.com/3392815/63554069-12c7a580-c545-11e9-928d-e769ef192afb.gif)

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


## Vaadin Prime
This component is available in Vaadin Prime subscription. It is still open source, but you need to have a valid CVAL license in order to use it. Read more at: https://vaadin.com/pricing
