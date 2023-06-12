import { GUI } from "dat.gui";

export const CONTROL = {
  MAP: 1,
  RESOLUTION: 1024,
  TIMESTEP: 0.003,
  ITERATION: 1,

  RAINFALL_SIZE: 1 / 50,
  EROSION_DEPOSITOIN_ON: true,
  SEDIMENT_TRANSPORTATION_ON: true,
  MATERIAL_SLIPPAGE_ON: true,
};

export function initControlsGUI(gui: GUI) {
  const folder = gui.addFolder("Controls");
  folder
    .add(CONTROL, "MAP", { Hill: 0, SNU: 1, Mountain: 2 })
    .name("Map")
    .onChange((val) => {
      CONTROL.MAP = parseInt(val);
    });
  folder.add(CONTROL, "RESOLUTION", [128, 256, 512, 1024, 2048]).name("Resolution");
  folder.add(CONTROL, "TIMESTEP", 0.001, 0.01).name("Time Step");
  folder.add(CONTROL, "ITERATION", 1, 10).step(1).name("Iteration");

  folder.add(CONTROL, "RAINFALL_SIZE", 1 / 200, 1 / 10).name("Rainfall Size");
  folder.add(CONTROL, "EROSION_DEPOSITOIN_ON").name("Erosion / Deposition");
  folder.add(CONTROL, "SEDIMENT_TRANSPORTATION_ON").name("Sediment Transportation");
  folder.add(CONTROL, "MATERIAL_SLIPPAGE_ON").name("Material Slippage");
}
