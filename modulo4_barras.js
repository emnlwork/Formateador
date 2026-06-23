// Módulo Arribo/Recibir (Centralizado + Traspaleo)
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab4');
    if (!container) return;

    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    function getFechaFormateada() {
        const ahora = new Date();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const año = ahora.getFullYear();
        return `${dia}${mes}${año}`;
    }

    async function extraerTextoDePDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textoCompleto = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            textoCompleto += pageText + '\n';
        }
        return textoCompleto;
    }

    function extraerFolios(texto, deduplicate = true) {
        const patron = /\b(\d{11,14})\b/g;
        const encontrados = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            encontrados.push(match[1]);
        }
        if (deduplicate) {
            const folios = [];
            const seen = new Set();
            for (const f of encontrados) {
                if (!seen.has(f)) {
                    seen.add(f);
                    folios.push(f);
                }
            }
            return { folios, total: folios.length };
        } else {
            return { folios: encontrados, total: encontrados.length };
        }
    }

    function construirNombreConDropdowns(prefix) {
        const tipoPrincipal = document.getElementById(`${prefix}_tipoPrincipal`)?.value || '';
        const tipoSecundario = document.getElementById(`${prefix}_tipoSecundario`)?.value || '';
        const personalizado = document.getElementById(`${prefix}_personalizado`)?.value || '';
        const incluirFecha = document.getElementById(`${prefix}_incluirFecha`)?.checked || false;
        let nombre = '';
        if (tipoPrincipal) nombre += tipoPrincipal;
        if (tipoSecundario) nombre += tipoSecundario;
        if (personalizado) nombre += personalizado;
        if (incluirFecha) nombre += getFechaFormateada();
        if (!nombre) return null;
        return nombre;
    }

    const dropdownsHTML = (prefix, extraOptions = '') => `
        <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
            <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
            <div class="row">
                <select id="${prefix}_tipoPrincipal" style="width:150px;">
                    <option value="">(seleccionar)</option>
                    <option value="arribo">arribo</option>
                    <option value="contenedores">contenedores</option>
                    <option value="centralizado">centralizado</option>
                    <option value="traspaleo">traspaleo</option>
                </select>
                <select id="${prefix}_tipoSecundario" style="width:150px;">
                    <option value="">(seleccionar)</option>
                    <option value="tufesa">tufesa</option>
                    <option value="enviosbaja">enviosbaja</option>
                    <option value="ptx">ptx</option>
                    <option value="camion">camion</option>
                    <option value="traspaleo">traspaleo</option>
                </select>
                <input type="text" id="${prefix}_personalizado" placeholder="Personalizado" style="width:150px;">
                <label style="display:inline-flex; align-items:center; gap:5px; margin-left:10px;">
                    <input type="checkbox" id="${prefix}_incluirFecha"> Incluir fecha (DDMMYYYY)
                </label>
            </div>
            ${extraOptions}
            <div class="instructions-box" style="margin-top:0.8rem; background:#aa2e2e; color:white; text-align:center; font-size:1.1rem; font-weight:bold; padding:0.5rem;">
                <i class="fas fa-keyboard"></i> Atajo del script: <kbd style="background:#fff; color:#000; padding:0.2rem 0.5rem; border-radius:4px;">Ctrl+Q</kbd> · <kbd style="background:#fff; color:#000; padding:0.2rem 0.5rem; border-radius:4px;">Shift+Esc</kbd> para cancelar
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-truck"></i> Arribo/Recibir</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="sub-module-tabs" id="barcodeSubTabs">
                <div class="sub-module-tab active" data-submode="centralizado">Centralizado (Arribo)</div>
                <div class="sub-module-tab" data-submode="traspaleo">Traspaleo</div>
            </div>
            <!-- Área común de entrada -->
            <textarea id="barcodeInput" placeholder="Pega el texto con folios (11+ dígitos) o sube un archivo PDF/TXT/CSV..." rows="6"></textarea>
            <div class="row">
                <button id="uploadBarcodeBtn"><i class="fas fa-folder-open"></i> Subir archivo (TXT/CSV)</button>
                <button id="uploadPdfBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-file-pdf"></i> Subir PDF (extraer texto)</button>
                <input type="file" id="barcodeFile" accept=".csv,.txt,text/plain" style="display:none;">
                <input type="file" id="pdfFile" accept=".pdf" style="display:none;">
            </div>
            
            <!-- Panel Centralizado (Arribo) -->
            <div id="centralizadoPanel" class="sub-panel active">
                ${dropdownsHTML('barcode', `
                    <div class="row" style="margin-top:0.5rem;">
                        <label>⏱️ Delay entre códigos (ms):</label>
                        <input type="number" id="centralizadoDelay" value="100" min="0" max="5000" step="10" style="width:100px;">
                        <span style="font-size:0.8rem;">(pausa después de cada código+Enter)</span>
                    </div>
                `)}
                <div class="row">
                    <label>📦 Cajas:</label>
                    <input type="text" id="cajasInput" placeholder="Número de cajas (solo recordatorio)" style="width:150px;">
                </div>
                <div class="row">
                    <label>📄 Nombre base:</label>
                    <input type="text" class="barcodeFilename" id="centralizadoNombreBase" placeholder="Nombre sin extensión" style="width:300px;">
                    <button id="processCountCentralizadoBtn" class="btn-danger" style="background:#aa2e2e;"><i class="fas fa-calculator"></i> Procesar (contar folios)</button>
                    <button id="generateBarcodeBtn" class="btn-primary"><span class="btn-text"><i class="fas fa-file-pdf"></i> Generar PDF</span><span class="spinner"></span></button>
                    <button id="generateAhkBtn" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK (Enter)</button>
                </div>
                <div id="barcodeMessage" class="message"></div>
                <div id="barcodeOutputCard" style="display:none;"><div class="output-area" id="barcodeOutputArea"></div></div>
            </div>
            
            <!-- Panel Traspaleo -->
            <div id="traspaleoPanel" class="sub-panel">
                <div class="row">
                    <label>⏱️ Retardo base (ms):</label>
                    <input type="number" id="traspaleoDelay" value="300" min="50" max="5000" step="10" style="width:100px;">
                    <span style="font-size:0.8rem;">(pausas: first=base, others=base*2, etc.)</span>
                </div>
                ${dropdownsHTML('barcode_traspaleo')}
                <div class="row">
                    <label>📄 Nombre base:</label>
                    <input type="text" class="barcodeFilename" id="traspaleoFilename" placeholder="Nombre sin extensión" style="width:300px;">
                    <button id="processCountTraspaleoBtn" class="btn-danger" style="background:#aa2e2e;"><i class="fas fa-calculator"></i> Procesar (contar folios)</button>
                    <button id="generateTraspaleoAhkBtn" class="btn-primary"><i class="fas fa-code"></i> Descargar AHK (Traspaleo)</button>
                </div>
                <div id="traspaleoMessage" class="message"></div>
                <div class="instructions-box" style="margin-top:1rem;">
                    <b>Script generado:</b><br>
                    - Usa <code>WinActivate, A</code> antes de cada envío.<br>
                    - Primer código: escribe+Enter, clic (469,151), Enter, F2, doble clic (115,153).<br>
                    - Siguientes códigos: escribe+Enter, F2, doble clic.<br>
                    - Pausas ajustables mediante el retardo base.
                </div>
            </div>
            
            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Instrucciones – Arribo/Recibir</b><br>
                <b>Centralizado (Arribo):</b> genera PDF y AHK (código+Enter) con delay configurable. Filtra líneas vacías.<br>
                <b>Traspaleo:</b> genera script avanzado con clics y teclas especiales; velocidad configurable.
            </div>
        </div>
    `;

    // Configurar uploads comunes
    core.setupFileUpload('uploadBarcodeBtn', 'barcodeFile', 'barcodeInput');

    // PDF upload
    const pdfInput = document.getElementById('pdfFile');
    const pdfUploadBtn = document.getElementById('uploadPdfBtn');
    pdfUploadBtn.addEventListener('click', () => pdfInput.click());
    pdfInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const texto = await extraerTextoDePDF(file);
            document.getElementById('barcodeInput').value = texto;
            const { total } = extraerFolios(texto, true);
            document.getElementById('barcodeMessage').innerHTML = `<i class="fas fa-check-circle"></i> PDF procesado. Texto extraído. Se encontraron ${total} folios.`;
            setTimeout(() => { if (document.getElementById('barcodeMessage').innerHTML.includes('PDF')) document.getElementById('barcodeMessage').innerHTML = ''; }, 4000);
        } catch (err) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el PDF.';
        }
        pdfInput.value = '';
    });

    // ==================== FUNCIONES PARA NOMBRES ====================
    function actualizarNombreCentralizado() {
        const nb = construirNombreConDropdowns('barcode');
        const inp = document.getElementById('centralizadoNombreBase');
        inp.value = nb || '';
    }
    function actualizarNombreTraspaleo() {
        const nb = construirNombreConDropdowns('barcode_traspaleo');
        const inp = document.getElementById('traspaleoFilename');
        inp.value = nb || '';
    }

    const centralizadoElements = ['barcode_tipoPrincipal', 'barcode_tipoSecundario', 'barcode_personalizado', 'barcode_incluirFecha'];
    centralizadoElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.addEventListener('change', actualizarNombreCentralizado);
            else el.addEventListener('input', actualizarNombreCentralizado);
        }
    });
    actualizarNombreCentralizado();

    const traspaleoElements = ['barcode_traspaleo_tipoPrincipal', 'barcode_traspaleo_tipoSecundario', 'barcode_traspaleo_personalizado', 'barcode_traspaleo_incluirFecha'];
    traspaleoElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.addEventListener('change', actualizarNombreTraspaleo);
            else el.addEventListener('input', actualizarNombreTraspaleo);
        }
    });
    actualizarNombreTraspaleo();

    // ==================== CONTAR FOLIOS ====================
    function contarFoliosYMostrar(messageElementId, deduplicate = true) {
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) {
            document.getElementById(messageElementId).innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay texto para procesar.';
            return;
        }
        const { total } = extraerFolios(inputText, deduplicate);
        document.getElementById(messageElementId).innerHTML = `<i class="fas fa-check-circle"></i> Se encontraron <b>${total}</b> códigos (${deduplicate ? 'sin duplicados' : 'incluyendo duplicados'}).`;
        setTimeout(() => { if (document.getElementById(messageElementId).innerHTML.includes('códigos')) document.getElementById(messageElementId).innerHTML = ''; }, 4000);
    }
    document.getElementById('processCountCentralizadoBtn').addEventListener('click', () => contarFoliosYMostrar('barcodeMessage', true));
    document.getElementById('processCountTraspaleoBtn').addEventListener('click', () => contarFoliosYMostrar('traspaleoMessage', true));

    // ==================== GENERAR AHK CON Ctrl+Q Y Shift+Esc ====================
    function generarAHKConCancelar(codigos, titulo = '', delay = 0) {
        if (!codigos || codigos.length === 0) return null;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigos.length} códigos\n\n`;
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        for (const c of codigos) {
            ahk += `    if abort\n        break\n`;
            if (delay > 0) {
                ahk += `    Send, ${c}{Enter}\n`;
                ahk += `    Sleep, ${delay}\n`;
            } else {
                ahk += `    Send, ${c}{Enter}\n`;
            }
        }
        ahk += '    return\n\n';
        ahk += '+Esc::\n';
        ahk += '    abort := true\n';
        ahk += '    Send, {Esc}\n';
        ahk += '    return';
        return ahk;
    }

    // ==================== CENTRALIZADO (ARRIBO) ====================
    const FILAS = 12, COLUMNAS = 4;
    const ANCHO_HOJA = 612, ALTO_HOJA = 792;
    const anchoCelda = (ANCHO_HOJA - 2*15 - 5*(COLUMNAS-1)) / COLUMNAS;
    const altoCelda = (ALTO_HOJA - 20 - 20 - 5*(FILAS-1)) / FILAS;
    function generarBarcodeDataURL(folio, anchoPx, altoPx) {
        const container = document.getElementById('barcodeHiddenCanvas');
        const canvas = document.createElement('canvas'); canvas.width = anchoPx; canvas.height = altoPx;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, anchoPx, altoPx);
        container.appendChild(canvas);
        try { JsBarcode(canvas, String(folio), { format: 'CODE128', displayValue: false, margin: 6, background: '#ffffff', lineColor: '#000000', width: Math.max(1.5, anchoPx/150), height: altoPx-12 }); }
        catch(e) { JsBarcode(canvas, String(folio), { format: 'CODE128', displayValue: false, margin: 4, background: '#ffffff', lineColor: '#000000', width: 1.8, height: altoPx-10 }); }
        const url = canvas.toDataURL('image/png'); container.removeChild(canvas); return url;
    }

    document.getElementById('generateBarcodeBtn').addEventListener('click', async function() {
        const btn = this; const input = document.getElementById('barcodeInput').value;
        let nombreBase = document.getElementById('centralizadoNombreBase').value.trim();
        if (!nombreBase) nombreBase = 'arribo';
        let filename = nombreBase + '.pdf';
        const msgEl = document.getElementById('barcodeMessage');
        const outputCard = document.getElementById('barcodeOutputCard');
        const outputArea = document.getElementById('barcodeOutputArea');
        msgEl.innerHTML = ''; outputCard.style.display = 'none';
        if (!input.trim()) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.'; return; }
        const { folios } = extraerFolios(input, true);
        if (!folios.length) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron folios (11+ dígitos).'; return; }
        btn.disabled = true; btn.classList.add('loading');
        try {
            outputCard.style.display = 'block';
            outputArea.textContent = `Generando PDF con ${folios.length} folios...\n`;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
            const totalPaginas = Math.ceil(folios.length / (FILAS*COLUMNAS));
            const canvasW = Math.round(anchoCelda * 2.5), canvasH = Math.round(altoCelda * 1.4);
            for (let p = 0; p < totalPaginas; p++) {
                if (p > 0) doc.addPage();
                const inicio = p*FILAS*COLUMNAS, fin = Math.min(inicio+FILAS*COLUMNAS, folios.length);
                for (let i = inicio; i < fin; i++) {
                    const fila = Math.floor((i-inicio)/COLUMNAS), col = (i-inicio)%COLUMNAS;
                    const x = 15 + col*(anchoCelda+5), y = 20 + fila*(altoCelda+5);
                    const url = generarBarcodeDataURL(folios[i], canvasW, canvasH);
                    doc.addImage(url, 'PNG', x+8, y+4, anchoCelda-16, altoCelda*0.62);
                    doc.setFontSize(7.5); doc.text(String(folios[i]), x+anchoCelda/2, y+altoCelda*0.62+14, { align: 'center' });
                }
            }
            doc.save(filename);
            outputArea.textContent += `PDF generado: ${filename}\n`;
            msgEl.innerHTML = `<i class="fas fa-check-circle"></i> PDF descargado con <b>${folios.length}</b> folios.`;
        } catch(e) { msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: '+e.message; }
        btn.disabled = false; btn.classList.remove('loading');
    });

    // AHK Centralizado (con delay, filtrado, orden ascendente, Ctrl+Q, Shift+Esc)
    document.getElementById('generateAhkBtn').addEventListener('click', () => {
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) { document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.'; return; }
        const lines = inputText.split(/\r?\n/);
        const codigos = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') continue;
            const match = trimmed.match(/\b(\d{11,14})\b/);
            if (match) codigos.push(match[1]);
        }
        if (codigos.length === 0) { document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron códigos.'; return; }
        // Eliminar duplicados y ordenar ascendente
        const unicos = [...new Set(codigos)].sort((a,b) => a.localeCompare(b));
        const delay = parseInt(document.getElementById('centralizadoDelay').value) || 100;
        let nombreBase = document.getElementById('centralizadoNombreBase').value.trim();
        if (!nombreBase) nombreBase = 'arribo';
        const ahk = generarAHKConCancelar(unicos, `Códigos de Arribo (${unicos.length} códigos)`, delay);
        if (!ahk) return;
        const blob = new Blob([ahk], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreBase + '.ahk';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('barcodeMessage').innerHTML = `<i class="fas fa-check-circle"></i> Script AHK descargado con ${unicos.length} códigos (delay ${delay} ms).`;
        setTimeout(() => { if (document.getElementById('barcodeMessage').innerHTML.includes('AHK')) document.getElementById('barcodeMessage').innerHTML = ''; }, 3000);
    });

    // ==================== TRASPALEO ====================
    document.getElementById('generateTraspaleoAhkBtn').addEventListener('click', () => {
        const inputText = document.getElementById('barcodeInput').value;
        let delay = parseInt(document.getElementById('traspaleoDelay').value);
        if (isNaN(delay) || delay < 50) delay = 300;
        if (!inputText.trim()) { document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.'; return; }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length === 0) { document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron folios.'; return; }
        // Ordenar ascendente
        const foliosOrdenados = [...folios].sort((a,b) => a.localeCompare(b));
        let codesListLines = [];
        const codesPerLine = 4;
        for (let i = 0; i < foliosOrdenados.length; i += codesPerLine) {
            const chunk = foliosOrdenados.slice(i, i + codesPerLine);
            const line = chunk.map(c => `"${c}"`).join(", ");
            if (i === 0) codesListLines.push(`codes := [ ${line}`);
            else codesListLines.push(`         , ${line}`);
        }
        if (codesListLines.length) codesListLines[codesListLines.length-1] += " ]";
        else codesListLines.push("codes := []");
        const codesBlock = codesListLines.join("\n");
        const sleepFirstAfterEnter = delay;
        const sleepFirstAfterClick = delay;
        const sleepFirstAfterExtraEnter = delay;
        const sleepFirstAfterF2 = delay;
        const sleepElseAfterEnter = delay * 2;
        const sleepElseAfterF2 = delay;
        const sleepElseAfterDoubleClick = delay;
        let nombreBase = document.getElementById('traspaleoFilename').value.trim();
        if (!nombreBase) nombreBase = 'traspaleo';
        const ahkContent = `#SingleInstance Force

${codesBlock}

abort := false

^q::
    abort := false
    for index, code in codes
    {
        if abort
            break
        WinActivate, A
        Sleep 50
        if (index = 1)
        {
            SendInput %code% {Enter}
            Sleep ${sleepFirstAfterEnter}
            Click 469, 151
            SendInput {Enter}
            Sleep ${sleepFirstAfterExtraEnter}
            SendInput {F2}
            Sleep ${sleepFirstAfterF2}
            Click 115, 153, 2
        }
        else
        {
            SendInput %code% {Enter}
            Sleep ${sleepElseAfterEnter}
            SendInput {F2}
            Sleep ${sleepElseAfterF2}
            Click 115, 153, 2
            Sleep ${sleepElseAfterDoubleClick}
        }
        Sleep 100
    }
    abort := false
    return

+Esc::
    abort := true
    Send, {Esc}
    return`;
        const blob = new Blob([ahkContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreBase + '.ahk';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('traspaleoMessage').innerHTML = `<i class="fas fa-check-circle"></i> Script Traspaleo descargado con ${folios.length} códigos.`;
        setTimeout(() => { if (document.getElementById('traspaleoMessage').innerHTML.includes('Traspaleo')) document.getElementById('traspaleoMessage').innerHTML = ''; }, 4000);
    });

    // ==================== CAMBIO ENTRE SUBMÓDULOS ====================
    const subTabs = document.querySelectorAll('#barcodeSubTabs .sub-module-tab');
    const centralizadoPanel = document.getElementById('centralizadoPanel');
    const traspaleoPanel = document.getElementById('traspaleoPanel');
    function setActivePanel(mode) {
        centralizadoPanel.classList.remove('active');
        traspaleoPanel.classList.remove('active');
        if (mode === 'centralizado') centralizadoPanel.classList.add('active');
        else if (mode === 'traspaleo') traspaleoPanel.classList.add('active');
        if (window.updateHash) window.updateHash('tab4', mode);
    }
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            setActivePanel(this.dataset.submode);
        });
    });
    setActivePanel('centralizado');
    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab4' && e.detail.subMode) {
            const targetTab = document.querySelector(`#barcodeSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== LIMPIAR ====================
    const clearBtn = document.querySelector('#tab4 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcode_tipoPrincipal').value = '';
            document.getElementById('barcode_tipoSecundario').value = '';
            document.getElementById('barcode_personalizado').value = '';
            document.getElementById('barcode_incluirFecha').checked = false;
            document.getElementById('centralizadoNombreBase').value = '';
            document.getElementById('cajasInput').value = '';
            document.getElementById('centralizadoDelay').value = '100';
            document.getElementById('barcode_traspaleo_tipoPrincipal').value = '';
            document.getElementById('barcode_traspaleo_tipoSecundario').value = '';
            document.getElementById('barcode_traspaleo_personalizado').value = '';
            document.getElementById('barcode_traspaleo_incluirFecha').checked = false;
            document.getElementById('traspaleoFilename').value = '';
            document.getElementById('traspaleoDelay').value = '300';
            document.getElementById('barcodeMessage').innerHTML = '';
            document.getElementById('traspaleoMessage').innerHTML = '';
            document.getElementById('barcodeOutputCard').style.display = 'none';
            actualizarNombreCentralizado();
            actualizarNombreTraspaleo();
        });
    }
})();