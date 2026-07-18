// Inicialización global, cambio de pestañas, limpieza general, versión y gestión de hash
// NOTAS: ahora con pestañas funcionales, sincronización Wix y filtros predefinidos
(function() {
    const core = window.core;
    if (!core) return;

    // ==================== FUNCIONES DE HASH ====================
    function updateHash(tabId, subMode = null) {
        let hash = tabId;
        if (subMode) hash += '_' + subMode;
        if (window.location.hash.substring(1) !== hash) {
            history.pushState(null, null, '#' + hash);
        }
    }
    window.updateHash = updateHash;

    function restoreFromHash() {
        let hash = window.location.hash.substring(1);
        if (!hash) return;
        let parts = hash.split('_');
        let tabId = parts[0];
        let subMode = parts[1] || null;
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabBtn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tabBtn.classList.add('active');
            const panel = document.getElementById(tabId);
            if (panel) panel.classList.add('active');
        } else {
            return;
        }
        if (subMode) {
            const event = new CustomEvent('restoreSubmodule', { detail: { tabId: tabId, subMode: subMode } });
            window.dispatchEvent(event);
        }
    }
    window.addEventListener('hashchange', restoreFromHash);

    // ==================== CAMBIO DE PESTAÑAS PRINCIPALES ====================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            updateHash(tabId, null);
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ==================== VERSIÓN ====================
    const VERSION = "2.1.0";
    document.getElementById('versionNumber').textContent = `v${VERSION}`;
    document.getElementById('versionInfo').addEventListener('click', () => {
        alert(`Versión actual: ${VERSION}\n\nCambios:\n- Pestañas de notas corregidas y sincronización con Wix.\n- Filtros predefinidos desde CSV.\n- Notas locales y sincronizadas.\n- Mejoras de rendimiento.`);
    });
    const coreVersionElement = document.getElementById('coreVersionDisplay');
    if (coreVersionElement) {
        coreVersionElement.textContent = window.coreVersion || '3.3';
    }

    // ==================== NOTAS CON PESTAÑAS (VERSIÓN MEJORADA) ====================
    let noteTabCounter = 1;
    let activeNoteTabId = null;
    // Almacén de notas: { id, name, content, sync: boolean, wixId: string (número) }
    let notesData = new Map();

    // Elementos DOM
    const notesTabsContainer = document.getElementById('notesTabsContainer');
    const notesPanelsContainer = document.getElementById('notesPanelsContainer');
    const addNoteTabBtn = document.getElementById('addNoteTabBtn');

    // ========== CARGAR FILTROS DESDE CSV LOCAL ==========
    let filtrosMap = new Map(); // nombre -> filtro string

    async function cargarFiltrosDesdeCSV() {
        try {
            const response = await fetch('filtros.csv');
            if (!response.ok) throw new Error('No se encontró filtros.csv');
            const text = await response.text();
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                parsed.data.forEach(row => {
                    const nombre = (row.NOMBRE || '').trim();
                    const filtro = (row.FILTRO || '').trim();
                    if (nombre && filtro) {
                        filtrosMap.set(nombre, filtro);
                    }
                });
                poblarDropdownFiltros();
            }
        } catch (e) {
            console.warn('No se pudo cargar filtros.csv, usando valores por defecto.');
            // Valores por defecto
            filtrosMap.set('Todos', '*');
            filtrosMap.set('Contenedor', '1-5');
            filtrosMap.set('Calzado', '1-30');
            filtrosMap.set('Ropa', '301-319,400-420');
            poblarDropdownFiltros();
        }
    }

    function poblarDropdownFiltros() {
        const select = document.getElementById('filterSelect');
        if (!select) return;
        select.innerHTML = '';
        // Opción personalizado
        const optPersonalizado = document.createElement('option');
        optPersonalizado.value = '__custom__';
        optPersonalizado.textContent = '✏️ Personalizado';
        select.appendChild(optPersonalizado);
        // Opciones desde el mapa
        filtrosMap.forEach((filtro, nombre) => {
            const opt = document.createElement('option');
            opt.value = filtro;
            opt.textContent = nombre;
            select.appendChild(opt);
        });
        // Evento para aplicar el filtro
        select.addEventListener('change', function() {
            const val = this.value;
            const input = document.getElementById('columnRangeInput');
            if (val === '__custom__') {
                input.value = '';
                input.focus();
            } else {
                input.value = val;
                // Aplicar automáticamente
                const applyBtn = document.getElementById('applyRangeBtn');
                if (applyBtn) applyBtn.click();
            }
        });
        // Seleccionar "Todos" por defecto si existe
        const defaultOption = Array.from(select.options).find(opt => opt.textContent === 'Todos');
        if (defaultOption) {
            select.value = defaultOption.value;
            const input = document.getElementById('columnRangeInput');
            if (input) input.value = defaultOption.value;
        }
    }

    // ========== FUNCIONES DE NOTAS ==========

    // Obtener HTML del panel de una nota
    function getNotePanelHTML(tabId) {
        return `
            <div id="${tabId}" class="note-panel" style="display:none; width:100%;">
                <textarea class="note-textarea" rows="3" placeholder="Notas / Apuntes (este texto no se borra al limpiar)" style="width:100%; min-height:60px; resize:vertical; font-size:0.85rem; background:var(--blud); color:var(--white); border:1px solid var(--blu); border-radius:4px; padding:0.4rem 0.6rem; box-sizing:border-box;"></textarea>
            </div>
        `;
    }

    // Crear una nueva pestaña de nota
    function createNoteTab(tabName = null, content = '', sync = false, wixId = null, activate = true) {
        const id = `note_tab_${noteTabCounter++}`;
        const title = tabName || `Nota ${noteTabCounter - 1}`;
        const isSync = sync;
        const wixIdNum = wixId || null;

        // Crear pestaña (tab)
        const tabButton = document.createElement('div');
        tabButton.className = 'note-tab';
        tabButton.setAttribute('data-tab-id', id);
        tabButton.style.cssText = 'background:var(--blub); border:1px solid var(--blu); border-radius:3px 3px 0 0; padding:0.1rem 0.5rem; cursor:pointer; display:flex; align-items:center; gap:0.3rem; transition:all 0.2s; font-size:0.7rem;';
        const syncIcon = isSync ? '🔄' : '💾';
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(title)}</span><span class="tab-sync-icon" style="font-size:0.6rem; color:${isSync ? '#2ecc71' : '#888'};">${syncIcon}</span><span class="tab-close" style="color:#ff8888; font-size:0.6rem; cursor:pointer; margin-left:0.2rem;" title="Cerrar">✖</span>`;
        // Insertar antes del botón "Nueva"
        if (addNoteTabBtn && addNoteTabBtn.parentNode === notesTabsContainer) {
            notesTabsContainer.insertBefore(tabButton, addNoteTabBtn);
        } else {
            notesTabsContainer.appendChild(tabButton);
        }

        // Crear panel
        const panelHtml = getNotePanelHTML(id);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        notesPanelsContainer.appendChild(panel);
        const textarea = panel.querySelector('.note-textarea');
        if (content) textarea.value = content;

        // Guardar datos
        const noteData = {
            id: id,
            name: title,
            content: content,
            sync: isSync,
            wixId: wixIdNum,
            tabButton: tabButton,
            panel: panel,
            textarea: textarea
        };
        notesData.set(id, noteData);

        // Evento de cierre
        const closeBtn = tabButton.querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                cerrarNota(id);
            });
        }

        // Doble clic para renombrar
        const nameSpan = tabButton.querySelector('.tab-name');
        nameSpan.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const oldName = this.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldName;
            input.style.cssText = 'width:auto; min-width:50px; background:var(--blud); color:var(--white); border:1px solid var(--blu); border-radius:3px; padding:0 2px; font-size:0.7rem;';
            this.style.display = 'none';
            this.parentNode.insertBefore(input, this);
            input.focus();
            input.select();
            input.addEventListener('blur', function() {
                const newName = this.value.trim() || oldName;
                nameSpan.textContent = newName;
                noteData.name = newName;
                nameSpan.style.display = '';
                this.remove();
                guardarNotasLocal();
            });
            input.addEventListener('keypress', function(e) { if (e.key === 'Enter') this.blur(); });
        });

        // Evento de clic en la pestaña para activarla
        tabButton.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-close')) return;
            activarNota(id);
        });

        // Evento de cambio en textarea para guardar local
        textarea.addEventListener('input', function() {
            noteData.content = this.value;
            guardarNotasLocal();
        });

        // Si es sincronizada, añadir un ícono de estado (opcional)
        // Podríamos añadir eventos para sync/recargar más adelante

        // Activar si se solicita
        if (activate || notesData.size === 1) {
            activarNota(id);
        }

        // Guardar en localStorage
        guardarNotasLocal();

        return id;
    }

    function activarNota(id) {
        const note = notesData.get(id);
        if (!note) return;
        // Desactivar todas
        document.querySelectorAll('#notesTabsContainer .note-tab').forEach(t => {
            t.classList.remove('active');
            t.style.background = 'var(--blub)';
        });
        document.querySelectorAll('#notesPanelsContainer .note-panel').forEach(p => p.style.display = 'none');
        // Activar esta
        note.tabButton.classList.add('active');
        note.tabButton.style.background = 'var(--blu)';
        note.panel.style.display = 'block';
        activeNoteTabId = id;
        // Actualizar visibilidad del botón cerrar (si solo queda una, ocultar)
        actualizarVisibilidadCierre();
    }

    function cerrarNota(id) {
        const note = notesData.get(id);
        if (!note) return;
        // Si es sincronizada, preguntar si se desea eliminar de Wix
        if (note.sync) {
            if (!confirm(`La nota "${note.name}" está sincronizada. ¿Deseas eliminarla también de Wix? (Cancelar la mantiene localmente)`)) {
                // No eliminar, solo ocultar? Pero la idea es cerrar la pestaña. 
                // Si no quiere eliminar, podemos convertirla a local? O simplemente cerrar y mantener local.
                // Decidimos: si no quiere eliminar de Wix, la convertimos a local y cerramos.
                note.sync = false;
                note.wixId = null;
                // Cambiar icono
                const icon = note.tabButton.querySelector('.tab-sync-icon');
                if (icon) icon.textContent = '💾';
                guardarNotasLocal();
                // Proceder a cerrar
                eliminarNotaDelDOM(id);
                return;
            } else {
                // Eliminar de Wix
                core.eliminarNotaWix(note.wixId || note.name).then(success => {
                    if (success) {
                        console.log('Nota eliminada de Wix');
                    } else {
                        alert('Error al eliminar de Wix, pero se cerrará localmente.');
                    }
                });
            }
        }
        // Eliminar del DOM y del mapa
        eliminarNotaDelDOM(id);
    }

    function eliminarNotaDelDOM(id) {
        const note = notesData.get(id);
        if (!note) return;
        note.tabButton.remove();
        note.panel.remove();
        notesData.delete(id);
        guardarNotasLocal();
        // Activar otra si existe
        const remaining = notesData.values().next();
        if (remaining.value) {
            activarNota(remaining.value.id);
        } else {
            // Crear una nueva por defecto
            createNoteTab('Nota 1', '', false, null, true);
        }
        actualizarVisibilidadCierre();
    }

    function actualizarVisibilidadCierre() {
        const tabs = document.querySelectorAll('#notesTabsContainer .note-tab');
        tabs.forEach(tab => {
            const close = tab.querySelector('.tab-close');
            if (close) close.style.display = tabs.length > 1 ? '' : 'none';
        });
    }

    // ========== GUARDAR Y CARGAR NOTAS LOCALMENTE ==========
    function guardarNotasLocal() {
        const data = [];
        for (const [id, note] of notesData.entries()) {
            data.push({
                id: id,
                name: note.name,
                content: note.content,
                sync: note.sync,
                wixId: note.wixId
            });
        }
        localStorage.setItem('notesData', JSON.stringify(data));
    }

    function cargarNotasLocal() {
        const saved = localStorage.getItem('notesData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Array.isArray(data) && data.length) {
                    // Limpiar existentes (excepto el botón)
                    const tabs = notesTabsContainer.querySelectorAll('.note-tab');
                    tabs.forEach(t => {
                        const id = t.dataset.tabId;
                        const panel = document.getElementById(id);
                        if (panel) panel.remove();
                        t.remove();
                    });
                    notesData.clear();
                    // Recrear cada nota
                    data.forEach(item => {
                        createNoteTab(item.name, item.content, item.sync || false, item.wixId || null, false);
                    });
                    // Activar la primera
                    const first = notesData.values().next().value;
                    if (first) activarNota(first.id);
                    actualizarVisibilidadCierre();
                    return true;
                }
            } catch (e) { console.warn('Error cargando notas locales', e); }
        }
        return false;
    }

    // ========== SINCROINIZACIÓN CON WIX ==========
    async function subirNotaActualAWix() {
        const id = activeNoteTabId;
        if (!id) return;
        const note = notesData.get(id);
        if (!note) return;
        if (!note.content.trim()) {
            alert('La nota está vacía. No se sube.');
            return;
        }
        // Determinar wixId: si ya tiene, usarlo; si no, generar uno nuevo (timestamp)
        let wixId = note.wixId;
        if (!wixId) {
            wixId = 'nota_' + Date.now();
            note.wixId = wixId;
        }
        // Mostrar progreso
        const msg = document.getElementById('notesFeedback');
        if (msg) msg.textContent = 'Subiendo a Wix...';
        const success = await core.subirNotaWix(wixId, note.content, note.name, (progress) => {
            if (msg) msg.textContent = `Subiendo... ${progress}%`;
        });
        if (success) {
            note.sync = true;
            // Actualizar icono
            const icon = note.tabButton.querySelector('.tab-sync-icon');
            if (icon) icon.textContent = '🔄';
            guardarNotasLocal();
            if (msg) msg.textContent = '✅ Nota sincronizada en Wix';
            setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
        } else {
            if (msg) msg.textContent = '❌ Error al subir a Wix';
        }
    }

    async function recargarNotaActualDesdeWix() {
        const id = activeNoteTabId;
        if (!id) return;
        const note = notesData.get(id);
        if (!note) return;
        if (!note.sync || !note.wixId) {
            alert('Esta nota no está sincronizada.');
            return;
        }
        const msg = document.getElementById('notesFeedback');
        if (msg) msg.textContent = 'Descargando desde Wix...';
        try {
            // Obtener todas las notas de Wix y buscar por wixId
            const notasWix = await core.obtenerNotasWix();
            const encontrada = notasWix.find(n => n.noteId === note.wixId);
            if (encontrada) {
                note.content = encontrada.content;
                note.name = encontrada.name;
                note.textarea.value = encontrada.content;
                const nameSpan = note.tabButton.querySelector('.tab-name');
                if (nameSpan) nameSpan.textContent = encontrada.name;
                guardarNotasLocal();
                if (msg) msg.textContent = '✅ Nota recargada desde Wix';
            } else {
                if (msg) msg.textContent = '⚠️ Nota no encontrada en Wix';
            }
        } catch (e) {
            if (msg) msg.textContent = '❌ Error al recargar: ' + e.message;
        }
        setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
    }

    async function cargarNotasDesdeWix() {
        const msg = document.getElementById('notesFeedback');
        if (msg) msg.textContent = 'Cargando notas de Wix...';
        try {
            const notasWix = await core.obtenerNotasWix();
            if (!notasWix || notasWix.length === 0) {
                if (msg) msg.textContent = 'No hay notas en Wix';
                setTimeout(() => { if (msg) msg.textContent = ''; }, 2000);
                return;
            }
            // Para cada nota de Wix, ver si ya existe localmente (por wixId)
            let cargadas = 0;
            for (const wixNote of notasWix) {
                const existing = Array.from(notesData.values()).find(n => n.wixId === wixNote.noteId);
                if (!existing) {
                    // Crear nueva nota sincronizada
                    createNoteTab(wixNote.name, wixNote.content, true, wixNote.noteId, false);
                    cargadas++;
                } else {
                    // Actualizar contenido local si es más reciente (opcional)
                    // Podríamos comparar fechas, pero por simplicidad no lo hacemos.
                }
            }
            if (msg) msg.textContent = `✅ Se cargaron ${cargadas} notas desde Wix`;
            setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
            // Activar la primera si no hay activa
            if (!activeNoteTabId || !notesData.has(activeNoteTabId)) {
                const first = notesData.values().next().value;
                if (first) activarNota(first.id);
            }
        } catch (e) {
            if (msg) msg.textContent = '❌ Error al cargar notas de Wix: ' + e.message;
        }
    }

    // ========== INICIALIZAR NOTAS ==========
    function initNotes() {
        // Asegurar que el botón "Nueva" esté presente
        if (!addNoteTabBtn) {
            console.error('Botón "Nueva" no encontrado');
            return;
        }
        // Limpiar pestañas existentes (excepto el botón)
        const tabs = notesTabsContainer.querySelectorAll('.note-tab');
        tabs.forEach(tab => {
            const id = tab.dataset.tabId;
            const panel = document.getElementById(id);
            if (panel) panel.remove();
            tab.remove();
        });
        notesData.clear();

        // Cargar notas locales
        const hasLocal = cargarNotasLocal();

        // Si no hay notas locales, crear una por defecto
        if (!hasLocal || notesData.size === 0) {
            createNoteTab('Nota 1', '', false, null, true);
        }

        // Cargar filtros desde CSV
        cargarFiltrosDesdeCSV();

        // Cargar notas de Wix (después de un pequeño retraso para no bloquear)
        setTimeout(cargarNotasDesdeWix, 500);
    }

    // ========== EVENTOS DE BOTONES DE NOTAS ==========
    function getActiveNoteData() {
        const id = activeNoteTabId;
        if (!id) return null;
        const note = notesData.get(id);
        if (!note) return null;
        return {
            tabId: id,
            text: note.content,
            name: note.name,
            sync: note.sync,
            wixId: note.wixId
        };
    }

    // Botón "Nueva"
    if (addNoteTabBtn) {
        addNoteTabBtn.addEventListener('click', function() {
            createNoteTab(`Nota ${noteTabCounter}`, '', false, null, true);
        });
    }

    // Normalizar texto
    document.getElementById('normalizeNoteBtn').addEventListener('click', function() {
        const data = getActiveNoteData();
        if (!data) {
            document.getElementById('notesFeedback').textContent = '⚠️ No hay nota activa';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            return;
        }
        const rangeInput = document.getElementById('columnRangeInput');
        const rangeValue = rangeInput ? rangeInput.value.trim() : '*';
        let normalized = data.text;
        // Aplicar normalización (espacios, etc.)
        normalized = normalized.replace(/\t/g, ' ').replace(/-/g, ' ');
        normalized = normalized.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        // Aplicar rango de columnas
        if (rangeValue && rangeValue !== '*') {
            normalized = extraerColumnas(normalized, rangeValue);
        }
        const note = notesData.get(data.tabId);
        if (note) {
            note.content = normalized;
            note.textarea.value = normalized;
            guardarNotasLocal();
            document.getElementById('notesFeedback').textContent = '✅ Normalizado' + (rangeValue !== '*' ? ' (columnas: ' + rangeValue + ')' : '');
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 3000);
        }
    });

    // Copiar nota
    document.getElementById('copyNoteBtn').addEventListener('click', function() {
        const data = getActiveNoteData();
        if (!data || !data.text.trim()) {
            document.getElementById('notesFeedback').textContent = '⚠️ No hay texto para copiar';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            return;
        }
        navigator.clipboard.writeText(data.text).then(() => {
            document.getElementById('notesFeedback').textContent = '✅ Copiado al portapapeles';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
        }).catch(() => {
            document.getElementById('notesFeedback').textContent = '❌ Error al copiar';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
        });
    });

    // Descargar nota
    document.getElementById('downloadNoteBtn').addEventListener('click', function() {
        const data = getActiveNoteData();
        if (!data || !data.text.trim()) {
            document.getElementById('notesFeedback').textContent = '⚠️ No hay texto para descargar';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            return;
        }
        const blob = new Blob([data.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `${data.name.toLowerCase().replace(/\s+/g, '_')}.txt`;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('notesFeedback').textContent = `✅ Descargado: ${filename}`;
        setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 3000);
    });

    // Botón "Sync" (subir a Wix)
    document.getElementById('syncNoteBtn').addEventListener('click', function() {
        subirNotaActualAWix();
    });

    // Botón "Recargar" (descargar desde Wix)
    document.getElementById('reloadNoteBtn').addEventListener('click', function() {
        recargarNotaActualDesdeWix();
    });

    // Botón "Aplicar rango"
    document.getElementById('applyRangeBtn').addEventListener('click', function() {
        const data = getActiveNoteData();
        if (!data) {
            document.getElementById('notesFeedback').textContent = '⚠️ No hay nota activa';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            return;
        }
        const rangeInput = document.getElementById('columnRangeInput');
        const rangeValue = rangeInput ? rangeInput.value.trim() : '*';
        if (!rangeValue || rangeValue === '*') {
            document.getElementById('notesFeedback').textContent = 'ℹ️ Usando todas las columnas';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 1500);
            return;
        }
        const note = notesData.get(data.tabId);
        if (note) {
            const result = extraerColumnas(note.content, rangeValue);
            note.content = result;
            note.textarea.value = result;
            guardarNotasLocal();
            document.getElementById('notesFeedback').textContent = '✅ Columnas aplicadas: ' + rangeValue;
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
        }
    });

    // Guardar rango en localStorage
    document.getElementById('columnRangeInput').addEventListener('change', function() {
        localStorage.setItem('columnRange', this.value);
    });
    const savedRange = localStorage.getItem('columnRange');
    if (savedRange && document.getElementById('columnRangeInput')) {
        document.getElementById('columnRangeInput').value = savedRange;
    }

    // Enter en campo rango
    document.getElementById('columnRangeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('applyRangeBtn').click();
        }
    });

    // ========== FUNCIÓN AUXILIAR PARA EXTRAER COLUMNAS (reutilizada) ==========
    function parsearRangoColumnas(rangoStr) {
        if (!rangoStr || rangoStr.trim() === '' || rangoStr.trim() === '*') {
            return null;
        }
        const columnas = new Set();
        const partes = rangoStr.split(',').map(p => p.trim());
        for (const parte of partes) {
            if (parte.includes('-')) {
                const [inicio, fin] = parte.split('-').map(Number);
                if (!isNaN(inicio) && !isNaN(fin) && inicio > 0 && fin >= inicio) {
                    for (let i = inicio; i <= fin; i++) {
                        columnas.add(i);
                    }
                }
            } else {
                const num = Number(parte);
                if (!isNaN(num) && num > 0) {
                    columnas.add(num);
                }
            }
        }
        return columnas.size > 0 ? columnas : null;
    }

    function extraerColumnas(texto, rangoStr) {
        if (!texto) return '';
        const columnasSet = parsearRangoColumnas(rangoStr);
        if (columnasSet === null) return texto;
        const lineas = texto.split('\n');
        const resultado = [];
        for (const linea of lineas) {
            if (!linea.trim()) {
                resultado.push('');
                continue;
            }
            const tokens = linea.split(/\s+/).filter(t => t !== '');
            if (tokens.length === 0) {
                resultado.push('');
                continue;
            }
            const columnasOrdenadas = Array.from(columnasSet).sort((a, b) => a - b);
            const tokensSeleccionados = [];
            for (const col of columnasOrdenadas) {
                const idx = col - 1;
                if (idx < tokens.length) {
                    tokensSeleccionados.push(tokens[idx]);
                }
            }
            resultado.push(tokensSeleccionados.join(' '));
        }
        return resultado.join('\n');
    }

    // ========== INICIALIZAR ==========
    if (document.readyState === 'complete') {
        initNotes();
    } else {
        document.addEventListener('DOMContentLoaded', initNotes);
    }

    // Restaurar estado desde hash
    setTimeout(restoreFromHash, 150);

    // Exponer funciones de notas globalmente para depuración
    window.notesData = notesData;
    window.createNoteTab = createNoteTab;
    window.activarNota = activarNota;
})();