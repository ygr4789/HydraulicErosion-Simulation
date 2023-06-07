import hillMap from "../asset/hill.jpg"
import snuMap from "../asset/snu.png";
import mountainMap from "../asset/mountain.png";

const tmpc = document.createElement("canvas");
const ctx = tmpc.getContext("2d")!;

const mapArr = [hillMap, snuMap, mountainMap];

export async function imageData(n: number) {
  let image = new Image();
  await (image.src = mapArr[n]);
  ctx.canvas.width = image.width;
  ctx.canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}
