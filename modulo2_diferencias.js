// Módulo Diferencias Folios - v4.0 (Múltiples folios REAL + Drag and drop)
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab2');
    if (!container) return;

    // ========== CONTADOR DE PESTAÑAS ==========
    let diffTabCounter = 1;
    let activeDiffTabId = 'diff_tab_0';

    // ========== FUNCIÓN GENERAR AHK ==========
    function generarAHKDesdeCodigos(codigos, titulo = '') {
        if (!codigos || codigos.length === 0) return null;
        const MAX_CODIGOS_POR_GRUPO = 50;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigos.length} envíos (Sleep 50ms entre cada código, 100ms entre grupos)\n\n`;
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        const grupos = [];
        for (let i = 0; i < codigos.length; i += MAX_CODIGOS_POR_GRUPO) {
            grupos.push(codigos.slice(i, i + MAX_CODIGOS_POR_GRUPO));
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

    // ========== FUNCIÓN PARA PROCESAR TEXTO INDIVIDUAL ==========
    function procesarTextoUniversal(texto) {
        if (!texto || !texto.trim()) return [];
        
        let parsed = core.parsearTextoUniversal(texto);
        if (parsed && parsed.length > 0) {
            return parsed.filter(r => r.TALLA !== 'TOTAL');
        }
        
        const items = core.parsearEntradaUniversal(texto);
        if (items && items.length > 0) {
            const lib = core.obtenerBiblioteca();
            const resultados = [];
            for (const item of items) {
                let modelo = item.modelo;
                let linea = item.linea || '';
                let tipo = item.tipo || '';
                let talla = item.talla || '';
                let cantidad = item.cantidad || 1;
                
                if (item.codigoEAN13) {
                    const decodificado = core.decodificarCodigoEAN13(item.codigoEAN13, lib);
                    if (decodificado) {
                        modelo = decodificado.modelo;
                        linea = decodificado.linea;
                        tipo = decodificado.tipo;
                        talla = decodificado.talla;
                    }
                }
                
                if (item.codigoEncontrado) {
                    const encontrado = lib.find(reg => String(reg.CODIGO).trim() === String(item.codigoEncontrado).trim());
                    if (encontrado) {
                        modelo = encontrado.MODELO;
                        linea = encontrado.LINEA;
                        tipo = encontrado.TIPO;
                    }
                }
                
                if (!linea || !tipo) {
                    const encontrado = core.buscarCodigoPrioritario(modelo, linea, tipo, lib);
                    if (encontrado) {
                        linea = encontrado.LINEA;
                        tipo = encontrado.TIPO;
                    }
                }
                
                resultados.push({
                    MODELO: modelo,
                    LINEA: linea || '',
                    TIPO: tipo || '',
                    TALLA: talla || '',
                    CANTIDAD: cantidad || 1
                });
            }
            return resultados;
        }
        
        return [];
    }

    // ========== FUNCIÓN PARA RENDERIZAR TABLA CON ACCIONES ==========
    function renderTablaConAcciones(df, panelId, realName, compararName) {
        if (!df || !df.length) return '<p style="color:#666;">Sin datos. Procesa primero.</p>';
        
        const dataSinTotales = df.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
        const totalRow = df.find(r => r.TALLA === 'TOTALES:' || r.TALLA === 'TOTAL');
        
        let headers = ['MODELO', 'LINEA', 'TIPO', 'TALLA', 'RESULTADO', 'DIFERENCIA'];
        if (realName) headers.push(`CANTIDAD_${realName}`);
        if (compararName) headers.push(`CANTIDAD_${compararName}`);
        headers.push('ACCIONES');

        let html = '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.75rem;">';
        html += '<thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        
        dataSinTotales.forEach((r, idx) => {
            const dif = r.DIFERENCIA || 0;
            const color = dif < 0 ? '#e74c3c' : (dif > 0 ? '#2ecc71' : '#666');
            const resultado = dif < 0 ? 'FALTANTE' : (dif > 0 ? 'SOBRANTE' : '');
            
            const cantReal = r[`CANTIDAD_${realName}`] !== undefined ? r[`CANTIDAD_${realName}`] : (r.CANTIDAD_REAL || 0);
            const cantComparar = r[`CANTIDAD_${compararName}`] !== undefined ? r[`CANTIDAD_${compararName}`] : (r.CANTIDAD_COMPARAR || 0);
            
            html += '<tr>';
            html += `<td>${r.MODELO || ''}</td>`;
            html += `<td>${r.LINEA || ''}</td>`;
            html += `<td>${r.TIPO || ''}</td>`;
            html += `<td>${r.TALLA || ''}</td>`;
            html += `<td style="color:${color}; font-weight:bold;">${resultado}</td>`;
            html += `<td style="color:${color}; font-weight:bold;">${dif}</td>`;
            if (realName) html += `<td>${cantReal}</td>`;
            if (compararName) html += `<td>${cantComparar}</td>`;
            html += `<td>
                <button class="delete-diff-row" data-panel="${panelId}" data-idx="${idx}" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.6rem;" title="Eliminar fila"><i class="fas fa-trash"></i></button>
                <button class="copy-diff-code" data-modelo="${r.MODELO}" data-linea="${r.LINEA}" data-tipo="${r.TIPO}" data-talla="${r.TALLA}" style="background:#444; border:1px solid var(--blu); color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.6rem;" title="Copiar código EAN"><i class="fas fa-copy"></i></button>
            </td>`;
            html += '</tr>';
        });
        
        if (totalRow) {
            const cantRealTotal = totalRow[`CANTIDAD_${realName}`] !== undefined ? totalRow[`CANTIDAD_${realName}`] : (totalRow.CANTIDAD_REAL || 0);
            const cantCompararTotal = totalRow[`CANTIDAD_${compararName}`] !== undefined ? totalRow[`CANTIDAD_${compararName}`] : (totalRow.CANTIDAD_COMPARAR || 0);
            
            html += '<tr style="background:#1a2a1a; font-weight:bold;">';
            html += `<td></td><td></td><td></td><td style="color:#f1c40f;">${totalRow.TALLA || 'TOTALES:'}</td>`;
            html += `<td style="color:#f1c40f;">${totalRow.RESULTADO || ''}</td>`;
            html += `<td style="color:#f1c40f;">${totalRow.DIFERENCIA || 0}</td>`;
            if (realName) html += `<td>${cantRealTotal}</td>`;
            if (compararName) html += `<td>${cantCompararTotal}</td>`;
            html += `<td></td>`;
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
    }

    // ========== FUNCIÓN DRAG AND DROP ==========
    function setupDragAndDrop(textarea, messageDiv) {
        if (!textarea) return;
        
        textarea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '#2ecc71';
            textarea.style.boxShadow = '0 0 0 2px rgba(46,204,113,0.3)';
        });
        
        textarea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '';
            textarea.style.boxShadow = '';
        });
        
        textarea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '';
            textarea.style.boxShadow = '';
            
            const files = e.dataTransfer.files;
            if (files.length === 0) return;
            
            const file = files[0];
            const extension = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['txt', 'csv', 'log', 'dat'];
            
            if (!validExtensions.includes(extension)) {
                if (messageDiv) {
                    messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Archivo no soportado. Solo se permiten .txt, .csv, .log, .dat`;
                    setTimeout(() => { if (messageDiv.innerHTML.includes('no soportado')) messageDiv.innerHTML = ''; }, 3000);
                }
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                textarea.value = ev.target.result;
                textarea.dispatchEvent(new Event('input'));
                if (messageDiv) {
                    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Archivo "${file.name}" cargado correctamente (${(file.size / 1024).toFixed(1)} KB)`;
                    setTimeout(() => {
                        if (messageDiv.innerHTML.includes('cargado correctamente')) {
                            messageDiv.innerHTML = '';
                        }
                    }, 3000);
                }
            };
            reader.onerror = () => {
                if (messageDiv) {
                    messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error al leer el archivo "${file.name}"`;
                }
            };
            reader.readAsText(file);
        });
    }

    // ========== FUNCIÓN PARA CREAR FOLIO (REAL o COMPARAR) ==========
    function crearFolioDinamico(containerId, nombreBase = 'ADICIONAL', color = '#f1c40f', icono = 'fa-file-alt', contenidoInicial = '') {
        const c = document.getElementById(containerId);
        if (!c) return null;
        
        const currentCount = c.children.length + 1;
        const nombrePorDefecto = `${nombreBase}${currentCount}`;
        
        const div = document.createElement('div');
        div.className = 'row';
        div.style.marginBottom = '0.5rem';
        div.style.background = 'rgba(0,0,0,0.2)';
        div.style.padding = '0.4rem 0.6rem';
        div.style.borderRadius = '4px';
        div.style.border = `2px solid ${color}`;
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '0.6rem';
        div.style.flexWrap = 'wrap';
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.4rem; min-width:120px;">
                <i class="fas ${icono}" style="color:${color}; font-size:0.8rem;"></i>
                <input type="text" class="folio-name-input" value="${nombrePorDefecto}" style="width:120px; font-size:0.8rem; padding:0.2rem 0.4rem; background:var(--blud); color:white; border:1px solid ${color}; border-radius:3px;">
            </div>
            <div style="flex:1; min-width:200px;">
                <textarea rows="3" style="width:100%; font-size:0.75rem; padding:0.2rem 0.4rem; background:var(--blud); color:white; border:1px solid ${color}; border-radius:3px; resize:vertical; min-height:50px;"></textarea>
            </div>
            <div style="display:flex; gap:0.3rem;">
                <button class="upload-csv-btn" style="font-size:0.7rem; padding:0.15rem 0.5rem;"><i class="fas fa-folder-open"></i></button>
                <input type="file" accept=".csv,.txt,text/plain" style="display:none;">
                <button class="remove-folio-btn" style="font-size:0.7rem; padding:0.15rem 0.5rem; background:#ff4444; border-color:#ff4444;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        c.appendChild(div);
        
        const nameInput = div.querySelector('.folio-name-input');
        const upBtn = div.querySelector('.upload-csv-btn');
        const fileInp = div.querySelector('input[type="file"]');
        const ta = div.querySelector('textarea');
        const removeBtn = div.querySelector('.remove-folio-btn');
        
        if (contenidoInicial) ta.value = contenidoInicial;
        
        upBtn.addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; };
            r.readAsText(f);
        });
        
        removeBtn.addEventListener('click', () => {
            div.remove();
            const folios = c.querySelectorAll('.folio-name-input');
            folios.forEach((inp, idx) => {
                const base = inp.value.replace(/\d+$/, '');
                inp.value = `${base}${idx + 1}`;
            });
        });
        
        // Drag and drop en el textarea
        const msgDiv = c.closest('.diff-panel')?.querySelector('.diffMessage');
        setupDragAndDrop(ta, msgDiv);
        
        // Doble clic en el nombre
        nameInput.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const oldName = this.value;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldName;
            input.style.width = '120px';
            input.style.background = 'var(--blud)';
            input.style.color = 'var(--white)';
            input.style.border = '1px solid var(--blu)';
            input.style.borderRadius = '3px';
            input.style.padding = '0.1rem 0.3rem';
            input.style.fontSize = '0.8rem';
            this.style.display = 'none';
            this.parentNode.insertBefore(input, this);
            input.focus();
            input.select();
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || oldName;
                this.value = newName;
                this.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        
        return div;
    }

    // ========== OBTENER HTML DE UNA PESTAÑA ==========
    function getDiffPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="diff-panel" style="display:none; padding-top:0.5rem;">
                <!-- FOLIO REAL (ahora con múltiples folios) -->
                <div style="border:2px solid #2ecc71; border-radius:6px; padding:0.8rem; margin-bottom:1rem; background:rgba(46,204,113,0.05);">
                    <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:0.5rem;">
                        <h4 style="color:#2ecc71; margin:0;"><i class="fas fa-check-circle"></i> Folio Real (referencia)</h4>
                        <button class="addRealBtn" style="font-size:0.75rem; padding:0.3rem 0.8rem;"><i class="fas fa-plus"></i> Agregar folio</button>
                    </div>
                    <div id="realFoliosContainer_${tabId}"></div>
                    <div style="font-size:0.7rem; color:var(--grayl); margin-top:0.3rem;">
                        <i class="fas fa-info-circle"></i> Haz doble clic en el nombre de cada folio para renombrarlo
                    </div>
                </div>

                <!-- FOLIOS A COMPARAR -->
                <div style="border:2px solid #f1c40f; border-radius:6px; padding:0.8rem; margin-bottom:1rem; background:rgba(241,196,15,0.05);">
                    <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:0.5rem;">
                        <h4 style="color:#f1c40f; margin:0;"><i class="fas fa-exchange-alt"></i> Folios a comparar</h4>
                        <button class="addCompararBtn" style="font-size:0.75rem; padding:0.3rem 0.8rem;"><i class="fas fa-plus"></i> Agregar folio</button>
                    </div>
                    <div id="compararFoliosContainer_${tabId}"></div>
                    <div style="font-size:0.7rem; color:var(--grayl); margin-top:0.3rem;">
                        <i class="fas fa-info-circle"></i> Haz doble clic en el nombre de cada folio para renombrarlo
                    </div>
                </div>

                <!-- CONTROLES -->
                <div style="display:flex; align-items:center; gap:0.8rem; margin:0.8rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="diffTicketMode" style="width:16px; height:16px; accent-color:#3498db;"> 
                        <strong style="color:#3498db; font-size:0.85rem;"><i class="fas fa-ticket-alt"></i> Modo Ticket</strong>
                    </label>
                </div>

                <!-- NOMBRE DE ARCHIVO -->
                <div style="margin:0.8rem 0; padding:0.6rem 0.8rem; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid var(--blu);">
                    <b style="font-size:0.85rem;"><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row" style="margin-top:0.3rem; gap:0.3rem;">
                        <div style="display:inline-flex; align-items:center; gap:3px; background:var(--blu); padding:0.1rem 0.5rem; border-radius:3px; font-size:0.7rem;">
                            <i class="fas fa-file-csv"></i> diferencias
                        </div>
                        <select class="diffTipoUbicacion" style="width:140px; font-size:0.75rem; padding:0.2rem 0.4rem;">
                            <option value="">(ubicación)</option>
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
                        <select class="diffTipoCategoria" style="width:110px; font-size:0.75rem; padding:0.2rem 0.4rem;">
                            <option value="">(categoría)</option>
                            <option value="home">home</option>
                            <option value="calzado">calzado</option>
                            <option value="ropa">ropa</option>
                            <option value="catalogos">catalogos</option>
                            <option value="TODO">TODO</option>
                        </select>
                        <input type="text" class="diffNombrePersonalizado" placeholder="Personalizado" style="width:140px; font-size:0.75rem; padding:0.2rem 0.4rem;">
                        <input type="text" class="diffSufijoAdicional" placeholder="Sufijo extra" style="width:110px; font-size:0.75rem; padding:0.2rem 0.4rem;">
                    </div>
                </div>

                <!-- BOTONES PRINCIPALES -->
                <div class="row" style="margin:0.5rem 0; flex-wrap:wrap; gap:0.3rem;">
                    <button class="processDiffBtn btn-primary" style="padding:0.3rem 0.8rem; font-size:0.85rem;"><i class="fas fa-play"></i> Procesar diferencias</button>
                    <button class="copyDiffTsvBtn" style="font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button class="copyDiffCsvBtn" style="font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" class="diffFilename" value="diferencias.csv" style="width:220px; font-size:0.75rem; padding:0.2rem 0.4rem;">
                    <button class="downloadDiffBtn" style="font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback diffCopyFeedback" style="font-size:0.75rem;"></span>
                </div>
                <div class="row" style="margin-top:0.3rem; flex-wrap:wrap; gap:0.3rem;">
                    <button class="downloadAhkFaltantes" style="background:#e74c3c; border-color:#e74c3c; font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-code"></i> AHK Faltantes</button>
                    <button class="downloadAhkSobrantes" style="background:#2ecc71; border-color:#2ecc71; font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-code"></i> AHK Sobrantes</button>
                    <button class="copyAhkFaltantes" style="background:#444; border-color:#e74c3c; font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar AHK Faltantes</button>
                    <button class="copyAhkSobrantes" style="background:#444; border-color:#2ecc71; font-size:0.75rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar AHK Sobrantes</button>
                </div>

                <div class="diffMessage message" style="font-size:0.85rem; padding:0.4rem 0.8rem;"></div>
                <div class="diffSummary message" style="background:#1a2a1a; border-color:#2ecc71; font-size:0.85rem; padding:0.4rem 0.8rem; display:none;"></div>
                <div class="diffOutput output-area" style="max-height:500px; overflow:auto; font-size:0.8rem;"></div>
            </div>
        `;
    }

    // ========== INICIALIZAR EVENTOS DE UNA PESTAÑA ==========
    function initDiffPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // ========== REFERENCIAS ==========
        const realContainer = panel.querySelector(`#realFoliosContainer_${panelId}`);
        const compararContainer = panel.querySelector(`#compararFoliosContainer_${panelId}`);
        const processBtn = panel.querySelector('.processDiffBtn');
        const messageDiv = panel.querySelector('.diffMessage');
        const summaryDiv = panel.querySelector('.diffSummary');
        const outputDiv = panel.querySelector('.diffOutput');
        const copyFeedback = panel.querySelector('.diffCopyFeedback');
        
        const ticketCheckbox = panel.querySelector('.diffTicketMode');
        const filenameInput = panel.querySelector('.diffFilename');
        const tipoUbicacion = panel.querySelector('.diffTipoUbicacion');
        const tipoCategoria = panel.querySelector('.diffTipoCategoria');
        const nombrePersonalizado = panel.querySelector('.diffNombrePersonalizado');
        const sufijoAdicional = panel.querySelector('.diffSufijoAdicional');

        // ========== DATOS INTERNOS ==========
        let realName = 'REAL';
        let compararName = 'COMPARAR';

        // ========== FUNCIÓN PARA ACTUALIZAR NOMBRE DE ARCHIVO ==========
        function actualizarNombreArchivo() {
            const ubicacion = tipoUbicacion?.value || '';
            const categoria = tipoCategoria?.value || '';
            const personalizado = nombrePersonalizado?.value || '';
            const sufijo = sufijoAdicional?.value || '';
            let nombre = 'diferencias';
            if (ubicacion) nombre += ubicacion;
            if (categoria) nombre += categoria;
            if (personalizado) nombre += personalizado;
            if (sufijo) nombre += sufijo;
            if (filenameInput) filenameInput.value = nombre + '.csv';
        }

        tipoUbicacion?.addEventListener('change', actualizarNombreArchivo);
        tipoUbicacion?.addEventListener('input', actualizarNombreArchivo);
        tipoCategoria?.addEventListener('change', actualizarNombreArchivo);
        tipoCategoria?.addEventListener('input', actualizarNombreArchivo);
        nombrePersonalizado?.addEventListener('input', actualizarNombreArchivo);
        sufijoAdicional?.addEventListener('input', actualizarNombreArchivo);
        actualizarNombreArchivo();

        // ========== BOTÓN AGREGAR REAL ==========
        panel.querySelector('.addRealBtn').addEventListener('click', () => {
            crearFolioDinamico(`realFoliosContainer_${panelId}`, 'REAL', '#2ecc71', 'fa-check-circle');
        });

        // ========== BOTÓN AGREGAR COMPARAR ==========
        panel.querySelector('.addCompararBtn').addEventListener('click', () => {
            crearFolioDinamico(`compararFoliosContainer_${panelId}`, 'ADICIONAL', '#f1c40f', 'fa-exchange-alt');
        });

        // ========== CREAR FOLIOS POR DEFECTO ==========
        crearFolioDinamico(`realFoliosContainer_${panelId}`, 'REAL', '#2ecc71', 'fa-check-circle');
        crearFolioDinamico(`compararFoliosContainer_${panelId}`, 'ADICIONAL', '#f1c40f', 'fa-exchange-alt');

        // ========== DRAG AND DROP EN TEXTAREAS EXISTENTES ==========
        // Aplicar a todos los textareas de la pestaña
        const allTextareas = panel.querySelectorAll('textarea');
        allTextareas.forEach(ta => setupDragAndDrop(ta, messageDiv));

        // ========== PROCESAR ==========
        processBtn.addEventListener('click', () => {
            // ========== OBTENER TODOS LOS FOLIOS REALES ==========
            const realTextareas = realContainer.querySelectorAll('textarea');
            const realNames = realContainer.querySelectorAll('.folio-name-input');
            
            const realFolios = [];
            let totalRealRows = 0;
            let realNameFinal = 'REAL';
            
            realTextareas.forEach((ta, idx) => {
                if (!ta.value.trim()) return;
                const rows = procesarTextoUniversal(ta.value);
                if (rows.length > 0) {
                    const nombre = realNames[idx]?.value.trim() || `REAL${idx+1}`;
                    if (idx === 0) realNameFinal = nombre;
                    realFolios.push({
                        nombre: nombre,
                        datos: rows
                    });
                    totalRealRows += rows.length;
                }
            });
            
            if (realFolios.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar al menos un Folio Real.';
                summaryDiv.style.display = 'none';
                return;
            }
            
            // ========== COMBINAR TODOS LOS FOLIOS REALES ==========
            const mapRealCombinado = new Map();
            for (const folio of realFolios) {
                for (const row of folio.datos) {
                    const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                    if (mapRealCombinado.has(key)) {
                        mapRealCombinado.get(key).CANTIDAD += row.CANTIDAD;
                    } else {
                        mapRealCombinado.set(key, { ...row });
                    }
                }
            }
            const realRowsCombinados = Array.from(mapRealCombinado.values());
            
            // ========== OBTENER TODOS LOS FOLIOS DE COMPARAR ==========
            const compararTextareas = compararContainer.querySelectorAll('textarea');
            const compararNames = compararContainer.querySelectorAll('.folio-name-input');
            
            const compararFolios = [];
            let totalCompararRows = 0;
            
            compararTextareas.forEach((ta, idx) => {
                if (!ta.value.trim()) return;
                const rows = procesarTextoUniversal(ta.value);
                if (rows.length > 0) {
                    const nombre = compararNames[idx]?.value.trim() || `ADICIONAL${idx+1}`;
                    compararFolios.push({
                        nombre: nombre,
                        datos: rows
                    });
                    totalCompararRows += rows.length;
                }
            });
            
            if (compararFolios.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes agregar al menos un folio para comparar.';
                summaryDiv.style.display = 'none';
                return;
            }
            
            // ========== COMBINAR TODOS LOS FOLIOS DE COMPARAR ==========
            const mapCompararCombinado = new Map();
            for (const folio of compararFolios) {
                for (const row of folio.datos) {
                    const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                    if (mapCompararCombinado.has(key)) {
                        mapCompararCombinado.get(key).CANTIDAD += row.CANTIDAD;
                    } else {
                        mapCompararCombinado.set(key, { ...row });
                    }
                }
            }
            const compararRowsCombinados = Array.from(mapCompararCombinado.values());
            
            // ========== COMPARAR ==========
            const mapR = new Map();
            for (const r of realRowsCombinados) {
                const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
                if (mapR.has(k)) {
                    mapR.get(k).CANTIDAD += r.CANTIDAD;
                } else {
                    mapR.set(k, { ...r });
                }
            }
            
            const mapC = new Map();
            for (const r of compararRowsCombinados) {
                const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
                if (mapC.has(k)) {
                    mapC.get(k).cantidad += r.CANTIDAD;
                } else {
                    mapC.set(k, { cantidad: r.CANTIDAD, ref: { ...r } });
                }
            }
            
            const allKeys = new Set([...mapR.keys(), ...mapC.keys()]);
            const diffs = [];
            let faltSum = 0, sobrSum = 0;
            let totalFaltantes = 0, totalSobrantes = 0;
            
            allKeys.forEach(k => {
                const rData = mapR.get(k);
                const cData = mapC.get(k);
                const rCant = rData ? rData.CANTIDAD : 0;
                const cCant = cData ? cData.cantidad : 0;
                
                if (rCant !== cCant) {
                    let ref = rData || (cData ? cData.ref : {});
                    const dif = cCant - rCant;
                    const resultado = dif > 0 ? 'SOBRANTE' : 'FALTANTE';
                    
                    diffs.push({
                        MODELO: ref.MODELO || '',
                        LINEA: ref.LINEA || '',
                        TIPO: ref.TIPO || '',
                        TALLA: ref.TALLA || '',
                        CANTIDAD_REAL: rCant,
                        CANTIDAD_COMPARAR: cCant,
                        RESULTADO: resultado,
                        DIFERENCIA: dif
                    });
                    
                    if (dif < 0) {
                        faltSum += Math.abs(dif);
                        totalFaltantes++;
                    } else if (dif > 0) {
                        sobrSum += dif;
                        totalSobrantes++;
                    }
                }
            });
            
            // Calcular totales
            let tR = 0, tC = 0;
            for (const d of diffs) {
                tR += d.CANTIDAD_REAL || 0;
                tC += d.CANTIDAD_COMPARAR || 0;
            }
            const totalAbs = faltSum + sobrSum;
            const totalDiferencias = totalFaltantes + totalSobrantes;
            
            if (diffs.length > 0) {
                diffs.push({
                    MODELO: '',
                    LINEA: '',
                    TIPO: '',
                    TALLA: 'TOTALES:',
                    CANTIDAD_REAL: tR,
                    CANTIDAD_COMPARAR: tC,
                    RESULTADO: `Faltante: ${faltSum} | Sobrante: ${sobrSum}`,
                    DIFERENCIA: totalAbs
                });
            }
            
            // ========== RENOMBRAR COLUMNAS ==========
            const compararNameFinal = compararFolios.length === 1 ? compararFolios[0].nombre : 'COMPARAR';
            window[`diferenciasDf_${panelId}`] = diffs.map(row => {
                const newRow = { ...row };
                if (newRow.CANTIDAD_REAL !== undefined) {
                    newRow[`CANTIDAD_${realNameFinal}`] = newRow.CANTIDAD_REAL;
                    delete newRow.CANTIDAD_REAL;
                }
                if (newRow.CANTIDAD_COMPARAR !== undefined) {
                    newRow[`CANTIDAD_${compararNameFinal}`] = newRow.CANTIDAD_COMPARAR;
                    delete newRow.CANTIDAD_COMPARAR;
                }
                return newRow;
            });
            
            // Guardar datos para AHK
            window[`diffData_${panelId}`] = {
                diffs: diffs,
                realName: realNameFinal,
                compararName: compararNameFinal
            };
            
            // ========== MOSTRAR ==========
            const countRows = diffs.length ? diffs.length - 1 : 0;
            outputDiv.innerHTML = renderTablaConAcciones(
                window[`diferenciasDf_${panelId}`],
                panelId,
                realNameFinal,
                compararNameFinal
            );
            
            // Resumen
            let summaryHtml = `
                <b><i class="fas fa-chart-bar"></i> Resumen:</b><br>
                <span style="color:#2ecc71;">${realNameFinal}:</span> ${totalRealRows} productos procesados (${realFolios.length} folios combinados)<br>
                <span style="color:#f1c40f;">${compararNameFinal}:</span> ${totalCompararRows} productos procesados (${compararFolios.length} folios combinados)<br>
                <span style="color:#e74c3c;">Diferencias encontradas:</span> <b>${totalDiferencias}</b><br>
                <span style="color:#e74c3c;">Faltantes:</span> <b>${faltSum}</b> unidades (${totalFaltantes} items) &nbsp;|&nbsp; <span style="color:#2ecc71;">Sobrantes:</span> <b>${sobrSum}</b> unidades (${totalSobrantes} items)
            `;
            summaryDiv.innerHTML = summaryHtml;
            summaryDiv.style.display = 'block';
            
            messageDiv.innerHTML = diffs.length ?
                `<i class="fas fa-exclamation-triangle"></i> Se encontraron <b>${totalDiferencias}</b> diferencias.` :
                '<i class="fas fa-check-circle"></i> Los folios coinciden exactamente.';
                
            realName = realNameFinal;
            compararName = compararNameFinal;
        });

        // ========== ELIMINAR FILA ==========
        outputDiv.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-diff-row');
            if (deleteBtn) {
                const idx = parseInt(deleteBtn.dataset.idx);
                if (isNaN(idx)) return;
                
                const df = window[`diferenciasDf_${panelId}`];
                if (!df || idx >= df.length) return;
                
                if (confirm(`¿Eliminar la fila ${idx + 1}?`)) {
                    const dataSinTotales = df.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
                    const rowToRemove = dataSinTotales[idx];
                    if (!rowToRemove) return;
                    
                    const realIdx = df.indexOf(rowToRemove);
                    if (realIdx === -1) return;
                    df.splice(realIdx, 1);
                    
                    const nuevasFilas = df.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
                    let faltSum = 0, sobrSum = 0;
                    let tR = 0, tC = 0;
                    
                    for (const d of nuevasFilas) {
                        const dif = d.DIFERENCIA || 0;
                        tR += d[`CANTIDAD_${realName}`] || 0;
                        tC += d[`CANTIDAD_${compararName}`] || 0;
                        if (dif < 0) faltSum += Math.abs(dif);
                        else if (dif > 0) sobrSum += dif;
                    }
                    
                    const totalIdx = df.findIndex(r => r.TALLA === 'TOTALES:' || r.TALLA === 'TOTAL');
                    if (totalIdx !== -1) {
                        if (nuevasFilas.length === 0) {
                            df.splice(totalIdx, 1);
                        } else {
                            df[totalIdx] = {
                                MODELO: '',
                                LINEA: '',
                                TIPO: '',
                                TALLA: 'TOTALES:',
                                CANTIDAD_REAL: tR,
                                CANTIDAD_COMPARAR: tC,
                                RESULTADO: `Faltante: ${faltSum} | Sobrante: ${sobrSum}`,
                                DIFERENCIA: faltSum + sobrSum
                            };
                            const newRow = { ...df[totalIdx] };
                            if (newRow.CANTIDAD_REAL !== undefined) {
                                newRow[`CANTIDAD_${realName}`] = newRow.CANTIDAD_REAL;
                                delete newRow.CANTIDAD_REAL;
                            }
                            if (newRow.CANTIDAD_COMPARAR !== undefined) {
                                newRow[`CANTIDAD_${compararName}`] = newRow.CANTIDAD_COMPARAR;
                                delete newRow.CANTIDAD_COMPARAR;
                            }
                            df[totalIdx] = newRow;
                        }
                    }
                    
                    window[`diferenciasDf_${panelId}`] = df;
                    outputDiv.innerHTML = renderTablaConAcciones(df, panelId, realName, compararName);
                    
                    const totalDiferencias = nuevasFilas.length;
                    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Fila eliminada. Restan <b>${totalDiferencias}</b> diferencias.`;
                }
                return;
            }
            
            // ========== COPIAR CÓDIGO EAN ==========
            const copyCodeBtn = e.target.closest('.copy-diff-code');
            if (copyCodeBtn) {
                const modelo = copyCodeBtn.dataset.modelo;
                const linea = copyCodeBtn.dataset.linea;
                const tipo = copyCodeBtn.dataset.tipo;
                const talla = copyCodeBtn.dataset.talla;
                
                if (modelo && linea && tipo) {
                    const lib = core.obtenerBiblioteca();
                    const encontrado = core.buscarCodigoPrioritario(modelo, linea, tipo, lib);
                    if (encontrado) {
                        const codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, talla);
                        navigator.clipboard.writeText(codigoEAN).then(() => {
                            const original = copyCodeBtn.innerHTML;
                            copyCodeBtn.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i>';
                            setTimeout(() => { copyCodeBtn.innerHTML = original; }, 1500);
                        }).catch(() => {});
                    } else {
                        messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontró código para ${modelo} ${linea} ${tipo}`;
                    }
                }
            }
        });

        // ========== FUNCIONES PARA GENERAR AHK ==========
        function generarAHKPorTipo(panelId, tipo) {
            const data = window[`diffData_${panelId}`];
            if (!data || !data.diffs || data.diffs.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos. Procesa primero.';
                return null;
            }
            
            const lib = core.obtenerBiblioteca();
            const codigos = [];
            const diffs = data.diffs.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL');
            
            for (const d of diffs) {
                const dif = d.DIFERENCIA || 0;
                if (tipo === 'faltantes' && dif >= 0) continue;
                if (tipo === 'sobrantes' && dif <= 0) continue;
                
                const cantidad = Math.abs(dif);
                const encontrado = core.buscarCodigoPrioritario(d.MODELO, d.LINEA, d.TIPO, lib);
                if (encontrado) {
                    const codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, d.TALLA);
                    for (let i = 0; i < cantidad; i++) {
                        codigos.push(codigoEAN);
                    }
                }
            }
            
            return codigos;
        }

        // ========== BOTONES AHK ==========
        panel.querySelector('.downloadAhkFaltantes').addEventListener('click', () => {
            const codigos = generarAHKPorTipo(panelId, 'faltantes');
            if (!codigos || codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay faltantes para generar AHK.';
                return;
            }
            const ahk = generarAHKDesdeCodigos(codigos, `Faltantes (${codigos.length} envíos)`);
            if (!ahk) return;
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faltantes_${core.generarNombreFecha('ahk')}`;
            a.click();
            URL.revokeObjectURL(url);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK de faltantes descargado (${codigos.length} envíos).`;
        });

        panel.querySelector('.downloadAhkSobrantes').addEventListener('click', () => {
            const codigos = generarAHKPorTipo(panelId, 'sobrantes');
            if (!codigos || codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay sobrantes para generar AHK.';
                return;
            }
            const ahk = generarAHKDesdeCodigos(codigos, `Sobrantes (${codigos.length} envíos)`);
            if (!ahk) return;
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sobrantes_${core.generarNombreFecha('ahk')}`;
            a.click();
            URL.revokeObjectURL(url);
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK de sobrantes descargado (${codigos.length} envíos).`;
        });

        panel.querySelector('.copyAhkFaltantes').addEventListener('click', () => {
            const codigos = generarAHKPorTipo(panelId, 'faltantes');
            if (!codigos || codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay faltantes para copiar.';
                return;
            }
            const texto = codigos.join('\n');
            core.copiarTexto(texto, 'diffCopyFeedback');
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${codigos.length} códigos de faltantes copiados.`;
        });

        panel.querySelector('.copyAhkSobrantes').addEventListener('click', () => {
            const codigos = generarAHKPorTipo(panelId, 'sobrantes');
            if (!codigos || codigos.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay sobrantes para copiar.';
                return;
            }
            const texto = codigos.join('\n');
            core.copiarTexto(texto, 'diffCopyFeedback');
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${codigos.length} códigos de sobrantes copiados.`;
        });

        // ========== FUNCIONES DE COPIA Y DESCARGA ==========
        function getDiffTicketData(panelId) {
            const df = window[`diferenciasDf_${panelId}`];
            if (!df) return [];
            return df.filter(r => r.TALLA !== 'TOTALES:' && r.TALLA !== 'TOTAL').map(r => ({
                MODELO: r.MODELO,
                LINEA: r.LINEA,
                TIPO: r.TIPO,
                DIFERENCIA: r.DIFERENCIA
            }));
        }

        panel.querySelector('.copyDiffTsvBtn').addEventListener('click', () => {
            const df = window[`diferenciasDf_${panelId}`];
            if (!df || !df.length) {
                copyFeedback.textContent = 'Sin datos';
                setTimeout(() => copyFeedback.textContent = '', 1500);
                return;
            }
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ?
                core.dfToCsv(getDiffTicketData(panelId), '\t', false, true) :
                core.dfToCsv(df, '\t', true, true);
            core.copiarTexto(content, 'diffCopyFeedback');
        });

        panel.querySelector('.copyDiffCsvBtn').addEventListener('click', () => {
            const df = window[`diferenciasDf_${panelId}`];
            if (!df || !df.length) {
                copyFeedback.textContent = 'Sin datos';
                setTimeout(() => copyFeedback.textContent = '', 1500);
                return;
            }
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ?
                core.dfToCsv(getDiffTicketData(panelId), ',', false, true) :
                core.dfToCsv(df, ',', true, true);
            core.copiarTexto(content, 'diffCopyFeedback');
        });

        panel.querySelector('.downloadDiffBtn').addEventListener('click', () => {
            const df = window[`diferenciasDf_${panelId}`];
            if (!df || !df.length) return;
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'diferencias.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const ticketMode = ticketCheckbox.checked;
            let content = ticketMode ?
                core.dfToCsv(getDiffTicketData(panelId), ',', false, true) :
                core.dfToCsv(df, ',', true, true);
            core.downloadCsv(content, filename);
        });
    }

    // ========== CREAR PESTAÑA ==========
    function createDiffTab(tabName = null) {
        const tabId = `diff_tab_${diffTabCounter}`;
        const tabTitle = tabName || `Diferencias ${diffTabCounter}`;
        
        const tabsContainer = document.getElementById('diffTabsContainer');
        const addBtn = document.getElementById('addDiffTabBtn');
        
        const tabButton = document.createElement('div');
        tabButton.className = 'diff-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.style.cssText = 'background:var(--blub); border:1px solid var(--blu); border-radius:5px 5px 0 0; padding:0.3rem 0.8rem; cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:all 0.2s;';
        tabButton.innerHTML = `<span class="tab-name" style="font-size:0.85rem;">${core.escapeHtml(tabTitle)}</span><span class="tab-close" style="color:#ff8888; font-size:0.8rem; cursor:pointer; margin-left:0.3rem;" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        
        const panelsContainer = document.getElementById('diffPanelsContainer');
        const panelHtml = getDiffPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        
        initDiffPanelEvents(tabId);
        
        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'diff_tab_0') {
            closeBtn.style.display = 'none';
        } else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeDiffTabId === tabId) {
                    const firstTab = document.querySelector('#diffTabsContainer .diff-tab:not(#addDiffTabBtn)');
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
            input.style.cssText = 'width:auto; min-width:60px; background:var(--blud); color:var(--white); border:1px solid var(--blu); border-radius:3px; padding:0 2px;';
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
            document.querySelectorAll('#diffTabsContainer .diff-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'var(--blub)';
            });
            tabButton.classList.add('active');
            tabButton.style.background = 'var(--blu)';
            document.querySelectorAll('#diffPanelsContainer .diff-panel').forEach(p => p.style.display = 'none');
            panel.style.display = 'block';
            activeDiffTabId = tabId;
        });
        
        const existingTabs = document.querySelectorAll('#diffTabsContainer .diff-tab:not(#addDiffTabBtn)');
        if (existingTabs.length === 1) {
            tabButton.click();
        }
        diffTabCounter++;
    }

    // ========== INICIALIZAR CONTENEDOR ==========
    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-balance-scale"></i> Comparar folios múltiples</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v4.0</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
            
            <div class="diff-tabs-container" style="margin-bottom:0.5rem;">
                <div class="diff-tabs" id="diffTabsContainer" style="display:flex; gap:0.2rem; flex-wrap:wrap; border-bottom:1px solid var(--blub); padding-bottom:0.2rem;"></div>
                <div id="diffPanelsContainer"></div>
            </div>
            
            <div class="instructions-box" style="font-size:0.75rem; padding:0.4rem 0.8rem; margin-top:0.5rem;">
                <b><i class="fas fa-info-circle"></i> Instrucciones</b><br>
                1. Cada pestaña es independiente.<br>
                2. El <b style="color:#2ecc71;">Folio Real</b> ahora puede tener múltiples folios (se suman automáticamente).<br>
                3. Agrega uno o más <b style="color:#f1c40f;">folios a comparar</b> con el botón <span style="color:#ff8888;">+</span>.<br>
                4. Haz doble clic en el nombre de cada folio para renombrarlo.<br>
                5. Pulsa <b>Procesar diferencias</b> para ver las discrepancias.<br>
                <b style="color:#3498db;">Modo Ticket:</b> exporta solo MODELO, LINEA, TIPO, DIFERENCIA.<br>
                <b style="color:#e74c3c;">AHK Faltantes/Sobrantes:</b> genera scripts con los códigos EAN-13 correspondientes.<br>
                <b>Arrastrar archivos:</b> puedes arrastrar archivos .txt o .csv directamente a los textareas.
            </div>
        </div>
    `;

    // ========== INICIALIZAR PESTAÑAS ==========
    const tabsContainer = document.getElementById('diffTabsContainer');
    const addBtn = document.createElement('div');
    addBtn.id = 'addDiffTabBtn';
    addBtn.className = 'add-tab-btn';
    addBtn.style.cssText = 'background:var(--rr); border:1px solid var(--rr); border-radius:5px; padding:0.3rem 0.8rem; cursor:pointer; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.3rem;';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestaña';
    tabsContainer.appendChild(addBtn);
    addBtn.addEventListener('click', () => { createDiffTab(); });
    createDiffTab('Diferencias 1');

    // ========== LIMPIAR MÓDULO ==========
    const clearBtn = document.querySelector('#tab2 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Eliminar todas las pestañas excepto la primera
            const tabs = document.querySelectorAll('#diffTabsContainer .diff-tab');
            tabs.forEach((tab, index) => {
                if (index > 0) {
                    const tabId = tab.getAttribute('data-tab-id');
                    const panel = document.getElementById(tabId);
                    if (panel) panel.remove();
                    tab.remove();
                }
            });
            
            // Resetear la primera pestaña
            const firstPanel = document.querySelector('#diffPanelsContainer .diff-panel');
            if (firstPanel) {
                // Resetear REAL
                const realContainer = firstPanel.querySelector(`#realFoliosContainer_${firstPanel.id}`);
                if (realContainer) {
                    while (realContainer.firstChild) realContainer.removeChild(realContainer.firstChild);
                    crearFolioDinamico(`realFoliosContainer_${firstPanel.id}`, 'REAL', '#2ecc71', 'fa-check-circle');
                }
                
                // Resetear COMPARAR
                const compararContainer = firstPanel.querySelector(`#compararFoliosContainer_${firstPanel.id}`);
                if (compararContainer) {
                    while (compararContainer.firstChild) compararContainer.removeChild(compararContainer.firstChild);
                    crearFolioDinamico(`compararFoliosContainer_${firstPanel.id}`, 'ADICIONAL', '#f1c40f', 'fa-exchange-alt');
                }
                
                const messageDiv = firstPanel.querySelector('.diffMessage');
                if (messageDiv) messageDiv.innerHTML = '';
                const summaryDiv = firstPanel.querySelector('.diffSummary');
                if (summaryDiv) summaryDiv.style.display = 'none';
                const outputDiv = firstPanel.querySelector('.diffOutput');
                if (outputDiv) outputDiv.innerHTML = '';
                const ticket = firstPanel.querySelector('.diffTicketMode');
                if (ticket) ticket.checked = false;
                
                const panelId = firstPanel.id;
                window[`diferenciasDf_${panelId}`] = null;
                window[`diffData_${panelId}`] = null;
            }
            
            diffTabCounter = 1;
            const firstTab = document.querySelector('#diffTabsContainer .diff-tab');
            if (firstTab) firstTab.click();
        });
    }
})();