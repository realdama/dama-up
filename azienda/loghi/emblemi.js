// Emblemi dei 7 agenti di Abisso Broker HQ: busto umano (stesso personaggio della pianta) + simbolo del ruolo.
// Sorgente unica: gen.mjs scrive gli SVG e li inietta nella pagina.
const EMB={
 dir:{col:'#ffd27a',skin:'#f1d3b3',hair:'#cfd6df',
  back:'',
  hair_:'<path d="M43 58Q42 31 64 31Q86 31 85 58Q80 44 64 43Q48 44 43 58Z"/><path d="M44 62Q46 88 64 88Q82 88 84 62Q79 76 64 76Q49 76 44 62Z"/>',
  face:'<path d="M58 79Q64 76 70 79" stroke="#8a6a55" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  body:'<path d="M58 96L64 104L70 96Z" fill="#fff" opacity=".9"/><path d="M61 100L64 124L67 100Z" fill="#1d2d48"/>',
  sym:'<path d="M64 34V96"/><path d="M44 36V50Q44 62 64 62Q84 62 84 50V36"/><path d="M39 42L44 33L49 42M59 40L64 31L69 40M79 42L84 33L89 42"/>'},
 forn:{col:'#5ee08a',skin:'#c68a62',hair:'#3b2418',
  back:'<path d="M40 62Q36 28 64 28Q92 28 88 62L91 98H37Z"/>',
  hair_:'<path d="M42 56Q42 31 64 31Q86 31 86 56Q78 40 62 42Q52 44 42 56Z"/>',
  face:'',body:'<circle cx="80" cy="108" r="3" fill="#06101c" opacity=".35"/>',
  sym:'<circle cx="64" cy="37" r="6"/><path d="M64 43V94M51 53H77"/><path d="M38 76Q42 94 64 94Q86 94 90 76"/><path d="M32 81L38 74L44 81M84 81L90 74L96 81"/>'},
 social:{col:'#ff6fb5',skin:'#e0b48f',hair:'#151515',
  back:'',
  hair_:'<path d="M42 54Q38 26 66 26Q74 22 82 30Q90 38 86 54Q80 40 66 41Q52 40 42 54Z"/>',
  face:'',body:'<path d="M46 96Q50 108 64 108Q78 108 82 96" stroke="#2a2a35" stroke-width="4" fill="none"/><rect x="40" y="90" width="12" height="15" rx="5" fill="#2a2a35"/><rect x="76" y="90" width="12" height="15" rx="5" fill="#2a2a35"/><circle cx="46" cy="97" r="3" fill="'+'#ff6fb5'+'"/><circle cx="82" cy="97" r="3" fill="#ff6fb5"/>',
  sym:'<path d="M38 40H90A8 8 0 0 1 98 48V74A8 8 0 0 1 90 82H62L48 93V82H38A8 8 0 0 1 30 74V48A8 8 0 0 1 38 40Z"/><path d="M57 51V71L74 61Z" fill="C"/>'},
 cassa:{col:'#ffc552',skin:'#f1d3b3',hair:'#e9c46a',
  back:'<circle cx="64" cy="26" r="10"/>',
  hair_:'<path d="M42 58Q40 32 64 32Q88 32 86 58Q82 42 64 42Q46 42 42 58Z"/>',
  face:'<g fill="none" stroke="#2a2030" stroke-width="2.2"><circle cx="57" cy="60" r="6"/><circle cx="71" cy="60" r="6"/><path d="M63 60H65"/></g><circle cx="43" cy="70" r="3" fill="#fff"/><circle cx="85" cy="70" r="3" fill="#fff"/>',
  body:'',
  sym:'<path d="M34 56Q64 18 94 56Z"/><path d="M64 56L64 32"/><path d="M34 74H94Q90 96 64 96Q38 96 34 74Z"/><circle cx="64" cy="65" r="6.5" fill="C" stroke="none"/>'},
 clienti:{col:'#6fb2ff',skin:'#8d5a3b',hair:'#1c120c',
  back:'',
  hair_:'<path d="M43 54Q42 32 64 32Q86 32 85 54Q78 42 64 42Q50 42 43 54Z"/>',
  face:'<path d="M40 60Q40 34 64 34Q88 34 88 60" stroke="#2a2a35" stroke-width="4" fill="none"/><rect x="36" y="54" width="8" height="14" rx="3" fill="#2a2a35"/><path d="M40 66Q44 80 56 80" stroke="#2a2a35" stroke-width="2.5" fill="none"/><circle cx="57" cy="80" r="2.5" fill="#2a2a35"/>',
  body:'',
  sym:'<path d="M30 86H98"/><path d="M38 80Q38 50 64 50Q90 50 90 80Z"/><circle cx="64" cy="44" r="4"/>'},
 aste:{col:'#ff7a59',skin:'#e8bf9a',hair:'#5a4636',
  back:'',
  hair_:'<path d="M42 66Q40 46 50 42Q46 54 47 66Z"/><path d="M86 66Q88 46 78 42Q82 54 81 66Z"/><path d="M55 74Q64 70 73 74Q64 77 55 74Z"/>',
  face:'',body:'<path d="M54 94L64 99L54 104Z M74 94L64 99L74 104Z" fill="#1d2d48"/><circle cx="64" cy="99" r="2.5" fill="#1d2d48"/>',
  sym:'<g transform="rotate(-40 64 60)"><rect x="44" y="30" width="40" height="18" rx="4"/><path d="M64 48V90"/></g><rect x="34" y="88" width="28" height="10" rx="2"/>'},
 carichi:{col:'#b98cff',skin:'#d9a882',hair:'#3a2a20',
  back:'',
  hair_:'<path d="M41 54Q40 26 64 26Q88 26 87 54Z" fill="#6b4fb0"/><rect x="39" y="48" width="50" height="9" rx="4" fill="#4e3a85"/><circle cx="64" cy="24" r="5" fill="#e8eef6"/>',
  face:'<path d="M48 78Q64 92 80 78Q78 86 64 88Q50 86 48 78Z" fill="#3a2a20" opacity=".35"/>',
  body:'',
  sym:'<rect x="28" y="48" width="48" height="32" rx="3"/><path d="M76 58H88L98 70V80H76Z"/><circle cx="43" cy="86" r="6" fill="#0c1828"/><circle cx="87" cy="86" r="6" fill="#0c1828"/>'},
};
function emblemSVG(id,size){
  const e=EMB[id],C=e.col,S=e.skin,sym=e.sym.replace(/"C"/g,'"'+C+'"'),cid='c-'+id;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"'+(size?' width="'+size+'" height="'+size+'"':'')+'>'
   +'<defs><clipPath id="'+cid+'"><circle cx="64" cy="64" r="55"/></clipPath></defs>'
   +'<circle cx="64" cy="64" r="62" fill="#060d18"/>'
   +'<circle cx="64" cy="64" r="57" fill="#0c1828"/>'
   +'<g clip-path="url(#'+cid+')">'
   +'<circle cx="64" cy="58" r="40" fill="'+C+'" opacity=".12"/>'
   +'<g fill="'+e.hair+'">'+e.back+'</g>'
   +'<path d="M20 130Q20 96 64 92Q108 96 108 130Z" fill="'+C+'"/>'
   +'<path d="M56 80H72V96Q64 101 56 96Z" fill="'+S+'"/><path d="M56 88Q64 92 72 88V84H56Z" fill="#000" opacity=".15"/>'
   +e.body
   +'<ellipse cx="64" cy="60" rx="21" ry="24" fill="'+S+'"/>'
   +'<ellipse cx="43" cy="62" rx="3.5" ry="5" fill="'+S+'"/><ellipse cx="85" cy="62" rx="3.5" ry="5" fill="'+S+'"/>'
   +'<circle cx="57" cy="61" r="2.6" fill="#1a1420"/><circle cx="71" cy="61" r="2.6" fill="#1a1420"/>'
   +'<path d="M58 72Q64 76 70 72" stroke="#1a1420" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
   +'<circle cx="52" cy="69" r="3.5" fill="#ff7a7a" opacity=".22"/><circle cx="76" cy="69" r="3.5" fill="#ff7a7a" opacity=".22"/>'
   +'<g fill="'+e.hair+'">'+e.hair_+'</g>'+e.face
   +'</g>'
   +'<circle cx="64" cy="64" r="57" fill="none" stroke="'+C+'" stroke-width="4"/>'
   +'<g transform="translate(83 83)"><circle cx="20" cy="20" r="19" fill="#060d18" stroke="'+C+'" stroke-width="3"/>'
   +'<g transform="translate(5.8 5.8) scale(.22)" fill="none" stroke="'+C+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">'+sym+'</g></g>'
   +'</svg>';
}
