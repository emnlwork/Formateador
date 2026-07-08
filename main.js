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
        alert(`Versión actual: ${VERSION}\n\nCambios:\n- Notas con pestañas (crear, renombrar, eliminar)\n- Normalizar texto en notas\n- Copiar y descargar notas\n- Botón "Limpiar todo" eliminado.\n- Varias correcciones de estabilidad.`);
    });

    // Versión del Core
    const coreVersionElement = document.getElementById('coreVersionDisplay');
    if (coreVersionElement) {
        coreVersionElement.textContent = window.coreVersion || '3.3';
    }

    // ==================== NOTAS CON PESTAÑAS ====================
    let noteTabCounter = 1;
    let activeNoteTabId = 'note_tab_0';

    // Función para obtener HTML de una pestaña de notas
    function getNotePanelHTML(tabId) {
        return `
            <div id="${tabId}" class="note-panel" style="display:none;">
                <textarea class="note-textarea" rows="2" placeholder="Notas / Apuntes (este texto no se borra al limpiar)" style="width:100%; resize:vertical; font-size:0.8rem; background:var(--blud); color:var(--white); border:1px solid var(--blu); border-radius:4px; padding:0.3rem 0.5rem;"></textarea>
            </div>
        `;
    }

    // Función para normalizar texto (mantiene saltos de línea)
    function normalizarTexto(texto) {
        if (!texto) return '';
        let result = texto.replace(/\t/g, ' ');
        result = result.replace(/-/g, ' ');
        result = result.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        return result;
    }

    // Función para guardar notas en localStorage
    function guardarNotas() {
        const panels = document.querySelectorAll('#notesPanelsContainer .note-panel');
        const data = {};
        panels.forEach(panel => {
            const tabId = panel.id;
            const textarea = panel.querySelector('.note-textarea');
            const tabBtn = document.querySelector(`.note-tab[data-tab-id="${tabId}"]`);
            if (textarea && tabBtn) {
                const nameSpan = tabBtn.querySelector('.tab-name');
                data[tabId] = {
                    text: textarea.value,
                    name: nameSpan ? nameSpan.textContent : 'Nota'
                };
            }
        });
        localStorage.setItem('notesData', JSON.stringify(data));
    }

    // Función para cargar notas desde localStorage
    function cargarNotas() {
        const saved = localStorage.getItem('notesData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const tabIds = Object.keys(data);
                if (tabIds.length === 0) return false;
                
                const existingTabs = document.querySelectorAll('#notesTabsContainer .note-tab');
                existingTabs.forEach(tab => {
                    const tabId = tab.dataset.tabId;
                    const panel = document.getElementById(tabId);
                    if (panel) panel.remove();
                    tab.remove();
                });
                
                let first = true;
                for (const [tabId, info] of Object.entries(data)) {
                    createNoteTab(info.name || 'Nota', info.text || '', tabId, first);
                    first = false;
                }
                return true;
            } catch (e) {
                console.warn('Error cargando notas:', e);
                return false;
            }
        }
        return false;
    }

    // Función para crear una pestaña de notas
    function createNoteTab(tabName = null, content = '', tabId = null, activate = true) {
        const id = tabId || `note_tab_${noteTabCounter}`;
        const title = tabName || `Nota ${noteTabCounter}`;
        
        const tabsContainer = document.getElementById('notesTabsContainer');
        const addBtn = document.getElementById('addNoteTabBtn');
        
        const tabButton = document.createElement('div');
        tabButton.className = 'note-tab';
        tabButton.setAttribute('data-tab-id', id);
        tabButton.style.cssText = 'background:var(--blub); border:1px solid var(--blu); border-radius:3px 3px 0 0; padding:0.1rem 0.5rem; cursor:pointer; display:flex; align-items:center; gap:0.3rem; transition:all 0.2s; font-size:0.7rem;';
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(title)}</span><span class="tab-close" style="color:#ff8888; font-size:0.6rem; cursor:pointer; margin-left:0.2rem;" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        
        const panelsContainer = document.getElementById('notesPanelsContainer');
        const panelHtml = getNotePanelHTML(id);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        
        if (content) {
            const textarea = panel.querySelector('.note-textarea');
            if (textarea) textarea.value = content;
        }
        
        const closeBtn = tabButton.querySelector('.tab-close');
        const existingTabs = document.querySelectorAll('#notesTabsContainer .note-tab');
        if (existingTabs.length <= 1) {
            closeBtn.style.display = 'none';
        } else {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const remainingTabs = document.querySelectorAll('#notesTabsContainer .note-tab');
                if (remainingTabs.length <= 1) return;
                tabButton.remove();
                panel.remove();
                guardarNotas();
                const firstTab = document.querySelector('#notesTabsContainer .note-tab');
                if (firstTab) firstTab.click();
            });
        }
        
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
                nameSpan.style.display = '';
                this.remove();
                guardarNotas();
            });
            input.addEventListener('keypress', function(e) { if (e.key === 'Enter') this.blur(); });
        });
        
        tabButton.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('#notesTabsContainer .note-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'var(--blub)';
            });
            this.classList.add('active');
            this.style.background = 'var(--blu)';
            document.querySelectorAll('#notesPanelsContainer .note-panel').forEach(p => p.style.display = 'none');
            panel.style.display = 'block';
            activeNoteTabId = id;
        });
        
        const textarea = panel.querySelector('.note-textarea');
        textarea.addEventListener('input', guardarNotas);
        
        if (activate || document.querySelectorAll('#notesTabsContainer .note-tab').length === 1) {
            tabButton.click();
        }
        
        if (!tabId) noteTabCounter++;
        return id;
    }

    // Inicializar notas
    function initNotes() {
        const tabsContainer = document.getElementById('notesTabsContainer');
        const addBtn = document.getElementById('addNoteTabBtn');
        
        while (tabsContainer.firstChild && tabsContainer.firstChild !== addBtn) {
            tabsContainer.removeChild(tabsContainer.firstChild);
        }
        
        const hasSaved = cargarNotas();
        
        if (!hasSaved) {
            createNoteTab('Nota 1', '');
        }
        
        addBtn.addEventListener('click', function() {
            const count = document.querySelectorAll('#notesTabsContainer .note-tab').length + 1;
            createNoteTab(`Nota ${count}`, '');
            const tabs = document.querySelectorAll('#notesTabsContainer .note-tab');
            tabs.forEach(tab => {
                const close = tab.querySelector('.tab-close');
                if (close) close.style.display = tabs.length > 1 ? '' : 'none';
            });
        });
    }

    // ==================== BOTONES DE NOTAS ====================
    function getActiveNoteData() {
        const activeTab = document.querySelector('#notesTabsContainer .note-tab.active');
        if (!activeTab) return null;
        const tabId = activeTab.dataset.tabId;
        const panel = document.getElementById(tabId);
        if (!panel) return null;
        const textarea = panel.querySelector('.note-textarea');
        const nameSpan = activeTab.querySelector('.tab-name');
        return {
            tabId: tabId,
            text: textarea ? textarea.value : '',
            name: nameSpan ? nameSpan.textContent : 'Nota'
        };
    }

    document.getElementById('normalizeNoteBtn').addEventListener('click', function() {
        const data = getActiveNoteData();
        if (!data) {
            document.getElementById('notesFeedback').textContent = '⚠️ No hay nota activa';
            setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            return;
        }
        const normalized = normalizarTexto(data.text);
        const panel = document.getElementById(data.tabId);
        if (panel) {
            const textarea = panel.querySelector('.note-textarea');
            if (textarea) {
                textarea.value = normalized;
                guardarNotas();
                document.getElementById('notesFeedback').textContent = '✅ Normalizado';
                setTimeout(() => { document.getElementById('notesFeedback').textContent = ''; }, 2000);
            }
        }
    });

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

    // ==================== INICIALIZAR ====================
    // Inicializar notas cuando el DOM esté listo
    if (document.readyState === 'complete') {
        initNotes();
    } else {
        document.addEventListener('DOMContentLoaded', initNotes);
    }

    // Restaurar estado desde el hash después de que todos los módulos se hayan inicializado
    setTimeout(() => {
        restoreFromHash();
    }, 150);
})();