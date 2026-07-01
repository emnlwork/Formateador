// Módulo Procesar / Operar (Operador + Seccionador) - CON GENERACIÓN EAN-13 INTEGRADA
(function() {
    const core = window.core;
    if (!core) return;

    const tabContainer = document.getElementById('tab1');
    if (!tabContainer) return;

    tabContainer.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-calculator"></i> Procesar formatos / Operaciones con folios</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v3.0</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
            <div class="sub-module-tabs" id="procesarSubTabs">
                <div class="sub-module-tab active" data-submode="operador">Operador</div>
                <div class="sub-module-tab" data-submode="seccionador">Seccionador</div>
            </div>
            <div id="procesarOperador" class="sub-panel active">
                <div id="procesarMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Operador</b><br>
                    1. Cada pestaña es independiente. Crea nuevas con el boton <span style="color:#ff8888;">+</span>.<br>
                    2. Haz doble clic sobre el nombre de una pestaña para cambiarlo.<br>
                    3. En cada pestaña puedes pegar o subir un Folio Maestro, agregar folios adicionales, elegir SUMAR o RESTAR.<br>
                    4. Puedes agregar varios folios a la vez con el campo "Agregar N folios".<br>
                    5. Los resultados se muestran solo en esa pestaña.<br>
                    <b>MODO TICKET:</b> copia/descarga solo las columnas esenciales sin cabeceras.<br>
                    <b>AUTOCOMPLETAR:</b> agrega los resultados procesados al textarea del Maestro.<br>
                    <b>AUTOSERVICIO:</b> añade un 0 al final del código EAN‑13 (13 → 14 dígitos).<br>
                    <b>AHK:</b> genera scripts con los códigos EAN‑13 generados.<br>
                    <b>Copiar AHK:</b> copia la lista de códigos EAN‑13 expandidos por cantidad, cada código en una línea.<br>
                    <b>Soporte CSV:</b> acepta archivos con comillas y sin cabeceras (orden: MODELO,LINEA,TIPO,TALLA,CANTIDAD).<br>
                    <b>Cambio de talla:</b> usa los botones 👟 (calzado), 👕 (pantalón), 👔 (cinto) para ajustar el código EAN‑13.
                </div>
            </div>
            <div id="procesarSeccionador" class="sub-panel">
                <div id="categoriasContainer">
                    <div class="categoria-tabs" id="categoriaTabsContainer"></div>
                    <div id="categoriaPanelsContainer"></div>
                </div>
                <div class="row">
                    <button id="addCategoriaBtn" class="add-categoria-btn"><i class="fas fa-plus"></i> Agregar categoria</button>
                </div>
                <div class="row">
                    <button id="unificarCsvBtn" class="btn-primary"><i class="fas fa-file-csv"></i> Generar CSV unificado</button>
                    <button id="descargarPorCategoriaBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar por categoria</button>
                </div>
                <div id="seccionadorMessage" class="message"></div>
                <div id="seccionadorOutput" class="output-area"></div>
                <hr class="separator-18">
                <h4><i class="fas fa-search"></i> Comparacion vs Escaneo (global)</h4>
                <div class="row">
                    <label><b>Escaneo (formato universal):</b></label>
                    <textarea id="scanGlobalInput" rows="4" placeholder="Pega aqui el escaneo (modelos con cantidades)"></textarea>
                </div>
                <div class="row">
                    <div class="checkbox-label">
                        <input type="checkbox" id="includeCategoryInDiffCheckbox">
                        <label for="includeCategoryInDiffCheckbox">Incluir columna CATEGORIA en diferencias</label>
                    </div>
                </div>
                <div class="row">
                    <button id="compararEscaneoBtn" class="btn-primary"><i class="fas fa-balance-scale"></i> Comparar existencias vs escaneo</button>
                    <button id="descargarDiferenciasBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar diferencias CSV</button>
                    <button id="descargarTodosEscaneadosBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar todos los escaneados con categoria</button>
                </div>
                <div id="comparacionMessage" class="message"></div>
                <div id="comparacionOutput" class="output-area"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Seccionador</b><br>
                    1. Las categorias predefinidas son: CALZADO, VESTIR INTERIOR, VESTIR EXTERIOR, ACCESORIOS, HOME.<br>
                    2. Puedes agregar mas categorias con el boton <span style="color:#ff8888;">+</span>.<br>
                    3. En cada categoria pega el contenido (formato universal) de los productos correspondientes.<br>
                    4. <b>Generar CSV unificado</b> → descarga un archivo con todas las filas mas la columna CATEGORIA.<br>
                    5. <b>Descargar por categoria</b> → permite elegir una categoria y descargar solo sus datos.<br>
                    6. <b>Comparar existencias vs escaneo</b> → genera diferencias en formato compatible con el modulo de compensacion.<br>
                    7. <b>Incluir categoria en diferencias</b> → añade la columna CATEGORIA en el CSV de diferencias.<br>
                    8. <b>Descargar todos los escaneados con categoria</b> → genera un listado de cada articulo del escaneo con su categoria asignada.<br>
                    9. Los CSV se generan con comillas en todos los campos.
                </div>
            </div>
        </div>
    `;

    function generarAHKConCancelar(datos, titulo) {
        if (!datos || datos.length === 0) return null;
        const lib = core.obtenerBiblioteca();
        const codigosConCantidad = [];
        for (const item of datos) {
            const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (encontrado) {
                const codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA);
                const cantidad = parseInt(item.CANTIDAD) || 1;
                codigosConCantidad.push({
                    codigo: codigoEAN13,
                    cantidad: cantidad
                });
            }
        }
        if (codigosConCantidad.length === 0) return null;
        let codigosExpandidos = [];
        for (const item of codigosConCantidad) {
            let cant = parseInt(item.cantidad);
            if (isNaN(cant) || cant < 1) cant = 1;
            const codigo = item.codigo;
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
        ahk += `; Total: ${codigosExpandidos.length} envios (Sleep 50ms entre cada codigo, 100ms entre grupos)\n\n`;
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
        ahk += '            Sleep 50\n';
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

    let procesarTabCounter = 1;
    let activeProcesarTabId = 'procesar_tab_0';

    function construirNombreConDropdowns(containerElement) {
        const tipoOrigen = containerElement.querySelector('#tipoOrigen')?.value || '';
        const tipoUbicacion = containerElement.querySelector('#tipoUbicacion')?.value || '';
        const tipoCategoria = containerElement.querySelector('#tipoCategoria')?.value || '';
        const nombrePersonalizado = containerElement.querySelector('#nombrePersonalizado')?.value || '';
        const sufijoAdicional = containerElement.querySelector('#sufijoAdicional')?.value || '';
        let base = '';
        if (tipoOrigen) base += tipoOrigen;
        if (tipoUbicacion) base += tipoUbicacion;
        if (tipoCategoria) base += tipoCategoria;
        if (nombrePersonalizado) base += nombrePersonalizado;
        if (sufijoAdicional) base += sufijoAdicional;
        if (!base) return null;
        return base;
    }

    function getProcesarPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="procesar-panel">
                <div class="toggle-group" id="operMainToggle_${tabId}" style="margin-bottom:0.8rem;">
                    <span class="toggle-option active-toggle" data-op="sumar">+ SUMAR</span>
                    <span class="toggle-option" data-op="restar">- RESTAR</span>
                </div>
                
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.8rem; flex-wrap:wrap;">
                    <div class="toggle-group" id="autocompletarToggle_${tabId}" style="display:inline-flex;">
                        <span class="toggle-option active-toggle" data-op="on">AUTOCOMPLETAR ON</span>
                        <span class="toggle-option" data-op="off">AUTOCOMPLETAR OFF</span>
                    </div>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                        <input type="checkbox" class="autoservicioCheckbox" style="width:16px; height:16px;"> <strong>AUTOSERVICIO</strong>
                    </label>
                </div>
                
                <div style="margin:0.5rem 0; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:5px;">
                    <b><i class="fas fa-file-format"></i> Formato de entrada:</b>
                    <div class="row" style="margin:0.3rem 0; gap:0.3rem; flex-wrap:wrap;">
                        <button class="format-btn btn-secondary" data-format="auto" style="background:#2ecc71; border-color:#2ecc71;">Auto</button>
                        <button class="format-btn btn-secondary" data-format="folios">Folios (Formato 1)</button>
                        <button class="format-btn btn-secondary" data-format="existencias">Existencias (Formato 2)</button>
                        <button class="format-btn btn-secondary" data-format="contenedor">Contenedor</button>
                        <button class="format-btn btn-secondary" data-format="cambios">Cambios</button>
                        <button class="format-btn btn-secondary" data-format="csv">CSV</button>
                    </div>
                    <span id="formatoSeleccionado_${tabId}" style="font-size:0.8rem; color:var(--grayl);">Formato actual: <strong style="color:#2ecc71;">Auto</strong></span>
                </div>
                
                <div class="row"><label><b>Nombre Folio Maestro:</b></label><input type="text" class="mainMaestroName" value="MAESTRO" style="width:150px;"></div>
                <label class="form-label"><b>Folio Maestro (pega o sube archivo):</b></label>
                <textarea class="mainMaestroInput" placeholder="Pega el FOLIO MAESTRO..." rows="4"></textarea>
                <div class="row"><button class="uploadMainMaestroBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="mainMaestroFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
                <div style="margin:0.5rem 0;">
                    <b>Folios adicionales:</b> 
                    <button class="addMainFolioBtn"><i class="fas fa-plus"></i> Agregar folio</button>
                    <input type="number" class="addMultipleFoliosInput" value="1" min="1" max="50" style="width:70px; text-align:center;">
                    <button class="addMultipleFoliosBtn"><i class="fas fa-plus-circle"></i> Agregar N folios</button>
                    <button class="importMultipleCsvBtn" style="margin-left:0.5rem;"><i class="fas fa-file-import"></i> Importar multiples CSV</button>
                    <input type="file" class="importMultipleFileInput" accept=".csv,.txt,text/plain" multiple style="display:none;">
                    <button class="removeAllFoliosBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-trash-alt"></i> Borrar todos los folios adicionales</button>
                </div>
                <div class="mainFoliosContainer"></div>
                <div class="row" style="margin-top:0.5rem;"><input type="checkbox" class="mainTicketMode"><label class="mainTicketModeLabel">MODO TICKET (solo MODELO, LINEA, TIPO, CANTIDAD, sin cabeceras)</label></div>
                
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
                    <input type="text" class="mainFilename" value="archivo.csv" style="width:190px;">
                    <button class="downloadMainBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback"></span>
                </div>
                <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <button class="downloadAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button class="copyAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                    <span class="copy-feedback-ahk"></span>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    // ========== FUNCIONES DE GENERACIÓN Y RENDERIZADO CON EAN-13 ==========
    function recalcularCodigoEAN(item, nuevoTipo, autoservicio) {
        const lib = core.obtenerBiblioteca();
        if (!lib.length) return item;
        let encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
        if (!encontrado) {
            encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
        }
        if (!encontrado) return item;
        const modoAnterior = core.getTallaMode();
        core.setTallaMode(nuevoTipo);
        let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA);
        core.setTallaMode(modoAnterior);
        if (autoservicio) {
            codigoFinal = codigoFinal + '0';
        }
        return {
            ...item,
            CODIGO_EAN13: codigoFinal,
            tipoTalla: nuevoTipo
        };
    }

    function renderTablaConBotonesEAN(df, panelId, autoservicio) {
        if (!df || !df.length) return '<p>Sin datos</p>';
        const headers = ['MODELO', 'LINEA', 'TIPO', 'TALLA', 'CANTIDAD', 'AUTOSERVICIO', 'CÓDIGO EAN‑13', 'CATEGORIA'];
        let html = '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">';
        html += '<thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '<th>Acción</th>';
        html += '</tr></thead><tbody>';
        df.forEach((r, idx) => {
            const isTotal = r.TALLA === 'TOTAL';
            const tipo = r.tipoTalla || 'normal';
            const codigo = r.CODIGO_EAN13 || '';
            // Estilos para botones (resaltar el activo)
            const bgNormal = (tipo === 'normal') ? 'background:#ff4444;' : 'background:transparent;';
            const bgPants = (tipo === 'pantalon') ? 'background:#ff4444;' : 'background:transparent;';
            const bgBelt = (tipo === 'cinto') ? 'background:#ff4444;' : 'background:transparent;';
            html += '<tr>';
            headers.forEach(h => {
                let val = r[h] ?? '';
                if (h === 'CÓDIGO EAN‑13' && !isTotal) {
                    html += `<td style="font-family:monospace; font-weight:bold; font-size:0.75rem;">${val}</td>`;
                } else if (h === 'AUTOSERVICIO' && val) {
                    html += `<td style="color:#2ecc71; font-size:1.1rem;">✅</td>`;
                } else if (h === 'CATEGORIA' && !isTotal) {
                    html += `<td style="white-space:nowrap; text-align:center;">
                        <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="normal" style="${bgNormal} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px; color:${tipo==='normal'?'#fff':'#aaa'};" title="Calzado"><i class="fas fa-shoe-prints"></i></button>
                        <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="pantalon" style="${bgPants} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px; color:${tipo==='pantalon'?'#fff':'#aaa'};" title="Pantalón"><i class="fas fa-tshirt"></i></button>
                        <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="cinto" style="${bgBelt} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px; color:${tipo==='cinto'?'#fff':'#aaa'};" title="Cinto"><i class="fas fa-belt"></i></button>
                    </td>`;
                } else {
                    html += `<td>${val}</td>`;
                }
            });
            if (isTotal || !codigo) {
                html += '<td></td>';
            } else {
                html += `<td><button class="copy-individual-btn" data-codigo="${codigo}" style="background:#444; border:1px solid var(--blu); color:white; padding:0.2rem 0.5rem; border-radius:3px; cursor:pointer; font-size:0.7rem;"><i class="fas fa-copy"></i></button></td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    // ========== PROCESAR TEXTO CON BIBLIOTECA (igual que antes) ==========
    function procesarTextoConBiblioteca(texto, formato) {
        if (!texto.trim()) return [];
        const lib = core.obtenerBiblioteca();
        let items = [];
        let resultados = [];
        const lines = texto.split(/\r?\n/);
        let tieneFormato1 = false;
        let lineasTallas = 0;
        let lineasProductos = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (/^\s*\d+(?:\.5|½)?/.test(trimmed) && /^\s*$/.test(line.substring(0, line.indexOf(trimmed) === -1 ? 0 : line.indexOf(trimmed)))) {
                lineasTallas++;
            } else if (/^\d{4,5}\s+[A-Z]{2,}\s+[A-Z]{2,}/.test(trimmed)) {
                lineasProductos++;
            }
        }
        if (lineasTallas > 0 && lineasProductos > 0) {
            tieneFormato1 = true;
        }
        if ((formato === 'folios' || formato === 'auto') && tieneFormato1) {
            const parsed = core.parsearFormato1(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if ((formato === 'existencias' || formato === 'auto') && texto.includes('Si') || texto.includes('No')) {
            const parsed = core.parsearFormato2(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if (formato === 'csv' || (formato === 'auto' && texto.includes('MODELO') && texto.includes(','))) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length) {
                    for (const row of parsed.data) {
                        const modelo = String(row.MODELO || '').trim();
                        const linea = String(row.LINEA || row.COLOR || '').trim().toUpperCase();
                        const tipo = String(row.TIPO || row.MATERIAL || '').trim().toUpperCase();
                        const talla = String(row.TALLA || '').trim();
                        let cantidad = parseInt(row.CANTIDAD) || 1;
                        if (modelo && linea && tipo) {
                            items.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla, CANTIDAD: cantidad });
                        }
                    }
                }
            } catch (e) {}
        }
        else if (formato === 'contenedor' || formato === 'auto') {
            const parsed = core.parsearFormatoContenedor ? core.parsearFormatoContenedor(texto) : null;
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if (formato === 'cambios' || formato === 'auto') {
            const parsed = core.parsearFormatoCambios ? core.parsearFormatoCambios(texto) : null;
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        if (items.length === 0 && formato === 'auto') {
            const parsed = core.parsearTextoUniversal(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            } else {
                const extracted = core.extraerModelosConCantidad(texto);
                if (extracted && extracted.length > 0) {
                    items = extracted;
                }
            }
        }
        for (const item of items) {
            let modelo = item.MODELO;
            let lineaVal = item.LINEA || '';
            let tipo = item.TIPO || '';
            let talla = item.TALLA || '';
            let cantidad = item.CANTIDAD || 1;
            let encontrado = core.buscarCodigoPrioritario(modelo, lineaVal, tipo, lib);
            if (encontrado) {
                resultados.push({
                    MODELO: encontrado.MODELO,
                    LINEA: encontrado.LINEA,
                    TIPO: encontrado.TIPO,
                    TALLA: talla,
                    CANTIDAD: cantidad
                });
            } else {
                resultados.push({
                    MODELO: modelo,
                    LINEA: lineaVal,
                    TIPO: tipo,
                    TALLA: talla,
                    CANTIDAD: cantidad
                });
            }
        }
        return resultados;
    }

    // ========== INICIALIZAR PANEL CON EVENTOS ==========
    function initProcesarPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const autocompletarToggle = panel.querySelector(`#autocompletarToggle_${panelId}`);
        let autocompletarMode = 'on';
        const toggleOptionsAuto = autocompletarToggle.querySelectorAll('.toggle-option');
        toggleOptionsAuto.forEach(opt => {
            opt.addEventListener('click', function() {
                toggleOptionsAuto.forEach(o => o.classList.remove('active-toggle'));
                this.classList.add('active-toggle');
                autocompletarMode = this.dataset.op;
            });
        });

        // Checkbox Autoservicio
        const autoservicioCheckbox = panel.querySelector('.autoservicioCheckbox');

        let formatoSeleccionado = 'auto';
        const formatoLabel = panel.querySelector(`#formatoSeleccionado_${panelId}`);
        const formatBtns = panel.querySelectorAll('.format-btn');
        formatBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                formatBtns.forEach(b => {
                    b.style.background = '';
                    b.style.borderColor = '';
                    b.style.color = '';
                });
                this.style.background = '#2ecc71';
                this.style.borderColor = '#2ecc71';
                this.style.color = '#000';
                formatoSeleccionado = this.dataset.format;
                if (formatoLabel) {
                    const nombres = {
                        'auto': 'Auto',
                        'folios': 'Folios (Formato 1)',
                        'existencias': 'Existencias (Formato 2)',
                        'contenedor': 'Contenedor',
                        'cambios': 'Cambios',
                        'csv': 'CSV'
                    };
                    formatoLabel.innerHTML = `Formato actual: <strong style="color:#2ecc71;">${nombres[formatoSeleccionado] || formatoSeleccionado}</strong>`;
                }
            });
        });
        const autoBtn = panel.querySelector('.format-btn[data-format="auto"]');
        if (autoBtn) autoBtn.click();

        const toggleOptions = panel.querySelectorAll('#operMainToggle_' + panelId + ' .toggle-option');
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
                        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Se importaron ${processed} archivos como folios adicionales.`;
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
        const copyFeedbackAhkSpan = panel.querySelector('.copy-feedback-ahk');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');

        function actualizarNombreArchivo() {
            const nombreBase = construirNombreConDropdowns(panel);
            if (nombreBase) filenameInput.value = `${nombreBase}.csv`;
            else filenameInput.value = 'archivo.csv';
        }
        const selects = panel.querySelectorAll('#tipoOrigen, #tipoUbicacion, #tipoCategoria, #nombrePersonalizado, #sufijoAdicional');
        selects.forEach(el => el.addEventListener('input', actualizarNombreArchivo));
        actualizarNombreArchivo();

        function getMainTicketData(df) {
            if (!df) return [];
            return df.filter(r => r.TALLA !== 'TOTAL').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, CANTIDAD: r.CANTIDAD }));
        }

        // Almacenar datos actuales con códigos EAN
        let datosActualesConEAN = [];

        processBtn.addEventListener('click', () => {
            const maestroTexto = maestroTextarea.value;
            const maestroRows = procesarTextoConBiblioteca(maestroTexto, formatoSeleccionado);
            if (maestroRows.length === 0 && maestroTexto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar el Maestro. Prueba con "Auto" o selecciona otro formato.';
                return;
            }
            const foliosTextos = [...foliosContainer.querySelectorAll('textarea')].map(ta => ta.value);
            const foliosRows = [];
            for (const texto of foliosTextos) {
                if (texto.trim()) {
                    const rows = procesarTextoConBiblioteca(texto, formatoSeleccionado);
                    foliosRows.push(...rows);
                }
            }
            const mapM = new Map();
            for (const row of maestroRows) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (mapM.has(key)) {
                    mapM.get(key).CANTIDAD += row.CANTIDAD;
                } else {
                    mapM.set(key, { ...row });
                }
            }
            for (const row of foliosRows) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (mapM.has(key)) {
                    const e = mapM.get(key);
                    e.CANTIDAD = mainOp === 'sumar' ? e.CANTIDAD + row.CANTIDAD : e.CANTIDAD - row.CANTIDAD;
                    if (e.CANTIDAD <= 0) mapM.delete(key);
                } else if (mainOp === 'sumar') {
                    mapM.set(key, { ...row });
                }
            }
            const res = Array.from(mapM.values()).filter(r => r.CANTIDAD > 0);
            res.sort((a,b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
            window[`dfMainData_${panelId}`] = res;

            // ========== GENERAR CÓDIGOS EAN-13 ==========
            const autoservicio = autoservicioCheckbox.checked;
            const lib = core.obtenerBiblioteca();
            const resConEAN = res.map(r => {
                let encontrado = core.buscarCodigoPrioritario(r.MODELO, r.LINEA, r.TIPO, lib);
                if (!encontrado) {
                    encontrado = lib.find(reg => String(reg.MODELO).trim() === String(r.MODELO).trim());
                }
                let codigoEAN = '';
                let tipoTalla = 'normal';
                if (encontrado) {
                    // Usar modo normal por defecto
                    codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, r.TALLA);
                    if (autoservicio) codigoEAN = codigoEAN + '0';
                }
                return {
                    ...r,
                    CODIGO_EAN13: codigoEAN,
                    tipoTalla: 'normal',
                    AUTOSERVICIO: autoservicio ? '✅' : ''
                };
            });

            datosActualesConEAN = resConEAN;

            const dfDisplay = resConEAN.map(r => ({
                MODELO: r.MODELO,
                LINEA: r.LINEA,
                TIPO: r.TIPO,
                TALLA: r.TALLA,
                CANTIDAD: r.CANTIDAD,
                AUTOSERVICIO: r.AUTOSERVICIO,
                'CÓDIGO EAN‑13': r.CODIGO_EAN13,
                tipoTalla: r.tipoTalla
            }));
            const dfMain = core.agregarFilaTotal(dfDisplay.map(({tipoTalla, ...rest}) => rest));
            window[`dfMain_${panelId}`] = dfMain;

            // Renderizar tabla con botones
            outputDiv.innerHTML = renderTablaConBotonesEAN(dfMain, panelId, autoservicio);

            const totalUnidades = res.reduce((s, r) => s + r.CANTIDAD, 0);
            const uniqueModelos = new Set(res.map(r => `${r.MODELO}|${r.LINEA}|${r.TIPO}`)).size;
            // Mensaje persistente
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Operacion completada. Unidades procesadas: <b>${totalUnidades}</b> en <b>${uniqueModelos}</b> modelos distintos.`;
            if (autocompletarMode === 'on') {
                let textoCompletado = '';
                for (const row of res) {
                    textoCompletado += `${row.MODELO} ${row.LINEA} ${row.TIPO} ${row.TALLA} ${row.CANTIDAD}\n`;
                }
                if (textoCompletado) {
                    maestroTextarea.value += `\n${textoCompletado}`;
                }
            }
        });

        // ========== EVENTOS DE CAMBIO DE TALLA EN TABLA ==========
        outputDiv.addEventListener('click', (e) => {
            // Cambio de tipo de talla
            const btn = e.target.closest('.talla-btn');
            if (btn) {
                const idx = parseInt(btn.dataset.idx);
                const nuevoTipo = btn.dataset.tipo;
                if (idx >= datosActualesConEAN.length) return;
                const item = datosActualesConEAN[idx];
                const autoservicio = autoservicioCheckbox.checked;
                const nuevoItem = recalcularCodigoEAN(item, nuevoTipo, autoservicio);
                datosActualesConEAN[idx] = nuevoItem;

                // Reconstruir tabla
                const dfDisplay = datosActualesConEAN.map(r => ({
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA,
                    CANTIDAD: r.CANTIDAD,
                    AUTOSERVICIO: r.AUTOSERVICIO,
                    'CÓDIGO EAN‑13': r.CODIGO_EAN13,
                    tipoTalla: r.tipoTalla
                }));
                const dfMain = core.agregarFilaTotal(dfDisplay.map(({tipoTalla, ...rest}) => rest));
                window[`dfMain_${panelId}`] = dfMain;
                outputDiv.innerHTML = renderTablaConBotonesEAN(dfMain, panelId, autoservicio);
                // El mensaje se mantiene
                return;
            }

            // Copiar código individual
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

        // ========== COPIAR, DESCARGAR, AHK ==========
        panel.querySelector('.copyMainTsvBtn').addEventListener('click', () => {
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ? core.dfToCsv(getMainTicketData(df), '\t', false, true) : core.dfToCsv(df, '\t', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.copyMainCsvBtn').addEventListener('click', () => {
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) { copyFeedbackSpan.textContent = 'Sin datos'; setTimeout(()=>copyFeedbackSpan.textContent='',1500); return; }
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ? core.dfToCsv(getMainTicketData(df), ',', false, true) : core.dfToCsv(df, ',', true, true);
            core.copiarTexto(content, copyFeedbackSpan);
        });
        panel.querySelector('.downloadMainBtn').addEventListener('click', () => {
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'archivo.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ? core.dfToCsv(getMainTicketData(df), ',', false, true) : core.dfToCsv(df, ',', true, true);
            core.downloadCsv(content, filename);
        });

        panel.querySelector('.downloadAhkBtn').addEventListener('click', () => {
            const data = window[`dfMainData_${panelId}`];
            if (!data || !data.length) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para generar AHK. Procesa primero.';
                return;
            }
            // Usar datos con códigos EAN generados
            const lib = core.obtenerBiblioteca();
            const codigosConCantidad = [];
            for (const item of data) {
                const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                if (encontrado) {
                    const codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA);
                    const cantidad = parseInt(item.CANTIDAD) || 1;
                    codigosConCantidad.push({ codigo: codigoEAN13, cantidad: cantidad });
                }
            }
            if (codigosConCantidad.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron generar codigos EAN-13. Verifica la biblioteca.';
                return;
            }
            // Generar AHK con función de core (ya incluye agrupación)
            const ahk = core.generarAHKDesdeCodigosConCantidad(codigosConCantidad, `Procesado (${codigosConCantidad.length} productos)`);
            if (!ahk) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error generando AHK.';
                return;
            }
            let nombreBase = filenameInput.value.trim().replace(/\.csv$/, '');
            if (!nombreBase) nombreBase = 'procesado';
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombreBase}.ahk`;
            a.click();
            URL.revokeObjectURL(url);
            const totalEnvios = codigosConCantidad.reduce((s, i) => s + i.cantidad, 0);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado con ${totalEnvios} envios (${codigosConCantidad.length} codigos unicos).`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        panel.querySelector('.copyAhkBtn').addEventListener('click', () => {
            const data = window[`dfMainData_${panelId}`];
            if (!data || !data.length) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para copiar. Procesa primero.';
                return;
            }
            const lib = core.obtenerBiblioteca();
            const codigosExpandidos = [];
            for (const item of data) {
                const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                if (encontrado) {
                    const codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA);
                    const cantidad = parseInt(item.CANTIDAD) || 1;
                    for (let i = 0; i < cantidad; i++) {
                        codigosExpandidos.push(codigoEAN13);
                    }
                }
            }
            if (codigosExpandidos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron generar códigos EAN-13. Verifica la biblioteca.';
                return;
            }
            const textoParaCopiar = codigosExpandidos.join('\n');
            core.copiarTexto(textoParaCopiar, copyFeedbackAhkSpan);
            const totalUnidades = codigosExpandidos.length;
            const codigosUnicos = new Set(codigosExpandidos).size;
            copyFeedbackAhkSpan.textContent = `Copiados ${totalUnidades} códigos (${codigosUnicos} únicos)`;
            setTimeout(() => {
                if (copyFeedbackAhkSpan.textContent.includes('Copiados')) {
                    copyFeedbackAhkSpan.textContent = '';
                }
            }, 3000);
        });

        foliosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-folio')) e.target.closest('.row').remove();
        });
    }

    // ========== CREAR PESTAÑAS DEL OPERADOR ==========
    function createProcesarTab(tabName = null) {
        const tabId = `procesar_tab_${procesarTabCounter}`;
        const tabTitle = tabName || `Procesar ${procesarTabCounter}`;
        const tabsContainer = document.getElementById('procesarTabsContainer');
        const addBtn = document.getElementById('addProcesarTabBtn');
        const tabButton = document.createElement('div');
        tabButton.className = 'procesar-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(tabTitle)}</span><span class="tab-close" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        const panelsContainer = document.getElementById('procesarPanelsContainer');
        const panelHtml = getProcesarPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        initProcesarPanelEvents(tabId);
        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'procesar_tab_0') closeBtn.style.display = 'none';
        else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeProcesarTabId === tabId) {
                    const firstTab = document.querySelector('#procesarTabsContainer .procesar-tab');
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
            document.querySelectorAll('#procesarTabsContainer .procesar-tab').forEach(t => t.classList.remove('active'));
            tabButton.classList.add('active');
            document.querySelectorAll('#procesarPanelsContainer .procesar-panel').forEach(p => p.classList.remove('active'));
            panel.classList.add('active');
            activeProcesarTabId = tabId;
        });
        const existingTabs = document.querySelectorAll('#procesarTabsContainer .procesar-tab');
        if (existingTabs.length === 1) tabButton.click();
        procesarTabCounter++;
    }

    function initProcesarMultiTabs() {
        const container = document.getElementById('procesarMultiTabs');
        container.innerHTML = `
            <div class="procesar-tabs-container">
                <div class="procesar-tabs" id="procesarTabsContainer"></div>
                <div style="margin-top:0.5rem;" id="procesarPanelsContainer"></div>
            </div>
        `;
        const tabsContainer = document.getElementById('procesarTabsContainer');
        const addBtn = document.createElement('div');
        addBtn.id = 'addProcesarTabBtn';
        addBtn.className = 'add-tab-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestana';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => { createProcesarTab(); });
        createProcesarTab('Procesar 1');
    }

    // ========== SECCIONADOR (sin cambios) ==========
    let categoriaCounter = 1;
    let activeCategoriaId = null;
    let categoriaData = {};
    let currentUnificadoDf = null;
    let currentComparacionDf = null;
    const categoriasDefault = ['CALZADO', 'VESTIR INTERIOR', 'VESTIR EXTERIOR', 'ACCESORIOS', 'HOME'];

    function crearCategoria(nombre = null) {
        const panelId = `cat_panel_${categoriaCounter++}`;
        const tabName = nombre || `Categoria ${categoriaCounter}`;
        const tabsContainer = document.getElementById('categoriaTabsContainer');
        const tabDiv = document.createElement('div');
        tabDiv.className = 'categoria-tab';
        tabDiv.dataset.panelId = panelId;
        tabDiv.innerHTML = `<span class="tab-name">${core.escapeHtml(tabName)}</span><span class="tab-close" title="Eliminar">✖</span>`;
        const addBtn = document.getElementById('addCategoriaBtn');
        if (addBtn && tabsContainer.contains(addBtn)) tabsContainer.insertBefore(tabDiv, addBtn);
        else tabsContainer.appendChild(tabDiv);
        const panelsContainer = document.getElementById('categoriaPanelsContainer');
        const panelDiv = document.createElement('div');
        panelDiv.id = panelId;
        panelDiv.className = 'categoria-panel';
        panelDiv.innerHTML = `
            <label><b>Contenido (formato universal):</b></label>
            <textarea class="categoria-textarea" rows="6" placeholder="Pega aqui los productos de esta categoria..."></textarea>
            <div class="row"><button class="upload-cat-btn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="cat-file" accept=".csv,.txt" style="display:none;"></div>
        `;
        panelsContainer.appendChild(panelDiv);
        categoriaData[panelId] = { name: tabName };
        const ta = panelDiv.querySelector('.categoria-textarea');
        const upBtn = panelDiv.querySelector('.upload-cat-btn');
        const fileInp = panelDiv.querySelector('.cat-file');
        upBtn.addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; };
            r.readAsText(f);
        });
        ta.addEventListener('input', () => { categoriaData[panelId].content = ta.value; });
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
                categoriaData[panelId].name = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        const closeBtn = tabDiv.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tabDiv.remove();
            panelDiv.remove();
            delete categoriaData[panelId];
            if (activeCategoriaId === panelId) {
                const firstTab = document.querySelector('#categoriaTabsContainer .categoria-tab');
                if (firstTab) firstTab.click();
            }
        });
        tabDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('.categoria-tab').forEach(t => t.classList.remove('active'));
            tabDiv.classList.add('active');
            document.querySelectorAll('.categoria-panel').forEach(p => p.classList.remove('active'));
            panelDiv.classList.add('active');
            activeCategoriaId = panelId;
        });
        if (document.querySelectorAll('.categoria-tab').length === 1) tabDiv.click();
        return panelId;
    }

    function obtenerDatosUnificados() {
        const allRows = [];
        for (const [panelId, data] of Object.entries(categoriaData)) {
            const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
            if (!ta) continue;
            const raw = ta.value;
            if (!raw.trim()) continue;
            const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
            for (const row of parsed) {
                allRows.push({
                    MODELO: row.MODELO,
                    LINEA: row.LINEA,
                    TIPO: row.TIPO,
                    TALLA: row.TALLA,
                    CANTIDAD: row.CANTIDAD,
                    CATEGORIA: data.name
                });
            }
        }
        return allRows;
    }

    function generarCsvUnificado() {
        const rows = obtenerDatosUnificados();
        if (rows.length === 0) {
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos en ninguna categoria.';
            return null;
        }
        currentUnificadoDf = rows;
        const csv = core.dfToCsv(rows, ',', true, true);
        document.getElementById('seccionadorOutput').innerHTML = core.renderTableHtml(rows);
        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se generaron ${rows.length} filas unificadas.`;
        return csv;
    }

    function construirMapaArticuloCategoria() {
        const mapa = new Map();
        for (const [panelId, data] of Object.entries(categoriaData)) {
            const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
            if (!ta) continue;
            const raw = ta.value;
            if (!raw.trim()) continue;
            const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
            for (const row of parsed) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (!mapa.has(key)) mapa.set(key, data.name);
            }
        }
        return mapa;
    }

    function generarCsvTodosEscaneadosConCategoria() {
        const scanRaw = document.getElementById('scanGlobalInput').value;
        if (!scanRaw.trim()) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el escaneo primero.';
            return null;
        }
        const scanItems = core.parsearTextoUniversal(scanRaw).filter(r => r.TALLA !== 'TOTAL');
        if (scanItems.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> El escaneo no contiene elementos validos.';
            return null;
        }
        const mapaCategoria = construirMapaArticuloCategoria();
        const resultados = [];
        for (const item of scanItems) {
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            const categoria = mapaCategoria.get(key) || 'SIN CATEGORIA';
            resultados.push({
                MODELO: item.MODELO,
                LINEA: item.LINEA,
                TIPO: item.TIPO,
                TALLA: item.TALLA,
                CANTIDAD: item.CANTIDAD,
                CATEGORIA: categoria
            });
        }
        resultados.sort((a,b) => (parseInt(a.MODELO)||0) - (parseInt(b.MODELO)||0));
        const csv = core.dfToCsv(resultados, ',', true, true);
        return { csv, total: resultados.length };
    }

    function compararConEscaneo() {
        const scanRaw = document.getElementById('scanGlobalInput').value;
        if (!scanRaw.trim()) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el escaneo primero.';
            return;
        }
        const stockRows = obtenerDatosUnificados();
        if (stockRows.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay existencias cargadas en las categorias.';
            return;
        }
        const scanItems = core.parsearTextoUniversal(scanRaw).filter(r => r.TALLA !== 'TOTAL');
        if (scanItems.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> El escaneo no contiene elementos validos.';
            return;
        }
        const stockMap = new Map();
        for (const row of stockRows) {
            const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
            stockMap.set(key, (stockMap.get(key) || 0) + row.CANTIDAD);
        }
        const scanMap = new Map();
        for (const item of scanItems) {
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            scanMap.set(key, (scanMap.get(key) || 0) + item.CANTIDAD);
        }
        const allKeys = new Set([...stockMap.keys(), ...scanMap.keys()]);
        const diferencias = [];
        let faltantes = 0, sobrantes = 0;
        const mapaCategoria = construirMapaArticuloCategoria();

        for (const key of allKeys) {
            const stock = stockMap.get(key) || 0;
            const scan = scanMap.get(key) || 0;
            const diff = scan - stock;
            if (diff !== 0) {
                const [modelo, linea, tipo, talla] = key.split('|');
                const rowDif = {
                    MODELO: modelo,
                    LINEA: linea,
                    TIPO: tipo,
                    TALLA: talla,
                    CANTIDAD_REAL: stock,
                    CANTIDAD_COMPARAR: scan,
                    DIFERENCIA: diff,
                    RESULTADO: diff > 0 ? 'SOBRANTE' : 'FALTANTE'
                };
                if (document.getElementById('includeCategoryInDiffCheckbox').checked) {
                    rowDif.CATEGORIA = mapaCategoria.get(key) || 'SIN CATEGORIA';
                }
                diferencias.push(rowDif);
                if (diff > 0) sobrantes += diff;
                else if (diff < 0) faltantes += Math.abs(diff);
            }
        }
        diferencias.sort((a,b) => (parseInt(a.MODELO)||0) - (parseInt(b.MODELO)||0));
        if (diferencias.length) {
            const totalReal = diferencias.reduce((s, r) => s + r.CANTIDAD_REAL, 0);
            const totalComparar = diferencias.reduce((s, r) => s + r.CANTIDAD_COMPARAR, 0);
            diferencias.push({
                MODELO: '', LINEA: '', TIPO: '', TALLA: 'TOTALES:',
                CANTIDAD_REAL: totalReal,
                CANTIDAD_COMPARAR: totalComparar,
                DIFERENCIA: totalComparar - totalReal,
                RESULTADO: `Faltante: ${faltantes} | Sobrante: ${sobrantes}`
            });
        }
        currentComparacionDf = diferencias;
        document.getElementById('comparacionOutput').innerHTML = core.renderTableHtml(diferencias);
        document.getElementById('comparacionMessage').innerHTML = `<i class="fas fa-chart-line"></i> Total faltantes en stock: ${faltantes}, sobrantes en stock: ${sobrantes}`;
    }

    function descargarDiferencias() {
        if (!currentComparacionDf || currentComparacionDf.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay diferencias para descargar.';
            return;
        }
        let dataToExport = currentComparacionDf;
        if (dataToExport.length && dataToExport[dataToExport.length-1].TALLA === 'TOTALES:') {
            dataToExport = dataToExport.slice(0, -1);
        }
        const csv = core.dfToCsv(dataToExport, ',', true, true);
        core.downloadCsv(csv, `diferencias_vs_escaneo_${core.generarNombreFecha('csv')}`);
    }

    function descargarTodosEscaneados() {
        const result = generarCsvTodosEscaneadosConCategoria();
        if (result) {
            core.downloadCsv(result.csv, `todos_escaneados_con_categoria_${core.generarNombreFecha('csv')}`);
            document.getElementById('comparacionMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se descargaron ${result.total} articulos del escaneo con su categoria.`;
        }
    }

    function descargarPorCategoria() {
        const categorias = Object.values(categoriaData).map(c => c.name);
        if (categorias.length === 0) { alert('No hay categorias'); return; }
        const seleccion = prompt(`Selecciona categoria para descargar (escribe el nombre exacto):\n${categorias.join(', ')}\n\nDejar vacio para descargar todas individualmente.`);
        if (seleccion === null) return;
        if (seleccion.trim() === '') {
            for (const [panelId, data] of Object.entries(categoriaData)) {
                const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
                if (!ta) continue;
                const raw = ta.value;
                if (!raw.trim()) continue;
                const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
                if (parsed.length === 0) continue;
                const csv = core.dfToCsv(parsed, ',', true, true);
                core.downloadCsv(csv, `${data.name}_${core.generarNombreFecha('csv')}`);
            }
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Se descargaron todas las categorias.';
        } else {
            const cat = seleccion.trim();
            let found = false;
            for (const [panelId, data] of Object.entries(categoriaData)) {
                if (data.name === cat) {
                    const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
                    if (ta && ta.value.trim()) {
                        const parsed = core.parsearTextoUniversal(ta.value).filter(r => r.TALLA !== 'TOTAL');
                        const csv = core.dfToCsv(parsed, ',', true, true);
                        core.downloadCsv(csv, `${cat}_${core.generarNombreFecha('csv')}`);
                        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Descargada categoria ${cat}.`;
                        found = true;
                    } else {
                        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> La categoria ${cat} no tiene datos.`;
                    }
                    break;
                }
            }
            if (!found) document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> Categoria "${cat}" no encontrada.`;
        }
    }

    function initSeccionador() {
        const tabsContainer = document.getElementById('categoriaTabsContainer');
        const panelsContainer = document.getElementById('categoriaPanelsContainer');
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        categoriaData = {};
        categoriaCounter = 1;
        for (const cat of categoriasDefault) crearCategoria(cat);
        const addBtn = document.createElement('div');
        addBtn.id = 'addCategoriaBtn';
        addBtn.className = 'add-categoria-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar categoria';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => crearCategoria());
    }

    initProcesarMultiTabs();
    initSeccionador();

    document.getElementById('unificarCsvBtn').addEventListener('click', () => {
        const csv = generarCsvUnificado();
        if (csv) core.downloadCsv(csv, `unificado_${core.generarNombreFecha('csv')}`);
    });
    document.getElementById('descargarPorCategoriaBtn').addEventListener('click', descargarPorCategoria);
    document.getElementById('compararEscaneoBtn').addEventListener('click', compararConEscaneo);
    document.getElementById('descargarDiferenciasBtn').addEventListener('click', descargarDiferencias);
    document.getElementById('descargarTodosEscaneadosBtn').addEventListener('click', descargarTodosEscaneados);

    const subTabs = document.querySelectorAll('#procesarSubTabs .sub-module-tab');
    const operadorDiv = document.getElementById('procesarOperador');
    const seccionadorDiv = document.getElementById('procesarSeccionador');
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.submode === 'operador') {
                operadorDiv.style.display = 'block';
                seccionadorDiv.style.display = 'none';
            } else {
                operadorDiv.style.display = 'none';
                seccionadorDiv.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab1', this.dataset.submode);
        });
    });
    operadorDiv.style.display = 'block';
    seccionadorDiv.style.display = 'none';

    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab1' && e.detail.subMode) {
            const targetTab = document.querySelector(`#procesarSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    const clearBtn = tabContainer.querySelector('.clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const procesarPanels = document.querySelectorAll('#procesarPanelsContainer .procesar-panel');
            procesarPanels.forEach(panel => {
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
                const tipoOrigen = panel.querySelector('#tipoOrigen');
                if (tipoOrigen) tipoOrigen.value = '';
                const tipoUbicacion = panel.querySelector('#tipoUbicacion');
                if (tipoUbicacion) tipoUbicacion.value = '';
                const tipoCategoria = panel.querySelector('#tipoCategoria');
                if (tipoCategoria) tipoCategoria.value = '';
                const nombrePersonalizado = panel.querySelector('#nombrePersonalizado');
                if (nombrePersonalizado) nombrePersonalizado.value = '';
                const sufijoAdicional = panel.querySelector('#sufijoAdicional');
                if (sufijoAdicional) sufijoAdicional.value = '';
                const outputDiv = panel.querySelector('.output-area');
                if (outputDiv) outputDiv.innerHTML = '';
                const messageDiv = panel.querySelector('.message');
                if (messageDiv) messageDiv.innerHTML = '';
                const autoBtn = panel.querySelector('.format-btn[data-format="auto"]');
                if (autoBtn) autoBtn.click();
                if (panel.querySelector('#tipoOrigen')) {
                    const evt = new Event('input');
                    panel.querySelector('#tipoOrigen').dispatchEvent(evt);
                }
                const autoToggleOn = panel.querySelector(`#autocompletarToggle_${panel.id} .toggle-option[data-op="on"]`);
                if (autoToggleOn) autoToggleOn.click();
                const autoservicio = panel.querySelector('.autoservicioCheckbox');
                if (autoservicio) autoservicio.checked = false;
                datosActualesConEAN = [];
                window[`dfMainData_${panel.id}`] = null;
                window[`dfMain_${panel.id}`] = null;
            });
            const seccionadorDivEl = document.getElementById('procesarSeccionador');
            if (seccionadorDivEl) {
                const categoriaTextareas = seccionadorDivEl.querySelectorAll('.categoria-textarea');
                categoriaTextareas.forEach(ta => ta.value = '');
                const scanGlobal = document.getElementById('scanGlobalInput');
                if (scanGlobal) scanGlobal.value = '';
                const includeCat = document.getElementById('includeCategoryInDiffCheckbox');
                if (includeCat) includeCat.checked = false;
                const seccionadorOutput = document.getElementById('seccionadorOutput');
                if (seccionadorOutput) seccionadorOutput.innerHTML = '';
                const comparacionOutput = document.getElementById('comparacionOutput');
                if (comparacionOutput) comparacionOutput.innerHTML = '';
                const seccionadorMessage = document.getElementById('seccionadorMessage');
                if (seccionadorMessage) seccionadorMessage.innerHTML = '';
                const comparacionMessage = document.getElementById('comparacionMessage');
                if (comparacionMessage) comparacionMessage.innerHTML = '';
                currentUnificadoDf = null;
                currentComparacionDf = null;
            }
        });
    }
})();