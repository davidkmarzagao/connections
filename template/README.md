# Project Template

This is a template project directory inside the Connections monorepo. It serves as a scaffolding structure for projects that combine interactive web simulations with physical hardware builds (such as 3D printing and microcontroller coding).

## Structure
- `index.html` - Homepage template for describing the hardware project.
- `demo.html` - Simulation canvas page.
- `documentation.html` - Assembly guides, schematics, and Bill of Materials (BOM) page.
- `guides/` - Directory for physical assets:
  - `build_instructions.md` - Assembly documentation template.
  - `chassis_base.stl` - Placeholder 3D printing file.
  - `sensor_mount.step` - Placeholder CAD assembly file.

## Sharing Styles
This project imports stylesheets and scripts from the central `/shared` directory:
- `/shared/css/style.css` (Base typography and header styles)
- `/shared/css/index-style.css` / `documentation-style.css` (Standard layout styles)
- `/shared/js/script.js` (Hamburger navigation script)
