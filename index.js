let jugadores = { j1: "cross", j2: `circle` };
let jugadorActivo = "j2";
let tableroHTML = document.getElementById("tablero");
let icon = jugadores[jugadorActivo];
let tablero = Array.from({ length: 9 }, (_, i) => "");
let child = `
<div class='cell' onclick='jugar(event.currentTarget)'>
<img src="${icon}.svg" alt="Jugador ${jugadorActivo}" > </div>`;
let p = "";
tablero.forEach((e, i) => {
  if ([3, 6, 9].includes(i + 1)) {
    p += ` 
    <div class='row'>
        ${child}
       ${child}
        ${child}
    </div>`;
  }
});

tableroHTML.innerHTML = p;

let fin = false;
function jugar(cell) {
  let element = cell.children[0].attributes.src;
  let content = element.value;
  if (!fin && content.includes(icon)) {
    jugadorActivo = jugadorActivo === "j1" ? "j2" : "j1";
    icon = jugadores[jugadorActivo];
    content = icon + ".svg";
    console.log("====================================");
    console.log(content);
    console.log("====================================");
    cell.children[0].setAttribute("src", content);
    
  }
}
