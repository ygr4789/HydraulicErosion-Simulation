import img from "../asset/heightmap.png";

const tmpc = document.createElement("canvas");
const ctx = tmpc.getContext("2d")!;
const resolution = 1024;

export async function imageData() {
  let image = new Image();
  await (image.src = img);
  ctx.canvas.width = resolution;
  ctx.canvas.height = resolution;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, resolution, resolution);
}
