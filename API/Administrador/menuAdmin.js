document.addEventListener("DOMContentLoaded", () => {
  fetch("http://127.0.0.1:5000/admin/resumen")
    .then(response => response.json())
    .then(data => {
  document.getElementById("solPend").textContent = data.solPend;
  document.getElementById("solAcep").textContent = data.solAcep;
  document.getElementById("libros").textContent = data.libros;
  document.getElementById("talleres").textContent = data.talleres;
    })
    .catch(error => console.error("Error al cargar el resumen:", error));
});
