import { GUI } from "dat.gui";

export const CONTROL = {
  TIMESTEP: 0.013,
  INV_RESOLUTION: 0,
  STRIDE: 1,
  MAP: 0,

  RAINFALL_SIZE: 1 / 50,
  VISUALIZATION_ON: true,
  EROSION_DEPOSITOIN_ON: true,
  SEDIMENT_TRANSPORTATION_ON: true,
  MATERIAL_SLIPPAGE_ON: true,
};

export function addControlsOn(gui: GUI) {
  gui
    .add(CONTROL, "MAP", { Hill: 0, SNU: 1, Mountain: 2 })
    .name("Map")
    .onChange((val) => {
      CONTROL.MAP = parseInt(val);
    });
  gui.add(CONTROL, "TIMESTEP", 0.001, 0.1).name("Time Step");
  gui
    .add(CONTROL, "INV_RESOLUTION", 0, 4)
    .step(1)
    .name("Roughness")
    .onChange((val) => {
      CONTROL.STRIDE = 2 ** val;
    });

  gui.add(CONTROL, "RAINFALL_SIZE", 1 / 200, 1 / 10).name("Rainfall Size");
  gui.add(CONTROL, "VISUALIZATION_ON").name("Visualization");
  gui.add(CONTROL, "EROSION_DEPOSITOIN_ON").name("Erosion / Deposition");
  gui.add(CONTROL, "SEDIMENT_TRANSPORTATION_ON").name("Sediment Transportation");
  gui.add(CONTROL, "MATERIAL_SLIPPAGE_ON").name("Material Slippage");
}
