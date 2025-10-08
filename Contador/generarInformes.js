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

function exportarInformeAFormato(formato) {
  const resultado = document.getElementById('resultadoInforme');
  const titulo = resultado.querySelector('h3');
  const lista = resultado.querySelector('ul');

  if (!titulo || !lista) {
    alert('No hay datos para exportar.');
    return;
  }

  const anio = titulo.textContent.match(/\d+/)[0];
  const pagos = Array.from(lista.querySelectorAll('li')).map(li => {
    const [fecha, monto] = li.textContent.split(' - Monto: $');
    return { fecha: fecha.replace('Fecha: ', ''), monto: monto };
  });

  if (formato === 'pdf') {
    const doc = new jsPDF();
    doc.text(`Informe de Pagos - Año ${anio}`, 10, 10);
    pagos.forEach((pago, index) => {
      doc.text(`${index + 1}. Fecha: ${pago.fecha}, Monto: $${pago.monto}`, 10, 20 + index * 10);
    });
    doc.save(`Informe_Pagos_${anio}.pdf`);
  } else if (formato === 'csv') {
    let csvContent = 'Fecha,Monto\n';
    pagos.forEach(pago => {
      csvContent += `${pago.fecha},${pago.monto}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Informe_Pagos_${anio}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert('Formato no soportado.');
  }
}

window.addEventListener('DOMContentLoaded', llenarSelectorAnios);