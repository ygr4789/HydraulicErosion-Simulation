import img from "../asset/hill.jpg";


const tmpc = document.createElement("canvas");
const ctx = tmpc.getContext("2d")!;

export async function imageData() {
  let image = new Image();
  await (image.src = img);
  ctx.canvas.width = image.width;
  ctx.canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}
