// Emblemi dei 7 agenti di Abisso Broker HQ (sorgente unica: gen.mjs scrive gli SVG e li inietta nella pagina)
const EMB={
 dir:{col:'#ffd27a',sym:'<path d="M64 34V96"/><path d="M44 36V50Q44 62 64 62Q84 62 84 50V36"/><path d="M39 42L44 33L49 42M59 40L64 31L69 40M79 42L84 33L89 42"/><circle cx="64" cy="99" r="3.5" fill="C"/>'},
 forn:{col:'#5ee08a',sym:'<circle cx="64" cy="37" r="6"/><path d="M64 43V94M51 53H77"/><path d="M38 76Q42 94 64 94Q86 94 90 76"/><path d="M32 81L38 74L44 81M84 81L90 74L96 81"/>'},
 social:{col:'#ff6fb5',sym:'<path d="M38 40H90A8 8 0 0 1 98 48V74A8 8 0 0 1 90 82H62L48 93V82H38A8 8 0 0 1 30 74V48A8 8 0 0 1 38 40Z"/><path d="M57 51V71L74 61Z" fill="C"/>'},
 cassa:{col:'#ffc552',sym:'<path d="M34 56Q64 18 94 56Z"/><path d="M64 56L47 39M64 56L64 32M64 56L81 39"/><path d="M34 74H94Q90 96 64 96Q38 96 34 74Z"/><circle cx="64" cy="65" r="6.5" fill="C" stroke="none"/>'},
 clienti:{col:'#6fb2ff',sym:'<path d="M30 86H98"/><path d="M38 80Q38 50 64 50Q90 50 90 80Z"/><circle cx="64" cy="44" r="4"/><path d="M48 70Q50 60 58 57" stroke-width="3.5"/>'},
 aste:{col:'#ff7a59',sym:'<g transform="rotate(-40 64 60)"><rect x="44" y="30" width="40" height="18" rx="4"/><path d="M64 48V90"/></g><path d="M30 98H66"/><rect x="34" y="88" width="28" height="10" rx="2"/>'},
 carichi:{col:'#b98cff',sym:'<rect x="28" y="48" width="48" height="32" rx="3"/><path d="M76 58H88L98 70V80H76Z"/><circle cx="43" cy="86" r="6" fill="#0c1828"/><circle cx="87" cy="86" r="6" fill="#0c1828"/><path d="M52 55V73M44 59.5L60 68.5M44 68.5L60 59.5" stroke-width="3"/>'},
};
function emblemSVG(id,size){
  const e=EMB[id],C=e.col,s=e.sym.replace(/"C"/g,'"'+C+'"');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"'+(size?' width="'+size+'" height="'+size+'"':'')+'>'
   +'<circle cx="64" cy="64" r="62" fill="#060d18"/>'
   +'<circle cx="64" cy="64" r="57" fill="#0c1828" stroke="'+C+'" stroke-width="4"/>'
   +'<circle cx="64" cy="64" r="49" fill="none" stroke="'+C+'" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="2 4"/>'
   +'<g fill="none" stroke="'+C+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'+s+'</g></svg>';
}
