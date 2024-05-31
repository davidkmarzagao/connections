fetch('data.json', {mode: 'no-cors'})
.then(function(res) {
    return res.json()
})
.then(function(data) {
    var initialElements
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,

        layout: {
            name: 'grid'
        },

        style: [
        {
            selector: 'node',
            style: {
                'height': 20,
                'width': 20,
                'label': 'data(id)',
                'text-valign': 'center',
                'background-color': 'data(color)'
            }
        },

        {
            selector: 'edge',
            style: {
                'curve-style': 'haystack',
                'haystack-radius': 0,
                'width': 5,
                'opacity': 0.5,
                'line-color': '#000000',
                'target-arrow-shape': 'triangle'
            }
        }
        ],

        elements: data
    });
    
    
    var nodes = cy.nodes()
    normalizeWeights()

    function normalizeWeights() {
        nodes.forEach(function(node) {
            var edges = node.outgoers('edge')
            var totalweight = 0
            edges.forEach(function(edge) {
                totalweight+=Number(edge.data('weight'))
            });
            if(totalweight != 0) {
                edges.forEach(function(edge) {
                    edge.data('weight', String(Number(edge.data('weight'))/totalweight))
                    //console.log(edge.data())
                });
            }
        });
    };

    function animate() {
        nodes.forEach(function(node) {
            var neighbors = node.outgoers('node')
            var weights = node.outgoers('edge').map(function(edge) {
                return edge.data('weight')
            });
            //console.log(node.data())
            let cumulativeWeight = 0
            if(neighbors) {
                const random = Math.random() 
                for (let i = 0; i < weights.length; i++) {
                    cumulativeWeight += Number(weights[i])
                    if (random < cumulativeWeight) {
                        let chosenNeighbor = neighbors[i]
                        if(!(chosenNeighbor.data('color') == '#808080')) {
                            node.animate({
                                style: { 'background-color': chosenNeighbor.data('color') }
                            }, {
                                duration: 1000
                            })
                            node.data('color', chosenNeighbor.data('color'))
                            //console.log(node.data())
                            //console.log(chosenNeighbor.data())
                        };
                        break;
                    };
                };
            };
        });
    };

    function checkConsensus() {
        var firstNodeValue
        for(let i = 0; i< nodes.length; i++) {
            if(nodes[i].data('color') != '#808080') {
                firstNodeValue = nodes[i].data('color')
                console.log(firstNodeValue)
                break
            };
        };
        for(let i = 0; i< nodes.length; i++) {
            if((nodes[i].data('color') != '#808080') && firstNodeValue != nodes[i].data('color')) {
                return false
            };
        };
        console.log("TRUE")
        return true
    };

    function simulate() {
        for(let i = 0; i< 50; i++) {
            setTimeout(function() {
                animate();
            }, 3000);
            if(checkConsensus()) {
                console.log("Consensus reached")
                break
            }
        };
    }

    function reloadGraph() {
        location.reload();
    };

    // Add event listeners to toolbar buttons
    document.getElementById('resetBtn').addEventListener('click', function() {
        reloadGraph()
    });

    document.getElementById('animateBtn').addEventListener('click', function() {
        animate()
    });

    document.getElementById('simulateBtn').addEventListener('click', function() {
        simulate()
    });

    document.getElementById('toggleArrowsBtn').addEventListener('click', function() {
        if(cy.edges().style('curve-style') == 'haystack') {
            cy.edges().style('curve-style', 'bezier')
        }
        else {
            cy.edges().style('curve-style', 'haystack')
        };
    });


    // Add event listener to the color selection buttons
    document.getElementById('selectBlueBtn').addEventListener('click', function() {
        cy.on('tap', 'node', function(event) {
            var selectedNode = event.target;
            selectedNode.data('color', '#0000ff')
            cy.off('tap', 'node');
        });
    });

    document.getElementById('selectRedBtn').addEventListener('click', function() {
        cy.on('tap', 'node', function(event) {
            var selectedNode = event.target;
            selectedNode.data('color', '#ff0000')
            cy.off('tap', 'node');
        });
    });
});