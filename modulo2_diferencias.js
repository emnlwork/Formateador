// Módulo Diferencias Folios - v3.0 (Interfaz renovada)
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab2');
    if (!container) return;

    function actualizarNombreDiff() {
        const tipoUbicacion = document.getElementById('diff_tipoUbicacion')?.value || '';
        const tipoCategoria = document.getElementById('diff_tipoCategoria')?.value || '';
        const nombrePersonalizado = document.getElementById('diff_nombrePersonalizado')?.value || '';
        const sufijoAdicional = document.getElementById('diff_sufijoAdicional')?.value || '';
        let nombre = 'diferencias';
        if (tipoUbicacion) nombre += tipoUbicacion;
        if (tipoCategoria) nombre += tipoCategoria;
        if (nombrePersonalizado) nombre += nombrePersonalizado;
        if (sufijoAdicional) nombre += sufijoAdicional;
        const filenameInput = document.getElementById('diffFilename');
        if (filenameInput) filenameInput.value = nombre + '.csv';
    }

    window.actualizarNombreDiff = actualizarNombreDiff;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-balance-scale"></i> Comparar folios múltiples</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v3.0b</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>

            <!-- ========== FOLIO REAL ========== -->
            <div style="border-left: 3px solid #2ecc71; padding-left: 1rem; margin-bottom: 1rem;">
                <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:0.5rem;">
                    <h4 style="color:#2ecc71; margin:0;"><i class="fas fa-check-circle"></i> Folio Real (referencia)</h4>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <label style="font-size:0.8rem; color:var(--grayl);"><b>Nombre:</b></label>
                        <input type="text" id="folioRealName" value="REAL" style="width:120px; padding:0.2rem 0.5rem; font-size:0.8rem;">
                    </div>
                </div>
                <div class="row" style="margin-top:0.3rem;">
                    <label style="font-size:0.85rem;"><b>Datos del Folio Real:</b></label>
                </div>
                <textarea id="folioReal" placeholder="Pega el FOLIO REAL o sube un archivo..." rows="4" style="font-family:monospace; font-size:0.75rem;"></textarea>
                <div class="row">
                    <button id="uploadFolioRealBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-folder-open"></i> Subir archivo</button>
                    <input type="file" id="folioRealFile" accept=".csv,.txt,text/plain" style="display:none;">
                    <span style="font-size:0.65rem; color:var(--grayl);">Formatos: Formato 1, Formato 2, CSV, EAN-13/14</span>
                </div>
            </div>

            <!-- ========== FOLIOS A COMPARAR ========== -->
            <div style="border-left: 3px solid #f1c40f; padding-left: 1rem; margin-bottom: 1rem;">
                <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:0.5rem;">
                    <h4 style="color:#f1c40f; margin:0;"><i class="fas fa-exchange-alt"></i> Folios a comparar</h4>
                    <button id="addFolioBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-plus"></i> Agregar folio</button>
                </div>
                <div id="foliosContainer"></div>
                <div style="font-size:0.65rem; color:var(--grayl); margin-top:0.3rem;">
                    <i class="fas fa-info-circle"></i> Haz doble clic en el nombre de cada folio para renombrarlo
                </div>
            </div>

            <!-- ========== CONTROLES ========== -->
            <div style="display:flex; align-items:center; gap:0.8rem; margin:0.8rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                    <input type="checkbox" id="diffTicketMode" style="width:16px; height:16px; accent-color:#3498db;"> 
                    <strong style="color:#3498db; font-size:0.8rem;"><i class="fas fa-ticket-alt"></i> Modo Ticket</strong>
                </label>
            </div>

            <!-- ========== NOMBRE DE ARCHIVO ========== -->
            <div style="margin:0.8rem 0; padding:0.6rem 0.8rem; background:rgba(0,0,0,0.2); border-radius:6px;">
                <b style="font-size:0.8rem;"><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                <div class="row" style="margin-top:0.3rem; gap:0.3rem;">
                    <div style="display:inline-flex; align-items:center; gap:3px; background:var(--blu); padding:0.1rem 0.5rem; border-radius:3px; font-size:0.7rem;">
                        <i class="fas fa-file-csv"></i> diferencias
                    </div>
                    <select id="diff_tipoUbicacion" style="width:130px; font-size:0.7rem; padding:0.15rem 0.3rem;">
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
                    <select id="diff_tipoCategoria" style="width:100px; font-size:0.7rem; padding:0.15rem 0.3rem;">
                        <option value="">(categoría)</option>
                        <option value="home">home</option>
                        <option value="calzado">calzado</option>
                        <option value="ropa">ropa</option>
                        <option value="catalogos">catalogos</option>
                        <option value="TODO">TODO</option>
                    </select>
                    <input type="text" id="diff_nombrePersonalizado" placeholder="Personalizado" style="width:120px; font-size:0.7rem; padding:0.15rem 0.3rem;">
                    <input type="text" id="diff_sufijoAdicional" placeholder="Sufijo extra" style="width:90px; font-size:0.7rem; padding:0.15rem 0.3rem;">
                </div>
            </div>

            <!-- ========== BOTONES PRINCIPALES ========== -->
            <div class="row" style="margin:0.5rem 0; flex-wrap:wrap; gap:0.3rem;">
                <button id="processDiffBtn" class="btn-primary" style="padding:0.3rem 0.8rem; font-size:0.8rem;"><i class="fas fa-play"></i> Procesar diferencias</button>
                <button id="copyDiffTsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar TSV</button>
                <button id="copyDiffCsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                <input type="text" id="diffFilename" value="diferencias.csv" style="width:200px; font-size:0.7rem; padding:0.15rem 0.4rem;">
                <button id="downloadDiffBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-download"></i> Descargar CSV</button>
                <span class="copy-feedback" id="diffCopyFeedback" style="font-size:0.7rem;"></span>
            </div>

            <!-- ========== MENSAJES Y OUTPUT ========== -->
            <div id="diffMessage" class="message" style="font-size:0.8rem; padding:0.3rem 0.6rem;"></div>
            <div id="diffSummary" class="message" style="background:#1a2a1a; border-color:#2ecc71; font-size:0.8rem; padding:0.3rem 0.6rem; display:none;"></div>
            <div class="output-area" id="diffOutput" style="max-height:500px; overflow:auto; font-size:0.75rem;"></div>

            <div class="instructions-box" style="font-size:0.75rem; padding:0.4rem 0.8rem; margin-top:0.5rem;">
                <b><i class="fas fa-info-circle"></i> Instrucciones</b><br>
                1. Pega el <b style="color:#2ecc71;">Folio Real</b> (referencia).<br>
                2. Agrega uno o más <b style="color:#f1c40f;">folios a comparar</b> con el botón <span style="color:#ff8888;">+</span>.<br>
                3. Haz doble clic en el nombre de cada folio para renombrarlo.<br>
                4. Pulsa <b>Procesar diferencias</b> para ver las discrepancias.<br>
                <b style="color:#3498db;">Modo Ticket:</b> exporta solo MODELO, LINEA, TIPO, DIFERENCIA.
            </div>
        </div>
    `;

    // ========== CONFIGURAR UPLOADS ==========
    core.setupFileUpload('uploadFolioRealBtn', 'folioRealFile', 'folioReal');

    // ========== VINCULAR EVENTOS PARA NOMBRE DE ARCHIVO ==========
    const elementos = ['diff_tipoUbicacion', 'diff_tipoCategoria', 'diff_nombrePersonalizado', 'diff_sufijoAdicional'];
    elementos.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', actualizarNombreDiff);
            el.addEventListener('input', actualizarNombreDiff);
        }
    });
    actualizarNombreDiff();

    // ========== FUNCIÓN PARA CREAR FOLIO DINÁMICO CON ESTILO MEJORADO ==========
    function agregarFolioDinamicoMejorado(nombreBase = 'ADICIONAL', contenidoInicial = '') {
        const c = document.getElementById('foliosContainer');
        if (!c) return null;
        
        const div = document.createElement('div');
        div.className = 'row';
        div.style.marginBottom = '0.4rem';
        div.style.background = 'rgba(0,0,0,0.2)';
        div.style.padding = '0.3rem 0.5rem';
        div.style.borderRadius = '4px';
        div.style.border = '1px solid var(--blu)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '0.5rem';
        div.style.flexWrap = 'wrap';
        
        const currentCount = c.children.length + 1;
        const nombrePorDefecto = `${nombreBase}${currentCount}`;
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.3rem; min-width:100px;">
                <i class="fas fa-file-alt" style="color:#f1c40f; font-size:0.7rem;"></i>
                <input type="text" class="folio-name-input" value="${nombrePorDefecto}" style="width:100px; font-size:0.7rem; padding:0.1rem 0.3rem; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px;">
            </div>
            <div style="flex:1; min-width:150px;">
                <textarea rows="2" style="width:100%; font-size:0.65rem; padding:0.1rem 0.3rem; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; resize:vertical;"></textarea>
            </div>
            <div style="display:flex; gap:0.3rem;">
                <button class="upload-csv-btn" style="font-size:0.6rem; padding:0.1rem 0.4rem;"><i class="fas fa-folder-open"></i></button>
                <input type="file" accept=".csv,.txt,text/plain" style="display:none;">
                <button class="btn-danger remove-folio" style="font-size:0.6rem; padding:0.1rem 0.4rem;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        c.appendChild(div);
        
        // Eventos
        const nameInput = div.querySelector('.folio-name-input');
        const upBtn = div.querySelector('.upload-csv-btn');
        const fileInp = div.querySelector('input[type="file"]');
        const ta = div.querySelector('textarea');
        const removeBtn = div.querySelector('.remove-folio');
        
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
            // Renumerar nombres
            const folios = c.querySelectorAll('.folio-name-input');
            folios.forEach((inp, idx) => {
                const currentName = inp.value.replace(/\d+$/, '');
                inp.value = `${currentName}${idx + 1}`;
            });
        });
        
        // Doble clic en el nombre para renombrar (ya es editable)
        return div;
    }

    // ========== INICIALIZAR FOLIOS ==========
    // Agregar un folio por defecto
    agregarFolioDinamicoMejorado('ADICIONAL');
    
    document.getElementById('addFolioBtn').addEventListener('click', () => {
        agregarFolioDinamicoMejorado('ADICIONAL');
    });

    // ========== FUNCIÓN AUXILIAR PARA PROCESAR TEXTO ==========
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
                    } else {
                        modelo = item.codigoEAN13.slice(0, 5);
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
                
                if (!linea || !tipo) {
                    const candidates = lib.filter(reg => String(reg.MODELO).trim() === String(modelo).trim());
                    if (candidates.length === 1) {
                        linea = candidates[0].LINEA;
                        tipo = candidates[0].TIPO;
                    }
                }
                
                resultados.push({
                    MODELO: modelo,
                    LINEA: linea,
                    TIPO: tipo,
                    TALLA: talla,
                    CANTIDAD: cantidad
                });
            }
            return resultados;
        }
        
        return [];
    }

    // ========== PROCESAR DIFERENCIAS ==========
    document.getElementById('processDiffBtn').onclick = () => {
        const realText = document.getElementById('folioReal').value;
        const msgDiv = document.getElementById('diffMessage');
        const summaryDiv = document.getElementById('diffSummary');
        const outputDiv = document.getElementById('diffOutput');
        
        if (!realText.trim()) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar el Folio Real.';
            summaryDiv.style.display = 'none';
            return;
        }
        
        // Obtener nombres de folios
        const realName = document.getElementById('folioRealName').value.trim() || 'REAL';
        const folioInputs = document.querySelectorAll('#foliosContainer .folio-name-input');
        const compararNames = [];
        folioInputs.forEach(inp => {
            const name = inp.value.trim() || 'COMPARAR';
            compararNames.push(name);
        });
        
        if (compararNames.length === 0) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes agregar al menos un folio para comparar.';
            summaryDiv.style.display = 'none';
            return;
        }
        
        try {
            // Procesar Folio Real
            const realRows = procesarTextoUniversal(realText);
            if (realRows.length === 0) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron interpretar los datos del Folio Real. Verifica el formato.';
                summaryDiv.style.display = 'none';
                return;
            }
            
            // Procesar folios a comparar
            const foliosTextareas = document.querySelectorAll('#foliosContainer textarea');
            let foliosRows = [];
            let foliosConDatos = 0;
            
            foliosTextareas.forEach((ta, idx) => {
                if (!ta.value.trim()) return;
                const rows = procesarTextoUniversal(ta.value);
                if (rows.length > 0) {
                    foliosRows = foliosRows.concat(rows);
                    foliosConDatos++;
                }
            });
            
            if (foliosConDatos === 0) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron datos válidos en los folios a comparar.';
                summaryDiv.style.display = 'none';
                return;
            }
            
            // ========== COMPARAR (lógica original) ==========
            const mapR = new Map();
            for (const r of realRows) {
                const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
                if (mapR.has(k)) {
                    mapR.get(k).CANTIDAD += r.CANTIDAD;
                } else {
                    mapR.set(k, { ...r });
                }
            }
            
            const mapC = new Map();
            for (const r of foliosRows) {
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
            
            allKeys.forEach(k => {
                const rData = mapR.get(k), cData = mapC.get(k);
                const rCant = rData ? rData.CANTIDAD : 0, cCant = cData ? cData.cantidad : 0;
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
                    if (dif < 0) faltSum += Math.abs(dif);
                    else if (dif > 0) sobrSum += dif;
                }
            });
            
            // Calcular totales
            let tR = 0, tC = 0;
            for (const d of diffs) {
                tR += d.CANTIDAD_REAL || 0;
                tC += d.CANTIDAD_COMPARAR || 0;
            }
            const totalAbs = faltSum + sobrSum;
            
            // Agregar fila de TOTALES
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
            const compararName = compararNames.length === 1 ? compararNames[0] : 'COMPARAR';
            window.diferenciasDf = diffs.map(row => {
                const newRow = { ...row };
                if (newRow.CANTIDAD_REAL !== undefined) {
                    newRow[`CANTIDAD_${realName}`] = newRow.CANTIDAD_REAL;
                    delete newRow.CANTIDAD_REAL;
                }
                if (newRow.CANTIDAD_COMPARAR !== undefined) {
                    newRow[`CANTIDAD_${compararName}`] = newRow.CANTIDAD_COMPARAR;
                    delete newRow.CANTIDAD_COMPARAR;
                }
                return newRow;
            });
            
            // ========== MOSTRAR RESULTADOS ==========
            const countRows = diffs.length ? diffs.length - 1 : 0;
            outputDiv.innerHTML = core.renderTableHtml(window.diferenciasDf);
            
            // Resumen
            let summaryHtml = `
                <b><i class="fas fa-chart-bar"></i> Resumen:</b><br>
                <span style="color:#2ecc71;">${realName}:</span> ${realRows.length} productos procesados<br>
                <span style="color:#f1c40f;">${compararName}:</span> ${foliosRows.length} productos procesados<br>
                <span style="color:#e74c3c;">Diferencias encontradas:</span> <b>${countRows}</b><br>
                <span style="color:#e74c3c;">Faltantes:</span> <b>${faltSum}</b> unidades &nbsp;|&nbsp; <span style="color:#2ecc71;">Sobrantes:</span> <b>${sobrSum}</b> unidades
            `;
            summaryDiv.innerHTML = summaryHtml;
            summaryDiv.style.display = 'block';
            
            msgDiv.innerHTML = diffs.length ?
                `<i class="fas fa-exclamation-triangle"></i> Se encontraron <b>${countRows}</b> diferencias.` :
                '<i class="fas fa-check-circle"></i> Los folios coinciden exactamente.';
                
        } catch (e) {
            msgDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${e.message}`;
            summaryDiv.style.display = 'none';
            console.error(e);
        }
    };

    // ========== FUNCIONES PARA COPIAR Y DESCARGAR ==========
    function getDiffTicketData() {
        if (!window.diferenciasDf) return [];
        return window.diferenciasDf.filter(r => r.TALLA !== 'TOTALES:').map(r => ({
            MODELO: r.MODELO,
            LINEA: r.LINEA,
            TIPO: r.TIPO,
            DIFERENCIA: r.DIFERENCIA
        }));
    }

    document.getElementById('copyDiffTsvBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) {
            document.getElementById('diffCopyFeedback').textContent = 'Sin datos';
            setTimeout(() => document.getElementById('diffCopyFeedback').textContent = '', 1500);
            return;
        }
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ?
            core.dfToCsv(getDiffTicketData(), '\t', false, true) :
            core.dfToCsv(window.diferenciasDf, '\t', true, true);
        core.copiarTexto(content, 'diffCopyFeedback');
    };

    document.getElementById('copyDiffCsvBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) {
            document.getElementById('diffCopyFeedback').textContent = 'Sin datos';
            setTimeout(() => document.getElementById('diffCopyFeedback').textContent = '', 1500);
            return;
        }
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ?
            core.dfToCsv(getDiffTicketData(), ',', false, true) :
            core.dfToCsv(window.diferenciasDf, ',', true, true);
        core.copiarTexto(content, 'diffCopyFeedback');
    };

    document.getElementById('downloadDiffBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) return;
        let filename = document.getElementById('diffFilename').value.trim();
        if (!filename) filename = 'diferencias.csv';
        if (!filename.endsWith('.csv')) filename += '.csv';
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ?
            core.dfToCsv(getDiffTicketData(), ',', false, true) :
            core.dfToCsv(window.diferenciasDf, ',', true, true);
        core.downloadCsv(content, filename);
    };

    // ========== LIMPIAR MÓDULO ==========
    const clearBtn = document.querySelector('#tab2 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('folioReal').value = '';
            document.getElementById('folioRealName').value = 'REAL';
            
            const foliosContainer = document.getElementById('foliosContainer');
            if (foliosContainer) {
                while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                agregarFolioDinamicoMejorado('ADICIONAL');
            }
            
            document.getElementById('diff_tipoUbicacion').value = '';
            document.getElementById('diff_tipoCategoria').value = '';
            document.getElementById('diff_nombrePersonalizado').value = '';
            document.getElementById('diff_sufijoAdicional').value = '';
            document.getElementById('diffTicketMode').checked = false;
            document.getElementById('diffOutput').innerHTML = '';
            document.getElementById('diffMessage').innerHTML = '';
            document.getElementById('diffSummary').style.display = 'none';
            window.actualizarNombreDiff();
            window.diferenciasDf = null;
        });
    }
})();