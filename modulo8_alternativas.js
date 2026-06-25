// modulo8_alternativas.js (completo, sin comentarios)
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
                <h3><i class="fas fa-barcode"></i> Códigos de Barra</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v2.9</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
            <div class="sub-module-tabs" id="alternativasSubTabs">
                <div class="sub-module-tab active" data-submode="generador">Generador</div>
                <div class="sub-module-tab" data-submode="reversa">Reversa</div>
            </div>
            <div id="alternativasGenerador" class="sub-panel active">
                <div id="alternativasMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Generador EAN-13</b><br>
                    1. Cada pestaña es independiente.<br>
                    2. Formato: <code>MODELO LINEA TIPO TALLA [CANTIDAD]</code><br>
                    3. Ejemplo: <code>2558 NE TXS 25 3</code> → genera 3 códigos EAN-13.<br>
                    4. <b>AUTOSERVICIO:</b> añade un 0 al final del código (13 → 14 dígitos).<br>
                    5. <b>Pantalón/Cinto:</b> usa las tablas <code>pantsSizes.csv</code> y <code>cintosSizes.csv</code>.<br>
                    6. <b>CSV/TSV:</b> formato compatible con módulo 1 (MODELO, LINEA, TIPO, TALLA, CANTIDAD).<br>
                    7. <b>AHK:</b> usa <kbd>Ctrl+Q</kbd> para ejecutar, <kbd>Shift+Esc</kbd> para abortar.<br>
                    8. <b>AHK con muchos códigos:</b> se dividen automáticamente en grupos de 50 con Sleep 100ms entre grupos y entre cada código.
                </div>
            </div>
            <div id="alternativasReversa" class="sub-panel">
                <div id="reversaMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Reversa</b><br>
                    1. Pega códigos EAN-13/14 para decodificar.<br>
                    2. <b>AUTOSERVICIO:</b> quita el último 0 de códigos de 14 dígitos.<br>
                    3. <b>CSV/TSV:</b> formato compatible con módulo 1 (MODELO, LINEA, TIPO, TALLA, CANTIDAD).<br>
                    4. <b>AHK:</b> descarga script con los códigos originales.
                </div>
            </div>
        </div>
    `;

    function generarAHKConCancelar(codigosConCantidad, titulo = '') {
        if (!codigosConCantidad || codigosConCantidad.length === 0) return null;
        let codigosExpandidos = [];
        for (const item of codigosConCantidad) {
            let cant = 1;
            if (item.cantidad !== undefined && item.cantidad !== null) {
                cant = parseInt(item.cantidad);
                if (isNaN(cant) || cant < 1) cant = 1;
            }
            const codigo = item.codigo || item.codigoFinal || item;
            if (typeof codigo === 'string') {
                for (let i = 0; i < cant; i++) {
                    codigosExpandidos.push(codigo);
                }
            }
        }
        if (codigosExpandidos.length === 0) return null;
        const MAX_CODIGOS_POR_GRUPO = 50;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigosExpandidos.length} envíos\n\n`;
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        const grupos = [];
        for (let i = 0; i < codigosExpandidos.length; i += MAX_CODIGOS_POR_GRUPO) {
            grupos.push(codigosExpandidos.slice(i, i + MAX_CODIGOS_POR_GRUPO));
        }
        for (let g = 0; g < grupos.length; g++) {
            const grupo = grupos[g];
            const codigosStr = grupo.map(c => `"${c}"`).join(', ');
            ahk += `    codigos${g+1} := [${codigosStr}]\n`;
        }
        ahk += '    grupos := [';
        for (let g = 0; g < grupos.length; g++) {
            ahk += `codigos${g+1}`;
            if (g < grupos.length - 1) ahk += ', ';
        }
        ahk += ']\n';
        ahk += '    for grupoIndex, grupo in grupos\n';
        ahk += '    {\n';
        ahk += '        if abort\n';
        ahk += '            break\n';
        ahk += '        for index, codigo in grupo\n';
        ahk += '        {\n';
        ahk += '            if abort\n';
        ahk += '                break\n';
        ahk += '            SendInput %codigo%{Enter}\n';
        ahk += '            Sleep 100\n';
        ahk += '        }\n';
        ahk += '        Sleep 100\n';
        ahk += '    }\n';
        ahk += 'Return\n\n';
        ahk += '+Esc::\n';
        ahk += '    abort := true\n';
        ahk += '    Send, {Esc}\n';
        ahk += 'Return';
        return ahk;
    }

    let generadorTabCounter = 1;
    let activeGeneradorTabId = 'gen_tab_0';

    function getGeneradorPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="generador-panel">
                <div class="toggle-group" id="genMainToggle_${tabId}" style="margin-bottom:0.8rem;">
                    <span class="toggle-option active-toggle" data-op="sumar">➕ SUMAR</span>
                    <span class="toggle-option" data-op="restar">➖ RESTAR</span>
                </div>
                <div class="row" style="margin-bottom:0.5rem; flex-wrap:wrap; gap:1rem;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genAutoservicioCheckbox" style="width:16px; height:16px;"> <strong>AUTOSERVICIO</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genOrdenAscendenteCheckbox" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genTicketModeCheckbox" style="width:16px; height:16px;"> <strong>MODO TICKET</strong>
                    </label>
                </div>
                <div class="row" style="margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <button class="marcarTodosPantalonBtn" style="background:#4a6a4a; border-color:#4a6a4a;"><i class="fas fa-tshirt"></i> Marcar todos como Pantalón</button>
                    <button class="marcarTodosCintoBtn" style="background:#6a4a3a; border-color:#6a4a3a;"><i class="fas fa-belt"></i> Marcar todos como Cinto</button>
                    <button class="marcarTodosNormalBtn" style="background:#444; border-color:#444;"><i class="fas fa-undo"></i> Restaurar a Normal</button>
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

        const autoservicioCheckbox = panel.querySelector('.genAutoservicioCheckbox');
        const ordenAscendenteCheckbox = panel.querySelector('.genOrdenAscendenteCheckbox');
        const ticketModeCheckbox = panel.querySelector('.genTicketModeCheckbox');
        const addFolioBtn = panel.querySelector('.addMainFolioBtn');
        const addMultipleBtn = panel.querySelector('.addMultipleFoliosBtn');
        const multipleCountInput = panel.querySelector('.addMultipleFoliosInput');
        const removeAllBtn = panel.querySelector('.removeAllFoliosBtn');
        const foliosContainer = panel.querySelector('.mainFoliosContainer');
        const importMultipleBtn = panel.querySelector('.importMultipleCsvBtn');
        const importFileInput = panel.querySelector('.importMultipleFileInput');

        const marcarPantalonBtn = panel.querySelector('.marcarTodosPantalonBtn');
        const marcarCintoBtn = panel.querySelector('.marcarTodosCintoBtn');
        const marcarNormalBtn = panel.querySelector('.marcarTodosNormalBtn');

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

        function aFormatoModulo1(resultados, ticketMode) {
            if (ticketMode) {
                return resultados.map(r => ({
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA,
                    CANTIDAD: r.CANTIDAD
                }));
            }
            return resultados.map(r => ({
                MODELO: r.MODELO,
                LINEA: r.LINEA,
                TIPO: r.TIPO,
                TALLA: r.TALLA,
                CANTIDAD: r.CANTIDAD,
                AUTOSERVICIO: r.AUTOSERVICIO || '',
                CODIGO_FINAL: r.CODIGO_FINAL || '',
                TIPO_PRENDA: r.TIPO_PRENDA || 'Normal'
            }));
        }

        function recalcularCodigo(rowData, autoservicio) {
            const talla = rowData.TALLA;
            const tipoPrenda = rowData.TIPO_PRENDA || 'Normal';
            const codigo9 = rowData.CODIGO_9;
            if (!codigo9) return rowData.CODIGO_FINAL;
            const tallaCode = core.formatearTallaConTipo(talla, tipoPrenda);
            let codigoFinal = core.generarCodigoEAN13(codigo9, tallaCode);
            if (autoservicio) {
                codigoFinal = codigoFinal + '0';
            }
            return codigoFinal;
        }

        function renderTablaConTipoPrenda(df, autoservicio) {
            if (!df || !df.length) return '<p>Sin datos</p>';
            const headers = ['MODELO', 'LINEA', 'TIPO', 'TALLA', 'CANTIDAD', 'AUTOSERVICIO', 'CODIGO_FINAL', 'TIPO_PRENDA'];
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr>';
            headers.forEach(h => {
                if (h === 'TIPO_PRENDA') {
                    html += `<th>Tipo</th>`;
                } else {
                    html += `<th>${h}</th>`;
                }
            });
            html += '<th>Acción</th></tr></thead><tbody>';
            df.forEach((r, idx) => {
                const isTotal = r.TALLA === 'TOTAL';
                html += '<tr>';
                headers.forEach(h => {
                    let val = r[h] ?? '';
                    if (h === 'CODIGO_FINAL' && val) {
                        html += `<td style="font-family:monospace; font-weight:bold;">${val}</td>`;
                    } else if (h === 'AUTOSERVICIO' && val) {
                        html += `<td style="color:#2ecc71; font-size:1.1rem;">✅</td>`;
                    } else if (h === 'TIPO_PRENDA') {
                        if (isTotal) {
                            html += `<td></td>`;
                        } else {
                            html += `<td>
                                <select class="tipo-prenda-select" data-index="${idx}" style="background:var(--blud); color:var(--white); border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.3rem; font-size:0.7rem;">
                                    <option value="Normal" ${val === 'Normal' ? 'selected' : ''}>Normal</option>
                                    <option value="Pantalón" ${val === 'Pantalón' ? 'selected' : ''}>👖 Pantalón</option>
                                    <option value="Cinto" ${val === 'Cinto' ? 'selected' : ''}>🔗 Cinto</option>
                                </select>
                            </td>`;
                        }
                    } else {
                        html += `<td>${val}</td>`;
                    }
                });
                if (isTotal || !r.CODIGO_FINAL) {
                    html += '<td></td>';
                } else {
                    html += `<td><button class="copy-individual-btn" data-codigo="${r.CODIGO_FINAL}" style="background:#444; border:1px solid var(--blu); color:white; padding:0.2rem 0.5rem; border-radius:3px; cursor:pointer; font-size:0.7rem;"><i class="fas fa-copy"></i></button></td>`;
                }
                html += '</tr>';
            });
            html += '</tbody></table>';
            return html;
        }

        function actualizarTabla(dfFinal, autoservicio) {
            const df = dfFinal;
            if (!df || df.length === 0) return;
            const nuevos = df.map(r => {
                if (r.TALLA === 'TOTAL') return r;
                const nuevoCodigo = recalcularCodigo(r, autoservicio);
                return { ...r, CODIGO_FINAL: nuevoCodigo };
            });
            window[`dfGen_${panelId}`] = nuevos;
            outputDiv.innerHTML = renderTablaConTipoPrenda(nuevos, autoservicio);
            outputDiv.querySelectorAll('.tipo-prenda-select').forEach(sel => {
                sel.addEventListener('change', function() {
                    const idx = parseInt(this.dataset.index);
                    const tipo = this.value;
                    const dfActual = window[`dfGen_${panelId}`];
                    if (dfActual && dfActual[idx]) {
                        dfActual[idx].TIPO_PRENDA = tipo;
                        const autoservicio = autoservicioCheckbox.checked;
                        const nuevoCodigo = recalcularCodigo(dfActual[idx], autoservicio);
                        dfActual[idx].CODIGO_FINAL = nuevoCodigo;
                        actualizarTabla(dfActual, autoservicio);
                    }
                });
            });
        }

        function marcarTodos(tipo) {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) return;
            const autoservicio = autoservicioCheckbox.checked;
            for (const r of df) {
                if (r.TALLA === 'TOTAL') continue;
                const tallaNum = parseFloat(r.TALLA);
                if (!isNaN(tallaNum) && tallaNum >= 0) {
                    r.TIPO_PRENDA = tipo;
                }
            }
            actualizarTabla(df, autoservicio);
        }

        marcarPantalonBtn.addEventListener('click', () => marcarTodos('Pantalón'));
        marcarCintoBtn.addEventListener('click', () => marcarTodos('Cinto'));
        marcarNormalBtn.addEventListener('click', () => marcarTodos('Normal'));

        function procesarEntrada(texto) {
            const lib = getBiblioteca();
            if (lib.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> La biblioteca no está cargada.';
                return null;
            }
            if (!texto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para procesar.';
                return null;
            }
            const items = core.parsearEntradaUniversal(texto);
            if (items.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar la entrada.';
                return null;
            }
            const autoservicio = autoservicioCheckbox.checked;
            const resultados = [];
            let errores = 0;
            for (const item of items) {
                let encontrado = null;
                let modelo = item.modelo;
                let linea = item.linea || '';
                let tipoVal = item.tipo || '';
                let talla = item.talla || '';
                let cantidad = item.cantidad || 1;
                if (item.codigoEncontrado) {
                    encontrado = lib.find(reg => String(reg.CODIGO).trim() === String(item.codigoEncontrado).trim());
                    if (encontrado) {
                        modelo = encontrado.MODELO;
                        linea = encontrado.LINEA;
                        tipoVal = encontrado.TIPO;
                    }
                }
                if (!encontrado && item.codigoEAN13) {
                    const decodificado = core.decodificarCodigoEAN13(item.codigoEAN13, lib);
                    if (decodificado) {
                        modelo = decodificado.modelo;
                        linea = decodificado.linea;
                        tipoVal = decodificado.tipo;
                        talla = decodificado.talla;
                        encontrado = { MODELO: modelo, LINEA: linea, TIPO: tipoVal };
                    }
                }
                if (!encontrado) {
                    const resultadoBusqueda = core.buscarCodigoPrioritario(modelo, linea, tipoVal, lib);
                    if (resultadoBusqueda) {
                        encontrado = resultadoBusqueda;
                        linea = encontrado.LINEA;
                        tipoVal = encontrado.TIPO;
                    }
                }
                if (!encontrado) {
                    errores++;
                    continue;
                }
                if (!linea) linea = encontrado.LINEA;
                if (!tipoVal) tipoVal = encontrado.TIPO;
                let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, talla);
                if (autoservicio) {
                    codigoFinal = codigoFinal + '0';
                }
                resultados.push({
                    MODELO: modelo,
                    LINEA: linea,
                    TIPO: tipoVal,
                    TALLA: talla,
                    CANTIDAD: cantidad,
                    AUTOSERVICIO: autoservicio ? '✅' : '',
                    CODIGO_FINAL: codigoFinal,
                    TIPO_PRENDA: 'Normal',
                    CODIGO_9: encontrado.CODIGO
                });
            }
            if (resultados.length === 0) {
                messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontraron coincidencias. ${errores > 0 ? `(${errores} errores)` : ''}`;
                return null;
            }
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Procesados ${resultados.length} códigos. ${errores > 0 ? `⚠️ ${errores} errores.` : ''}`;
            return resultados;
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
            let dfFinal = Array.from(mapFinal.values());
            if (ordenAscendenteCheckbox.checked) {
                dfFinal.sort((a,b) => a.CODIGO_FINAL.localeCompare(b.CODIGO_FINAL));
            }
            const total = dfFinal.reduce((s, r) => s + r.CANTIDAD, 0);
            const totalRow = {
                MODELO: '',
                LINEA: '',
                TIPO: '',
                TALLA: 'TOTAL',
                CANTIDAD: total,
                AUTOSERVICIO: '',
                CODIGO_FINAL: '',
                TIPO_PRENDA: '',
                CODIGO_9: ''
            };
            const dfConTotal = [...dfFinal, totalRow];
            const ticketMode = ticketModeCheckbox.checked;
            window[`dfGen_${panelId}`] = dfConTotal;
            window[`dfGenModulo1_${panelId}`] = aFormatoModulo1(dfFinal, ticketMode);
            const autoservicio = autoservicioCheckbox.checked;
            actualizarTabla(dfConTotal, autoservicio);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Operación completada. Total: <b>${total}</b> unidades en <b>${dfFinal.length}</b> códigos.`;
        });

        outputDiv.addEventListener('click', (e) => {
            const btn = e.target.closest('.copy-individual-btn');
            if (btn) {
                const codigo = btn.dataset.codigo;
                if (codigo) {
                    navigator.clipboard.writeText(codigo).then(() => {
                        const original = btn.innerHTML;
                        btn.innerHTML = '✅';
                        setTimeout(() => { btn.innerHTML = original; }, 1500);
                    }).catch(() => {});
                }
            }
        });

        downloadAhkBtn.addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos.'; return; }
            const datos = df.filter(r => r.TALLA !== 'TOTAL');
            const ordenAscendente = ordenAscendenteCheckbox.checked;
            let datosOrdenados = [...datos];
            if (ordenAscendente) {
                datosOrdenados.sort((a,b) => a.CODIGO_FINAL.localeCompare(b.CODIGO_FINAL));
            }
            const codigosConCantidad = datosOrdenados.map(r => {
                let cant = parseInt(r.CANTIDAD);
                if (isNaN(cant) || cant < 1) cant = 1;
                return {
                    codigo: r.CODIGO_FINAL,
                    cantidad: cant
                };
            });
            const ahk = generarAHKConCancelar(codigosConCantidad, `Códigos EAN-13 generados (${codigosConCantidad.reduce((s, i) => s + i.cantidad, 0)} envíos)`);
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
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado (${codigosConCantidad.reduce((s, i) => s + i.cantidad, 0)} envíos).`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        copyAhkBtn.addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) { messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos.'; return; }
            const datos = df.filter(r => r.TALLA !== 'TOTAL');
            const ordenAscendente = ordenAscendenteCheckbox.checked;
            let datosOrdenados = [...datos];
            if (ordenAscendente) {
                datosOrdenados.sort((a,b) => a.CODIGO_FINAL.localeCompare(b.CODIGO_FINAL));
            }
            const codigosConCantidad = datosOrdenados.map(r => {
                let cant = parseInt(r.CANTIDAD);
                if (isNaN(cant) || cant < 1) cant = 1;
                return {
                    codigo: r.CODIGO_FINAL,
                    cantidad: cant
                };
            });
            const ahk = generarAHKConCancelar(codigosConCantidad, `Códigos EAN-13 generados (${codigosConCantidad.reduce((s, i) => s + i.cantidad, 0)} envíos)`);
            if (!ahk) return;
            core.copiarTexto(ahk, copyFeedbackSpan);
        });

        panel.querySelector('.copyMainTsvBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfGenModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, '\t', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.copyMainCsvBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfGenModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, ',', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.downloadMainBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfGenModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'codigos.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, ',', true, true);
            }
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

    let reversaTabCounter = 1;
    let activeReversaTabId = 'rev_tab_0';

    function getReversaPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="reversa-panel">
                <div class="row" style="margin-bottom:0.8rem; flex-wrap:wrap; gap:1rem;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revAutoservicioCheckbox" style="width:16px; height:16px;"> <strong>AUTOSERVICIO</strong> (quita 0 final de 14 dígitos)
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revOrdenAscendenteCheckbox" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revTicketModeCheckbox" style="width:16px; height:16px;"> <strong>MODO TICKET</strong>
                    </label>
                </div>
                <label class="form-label"><b>Códigos EAN-13/14:</b></label>
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
                <div class="row">
                    <button class="downloadReversaAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button class="copyReversaAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    function initReversaPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const autoservicioCheckbox = panel.querySelector('.revAutoservicioCheckbox');
        const ordenAscendenteCheckbox = panel.querySelector('.revOrdenAscendenteCheckbox');
        const ticketModeCheckbox = panel.querySelector('.revTicketModeCheckbox');
        const uploadBtn = panel.querySelector('.uploadReversaBtn');
        const fileInput = panel.querySelector('.reversaFile');
        const inputTextarea = panel.querySelector('.reversaMaestroInput');
        const processBtn = panel.querySelector('.processReversaBtn');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');
        const filenameInput = panel.querySelector('.reversaFilename');
        const copyFeedbackSpan = panel.querySelector('.copy-feedback');
        const downloadAhkBtn = panel.querySelector('.downloadReversaAhkBtn');
        const copyAhkBtn = panel.querySelector('.copyReversaAhkBtn');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { inputTextarea.value = ev.target.result; fileInput.value = ''; }; r.readAsText(f); });

        let codigosOriginales = [];

        function aFormatoModulo1Reversa(resultados, ticketMode) {
            if (ticketMode) {
                return resultados.filter(r => r.MODELO !== 'No encontrado').map(r => ({
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA,
                    CANTIDAD: 1
                }));
            }
            return resultados.filter(r => r.MODELO !== 'No encontrado').map(r => ({
                CODIGO_ORIGINAL: r.CODIGO_ORIGINAL || '',
                MODELO: r.MODELO,
                LINEA: r.LINEA,
                TIPO: r.TIPO,
                TALLA: r.TALLA,
                AUTOSERVICIO: r.AUTOSERVICIO || '',
                VALIDO: r.VALIDO || ''
            }));
        }

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
            const autoservicio = autoservicioCheckbox.checked;
            const patron = /\b(\d{13,14})\b/g;
            const codigos = [];
            let match;
            while ((match = patron.exec(texto)) !== null) {
                codigos.push(match[1]);
            }
            if (codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron códigos de 13/14 dígitos.';
                return;
            }
            codigosOriginales = codigos;
            const resultados = [];
            for (let codigo of codigos) {
                let codigoOriginal = codigo;
                let codigoParaDecodificar = codigo;
                let autoservicioMarcado = false;
                if (autoservicio && codigo.length === 14 && codigo.endsWith('0')) {
                    codigoParaDecodificar = codigo.slice(0, 13);
                    autoservicioMarcado = true;
                }
                const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                if (decodificado) {
                    const esAutoservicio = (codigoOriginal.length === 14) || autoservicioMarcado;
                    resultados.push({
                        CODIGO_ORIGINAL: codigoOriginal,
                        CODIGO_DECODIFICADO: codigoParaDecodificar,
                        MODELO: decodificado.modelo,
                        LINEA: decodificado.linea,
                        TIPO: decodificado.tipo,
                        TALLA: decodificado.talla,
                        AUTOSERVICIO: esAutoservicio ? '✅' : '',
                        VALIDO: decodificado.valido ? 'Sí' : 'No'
                    });
                } else {
                    const modelo = codigo.slice(0, 5);
                    const encontrado = core.buscarCodigoEnBiblioteca(modelo, '', '', lib);
                    if (encontrado) {
                        const tallaCode = codigo.slice(9, 12);
                        const tallaNum = parseInt(tallaCode);
                        let talla = '';
                        if (tallaNum % 10 === 5) talla = String(tallaNum / 10);
                        else talla = String(tallaNum / 10);
                        const esAutoservicio = codigo.length === 14;
                        resultados.push({
                            CODIGO_ORIGINAL: codigo,
                            CODIGO_DECODIFICADO: codigo,
                            MODELO: encontrado.MODELO,
                            LINEA: encontrado.LINEA,
                            TIPO: encontrado.TIPO,
                            TALLA: talla,
                            AUTOSERVICIO: esAutoservicio ? '✅' : '',
                            VALIDO: '⚠️ (por modelo)'
                        });
                    } else {
                        resultados.push({
                            CODIGO_ORIGINAL: codigo,
                            CODIGO_DECODIFICADO: codigo,
                            MODELO: 'No encontrado',
                            LINEA: '-',
                            TIPO: '-',
                            TALLA: '-',
                            AUTOSERVICIO: '',
                            VALIDO: 'No'
                        });
                    }
                }
            }
            const ticketMode = ticketModeCheckbox.checked;
            window[`dfRev_${panelId}`] = resultados;
            window[`dfRevModulo1_${panelId}`] = aFormatoModulo1Reversa(resultados, ticketMode);
            outputDiv.innerHTML = renderTablaReversa(resultados);
            const validos = resultados.filter(r => r.VALIDO === 'Sí').length;
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Decodificados ${codigos.length} códigos. Válidos: ${validos}.`;
        }

        function renderTablaReversa(df) {
            if (!df || !df.length) return '<p>Sin datos</p>';
            const headers = ['CODIGO_ORIGINAL', 'MODELO', 'LINEA', 'TIPO', 'TALLA', 'AUTOSERVICIO', 'VALIDO'];
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            df.forEach(r => {
                html += '<tr>';
                headers.forEach(h => {
                    let val = r[h] ?? '';
                    if (h === 'AUTOSERVICIO' && val) {
                        html += `<td style="color:#2ecc71; font-size:1.1rem;">✅</td>`;
                    } else if (h === 'CODIGO_ORIGINAL' && val) {
                        html += `<td style="font-family:monospace;">${val}</td>`;
                    } else {
                        html += `<td>${val}</td>`;
                    }
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            return html;
        }

        processBtn.addEventListener('click', procesarReversa);

        panel.querySelector('.copyReversaTsvBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfRevModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, '\t', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.copyReversaCsvBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfRevModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, ',', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.downloadReversaBtn').addEventListener('click', () => {
            const dfModulo1 = window[`dfRevModulo1_${panelId}`];
            if (!dfModulo1 || !dfModulo1.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'decodificados.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const ticketMode = ticketModeCheckbox.checked;
            let content = '';
            if (ticketMode) {
                content = dfModulo1.map(r => `${r.MODELO},${r.LINEA},${r.TIPO},${r.TALLA},${r.CANTIDAD}`).join('\n');
            } else {
                content = core.dfToCsv(dfModulo1, ',', true, true);
            }
            core.downloadCsv(content, filename);
        });

        downloadAhkBtn.addEventListener('click', () => {
            if (codigosOriginales.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para AHK.';
                return;
            }
            let codigosAHK = [...codigosOriginales];
            if (ordenAscendenteCheckbox.checked) {
                codigosAHK.sort((a,b) => a.localeCompare(b));
            }
            const codigosConCantidad = codigosAHK.map(c => ({ codigo: c, cantidad: 1 }));
            const ahk = generarAHKConCancelar(codigosConCantidad, `Códigos EAN-13 decodificados (${codigosAHK.length} códigos)`);
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
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado (${codigosAHK.length} códigos).`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        copyAhkBtn.addEventListener('click', () => {
            if (codigosOriginales.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para AHK.';
                return;
            }
            let codigosAHK = [...codigosOriginales];
            if (ordenAscendenteCheckbox.checked) {
                codigosAHK.sort((a,b) => a.localeCompare(b));
            }
            const codigosConCantidad = codigosAHK.map(c => ({ codigo: c, cantidad: 1 }));
            const ahk = generarAHKConCancelar(codigosConCantidad, `Códigos EAN-13 decodificados (${codigosAHK.length} códigos)`);
            if (!ahk) return;
            core.copiarTexto(ahk, copyFeedbackSpan);
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

    initGeneradorMultiTabs();
    initReversaMultiTabs();

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
                const autoservicio = panel.querySelector('.genAutoservicioCheckbox');
                if (autoservicio) autoservicio.checked = false;
                const orden = panel.querySelector('.genOrdenAscendenteCheckbox');
                if (orden) orden.checked = true;
                const ticket = panel.querySelector('.genTicketModeCheckbox');
                if (ticket) ticket.checked = false;
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
                const autoservicio = panel.querySelector('.revAutoservicioCheckbox');
                if (autoservicio) autoservicio.checked = false;
                const orden = panel.querySelector('.revOrdenAscendenteCheckbox');
                if (orden) orden.checked = true;
                const ticket = panel.querySelector('.revTicketModeCheckbox');
                if (ticket) ticket.checked = false;
                codigosOriginales = [];
            });
            window.dfGen = null;
            window.dfRev = null;
        });
    }
})();