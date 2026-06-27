// Módulo Códigos de Barra - Generador y decodificador de códigos EAN-13
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
                    2. Formato: <code>MODELO LINEA TIPO TALLA [CANTIDAD]</code> o CSV con columnas MODELO,LINEA,TIPO,TALLA,CANTIDAD.<br>
                    3. Ejemplo: <code>2558 NE TXS 25 3</code> → genera 3 códigos EAN-13.<br>
                    4. <b>AUTOSERVICIO:</b> añade un 0 al final del código (13 → 14 dígitos).<br>
                    5. <b>Botones 🩳 y 👔</b> en cada fila para cambiar el tipo de talla (Pantalón/Cinto/Normal).<br>
                    6. <b>CSV/TSV:</b> formato compatible con módulo 1 (MODELO, LINEA, TIPO, TALLA, CANTIDAD).<br>
                    7. <b>AHK:</b> usa <kbd>Ctrl+Q</kbd> para ejecutar, <kbd>Shift+Esc</kbd> para abortar.<br>
                    8. <b>AHK con muchos códigos:</b> se dividen automáticamente en grupos de 50 con Sleep 100ms entre grupos.
                </div>
            </div>
            
            <div id="alternativasReversa" class="sub-panel">
                <div id="reversaMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Reversa</b><br>
                    1. Pega códigos EAN-13/14 para decodificar.<br>
                    2. <b>AUTOSERVICIO:</b> quita el último 0 de códigos de 14 dígitos.<br>
                    3. <b>CSV/TSV:</b> formato compatible con módulo 1 (MODELO, LINEA, TIPO, TALLA, CANTIDAD).<br>
                    4. <b>AHK:</b> descarga script con los códigos originales. Usa <kbd>Ctrl+Q</kbd> para ejecutar, <kbd>Shift+Esc</kbd> para abortar.
                </div>
            </div>
        </div>
    `;

    // ==================== FUNCIONES COMPARTIDAS ====================
    
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
        ahk += '        }\n';
        ahk += '        Sleep 100\n';
        ahk += '    }\n';
        ahk += '    SoundBeep\n';
        ahk += 'Return\n\n';
        ahk += '+Esc::\n';
        ahk += '    abort := true\n';
        ahk += '    Send, {Esc}\n';
        ahk += 'Return';
        return ahk;
    }

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
                
                <div class="row" style="margin-bottom:0.5rem; flex-wrap:wrap; gap:1rem;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genAutoservicioCheckbox" style="width:16px; height:16px;"> <strong>AUTOSERVICIO</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genOrdenAscendenteCheckbox" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="genTicketModeCheckbox" style="width:16px; height:16px;"> <strong>MODO TICKET</strong> (solo MODELO, LINEA, TIPO, TALLA, CANTIDAD)
                    </label>
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

        // Almacenar datos con tipo de talla por fila
        let datosActuales = [];

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
                CODIGO_FINAL: r.CODIGO_FINAL || ''
            }));
        }

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
            
            const items = core.parsearEntradaUniversal(texto);
            
            if (items.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar la entrada. Revisa el formato.';
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
                
                // Calcular código con talla normal por defecto
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
                    CODIGO_BASE: encontrado.CODIGO,
                    tipoTalla: 'normal' // por defecto
                });
            }
            if (resultados.length === 0) {
                messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontraron coincidencias. ${errores > 0 ? `(${errores} errores)` : ''}`;
                return null;
            }
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Procesados ${resultados.length} códigos. ${errores > 0 ? `⚠️ ${errores} errores.` : ''}`;
            return resultados;
        }

        // Función para recalcular código de un ítem según tipo de talla
        function recalcularCodigo(item, nuevoTipo) {
            const lib = getBiblioteca();
            if (!lib.length) return item;
            const autoservicio = autoservicioCheckbox.checked;
            // Buscar el registro en biblioteca para obtener CODIGO_BASE
            let encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (!encontrado) {
                encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
            }
            if (!encontrado) return item;
            
            // Cambiar el modo de talla temporalmente
            const modoAnterior = core.getTallaMode();
            core.setTallaMode(nuevoTipo);
            let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA);
            core.setTallaMode(modoAnterior);
            
            if (autoservicio) {
                codigoFinal = codigoFinal + '0';
            }
            
            return {
                ...item,
                CODIGO_FINAL: codigoFinal,
                tipoTalla: nuevoTipo
            };
        }

        // Función para renderizar tabla con botones de talla
        function renderTablaConBotones(df, panelId) {
            if (!df || !df.length) return '<p>Sin datos</p>';
            const headers = ['MODELO', 'LINEA', 'TIPO', 'TALLA', 'CANTIDAD', 'AUTOSERVICIO', 'CODIGO_FINAL', 'TALLA'];
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '<th>Acción</th>';
            html += '</tr></thead><tbody>';
            df.forEach((r, idx) => {
                const isTotal = r.TALLA === 'TOTAL';
                html += '<tr>';
                headers.forEach(h => {
                    let val = r[h] ?? '';
                    if (h === 'CODIGO_FINAL' && val) {
                        html += `<td style="font-family:monospace; font-weight:bold;">${val}</td>`;
                    } else if (h === 'AUTOSERVICIO' && val) {
                        html += `<td style="color:#2ecc71; font-size:1.1rem;">✅</td>`;
                    } else if (h === 'TALLA' && !isTotal) {
                        // Aquí mostramos los botones de talla
                        const tipo = r.tipoTalla || 'normal';
                        const iconPants = (tipo === 'pantalon') ? '🩳✅' : '🩳';
                        const iconBelt = (tipo === 'cinto') ? '👔✅' : '👔';
                        const iconNormal = (tipo === 'normal') ? '👟✅' : '👟';
                        html += `<td style="white-space:nowrap;">
                            <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="normal" style="background:none; border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;">${iconNormal}</button>
                            <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="pantalon" style="background:none; border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;">${iconPants}</button>
                            <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="cinto" style="background:none; border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;">${iconBelt}</button>
                        </td>`;
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
            
            // Guardar datos actuales (con tipoTalla)
            datosActuales = dfFinal.map(r => ({ ...r, tipoTalla: r.tipoTalla || 'normal' }));
            
            const total = dfFinal.reduce((s, r) => s + r.CANTIDAD, 0);
            const totalRow = {
                MODELO: '',
                LINEA: '',
                TIPO: '',
                TALLA: 'TOTAL',
                CANTIDAD: total,
                AUTOSERVICIO: '',
                CODIGO_FINAL: ''
            };
            const dfConTotal = [...datosActuales, totalRow];
            
            const ticketMode = ticketModeCheckbox.checked;
            window[`dfGen_${panelId}`] = dfConTotal;
            window[`dfGenModulo1_${panelId}`] = aFormatoModulo1(datosActuales, ticketMode);
            
            outputDiv.innerHTML = renderTablaConBotones(dfConTotal, panelId);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Operación completada. Total: <b>${total}</b> unidades en <b>${dfFinal.length}</b> códigos.`;
        });

        // Manejar clics en botones de talla (delegación)
        outputDiv.addEventListener('click', (e) => {
            const btn = e.target.closest('.talla-btn');
            if (btn) {
                const panelId = btn.dataset.panel;
                const idx = parseInt(btn.dataset.idx);
                const nuevoTipo = btn.dataset.tipo;
                // Obtener datos actuales
                const dfSinTotal = datosActuales;
                if (idx >= dfSinTotal.length) return;
                const item = dfSinTotal[idx];
                const nuevoItem = recalcularCodigo(item, nuevoTipo);
                dfSinTotal[idx] = nuevoItem;
                // Actualizar datosActuales
                datosActuales = dfSinTotal;
                // Recalcular total
                const total = datosActuales.reduce((s, r) => s + r.CANTIDAD, 0);
                const totalRow = {
                    MODELO: '',
                    LINEA: '',
                    TIPO: '',
                    TALLA: 'TOTAL',
                    CANTIDAD: total,
                    AUTOSERVICIO: '',
                    CODIGO_FINAL: ''
                };
                const dfConTotal = [...datosActuales, totalRow];
                // Actualizar variables globales
                const ticketMode = ticketModeCheckbox.checked;
                window[`dfGen_${panelId}`] = dfConTotal;
                window[`dfGenModulo1_${panelId}`] = aFormatoModulo1(datosActuales, ticketMode);
                // Re-renderizar
                outputDiv.innerHTML = renderTablaConBotones(dfConTotal, panelId);
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Talla actualizada. Total: <b>${total}</b> unidades.`;
                return;
            }

            const copyBtn = e.target.closest('.copy-individual-btn');
            if (copyBtn) {
                const codigo = copyBtn.dataset.codigo;
                if (codigo) {
                    navigator.clipboard.writeText(codigo).then(() => {
                        const original = copyBtn.innerHTML;
                        copyBtn.innerHTML = '✅';
                        setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
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
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado con ${codigosConCantidad.reduce((s, i) => s + i.cantidad, 0)} envíos (${codigosConCantidad.length} códigos únicos, ${Math.ceil(codigosConCantidad.reduce((s, i) => s + i.cantidad, 0)/50)} grupos, Sleep 100ms entre grupos).`;
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

        // ========== COPIAR TSV ==========
        panel.querySelector('.copyMainTsvBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            const content = core.dfToCsv(exportData, '\t', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });

        // ========== COPIAR CSV ==========
        panel.querySelector('.copyMainCsvBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            const content = core.dfToCsv(exportData, ',', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });

        // ========== DESCARGAR CSV ==========
        panel.querySelector('.downloadMainBtn').addEventListener('click', () => {
            const df = window[`dfGen_${panelId}`];
            if (!df || !df.length) return;
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'codigos.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const content = core.dfToCsv(exportData, ',', true, true);
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

    // ==================== SUBMÓDULO REVERSA (con múltiples pestañas y folios) ====================
    let reversaTabCounter = 1;
    let activeReversaTabId = 'rev_tab_0';

    function getReversaPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="reversa-panel">
                <div class="toggle-group" id="revMainToggle_${tabId}" style="margin-bottom:0.8rem;">
                    <span class="toggle-option active-toggle" data-op="sumar">➕ SUMAR</span>
                    <span class="toggle-option" data-op="restar">➖ RESTAR</span>
                </div>
                
                <div class="row" style="margin-bottom:0.5rem; flex-wrap:wrap; gap:1rem;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revAutoservicioCheckbox" style="width:16px; height:16px;"> <strong>AUTOSERVICIO</strong> (quita 0 final de 14 dígitos)
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revOrdenAscendenteCheckbox" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="revTicketModeCheckbox" style="width:16px; height:16px;"> <strong>MODO TICKET</strong> (solo MODELO, LINEA, TIPO, TALLA, CANTIDAD)
                    </label>
                </div>
                
                <div class="row"><label><b>Nombre Maestro:</b></label><input type="text" class="revMaestroName" value="MAESTRO" style="width:150px;"></div>
                <label class="form-label"><b>Códigos EAN-13/14 (Maestro):</b></label>
                <textarea class="revMaestroInput" placeholder="Pega los códigos EAN-13 (13 dígitos)..." rows="4"></textarea>
                <div class="row"><button class="uploadRevMaestroBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="revMaestroFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
                <div style="margin:0.5rem 0;">
                    <b>Códigos adicionales:</b> 
                    <button class="addRevFolioBtn"><i class="fas fa-plus"></i> Agregar código</button>
                    <input type="number" class="addRevMultipleFoliosInput" value="1" min="1" max="50" style="width:70px; text-align:center;">
                    <button class="addRevMultipleFoliosBtn"><i class="fas fa-plus-circle"></i> Agregar N códigos</button>
                    <button class="importRevMultipleCsvBtn" style="margin-left:0.5rem;"><i class="fas fa-file-import"></i> Importar múltiples CSV</button>
                    <input type="file" class="importRevMultipleFileInput" accept=".csv,.txt,text/plain" multiple style="display:none;">
                    <button class="removeAllRevFoliosBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-trash-alt"></i> Borrar todos los códigos adicionales</button>
                </div>
                <div class="revFoliosContainer"></div>
                
                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="revTipoOrigen" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="escaneo">escaneo</option>
                            <option value="existencia">existencia</option>
                        </select>
                        <select id="revTipoUbicacion" style="width:150px;">
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
                        <select id="revTipoCategoria" style="width:120px;">
                            <option value="">(seleccionar)</option>
                            <option value="home">home</option>
                            <option value="calzado">calzado</option>
                            <option value="ropa">ropa</option>
                            <option value="catalogos">catalogos</option>
                        </select>
                        <input type="text" id="revNombrePersonalizado" placeholder="Personalizado" style="width:130px;">
                        <input type="text" id="revSufijoAdicional" placeholder="Sufijo extra" style="width:100px;">
                    </div>
                </div>
                
                <div class="row">
                    <button class="processRevBtn btn-primary"><i class="fas fa-play"></i> Decodificar</button>
                    <button class="copyRevTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button class="copyRevCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" class="revFilename" value="decodificados.csv" style="width:190px;">
                    <button class="downloadRevBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback"></span>
                </div>
                <div class="row">
                    <button class="downloadRevAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK (códigos originales)</button>
                    <button class="copyRevAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    function initReversaPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const toggleOptions = panel.querySelectorAll('#revMainToggle_' + panelId + ' .toggle-option');
        let mainOp = 'sumar';
        toggleOptions.forEach(opt => {
            opt.addEventListener('click', function() {
                toggleOptions.forEach(o => o.classList.remove('active-toggle'));
                this.classList.add('active-toggle');
                mainOp = this.dataset.op;
            });
        });

        const autoservicioCheckbox = panel.querySelector('.revAutoservicioCheckbox');
        const ordenAscendenteCheckbox = panel.querySelector('.revOrdenAscendenteCheckbox');
        const ticketModeCheckbox = panel.querySelector('.revTicketModeCheckbox');
        const addFolioBtn = panel.querySelector('.addRevFolioBtn');
        const addMultipleBtn = panel.querySelector('.addRevMultipleFoliosBtn');
        const multipleCountInput = panel.querySelector('.addRevMultipleFoliosInput');
        const removeAllBtn = panel.querySelector('.removeAllRevFoliosBtn');
        const foliosContainer = panel.querySelector('.revFoliosContainer');
        const importMultipleBtn = panel.querySelector('.importRevMultipleCsvBtn');
        const importFileInput = panel.querySelector('.importRevMultipleFileInput');

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

        const uploadBtn = panel.querySelector('.uploadRevMaestroBtn');
        const fileInput = panel.querySelector('.revMaestroFile');
        const maestroTextarea = panel.querySelector('.revMaestroInput');
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { maestroTextarea.value = ev.target.result; fileInput.value = ''; }; r.readAsText(f); });

        const processBtn = panel.querySelector('.processRevBtn');
        const filenameInput = panel.querySelector('.revFilename');
        const copyFeedbackSpan = panel.querySelector('.copy-feedback');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');
        const downloadAhkBtn = panel.querySelector('.downloadRevAhkBtn');
        const copyAhkBtn = panel.querySelector('.copyRevAhkBtn');

        function construirNombreConDropdowns() {
            const tipoOrigen = panel.querySelector('#revTipoOrigen')?.value || '';
            const tipoUbicacion = panel.querySelector('#revTipoUbicacion')?.value || '';
            const tipoCategoria = panel.querySelector('#revTipoCategoria')?.value || '';
            const nombrePersonalizado = panel.querySelector('#revNombrePersonalizado')?.value || '';
            const sufijoAdicional = panel.querySelector('#revSufijoAdicional')?.value || '';
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
            else filenameInput.value = 'decodificados.csv';
        }
        const selects = panel.querySelectorAll('#revTipoOrigen, #revTipoUbicacion, #revTipoCategoria, #revNombrePersonalizado, #revSufijoAdicional');
        selects.forEach(el => el.addEventListener('input', actualizarNombreArchivo));
        actualizarNombreArchivo();

        let codigosOriginales = [];

        function decodificarTextos(textos) {
            const lib = getBiblioteca();
            if (lib.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                return null;
            }
            const autoservicio = autoservicioCheckbox.checked;
            const resultados = [];
            const todosCodigosOriginales = [];

            for (const texto of textos) {
                if (!texto.trim()) continue;
                const patron = /\b(\d{13,14})\b/g;
                let match;
                while ((match = patron.exec(texto)) !== null) {
                    const codigo = match[1];
                    todosCodigosOriginales.push(codigo);
                    let codigoParaDecodificar = codigo;
                    if (autoservicio && codigo.length === 14 && codigo.endsWith('0')) {
                        codigoParaDecodificar = codigo.slice(0, 13);
                    }
                    const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                    if (decodificado) {
                        resultados.push({
                            MODELO: decodificado.modelo,
                            LINEA: decodificado.linea,
                            TIPO: decodificado.tipo,
                            TALLA: decodificado.talla,
                            CANTIDAD: 1,
                            CODIGO_ORIGINAL: codigo,
                            VALIDO: decodificado.valido ? 'Sí' : 'No',
                            AUTOSERVICIO: (codigo.length === 14 || autoservicio) ? '✅' : ''
                        });
                    } else {
                        const modelo = codigo.slice(0, 5);
                        const encontrado = core.buscarCodigoPrioritario(modelo, '', '', lib);
                        if (encontrado) {
                            const tallaCode = codigo.slice(9, 12);
                            const tallaNum = parseInt(tallaCode);
                            let talla = '';
                            if (tallaNum % 10 === 5) talla = String(tallaNum / 10);
                            else talla = String(tallaNum / 10);
                            resultados.push({
                                MODELO: encontrado.MODELO,
                                LINEA: encontrado.LINEA,
                                TIPO: encontrado.TIPO,
                                TALLA: talla,
                                CANTIDAD: 1,
                                CODIGO_ORIGINAL: codigo,
                                VALIDO: '⚠️ (por modelo)',
                                AUTOSERVICIO: (codigo.length === 14 || autoservicio) ? '✅' : ''
                            });
                        } else {
                            resultados.push({
                                MODELO: 'No encontrado',
                                LINEA: '-',
                                TIPO: '-',
                                TALLA: '-',
                                CANTIDAD: 1,
                                CODIGO_ORIGINAL: codigo,
                                VALIDO: 'No',
                                AUTOSERVICIO: ''
                            });
                        }
                    }
                }
            }
            codigosOriginales = todosCodigosOriginales;
            return resultados;
        }

        function procesarReversa() {
            const maestroTexto = maestroTextarea.value;
            const adicionalesTextos = [...foliosContainer.querySelectorAll('textarea')].map(ta => ta.value);
            const todosTextos = [maestroTexto, ...adicionalesTextos].filter(t => t.trim() !== '');
            if (todosTextos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para procesar.';
                return;
            }

            const resultados = decodificarTextos(todosTextos);
            if (!resultados || resultados.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron códigos válidos.';
                return;
            }

            const acumulador = new Map();
            for (const r of resultados) {
                const key = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
                if (acumulador.has(key)) {
                    const existing = acumulador.get(key);
                    if (mainOp === 'sumar') {
                        existing.CANTIDAD += r.CANTIDAD;
                    } else {
                        existing.CANTIDAD -= r.CANTIDAD;
                        if (existing.CANTIDAD < 0) existing.CANTIDAD = 0;
                    }
                } else {
                    acumulador.set(key, { ...r });
                }
            }

            let dfFinal = Array.from(acumulador.values())
                .filter(r => r.CANTIDAD > 0 && r.MODELO !== 'No encontrado');

            if (ordenAscendenteCheckbox.checked) {
                dfFinal.sort((a, b) => {
                    if (a.MODELO !== b.MODELO) return a.MODELO.localeCompare(b.MODELO);
                    if (a.LINEA !== b.LINEA) return a.LINEA.localeCompare(b.LINEA);
                    if (a.TIPO !== b.TIPO) return a.TIPO.localeCompare(b.TIPO);
                    return a.TALLA.localeCompare(b.TALLA);
                });
            }

            const total = dfFinal.reduce((s, r) => s + r.CANTIDAD, 0);
            const totalRow = {
                MODELO: '',
                LINEA: '',
                TIPO: '',
                TALLA: 'TOTAL',
                CANTIDAD: total,
                CODIGO_ORIGINAL: '',
                VALIDO: '',
                AUTOSERVICIO: ''
            };
            const dfConTotal = [...dfFinal, totalRow];

            window[`dfRev_${panelId}`] = dfConTotal;

            outputDiv.innerHTML = renderTablaReversa(dfConTotal);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Decodificados ${resultados.length} códigos. Válidos: ${dfFinal.length} agrupados. Total unidades: ${total}.`;
        }

        function renderTablaReversa(df) {
            if (!df || !df.length) return '<p>Sin datos</p>';
            const headers = ['MODELO', 'LINEA', 'TIPO', 'TALLA', 'CANTIDAD', 'AUTOSERVICIO', 'VALIDO', 'CODIGO_ORIGINAL'];
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            df.forEach(r => {
                const isTotal = r.TALLA === 'TOTAL';
                html += '<tr>';
                headers.forEach(h => {
                    let val = r[h] ?? '';
                    if (h === 'AUTOSERVICIO' && val) {
                        html += `<td style="color:#2ecc71; font-size:1.1rem;">✅</td>`;
                    } else if (h === 'CODIGO_ORIGINAL' && val && !isTotal) {
                        html += `<td style="font-family:monospace;">${val}</td>`;
                    } else if (h === 'VALIDO' && val && !isTotal) {
                        html += `<td>${val}</td>`;
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

        // ========== COPIAR TSV ==========
        panel.querySelector('.copyRevTsvBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            const content = core.dfToCsv(exportData, '\t', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });

        // ========== COPIAR CSV ==========
        panel.querySelector('.copyRevCsvBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            const content = core.dfToCsv(exportData, ',', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });

        // ========== DESCARGAR CSV ==========
        panel.querySelector('.downloadRevBtn').addEventListener('click', () => {
            const df = window[`dfRev_${panelId}`];
            if (!df || !df.length) return;
            const exportData = df.map(row => ({
                MODELO: row.MODELO || '',
                LINEA: row.LINEA || '',
                TIPO: row.TIPO || '',
                TALLA: row.TALLA || '',
                CANTIDAD: row.CANTIDAD || 0
            }));
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'decodificados.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const content = core.dfToCsv(exportData, ',', true, true);
            core.downloadCsv(content, filename);
        });

        downloadAhkBtn.addEventListener('click', () => {
            if (codigosOriginales.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK. Procesa primero.';
                return;
            }
            let codigosAHK = [...codigosOriginales];
            if (ordenAscendenteCheckbox.checked) {
                codigosAHK.sort((a, b) => a.localeCompare(b));
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
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado con ${codigosAHK.length} códigos (${Math.ceil(codigosAHK.length/50)} grupos, Sleep 100ms entre grupos).`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        copyAhkBtn.addEventListener('click', () => {
            if (codigosOriginales.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK. Procesa primero.';
                return;
            }
            let codigosAHK = [...codigosOriginales];
            if (ordenAscendenteCheckbox.checked) {
                codigosAHK.sort((a, b) => a.localeCompare(b));
            }
            const codigosConCantidad = codigosAHK.map(c => ({ codigo: c, cantidad: 1 }));
            const ahk = generarAHKConCancelar(codigosConCantidad, `Códigos EAN-13 decodificados (${codigosAHK.length} códigos)`);
            if (!ahk) return;
            core.copiarTexto(ahk, copyFeedbackSpan);
        });

        foliosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-folio')) e.target.closest('.row').remove();
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
                const maestroInput = panel.querySelector('.revMaestroInput');
                if (maestroInput) maestroInput.value = '';
                const foliosContainer = panel.querySelector('.revFoliosContainer');
                if (foliosContainer) {
                    while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                }
                const maestroName = panel.querySelector('.revMaestroName');
                if (maestroName) maestroName.value = 'MAESTRO';
                const toggleSumar = panel.querySelector('.toggle-option[data-op="sumar"]');
                if (toggleSumar) toggleSumar.click();
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
                const evt = new Event('input');
                const tipoOrigen = panel.querySelector('#revTipoOrigen');
                if (tipoOrigen) tipoOrigen.dispatchEvent(evt);
                codigosOriginales = [];
            });
            window.dfGen = null;
            window.dfRev = null;
        });
    }
})();