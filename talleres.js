// Función para obtener el tipo de taller por ID desde la API
async function obtenerTipoTaller(idTaller) {
    try {
        // Corregir la URL para que apunte al endpoint correcto
        const response = await fetch(`http://127.0.0.1:5000/talleres/tipo/${idTaller}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.tipo;
    } catch (error) {
        console.error('Error al obtener el tipo de taller:', error);
        return 'Tipo no disponible';
    }
}

// Función para mostrar el tipo de taller en un elemento específico
async function mostrarTipoTaller(idTaller, elementoId) {
    const tipo = await obtenerTipoTaller(idTaller);
    const elemento = document.getElementById(elementoId);
    
    if (elemento) {
        elemento.textContent = `Categoría: ${tipo}`;
        elemento.classList.add('categoria-cargada');
    }
}

// Función para cargar todas las categorías al iniciar la página
async function cargarTodasLasCategorias() {
    // Lista de IDs de talleres y sus elementos correspondientes
    const talleres = [
        { id: 1, elementoId: 'categoria-1' },
        { id: 2, elementoId: 'categoria-2' }
    ];

    // Cargar categorías para todos los talleres
    for (const taller of talleres) {
        await mostrarTipoTaller(taller.id, taller.elementoId);
    }
}

// Función alternativa para obtener tipo específico por ID (uso directo)
async function obtenerCategoriaPorId(id) {
    return await obtenerTipoTaller(id);
}

// Ejecutar cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarTodasLasCategorias);
