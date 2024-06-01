cytoscape.use( cytoscapeElk );


// Fetch edges and nodes 
fetch('data.json', {mode: 'no-cors'})
.then(function(res) {
    return res.json()
})
.then(function(data) {
    // graph set up 
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,
        userZoomingEnabled: false, 

        layout: {
            name: 'cose',
            animate: true,
            fit: true,
            randomize: false,
            nodeOverlap: 500,
        },

        style: [
        {
            selector: 'node',
            style: {
                'height': 40,
                'width': 40,
                'label': 'data(id)',
                'text-valign': 'center',
                'background-color': 'data(color)',
                'color': '#16161a'
                
            }
        },

        {
            selector: 'edge',
            style: {
                'curve-style': 'haystack',
                'haystack-radius': 0,
                'width': 5,
                'opacity': 0.5,
                'line-color': '#72757e'
            }
        }
        ],

        elements: data
    });
    
    var nodes = cy.nodes()
    normalizeWeights()

    // normalise weights of edges based on nodes neighbours (0.0 <= weight range <= 1.0)
    function normalizeWeights() {
        var pValueEnabled = false
        var pValue = 0
        if(arguments.length === 1) {
            pValueEnabled = true
            pValue = arguments[0]
        }
        nodes.forEach(function(node) {
            var edges = node.outgoers('edge')
            if(edges.length != 0) {
                edges.forEach(function(edge) {
                    if(pValueEnabled) {
                        if (edge.source().id() != edge.target().id()) {
                            edge.data('weight', String((1-pValue)/(edges.length-1)))
                        };
                    }
                    else {
                        edge.data('weight', String(Number(edge.data('weight'))/edges.length))
                    }
                    //console.log(edge.data())
                });
            }
        });
    };

    function animate() {
        nodes.forEach(function(node) {
            // list of neighbouring nodes 
            var neighbors = node.outgoers('node')   
            // list of outgoing edges weights from current node 
            var weights = node.outgoers('edge').map(function(edge) {
                return edge.data('weight')
            });
            //console.log(node.data())
            let cumulativeWeight = 0
            // if there are neighbours 
            if(neighbors) {
                const random = Math.random() 

                for (let i = 0; i < weights.length; i++) {
                    cumulativeWeight += Number(weights[i])

                    if (random < cumulativeWeight) {
                        let chosenNeighbor = neighbors[i]
                        // if chosen neighbouring node is not gray 
                        if(!(chosenNeighbor.data('color') == '#808080')) {
                            // then turn our current node into the neighbours colour (grabbed)
                            node.animate({
                                style: { 'background-color': chosenNeighbor.data('color') }
                            }, {
                                duration: 1000 // ms 
                            });
                            node.data('color', chosenNeighbor.data('color'))
                            //console.log(node.data())
                            //console.log(chosenNeighbor.data())
                        };
                        // a node is only grabbable to one neighbouring node
                        break;
                    };
                };
            };
        });
    };
    
    // only checks consensus for one colour (red or blue)
    function checkConsensus() {
        var firstNodeValue;
        for(let i = 0; i< nodes.length; i++) {
            if(nodes[i].data('color') != '#808080') {
                firstNodeValue = nodes[i].data('color')
                console.log(firstNodeValue)
                break
            };
        };
        for(let i = 0; i< nodes.length; i++) {
            if((firstNodeValue != nodes[i].data('color')) && (nodes[i].data('color') != '#808080')) {
                return false
            };
        };
        console.log("TRUE")
        return true
    };

    function simulate() {
        // simulate for 50 iterations 
        let result = false
        for(let i = 0; i< 50; i++) {
            // give 30 seconds max each iteration for animation 
            setTimeout(function() {
                if(!result) {
                    animate();
                    result = checkConsensus();
                }
            }, 2000 * i);
        };
    }

    function reloadGraph() {
        location.reload();
    };

    function changePValue() {
        let pValue;
        do {
            pValue = prompt('Please enter a value between 0-1:');
            if(pValue == null) {
                console.log('User cancelled the prompt.');
                break
            }
        } while (isNaN(pValue) || pValue < 0 || pValue > 1);
        cy.edges().forEach(function(edge) {
            if (edge.source().id() === edge.target().id()) {
                edge.data('weight', String(pValue))
            }
        });
        normalizeWeights(pValue)
    }

    // Add event listeners to toolbar buttons
    document.getElementById('resetBtn').addEventListener('click', function() {
        reloadGraph()
    });
    // animates all nodes for 1 iteration 
    document.getElementById('animateBtn').addEventListener('click', function() {
        animate()
    });
    // simulates all nodes for 50 iterations 
    document.getElementById('simulateBtn').addEventListener('click', function() {
        simulate()
    });
    document.getElementById('changePBtn').addEventListener('click', function() {
        changePValue()
    });

    document.getElementById('colorPicker').addEventListener('input', function(event) {
        // Get the selected color value
        const selectedColor = event.target.value;
        // Display the selected color value
        console.log(selectedColor)
        cy.on('tap', 'node', function(event) {
            var selectedNode = event.target;
            selectedNode.data('color', selectedColor)
            selectedNode.style('background-color', selectedColor)
            cy.off('tap', 'node');
        });
    });

    // Add event listener to the color selection buttons
    document.getElementById('selectPurpleBtn').addEventListener('click', function() {
        cy.on('tap', 'node', function(event) {
            var selectedNode = event.target;
            selectedNode.data('color', '#7f5af0')
            cy.off('tap', 'node');
        });
    });

    document.getElementById('selectGreenBtn').addEventListener('click', function() {
        cy.on('tap', 'node', function(event) {
            var selectedNode = event.target;
            selectedNode.data('color', '#2cb67d')
            cy.off('tap', 'node');
        });
    });
});