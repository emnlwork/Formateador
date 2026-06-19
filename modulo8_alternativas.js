// Módulo Código Alternativas - Generador de códigos EAN-13 desde biblioteca CSV (con tabs)
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab8');
    if (!container) return;

    // Obtener biblioteca del core (ya cargada silenciosamente)
    function getBiblioteca() {
        return core.obtenerBiblioteca() || [];
    }

    function bibliotecaCargada() {
        return getBiblioteca().length > 0;
    }

    function actualizarStatusGlobal() {
        const status = document.getElementById('bibliotecaStatusGlobal');
        const lib = getBiblioteca();
        if (lib.length > 0) {
            status.textContent = `✅ ${lib.length} registros cargados`;
            status.style.color = '#2ecc71';
        } else {
            status.textContent = '⚠️ Sin datos cargados. Usa "Cargar biblioteca" o "Recargar desde root"';
            status.style.color = '#f1c40f';
        }
    }

    // ==================== PESTAÑAS DINÁMICAS ====================
    let alternativasTabCounter = 1;
    let activeAlternativasTabId = 'alt_tab_0';

    function getAlternativasPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="alternativas-panel" style="display:none; padding-top:0.5rem;">
                <div style="margin:0.5rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <h4><i class="fas fa-keyboard"></i> Ingresar códigos</h4>
                    <div class="row">
                        <label><b>Formato por línea:</b> <code>CODIGO_BASE LINEA TIPO TALLA [CANTIDAD]</code></label>
                        <label style="margin-left:1rem;"><b>O CSV con cabecera:</b> <code>CODIGO_BASE,LINEA,TIPO,TALLA,CANTIDAD</code></label>
                    </div>
                    <textarea class="alternativas-input" rows="6" placeholder="Ejemplo:&#10;27605 NA SLI 27 3&#10;2558 NE TLI 25 2&#10;96740 NE SLI 24.5 1"></textarea>
                    <div class="row" style="margin-top:0.5rem;">
                        <button class="generarCodigosBtn btn-primary"><i class="fas fa-play"></i> Generar códigos</button>
                        <button class="copiarResultadosBtn btn-secondary"><i class="fas fa-copy"></i> Copiar códigos</button>
                        <button class="descargarAhkBtn btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                        <input type="text" class="alternativasFilename" placeholder="Nombre del script" value="codigos" style="width:150px;">
                    </div>
                </div>

                <div class="alternativasMessage message"></div>
                <div class="alternativasOutput output-area" style="max-height:400px; overflow:auto;"></div>
                <div class="instructions-box" style="margin-top:0.5rem;">
                    <b><i class="fas fa-info-circle"></i> Detalles técnicos</b><br>
                    - El código de 9 dígitos se busca en la biblioteca por los primeros 5 dígitos.<br>
                    - La talla se formatea a 3 dígitos: 27 → 270, 24.5 → 245.<br>
                    - El dígito de control se calcula con el algoritmo EAN-13.<br>
                    - El script AHK usa el hotkey <kbd>Ctrl+Shift+N</kbd>.
                </div>
            </div>
        `;
    }

    function createAlternativasTab(tabName = null) {
        const tabId = `alt_tab_${alternativasTabCounter}`;
        const tabTitle = tabName || `Pestaña ${alternativasTabCounter}`;
        const tabsContainer = document.getElementById('alternativasTabsContainer');
        const addBtn = document.getElementById('addAlternativasTabBtn');
        
        const tabButton = document.createElement('div');
        tabButton.className = 'alternativas-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(tabTitle)}</span><span class="tab-close" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);

        const panelsContainer = document.getElementById('alternativasPanelsContainer');
        const panelHtml = getAlternativasPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);

        initAlternativasTabEvents(tabId);

        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'alt_tab_0') closeBtn.style.display = 'none';
        else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeAlternativasTabId === tabId) {
                    const firstTab = document.querySelector('#alternativasTabsContainer .alternativas-tab');
                    if (firstTab) firstTab.click();
                }
            });
        }

        const nameSpan = tabButton.querySelector('.tab-name');
        nameSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const oldName = nameSpan.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldName;
            input.style.width = 'auto';
            input.style.minWidth = '60px';
            input.style.background = 'var(--blud)';
            input.style.color = 'var(--white)';
            input.style.border = '1px solid var(--blu)';
            input.style.borderRadius = '3px';
            input.style.padding = '0 2px';
            nameSpan.style.display = 'none';
            nameSpan.parentNode.insertBefore(input, nameSpan);
            input.focus();
            input.select();
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || oldName;
                nameSpan.textContent = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });

        tabButton.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('#alternativasTabsContainer .alternativas-tab').forEach(t => t.classList.remove('active'));
            tabButton.classList.add('active');
            document.querySelectorAll('#alternativasPanelsContainer .alternativas-panel').forEach(p => p.style.display = 'none');
            panel.style.display = 'block';
            activeAlternativasTabId = tabId;
        });

        const existingTabs = document.querySelectorAll('#alternativasTabsContainer .alternativas-tab');
        if (existingTabs.length === 1) tabButton.click();
        alternativasTabCounter++;
    }

    function initAlternativasTabEvents(tabId) {
        const panel = document.getElementById(tabId);
        if (!panel) return;

        const inputTextarea = panel.querySelector('.alternativas-input');
        const messageDiv = panel.querySelector('.alternativasMessage');
        const outputDiv = panel.querySelector('.alternativasOutput');
        const filenameInput = panel.querySelector('.alternativasFilename');

        let resultadosGenerados = [];

        function generarCodigosDesdeEntrada(entrada) {
            const lib = getBiblioteca();
            if (lib.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Primero carga la biblioteca (codeLibrary.csv). Usa el botón "Cargar biblioteca" o "Recargar desde root".';
                return;
            }
            if (!entrada.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ingresa al menos una línea de código.';
                return;
            }
            const items = core.parsearEntradaCodigoMultiple(entrada);
            if (items.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar la entrada. Revisa el formato.';
                return;
            }
            const resultados = [];
            let errores = 0;
            for (const item of items) {
                const encontrado = core.buscarCodigoEnBiblioteca(
                    item.codigoBase,
                    item.linea,
                    item.tipo,
                    lib
                );
                if (!encontrado) {
                    errores++;
                    continue;
                }
                const codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.talla);
                const verificado = core.verificarCodigoEAN13(codigoFinal);
                resultados.push({
                    entrada: `${item.codigoBase} ${item.linea} ${item.tipo} ${item.talla}`,
                    codigoBase: item.codigoBase,
                    linea: item.linea,
                    tipo: item.tipo,
                    talla: item.talla,
                    cantidad: item.cantidad,
                    codigoCompleto: encontrado.CODIGO,
                    codigoFinal: codigoFinal,
                    valido: verificado,
                    info: encontrado
                });
            }
            resultadosGenerados = resultados;
            mostrarResultados(resultados, outputDiv);
            if (resultados.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron coincidencias en la biblioteca.';
            } else {
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Procesados ${resultados.length} códigos. ${errores > 0 ? `⚠️ ${errores} errores.` : ''}`;
            }
        }

        function mostrarResultados(resultados, outputElement) {
            if (!resultados || resultados.length === 0) {
                outputElement.innerHTML = '<p>No hay resultados para mostrar.</p>';
                return;
            }
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr>';
            html += '<th>Entrada</th><th>Código Base</th><th>Línea</th><th>Tipo</th><th>Talla</th>';
            html += '<th>Cantidad</th><th>Código Final (13 dígitos)</th><th>Válido</th>';
            html += '</tr></thead><tbody>';
            for (const r of resultados) {
                const valido = r.valido ? '✅ Sí' : '❌ No';
                const validoColor = r.valido ? 'color:#2ecc71;' : 'color:#e74c3c;';
                html += `<tr>
                            <td style="max-width:150px; word-break:break-word;">${core.escapeHtml(r.entrada)}</td>
                            <td>${core.escapeHtml(r.codigoBase)}</td>
                            <td>${core.escapeHtml(r.linea)}</td>
                            <td>${core.escapeHtml(r.tipo)}</td>
                            <td>${core.escapeHtml(r.talla)}</td>
                            <td style="text-align:right;">${r.cantidad}</td>
                            <td style="font-weight:bold; font-family:monospace;">${core.escapeHtml(r.codigoFinal)}</td>
                            <td style="${validoColor}">${valido}</td>
                         </tr>`;
            }
            html += '</tbody></table>';
            outputElement.innerHTML = html;
        }

        function generarAHK() {
            if (resultadosGenerados.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos generados para crear el script.';
                return null;
            }
            let ahkContent = '#SingleInstance Force\n\n';
            ahkContent += '; Script generado desde Código Alternativas\n';
            ahkContent += `; ${resultadosGenerados.length} códigos\n\n`;
            ahkContent += '^+n::\n';
            for (const r of resultadosGenerados) {
                if (r.cantidad > 1) {
                    for (let i = 0; i < r.cantidad; i++) {
                        ahkContent += `    Send, ${r.codigoFinal}{Enter}\n`;
                    }
                } else {
                    ahkContent += `    Send, ${r.codigoFinal}{Enter}\n`;
                }
            }
            ahkContent += 'return';
            return ahkContent;
        }

        function descargarAHK() {
            const content = generarAHK();
            if (!content) return;
            const nombreBase = filenameInput.value.trim() || 'codigos';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombreBase}.ahk`;
            a.click();
            URL.revokeObjectURL(url);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Script AHK descargado.`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        }

        function copiarResultados() {
            if (resultadosGenerados.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para copiar.';
                return;
            }
            let texto = '';
            for (const r of resultadosGenerados) {
                texto += r.codigoFinal + '\n';
            }
            navigator.clipboard.writeText(texto).then(() => {
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${resultadosGenerados.length} códigos copiados al portapapeles.`;
                setTimeout(() => { if (messageDiv.innerHTML.includes('copiados')) messageDiv.innerHTML = ''; }, 3000);
            }).catch(() => {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al copiar.';
            });
        }

        function limpiarPestana() {
            resultadosGenerados = [];
            if (inputTextarea) inputTextarea.value = '';
            if (outputDiv) outputDiv.innerHTML = '';
            if (messageDiv) messageDiv.innerHTML = '';
        }

        const genBtn = panel.querySelector('.generarCodigosBtn');
        const copyBtn = panel.querySelector('.copiarResultadosBtn');
        const dlBtn = panel.querySelector('.descargarAhkBtn');

        if (genBtn) genBtn.addEventListener('click', () => {
            generarCodigosDesdeEntrada(inputTextarea.value);
        });
        if (copyBtn) copyBtn.addEventListener('click', copiarResultados);
        if (dlBtn) dlBtn.addEventListener('click', descargarAHK);
    }

    // ==================== RENDER HTML PRINCIPAL ====================
    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-shoe-prints"></i> Código Alternativas</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar todo</button>
            </div>
            <div class="instructions-box" style="margin-bottom:1rem;">
                <b><i class="fas fa-info-circle"></i> Instrucciones</b><br>
                1. La biblioteca <code>codeLibrary.csv</code> se carga automáticamente desde la carpeta raíz al iniciar.<br>
                2. Si no se carga, usa el botón "Recargar desde root" o pega el contenido manualmente.<br>
                3. Cada pestaña es independiente. Ingresa líneas con formato: <code>CODIGO_BASE LINEA TIPO TALLA [CANTIDAD]</code><br>
                4. Ejemplo: <code>27605 NA SLI 27 3</code> → genera código EAN-13 con 3 repeticiones.<br>
                5. También acepta CSV con cabecera: <code>CODIGO_BASE,LINEA,TIPO,TALLA,CANTIDAD</code>
            </div>

            <!-- Carga de biblioteca -->
            <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                <h4><i class="fas fa-database"></i> Biblioteca de códigos</h4>
                <div class="row">
                    <textarea id="bibliotecaInputGlobal" class="biblioteca-textarea" rows="4" placeholder="Pega aquí el contenido de codeLibrary.csv (columnas: CODIGO, MODELO, LINEA, TIPO)..."></textarea>
                </div>
                <div class="row">
                    <button id="cargarBibliotecaBtnGlobal" class="btn-primary"><i class="fas fa-upload"></i> Cargar biblioteca</button>
                    <button id="uploadBibliotecaBtnGlobal" class="btn-secondary"><i class="fas fa-folder-open"></i> Subir archivo CSV</button>
                    <input type="file" id="bibliotecaFileGlobal" accept=".csv" style="display:none;">
                    <span id="bibliotecaStatusGlobal" style="margin-left:1rem;">⏳ Cargando...</span>
                    <button id="recargarBibliotecaBtn" class="btn-secondary" style="background:#444;"><i class="fas fa-sync"></i> Recargar desde root</button>
                </div>
            </div>

            <!-- Pestañas de entrada -->
            <div style="margin:1rem 0;">
                <div class="alternativas-tabs-container">
                    <div class="alternativas-tabs" id="alternativasTabsContainer"></div>
                    <button id="addAlternativasTabBtn" class="add-tab-btn"><i class="fas fa-plus"></i> Nueva pestaña</button>
                </div>
                <div id="alternativasPanelsContainer" style="margin-top:0.5rem;"></div>
            </div>
        </div>
    `;

    // ==================== ESTILOS PARA PESTAÑAS ====================
    const style = document.createElement('style');
    style.textContent = `
        .alternativas-tabs-container {
            margin-bottom: 0.5rem;
        }
        .alternativas-tabs {
            display: flex;
            gap: 0.2rem;
            flex-wrap: wrap;
            border-bottom: 1px solid var(--blub);
            padding-bottom: 0.2rem;
            margin-bottom: 0.3rem;
        }
        .alternativas-tab {
            background: var(--blub);
            border: 1px solid var(--blu);
            border-radius: 5px 5px 0 0;
            padding: 0.3rem 0.8rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }
        .alternativas-tab.active {
            background: var(--blu);
            color: white;
        }
        .alternativas-tab .tab-name {
            font-size: 0.85rem;
        }
        .alternativas-tab .tab-close {
            color: #ff8888;
            font-size: 0.8rem;
            cursor: pointer;
            margin-left: 0.3rem;
        }
        .add-tab-btn {
            background: var(--rr);
            border: 1px solid var(--rr);
            border-radius: 5px;
            padding: 0.3rem 0.8rem;
            cursor: pointer;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            color: white;
        }
        .add-tab-btn:hover {
            background: var(--rl);
        }
        .alternativas-panel {
            display: none;
        }
        .alternativas-panel.active {
            display: block;
        }
    `;
    document.head.appendChild(style);

    // ==================== EVENTOS GLOBALES ====================

    document.getElementById('cargarBibliotecaBtnGlobal').addEventListener('click', () => {
        const texto = document.getElementById('bibliotecaInputGlobal').value;
        core.cargarBibliotecaDesdeCSV(texto);
        actualizarStatusGlobal();
    });

    core.setupFileUpload('uploadBibliotecaBtnGlobal', 'bibliotecaFileGlobal', 'bibliotecaInputGlobal');

    document.getElementById('recargarBibliotecaBtn').addEventListener('click', () => {
        document.getElementById('bibliotecaStatusGlobal').textContent = '⏳ Recargando...';
        core.cargarBibliotecaDesdeRoot().then(() => {
            actualizarStatusGlobal();
        });
    });

    document.getElementById('bibliotecaInputGlobal').addEventListener('change', () => {
        const texto = document.getElementById('bibliotecaInputGlobal').value;
        if (texto.trim()) {
            core.cargarBibliotecaDesdeCSV(texto);
            actualizarStatusGlobal();
        }
    });

    // ==================== INICIALIZAR PESTAÑAS ====================
    const tabsContainer = document.getElementById('alternativasTabsContainer');
    const addBtn = document.createElement('div');
    addBtn.id = 'addAlternativasTabBtn';
    addBtn.className = 'add-tab-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestaña';
    tabsContainer.appendChild(addBtn);
    addBtn.addEventListener('click', () => createAlternativasTab());

    createAlternativasTab('Principal');

    // ==================== LIMPIAR TODO ====================
    const clearBtn = container.querySelector('.clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.alternativas-panel').forEach(panel => {
                const input = panel.querySelector('.alternativas-input');
                const output = panel.querySelector('.alternativasOutput');
                const msg = panel.querySelector('.alternativasMessage');
                if (input) input.value = '';
                if (output) output.innerHTML = '';
                if (msg) msg.innerHTML = '';
            });
            document.getElementById('bibliotecaInputGlobal').value = '';
            // No borramos la biblioteca global, solo el textarea
            actualizarStatusGlobal();
        });
    }

    // ==================== ACTUALIZAR STATUS AL INICIO ====================
    // Esperar un momento para que core cargue la biblioteca
    setTimeout(() => {
        actualizarStatusGlobal();
    }, 500);

    // También actualizar cuando cambie la biblioteca (si se recarga desde core)
    // No podemos escuchar cambios directos, pero el usuario puede recargar manualmente

    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab8') {
            // La pestaña principal ya está activa
        }
    });
})();