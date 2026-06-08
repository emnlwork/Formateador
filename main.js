// Inicialización global, cambio de pestañas, limpieza general, versión y gestión de hash
(function() {
    const core = window.core;
    if (!core) return;

    // ==================== FUNCIONES DE HASH ====================
    // Guarda el hash cuando se cambia de pestaña o submódulo
    function updateHash(tabId, subMode = null) {
        let hash = tabId;
        if (subMode) hash += '_' + subMode;
        // Evitar bucles
        if (window.location.hash.substring(1) !== hash) {
            history.pushState(null, null, '#' + hash);
        }
    }

    // Restaura la pestaña y submódulo desde el hash
    function restoreFromHash() {
        let hash = window.location.hash.substring(1);
        if (!hash) return;
        let parts = hash.split('_');
        let tabId = parts[0];
        let subMode = parts[1] || null;
        // Activar pestaña principal
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabBtn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tabBtn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        } else {
            return; // si no existe la pestaña, no hacer nada
        }
        // Ahora notificar al módulo correspondiente para que active su submódulo
        // Usamos un evento personalizado que cada módulo escuchará
        if (subMode) {
            const event = new CustomEvent('restoreSubmodule', { detail: { tabId: tabId, subMode: subMode } });
            window.dispatchEvent(event);
        }
    }

    // Escuchar cambios en el hash (botones atrás/adelante del navegador)
    window.addEventListener('hashchange', () => {
        restoreFromHash();
    });

    // Exponer la función global para que los módulos la usen
    window.updateHash = updateHash;

    // ==================== CAMBIO DE PESTAÑAS PRINCIPALES ====================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            // Actualizar hash (sin submódulo porque se reinicia al cambiar de pestaña)
            updateHash(tabId, null);
            // Activar visualmente
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ==================== VERSIÓN ====================
    const VERSION = "2.0.0";
    document.getElementById('versionNumber').textContent = `v${VERSION}`;
    document.getElementById('versionInfo').addEventListener('click', () => {
        alert(`Versión actual: ${VERSION}\n\nCambios:\n- Ahora la página recuerda en qué pestaña y submódulo estabas (usando # en la URL).\n- Botón "Limpiar todo" eliminado.\n- Varias correcciones de estabilidad.`);
    });

    // Notas globales se guardan automáticamente en localStorage
    const notesTa = document.getElementById('globalNotes');
    if (notesTa) {
        const saved = localStorage.getItem('globalNotes');
        if (saved) notesTa.value = saved;
        notesTa.addEventListener('input', () => {
            localStorage.setItem('globalNotes', notesTa.value);
        });
    }

    // Restaurar estado desde el hash después de que todos los módulos se hayan inicializado
    // Damos un pequeño retardo para asegurar que los módulos ya registraron sus eventos de restauración
    setTimeout(() => {
        restoreFromHash();
    }, 100);
})();