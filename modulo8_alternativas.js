// Módulo Código Alternativas - Generador de códigos EAN-13
(function() {
    const core = window.core;
    if (!core) return;

    const tabContainer = document.getElementById('tab8');
    if (!tabContainer) return;

    function getBiblioteca() {
        return core.obtenerBiblioteca() || [];
    }

    tabContainer.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-shoe-prints"></i> Código Alternativas (EAN-13)</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="sub-module-tabs" id="alternativasSubTabs">
                <div class="sub-module-tab active" data-submode="generador">Generador</div>
                <div class="sub-module-tab" data-submode="reversa">Modo Reversa</div>
            </div>
            
            <div id="alternativasGenerador" class="sub-panel active">
                <div id="alternativasMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Generador EAN-13</b><br>
                    1. Cada pestaña es independiente. Crea nuevas con el botón <span style="color:#ff8888;">➕</span>.<br>
                    2. Formato: <code>MODELO LINEA TIPO TALLA [CANTIDAD]</code><br>
                    3. Ejemplo: <code>2558 NE TXS 25 3</code> → genera 3 códigos EAN-13.<br>
                    4. La biblioteca se carga automáticamente desde <code>codeLibrary.csv</code>.<br>
                    5. También acepta CSV con cabecera: <code>MODELO,LINEA,TIPO,TALLA,CANTIDAD</code><br>
                    6. <b>MODO TICKET:</b> copia/descarga solo CODIGO_FINAL y CANTIDAD.
                </div>
            </div>
            
            <div id="alternativasReversa" class="sub-panel">
                <div id="reversaMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Modo Reversa</b><br>
                    1. Pega códigos EAN-13 de 13 dígitos para decodificar.<br>
                    2. La búsqueda se hace contra <code>codeLibrary.csv</code>.
                </div>
            </div>
        </div>
    `;

    // ==================== SUBMÓDULO GENERADOR ====================
    let generadorTabCounter = 1;
    let activeGeneradorTabId = 'gen_tab_0';

    function getGeneradorPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="generador-panel">
                <div class="toggle-group" id="genMainToggle_${tabId}" style="margin-bottom:0.8rem;">
                    <span class="toggle-option active-toggle" data-op="sumar">➕ SUMAR</span>
                    <span class="toggle-option" data-op="restar">➖ RESTAR</span>
                </div>
                <div class="row"><label><b>Nombre Maestro:</b></label><input type="text" class="mainMaestroName" value="MAESTRO" style="width:150px;"></div>
                <label class="form-label"><b>Códigos Maestro:</b></label>
                <textarea class="mainMaestroInput" placeholder="Pega los códigos (formato: MODELO LINEA TIPO TALLA [CANTIDAD])..." rows="4"></textarea>
                <div class="row"><button class="uploadMainMaestroBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="mainMaestroFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
                <div style="margin:0.5rem 0;">
                    <b>Códigos adicionales:</b> 
                    <button class="addMainFolioBtn"><i class="fas fa-plus"></i> Agregar código</button>
                    <input type="number" class="addMultipleFoliosInput" value="1" min="1" max="50" style="width:70px; text-align:center;">
                    <button class="addMultipleFoliosBtn"><i class="fas fa-plus-circle"></i> Agregar N códigos</button>
                    <button class="importMultipleCsvBtn" style="margin-left:0.5rem;"><i class="fas fa-file-import"></i> Importar múltiples CSV</button>
                    <input type="file" class="importMultipleFileInput" accept=".csv,.txt,text/plain" multiple style="display:none;">
                    <button class="removeAllFoliosBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-trash-alt"></i> Borrar todos los códigos adicionales</button>
                </div>
                <div class="mainFoliosContainer"></div>
                <div class="row" style="margin-top:0.5rem;"><input type="checkbox" class="mainTicketMode"><label class="mainTicketModeLabel">MODO TICKET (solo CODIGO_FINAL y CANTIDAD)</label></div>
                
                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="tipoOrigen" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="escaneo">escaneo</option>
                            <option value="existencia">existencia</option>
                        </select>
                        <select id="tipoUbicacion" style="width:150px;">
                            <option value="">(seleccionar)</option>
                            <option value="BODEGA">BODEGA</option>
                            <option value="AUTOSERVICIO">AUTOSERVICIO</option>
                            <option value="PISOGENERAL">PISOGENERAL</option>
                            <option value="VENTARESERVADA">VENTARESERVADA</option>
                            <option value="SUMINISTROS">SUMINISTROS</option>
                            <option value="INTEGRACION">INTEGRACION</option>
                            <option value="EMBARQUES">EMBARQUES</option>
                            <option value="CAMBIOS">CAMBIOS</option>
                            <option value="DEFECTOS">DEFECTOS</option>
                            <option value="SALA">SALA</option>
                            <option value="TRAF">TRAF</option>
                            <option value="POR ACLARAR">POR ACLARAR</option>
                        </select>
                        <select id="tipoCategoria" style="width:120px;">
                            <option value="">(seleccionar)</option>
                            <option value="home">home</option>
                            <option value="calzado">calzado</option>
                            <option value="ropa">ropa</option>
                            <option value="catalogos">catalogos</option>
                        </select>
                        <input type="text" id="nombrePersonalizado" placeholder="Personalizado" style="width:130px;">
                        <input type="text" id="sufijoAdicional" placeholder="Sufijo extra" style="width:100px;">
                    </div>
                </div>
                
                <div class="row">
                    <button class="processMainBtn btn-primary"><i class="fas fa-play"></i> Procesar</button>
                    <button class="copyMainTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button class="copyMainCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" class="mainFilename" value="codigos.csv" style="width:190px;">
                    <button class="downloadMainBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback"></span>
                </div>
                <div class="row">
                    <button class="downloadAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button class="copyAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    function initGeneradorPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const toggleOptions = panel.querySelectorAll('#genMainToggle_' + panelId + ' .toggle-option');
        let mainOp = 'sumar';
        toggleOptions.forEach(opt => {
            opt.addEventListener('click', function() {
                toggleOptions.forEach(o => o.classList.remove('active-toggle'));
                this.classList.add('active-toggle');
                mainOp = this.dataset.op;
            });
        });

        const addFolioBtn = panel.querySelector('.addMainFolioBtn');
        const addMultipleBtn = panel.querySelector('.addMultipleFoliosBtn');
        const multipleCountInput = panel.querySelector('.addMultipleFoliosInput');
        const removeAllBtn = panel.querySelector('.removeAllFoliosBtn');
        const foliosContainer = panel.querySelector('.mainFoliosContainer');
        const importMultipleBtn = panel.querySelector('.importMultipleCsvBtn');
        const importFileInput = panel.querySelector('.importMultipleFileInput');

        function crearFolioAdicional(nombreBase = 'ADICIONAL', contenidoInicial = '') {
            const div = document.createElement('div'); 
            div.className = 'row';
            div.style.marginBottom = '0.5rem';
            div.innerHTML = `<b>Nombre:</b> <input type="text" class="folio-name-input" value="${nombreBase}" style="width:120px;"> 
                             <textarea rows="2" style="flex:1;"></textarea>
                             <button class="btn-danger remove-folio"><i class="fas fa-trash"></i></button>
                             <button class="upload-csv-btn"><i class="fas fa-folder-open"></i></button><input type="file" accept=".csv,.txt,text/plain" style="display:none;">`;
            foliosContainer.appendChild(div);
            const nameInput = div.querySelector('.folio-name-input');
            const upBtn = div.querySelector('.upload-csv-btn'), fileInp = div.querySelector('input[type="file"]'), ta = div.querySelector('textarea');
            upBtn.addEventListener('click', () => fileInp.click());
            fileInp.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; }; r.readAsText(f); });
            if (contenidoInicial) ta.value = contenidoInicial;
            const currentCount = foliosContainer.children.length;
            nameInput.value = `${nombreBase}${currentCount}`;
            return div;
        }

        addFolioBtn.addEventListener('click', () => { crearFolioAdicional('ADICIONAL'); });
        addMultipleBtn.addEventListener('click', () => {
            let count = parseInt(multipleCountInput.value);
            if (isNaN(count) || count < 1) count = 1;
            if (count > 50) count = 50;
            for (let i = 0; i < count; i++) crearFolioAdicional('ADICIONAL');
        });
        removeAllBtn.addEventListener('click', () => {
            while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
        });

        importMultipleBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            const messageDiv = panel.querySelector('.message');
            let processed = 0;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const contenido = ev.target.result;
                    crearFolioAdicional('ADICIONAL', contenido);
                    processed++;
                    if (processed === files.length) {
                        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Se importaron ${processed} archivos.`;
                        setTimeout(() => { if (messageDiv.innerHTML.includes('importaron')) messageDiv.innerHTML = ''; }, 3000);
                        importFileInput.value = '';
                    }
                };
                reader.onerror = () => {
                    processed++;
                    if (processed === files.length) importFileInput.value = '';
                };
                reader.readAsText(file, 'UTF-8');
            });
        });

        const uploadBtn = panel.querySelector('.uploadMainMaestroBtn');
        const fileInput = panel.querySelector('.mainMaestroFile');
        const maestroTextarea = panel.querySelector('.mainMaestroInput');
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { maestroTextarea.value = ev.target.result; fileInput.value = ''; }; r.readAsText(f); });

        const processBtn = panel.querySelector('.processMainBtn');
        const ticketCheckbox = panel.querySelector('.mainTicketMode');
        const filenameInput = panel.querySelector('.mainFilename');
        const copyFeedbackSpan = panel.querySelector('.copy-feedback');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');
        const downloadAhkBtn = panel.querySelector('.downloadAhkBtn');
        const copyAhkBtn = panel.querySelector('.copyAhkBtn');

        function construirNombreConDropdowns() {
            const tipoOrigen = panel.querySelector('#tipoOrigen')?.value || '';
            const tipoUbicacion = panel.querySelector('#tipoUbicacion')?.value || '';
            const tipoCategoria = panel.querySelector('#tipoCategoria')?.value || '';
            const nombrePersonalizado = panel.querySelector('#nombrePersonalizado')?.value || '';
            const sufijoAdicional = panel.querySelector('#sufijoAdicional')?.value || '';
            let base = '';
            if (tipoOrigen) base += tipoOrigen;
            if (tipoUbicacion) base += tipoUbicacion;
            if (tipoCategoria) base += tipoCategoria;
            if (nombrePersonalizado) base += nombrePersonalizado;
            if (sufijoAdicional) base += sufijoAdicional;
            if (!base) return null;
            return base;
        }

        function actualizarNombreArchivo() {
            const nombreBase = construirNombreConDropdowns();
            if (nombreBase) filenameInput.value = `${nombreBase}.csv`;
            else filenameInput.value = 'codigos.csv';
        }
        const selects = panel.querySelectorAll('#tipoOrigen, #tipoUbicacion, #tipoCategoria, #nombrePersonalizado, #sufijoAdicional');
        selects.forEach(el => el.addEventListener('input', actualizarNombreArchivo));
        actualizarNombreArchivo();

        function procesarEntrada(texto) {
            const lib = getBiblioteca();
            if (lib.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> La biblioteca no está cargada. Asegúrate de que codeLibrary.csv esté en el root.';
                return null;
            }
            if (!texto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para procesar.';
                return null;
            }
            const items = core.parsearEntradaCodigoMultiple(texto);
            if (items.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar la entrada. Revisa el formato.';
                return null;
            }
            const resultados = [];
            let errores = 0;
            for (const item of items) {
                const encontrado = core.buscarCodigoEnBiblioteca(item.modelo, item.linea, item.tipo, lib);
                if (!encontrado) {
                    errores++;
                    continue;
                }
                const codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.talla);
                const valido = core.verificarCodigoEAN13(codigoFinal);
                resultados.push({
                    MODELO: item.modelo,
                    LINEA: item.linea,
                    TIPO: item.tipo,
                    TALLA: item.talla,
                    CANTIDAD: item.cantidad,
                    CODIGO_COMPLETO: encontrado.CODIGO.padStart(9, '0'),
                    CODIGO_FINAL: codigoFinal,
                    VALIDO: valido ? 'Sí' : 'No'
                });
            }
            if (resultados.length === 0) {
                messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontraron coincidencias. ${errores > 0 ? `(${errores} errores)` : ''}`;
                return null;
            }
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Procesados ${resultados.length} códigos. ${errores > 0 ? `⚠️ ${errores} errores.` : ''}`;
            return resultados;
        }

        function generarAHKDesdeResultados(resultados) {
            if (!resultados || resultados.length === 0) return null;
            const codigosConCantidad = resultados.map(r => ({
                codigo: r.CODIGO_FINAL,
                cantidad: r.CANTIDAD || 1
            }));
            return core.generarAHKDesdeCodigosConCantidad(codigosConCantidad, 'Códigos EAN-13 generados');
        }

        processBtn.addEventListener('click', () => {
            const maestro = procesarEntrada(maestroTextarea.value);
            const adicionalesTextos = [...foliosContainer.querySelectorAll('textarea')].map(ta => ta.value);
            let todosResultados = maestro || [];
            
            for (const texto of adicionalesTextos) {
                if (texto.trim()) {
                    const res = procesarEntrada(texto);
                    if (res) {
                        if (mainOp === 'sumar') {
                            todosResultados = todosResultados.concat(res);
                        } else {
                            const codigosMaestro = new Set(todosResultados.map(r => r.CODIGO_FINAL));
                            for (const r of res) {
                                if (codigosMaestro.has(r.CODIGO_FINAL)) {
                                    const idx = todosResultados.findIndex(item => item.CODIGO_FINAL === r.CODIGO_FINAL);
                                    if (idx !== -1) {
                                        const existing = todosResultados[idx];
                                        const nuevaCantidad = existing.CANTIDAD - r.CANTIDAD;
                                        if (nuevaCantidad <= 0) {
                                            todosResultados.splice(idx, 1);
                                        } else {
                                            existing.CANTIDAD = nuevaCantidad;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            const mapFinal = new Map();
            for (const r of todosResultados) {
                const key = r.CODIGO_FINAL;
                if (mapFinal.has(key)) {
                    mapFinal.get(key).CANTIDAD += r.CANTIDAD;
                } else {
                    mapFinal.set(key, { ...r });
                }
            }
            const dfFinal = Array.from(mapFinal.values());
            dfFinal.sort((a,b) => a.CODIGO_FINAL.localeCompare(b.CODIGO_FINAL));
            
            const total = dfFinal.reduce((s, r) => s + r.CANTIDAD, 0);
            const totalRow = {
                MODELO: '',
                LINEA: '',
                TIPO: '',
                TALLA: 'TOTAL',
                CANTIDAD: total,
                CODIGO_COMPLETO: '',
                CODIGO_FINAL: '',
                VALIDO: ''
            };
            const dfConTotal = [...dfFinal, totalRow];
            
            window[`dfGen_${panelId}`] = dfConTotal;
            outputDiv.innerHTML = core.renderTableHtml(dfConTotal);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Operación completada. Total: <b>${total}</b> unidades en <b>${dfFinal.length}</b> códigos.`;
        });

        downloadAhkBtn.addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos.'; return; }
            const datos = df.filter(r => r.TALLA !== 'TOTAL');
            const ahk = generarAHKDesdeResultados(datos);
            if (!ahk) return;
            let nombreBase = filenameInput.value.trim().replace(/\.csv$/, '');
            if (!nombreBase) nombreBase = 'codigos';
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombreBase}.ahk`;
            a.click();
            URL.revokeObjectURL(url);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado.`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        copyAhkBtn.addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos.'; return; }
            const datos = df.filter(r => r.TALLA !== 'TOTAL');
            const ahk = generarAHKDesdeResultados(datos);
            if (!ahk) return;
            core.copiarTexto(ahk, copyFeedbackSpan);
        });

        panel.querySelector('.copyMainTsvBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketCheckbox.checked;
            let data = ticketMode ? df.filter(r => r.TALLA !== 'TOTAL').map(r => ({ CODIGO_FINAL: r.CODIGO_FINAL, CANTIDAD: r.CANTIDAD })) : df;
            let content = core.dfToCsv(data, '\t', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.copyMainCsvBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketCheckbox.checked;
            let data = ticketMode ? df.filter(r => r.TALLA !== 'TOTAL').map(r => ({ CODIGO_FINAL: r.CODIGO_FINAL, CANTIDAD: r.CANTIDAD })) : df;
            let content = core.dfToCsv(data, ',', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.downloadMainBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'codigos.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const ticketMode = ticketCheckbox.checked;
            let data = ticketMode ? df.filter(r => r.TALLA !== 'TOTAL').map(r => ({ CODIGO_FINAL: r.CODIGO_FINAL, CANTIDAD: r.CANTIDAD })) : df;
            let content = core.dfToCsv(data, ',', true, true);
            core.downloadCsv(content, filename);
        });

        foliosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-folio')) e.target.closest('.row').remove();
        });
    }

    function createGeneradorTab(tabName = null) {
        const tabId = `gen_tab_${generadorTabCounter}`;
        const tabTitle = tabName || `Generador ${generadorTabCounter}`;
        const tabsContainer = document.getElementById('generadorTabsContainer');
        const addBtn = document.getElementById('addGeneradorTabBtn');
        const tabButton = document.createElement('div');
        tabButton.className = 'generador-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(tabTitle)}</span><span class="tab-close" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        const panelsContainer = document.getElementById('generadorPanelsContainer');
        const panelHtml = getGeneradorPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        initGeneradorPanelEvents(tabId);
        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'gen_tab_0') closeBtn.style.display = 'none';
        else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeGeneradorTabId === tabId) {
                    const firstTab = document.querySelector('#generadorTabsContainer .generador-tab');
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
            document.querySelectorAll('#generadorTabsContainer .generador-tab').forEach(t => t.classList.remove('active'));
            tabButton.classList.add('active');
            document.querySelectorAll('#generadorPanelsContainer .generador-panel').forEach(p => p.classList.remove('active'));
            panel.classList.add('active');
            activeGeneradorTabId = tabId;
        });
        const existingTabs = document.querySelectorAll('#generadorTabsContainer .generador-tab');
        if (existingTabs.length === 1) tabButton.click();
        generadorTabCounter++;
    }

    function initGeneradorMultiTabs() {
        const container = document.getElementById('alternativasMultiTabs');
        container.innerHTML = `
            <div class="generador-tabs-container">
                <div class="generador-tabs" id="generadorTabsContainer"></div>
                <div style="margin-top:0.5rem;" id="generadorPanelsContainer"></div>
            </div>
        `;
        const tabsContainer = document.getElementById('generadorTabsContainer');
        const addBtn = document.createElement('div');
        addBtn.id = 'addGeneradorTabBtn';
        addBtn.className = 'add-tab-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestaña';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => { createGeneradorTab(); });
        createGeneradorTab('Generador 1');
    }

    // ==================== SUBMÓDULO REVERSA ====================
    let reversaTabCounter = 1;
    let activeReversaTabId = 'rev_tab_0';

    function getReversaPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="reversa-panel">
                <label class="form-label"><b>Códigos EAN-13 (13 dígitos):</b></label>
                <textarea class="reversaMaestroInput" placeholder="Pega los códigos EAN-13 (13 dígitos)..." rows="4"></textarea>
                <div class="row"><button class="uploadReversaBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="reversaFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
                <div class="row" style="margin-top:0.5rem;">
                    <button class="processReversaBtn btn-primary"><i class="fas fa-play"></i> Decodificar</button>
                    <button class="copyReversaTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button class="copyReversaCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" class="reversaFilename" value="decodificados.csv" style="width:190px;">
                    <button class="downloadReversaBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback"></span>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    function initReversaPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const uploadBtn = panel.querySelector('.uploadReversaBtn');
        const fileInput = panel.querySelector('.reversaFile');
        const inputTextarea = panel.querySelector('.reversaMaestroInput');
        const processBtn = panel.querySelector('.processReversaBtn');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');
        const filenameInput = panel.querySelector('.reversaFilename');
        const copyFeedbackSpan = panel.querySelector('.copy-feedback');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { inputTextarea.value = ev.target.result; fileInput.value = ''; }; r.readAsText(f); });

        function procesarReversa() {
            const texto = inputTextarea.value;
            if (!texto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos.';
                return;
            }
            const lib = getBiblioteca();
            if (lib.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                return;
            }
            const patron = /\b(\d{13})\b/g;
            const codigos = [];
            let match;
            while ((match = patron.exec(texto)) !== null) {
                codigos.push(match[1]);
            }
            if (codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron códigos de 13 dígitos.';
                return;
            }
            const resultados = [];
            for (const c of codigos) {
                const decodificado = core.decodificarCodigoEAN13(c, lib);
                if (decodificado) {
                    resultados.push({
                        CODIGO: c,
                        CODIGO_9: decodificado.codigo9,
                        MODELO: decodificado.modelo,
                        LINEA: decodificado.linea,
                        TIPO: decodificado.tipo,
                        TALLA: decodificado.talla,
                        DIGITO_CONTROL: decodificado.digitoControl,
                        VALIDO: decodificado.valido ? 'Sí' : 'No'
                    });
                } else {
                    resultados.push({
                        CODIGO: c,
                        CODIGO_9: 'No encontrado',
                        MODELO: '-',
                        LINEA: '-',
                        TIPO: '-',
                        TALLA: '-',
                        DIGITO_CONTROL: '-',
                        VALIDO: 'No'
                    });
                }
            }
            window[`dfRev_${panelId}`] = resultados;
            outputDiv.innerHTML = core.renderTableHtml(resultados);
            const validos = resultados.filter(r => r.VALIDO === 'Sí').length;
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Decodificados ${codigos.length} códigos. Válidos: ${validos}.`;
        }

        processBtn.addEventListener('click', procesarReversa);

        panel.querySelector('.copyReversaTsvBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            let content = core.dfToCsv(df, '\t', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.copyReversaCsvBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            let content = core.dfToCsv(df, ',', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.downloadReversaBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'decodificados.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            let content = core.dfToCsv(df, ',', true, true);
            core.downloadCsv(content, filename);
        });
    }

    function createReversaTab(tabName = null) {
        const tabId = `rev_tab_${reversaTabCounter}`;
        const tabTitle = tabName || `Reversa ${reversaTabCounter}`;
        const tabsContainer = document.getElementById('reversaTabsContainer');
        const addBtn = document.getElementById('addReversaTabBtn');
        const tabButton = document.createElement('div');
        tabButton.className = 'reversa-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(tabTitle)}</span><span class="tab-close" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        const panelsContainer = document.getElementById('reversaPanelsContainer');
        const panelHtml = getReversaPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        initReversaPanelEvents(tabId);
        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'rev_tab_0') closeBtn.style.display = 'none';
        else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeReversaTabId === tabId) {
                    const firstTab = document.querySelector('#reversaTabsContainer .reversa-tab');
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
            document.querySelectorAll('#reversaTabsContainer .reversa-tab').forEach(t => t.classList.remove('active'));
            tabButton.classList.add('active');
            document.querySelectorAll('#reversaPanelsContainer .reversa-panel').forEach(p => p.classList.remove('active'));
            panel.classList.add('active');
            activeReversaTabId = tabId;
        });
        const existingTabs = document.querySelectorAll('#reversaTabsContainer .reversa-tab');
        if (existingTabs.length === 1) tabButton.click();
        reversaTabCounter++;
    }

    function initReversaMultiTabs() {
        const container = document.getElementById('reversaMultiTabs');
        container.innerHTML = `
            <div class="reversa-tabs-container">
                <div class="reversa-tabs" id="reversaTabsContainer"></div>
                <div style="margin-top:0.5rem;" id="reversaPanelsContainer"></div>
            </div>
        `;
        const tabsContainer = document.getElementById('reversaTabsContainer');
        const addBtn = document.createElement('div');
        addBtn.id = 'addReversaTabBtn';
        addBtn.className = 'add-tab-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestaña';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => { createReversaTab(); });
        createReversaTab('Reversa 1');
    }

    // ==================== INICIALIZAR TODO ====================
    initGeneradorMultiTabs();
    initReversaMultiTabs();

    // ==================== CAMBIO ENTRE SUBMÓDULOS ====================
    const subTabs = document.querySelectorAll('#alternativasSubTabs .sub-module-tab');
    const generadorDiv = document.getElementById('alternativasGenerador');
    const reversaDiv = document.getElementById('alternativasReversa');
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.submode === 'generador') {
                generadorDiv.style.display = 'block';
                reversaDiv.style.display = 'none';
            } else {
                generadorDiv.style.display = 'none';
                reversaDiv.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab8', this.dataset.submode);
        });
    });
    generadorDiv.style.display = 'block';
    reversaDiv.style.display = 'none';

    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab8' && e.detail.subMode) {
            const targetTab = document.querySelector(`#alternativasSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== LIMPIAR ====================
    const clearBtn = tabContainer.querySelector('.clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('#generadorPanelsContainer .generador-panel').forEach(panel => {
                const maestroInput = panel.querySelector('.mainMaestroInput');
                if (maestroInput) maestroInput.value = '';
                const foliosContainer = panel.querySelector('.mainFoliosContainer');
                if (foliosContainer) {
                    while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                }
                const maestroName = panel.querySelector('.mainMaestroName');
                if (maestroName) maestroName.value = 'MAESTRO';
                const toggleSumar = panel.querySelector('.toggle-option[data-op="sumar"]');
                if (toggleSumar) toggleSumar.click();
                const outputDiv = panel.querySelector('.output-area');
                if (outputDiv) outputDiv.innerHTML = '';
                const messageDiv = panel.querySelector('.message');
                if (messageDiv) messageDiv.innerHTML = '';
                const evt = new Event('input');
                const tipoOrigen = panel.querySelector('#tipoOrigen');
                if (tipoOrigen) tipoOrigen.dispatchEvent(evt);
            });
            document.querySelectorAll('#reversaPanelsContainer .reversa-panel').forEach(panel => {
                const input = panel.querySelector('.reversaMaestroInput');
                if (input) input.value = '';
                const outputDiv = panel.querySelector('.output-area');
                if (outputDiv) outputDiv.innerHTML = '';
                const messageDiv = panel.querySelector('.message');
                if (messageDiv) messageDiv.innerHTML = '';
            });
            window.dfGen = null;
            window.dfRev = null;
        });
    }
})();