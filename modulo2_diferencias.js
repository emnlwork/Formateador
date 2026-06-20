// Módulo Diferencias Folios
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
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="row"><label><b>Nombre Folio Real:</b></label><input type="text" id="folioRealName" value="REAL" style="width:150px;"></div>
            <label><b>Folio Real:</b></label>
            <textarea id="folioReal" placeholder="Pega el FOLIO REAL o sube un CSV..." rows="5"></textarea>
            <div class="row"><button id="uploadFolioRealBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="folioRealFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
            <div style="margin:0.8rem 0;"><b>Folios a comparar:</b> <button id="addFolioBtn"><i class="fas fa-plus"></i> Agregar otro folio</button></div>
            <div id="foliosContainer"></div>
            <div class="row"><input type="checkbox" id="diffTicketMode"><label for="diffTicketMode">MODO TICKET (solo MODELO, LINEA, TIPO, DIFERENCIA, sin cabeceras)</label></div>
            
            <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                <div class="row">
                    <div style="display:inline-flex; align-items:center; gap:5px;">
                        <span style="background:var(--blu); padding:0.2rem 0.5rem; border-radius:4px;">diferencias</span>
                    </div>
                    <select id="diff_tipoUbicacion" style="width:150px;">
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
                    <select id="diff_tipoCategoria" style="width:120px;">
                        <option value="">(seleccionar)</option>
                        <option value="home">home</option>
                        <option value="calzado">calzado</option>
                        <option value="ropa">ropa</option>
                        <option value="catalogos">catalogos</option>
                        <option value="TODO">TODO</option>
                    </select>
                    <input type="text" id="diff_nombrePersonalizado" placeholder="Personalizado" style="width:130px;">
                    <input type="text" id="diff_sufijoAdicional" placeholder="Sufijo extra" style="width:100px;">
                </div>
            </div>
            
            <div class="row">
                <button id="processDiffBtn" class="btn-primary"><i class="fas fa-check"></i> Procesar diferencias</button>
                <button id="copyDiffTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                <button id="copyDiffCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                <input type="text" id="diffFilename" value="diferencias.csv" style="width:320px;">
                <button id="downloadDiffBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                <span class="copy-feedback" id="diffCopyFeedback"></span>
            </div>
            <div id="diffMessage" class="message"></div>
            <div class="output-area" id="diffOutput"></div>
            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Instrucciones – Diferencias Folios</b><br>
                1. Pega el Folio Real y asígnale un nombre.<br>2. Agrega folios a comparar y nómbralos.<br>3. Pulsa Procesar diferencias.<br>
                <b>MODO TICKET:</b> exporta MODELO, LINEA, TIPO, DIFERENCIA.
            </div>
        </div>
    `;

    core.setupFileUpload('uploadFolioRealBtn', 'folioRealFile', 'folioReal');

    const elementos = ['diff_tipoUbicacion', 'diff_tipoCategoria', 'diff_nombrePersonalizado', 'diff_sufijoAdicional'];
    elementos.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', actualizarNombreDiff);
            el.addEventListener('input', actualizarNombreDiff);
        }
    });
    actualizarNombreDiff();

    core.agregarFolioDinamico('foliosContainer');
    document.getElementById('addFolioBtn').onclick = () => core.agregarFolioDinamico('foliosContainer');

    document.getElementById('processDiffBtn').onclick = () => {
        const realText = document.getElementById('folioReal').value;
        const lib = core.obtenerBiblioteca();
        
        // Parsear el Folio Real usando el parser universal
        let realItems = core.parsearEntradaUniversal(realText);
        const realRows = [];
        for (const item of realItems) {
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
            
            realRows.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla, CANTIDAD: cantidad });
        }
        
        // Parsear folios a comparar (cada textarea en foliosContainer)
        const foliosTextareas = document.querySelectorAll('#foliosContainer textarea');
        const foliosRows = [];
        for (const ta of foliosTextareas) {
            const items = core.parsearEntradaUniversal(ta.value);
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
                
                foliosRows.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla, CANTIDAD: cantidad });
            }
        }
        
        // Procesar realRows (agrupar por modelo|linea|tipo|talla)
        const mapR = new Map();
        for (const r of realRows) {
            const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
            if (mapR.has(k)) {
                mapR.get(k).CANTIDAD += r.CANTIDAD;
            } else {
                mapR.set(k, { ...r });
            }
        }
        
        // Procesar foliosRows (agrupar)
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
        const diffs = []; let tR=0, tC=0, faltSum=0, sobrSum=0;
        allKeys.forEach(k => {
            const rData = mapR.get(k), cData = mapC.get(k);
            const rCant = rData ? rData.CANTIDAD : 0, cCant = cData ? cData.cantidad : 0;
            if (rCant !== cCant) {
                let ref = rData || (cData ? cData.ref : {});
                const dif = cCant - rCant;
                const resultado = dif > 0 ? 'SOBRANTE' : 'FALTANTE';
                diffs.push({ MODELO: ref.MODELO||'', LINEA: ref.LINEA||'', TIPO: ref.TIPO||'', TALLA: ref.TALLA||'', CANTIDAD_REAL: rCant, CANTIDAD_COMPARAR: cCant, RESULTADO: resultado, DIFERENCIA: dif });
                if (dif < 0) faltSum += Math.abs(dif);
                else if (dif > 0) sobrSum += dif;
                tR += rCant; tC += cCant;
            }
        });
        const totalAbs = faltSum + sobrSum;
        if (diffs.length) diffs.push({ MODELO:'', LINEA:'', TIPO:'', TALLA:'TOTALES:', CANTIDAD_REAL:tR, CANTIDAD_COMPARAR:tC, RESULTADO:`Faltante: ${faltSum} | Sobrante: ${sobrSum}`, DIFERENCIA: totalAbs });
        const realName = document.getElementById('folioRealName').value.trim() || 'REAL';
        const compararNames = [...document.querySelectorAll('#foliosContainer .folio-name-input')].map(inp => inp.value.trim() || 'COMPARAR');
        window.diferenciasDf = diffs.map(row => {
            const newRow = { ...row };
            if (newRow.CANTIDAD_REAL !== undefined) { newRow[`CANTIDAD_${realName}`] = newRow.CANTIDAD_REAL; delete newRow.CANTIDAD_REAL; }
            if (newRow.CANTIDAD_COMPARAR !== undefined) { const compName = compararNames[0] || 'COMPARAR'; newRow[`CANTIDAD_${compName}`] = newRow.CANTIDAD_COMPARAR; delete newRow.CANTIDAD_COMPARAR; }
            return newRow;
        });
        document.getElementById('diffOutput').innerHTML = core.renderTableHtml(window.diferenciasDf);
        const countRows = diffs.length ? diffs.length-1 : 0;
        document.getElementById('diffMessage').innerHTML = diffs.length ? `<i class="fas fa-exclamation-triangle"></i> <b>${countRows}</b> diferencias encontradas (Faltantes: <b>${faltSum}</b> unidades, Sobrantes: <b>${sobrSum}</b> unidades).` : '<i class="fas fa-check-circle"></i> Los folios coinciden exactamente.';
    };

    function getDiffTicketData() { if (!window.diferenciasDf) return []; return window.diferenciasDf.filter(r => r.TALLA !== 'TOTALES:').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, DIFERENCIA: r.DIFERENCIA })); }
    document.getElementById('copyDiffTsvBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) { document.getElementById('diffCopyFeedback').textContent = 'Sin datos'; setTimeout(()=>document.getElementById('diffCopyFeedback').textContent='',1500); return; }
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ? core.dfToCsv(getDiffTicketData(), '\t', false, true) : core.dfToCsv(window.diferenciasDf, '\t', true, true);
        core.copiarTexto(content, 'diffCopyFeedback');
    };
    document.getElementById('copyDiffCsvBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) { document.getElementById('diffCopyFeedback').textContent = 'Sin datos'; setTimeout(()=>document.getElementById('diffCopyFeedback').textContent='',1500); return; }
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ? core.dfToCsv(getDiffTicketData(), ',', false, true) : core.dfToCsv(window.diferenciasDf, ',', true, true);
        core.copiarTexto(content, 'diffCopyFeedback');
    };
    document.getElementById('downloadDiffBtn').onclick = () => {
        if (!window.diferenciasDf || !window.diferenciasDf.length) return;
        let filename = document.getElementById('diffFilename').value.trim();
        if (!filename) filename = 'diferencias.csv';
        if (!filename.endsWith('.csv')) filename += '.csv';
        const ticketMode = document.getElementById('diffTicketMode').checked;
        let content = ticketMode ? core.dfToCsv(getDiffTicketData(), ',', false, true) : core.dfToCsv(window.diferenciasDf, ',', true, true);
        core.downloadCsv(content, filename);
    };

    // ==================== LIMPIAR MÓDULO (silencioso) ====================
    const clearBtn = document.querySelector('#tab2 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('folioReal').value = '';
            document.getElementById('folioRealName').value = 'REAL';
            const foliosContainer = document.getElementById('foliosContainer');
            if (foliosContainer) {
                while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                core.agregarFolioDinamico('foliosContainer');
            }
            document.getElementById('diff_tipoUbicacion').value = '';
            document.getElementById('diff_tipoCategoria').value = '';
            document.getElementById('diff_nombrePersonalizado').value = '';
            document.getElementById('diff_sufijoAdicional').value = '';
            document.getElementById('diffTicketMode').checked = false;
            document.getElementById('diffOutput').innerHTML = '';
            document.getElementById('diffMessage').innerHTML = '';
            window.actualizarNombreDiff();
            window.diferenciasDf = null;
        });
    }
})();