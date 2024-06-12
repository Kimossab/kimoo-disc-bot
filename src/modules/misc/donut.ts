// source = https://www.a1k0n.net/2011/07/20/donut-math.html

const { cos } = Math;
const { sin } = Math;

const SCREEN_WIDTH = 40;
const SCREEN_HEIGHT = 40;
const CHARACTERS = [".", ",", "-", "~", ":", ";", "=", "!", "*", "#", "$", "@"];

const THETA_SPACING = 0.07;
const PHI_SPACING = 0.02;

const R1 = 1;
const R2 = 2;
const K2 = 5;

const K1 = SCREEN_WIDTH * K2 * 3 / (8 * (R1 + R2));

const renderDonut = (a: number, b: number): string => {
  const cosA = cos(a);
  const sinA = sin(a);
  const cosB = cos(b);
  const sinB = sin(b);

  const output = new Array(SCREEN_WIDTH)
    .fill(" ")
    .map(() => new Array(SCREEN_HEIGHT).fill(" "));
  const zBuffer = new Array(SCREEN_WIDTH)
    .fill(0)
    .map(() => new Array(SCREEN_HEIGHT).fill(0));

  for (let theta = 0; theta < 2 * Math.PI; theta += THETA_SPACING) {
    const cosTheta = cos(theta);
    const sinTheta = sin(theta);

    for (let phi = 0; phi < 2 * Math.PI; phi += PHI_SPACING) {
      const cosPhi = cos(phi);
      const sinPhi = sin(phi);

      const circleX = R2 + R1 * cosTheta;
      const circleY = R1 * sinTheta;

      const x =
        circleX * (cosB * cosPhi + sinA * sinB * sinPhi) -
        circleY * cosA * sinB;
      const y =
        circleX * (sinB * cosPhi - sinA * cosB * sinPhi) +
        circleY * cosA * cosB;
      const z = K2 + cosA * circleX * sinPhi + circleY * sinA;
      const ooz = 1 / z;

      const xp = Math.floor(SCREEN_WIDTH / 2 + K1 * ooz * x);
      const yp = Math.floor(SCREEN_HEIGHT / 2 - K1 * ooz * y);

      const L =
        cosPhi * cosTheta * sinB -
        cosA * cosTheta * sinPhi -
        sinA * sinTheta +
        cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);

      if (L > 0) {
        if (ooz > zBuffer[xp][yp]) {
          zBuffer[xp][yp] = ooz;
          const luminanceIndex = Math.floor(L * 8);
          output[xp][yp] = CHARACTERS[luminanceIndex];
        }
      }
    }
  }

  const strings = [];
  for (let j = 0; j < SCREEN_HEIGHT; j++) {
    let string = "";
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      string += output[i][j];
    }
    if (string.replace(/\s/gi, "").length !== 0) {
      strings.push(string);
    }
  }

  return strings.filter((s) => s.replace(" ", "").length !== 0).join("\n");
};

export default renderDonut;
