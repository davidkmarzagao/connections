// // // INITIALISING VARIABLES // // // 

// variables for load graph 

// array to store node and edges json data 
var initialElements = [];
var startNodeSelected = false; 
// variable to store instance of cytoscape.js graph 
var cy;

// is website currently being displayed on a mobile device 
var mobileDisplay = window.innerWidth <= 500? true : false

// slider variables 
var slider = document.getElementById("speed-input");
var output = document.getElementById("speed-label");
var mobileSlider = document.getElementById("mobile-speed-input")
var mobileSliderOutput = document.getElementById("mobile-speed-label")

// modal button stuff 
// 'change p-value' modal 
var pValueModal = document.getElementById("p-value-modal");
var pValueBtn = document.getElementById("change-p-btn");
var pValueForm = document.getElementById("change-p-value")
// game-over modal 
var closeModal = document.getElementById("p-value-close");
var closeDemoModal = document.getElementById("demo-end-close");
var closeStatsModal = document.getElementById("stats-end-close");

// mobile hamburger menu 
var hiddenMenu = document.getElementById("hamburger-menu");
var menuIcon = document.getElementById('hamburger-icon');

// duration of node transition effect in ms 
var nodeTransitionDuration = mobileDisplay === true? 750/mobileSlider.value : 750/slider.value;
// whether node transition effect has been turned off or on 
var nodeTransitionCount = 0; 
// is simulation currently paused
var isPaused = false;

// current number of iterations in simulation
var numIterations = 0;
// when playback system is used, this var contains the value of the iteration the player paused on
var pausedNumIterations = -1; 

// stores the number of nodes belonging to a colour at each iteration
var graphDict = {};

// Fetch edges and nodes (file paths)
const nodePositionUrl = 'data/node_position.txt' // stores position of all nodes through x and y coordinates ranging from 0 to 1. 
const nodeEdgesUrl = 'data/Vertices.txt' // stores how vertices are connected to other vertices 

// Function to fetch a text file and parse it into JSON
const fetchAndParse = (url) => {
    return fetch(url)
        .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.text();
        })
        .then(text => JSON.parse(text));
};

// // // GRAPH FUNCTIONS // // // 

// adds an edge that loops back to a node for all nodes (ie, edge from node 1 to node 1)
function addSelfLoops(pValue) {
    for(let i = 0; i<100; i++) {
        cy.add({
            group: 'edges',
            data: {
                id: `${i}-${i}`,
                source: i,
                target: i,
                weight : pValue,
            }
        });
    }
}

// normalise weights of edges based on nodes neighbours (0.0 <= weight range <= 1.0)
function normalizeWeights() {
    var pValueEnabled = false
    var pValue = 0
    if(arguments.length === 1) {
        pValueEnabled = true
        pValue = arguments[0]
    }
    cy.nodes().forEach(function(node) {
        var edges = node.outgoers('edge')
        if(edges.length != 0) {
            edges.forEach(function(edge) {
                if (edge.source().id() != edge.target().id()) {
                    edge.data('weight', String((1-pValue)/(edges.length)))
                };
                //console.log(edge.data())
            });
        }
    });
};

// iterates through the graph once 
function iterate() {
    // add this iteration to the total of iterations already completed
    numIterations++;
    cy.nodes().forEach(function(node) {
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
            // generate random float from 0.0 to 1.0 
            const random = Math.random() 

            for (let i = 0; i < weights.length; i++) {
                cumulativeWeight += Number(weights[i])
                if (random < cumulativeWeight) {
                    let chosenNeighbor = neighbors[i]
                    // if chosen neighbouring node is not gray 
                    if(!(chosenNeighbor.data('color') == '#808080')) {
                        node.data('new-color', chosenNeighbor.data('color'))
                    };
                    // a node is only grabbable to one neighbouring node
                    break;
                };
            };
        };
    });
    // after algorithm is run once, implement all node colour changes to be displayed on graph 
    changeNodeColors();
    // update label to show number of iterations 
    document.getElementById("dynamic-iterations-label").innerHTML="Number of Iterations:" + numIterations;
};

