cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/planar-chain.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    animate: false,
    elk: {
      'elk.graphviz':'dot'
    },
  },
  style: [
    {
      selector: 'edge',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'rightward',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.66,
      },
    },
  ],
});
