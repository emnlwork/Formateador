// Módulo Compensación Diferencias - MEJORADO con acciones claras, colores y AHK
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab5');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-balance-scale"></i> Compensación Diferencias</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="sub-module-tabs" id="compensacionSubTabs">
                <div class="sub-module-tab active" data-submode="diffDiff">Diferencia vs Diferencia</div>
                <div class="sub-module-tab" data-submode="diffScan">Diferencia vs Escaneo</div>
            </div>
            <div class="row"><input type="checkbox" id="compTicketMode"><label for="compTicketMode">MODO TICKET (solo MODELO, LINEA, TIPO, CANTIDAD principal)</label></div>
            
            <!-- Diferencia vs Diferencia -->
            <div id="subDiffDiff" class="sub-panel active">
                <h3><i class="fas fa-not-equal"></i> Comparar dos diferencias</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div><div class="row"><b>Nombre Folio 1:</b> <input type="text" id="folio1NameDiff" value="FOLIO1" style="width:140px;"></div>
                    <label><b>Diferencias Folio 1 (CSV):</b></label>
                    <textarea id="dif1InputDiff" rows="8" placeholder="Pega el CSV de diferencias..."></textarea>
                    <div class="row"><button id="uploadDif1DiffBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="dif1FileDiff" accept=".csv" style="display:none;"></div></div>
                    <div><div class="row"><b>Nombre Folio 2:</b> <input type="text" id="folio2NameDiff" value="FOLIO2" style="width:140px;"></div>
                    <label><b>Diferencias Folio 2 (CSV):</b></label>
                    <textarea id="dif2InputDiff" rows="8" placeholder="Pega el CSV de diferencias..."></textarea>
                    <div class="row"><button id="uploadDif2DiffBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="dif2FileDiff" accept=".csv" style="display:none;"></div></div>
                </div>
                <div class="row"><button id="processCompDiffBtn" class="btn-primary"><i class="fas fa-play"></i> Procesar Compensaciones</button></div>
                <div id="compDiffMessage" class="message"></div>
                <div id="compDiffOutputContainer" style="display:none;">
                    <!-- ACCIONES A REALIZAR (MOVIMIENTOS) -->
                    <div style="margin:1rem 0; padding:0.8rem; background:#1a3a1a; border:2px solid #2ecc71; border-radius:8px;">
                        <h4 style="color:#2ecc71; margin:0;"><i class="fas fa-arrows-alt-h"></i> Movimientos a realizar:</h4>
                        <div id="accionesMovimientoContainer" style="margin-top:0.5rem; max-height:300px; overflow-y:auto;"></div>
                        <div id="accionesBotonesContainer" class="row" style="margin-top:0.5rem;"></div>
                    </div>

                    <h3 style="color:#f1c40f;"><i class="fas fa-exchange-alt"></i> Compensaciones encontradas</h3>
                    
                    <!-- Dropdowns para nombre en Diferencia vs Diferencia -->
                    <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                        <b><i class="fas fa-tag"></i> Configurar nombre de archivo (Compensaciones):</b>
                        <div class="row">
                            <select id="tipoOrigenComp" style="width:130px;">
                                <option value="">(seleccionar)</option>
                                <option value="escaneo">escaneo</option>
                                <option value="existencia">existencia</option>
                            </select>
                            <select id="tipoUbicacionComp" style="width:150px;">
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
                            <select id="tipoCategoriaComp" style="width:120px;">
                                <option value="">(seleccionar)</option>
                                <option value="home">home</option>
                                <option value="calzado">calzado</option>
                                <option value="ropa">ropa</option>
                                <option value="catalogos">catalogos</option>
                            </select>
                            <input type="text" id="nombrePersonalizadoComp" placeholder="Personalizado" style="width:130px;">
                            <input type="text" id="sufijoAdicionalComp" placeholder="Sufijo extra" style="width:100px;">
                        </div>
                    </div>
                    
                    <div class="row">
                        <button id="copyCompDiffTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyCompDiffCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="compDiffFilename" value="archivo.csv" style="width:280px;">
                        <button id="downloadCompDiffBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="compDiffCopyFeedback"></span>
                    </div>
                    <div class="output-area" id="compDiffOutput" style="max-height:400px; overflow:auto;"></div>
                    
                    <hr style="border-color:#e74c3c; margin:1.5rem 0;">
                    <h3 style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Diferencias restantes - <span id="dif1DiffLabel">Folio 1</span></h3>
                    <div class="row">
                        <button id="copyDif1DiffTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyDif1DiffCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="dif1DiffFilename" value="archivo.csv" style="width:280px;">
                        <button id="downloadDif1DiffBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="dif1DiffCopyFeedback"></span>
                    </div>
                    <div class="output-area" id="dif1DiffOutput" style="max-height:400px; overflow:auto;"></div>
                    
                    <hr style="border-color:#e74c3c; margin:1.5rem 0;">
                    <h3 style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Diferencias restantes - <span id="dif2DiffLabel">Folio 2</span></h3>
                    <div class="row">
                        <button id="copyDif2DiffTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyDif2DiffCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="dif2DiffFilename" value="archivo.csv" style="width:280px;">
                        <button id="downloadDif2DiffBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="dif2DiffCopyFeedback"></span>
                    </div>
                    <div class="output-area" id="dif2DiffOutput" style="max-height:400px; overflow:auto;"></div>
                </div>
            </div>
            
            <!-- Diferencia vs Escaneo -->
            <div id="subDiffScan" class="sub-panel">
                <h3><i class="fas fa-qrcode"></i> Compensar faltantes con escaneo</h3>
                <div class="toggle-group" id="scanModeToggle" style="margin-bottom: 1rem;">
                    <span class="toggle-option active-toggle" data-mode="faltante">❗ FALTANTE</span>
                    <span class="toggle-option" data-mode="sobrante">✅ SOBRANTE</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div><div class="row"><b>Nombre Folio Diferencias:</b> <input type="text" id="folioDifNameScan" value="FOLIO" style="width:140px;"></div>
                    <label><b>Diferencias (CSV):</b></label>
                    <textarea id="diffInputScan" rows="8" placeholder="Pega el CSV de diferencias..."></textarea>
                    <div class="row"><button id="uploadDiffScanBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="diffScanFile" accept=".csv" style="display:none;"></div></div>
                    <div><div class="row"><b>Nombre Escaneo:</b> <input type="text" id="scanNameScan" value="ESCANEO" style="width:140px;"></div>
                    <label><b>Escaneo (formato crudo):</b></label>
                    <textarea id="scanInputScan" rows="8" placeholder="Pega el contenido del escaneo (tallas o CSV)..." rows="8"></textarea>
                    <div class="row"><button id="uploadScanScanBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="scanScanFile" accept=".csv,.txt" style="display:none;"></div></div>
                </div>
                <div class="row">
                    <button id="processScanBtn" class="btn-primary"><i class="fas fa-play"></i> Procesar Compensación</button>
                    <button id="updateDifferencesBtn" class="btn-secondary" style="background: #444; border-color: #ffa500;"><i class="fas fa-sync-alt"></i> Actualizar diferencias</button>
                </div>
                <div id="compScanMessage" class="message"></div>
                <div id="compScanOutputContainer" style="display:none;">
                    <h3 style="color:#f1c40f;"><i class="fas fa-exchange-alt"></i> Compensaciones encontradas</h3>
                    
                    <!-- Dropdowns para nombre en Compensaciones Scan -->
                    <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                        <b><i class="fas fa-tag"></i> Configurar nombre de archivo (Compensaciones):</b>
                        <div class="row">
                            <select id="tipoOrigenScanComp" style="width:130px;">
                                <option value="">(seleccionar)</option>
                                <option value="escaneo">escaneo</option>
                                <option value="existencia">existencia</option>
                            </select>
                            <select id="tipoUbicacionScanComp" style="width:150px;">
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
                            <select id="tipoCategoriaScanComp" style="width:120px;">
                                <option value="">(seleccionar)</option>
                                <option value="home">home</option>
                                <option value="calzado">calzado</option>
                                <option value="ropa">ropa</option>
                                <option value="catalogos">catalogos</option>
                            </select>
                            <input type="text" id="nombrePersonalizadoScanComp" placeholder="Personalizado" style="width:130px;">
                            <input type="text" id="sufijoAdicionalScanComp" placeholder="Sufijo extra" style="width:100px;">
                        </div>
                    </div>
                    
                    <div class="row">
                        <button id="copyCompScanTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyCompScanCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="compScanFilename" value="archivo.csv" style="width:280px;">
                        <button id="downloadCompScanBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="compScanCopyFeedback"></span>
                    </div>
                    <div class="output-area" id="compScanOutput" style="max-height:400px; overflow:auto;"></div>
                    
                    <hr style="border-color:#e74c3c; margin:1.5rem 0;">
                    <h3 style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Diferencias restantes</h3>
                    <!-- Dropdowns para nombre en Diferencias restantes (con "diferencias" fijo) -->
                    <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                        <b><i class="fas fa-tag"></i> Configurar nombre de archivo (Diferencias restantes):</b>
                        <div class="row">
                            <div style="display:inline-flex; align-items:center; gap:5px;">
                                <span style="background:var(--blu); padding:0.2rem 0.5rem; border-radius:4px;">diferencias</span>
                            </div>
                            <select id="tipoUbicacionDif" style="width:150px;">
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
                            <select id="tipoCategoriaDif" style="width:120px;">
                                <option value="">(seleccionar)</option>
                                <option value="home">home</option>
                                <option value="calzado">calzado</option>
                                <option value="ropa">ropa</option>
                                <option value="catalogos">catalogos</option>
                            </select>
                            <input type="text" id="nombrePersonalizadoDif" placeholder="Personalizado" style="width:130px;">
                            <input type="text" id="sufijoAdicionalDif" placeholder="Sufijo extra" style="width:100px;">
                        </div>
                    </div>
                    
                    <div class="row">
                        <button id="copyDifScanTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyDifScanCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="difScanFilename" value="diferencias.csv" style="width:280px;">
                        <button id="downloadDifScanBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="difScanCopyFeedback"></span>
                    </div>
                    <div class="output-area" id="difScanOutput" style="max-height:400px; overflow:auto;"></div>
                </div>
            </div>
            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Instrucciones – Compensación de Diferencias</b><br>
                <b>Diferencia vs Diferencia:</b> Compara dos archivos de diferencias y muestra qué mover de un folio a otro.<br>
                <b>Diferencia vs Escaneo:</b> El escaneo se procesa con el mismo motor que el detector de ubicación.<br>
                Use el conmutador para elegir si compensar faltantes o sobrantes.<br>
                <b>Botón "Actualizar diferencias":</b> Toma los resultados restantes y los coloca en el campo "Diferencias (CSV)".
            </div>
        </div>
    `;

    // Configurar uploads
    core.setupFileUpload('uploadDif1DiffBtn', 'dif1FileDiff', 'dif1InputDiff');
    core.setupFileUpload('uploadDif2DiffBtn', 'dif2FileDiff', 'dif2InputDiff');
    core.setupFileUpload('uploadDiffScanBtn', 'diffScanFile', 'diffInputScan');
    core.setupFileUpload('uploadScanScanBtn', 'scanScanFile', 'scanInputScan');

    // ==================== FUNCIONES PARA NOMBRES ====================
    function construirNombreConDropdowns(prefix, fijo = null) {
        let tipoOrigen = fijo;
        if (!tipoOrigen) {
            tipoOrigen = document.getElementById(`tipoOrigen${prefix}`)?.value || '';
        }
        const tipoUbicacion = document.getElementById(`tipoUbicacion${prefix}`)?.value || '';
        const tipoCategoria = document.getElementById(`tipoCategoria${prefix}`)?.value || '';
        const nombrePersonalizado = document.getElementById(`nombrePersonalizado${prefix}`)?.value || '';
        const sufijoAdicional = document.getElementById(`sufijoAdicional${prefix}`)?.value || '';
        let base = tipoOrigen;
        if (tipoUbicacion) base += tipoUbicacion;
        if (tipoCategoria) base += tipoCategoria;
        if (nombrePersonalizado) base += nombrePersonalizado;
        if (sufijoAdicional) base += sufijoAdicional;
        return base;
    }

    function actualizarNombreArchivo(prefix, filenameId, fijo = null) {
        const nombreBase = construirNombreConDropdowns(prefix, fijo);
        const filenameInput = document.getElementById(filenameId);
        if (nombreBase && filenameInput) {
            filenameInput.value = `${nombreBase}.csv`;
        } else if (filenameInput) {
            filenameInput.value = 'archivo.csv';
        }
    }

    // Inicializar listeners para Diferencia vs Diferencia
    const diffPrefixes = ['Comp', 'Dif1', 'Dif2'];
    diffPrefixes.forEach(prefix => {
        const selects = document.querySelectorAll(`#tipoOrigen${prefix}, #tipoUbicacion${prefix}, #tipoCategoria${prefix}, #nombrePersonalizado${prefix}, #sufijoAdicional${prefix}`);
        selects.forEach(el => {
            if (el) {
                el.addEventListener('input', () => actualizarNombreArchivo(prefix, `${prefix === 'Comp' ? 'compDiff' : prefix === 'Dif1' ? 'dif1Diff' : 'dif2Diff'}Filename`));
                if (el.type === 'checkbox') el.addEventListener('change', () => actualizarNombreArchivo(prefix, `${prefix === 'Comp' ? 'compDiff' : prefix === 'Dif1' ? 'dif1Diff' : 'dif2Diff'}Filename`));
            }
        });
        actualizarNombreArchivo(prefix, `${prefix === 'Comp' ? 'compDiff' : prefix === 'Dif1' ? 'dif1Diff' : 'dif2Diff'}Filename`);
    });

    // Inicializar listeners para Diferencia vs Escaneo - Compensaciones
    const scanCompSelects = document.querySelectorAll('#tipoOrigenScanComp, #tipoUbicacionScanComp, #tipoCategoriaScanComp, #nombrePersonalizadoScanComp, #sufijoAdicionalScanComp');
    scanCompSelects.forEach(el => {
        if (el) {
            el.addEventListener('input', () => actualizarNombreArchivo('ScanComp', 'compScanFilename'));
            if (el.type === 'checkbox') el.addEventListener('change', () => actualizarNombreArchivo('ScanComp', 'compScanFilename'));
        }
    });
    actualizarNombreArchivo('ScanComp', 'compScanFilename');

    // Para Diferencias restantes (con "diferencias" fijo)
    function construirNombreDifScan() {
        const tipoOrigen = 'diferencias';
        const tipoUbicacion = document.getElementById('tipoUbicacionDif')?.value || '';
        const tipoCategoria = document.getElementById('tipoCategoriaDif')?.value || '';
        const nombrePersonalizado = document.getElementById('nombrePersonalizadoDif')?.value || '';
        const sufijoAdicional = document.getElementById('sufijoAdicionalDif')?.value || '';
        let base = tipoOrigen;
        if (tipoUbicacion) base += tipoUbicacion;
        if (tipoCategoria) base += tipoCategoria;
        if (nombrePersonalizado) base += nombrePersonalizado;
        if (sufijoAdicional) base += sufijoAdicional;
        return base;
    }

    function actualizarNombreDifScan() {
        const nombreBase = construirNombreDifScan();
        const filenameInput = document.getElementById('difScanFilename');
        if (filenameInput) filenameInput.value = `${nombreBase}.csv`;
    }

    const difSelects = document.querySelectorAll('#tipoUbicacionDif, #tipoCategoriaDif, #nombrePersonalizadoDif, #sufijoAdicionalDif');
    difSelects.forEach(el => {
        if (el) {
            el.addEventListener('input', actualizarNombreDifScan);
            if (el.type === 'checkbox') el.addEventListener('change', actualizarNombreDifScan);
        }
    });
    actualizarNombreDifScan();

    // ==================== LÓGICA PRINCIPAL ====================
    function parsearDiferenciasCSV(raw) {
        let clean = raw.replace(/^\uFEFF/, '').trim();
        const parsed = Papa.parse(clean, { header: true, skipEmptyLines: true, dynamicTyping: false });
        return parsed.data.filter(r => {
            if (!r.MODELO || !r.TALLA) return false;
            const tal = String(r.TALLA || '').toUpperCase();
            if (tal === 'TOTAL' || tal === 'TOTALES:' || tal.includes('TOTAL')) return false;
            const dif = parseInt(r.DIFERENCIA);
            if (isNaN(dif) || dif === 0) return false;
            const modelo = String(r.MODELO).trim();
            const linea = String(r.LINEA || '').trim();
            const tipo = String(r.TIPO || '').trim();
            if (modelo === '1' && linea === 'RS' && tipo === 'TX') return false;
            return true;
        }).map(r => ({
            MODELO: String(r.MODELO).trim(),
            LINEA: String(r.LINEA || '').trim(),
            TIPO: String(r.TIPO || '').trim(),
            TALLA: String(r.TALLA).trim(),
            CANTIDAD_REAL: parseInt(r.CANTIDAD_REAL) || 0,
            CANTIDAD_COMPARAR: parseInt(r.CANTIDAD_COMPARAR) || 0,
            DIFERENCIA: parseInt(r.DIFERENCIA) || 0
        }));
    }

    function setupCompButtons(pref, varName, fbId, filenameId, ticketDataGetter = null) {
        const btnTsv = document.getElementById(`copy${pref}TsvBtn`);
        const btnCsv = document.getElementById(`copy${pref}CsvBtn`);
        const btnDownload = document.getElementById(`download${pref}Btn`);
        if(btnTsv) btnTsv.onclick = () => { 
            const df = window[varName]; if (!df || !df.length) return;
            const ticketMode = document.getElementById('compTicketMode').checked;
            let content = (ticketMode && ticketDataGetter) ? core.dfToCsv(ticketDataGetter(), '\t', false, true) : core.dfToCsv(df, '\t', true, true);
            core.copiarTexto(content, fbId);
        };
        if(btnCsv) btnCsv.onclick = () => { 
            const df = window[varName]; if (!df || !df.length) return;
            const ticketMode = document.getElementById('compTicketMode').checked;
            let content = (ticketMode && ticketDataGetter) ? core.dfToCsv(ticketDataGetter(), ',', false, true) : core.dfToCsv(df, ',', true, true);
            core.copiarTexto(content, fbId);
        };
        if(btnDownload) btnDownload.onclick = () => { 
            const df = window[varName]; if (!df || !df.length) return;
            let fn = document.getElementById(filenameId)?.value || 'archivo.csv';
            if (!fn.endsWith('.csv')) fn += '.csv';
            const ticketMode = document.getElementById('compTicketMode').checked;
            let content = (ticketMode && ticketDataGetter) ? core.dfToCsv(ticketDataGetter(), ',', false, true) : core.dfToCsv(df, ',', true, true);
            core.downloadCsv(content, fn);
        };
    }

    // ==================== FUNCIÓN PARA RENDERIZAR TABLA CON COLORES ====================
    function renderTableWithColors(df, tipo = 'compensacion') {
        if (!df || !df.length) return '<p>Sin datos</p>';
        const headers = Object.keys(df[0]);
        let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr>';
        headers.forEach(h => {
            if (h === 'ACCION') {
                html += `<th style="background:#f1c40f; color:#000;">${h}</th>`;
            } else {
                html += `<th>${h}</th>`;
            }
        });
        html += '</tr></thead><tbody>';
        df.forEach((r, idx) => {
            let rowStyle = '';
            if (r.ACCION && r.ACCION.includes('Mover')) {
                rowStyle = 'background:#2a4a2a;';
            } else if (r.TALLA === 'TOTALES:') {
                rowStyle = 'background:#333;';
            }
            html += `<tr style="${rowStyle}">`;
            headers.forEach(h => {
                let cellStyle = '';
                let valor = r[h] ?? '';
                if (h === 'ACCION' && valor && valor.includes('Mover')) {
                    cellStyle = 'color:#2ecc71; font-weight:bold;';
                }
                html += `<td style="${cellStyle}">${valor}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    // ==================== DIFERENCIA vs DIFERENCIA (CORREGIDO) ====================
    document.getElementById('processCompDiffBtn').onclick = () => {
        const raw1 = document.getElementById('dif1InputDiff').value.trim();
        const raw2 = document.getElementById('dif2InputDiff').value.trim();
        const name1 = document.getElementById('folio1NameDiff').value.trim() || 'FOLIO1';
        const name2 = document.getElementById('folio2NameDiff').value.trim() || 'FOLIO2';
        const msgEl = document.getElementById('compDiffMessage');
        const outContainer = document.getElementById('compDiffOutputContainer');
        if (!raw1 || !raw2) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ambos campos de diferencias deben tener contenido.'; outContainer.style.display='none'; return; }
        try {
            const lib = core.obtenerBiblioteca();
            
            function normalizarTallaParaComparacion(talla) {
                if (!talla) return '';
                return String(talla).trim().toUpperCase().replace(/\s+/g, '');
            }
            
            let data1 = parsearDiferenciasCSV(raw1);
            let data2 = parsearDiferenciasCSV(raw2);
            
            const map1 = new Map();
            data1.forEach(row => {
                const tallaNorm = normalizarTallaParaComparacion(row.TALLA);
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${tallaNorm}`;
                map1.set(key, { ...row, TALLA_NORM: tallaNorm });
            });
            
            const map2 = new Map();
            data2.forEach(row => {
                const tallaNorm = normalizarTallaParaComparacion(row.TALLA);
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${tallaNorm}`;
                map2.set(key, { ...row, TALLA_NORM: tallaNorm });
            });
            
            const compensaciones = [];
            const movimientos = [];
            const movimientosA = []; // Folio1 -> Folio2
            const movimientosB = []; // Folio2 -> Folio1
            let totalCompensado = 0;
            
            const allKeys = new Set([...map1.keys(), ...map2.keys()]);
            
            allKeys.forEach(key => {
                const r1 = map1.get(key);
                const r2 = map2.get(key);
                
                if (!r1 || !r2) return;
                
                const d1 = r1.DIFERENCIA;
                const d2 = r2.DIFERENCIA;
                
                // Solo compensar si uno es faltante y el otro sobrante
                if ((d1 < 0 && d2 > 0) || (d1 > 0 && d2 < 0)) {
                    const compensado = Math.min(Math.abs(d1), Math.abs(d2));
                    const rem1 = d1 < 0 ? d1 + compensado : d1 - compensado;
                    const rem2 = d2 < 0 ? d2 + compensado : d2 - compensado;
                    
                    let direccion = '';
                    let origen = '';
                    let destino = '';
                    
                    // CORREGIDO: La dirección correcta es:
                    // - Si FOLIO1 tiene FALTANTE (d1 < 0) y FOLIO2 tiene SOBRANTE (d2 > 0) 
                    //   → Mover de FOLIO2 → FOLIO1 (el sobrante de FOLIO2 cubre el faltante de FOLIO1)
                    // - Si FOLIO1 tiene SOBRANTE (d1 > 0) y FOLIO2 tiene FALTANTE (d2 < 0)
                    //   → Mover de FOLIO1 → FOLIO2 (el sobrante de FOLIO1 cubre el faltante de FOLIO2)
                    if (d1 < 0 && d2 > 0) {
                        // FOLIO1: FALTANTE, FOLIO2: SOBRANTE → mover de FOLIO2 → FOLIO1
                        direccion = `Mover ${compensado} de ${name2} → ${name1}`;
                        origen = name2;
                        destino = name1;
                        movimientosB.push({ ...r1, cantidad: compensado, origen, destino, TALLA_ORIGINAL: r1.TALLA });
                    } else if (d1 > 0 && d2 < 0) {
                        // FOLIO1: SOBRANTE, FOLIO2: FALTANTE → mover de FOLIO1 → FOLIO2
                        direccion = `Mover ${compensado} de ${name1} → ${name2}`;
                        origen = name1;
                        destino = name2;
                        movimientosA.push({ ...r1, cantidad: compensado, origen, destino, TALLA_ORIGINAL: r1.TALLA });
                    }
                    
                    compensaciones.push({
                        MODELO: r1.MODELO,
                        LINEA: r1.LINEA,
                        TIPO: r1.TIPO,
                        TALLA: r1.TALLA_ORIGINAL || r1.TALLA,
                        CANTIDAD_REAL: r1.CANTIDAD_REAL,
                        [`CANTIDAD_${name1}`]: r1.CANTIDAD_COMPARAR,
                        [`CANTIDAD_${name2}`]: r2.CANTIDAD_COMPARAR,
                        [`DIF_${name1}`]: d1,
                        [`DIF_${name2}`]: d2,
                        COMPENSADO: compensado,
                        [`DIF_REST_${name1}`]: rem1,
                        [`DIF_REST_${name2}`]: rem2,
                        ACCION: direccion
                    });
                    
                    movimientos.push({
                        MODELO: r1.MODELO,
                        LINEA: r1.LINEA,
                        TIPO: r1.TIPO,
                        TALLA: r1.TALLA_ORIGINAL || r1.TALLA,
                        CANTIDAD: compensado,
                        ORIGEN: origen,
                        DESTINO: destino,
                        ACCION: direccion
                    });
                    
                    totalCompensado += compensado;
                    r1.DIFERENCIA = rem1;
                    r2.DIFERENCIA = rem2;
                    if (rem1 === 0) map1.delete(key);
                    if (rem2 === 0) map2.delete(key);
                }
            });
            
            // Generar códigos EAN-13 para cada movimiento
            function generarCodigosParaMovimientos(movs) {
                const resultados = [];
                for (const m of movs) {
                    const encontrado = core.buscarCodigoEnBiblioteca(m.MODELO, m.LINEA, m.TIPO, lib);
                    if (encontrado) {
                        const codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, m.TALLA);
                        resultados.push({
                            ...m,
                            CODIGO_9: encontrado.CODIGO,
                            CODIGO_EAN13: codigoEAN13,
                            valido: core.verificarCodigoEAN13(codigoEAN13)
                        });
                    } else {
                        resultados.push({
                            ...m,
                            CODIGO_9: 'No encontrado',
                            CODIGO_EAN13: null,
                            valido: false
                        });
                    }
                }
                return resultados;
            }
            
            const movimientosAConCodigos = generarCodigosParaMovimientos(movimientosA);
            const movimientosBConCodigos = generarCodigosParaMovimientos(movimientosB);
            
            window.movimientosAConCodigos = movimientosAConCodigos;
            window.movimientosBConCodigos = movimientosBConCodigos;
            window.nombreFolio1 = name1;
            window.nombreFolio2 = name2;
            
            // Generar AHK para ambos tipos de movimientos
            function generarAHKParaMovimientos(movs, titulo) {
                if (!movs || movs.length === 0) return null;
                const codigosConCantidad = movs
                    .filter(m => m.CODIGO_EAN13)
                    .map(m => ({ codigo: m.CODIGO_EAN13, cantidad: m.CANTIDAD }));
                if (codigosConCantidad.length === 0) return null;
                return core.generarAHKDesdeCodigosConCantidad(codigosConCantidad, titulo);
            }
            
            window.ahkFolio1aFolio2 = generarAHKParaMovimientos(movimientosAConCodigos, `Movimientos de ${name1} → ${name2}`);
            window.ahkFolio2aFolio1 = generarAHKParaMovimientos(movimientosBConCodigos, `Movimientos de ${name2} → ${name1}`);
            
            // Mostrar movimientos
            const accionesContainer = document.getElementById('accionesMovimientoContainer');
            if (movimientos.length > 0) {
                let accHtml = '<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">';
                accHtml += '<thead><tr style="background:#1a3a1a; color:#2ecc71;"><th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th><th style="text-align:right;">CANTIDAD</th><th>ACCIÓN</th><th>CÓDIGO EAN-13</th></tr></thead><tbody>';
                for (const m of movimientos) {
                    const movConCodigo = [...movimientosAConCodigos, ...movimientosBConCodigos].find(
                        mm => mm.MODELO === m.MODELO && mm.LINEA === m.LINEA && mm.TIPO === m.TIPO && mm.TALLA === m.TALLA
                    );
                    const codigoStr = movConCodigo && movConCodigo.CODIGO_EAN13 ? movConCodigo.CODIGO_EAN13 : '—';
                    accHtml += `<tr style="border-bottom:1px solid #2ecc71;">
                        <td>${m.MODELO}</td>
                        <td>${m.LINEA}</td>
                        <td>${m.TIPO}</td>
                        <td>${m.TALLA}</td>
                        <td style="text-align:right; font-weight:bold; color:#2ecc71;">${m.CANTIDAD}</td>
                        <td style="font-weight:bold; color:#f1c40f;">${m.ACCION}</td>
                        <td style="font-family:monospace; font-size:0.8rem;">${core.escapeHtml(codigoStr)}</td>
                    </tr>`;
                }
                accHtml += '</tbody></table>';
                accionesContainer.innerHTML = accHtml;
            } else {
                accionesContainer.innerHTML = '<p style="color:#2ecc71;"><i class="fas fa-check-circle"></i> No se requieren movimientos.</p>';
            }
            
            // Botones de AHK
            const botonesContainer = document.getElementById('accionesBotonesContainer');
            if (!botonesContainer) {
                const newBotones = document.createElement('div');
                newBotones.id = 'accionesBotonesContainer';
                newBotones.className = 'row';
                newBotones.style.marginTop = '0.5rem';
                newBotones.innerHTML = `
                    <button id="downloadAhkA" class="btn-secondary" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> AHK ${name1} → ${name2}</button>
                    <button id="downloadAhkB" class="btn-secondary" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> AHK ${name2} → ${name1}</button>
                    <button id="copyAhkA" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK ${name1}→${name2}</button>
                    <button id="copyAhkB" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK ${name2}→${name1}</button>
                `;
                accionesContainer.parentNode.insertBefore(newBotones, accionesContainer.nextSibling);
                
                document.getElementById('downloadAhkA').addEventListener('click', () => {
                    const ahk = window.ahkFolio1aFolio2;
                    if (!ahk) { 
                        document.getElementById('compDiffMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay movimientos de ' + window.nombreFolio1 + ' → ' + window.nombreFolio2;
                        return; 
                    }
                    const blob = new Blob([ahk], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `movimientos_${window.nombreFolio1}_a_${window.nombreFolio2}.ahk`;
                    a.click();
                    URL.revokeObjectURL(url);
                });
                document.getElementById('downloadAhkB').addEventListener('click', () => {
                    const ahk = window.ahkFolio2aFolio1;
                    if (!ahk) { 
                        document.getElementById('compDiffMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay movimientos de ' + window.nombreFolio2 + ' → ' + window.nombreFolio1;
                        return; 
                    }
                    const blob = new Blob([ahk], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `movimientos_${window.nombreFolio2}_a_${window.nombreFolio1}.ahk`;
                    a.click();
                    URL.revokeObjectURL(url);
                });
                document.getElementById('copyAhkA').addEventListener('click', () => {
                    const ahk = window.ahkFolio1aFolio2;
                    if (!ahk) { 
                        document.getElementById('compDiffMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay movimientos de ' + window.nombreFolio1 + ' → ' + window.nombreFolio2;
                        return; 
                    }
                    core.copiarTexto(ahk, 'compDiffCopyFeedback');
                });
                document.getElementById('copyAhkB').addEventListener('click', () => {
                    const ahk = window.ahkFolio2aFolio1;
                    if (!ahk) { 
                        document.getElementById('compDiffMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay movimientos de ' + window.nombreFolio2 + ' → ' + window.nombreFolio1;
                        return; 
                    }
                    core.copiarTexto(ahk, 'compDiffCopyFeedback');
                });
            } else {
                const btnA = document.getElementById('downloadAhkA');
                const btnB = document.getElementById('downloadAhkB');
                if (btnA) btnA.innerHTML = `<i class="fas fa-code"></i> AHK ${name1} → ${name2}`;
                if (btnB) btnB.innerHTML = `<i class="fas fa-code"></i> AHK ${name2} → ${name1}`;
            }
            
            // Resto del código
            const makeDF = (map, nombreFolio) => {
                const arr = Array.from(map.values()).map(r => ({
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA_ORIGINAL || r.TALLA,
                    CANTIDAD_REAL: r.CANTIDAD_REAL,
                    [`CANTIDAD_${nombreFolio}`]: r.CANTIDAD_COMPARAR,
                    RESULTADO: r.DIFERENCIA < 0 ? 'FALTANTE' : 'SOBRANTE',
                    DIFERENCIA: r.DIFERENCIA
                }));
                arr.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                if (arr.length) {
                    const tr = arr.reduce((s, r) => s + r.CANTIDAD_REAL, 0);
                    const tc = arr.reduce((s, r) => s + r[`CANTIDAD_${nombreFolio}`], 0);
                    const falt = arr.filter(r => r.DIFERENCIA < 0).reduce((s, r) => s + Math.abs(r.DIFERENCIA), 0);
                    const sobr = arr.filter(r => r.DIFERENCIA > 0).reduce((s, r) => s + r.DIFERENCIA, 0);
                    const tab = arr.reduce((s, r) => s + Math.abs(r.DIFERENCIA), 0);
                    arr.push({
                        MODELO: '',
                        LINEA: '',
                        TIPO: '',
                        TALLA: 'TOTALES:',
                        CANTIDAD_REAL: tr,
                        [`CANTIDAD_${nombreFolio}`]: tc,
                        RESULTADO: `Faltante: ${falt} | Sobrante: ${sobr}`,
                        DIFERENCIA: tab
                    });
                }
                return arr;
            };
            
            const dif1Comp = makeDF(map1, name1);
            const dif2Comp = makeDF(map2, name2);
            
            if (compensaciones.length) {
                compensaciones.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                const trc = compensaciones.reduce((s, r) => s + r.CANTIDAD_REAL, 0);
                const tc1 = compensaciones.reduce((s, r) => s + r[`CANTIDAD_${name1}`], 0);
                const tc2 = compensaciones.reduce((s, r) => s + r[`CANTIDAD_${name2}`], 0);
                const td1 = compensaciones.reduce((s, r) => s + Math.abs(r[`DIF_${name1}`]), 0);
                const td2 = compensaciones.reduce((s, r) => s + Math.abs(r[`DIF_${name2}`]), 0);
                const tr1 = compensaciones.reduce((s, r) => s + Math.abs(r[`DIF_REST_${name1}`]), 0);
                const tr2 = compensaciones.reduce((s, r) => s + Math.abs(r[`DIF_REST_${name2}`]), 0);
                compensaciones.push({
                    MODELO: '',
                    LINEA: '',
                    TIPO: '',
                    TALLA: 'TOTALES:',
                    CANTIDAD_REAL: trc,
                    [`CANTIDAD_${name1}`]: tc1,
                    [`CANTIDAD_${name2}`]: tc2,
                    [`DIF_${name1}`]: td1,
                    [`DIF_${name2}`]: td2,
                    COMPENSADO: totalCompensado,
                    [`DIF_REST_${name1}`]: tr1,
                    [`DIF_REST_${name2}`]: tr2,
                    ACCION: ''
                });
            }
            
            window.compensacionesDiffDf = compensaciones;
            window.dif1DiffCompDf = dif1Comp;
            window.dif2DiffCompDf = dif2Comp;
            
            document.getElementById('compDiffOutput').innerHTML = renderTableWithColors(compensaciones, 'compensacion');
            document.getElementById('dif1DiffOutput').innerHTML = renderTableWithColors(dif1Comp, 'restante');
            document.getElementById('dif2DiffOutput').innerHTML = renderTableWithColors(dif2Comp, 'restante');
            document.getElementById('dif1DiffLabel').textContent = name1;
            document.getElementById('dif2DiffLabel').textContent = name2;
            outContainer.style.display = 'block';
            
            const dataRows1 = dif1Comp.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
            const falt1 = dataRows1.reduce((s, r) => r.DIFERENCIA < 0 ? s + Math.abs(r.DIFERENCIA) : s, 0);
            const sobr1 = dataRows1.reduce((s, r) => r.DIFERENCIA > 0 ? s + r.DIFERENCIA : s, 0);
            const dataRows2 = dif2Comp.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
            const falt2 = dataRows2.reduce((s, r) => r.DIFERENCIA < 0 ? s + Math.abs(r.DIFERENCIA) : s, 0);
            const sobr2 = dataRows2.reduce((s, r) => r.DIFERENCIA > 0 ? s + r.DIFERENCIA : s, 0);
            msgEl.innerHTML = `<i class="fas fa-check-circle"></i> <b>${compensaciones.length ? compensaciones.length - 1 : 0}</b> compensaciones (unidades compensadas: <b>${totalCompensado}</b>).<br><b>${name1}:</b> faltante ${falt1}, sobrante ${sobr1}<br><b>${name2}:</b> faltante ${falt2}, sobrante ${sobr2}`;
        } catch (e) {
            msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: ' + e.message;
            outContainer.style.display = 'none';
            console.error(e);
        }
    };
    
    function getCompDiffTicketData() { return (window.compensacionesDiffDf || []).filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, COMPENSADO: r.COMPENSADO, ACCION: r.ACCION })); }
    function getDif1DiffTicketData() { return (window.dif1DiffCompDf || []).filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, DIFERENCIA: r.DIFERENCIA })); }
    function getDif2DiffTicketData() { return (window.dif2DiffCompDf || []).filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, DIFERENCIA: r.DIFERENCIA })); }
    setupCompButtons('CompDiff', 'compensacionesDiffDf', 'compDiffCopyFeedback', 'compDiffFilename', getCompDiffTicketData);
    setupCompButtons('Dif1Diff', 'dif1DiffCompDf', 'dif1DiffCopyFeedback', 'dif1DiffFilename', getDif1DiffTicketData);
    setupCompButtons('Dif2Diff', 'dif2DiffCompDf', 'dif2DiffCopyFeedback', 'dif2DiffFilename', getDif2DiffTicketData);

    // ==================== DIFERENCIA vs ESCANEO ====================
    let scanMode = 'faltante';
    const toggleScan = document.querySelectorAll('#scanModeToggle .toggle-option');
    if (toggleScan.length) {
        toggleScan.forEach(opt => {
            opt.addEventListener('click', function() {
                toggleScan.forEach(o => o.classList.remove('active-toggle'));
                this.classList.add('active-toggle');
                scanMode = this.dataset.mode;
            });
        });
    }
    document.getElementById('processScanBtn').onclick = () => {
        const diffRaw = document.getElementById('diffInputScan').value.trim();
        const scanRaw = document.getElementById('scanInputScan').value.trim();
        const diffName = document.getElementById('folioDifNameScan').value.trim() || 'FOLIO';
        const scanName = document.getElementById('scanNameScan').value.trim() || 'ESCANEO';
        const msgEl = document.getElementById('compScanMessage');
        const outContainer = document.getElementById('compScanOutputContainer');
        if (!diffRaw || !scanRaw) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ambos campos deben tener contenido.'; outContainer.style.display='none'; return; }
        try {
            const diffData = parsearDiferenciasCSV(diffRaw);
            const scanData = core.extraerModelosConCantidad(scanRaw);
            const diffMap = new Map();
            diffData.forEach(row => { const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`; diffMap.set(key, { ...row }); });
            const scanMap = new Map();
            scanData.forEach(item => { const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}`; scanMap.set(key, (scanMap.get(key)||0) + item.CANTIDAD); });
            const compensaciones = []; let totalCompensado = 0;
            const keysBoth = new Set([...diffMap.keys()].filter(k => {
                const [modelo, linea, tipo, talla] = k.split('|');
                const keySinTalla = `${modelo}|${linea}|${tipo}`;
                return scanMap.has(keySinTalla);
            }));
            if (scanMode === 'faltante') {
                keysBoth.forEach(key => {
                    const diffRow = diffMap.get(key);
                    if (diffRow.DIFERENCIA < 0) {
                        const faltante = Math.abs(diffRow.DIFERENCIA);
                        const [modelo, linea, tipo, talla] = key.split('|');
                        const keySinTalla = `${modelo}|${linea}|${tipo}`;
                        const escaneado = scanMap.get(keySinTalla) || 0;
                        const compensado = Math.min(faltante, escaneado);
                        if (compensado > 0) {
                            const rem = diffRow.DIFERENCIA + compensado;
                            compensaciones.push({ MODELO: diffRow.MODELO, LINEA: diffRow.LINEA, TIPO: diffRow.TIPO, TALLA: diffRow.TALLA, CANTIDAD_REAL: diffRow.CANTIDAD_REAL, CANTIDAD_ORIGINAL_DIF: diffRow.CANTIDAD_COMPARAR, FALTANTE_ORIGINAL: -faltante, CANTIDAD_ESCANEADA: escaneado, COMPENSADO: compensado, FALTANTE_RESTANTE: rem });
                            totalCompensado += compensado;
                            diffRow.DIFERENCIA = rem;
                            if (rem === 0) diffMap.delete(key);
                        }
                    }
                });
            } else {
                keysBoth.forEach(key => {
                    const diffRow = diffMap.get(key);
                    if (diffRow.DIFERENCIA > 0) {
                        const sobrante = diffRow.DIFERENCIA;
                        const [modelo, linea, tipo, talla] = key.split('|');
                        const keySinTalla = `${modelo}|${linea}|${tipo}`;
                        const escaneado = scanMap.get(keySinTalla) || 0;
                        const compensado = Math.min(sobrante, escaneado);
                        if (compensado > 0) {
                            const rem = diffRow.DIFERENCIA - compensado;
                            compensaciones.push({ MODELO: diffRow.MODELO, LINEA: diffRow.LINEA, TIPO: diffRow.TIPO, TALLA: diffRow.TALLA, CANTIDAD_REAL: diffRow.CANTIDAD_REAL, CANTIDAD_ORIGINAL_DIF: diffRow.CANTIDAD_COMPARAR, SOBRANTE_ORIGINAL: sobrante, CANTIDAD_ESCANEADA: escaneado, COMPENSADO: compensado, SOBRANTE_RESTANTE: rem });
                            totalCompensado += compensado;
                            diffRow.DIFERENCIA = rem;
                            if (rem === 0) diffMap.delete(key);
                        }
                    }
                });
            }
            let difComp = Array.from(diffMap.values()).map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, TALLA: r.TALLA, CANTIDAD_REAL: r.CANTIDAD_REAL, CANTIDAD_COMPARAR: r.CANTIDAD_COMPARAR, RESULTADO: r.DIFERENCIA < 0 ? 'FALTANTE' : (r.DIFERENCIA > 0 ? 'SOBRANTE' : ''), DIFERENCIA: r.DIFERENCIA }));
            difComp.sort((a,b)=>(parseInt(a.MODELO)||0)-(parseInt(b.MODELO)||0));
            if (difComp.length) {
                const tr = difComp.reduce((s,r)=>s+r.CANTIDAD_REAL,0), tc = difComp.reduce((s,r)=>s+r.CANTIDAD_COMPARAR,0);
                const falt = difComp.filter(r=>r.DIFERENCIA<0).reduce((s,r)=>s+Math.abs(r.DIFERENCIA),0);
                const sobr = difComp.filter(r=>r.DIFERENCIA>0).reduce((s,r)=>s+r.DIFERENCIA,0);
                const tab = difComp.reduce((s,r)=>s+Math.abs(r.DIFERENCIA),0);
                difComp.push({MODELO:'',LINEA:'',TIPO:'',TALLA:'TOTALES:',CANTIDAD_REAL:tr,CANTIDAD_COMPARAR:tc,RESULTADO:`Faltante: ${falt} | Sobrante: ${sobr}`,DIFERENCIA:tab});
            }
            if (compensaciones.length) {
                compensaciones.sort((a,b)=>(parseInt(a.MODELO)||0)-(parseInt(b.MODELO)||0));
                const trc = compensaciones.reduce((s,r)=>s+r.CANTIDAD_REAL,0);
                const tcr = compensaciones.reduce((s,r)=>s+r.CANTIDAD_ORIGINAL_DIF,0);
                if (scanMode === 'faltante') {
                    const tfo = compensaciones.reduce((s,r)=>s+Math.abs(r.FALTANTE_ORIGINAL),0);
                    const tce = compensaciones.reduce((s,r)=>s+r.CANTIDAD_ESCANEADA,0);
                    const tcp = compensaciones.reduce((s,r)=>s+r.COMPENSADO,0);
                    const tfr = compensaciones.reduce((s,r)=>s+Math.abs(r.FALTANTE_RESTANTE),0);
                    compensaciones.push({MODELO:'',LINEA:'',TIPO:'',TALLA:'TOTALES:',CANTIDAD_REAL:trc,CANTIDAD_ORIGINAL_DIF:tcr,FALTANTE_ORIGINAL:-tfo,CANTIDAD_ESCANEADA:tce,COMPENSADO:tcp,FALTANTE_RESTANTE:-tfr});
                } else {
                    const tso = compensaciones.reduce((s,r)=>s+Math.abs(r.SOBRANTE_ORIGINAL),0);
                    const tce = compensaciones.reduce((s,r)=>s+r.CANTIDAD_ESCANEADA,0);
                    const tcp = compensaciones.reduce((s,r)=>s+r.COMPENSADO,0);
                    const tsr = compensaciones.reduce((s,r)=>s+Math.abs(r.SOBRANTE_RESTANTE),0);
                    compensaciones.push({MODELO:'',LINEA:'',TIPO:'',TALLA:'TOTALES:',CANTIDAD_REAL:trc,CANTIDAD_ORIGINAL_DIF:tcr,SOBRANTE_ORIGINAL:tso,CANTIDAD_ESCANEADA:tce,COMPENSADO:tcp,SOBRANTE_RESTANTE:tsr});
                }
            }
            window.compensacionesScanDf = compensaciones;
            window.difScanCompDf = difComp;
            document.getElementById('compScanOutput').innerHTML = renderTableWithColors(compensaciones, 'compensacion');
            document.getElementById('difScanOutput').innerHTML = renderTableWithColors(difComp, 'restante');
            outContainer.style.display='block';
            const dataRows = difComp.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
            const faltRest = dataRows.reduce((s, r) => r.DIFERENCIA < 0 ? s + Math.abs(r.DIFERENCIA) : s, 0);
            const sobrRest = dataRows.reduce((s, r) => r.DIFERENCIA > 0 ? s + r.DIFERENCIA : s, 0);
            const numComp = compensaciones.length ? compensaciones.length-1 : 0;
            if (scanMode === 'faltante') msgEl.innerHTML = `<i class="fas fa-check-circle"></i> <b>${numComp}</b> faltantes cubiertos (unidades compensadas: <b>${totalCompensado}</b>).<br>Diferencias restantes - <b>Faltante: ${faltRest}</b>, <b>Sobrante: ${sobrRest}</b>.`;
            else msgEl.innerHTML = `<i class="fas fa-check-circle"></i> <b>${numComp}</b> sobrantes cubiertos (unidades compensadas: <b>${totalCompensado}</b>).<br>Diferencias restantes - <b>Faltante: ${faltRest}</b>, <b>Sobrante: ${sobrRest}</b>.`;
        } catch(e) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: '+e.message; outContainer.style.display='none'; console.error(e); }
    };
    function getCompScanTicketData() { return (window.compensacionesScanDf || []).filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, COMPENSADO: r.COMPENSADO })); }
    function getDifScanTicketData() { return (window.difScanCompDf || []).filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, DIFERENCIA: r.DIFERENCIA })); }
    setupCompButtons('CompScan', 'compensacionesScanDf', 'compScanCopyFeedback', 'compScanFilename', getCompScanTicketData);
    setupCompButtons('DifScan', 'difScanCompDf', 'difScanCopyFeedback', 'difScanFilename', getDifScanTicketData);
    document.getElementById('updateDifferencesBtn').addEventListener('click', () => {
        const difScanData = window.difScanCompDf;
        if (!difScanData || !difScanData.length) { document.getElementById('compScanMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos en "Diferencias compensadas (restantes)".'; return; }
        const dataToExport = difScanData.filter(row => row.TALLA !== 'TOTALES:' && row.TALLA !== 'TOTAL');
        if (dataToExport.length === 0) { document.getElementById('compScanMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay filas de datos para actualizar.'; return; }
        const csvContent = core.dfToCsv(dataToExport, ',', true, true);
        document.getElementById('diffInputScan').value = csvContent;
        document.getElementById('compScanMessage').innerHTML = '<i class="fas fa-check-circle"></i> Diferencias actualizadas en el campo "Diferencias (CSV)".';
        setTimeout(() => { const msgDiv = document.getElementById('compScanMessage'); if (msgDiv.innerHTML.includes('actualizadas')) msgDiv.innerHTML = ''; }, 3000);
    });

    // ==================== CAMBIO ENTRE SUBMÓDULOS ====================
    const subTabs = document.querySelectorAll('#compensacionSubTabs .sub-module-tab');
    const diffDiffDiv = document.getElementById('subDiffDiff');
    const diffScanDiv = document.getElementById('subDiffScan');
    
    function setActiveCompensacionPanel(mode) {
        if (mode === 'diffDiff') {
            diffDiffDiv.classList.add('active');
            diffScanDiv.classList.remove('active');
        } else {
            diffDiffDiv.classList.remove('active');
            diffScanDiv.classList.add('active');
        }
        if (window.updateHash) {
            window.updateHash('tab5', mode);
        }
    }
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const mode = this.dataset.submode;
            setActiveCompensacionPanel(mode);
        });
    });
    
    setActiveCompensacionPanel('diffDiff');
    
    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab5' && e.detail.subMode) {
            const targetTab = document.querySelector(`#compensacionSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== LIMPIAR MÓDULO ====================
    const clearBtn = document.querySelector('#tab5 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Diferencia vs Diferencia
            document.getElementById('dif1InputDiff').value = '';
            document.getElementById('dif2InputDiff').value = '';
            document.getElementById('folio1NameDiff').value = 'FOLIO1';
            document.getElementById('folio2NameDiff').value = 'FOLIO2';
            const diffIds = ['tipoOrigenComp', 'tipoUbicacionComp', 'tipoCategoriaComp', 'nombrePersonalizadoComp', 'sufijoAdicionalComp'];
            diffIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'SELECT') el.value = '';
                    else if (el.tagName === 'INPUT') el.value = '';
                }
            });
            document.getElementById('compDiffOutputContainer').style.display = 'none';
            document.getElementById('compDiffOutput').innerHTML = '';
            document.getElementById('dif1DiffOutput').innerHTML = '';
            document.getElementById('dif2DiffOutput').innerHTML = '';
            document.getElementById('compDiffMessage').innerHTML = '';
            document.getElementById('accionesMovimientoContainer').innerHTML = '';
            document.getElementById('accionesBotonesContainer').innerHTML = '';
            // Diferencia vs Escaneo
            document.getElementById('diffInputScan').value = '';
            document.getElementById('scanInputScan').value = '';
            document.getElementById('folioDifNameScan').value = 'FOLIO';
            document.getElementById('scanNameScan').value = 'ESCANEO';
            const scanIds = ['tipoOrigenScanComp', 'tipoUbicacionScanComp', 'tipoCategoriaScanComp', 'nombrePersonalizadoScanComp', 'sufijoAdicionalScanComp'];
            scanIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'SELECT') el.value = '';
                    else if (el.tagName === 'INPUT') el.value = '';
                }
            });
            const difRestIds = ['tipoUbicacionDif', 'tipoCategoriaDif', 'nombrePersonalizadoDif', 'sufijoAdicionalDif'];
            difRestIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'SELECT') el.value = '';
                    else if (el.tagName === 'INPUT') el.value = '';
                }
            });
            document.getElementById('compScanOutputContainer').style.display = 'none';
            document.getElementById('compScanOutput').innerHTML = '';
            document.getElementById('difScanOutput').innerHTML = '';
            document.getElementById('compScanMessage').innerHTML = '';
            window.compensacionesDiffDf = null;
            window.dif1DiffCompDf = null;
            window.dif2DiffCompDf = null;
            window.compensacionesScanDf = null;
            window.difScanCompDf = null;
            window.movimientosAConCodigos = null;
            window.movimientosBConCodigos = null;
            window.ahkFolio1aFolio2 = null;
            window.ahkFolio2aFolio1 = null;
            // Resetear toggle de modo
            const faltanteToggle = document.querySelector('#scanModeToggle .toggle-option[data-mode="faltante"]');
            if (faltanteToggle) faltanteToggle.click();
            // Forzar actualización de nombres
            actualizarNombreArchivo('Comp', 'compDiffFilename');
            actualizarNombreArchivo('Dif1', 'dif1DiffFilename');
            actualizarNombreArchivo('Dif2', 'dif2DiffFilename');
            actualizarNombreArchivo('ScanComp', 'compScanFilename');
            actualizarNombreDifScan();
        });
    }
})();