// get number of nodes belonging to a specified colour in cy graph 
function countNodesWithColor(colorValue) {
    return cy.nodes().filter(function(node) {
        return node.data('color') === colorValue;
    }).size();
}

// updates colours for all nodes to be displayed on cy graph 
function changeNodeColors(){
    cy.nodes().forEach(function(node) {
        // if a node's colour needs to be updated there will be a json field called new-color specifying it's new HEX code
        if((node.data('color') != node.data('new-color')) && (node.data('new-color') !== undefined)) {
            // if there is a new-color field and a node's current colour is the same as new-color animate it's colour change
            node.animate({
                style: { 'background-color': node.data('new-color') }
            }, {
                duration: nodeTransitionDuration // ms 
            });

            // for playback system 
            // data is stored in colourHistory as a dictionary where the key is a specific iteration and the value is the colour HEX code
            // note node colour before it was changed
            node.data('colorHistory')[numIterations - 1] = node.data('color')
            // note node colour after it was changed 
            node.data('colorHistory')[numIterations] = node.data('new-color')
            
            // update node current colour data 
            node.data('color', node.data('new-color'))
        }
    });
}


// only checks consensus for one colour (game-end function)
function checkConsensus(iterations) {
    // get colour of the first node 
    var firstNodeValue = cy.nodes()[0].data('color');
    for(let i = 0; i< cy.nodes().length; i++) {
        // if not all nodes are the that colour 
        if((firstNodeValue != cy.nodes()[i].data('color'))) {
            // then consensus is not reached
            return false;
        };
    };
    // if user has not selected a starting node 
    if (! startNodeSelected) {
        // then consensus is not reached
        return false;
    }

    // for statistics  
    // Convert dictionary to CSV format
    index = Array.from({ length: iterations }, (_, i) => i + 1);
    const headers = ['Index', ...Object.keys(graphDict)];
    const rows = [];

    const numRows = Object.values(graphDict)[0].length;
    for (let i = 0; i < numRows; i++) {
        const row = [i]; // Starting with the index
        for (const key of Object.keys(graphDict)) {
        row.push(graphDict[key][i]);
        }
        rows.push(row);
    }

    // Convert to CSV format
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create a download link
    const link = document.getElementById("csvLink")
    link.href = URL.createObjectURL(blob);
    link.download = 'dictionary.csv';
    
    // updating button behaviours 

    // update modal to show the number of iterations and who won 
    updateEndGameModal(iterations, firstNodeValue);
    // show game-over modal 
    document.getElementById("demo-end").style.display = "block";
    document.getElementById("simulate-btn").disabled = false;

    // Consensus is reached. 
    return true;
};

// iterate a number of times (recursive)
function simulate(firstIteration) {
    if(firstIteration) {
        let colourSet = new Set();
        cy.nodes().forEach(node => {
            let color = node.data('color');
            colourSet.add(color);  // Add the color to the Set (duplicates are automatically ignored)
        });
        colourSet.delete("#808080");
        let colourList = Array.from(colourSet);
        for (let i = 0; i < colourList.length; i++) {
            graphDict[colourList[i]] = [];  // Access each element in the array by its index
        }
    }
    speedSlider = mobileDisplay === true? mobileSlider : slider; 
    // creates a max 1500ms timeout between each iteration 
    simulationTimeout = setTimeout(function() {
        for (const [key, value] of Object.entries(graphDict)) {
            graphDict[key].push(countNodesWithColor(key))
        }
        // recursive step 
        if(!checkConsensus(numIterations) && !isPaused) {
            iterate();
            simulate(false);
        }
        // base case and consensus is reached 
        else {
            pausedNumIterations = numIterations; 
            return;
        }
    }, 1500/speedSlider.value);
    
};


// // // TOOLBAR FUNCTIONS // // // 

// updates end game (consensus reached) modal to display the number of iterations it ended with and the colour that won.
function updateEndGameModal(iterations, colour) {
    document.getElementById("iterations-label").innerHTML=iterations;
    document.getElementById("winning-player").style.color = colour;
}

