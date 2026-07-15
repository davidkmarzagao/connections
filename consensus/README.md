# Project: Consensus

Consensus is an interactive educational simulation representing color propagation dynamics and consensus reaching on a graph structure (or network of nodes).

## How it Works
1. **Nodes & Edges**: Nodes represent robots/agents, and edges represent communication neighbors.
2. **Activation**: Nodes start as inactive (grey). Two players (purple and green) take turns selecting nodes to activate.
3. **Propagation**: In each step or continuous simulation run, nodes update their colors based on the proportion of their neighbors' colors.
4. **Consensus Reached**: The game finishes when all nodes coordinate to display the same color.

## Files
- `index.html` - Homepage detailing rules and considerations.
- `demo.html` - Interactive simulator running Cytoscape.js.
- `documentation.html` - Math, layouts, and algorithms explanation.
- `credits.html` - Project creators and event details.
- `data/` - Graph vertex and node position files.
- `js/minifier_demo_script.js` - Compressed simulation logic.

## Dependencies (CDNs)
- **Cytoscape.js** (Graph rendering)
- **Chart.js** (Consensus trajectory plotting)
