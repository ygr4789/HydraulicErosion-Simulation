import { GUI } from "dat.gui";

export const TERRAIN_SIZE = 30;
export const TERRAIN_MAX_ALT = 5;

export const EPS = 0.001;

export const MAX_VISUZLIZE_WATER_HEIGHT = 0.1;
export const MAX_VISUZLIZE_SEIMENT_AMOUNT = 0.1;

export const CONST = {
  PIPE_AREA: 10,
  PIPE_LENGTH: 1,
  GRAVITY: 1,
  DAMPING: 1,
  CAPACITY_CONSTANT: 0.01,
  EROSION_CONSTANT: 0.02,
  DEPOSITION_CONSTANT: 0.02,
  PRECIPITATION: 1,
  EVAPORATION: 1,
  TALUS_TANGENT: 0.1,
};

export function initConstsGUI(gui: GUI) {
  const folder = gui.addFolder("Consts");
  folder.add(CONST, "PIPE_AREA", 0, 20);
  folder.add(CONST, "PIPE_LENGTH", 0, 5);
  folder.add(CONST, "GRAVITY", 0, 10);
  folder.add(CONST, "DAMPING", 0, 10);
  folder.add(CONST, "CAPACITY_CONSTANT", 0, 0.1);
  folder.add(CONST, "EROSION_CONSTANT", 0, 0.1);
  folder.add(CONST, "DEPOSITION_CONSTANT", 0, 0.1);
  folder.add(CONST, "PRECIPITATION", 0, 5);
  folder.add(CONST, "EVAPORATION", 0, 5);
  folder.add(CONST, "TALUS_TANGENT", 0, 1);
}