function updateLineGraph() {
    // Prepare datasets
    const datasets = Object.entries(graphDict).map(([label, values], index) => ({
        label: label,
        data: values,
        borderColor: label, // Different color for each line
        fill: false,
    }));

    const ctx = document.getElementById('line-graph').getContext('2d');
    Chart.defaults.font.size = 14;
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: Object.values(graphDict)[0].length }, (_, i) => i), // Assuming all arrays have the same length
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                devicePixelRatio: 4,
                animation: false,
                plugins : {
                    title: {
                        display: true,
                        text: 'Number of Nodes belonging to a Colour in every Iteration',
                        color: '#fffffe',
                    }
                },
                layout: {
                    padding: {
                        left: 20,
                        top: 20,
                        right: 40, 
                        bottom: 20,
                    }
                },
                scales: {
                x: {
                    title: {
                    display: true,
                    text: 'Number of Iterations',
                    color: '#fffffe',
                    },
                    ticks: {
                        color: '#808080' // X-axis ticks color
                    },
                    grid: {
                        color: '#808080' // Set grid color to grey
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                    display: true,
                    text: 'Number of Nodes',
                    color: '#fffffe',
                    },
                    ticks: {
                        color: '#808080' // X-axis ticks color
                    },
                    grid: {
                        color: '#808080' // Set grid color to grey
                    }
                }
                }
            }
        });
        ctx.canvas.style.backgroundColor = '#242629';
}

// go back one step to a past iteration (play back system)
function undoIterate(){
    // if the iteration before the current iteration is not the 0th iteration 
    if ((numIterations - 1) >= 0) {
        numIterations -= 1;
        
        // checks all nodes in the graph 
        cy.nodes().forEach(function(node) {
            // if a nodes color history has a key that matches the value of the iteration we want to go back to
            if(node.data('colorHistory').hasOwnProperty(numIterations)) {
                // change nodes colour to it's past colour 
                node.animate({
                    style: { 'background-color': node.data('colorHistory')[numIterations] }
                }, { 
                    // no transition effects 
                    duration: 0
                });

                // update node data 
                node.data('new-color', node.data('color')) 
                node.data('color', node.data('colorHistory')[numIterations])
            }
        });

        // update the number of iterations label to be displayed 
        document.getElementById("dynamic-iterations-label").innerHTML="Number of Iterations:" + numIterations;
    }; 
};

// go forward one step (playback system)
function redoIterate(){
    // if the current iteration + 1 does not surprass the iteration the user paused on 
    if ((numIterations + 1) <= pausedNumIterations) {
        numIterations++;

        // checks all nodes in the graph 
        cy.nodes().forEach(function(node) {
            // if the nodes colour history has a key containing the future iteration
            if(node.data('colorHistory').hasOwnProperty(numIterations)) {
                // update nodes colour 
                node.animate({
                    style: { 'background-color': node.data('colorHistory')[numIterations] }
                }, { 
                    duration: 0
                });

                // update node data 
                node.data('new-color', undefined) 
                node.data('color', node.data('colorHistory')[numIterations])
                console.log(node.data())
            }
        });

        // update the number of iterations label to be displayed 
        document.getElementById("dynamic-iterations-label").innerHTML="Number of Iterations:" + numIterations; 
    }
        
};

// turns off or on 'simulate' and 'iterate 1' buttons depending on if a starting node is selected 
function toggleSimulationBtns() {
    if (startNodeSelected) {
        document.getElementById("simulate-btn").disabled = false;
        document.getElementById("animate-btn").disabled = false;
    } else {
        document.getElementById("simulate-btn").disabled = true;
        document.getElementById("animate-btn").disabled = true;
    }
}

// turns off or on go-back (<<) and go-forward (>>) buttons on the playback system based on parameter boolean 
function togglePlaybackBtns(turnOn) {
    if (turnOn) {
        document.getElementById("sim-back-btn").disabled = false;
        document.getElementById("sim-forward-btn").disabled = false;
    } else if (!turnOn) {
        document.getElementById("sim-back-btn").disabled = true;
        document.getElementById("sim-forward-btn").disabled = true;
    }
}

