// Pre-calcola le mappe vettoriali (SVG path) per le scene: niente immagini, solo coste dai dati Natural Earth
import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';

const W = 1920, H = 1080;
const t10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const t50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const P = {
  viareggio: [10.243, 43.865], livorno: [10.305, 43.548], piombino: [10.527, 42.925], castiglione: [10.876, 42.763],
  santostefano: [11.117, 42.437], portoercole: [11.205, 42.394], terracina: [13.249, 41.286], gaeta: [13.571, 41.213],
  chioggia: [12.279, 45.219], rimini: [12.577, 44.069], cesenatico: [12.400, 44.200], fano: [13.019, 43.845],
  civitanova: [13.731, 43.307], sanbenedetto: [13.887, 42.950], giulianova: [13.968, 42.753], pescara: [14.226, 42.465],
  ortona: [14.405, 42.357], vasto: [14.709, 42.112], termoli: [14.996, 42.003], manfredonia: [15.919, 41.628],
  roma: [12.4964, 41.9028], civitavecchia: [11.7969, 42.0924], fiumicino: [12.2290, 41.7690], anzio: [12.6270, 41.4470],
  car: [12.6930, 41.9500], scozia: [-1.78, 57.50], olanda: [4.60, 52.46], grecia: [21.73, 38.25], croazia: [15.23, 44.12],
  turchia: [27.14, 38.42], firenze: [11.2558, 43.7696], livorno: [10.31, 43.55], ancona: [13.5189, 43.6158],
  adr1: [13.95, 43.75], adr2: [14.35, 43.05], adr3: [14.95, 42.45], adr4: [13.2, 44.6], adrP1: [13.52, 43.62], adrP2: [13.88, 42.95], adrP3: [14.21, 42.47], adrP4: [15.0, 42.0], tir1: [11.35, 41.7], tir2: [11.9, 41.25], tir3: [10.9, 42.4],
};
const views = {
  // Lazio + Tirreno centrale
  lazio: {bbox: [[10.6, 40.95], [13.6, 42.75]], topo: t10},
  // Italia centrale: Tirreno e Adriatico
  centro: {bbox: [[9.2, 40.6], [16.6, 44.9]], topo: t10},
  italia: {bbox: [[5.5, 36.2], [19.5, 47.3]], topo: t10},
  tirrenoV: {bbox: [[9.0, 40.95], [14.6, 44.15]], topo: t10},
  adriaticoV: {bbox: [[10.6, 41.35], [17.4, 45.45]], topo: t10},
  europa: {bbox: [[-11, 34.5], [31, 60.5]], topo: t50},
};
const out = {W, H, views: {}};
for (const [name, v] of Object.entries(views)) {
  const countries = feature(v.topo, v.topo.objects.countries).features;
  const [[x0, y0], [x1, y1]] = v.bbox;
  const box = {type: 'Feature', geometry: {type: 'Polygon', coordinates: [[[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]]]}};
  const proj = geoMercator().fitExtent([[0, 0], [W, H]], box); proj.clipExtent([[-W, -H], [2 * W, 2 * H]]);
  const path = geoPath(proj);
  const ext = proj.invert ? [proj.invert([-200, -200]), proj.invert([W + 200, H + 200])] : null;
  const vis = countries.filter((c) => {
    const [[a, b], [c2, d]] = path.bounds(c);
    return c2 > -300 && a < W + 300 && d > -300 && b < H + 300;
  });
  const shapes = countries.filter((c) => { const [[a, b], [c2, d]] = path.bounds(c); return isFinite(a) && c2 > -W && a < 2 * W && d > -H && b < 2 * H && (c2 - a) * (d - b) > 4 && c.properties.name !== 'Maldives'; }).map((c) => ({id: c.id, name: c.properties.name, d: path(c)?.replace(/(\.\d)\d+/g, '$1')})).filter((s) => s.d && s.d.length > 20);
  const pts = Object.fromEntries(Object.entries(P).map(([k, ll]) => [k, proj(ll).map((n) => Math.round(n * 10) / 10)]));
  out.views[name] = {shapes, pts};
  console.log(name, shapes.length, 'paesi', Math.round(JSON.stringify(shapes).length / 1024), 'KB');
}
fs.writeFileSync('src/lib/maps.json', JSON.stringify(out));
