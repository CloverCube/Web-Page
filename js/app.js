frontPagePop()
const frontPopular = document.getElementById("popular");
const frontLast = document.getElementById("ultimos");


frontPopular.addEventListener("click", frontPagePop);
frontLast.addEventListener("click", frontDate);


elemento2()
function elemento2() {
  fetch("../content/page/content.json")
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar el archivo JSON");
      return response.json();
    })
    .then((x) => {
      const contenedor = document.getElementById("Hola");
      let html = "";

      // Ordenar por likes de mayor a menor
      x.sort((a, b) => b.likes - a.likes);

      x.forEach((content) => {
        html += createItemHTML(content);
      });

      contenedor.innerHTML = html;
    });
}
// Plantilla html
function createItemHTML(content) {
  return `
    <div class="row my-3">
        <div class="col-3">
            <img src="${content.imagen}" alt="${content.titulo}">
        </div>
        <div class="col">
            <a href="${content.url_page}"><h2>${content.titulo}</h2></a>
            <p>${content.parrafo}</p>
            <span>${content.categoria} | </span>
            <span>Likes: ${content.likes} | </span>
            <span>Fecha: ${content.fecha_subido}</span>
        </div>
    </div>
  `;
}

function frontPagePop() {
  fetch("../content/page/content.json")
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar el archivo JSON");
      return response.json();
    })
    .then((x) => {
      const contenedor = document.getElementById("Generate");
      let html = "";

      // Ordenar por likes de mayor a menor
      x.sort((a, b) => b.likes - a.likes);

      x.forEach((content) => {
        html += createItemHTML(content);
      });

      contenedor.innerHTML = html;
    });
}

function frontDate() {
  fetch("../content/page/content.json")
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar el archivo JSON");
      return response.json();
    })
    .then((x) => {
      const contenedor = document.getElementById("Generate");
      let html = "";

      // Ordenar por fecha de mayor a menor
      x.sort((a, b) => b.fecha - a.fecha);

      x.forEach((content) => {
        html += createItemHTML(content);
      });
      
      contenedor.innerHTML = html;
    });
}