function reloadGraph() {
    startNodeSelected = false; 
    
    // disable 'simulate' and 'iterate 1' button as no starting node is selected when graph reloaded
    toggleSimulationBtns(); 

    location.reload();
};

function resetPlayPauseBtn() {
    if (isPaused) {
        isPaused = false;
        document.getElementById("sim-pause-play-btn").style.backgroundColor = "#7f5af0";
    }
};

function changePValue(pValue) {
    if(pValue) {
        cy.edges().forEach(function(edge) {
            if (edge.source().id() === edge.target().id()) {
                edge.data('weight', String(pValue))
            }
        });
        addSelfLoops(pValue);
        normalizeWeights(pValue);
    };
};

// // // HTML EVENT FUNCTIONS // // // 

// reset p-value modal form prompt and show modal 
pValueBtn.onclick = function() {
    // reset prompt 
    if (document.getElementById("p-value-label").textContent == 'Not valid. Please enter a value between 0-1:') {
        document.getElementById("p-value-label").textContent = 'Please enter a value between 0-1:';
    }

    // show modal 
    pValueModal.style.display = "block"; 
}

// close 'change p-value' modal prompt 
closeModal.onclick = function() {
    pValueModal.style.display = "none"
}

// close demo game-over modal 
closeDemoModal.onclick = function() {
    document.getElementById("demo-end").style.display = "none"; 
}

// close demo game-over modal 
closeStatsModal.onclick = function() {
    document.getElementById("statistic-modal").style.display = "none"; 
    // destroy graph to prevent error from occuring if user tries to open stats graph several times
    if(Chart.getChart("line-graph")) {
        Chart.getChart("line-graph")?.destroy()
      }
}

// resize graph when window resized 
window.addEventListener('resize', function(event){
    cy.resize();
    cy.fit();
    // check if it is a mobile display 
    mobileDisplay = window.innerWidth <= 500? true : false;
});

// close modal if user clicked background 
window.onclick=function(event) {
    if (event.target == pValueModal) {
        pValueModal.style.display = "none"
    } else if (event.target == document.getElementById("demo-end")) {
        document.getElementById("demo-end").style.display = "none";
    }
}

// change p value in modal through form 
pValueForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newPValue = pValueForm.elements.pValue.value; 
    // if p-value is not in a valid range 
    if (isNaN(newPValue) || newPValue < 0.0 || newPValue > 1.0){
        document.getElementById("p-value-label").textContent = 'Not valid. Please enter a value between 0-1:'
        pValueForm.reset();
    } else {
        document.getElementById("p-value-label").textContent = 'Please enter a value between 0-1:'
        changePValue(parseFloat(newPValue))
        pValueModal.style.display = "none";
    }
    
});

// mobile hamburger menu 
document.getElementById("hamburger-menu-icon").addEventListener('click', function() {
    // if hidden menu is already displayed and player clicked hamburger icon again
    if (hiddenMenu.style.display === "block") {
      hiddenMenu.style.display = "none";
      menuIcon.style.color = "#fffffe"
    } else {
    // show hidden menu and turn icon to green to indicate so 
      hiddenMenu.style.display = "block";
      menuIcon.style.color = "#2cb67d"
    }
});

// reset button 
document.getElementById("reset-btn").addEventListener('click', function() {
    reloadGraph()
});

// mobile-only reset button 
document.getElementById('mobile-reset-btn').addEventListener('click', function() {
    reloadGraph()
});

// iterate once button 
document.getElementById("animate-btn").addEventListener('click', function() {
    iterate()
    togglePlaybackBtns(false)
    resetPlayPauseBtn()
});

// simulates all nodes recursively  
document.getElementById("simulate-btn").addEventListener('click', function() {
    simulate(true)
    togglePlaybackBtns(false)
    resetPlayPauseBtn()
    // prevent user from spamming simulate button 
    document.getElementById("simulate-btn").disabled = true;
});

