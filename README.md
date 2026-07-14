# Connections.

A collection of interactive simulations, graph models, and hardware fabrication projects.

## Project Structure

This repository is organized as a monorepo containing multiple child projects, sharing a common design system:

```text
connections/ (Root)
├── index.html          # Main landing portal served at connections.computer
├── shared/             # Shared styling (CSS) and scripting (JS) assets
│   ├── css/
│   │   ├── style.css
│   │   ├── index-style.css
│   │   ├── demo-style.css
│   │   └── documentation-style.css
│   └── js/
│       └── script.js
├── consensus/          # Project 1: Consensus simulation
│   ├── index.html      # Consensus homepage
│   ├── demo.html       # Interactive Cytoscape graph demo
│   ├── documentation.html
│   └── data/           # Node and edge position data
├── rep-tile/           # Project 2: Rep-Tile hardware game
│   ├── index.html      # Rep-Tile homepage
│   ├── demo.html       # Interactive demo (WIP)
│   ├── documentation.html # Electronics schematics & BOM
│   ├── firmware/       # Arduino ESP32 firmware
│   └── guides/         # 3D printer files (.3mf)
└── template/           # Project template folder
    ├── index.html      # Hardware project details
    ├── documentation.html # Electronics schematics & BOM
    └── guides/         # 3D printer files (.stl / .step) & instructions
```

## Local Development

To run the project locally without encountering browser CORS blocks during file fetching, start a local HTTP server from the root of this repository:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (with live-server or http-server)
npx live-server
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

## Adding a New Project

1. Duplicate the `/template` folder and rename it (e.g. to `/project-name`).
2. Update the header navigation inside the new HTML files to link to your new folder.
3. Add a project preview card in the root `index.html` file.
4. Keep any custom stylesheets modular or integrate them into `/shared/css/` if they can be reused.