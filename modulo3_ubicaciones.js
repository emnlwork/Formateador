// Módulo Ubicaciones (Detector + Existencia) con almacenamiento local de Posicion.txt
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab3');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-map-pin"></i> Ubicaciones</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="sub-module-tabs" id="ubicacionesSubTabs">
                <div class="sub-module-tab active" data-submode="detector">Detector</div>
                <div class="sub-module-tab" data-submode="existencia">Existencia</div>
            </div>
            <!-- Detector -->
            <div id="ubicacionDetector" class="sub-panel active">
                <label><b>Lista de modelos (pega texto o sube archivo):</b></label>
                <textarea id="modelosInput" placeholder="Pega la lista de modelos..." rows="4"></textarea>
                <div class="row"><button id="uploadModelosBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="modelosFile" accept=".csv,.txt" style="display:none;"></div>
                <div style="margin:0.8rem 0;">
                    <label><b>Archivo de posiciones (Posicion.txt):</b></label>
                    <div class="file-upload-btn" style="margin-left:0.5rem;">
                        <button><i class="fas fa-upload"></i> Subir Posicion.txt <input type="file" id="posFileUpload" accept=".txt"></button>
                    </div>
                    <span id="archivoEstado" style="color:#aaa; font-size:0.85rem; margin-left:0.5rem;"></span>
                </div>
                <div><b>Tipo de búsqueda:</b></div>
                <select id="searchType">
                    <option value="integridad">INTEGRIDAD</option>
                    <option value="bodega">BODEGA AUTOSERVICIO / POS 699</option>
                    <option value="piso_general">PISO GENERAL (POSICION 1-99)</option>
                    <option value="reporte_completo">REPORTE COMPLETO</option>
                </select>
                <div class="row"><input type="checkbox" id="ticketModeCheckbox"><label for="ticketModeCheckbox">MODO TICKET (solo MODELO, LINEA, TIPO, CANTIDAD, sin cabeceras)</label></div>
                <div class="row">
                    <button id="searchUbicacionBtn" class="btn-primary"><i class="fas fa-search"></i> Buscar</button>
                    <button id="copyUbicacionTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button id="copyUbicacionCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" id="ubicacionFilename" value="${core.generarNombreFecha('csv')}" style="width:180px;">
                    <button id="downloadUbicacionBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback" id="ubicacionCopyFeedback"></span>
                </div>
                <div id="ubicacionMessage" class="message"></div>
                <div class="output-area" id="ubicacionOutput"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Detector de Ubicación</b><br>
                    1. Pega la lista de modelos.<br>2. Carga Posicion.txt (se guarda automáticamente).<br>3. Selecciona tipo y pulsa Buscar.<br>
                    <b>MODO TICKET:</b> exporta MODELO, LINEA, TIPO, CANTIDAD.
                </div>
            </div>
            <!-- Existencia (múltiples ubicaciones) -->
            <div id="ubicacionExistencia" class="sub-panel">
                <h3><i class="fas fa-location-dot"></i> Ubicaciones (prioridad de izquierda a derecha)</h3>
                <div id="locationsContainer">
                    <div class="location-tabs" id="locationTabsContainer"></div>
                    <div style="margin-top:0.5rem;" id="locationPanelsContainer"></div>
                </div>
                <div class="row"><button id="addLocationBtn" class="add-location-btn"><i class="fas fa-plus"></i> Agregar ubicación</button></div>
                <h3 style="margin-top: 1rem;"><i class="fas fa-qrcode"></i> Escaneado (formato crudo o CSV)</h3>
                <textarea id="scanInput" placeholder="Pega aquí el escaneado (formato 1, 2, CSV, TSV)..." rows="6"></textarea>
                <div class="row"><button id="uploadScanBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="scanFile" accept=".csv,.txt" style="display:none;"></div>
                <div class="row"><div class="checkbox-label"><input type="checkbox" id="sortByPriorityCheckbox"><label for="sortByPriorityCheckbox">Ordenar por prioridad de ubicación</label></div></div>
                <div class="row">
                    <button id="processExistenciaBtn" class="btn-primary"><i class="fas fa-play"></i> Procesar asignación</button>
                    <button id="copyExistenciaTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button id="copyExistenciaCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" id="existenciaFilename" value="${core.generarNombreFecha('csv')}" style="width:180px;">
                    <button id="downloadExistenciaBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback" id="existenciaCopyFeedback"></span>
                </div>
                <div id="existenciaMessage" class="message"></div>
                <div id="existenciaSummary" class="message"></div>
                <div id="existenciaOutput" class="output-area"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Existencia en Ubicaciones</b><br>
                    1. Agrega ubicaciones con el botón <span style="color:#ff8888;">➕</span>. Cada ubicación tiene un stock.<br>
                    2. Cambia el nombre con doble clic sobre su pestaña.<br>
                    3. Usa ⬆️ / ⬇️ para cambiar la prioridad.<br>
                    4. Marca/desmarca el checkbox para incluirla.<br>
                    5. Pega el escaneado.<br>
                    6. Haz clic en Procesar asignación.<br>
                    7. Los resultados muestran qué ubicación se asignó a cada modelo/talla.<br>
                    8. Marca <b>Ordenar por prioridad de ubicación</b> para ordenar la tabla.
                </div>
            </div>
        </div>
    `;

    // ==================== DETECTOR ====================
    let posicionesData = null;

    // Clave para localStorage
    const STORAGE_KEY = 'posicion_txt_content';

    // Función para guardar el contenido en localStorage
    function guardarPosicionLocal(content) {
        if (content) {
            localStorage.setItem(STORAGE_KEY, content);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    // Función para cargar desde localStorage al iniciar
    function cargarPosicionLocal() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            posicionesData = saved;
            document.getElementById('archivoEstado').textContent = 'Archivo cargado (desde almacenamiento local)';
        } else {
            posicionesData = null;
            document.getElementById('archivoEstado').textContent = '';
        }
    }

    // Configurar upload de modelos
    core.setupFileUpload('uploadModelosBtn', 'modelosFile', 'modelosInput');

    // Upload de Posicion.txt con almacenamiento local
    const posFileInput = document.getElementById('posFileUpload');
    posFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const content = ev.target.result;
            posicionesData = content;
            guardarPosicionLocal(content);
            document.getElementById('archivoEstado').textContent = 'Archivo cargado y guardado localmente';
            // Opcional: mostrar mensaje temporal
            setTimeout(() => {
                if (document.getElementById('archivoEstado').textContent === 'Archivo cargado y guardado localmente') {
                    document.getElementById('archivoEstado').textContent = 'Archivo cargado (desde almacenamiento local)';
                }
            }, 3000);
        };
        reader.readAsText(file);
        e.target.value = ''; // permitir recargar el mismo archivo
    });

    // Cargar archivo guardado al inicio
    cargarPosicionLocal();

    // Resto de funciones del detector (sin cambios)
    function obtenerMejorPosicion(posicionesArray) {
        if (!posicionesArray || posicionesArray.length === 0) return null;
        const pisoRegex = /^POSICION\s+([1-9]|[1-9][0-9])$/;
        const piso = posicionesArray.find(p => pisoRegex.test(p));
        if (piso) return piso;
        const bodega = posicionesArray.find(p => p.includes('BODEGA AUTOSERVICIO') || p.includes('POS AUTOSERVICIO 699'));
        if (bodega) return bodega;
        return posicionesArray[0];
    }

    function getTicketDataUbicacion() {
        if (!window.resultadosUbicacion) return [];
        return window.resultadosUbicacion.map(row => ({ MODELO: row.MODELO, LINEA: row.LINEA, TIPO: row.TIPO, CANTIDAD: row.CANTIDAD }));
    }

    document.getElementById('searchUbicacionBtn').onclick = () => {
        const textoModelos = document.getElementById('modelosInput').value;
        if (!textoModelos.trim() || !posicionesData) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega los modelos y carga el archivo de posiciones';
            return;
        }
        try {
            const tipo = document.getElementById('searchType').value;
            const modelosCantidad = core.extraerModelosConCantidad(textoModelos);
            if (!modelosCantidad.length) {
                document.getElementById('ubicacionOutput').innerHTML = '<p style="color:#aaa;">No se pudieron interpretar modelos del texto.</p>';
                return;
            }
            const lineasPos = posicionesData.split('\n');
            const datosPos = []; let empezar = false;
            for (const linea of lineasPos) {
                const limpia = linea.trim();
                if (!empezar && limpia.includes('--------')) { empezar = true; continue; }
                if (!empezar) continue;
                if (limpia.includes('--------') || limpia.startsWith('Total:')) continue;
                if (!limpia) continue;
                const match = limpia.match(/^\s*(\d+)\s+([A-Z0-9]{2,3})\s+([A-Z0-9]{2,4})\s+(.+?)\s*$/i);
                if (match) datosPos.push({ modelo: match[1], color: match[2].toUpperCase(), material: match[3].toUpperCase(), posicion: match[4].replace(/[^\w\s]/g, '').trim().toUpperCase() });
            }
            if (!datosPos.length) {
                document.getElementById('ubicacionOutput').innerHTML = '<p>No se parsearon posiciones.</p>';
                return;
            }
            const posicionesPorModelo = new Map();
            for (const p of datosPos) {
                const key = `${p.modelo}|${p.color}|${p.material}`;
                if (!posicionesPorModelo.has(key)) posicionesPorModelo.set(key, []);
                posicionesPorModelo.get(key).push(p.posicion);
            }
            const resultados = []; let encontrados = 0, totalUnidades = 0;
            for (const item of modelosCantidad) {
                const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}`;
                const posicionesArray = posicionesPorModelo.get(key);
                if (!posicionesArray || posicionesArray.length === 0) continue;
                let posicionFinal = '';
                if (tipo === 'reporte_completo') {
                    const mejorPos = obtenerMejorPosicion(posicionesArray);
                    if (mejorPos) posicionFinal = mejorPos;
                } else if (tipo === 'integridad') {
                    if (posicionesArray.some(p => p.includes('INTEGRIDAD'))) posicionFinal = 'INTEGRIDAD';
                } else if (tipo === 'bodega') {
                    if (posicionesArray.some(p => p.includes('BODEGA AUTOSERVICIO') || p.includes('POS AUTOSERVICIO 699'))) posicionFinal = 'BODEGA AUTOSERVICIO / POS 699';
                } else if (tipo === 'piso_general') {
                    const pisos = posicionesArray.filter(p => /^POSICION\s+([1-9]|[1-9][0-9])$/.test(p));
                    if (pisos.length) posicionFinal = pisos.join(', ');
                    else continue;
                }
                if (posicionFinal) {
                    resultados.push({ MODELO: item.MODELO, LINEA: item.LINEA, TIPO: item.TIPO, CANTIDAD: item.CANTIDAD, POSICIONES: posicionFinal });
                    encontrados++; totalUnidades += item.CANTIDAD;
                }
            }
            window.resultadosUbicacion = resultados;
            document.getElementById('ubicacionOutput').innerHTML = core.renderTableHtml(resultados);
            document.getElementById('ubicacionMessage').innerHTML = `<i class="fas fa-check-circle"></i> <b>${encontrados}</b> modelos encontrados de <b>${modelosCantidad.length}</b> buscados. Unidades totales: <b>${totalUnidades}</b>.`;
        } catch(e) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: ' + e.message;
        }
    };

    document.getElementById('copyUbicacionTsvBtn').onclick = () => {
        if (!window.resultadosUbicacion || !window.resultadosUbicacion.length) {
            document.getElementById('ubicacionCopyFeedback').textContent = 'Sin datos';
            setTimeout(() => document.getElementById('ubicacionCopyFeedback').textContent = '', 1500);
            return;
        }
        const ticketMode = document.getElementById('ticketModeCheckbox').checked;
        let content = ticketMode ? core.dfToCsv(getTicketDataUbicacion(), '\t', false, true) : core.dfToCsv(window.resultadosUbicacion, '\t', true, true);
        core.copiarTexto(content, 'ubicacionCopyFeedback');
    };
    document.getElementById('copyUbicacionCsvBtn').onclick = () => {
        if (!window.resultadosUbicacion || !window.resultadosUbicacion.length) {
            document.getElementById('ubicacionCopyFeedback').textContent = 'Sin datos';
            setTimeout(() => document.getElementById('ubicacionCopyFeedback').textContent = '', 1500);
            return;
        }
        const ticketMode = document.getElementById('ticketModeCheckbox').checked;
        let content = ticketMode ? core.dfToCsv(getTicketDataUbicacion(), ',', false, true) : core.dfToCsv(window.resultadosUbicacion, ',', true, true);
        core.copiarTexto(content, 'ubicacionCopyFeedback');
    };
    document.getElementById('downloadUbicacionBtn').onclick = () => {
        if (!window.resultadosUbicacion || !window.resultadosUbicacion.length) return;
        let filename = document.getElementById('ubicacionFilename').value.trim();
        if (!filename) filename = core.generarNombreFecha('csv');
        if (!filename.endsWith('.csv')) filename += '.csv';
        const ticketMode = document.getElementById('ticketModeCheckbox').checked;
        let content = ticketMode ? core.dfToCsv(getTicketDataUbicacion(), ',', false, true) : core.dfToCsv(window.resultadosUbicacion, ',', true, true);
        core.downloadCsv(content, filename);
    };

    // ==================== EXISTENCIA (sin cambios funcionales) ====================
    let locationCounter = 1;
    let activeLocationId = null;
    let locationData = {};
    let currentExistenciaResults = null;

    function crearUbicacion(nombre = null) {
        const panelId = `loc_panel_${locationCounter++}`;
        const tabName = nombre || `Ubicación ${locationCounter}`;
        const tabsContainer = document.getElementById('locationTabsContainer');
        const tabDiv = document.createElement('div');
        tabDiv.className = 'location-tab';
        tabDiv.dataset.panelId = panelId;
        tabDiv.innerHTML = `<span class="tab-name">${core.escapeHtml(tabName)}</span><span class="move-up" title="Mover arriba"><i class="fas fa-arrow-up"></i></span><span class="move-down" title="Mover abajo"><i class="fas fa-arrow-down"></i></span><span class="tab-close" title="Eliminar">✖</span>`;
        tabsContainer.appendChild(tabDiv);
        const panelsContainer = document.getElementById('locationPanelsContainer');
        const panelDiv = document.createElement('div');
        panelDiv.id = panelId;
        panelDiv.className = 'location-panel';
        panelDiv.innerHTML = `<div class="checkbox-label"><input type="checkbox" class="include-location" checked> <b>Incluir esta ubicación en el análisis</b></div><label><b>Stock (formato CSV o tallas):</b></label><textarea class="stock-textarea" rows="5" placeholder="Pega aquí el stock de esta ubicación..."></textarea><div class="row"><button class="upload-stock-btn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="stock-file" accept=".csv,.txt" style="display:none;"></div>`;
        panelsContainer.appendChild(panelDiv);
        locationData[panelId] = { name: tabName, include: true, stockMap: new Map() };
        const nameSpan = tabDiv.querySelector('.tab-name');
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
            nameSpan.style.display = 'none';
            nameSpan.parentNode.insertBefore(input, nameSpan);
            input.focus();
            input.select();
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || oldName;
                nameSpan.textContent = newName;
                locationData[panelId].name = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        const chk = panelDiv.querySelector('.include-location');
        chk.addEventListener('change', (e) => { locationData[panelId].include = e.target.checked; });
        const uploadBtn = panelDiv.querySelector('.upload-stock-btn');
        const fileInput = panelDiv.querySelector('.stock-file');
        const stockTa = panelDiv.querySelector('.stock-textarea');
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = ev => { stockTa.value = ev.target.result; fileInput.value = ''; };
            reader.readAsText(f);
        });
        const closeBtn = tabDiv.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tabDiv.remove();
            panelDiv.remove();
            delete locationData[panelId];
            if (activeLocationId === panelId) {
                const firstTab = document.querySelector('#locationTabsContainer .location-tab');
                if (firstTab) firstTab.click();
            }
        });
        const upBtn = tabDiv.querySelector('.move-up');
        const downBtn = tabDiv.querySelector('.move-down');
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabs = Array.from(tabsContainer.children);
            const idx = tabs.indexOf(tabDiv);
            if (idx > 0) tabsContainer.insertBefore(tabDiv, tabs[idx-1]);
        });
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabs = Array.from(tabsContainer.children);
            const idx = tabs.indexOf(tabDiv);
            if (idx < tabs.length - 1) {
                if (idx + 1 < tabs.length) tabsContainer.insertBefore(tabDiv, tabs[idx+2]);
                else tabsContainer.appendChild(tabDiv);
            }
        });
        tabDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('move-up') || e.target.classList.contains('move-down') || e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('.location-tab').forEach(t => t.classList.remove('active'));
            tabDiv.classList.add('active');
            document.querySelectorAll('.location-panel').forEach(p => p.classList.remove('active'));
            panelDiv.classList.add('active');
            activeLocationId = panelId;
        });
        if (document.querySelectorAll('.location-tab').length === 1) tabDiv.click();
        return panelId;
    }

    function parsearStockPanel(texto) {
        const parsed = core.parsearTextoUniversal(texto);
        const map = new Map();
        for (const item of parsed) {
            if (item.TALLA === 'TOTAL') continue;
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            map.set(key, (map.get(key) || 0) + item.CANTIDAD);
        }
        return map;
    }

    function ordenarPorPrioridadYModelo(results, locationOrder) {
        const priorityMap = new Map();
        locationOrder.forEach((loc, idx) => priorityMap.set(loc, idx));
        return results.sort((a, b) => {
            const prioA = priorityMap.has(a.UBICACION) ? priorityMap.get(a.UBICACION) : Number.MAX_SAFE_INTEGER;
            const prioB = priorityMap.has(b.UBICACION) ? priorityMap.get(b.UBICACION) : Number.MAX_SAFE_INTEGER;
            if (prioA !== prioB) return prioA - prioB;
            return (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0);
        });
    }

    function procesarAsignacionExistencia() {
        const scanText = document.getElementById('scanInput').value;
        if (!scanText.trim()) {
            document.getElementById('existenciaMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar el escaneado.';
            return;
        }
        const scanItems = core.parsearTextoUniversal(scanText).filter(i => i.TALLA !== 'TOTAL');
        if (scanItems.length === 0) {
            document.getElementById('existenciaMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron ítems válidos en el escaneado.';
            return;
        }
        const tabs = Array.from(document.querySelectorAll('#locationTabsContainer .location-tab'));
        const orderedLocations = [];
        const locationNamesInOrder = [];
        for (const tab of tabs) {
            const panelId = tab.dataset.panelId;
            const loc = locationData[panelId];
            if (!loc) continue;
            const includeCheckbox = document.getElementById(panelId).querySelector('.include-location');
            const include = includeCheckbox.checked;
            if (!include) continue;
            const stockTa = document.getElementById(panelId).querySelector('.stock-textarea');
            const stockMap = parsearStockPanel(stockTa.value);
            orderedLocations.push({ id: panelId, name: loc.name, stockMap: stockMap });
            locationNamesInOrder.push(loc.name);
        }
        if (orderedLocations.length === 0) {
            document.getElementById('existenciaMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay ubicaciones incluidas.';
            return;
        }
        const demandMap = new Map();
        for (const item of scanItems) {
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            demandMap.set(key, (demandMap.get(key) || 0) + item.CANTIDAD);
        }
        const assignments = [];
        const stocksCopy = orderedLocations.map(loc => ({ name: loc.name, stock: new Map(loc.stockMap) }));
        for (let [key, demanda] of demandMap.entries()) {
            let restante = demanda;
            for (let i = 0; i < stocksCopy.length && restante > 0; i++) {
                const loc = stocksCopy[i];
                const disponible = loc.stock.get(key) || 0;
                if (disponible > 0) {
                    const tomado = Math.min(restante, disponible);
                    assignments.push({ key: key, cantidad: tomado, ubicacion: loc.name });
                    restante -= tomado;
                    loc.stock.set(key, disponible - tomado);
                    if (loc.stock.get(key) === 0) loc.stock.delete(key);
                }
            }
            if (restante > 0) assignments.push({ key: key, cantidad: restante, ubicacion: "NO ENCONTRADA" });
        }
        let results = [];
        for (const ass of assignments) {
            const [modelo, linea, tipo, talla] = ass.key.split('|');
            results.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla, CANTIDAD: ass.cantidad, UBICACION: ass.ubicacion });
        }
        const sortByPriority = document.getElementById('sortByPriorityCheckbox').checked;
        if (sortByPriority) results = ordenarPorPrioridadYModelo(results, locationNamesInOrder);
        else results.sort((a,b) => (parseInt(a.MODELO)||0) - (parseInt(b.MODELO)||0));
        currentExistenciaResults = results;
        core.renderTableToElement(results, 'existenciaOutput');
        const summary = {};
        for (const r of results) summary[r.UBICACION] = (summary[r.UBICACION] || 0) + r.CANTIDAD;
        let summaryHtml = '<strong>Resumen de asignación:</strong><br>';
        for (const [ubi, cant] of Object.entries(summary)) summaryHtml += `${ubi}: ${cant} unidades<br>`;
        document.getElementById('existenciaSummary').innerHTML = summaryHtml;
        document.getElementById('existenciaMessage').innerHTML = `<i class="fas fa-check-circle"></i> Asignación completada. Total de ítems procesados: ${scanItems.reduce((s,i)=>s+i.CANTIDAD,0)} unidades.`;
    }

    document.getElementById('addLocationBtn').addEventListener('click', () => crearUbicacion());
    document.getElementById('processExistenciaBtn').addEventListener('click', procesarAsignacionExistencia);
    document.getElementById('copyExistenciaTsvBtn').addEventListener('click', () => {
        if (currentExistenciaResults) core.copiarTexto(core.dfToCsv(currentExistenciaResults, '\t', true), 'existenciaCopyFeedback');
        else document.getElementById('existenciaCopyFeedback').textContent = 'Sin datos';
    });
    document.getElementById('copyExistenciaCsvBtn').addEventListener('click', () => {
        if (currentExistenciaResults) core.copiarTexto(core.dfToCsv(currentExistenciaResults, ',', true), 'existenciaCopyFeedback');
        else document.getElementById('existenciaCopyFeedback').textContent = 'Sin datos';
    });
    document.getElementById('downloadExistenciaBtn').addEventListener('click', () => {
        if (!currentExistenciaResults) return;
        let filename = document.getElementById('existenciaFilename').value.trim();
        if (!filename) filename = core.generarNombreFecha('csv');
        if (!filename.endsWith('.csv')) filename += '.csv';
        core.downloadCsv(core.dfToCsv(currentExistenciaResults, ',', true), filename);
    });
    core.setupFileUpload('uploadScanBtn', 'scanFile', 'scanInput');

    crearUbicacion('PISO GENERAL');

    // Cambio entre submódulos
    const subTabs = document.querySelectorAll('#ubicacionesSubTabs .sub-module-tab');
    const detectorDiv = document.getElementById('ubicacionDetector');
    const existenciaDiv = document.getElementById('ubicacionExistencia');
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.submode === 'detector') {
                detectorDiv.style.display = 'block';
                existenciaDiv.style.display = 'none';
            } else {
                detectorDiv.style.display = 'none';
                existenciaDiv.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab3', this.dataset.submode);
        });
    });
    detectorDiv.style.display = 'block';
    existenciaDiv.style.display = 'none';

    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab3' && e.detail.subMode) {
            const targetTab = document.querySelector(`#ubicacionesSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== LIMPIAR MÓDULO (silencioso, con opción de borrar también el archivo guardado) ====================
    const clearBtn = document.querySelector('#tab3 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Detector
            document.getElementById('modelosInput').value = '';
            // No borrar el archivo guardado a menos que se quiera explícitamente, pero por claridad se mantiene
            // Si se desea borrar el archivo guardado, descomentar la siguiente línea:
            // localStorage.removeItem(STORAGE_KEY);
            // posicionesData = null;
            // document.getElementById('archivoEstado').textContent = '';
            // En su lugar, solo limpiamos el mensaje de estado y dejamos el archivo cargado.
            document.getElementById('archivoEstado').textContent = localStorage.getItem(STORAGE_KEY) ? 'Archivo cargado (desde almacenamiento local)' : '';
            document.getElementById('ubicacionOutput').innerHTML = '';
            document.getElementById('ubicacionMessage').innerHTML = '';
            window.resultadosUbicacion = null;
            // Existencia (mantener solo la primera ubicación)
            const locationTabs = Array.from(document.querySelectorAll('#locationTabsContainer .location-tab'));
            locationTabs.forEach((tab, idx) => {
                const panelId = tab.dataset.panelId;
                if (panelId) {
                    const textarea = document.getElementById(panelId)?.querySelector('.stock-textarea');
                    if (textarea) textarea.value = '';
                    const checkbox = document.getElementById(panelId)?.querySelector('.include-location');
                    if (checkbox) checkbox.checked = true;
                }
                if (idx > 0) {
                    const panelId = tab.dataset.panelId;
                    if (panelId) document.getElementById(panelId)?.remove();
                    tab.remove();
                    delete locationData[panelId];
                }
            });
            const firstTab = document.querySelector('#locationTabsContainer .location-tab');
            if (firstTab) {
                const nameSpan = firstTab.querySelector('.tab-name');
                if (nameSpan && nameSpan.textContent !== 'PISO GENERAL') nameSpan.textContent = 'PISO GENERAL';
                const panelId = firstTab.dataset.panelId;
                if (panelId && locationData[panelId]) locationData[panelId].name = 'PISO GENERAL';
            }
            document.getElementById('scanInput').value = '';
            document.getElementById('existenciaOutput').innerHTML = '';
            document.getElementById('existenciaSummary').innerHTML = '';
            document.getElementById('existenciaMessage').innerHTML = '';
            currentExistenciaResults = null;
            document.getElementById('sortByPriorityCheckbox').checked = false;
        });
    }
})();