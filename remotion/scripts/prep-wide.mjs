// Mappa larga (Atlantico + Mediterraneo + tropici), Mercator in km, per il video sui tonni
import fs from 'fs';
import {geoMercator, geoPath} from 'd3-geo';
const countries = JSON.parse(fs.readFileSync('data/ne_50m_admin_0_countries.geojson'));
const proj = geoMercator().scale(6371).translate([0, 0]);
const [x0, y0] = proj([-100, 62]);
const [x1, y1] = proj([60, -38]);
proj.clipExtent([[x0, y0], [x1, y1]]);
const path = geoPath(proj);
const round = (s) => (s ? s.replace(/(\d+\.\d{1})\d+/g, '$1') : '');
const pick = (iso) => countries.features.filter((f) => iso.includes(f.properties.ADM0_A3));
const pts = {
  gibilterra: [-5.6, 35.95], sicilia: [14.2, 37.5], sardegna: [9.0, 40.0], carloforte: [8.31, 39.14],
  spagna: [-5.92, 36.19], croazia: [15.6, 43.6], favignana: [12.33, 37.93], usa: [-70.5, 41.0],
  med: [16, 36], atl: [-40, 38], tokyo: [139.7, 35.7], italia: [12.5, 42.5], roma: [12.5, 41.9],
};
const P = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, proj(v).map((n) => +n.toFixed(1))]));
const lat = (l) => +proj([0, l])[1].toFixed(1);
const out = {
  bounds: [x0, y0, x1, y1],
  land: round(path({type: 'FeatureCollection', features: countries.features})),
  italy: round(path({type: 'FeatureCollection', features: pick(['ITA'])})),
  spain: round(path({type: 'FeatureCollection', features: pick(['ESP'])})),
  croatia: round(path({type: 'FeatureCollection', features: pick(['HRV'])})),
  tropics: [lat(23.44), lat(-23.44), lat(0)],
  points: P,
};
fs.writeFileSync('src/tonno/wide.json', JSON.stringify(out));
console.log('ok', (JSON.stringify(out).length / 1024).toFixed(0) + 'KB', P, out.tropics, out.bounds);
