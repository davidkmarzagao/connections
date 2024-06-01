import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import random
import numpy as np
import node_set

seed = 5
random.seed(seed)
np.random.seed(seed)
global edgelist

def normalize_weights(graph):
    for node in graph.nodes():
        total_weight = (sum([graph[node][neighbor]['weight'] for neighbor in graph.neighbors(node)]) ) - p
        if total_weight != 0:
            for neighbor in graph.neighbors(node):
                if neighbor != node:
                    graph[node][neighbor]['weight'] /= total_weight
                graph[node][neighbor]['weight'] *= (1 - p)
        else:
            graph[node][node]['weight'] = 1

def simulate(graph, node_labels, iterations):
    for t in range(iterations):
        new_node_labels = dict(node_labels)
        for node in graph.nodes():
            neighbors = list(graph.neighbors(node))
            if neighbors:
                neighbor_weights = [graph[node][neighbor]['weight'] for neighbor in neighbors]
                chosen_neighbor = random.choices(neighbors, neighbor_weights)[0]
                counter = 0
                if node_labels[chosen_neighbor] == 'grey':
                    chosen_neighbor = node
                new_node_labels[node] = node_labels[chosen_neighbor]
        node_labels = dict(new_node_labels)
        #if check_consensus(graph, node_labels) == "false":
        #    continue
        #else:
        #    return check_consensus(graph, node_labels), t + 1
    return node_labels, t + 1

def check_consensus(graph, node_labels):
    for node in graph.nodes():
        if(node_labels[node] != node_labels[1]):
            return "false"
    return node_labels[1]

def animate(frame):
    fig.clear()
    global node_labels
    new_node_labels = dict(node_labels)
    for node in G.nodes():
        neighbors = list(G.neighbors(node))
        if neighbors:
            neighbor_weights = [G[node][neighbor]['weight'] for neighbor in neighbors]
            chosen_neighbor = random.choices(neighbors, neighbor_weights)[0]
            counter = 0
            if node_labels[chosen_neighbor] == 'grey':
                chosen_neighbor = node
            new_node_labels[node] = node_labels[chosen_neighbor]
    node_labels = dict(new_node_labels)
    print(node_labels)
    nx.draw(G,pos = nx.spring_layout(G, k=0.5, seed=5), edgelist=edgelist, node_color=list(node_labels.values()), with_labels=True)

fig = plt.gcf()
G = nx.DiGraph()
G.add_weighted_edges_from(node_set.node_edges)

p = 0
for node in G.nodes():
    G.add_edge(node, node, weight=p)

normalize_weights(G)

#print("Graph:")
#print(G.edges(data=True))

# Initialize node labels
node_labels = {1: 'red', 2: 'blue', 3: 'red', 4: 'grey'}

for node in G.nodes():
    if node not in node_labels:
        node_labels[node] = 'grey'
#print(node_labels)

# Number of iterations
UBER_ITERATIONS = 1

iterations = 10000

tally = {'red': 0, 'blue' : 0}
#for uber in range(UBER_ITERATIONS):
    #result = simulate(G, node_labels, iterations)
    #tally[result[0]] += 1
    #print(result[1])
#print(result)
#print("Final node labels after", result[1], "iterations:")
#print(tally)

color_map = list(node_labels.values())
edgelist = [e for e in G.edges if e not in nx.selfloop_edges(G)]

nx.draw(G,pos = nx.spring_layout(G, k=0.5, seed=5), edgelist=edgelist, node_color=color_map, with_labels=True)
plt.margins(0.01)
anim = animation.FuncAnimation(fig, animate, frames=30, interval=30)
plt.show()