// allows users to pick a third colour 
document.getElementById('color-picker').addEventListener('input', function(event) {
    // Get the selected color value
    const selectedColor = event.target.value;
    // Display the selected color value on the selected node
    cy.on('tap', 'node', function(event) {
        var selectedNode = event.target;
        selectedNode.data('color', selectedColor)
        selectedNode.style('background-color', selectedColor)
        selectedNode.data('colorHistory')[0] = selectedColor
        cy.off('tap', 'node');

        // a starting node has been selected 
        startNodeSelected = true; 
        // enable simulation buttons 
        toggleSimulationBtns();
    });
});

// select purple starting node button 
document.getElementById("select-purple-btn").addEventListener('click', function() {
    cy.on('tap', 'node', function(event) {
        var selectedNode = event.target;
        // Display purple on the selected starting node 
        selectedNode.data('color', '#7f5af0')
        selectedNode.data('colorHistory')[0] = '#7f5af0'
        console.log(selectedNode.data())
        cy.off('tap', 'node');

        // a starting node has been selected 
        startNodeSelected = true; 
        // enable simulation buttons 
        toggleSimulationBtns();
    });
});

// select green starting node button 
document.getElementById('select-green-btn').addEventListener('click', function() {
    cy.on('tap', 'node', function(event) {
        var selectedNode = event.target;
        // Display green on the selected starting node 
        selectedNode.data('color', '#2cb67d')
        selectedNode.data('colorHistory')[0] = '#2cb67d'
        cy.off('tap', 'node');

        // a starting node has been selected 
        startNodeSelected = true; 
        // enable simulation buttons 
        toggleSimulationBtns(); 
    });
});

// node transition effect toggle button
document.getElementById("node-effect-btn").addEventListener('click', function(event) {
    var target = document.getElementById("node-effect-btn"); 
    // change colour of button to indicate it is on 
    target.style.backgroundColor = nodeTransitionCount === 1 ? "#7f5af0" : '#553ba3';
    // set duration of transition to 0 if user turns off node effects 
    nodeTransitionDuration = nodeTransitionCount === 1? 1000/slider.value : 0;
    // is the node transition effects off or not 
    nodeTransitionCount = nodeTransitionCount === 1 ? 0 : 1;
});

// node transition effect toggle button (mobile-only)
document.getElementById('mobile-node-effect-btn').addEventListener('click', function(event) {
    var target = document.getElementById('mobile-node-effect-btn'); 
    target.style.backgroundColor = nodeTransitionCount === 1 ? "#7f5af0" : '#553ba3';
    nodeTransitionDuration = nodeTransitionCount === 1? 1000/mobileSlider.value : 0;
    nodeTransitionCount = nodeTransitionCount === 1 ? 0 : 1;

});

// simulator play/pause toggle 
document.getElementById("sim-pause-play-btn").addEventListener('click', function(event) {
    var target = document.getElementById("sim-pause-play-btn"); 
    isPaused = isPaused === true? false : true;
    pausedNumIterations = isPaused === true? numIterations : -1; 

    target.style.backgroundColor = isPaused === true ? '#553ba3' : "#7f5af0" ;
    
    // if sim is not paused and a click event was registered, resume simulating 
    if (!isPaused) {
        document.getElementById("simulate-btn").disabled = false;
        togglePlaybackBtns(false)
        simulate(false)
    // if sim is paused but the player has not gone back to past iterations 
    } else if (isPaused && (numIterations == pausedNumIterations)) {
        // this allows the user to unpause the sim by clicking 'simulate'
        document.getElementById("simulate-btn").disabled = false;
    }

    // if sim is paused then we can enable other playback buttons 
    if (isPaused) {
        togglePlaybackBtns(true); 
    }
});

// simulator undo button (go-back)
document.getElementById("sim-back-btn").addEventListener('click', function(event) {
    // display a iteration before the current iteration
    undoIterate(); 
    // disable buttons below if we are currently not at the iteration we paused at
    if (numIterations < pausedNumIterations) {
        document.getElementById("simulate-btn").disabled = true;
        document.getElementById("sim-pause-play-btn").disabled = true;
        document.getElementById("animate-btn").disabled = true;
    }
});

