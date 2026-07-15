# Project Two Build Instructions

This folder holds physical fabrication assets and detailed instructions for assembly.

## Structure
- `/guides/` - CAD files (`.stl`, `.step`), wiring schematics, and markdown guides.
- `chassis_base.stl` - Main structural base (3D printable).
- `sensor_mount.step` - Secondary mount parts (CAD format).

## Quick Build Steps
1. **3D Print** the `chassis_base.stl` file with standard settings (PLA/PETG, 20% infill).
2. **Assemble** the ESP32 and HC-SR04 sensors onto the printed chassis using `sensor_mount.step` as a visual reference.
3. **Upload** the firmware to your microcontroller.
