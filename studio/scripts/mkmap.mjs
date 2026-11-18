// Pre-calcola le mappe vettoriali (SVG path) per le scene: niente immagini, solo coste dai dati Natural Earth
import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';

const W = 1920, H = 1080;
const t10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const t50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const P = {
  spagna: [-0.38, 39.47], francia: [-4.1, 47.9], portogallo: [-9.14, 38.72], norvegia: [6.15, 62.47], marocco: [-9.6, 30.42],
  tunisia: [10.18, 36.81], egitto: [29.92, 31.2], senegal: [-17.44, 14.69], roma2: [12.5, 41.9],
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
  fao: {bbox: [[-26, 11], [40, 66]], topo: t50},
  europa: {bbox: [[-11, 34.5], [31, 60.5]], topo: t50},
};
const ZONES = {
  '27': [[-24, 43], [-24, 66], [12, 66], [12, 57], [-1, 50], [-9, 44], [-9, 36], [-24, 36]],
  '34': [[-24, 36], [-6, 36], [-5.6, 35.8], [-9.5, 30], [-13, 26], [-17, 21], [-17.5, 12], [-24, 12]],
  '37.1.1': [[-5.5, 36], [-1.5, 35.2], [4.5, 36.8], [4.5, 40], [3, 42.4], [0.5, 40.6], [-0.4, 38.7], [-2, 36.7]],
  '37.1.2': [[3, 42.4], [4.5, 40], [7.6, 41.2], [7.6, 43.6], [6, 43.1], [4.5, 43.4]],
  '37.1.3': [[7.6, 41.2], [7.6, 43.6], [10, 44.1], [12.3, 41.5], [15.7, 40.0], [15.7, 38.0], [12.4, 37.9], [11.3, 37.2], [10, 37.2], [8.6, 36.9], [7.6, 37]],
  '37.2.1': [[12.3, 44.2], [12.4, 45.5], [13.7, 45.7], [16, 43.5], [19.4, 41.9], [19.4, 40.3], [18.5, 40.1], [16, 41.4], [14, 42.3]],
  '37.2.2': [[15.7, 40.0], [18.5, 40.1], [19.4, 40.3], [21.5, 38.5], [23, 36.5], [23, 34], [19.5, 31], [15, 32.5], [11.2, 33.5], [10.5, 35.5], [11.3, 37.2], [12.4, 37.9], [15.7, 38.0]],
  '37.3.1': [[22.5, 40.8], [26.5, 40.9], [27.8, 37.5], [28.2, 36.4], [23, 36.3]],
  '37.3.2': [[28.2, 36.4], [36, 36.6], [35.5, 31], [32, 31.1], [25, 31.6], [23, 34], [23, 36.3]],
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
  const zones = name === 'fao' ? Object.fromEntries(Object.entries(ZONES).map(([k, poly]) => [k, 'M ' + poly.map((ll) => proj(ll).map((n) => Math.round(n)).join(' ')).join(' L ') + ' Z'])) : undefined;
  out.views[name] = {shapes, pts, zones};
  console.log(name, shapes.length, 'paesi', Math.round(JSON.stringify(shapes).length / 1024), 'KB');
}
fs.writeFileSync('src/lib/maps.json', JSON.stringify(out));
