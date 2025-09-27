function llenarSelectorAnios() {
  const select = document.getElementById('anio');
  const anioActual = new Date().getFullYear();
  const cantidadAnios = 10;
  select.innerHTML = '';
  for (let i = 0; i < cantidadAnios; i++) {
    const anio = anioActual - i;
    const option = document.createElement('option');
    option.value = anio;
    option.textContent = anio;
    select.appendChild(option);
  }
}

function generarInforme(idMiembro) {
  const select = document.getElementById('anio');
  const anio = select.value;
  const resultado = document.getElementById('resultadoInforme');
  resultado.innerHTML = '<p>Generando informe...</p>';

  fetch(`http://127.0.0.1:5000/pagarCuota/usuario/${idMiembro}/anio/${anio}`)
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(pagos => {
      if (Array.isArray(pagos) && pagos.length > 0) {
        let html = `<h3>Pagos del año ${anio}</h3><ul>`;
        pagos.forEach(pago => {
          html += `<li>Fecha: ${pago.fechaPago} - Monto: $${pago.monto}</li>`;
        });
        html += '</ul>';
        resultado.innerHTML = html;
      } else {
        resultado.innerHTML = '<p>No se encontraron pagos para este año.</p>';
      }
    })
    .catch(error => {
      resultado.innerHTML = `<p>Error al obtener los pagos: ${error.message}</p>`;
    });
}

window.addEventListener('DOMContentLoaded', llenarSelectorAnios);