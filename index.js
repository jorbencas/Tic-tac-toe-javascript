document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos
    const btnToggle = document.getElementById('btn-toggle');
    const tablero = document.getElementById('tablero-interactivo');
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const estadoLabel = document.getElementById('estado-label');
    const btnAdd = document.getElementById('btn-add');

    // Datos iniciales para que al cargar no esté vacío
    const datosIniciales = [
        { id: 1, fecha: '2024-05-20', user: 'Admin', act: 'Login' },
        { id: 2, fecha: '2024-05-21', user: 'Editor', act: 'Update' }
    ];

    // Función para renderizar filas sin borrar la estructura
    function renderizar(datos) {
        cuerpoTabla.innerHTML = datos.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.fecha}</td>
                <td>${item.user}</td>
                <td>${item.act}</td>
                <td><button onclick="alert('Acción ID: ${item.id}')">Ver</button></td>
            </tr>
        `).join('');
    }

    // Inicialización al cargar la página por primera vez
    renderizar(datosIniciales);

    // Lógica para DESACTIVAR (no borrar)
    btnToggle.addEventListener('click', () => {
        const isCurrentlyDisabled = tablero.classList.toggle('desactivado');
        
        if (isCurrentlyDisabled) {
            btnToggle.textContent = "Activar Tablero";
            btnToggle.className = "btn-success";
            estadoLabel.textContent = "DESACTIVADO";
            estadoLabel.style.color = "red";
        } else {
            btnToggle.textContent = "Desactivar Tablero";
            btnToggle.className = "btn-danger";
            estadoLabel.textContent = "ACTIVO";
            estadoLabel.style.color = "green";
        }
    });

    // Funcionalidad extra: Añadir datos dinámicamente
    btnAdd.addEventListener('click', () => {
        const nuevoId = cuerpoTabla.rows.length + 1;
        const nuevaFila = { 
            id: nuevoId, 
            fecha: new Date().toLocaleDateString(), 
            user: 'Sistema', 
            act: 'Nueva Entrada' 
        };
        datosIniciales.push(nuevaFila);
        renderizar(datosIniciales);
    });
});