/**
 * TubesCursor effect — exact code from CodePen.
 * Licence CC BY-NC-SA 4.0
 */
import TubesCursor from "threejs-components/build/cursors/tubes1.min.js";

export function initTubesCursor(canvas: HTMLCanvasElement) {
  const app = TubesCursor(canvas, {
    tubes: {
      colors: ["#f967fb", "#53bc28", "#6958d5"],
      lights: { intensity: 200, colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"] },
    },
  });

  const onClick = () => {
    const colors = randomColors(3);
    const lightsColors = randomColors(4);
    app.tubes.setColors(colors);
    app.tubes.setLightsColors(lightsColors);
  };
  document.body.addEventListener("click", onClick);

  function randomColors(count: number) {
    return new Array(count).fill(0).map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
  }

  return () => {
    document.body.removeEventListener("click", onClick);
    if (app && app.dispose) app.dispose();
  };
}
