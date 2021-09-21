import { createCanvas, loadImage } from 'canvas';
import { IBadge } from './models/badges.model';
import fs from 'fs'

const SINGLE_WIDTH = 250;
const SINGLE_HEIGHT = 250;
const MARGIN = 50;
const COLUMNS = 3;
const ROWS = 3;
const TEXT_HEIGHT = 45;
const FULL_WIDTH = SINGLE_WIDTH * COLUMNS + MARGIN * (COLUMNS + 1);
const FULL_HEIGHT = SINGLE_HEIGHT * ROWS + MARGIN * (ROWS + 1) + TEXT_HEIGHT * ROWS;

export const createGrid = async (badges: IBadge[]): Promise<string> => {
  const fileName = `${+new Date()}.png`;
  const canvas = createCanvas(FULL_WIDTH, FULL_HEIGHT);
  const context = canvas.getContext('2d');

  context.font = `bold ${TEXT_HEIGHT}px Inconsolata`;
  context.textAlign = 'center';
  context.fillStyle = '#fff';

  let x = MARGIN;
  let y = MARGIN;

  for (const badge of badges) {
    const image = await loadImage(`badges/${badge._id}${badge.fileExtension}`);
    context.drawImage(image, x, y, SINGLE_WIDTH, SINGLE_HEIGHT);

    context.fillText(badge.name, x + SINGLE_WIDTH / 2, y + SINGLE_HEIGHT + TEXT_HEIGHT);

    x += MARGIN + SINGLE_WIDTH;

    if (x > FULL_WIDTH - MARGIN) {
      x = MARGIN;
      y += MARGIN + SINGLE_HEIGHT + TEXT_HEIGHT;
    }
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`trash/${fileName}`, buffer);

  return fileName;
}