// Copy the Kenney models the [untitled] room uses into static/game/untitled3d/models (all CC0).
// Usage: npm run models -- <kenney-assets-dir>   (the dir holding kenney_furniture/x and kenney_chars/x)
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('usage: npm run models -- <kenney-assets-dir>');
const out = path.resolve(import.meta.dirname, '../../../static/game/untitled3d/models');
const FURNITURE = ['floorFull', 'wall', 'wallWindow', 'wallHalf', 'bench', 'benchCushion', 'pottedPlant', 'plantSmall1', 'lampSquareFloor', 'lampRoundFloor',
  'tableRound', 'tableCoffee', 'tableCoffeeGlass', 'table', 'tableCloth', 'chair', 'chairCushion', 'stoolBar', 'desk', 'chairDesk',
  'loungeChair', 'loungeSofa', 'loungeSofaLong', 'rugRound', 'rugRectangle', 'rugSquare', 'bookcaseOpen', 'bookcaseClosed', 'bookcaseClosedWide',
  'radio', 'speaker', 'trashcan', 'cardboardBoxClosed', 'cardboardBoxOpen', 'kitchenBar', 'kitchenCabinet', 'kitchenFridge', 'kitchenCoffeeMachine',
  'cabinetTelevision', 'televisionModern', 'washer', 'coatRackStanding', 'sideTable',
  'doorway', 'bedSingle', 'bedBunk', 'dryer', 'washerDryerStacked', 'cabinetBedDrawer', 'kitchenStove', 'kitchenSink', 'bookcaseOpenLow', 'tableCross', 'loungeChairRelax'];

fs.mkdirSync(path.join(out, 'furniture'), { recursive: true });
for (const name of FURNITURE) {
  for (const ext of ['.obj', '.mtl']) fs.copyFileSync(path.join(src, 'kenney_furniture/x/Models', name + ext), path.join(out, 'furniture', name + ext));
}
const chars = path.join(src, 'kenney_chars/x/Models/GLB format');
fs.mkdirSync(path.join(out, 'characters/Textures'), { recursive: true });
for (const f of fs.readdirSync(chars).filter((f) => f.startsWith('character-') && f.endsWith('.glb'))) fs.copyFileSync(path.join(chars, f), path.join(out, 'characters', f));
fs.copyFileSync(path.join(chars, 'Textures/colormap.png'), path.join(out, 'characters/Textures/colormap.png'));
for (const [kit, name] of [['kenney_furniture', 'FurnitureKit'], ['kenney_chars', 'MiniCharacters']]) {
  fs.copyFileSync(path.join(src, kit, 'x/License.txt'), path.join(out, `LICENSE-Kenney-${name}.txt`));
}
console.log('models written to', out);