//simulator redo button (go-foward)
document.getElementById("sim-forward-btn").addEventListener('click', function(event) {
    // display a iteration after the current iteration 
    redoIterate();

    // disable buttons below if we are currently not at the iteration we paused at
    if (numIterations < pausedNumIterations) {
        document.getElementById("simulate-btn").disabled = true;
        document.getElementById("sim-pause-play-btn").disabled = true;
        document.getElementById("animate-btn").disabled = true;
    }
    // if current iteration is the iteration we paused on 
    else if (numIterations == pausedNumIterations) {
        document.getElementById("simulate-btn").disabled = false;
        document.getElementById("sim-pause-play-btn").disabled = false;
        document.getElementById("animate-btn").disabled = false;
    } 
});

// view statistics button 
document.getElementById('graph-btn').addEventListener('click', function(event) {
    updateLineGraph();
    document.getElementById("statistic-modal").style.display = "block";
});


// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = "Speed Multiplier :x" + parseFloat(this.value).toFixed(1);
}

mobileSlider.oninput = function() {
    mobileSliderOutput.innerHTML = "Speed Multiplier :x" + parseFloat(this.value).toFixed(1);
}



// // // MAIN PROGRAM // // // 

Promise.all([fetchAndParse(nodePositionUrl), fetchAndParse(nodeEdgesUrl)])
    .then(results => {
        // results will be an array of the parsed JSON objects

        //initiate variables needed to load graph data 
        const [json1, json2] = results; 
        const nodePositions = json1;
        const nodeEdges = json2; 
    
        console.log('Parsed JSON from file nodePositions:', json1);
        console.log('Parsed JSON from file nodeEdges:', json2);

        // create cytoscape.js node json data 
        for (let i = 0; i<nodePositions.length; i++) {
            initialElements.push({
                group: 'nodes',
                data: {
                    id: `${i}`,
                    //initial colour of all nodes are grey 
                    color: "#808080",
                    // colorHistory is used in the demo playback system to keep track of when nodes change colour 
                    colorHistory: {0:"#808080"}
                },
                position: { 
                    // create relative x and y coordinates of a node based on current device's width and height
                    x: Math.round(nodePositions[i][0]*window.innerWidth*2), y: Math.round(nodePositions[i][1]*window.innerHeight*1.6)
                },
            });
        }

        // create cytoscape.js edges json data 
        for (let i = 0; i < 100; i++) {
            for (let c = 0; c<nodeEdges[i].length; c++) {
                initialElements.push({
                    group: 'edges',
                    data: {
                        id: `${i}-${nodeEdges[i][c]}`,
                        source: i,
                        target: nodeEdges[i][c],
                        weight: 1,
                    }
                });
            }
        }

        // disable 'simulate' and 'iterate 1' button as no starting nodes have been selected 
        toggleSimulationBtns(); 
        // disable play-back buttons (<< and >>)
        togglePlaybackBtns(false); 

        // create cytoscape.js instance of a graph 
        cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            boxSelectionEnabled: false,
            autounselectify: true,
            userZoomingEnabled: true, 

            // initial viewport state:
            zoom: 2,
            pan: { x: 0, y: 0 },

            layout: {
                // these settings below allow nodes to spawn without following a preset 
                // name: 'cose',
                // animate: true,
                // fit: true,
                // randomize: false,
                // nodeOverlap: 500,\

                // create graph instance based on a preset of how all nodes are positioned 
                name: 'preset'
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
                    'color': '#16161a',
                    'z-index': 10,
                }
            },

            {
                selector: 'edge',
                style: {
                    'curve-style': 'haystack',
                    'haystack-radius': 0,
                    'width': 5,
                    'opacity': 0.5,
                    'line-color': '#72757e',
                    'z-index': 2,
                }
            }
            ],
            
            elements: initialElements
        });

        normalizeWeights()
    })
    .catch(error => {
        console.error('Error fetching or parsing files:', error);
    });
