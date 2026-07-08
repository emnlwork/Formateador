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

    // Versión del Core
    const coreVersionElement = document.getElementById('coreVersionDisplay');
    if (coreVersionElement) {
        coreVersionElement.textContent = window.coreVersion || '3.1';
    }

    // ==================== NOTAS GLOBALES ====================
    const notesTa = document.getElementById('globalNotes');
    if (notesTa) {
        const saved = localStorage.getItem('globalNotes');
        if (saved) notesTa.value = saved;
        notesTa.addEventListener('input', () => {
            localStorage.setItem('globalNotes', notesTa.value);
        });
    }

    // ==================== PESTAÑAS DE NOTAS ====================
    const notesTabs = document.querySelectorAll('.notes-tab');
    const notesPanel = document.getElementById('notesPanel');
    const normalizerPanel = document.getElementById('normalizerPanel');

    notesTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            notesTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--grayl)';
                t.style.borderColor = 'var(--blu)';
            });
            this.classList.add('active');
            this.style.background = 'var(--blu)';
            this.style.color = 'white';
            this.style.borderColor = 'var(--blu)';
            
            const target = this.dataset.tab;
            if (target === 'notes') {
                notesPanel.style.display = 'block';
                normalizerPanel.style.display = 'none';
            } else {
                notesPanel.style.display = 'none';
                normalizerPanel.style.display = 'block';
            }
        });
    });

    // ==================== NORMALIZADOR DE TEXTO ====================
    const normalizerInput = document.getElementById('normalizerInput');
    const normalizerOutput = document.getElementById('normalizerOutput');
    const normalizeBtn = document.getElementById('normalizeBtn');
    const copyNormalizedBtn = document.getElementById('copyNormalizedBtn');
    const clearNormalizerBtn = document.getElementById('clearNormalizerBtn');
    const normalizerFeedback = document.getElementById('normalizerFeedback');

    function normalizarTexto(texto) {
        if (!texto) return '';
        // Reemplazar tabs por espacios
        let result = texto.replace(/\t/g, ' ');
        // Reemplazar guiones por espacios
        result = result.replace(/-/g, ' ');
        // Reemplazar múltiples espacios por uno solo (pero mantener saltos de línea)
        result = result.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        return result;
    }

    // Normalizar automáticamente al escribir
    normalizerInput.addEventListener('input', function() {
        const normalized = normalizarTexto(this.value);
        normalizerOutput.value = normalized;
    });

    normalizeBtn.addEventListener('click', function() {
        const text = normalizerInput.value;
        if (!text.trim()) {
            normalizerFeedback.textContent = '⚠️ No hay texto para normalizar';
            setTimeout(() => { normalizerFeedback.textContent = ''; }, 2000);
            return;
        }
        const normalized = normalizarTexto(text);
        normalizerOutput.value = normalized;
        normalizerFeedback.textContent = '✅ Texto normalizado';
        setTimeout(() => { normalizerFeedback.textContent = ''; }, 2000);
    });

    copyNormalizedBtn.addEventListener('click', function() {
        const text = normalizerOutput.value;
        if (!text.trim()) {
            normalizerFeedback.textContent = '⚠️ No hay texto para copiar';
            setTimeout(() => { normalizerFeedback.textContent = ''; }, 2000);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            normalizerFeedback.textContent = '✅ Copiado al portapapeles';
            setTimeout(() => { normalizerFeedback.textContent = ''; }, 2000);
        }).catch(() => {
            normalizerFeedback.textContent = '❌ Error al copiar';
            setTimeout(() => { normalizerFeedback.textContent = ''; }, 2000);
        });
    });

    clearNormalizerBtn.addEventListener('click', function() {
        normalizerInput.value = '';
        normalizerOutput.value = '';
        normalizerFeedback.textContent = '🧹 Limpiado';
        setTimeout(() => { normalizerFeedback.textContent = ''; }, 1500);
    });

    // Guardar el texto del normalizador en localStorage (opcional, para no perderlo)
    normalizerInput.addEventListener('input', function() {
        localStorage.setItem('normalizerInput', this.value);
    });

    // Cargar texto guardado del normalizador
    const savedNormalizer = localStorage.getItem('normalizerInput');
    if (savedNormalizer && normalizerInput) {
        normalizerInput.value = savedNormalizer;
        normalizerOutput.value = normalizarTexto(savedNormalizer);
    }

    // Restaurar estado desde el hash después de que todos los módulos se hayan inicializado
    // Damos un pequeño retardo para asegurar que los módulos ya registraron sus eventos de restauración
    setTimeout(() => {
        restoreFromHash();
    }, 100);
})();