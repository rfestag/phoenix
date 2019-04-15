import ReactDOM from "react-dom";
import canvg from "canvg";

export default function componentToImage(component) {
  return new Promise((resolve, reject) => {
    const div = document.createElement("div");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    ReactDOM.render(component, div, () => {
      canvg(canvas, div.innerHTML);
      image.src = canvas.toDataURL();
      image.onload = () => {
        resolve(image);
      };
    });
  });
}
