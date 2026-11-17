// Pre-proietta Natural Earth (Mercator, unità ≈ km) e ritaglia l'area Italia-Tunisia.
import fs from 'fs';
import {geoMercator, geoPath} from 'd3-geo';
const land = JSON.parse(fs.readFileSync('data/ne_10m_land.geojson'));
const countries = JSON.parse(fs.readFileSync('data/ne_50m_admin_0_countries.geojson'));
const proj = geoMercator().scale(6371).translate([0, 0]);
const [x0, y0] = proj([4, 47.5]);
const [x1, y1] = proj([21, 32]);
proj.clipExtent([[x0, y0], [x1, y1]]);
const path = geoPath(proj);
const round = (s) => s ? s.replace(/(\d+\.\d{1})\d+/g, '$1') : '';
const it = countries.features.find((f) => f.properties.ADM0_A3 === 'ITA');
const pts = {
  roma: [12.4964, 41.9028], mazara: [12.5900, 37.6510], palermo: [13.3615, 38.1157],
  tunisi: [10.1815, 36.8065], capobon: [11.0470, 37.0800], pantelleria: [11.95, 36.79],
  lampedusa: [12.6, 35.51], malta: [14.45, 35.90],
};
const P = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, proj(v).map((n) => +n.toFixed(1))]));
const out = {
  bounds: [x0, y0, x1, y1],
  land: round(path({type: 'FeatureCollection', features: land.features})),
  italy: round(path(it)),
  borders: round(path({type: 'FeatureCollection', features: countries.features.filter((f) => ['ITA', 'TUN', 'DZA', 'LBY', 'FRA', 'CHE', 'AUT', 'SVN', 'HRV', 'MLT'].includes(f.properties.ADM0_A3))})),
  points: P,
};
fs.writeFileSync('src/mapdata.json', JSON.stringify(out));
console.log('ok', (JSON.stringify(out).length / 1024).toFixed(0) + 'KB', P);
