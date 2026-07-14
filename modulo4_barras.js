(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab4');
    if (!container) return;

    const WIX_API_URL = 'https://emanuelcontructora.wixsite.com/jajajeje/_functions';

    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    function getFechaFormateada() {
        const ahora = new Date();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const año = ahora.getFullYear();
        return dia + mes + año;
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

    function extraerFolios(texto, deduplicate) {
        if (deduplicate === undefined) deduplicate = true;
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
        const tipoPrincipal = document.getElementById(prefix + '_tipoPrincipal')?.value || '';
        const tipoSecundario = document.getElementById(prefix + '_tipoSecundario')?.value || '';
        const personalizado = document.getElementById(prefix + '_personalizado')?.value || '';
        const incluirFecha = document.getElementById(prefix + '_incluirFecha')?.checked || false;
        let nombre = '';
        if (tipoPrincipal) nombre += tipoPrincipal;
        if (tipoSecundario) nombre += tipoSecundario;
        if (personalizado) nombre += personalizado;
        if (incluirFecha) nombre += getFechaFormateada();
        if (!nombre) return null;
        return nombre;
    }

    function generarAHKConGrupos(codigos, titulo, delay) {
        if (!codigos || codigos.length === 0) return null;
        if (delay === undefined) delay = 100;
        const unicos = [...new Set(codigos)];
        const MAX_CODIGOS_POR_GRUPO = 50;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += '; ' + titulo + '\n';
        ahk += '; Total: ' + unicos.length + ' envios\n\n';
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        const grupos = [];
        for (let i = 0; i < unicos.length; i += MAX_CODIGOS_POR_GRUPO) {
            grupos.push(unicos.slice(i, i + MAX_CODIGOS_POR_GRUPO));
        }
        for (let g = 0; g < grupos.length; g++) {
            const grupo = grupos[g];
            const codigosStr = grupo.map(function(c) { return '"' + c + '"'; }).join(', ');
            ahk += '    codigos' + (g+1) + ' := [' + codigosStr + ']\n';
        }
        ahk += '    grupos := [';
        for (let g = 0; g < grupos.length; g++) {
            ahk += 'codigos' + (g+1);
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
        ahk += '            Sleep ' + delay + '\n';
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

    function generarAHKTraspaleo(codigos, delay) {
        if (!codigos || codigos.length === 0) return null;
        if (delay === undefined) delay = 300;
        const unicos = [...new Set(codigos)];
        const MAX_CODIGOS_POR_GRUPO = 50;
        let ahk = '#SingleInstance Force\n\n';
        ahk += '; Total: ' + unicos.length + ' envios (Traspaleo)\n\n';
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        const grupos = [];
        for (let i = 0; i < unicos.length; i += MAX_CODIGOS_POR_GRUPO) {
            grupos.push(unicos.slice(i, i + MAX_CODIGOS_POR_GRUPO));
        }
        for (let g = 0; g < grupos.length; g++) {
            const grupo = grupos[g];
            const codigosStr = grupo.map(function(c) { return '"' + c + '"'; }).join(', ');
            ahk += '    codigos' + (g+1) + ' := [' + codigosStr + ']\n';
        }
        ahk += '    grupos := [';
        for (let g = 0; g < grupos.length; g++) {
            ahk += 'codigos' + (g+1);
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
        ahk += '            WinActivate, A\n';
        ahk += '            Sleep 100\n';
        ahk += '            if (index = 1 && grupoIndex = 1)\n';
        ahk += '            {\n';
        ahk += '                SendInput %codigo%{Enter}\n';
        ahk += '                Sleep ' + delay + '\n';
        ahk += '                Click 469, 151\n';
        ahk += '                SendInput {Enter}\n';
        ahk += '                Sleep ' + delay + '\n';
        ahk += '                SendInput {F2}\n';
        ahk += '                Sleep ' + delay + '\n';
        ahk += '                Click 115, 153, 2\n';
        ahk += '            }\n';
        ahk += '            else\n';
        ahk += '            {\n';
        ahk += '                SendInput %codigo%{Enter}\n';
        ahk += '                Sleep ' + (delay * 2) + '\n';
        ahk += '                SendInput {F2}\n';
        ahk += '                Sleep ' + delay + '\n';
        ahk += '                Click 115, 153, 2\n';
        ahk += '                Sleep ' + delay + '\n';
        ahk += '            }\n';
        ahk += '            Sleep 100\n';
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

    function encontrarFaltantes(codigos) {
        if (!codigos || codigos.length < 2) return [];

        const grupos = {};
        codigos.forEach(function(cod) {
            const prefijo = cod.slice(0, -4);
            const sufijo = parseInt(cod.slice(-4));
            if (!grupos[prefijo]) grupos[prefijo] = [];
            grupos[prefijo].push(sufijo);
        });

        const faltantes = [];

        for (let prefijo in grupos) {
            const numeros = [...new Set(grupos[prefijo])].sort(function(a, b) { return a - b; });
            if (numeros.length < 2) continue;

            let secuencia = [numeros[0]];
            for (let i = 1; i < numeros.length; i++) {
                const diff = numeros[i] - numeros[i - 1];
                if (diff === 1) {
                    secuencia.push(numeros[i]);
                } else if (diff > 1 && diff <= 15) {
                    const min = numeros[i - 1] + 1;
                    const max = numeros[i];
                    for (let j = min; j < max; j++) {
                        const sufijoStr = String(j).padStart(4, '0');
                        faltantes.push(prefijo + sufijoStr);
                    }
                    secuencia = [numeros[i]];
                } else {
                    secuencia = [numeros[i]];
                }
            }

            if (secuencia.length >= 2) {
                const min = secuencia[0] + 1;
                const max = secuencia[secuencia.length - 1];
                for (let j = min; j < max; j++) {
                    if (!numeros.includes(j)) {
                        const sufijoStr = String(j).padStart(4, '0');
                        faltantes.push(prefijo + sufijoStr);
                    }
                }
            }
        }

        return [...new Set(faltantes)].sort();
    }

    function setupDragAndDropGlobal(textarea, messageDiv) {
        if (!textarea) return;

        textarea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '#2ecc71';
            textarea.style.boxShadow = '0 0 0 2px rgba(46,204,113,0.3)';
        });

        textarea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '';
            textarea.style.boxShadow = '';
        });

        textarea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            textarea.style.borderColor = '';
            textarea.style.boxShadow = '';

            const files = e.dataTransfer.files;
            if (files.length === 0) return;

            const file = files[0];
            const extension = file.name.split('.').pop().toLowerCase();

            if (extension === 'pdf') {
                const reader = new FileReader();
                reader.onload = async function(ev) {
                    try {
                        const arrayBuffer = ev.target.result;
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        let textoCompleto = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(function(item) { return item.str; }).join(' ');
                            textoCompleto += pageText + '\n';
                        }
                        textarea.value = textoCompleto;
                        textarea.dispatchEvent(new Event('input'));
                        if (messageDiv) {
                            messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> PDF "' + file.name + '" procesado';
                            setTimeout(function() { if (messageDiv.innerHTML.includes('PDF')) messageDiv.innerHTML = ''; }, 3000);
                        }
                        actualizarConteoVivo();
                    } catch (err) {
                        if (messageDiv) {
                            messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el PDF: ' + err.message;
                        }
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            const validExtensions = ['txt', 'csv', 'log', 'dat'];
            if (!validExtensions.includes(extension)) {
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Archivo no soportado. Solo .txt, .csv, .log, .dat y .pdf';
                    setTimeout(function() { if (messageDiv.innerHTML.includes('no soportado')) messageDiv.innerHTML = ''; }, 3000);
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function(ev) {
                textarea.value = ev.target.result;
                textarea.dispatchEvent(new Event('input'));
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Archivo "' + file.name + '" cargado';
                    setTimeout(function() { if (messageDiv.innerHTML.includes('cargado')) messageDiv.innerHTML = ''; }, 3000);
                }
                actualizarConteoVivo();
            };
            reader.onerror = function() {
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el archivo "' + file.name + '"';
                }
            };
            reader.readAsText(file);
        });
    }

    function actualizarConteoVivo() {
        const input = document.getElementById('barcodeInput');
        const texto = input ? input.value : '';
        const countEl = document.getElementById('liveCount');
        const groupsEl = document.getElementById('liveGroups');
        const uniqueEl = document.getElementById('liveUnique');

        if (!countEl || !groupsEl || !uniqueEl) return;

        const patron = /\b(\d{11,14})\b/g;
        const encontrados = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            encontrados.push(match[1]);
        }

        const total = encontrados.length;
        const grupos = new Set();
        const unicos = new Set();
        encontrados.forEach(function(cod) {
            const prefijo = cod.slice(0, -4);
            grupos.add(prefijo);
            unicos.add(cod);
        });

        countEl.textContent = total;
        groupsEl.textContent = grupos.size;
        uniqueEl.textContent = unicos.size;

        if (total > 100) {
            countEl.style.color = '#ffa500';
        } else if (total > 50) {
            countEl.style.color = '#f1c40f';
        } else {
            countEl.style.color = '#2ecc71';
        }
    }

    function sleep(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms); });
    }

    async function subirCsvContenedoresAWix(texto) {
        const estadoElem = document.getElementById('csvWixStatus');
        if (!estadoElem) return;

        const CHUNK_SIZE = 500000;
        const DELAY_MS = 200;
        const totalChunks = Math.ceil(texto.length / CHUNK_SIZE);
        const uploadId = 'csv_upload_' + Date.now();

        estadoElem.textContent = 'Subiendo ' + totalChunks + ' partes...';

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, texto.length);
            const chunk = texto.substring(start, end);

            const progress = Math.round(((i + 1) / totalChunks) * 100);
            estadoElem.textContent = 'Subiendo ' + (i + 1) + '/' + totalChunks + ' (' + progress + '%)...';

            const payload = JSON.stringify({
                chunkIndex: i,
                totalChunks: totalChunks,
                uploadId: uploadId,
                chunkData: chunk
            });

            try {
                const response = await fetch(WIX_API_URL + '/contenedoresCsv', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: payload
                });

                if (!response.ok) throw new Error('Error ' + response.status);

                const result = await response.json();

                if (result.complete) {
                    estadoElem.textContent = '✔ CSV guardado en Wix (' + totalChunks + ' partes)';
                }
            } catch (error) {
                console.error('Error en chunk ' + (i + 1) + ':', error);
                estadoElem.textContent = 'Error en parte ' + (i + 1) + '. Intenta de nuevo.';
                return false;
            }

            if (i < totalChunks - 1) await sleep(DELAY_MS);
        }

        return true;
    }

    async function cargarCsvContenedoresDesdeWix() {
        const estadoElem = document.getElementById('csvWixStatus');
        if (!estadoElem) return null;

        try {
            estadoElem.textContent = 'Cargando CSV desde Wix...';
            const response = await fetch(WIX_API_URL + '/contenedoresCsv');

            if (response.ok) {
                const text = await response.text();
                if (text && text !== 'SIN_DATOS' && text.trim()) {
                    estadoElem.textContent = '✔ CSV cargado desde Wix';
                    return text;
                } else {
                    estadoElem.textContent = 'No hay CSV guardado en Wix';
                    return null;
                }
            } else if (response.status === 404) {
                estadoElem.textContent = 'No hay CSV guardado en Wix';
                return null;
            } else {
                throw new Error('Error del servidor: ' + response.status);
            }
        } catch (error) {
            console.error('Error al cargar CSV:', error);
            estadoElem.textContent = 'Error de conexion con el servidor';
            return null;
        }
    }

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-truck"></i> Arribo/Recibir</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v3.3</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                <div class="toggle-group" id="barcodeModeToggle" style="display:inline-flex;">
                    <span class="toggle-option active-toggle" data-mode="centralizado"><i class="fas fa-boxes"></i> Arribo</span>
                    <span class="toggle-option" data-mode="traspaleo"><i class="fas fa-exchange-alt"></i> Traspaleo</span>
                    <span class="toggle-option" data-mode="contenedores"><i class="fas fa-shipping-fast"></i> Contenedores FA</span>
                </div>
                <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                    <input type="checkbox" id="autocompletarFaltantes" style="width:16px; height:16px; accent-color:#2ecc71;"> 
                    <strong style="color:#2ecc71;"><i class="fas fa-sync-alt"></i> Auto-completar</strong>
                </label>
            </div>

            <textarea id="barcodeInput" placeholder="Pega el texto con folios (11+ digitos) o arrastra un archivo PDF/TXT/CSV..." rows="6"></textarea>

            <div style="display:flex; align-items:center; gap:1.5rem; margin:0.3rem 0 0.5rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.08); padding:0.2rem 0.8rem; border-radius:4px;">
                <span style="font-size:0.8rem; color:var(--grayl);">
                    <i class="fas fa-hashtag"></i> Codigos: <strong id="liveCount" style="color:#2ecc71; font-size:1rem;">0</strong>
                </span>
                <span style="font-size:0.8rem; color:var(--grayl);">
                    <i class="fas fa-layer-group"></i> Grupos: <strong id="liveGroups" style="color:#f1c40f; font-size:1rem;">0</strong>
                </span>
                <span style="font-size:0.8rem; color:var(--grayl);">
                    <i class="fas fa-filter"></i> Unicos: <strong id="liveUnique" style="color:#3498db; font-size:1rem;">0</strong>
                </span>
            </div>

            <div class="row">
                <button id="uploadBarcodeBtn"><i class="fas fa-folder-open"></i> Subir archivo (TXT/CSV)</button>
                <button id="uploadPdfBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-file-pdf"></i> Subir PDF (extraer texto)</button>
                <input type="file" id="barcodeFile" accept=".csv,.txt,text/plain" style="display:none;">
                <input type="file" id="pdfFile" accept=".pdf" style="display:none;">
            </div>

            <div id="centralizadoPanel" class="sub-panel active">
                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="barcode_tipoPrincipal" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="arribo">arribo</option>
                            <option value="contenedores">contenedores</option>
                            <option value="centralizado">centralizado</option>
                        </select>
                        <select id="barcode_tipoSecundario" style="width:150px;">
                            <option value="">(seleccionar)</option>
                            <option value="tufesa">tufesa</option>
                            <option value="enviosbaja">enviosbaja</option>
                            <option value="ptx">ptx</option>
                            <option value="camion">camion</option>
                        </select>
                        <input type="text" id="barcode_personalizado" placeholder="Personalizado" style="width:150px;">
                        <label style="display:inline-flex; align-items:center; gap:5px;">
                            <input type="checkbox" id="barcode_incluirFecha"> Incluir fecha
                        </label>
                    </div>
                    <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:1rem;">
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <input type="checkbox" id="centralizadoOrdenAscendente" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <input type="checkbox" id="centralizadoTicketMode" style="width:16px; height:16px;"> <strong>MODO TICKET</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <span><i class="fas fa-clock"></i> Delay (ms):</span>
                            <input type="number" id="centralizadoDelay" value="100" min="0" max="5000" step="10" style="width:80px;">
                        </label>
                    </div>
                </div>
                <div class="row">
                    <label><i class="fas fa-box"></i> Cajas:</label>
                    <input type="text" id="cajasInput" placeholder="Numero de cajas" style="width:150px;">
                    <label><i class="fas fa-file"></i> Nombre base:</label>
                    <input type="text" class="barcodeFilename" id="centralizadoNombreBase" placeholder="Nombre sin extension" style="width:200px;">
                </div>
                <div class="row">
                    <button id="processCountCentralizadoBtn" class="btn-primary" style="background:#3498db; border-color:#3498db;"><i class="fas fa-play"></i> Procesar</button>
                    <button id="buscarFaltantesBtn" class="btn-secondary" style="background:#f1c40f; border-color:#f1c40f; color:#000;"><i class="fas fa-search"></i> Buscar faltantes</button>
                    <button id="agregarFaltantesBtn" class="btn-secondary" style="background:#2ecc71; border-color:#2ecc71; color:#000; display:none;"><i class="fas fa-plus"></i> Agregar faltantes</button>
                    <button id="generateBarcodeBtn" class="btn-primary"><span class="btn-text"><i class="fas fa-file-pdf"></i> Generar PDF</span><span class="spinner"></span></button>
                    <button id="generateAhkBtn" class="btn-secondary" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button id="copyAhkBtn" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </div>
                <div id="faltantesOutput" style="margin-top:0.5rem; padding:0.5rem; background:rgba(241,196,15,0.1); border:1px solid #f1c40f; border-radius:4px; display:none; max-height:200px; overflow:auto; font-family:monospace; font-size:0.75rem;"></div>
                <div id="barcodeMessage" class="message"></div>
                <div id="barcodeOutputCard" style="display:none;"><div class="output-area" id="barcodeOutputArea"></div></div>
            </div>

            <div id="traspaleoPanel" class="sub-panel">
                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="barcode_traspaleo_tipoPrincipal" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="traspaleo">traspaleo</option>
                            <option value="traslado">traslado</option>
                        </select>
                        <select id="barcode_traspaleo_tipoSecundario" style="width:150px;">
                            <option value="">(seleccionar)</option>
                            <option value="tufesa">tufesa</option>
                            <option value="ptx">ptx</option>
                            <option value="camion">camion</option>
                        </select>
                        <input type="text" id="barcode_traspaleo_personalizado" placeholder="Personalizado" style="width:150px;">
                        <label style="display:inline-flex; align-items:center; gap:5px;">
                            <input type="checkbox" id="barcode_traspaleo_incluirFecha"> Incluir fecha
                        </label>
                    </div>
                    <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:1rem;">
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <span><i class="fas fa-clock"></i> Retardo base (ms):</span>
                            <input type="number" id="traspaleoDelay" value="300" min="50" max="5000" step="10" style="width:80px;">
                        </label>
                    </div>
                </div>
                <div class="row">
                    <label><i class="fas fa-file"></i> Nombre base:</label>
                    <input type="text" class="barcodeFilename" id="traspaleoFilename" placeholder="Nombre sin extension" style="width:300px;">
                    <button id="processCountTraspaleoBtn" class="btn-primary" style="background:#3498db; border-color:#3498db;"><i class="fas fa-play"></i> Procesar</button>
                    <button id="generateTraspaleoAhkBtn" class="btn-primary" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button id="copyTraspaleoAhkBtn" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </div>
                <div id="traspaleoMessage" class="message"></div>
            </div>

            <div id="contenedoresPanel" class="sub-panel">
                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="barcode_contenedores_tipoPrincipal" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="contenedores">contenedores</option>
                            <option value="fa">fa</option>
                            <option value="envio">envio</option>
                        </select>
                        <select id="barcode_contenedores_tipoSecundario" style="width:150px;">
                            <option value="">(seleccionar)</option>
                            <option value="tufesa">tufesa</option>
                            <option value="ptx">ptx</option>
                            <option value="camion">camion</option>
                        </select>
                        <input type="text" id="barcode_contenedores_personalizado" placeholder="Personalizado" style="width:150px;">
                        <label style="display:inline-flex; align-items:center; gap:5px;">
                            <input type="checkbox" id="barcode_contenedores_incluirFecha"> Incluir fecha
                        </label>
                    </div>
                    <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:1rem;">
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <input type="checkbox" id="contenedoresOrdenAscendente" checked style="width:16px; height:16px;"> <strong>Orden ascendente</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem;">
                            <input type="checkbox" id="contenedoresTicketMode" style="width:16px; height:16px;"> <strong>MODO TICKET</strong>
                        </label>
                    </div>
                </div>

                <div class="row">
                    <label><b><i class="fas fa-file-csv"></i> Subir CSV (tabs):</b></label>
                    <button id="uploadContenedoresCsvBtn"><i class="fas fa-folder-open"></i> Subir CSV</button>
                    <input type="file" id="contenedoresCsvFile" accept=".csv,.txt" style="display:none;">
                    <span id="csvFileStatus" style="font-size:0.8rem; color:var(--grayl);"><i class="fas fa-file"></i> Sin archivo</span>
                    <span id="csvWixStatus" style="font-size:0.8rem; color:var(--grayl); margin-left:0.5rem;"></span>
                </div>
                <div class="row" style="margin-top:0.5rem;">
                    <label><b><i class="fas fa-list"></i> Lista de OBLPN (uno por linea):</b></label>
                    <textarea id="oblpnListInput" placeholder="FA260015098924&#10;FA260015098929" rows="4" style="font-family:monospace;"></textarea>
                </div>
                <div class="row">
                    <button id="buscarContenedoresBtn" class="btn-primary"><i class="fas fa-search"></i> Buscar contenedores</button>
                    <button id="limpiarContenedoresBtn" class="btn-secondary"><i class="fas fa-eraser"></i> Limpiar</button>
                    <button id="copyContenedoresBtn" class="btn-secondary"><i class="fas fa-copy"></i> Copiar</button>
                    <button id="agregarContenedoresAlTextoBtn" class="btn-secondary" style="background:#8b00ff; border-color:#8b00ff;"><i class="fas fa-plus-circle"></i> Agregar al texto</button>
                    <button id="copyContenedoresAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                    <button id="downloadContenedoresAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button id="editContenedoresBtn" style="background:#3498db; border-color:#3498db;"><i class="fas fa-pen"></i> Editar</button>
                </div>
                <div id="contenedoresMessage" class="message"></div>
                <div id="contenedoresResultado" class="output-area" style="max-height:300px; overflow:auto; font-size:0.8rem; display:none;"></div>
                <div id="contenedoresCount" style="font-size:0.8rem; color:var(--grayl); margin-top:0.5rem;"></div>
            </div>

            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Modos:</b><br>
                <b><i class="fas fa-boxes"></i> Arribo:</b> Genera PDF y AHK con codigos EAN-13/14.<br>
                <b><i class="fas fa-exchange-alt"></i> Traspaleo:</b> AHK con clics y teclas especiales para traspaleo.<br>
                <b><i class="fas fa-shipping-fast"></i> Contenedores FA:</b> Busca contenedores a partir de OBLPN desde CSV con tabs.<br>
                <b><i class="fas fa-sync-alt"></i> Auto-completar:</b> Al buscar faltantes, muestra los codigos faltantes en secuencias.<br>
                <b><i class="fas fa-cloud-upload-alt"></i> Wix:</b> El CSV se guarda automaticamente en Wix y se recarga al abrir.<br>
                <b>AHK:</b> Usa <kbd>Ctrl+Q</kbd> para ejecutar, <kbd>Shift+Esc</kbd> para abortar.
            </div>
        </div>
    `;

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

    const barcodeInput = document.getElementById('barcodeInput');
    if (barcodeInput) {
        barcodeInput.addEventListener('input', actualizarConteoVivo);
        barcodeInput.addEventListener('paste', function() {
            setTimeout(actualizarConteoVivo, 50);
        });
        barcodeInput.addEventListener('drop', function() {
            setTimeout(actualizarConteoVivo, 100);
        });
        barcodeInput.addEventListener('change', actualizarConteoVivo);
        setTimeout(actualizarConteoVivo, 100);
    }

    const barcodeFile = document.getElementById('barcodeFile');
    if (barcodeFile) {
        barcodeFile.addEventListener('change', function() {
            setTimeout(actualizarConteoVivo, 200);
        });
    }

    const pdfFile = document.getElementById('pdfFile');
    if (pdfFile) {
        pdfFile.addEventListener('change', function() {
            setTimeout(actualizarConteoVivo, 300);
        });
    }

    setupDragAndDropGlobal(barcodeInput, document.getElementById('barcodeMessage'));

    core.setupFileUpload('uploadBarcodeBtn', 'barcodeFile', 'barcodeInput');

    const pdfInput = document.getElementById('pdfFile');
    const pdfUploadBtn = document.getElementById('uploadPdfBtn');
    pdfUploadBtn.addEventListener('click', function() { pdfInput.click(); });
    pdfInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const texto = await extraerTextoDePDF(file);
            document.getElementById('barcodeInput').value = texto;
            const { total } = extraerFolios(texto, true);
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-check-circle"></i> PDF procesado. Se encontraron ' + total + ' folios.';
            setTimeout(function() { if (document.getElementById('barcodeMessage').innerHTML.includes('PDF')) document.getElementById('barcodeMessage').innerHTML = ''; }, 4000);
            actualizarConteoVivo();
        } catch (err) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el PDF.';
        }
        pdfInput.value = '';
    });

    const centralizadoElements = ['barcode_tipoPrincipal', 'barcode_tipoSecundario', 'barcode_personalizado', 'barcode_incluirFecha'];
    centralizadoElements.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.addEventListener('change', actualizarNombreCentralizado);
            else el.addEventListener('input', actualizarNombreCentralizado);
        }
    });
    actualizarNombreCentralizado();

    const traspaleoElements = ['barcode_traspaleo_tipoPrincipal', 'barcode_traspaleo_tipoSecundario', 'barcode_traspaleo_personalizado', 'barcode_traspaleo_incluirFecha'];
    traspaleoElements.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.addEventListener('change', actualizarNombreTraspaleo);
            else el.addEventListener('input', actualizarNombreTraspaleo);
        }
    });
    actualizarNombreTraspaleo();

    function contarFoliosYMostrar(messageElementId, deduplicate) {
        if (deduplicate === undefined) deduplicate = true;
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) {
            document.getElementById(messageElementId).innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay texto para procesar.';
            return;
        }
        const { total } = extraerFolios(inputText, deduplicate);
        document.getElementById(messageElementId).innerHTML = '<i class="fas fa-check-circle"></i> Se encontraron <b>' + total + '</b> codigos.';
        setTimeout(function() { if (document.getElementById(messageElementId).innerHTML.includes('codigos')) document.getElementById(messageElementId).innerHTML = ''; }, 4000);
        actualizarConteoVivo();
    }

    document.getElementById('processCountCentralizadoBtn').addEventListener('click', function() { contarFoliosYMostrar('barcodeMessage', true); });
    document.getElementById('processCountTraspaleoBtn').addEventListener('click', function() { contarFoliosYMostrar('traspaleoMessage', true); });

    let codigosFaltantes = [];
    document.getElementById('buscarFaltantesBtn').addEventListener('click', function() {
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con codigos primero.';
            return;
        }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length < 2) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-info-circle"></i> Se necesitan al menos 2 codigos para buscar faltantes.';
            return;
        }
        codigosFaltantes = encontrarFaltantes(folios);
        const outputDiv = document.getElementById('faltantesOutput');
        const agregarBtn = document.getElementById('agregarFaltantesBtn');
        if (codigosFaltantes.length === 0) {
            outputDiv.innerHTML = '<span style="color:#2ecc71;"><i class="fas fa-check-circle"></i> No se encontraron numeros faltantes en ningun grupo.</span>';
            outputDiv.style.display = 'block';
            agregarBtn.style.display = 'none';
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-check-circle"></i> No hay faltantes.';
        } else {
            let html = '<b style="color:#f1c40f;"><i class="fas fa-exclamation-triangle"></i> ' + codigosFaltantes.length + ' codigos faltantes encontrados:</b><br>';
            const mostrar = codigosFaltantes.slice(0, 100);
            mostrar.forEach(function(c) { html += c + '<br>'; });
            if (codigosFaltantes.length > 100) {
                html += '<span style="color:#666;">... y ' + (codigosFaltantes.length - 100) + ' mas</span>';
            }
            outputDiv.innerHTML = html;
            outputDiv.style.display = 'block';
            agregarBtn.style.display = 'inline-flex';
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Se encontraron ' + codigosFaltantes.length + ' faltantes.';
        }
    });

    document.getElementById('agregarFaltantesBtn').addEventListener('click', function() {
        if (!codigosFaltantes || codigosFaltantes.length === 0) return;
        const textarea = document.getElementById('barcodeInput');
        let currentText = textarea.value;
        if (!currentText.endsWith('\n') && currentText.trim() !== '') {
            currentText += '\n';
        }
        currentText += codigosFaltantes.join('\n');
        textarea.value = currentText;
        document.getElementById('faltantesOutput').style.display = 'none';
        this.style.display = 'none';
        document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + codigosFaltantes.length + ' codigos agregados. Procesa nuevamente.';
        codigosFaltantes = [];
        setTimeout(function() { if (document.getElementById('barcodeMessage').innerHTML.includes('agregados')) document.getElementById('barcodeMessage').innerHTML = ''; }, 3000);
        actualizarConteoVivo();
    });

    const FILAS = 12, COLUMNAS = 4;
    const ANCHO_HOJA = 612, ALTO_HOJA = 792;
    const anchoCelda = (ANCHO_HOJA - 2*15 - 5*(COLUMNAS-1)) / COLUMNAS;
    const altoCelda = (ALTO_HOJA - 20 - 20 - 5*(FILAS-1)) / FILAS;

    function generarBarcodeDataURL(folio, anchoPx, altoPx) {
        const container = document.getElementById('barcodeHiddenCanvas');
        const canvas = document.createElement('canvas');
        canvas.width = anchoPx;
        canvas.height = altoPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, anchoPx, altoPx);
        container.appendChild(canvas);
        try {
            JsBarcode(canvas, String(folio), { format: 'CODE128', displayValue: false, margin: 6, background: '#ffffff', lineColor: '#000000', width: Math.max(1.5, anchoPx/150), height: altoPx-12 });
        } catch(e) {
            JsBarcode(canvas, String(folio), { format: 'CODE128', displayValue: false, margin: 4, background: '#ffffff', lineColor: '#000000', width: 1.8, height: altoPx-10 });
        }
        const url = canvas.toDataURL('image/png');
        container.removeChild(canvas);
        return url;
    }

    document.getElementById('generateBarcodeBtn').addEventListener('click', async function() {
        const btn = this;
        const input = document.getElementById('barcodeInput').value;
        let nombreBase = document.getElementById('centralizadoNombreBase').value.trim();
        if (!nombreBase) nombreBase = 'arribo';
        let filename = nombreBase + '.pdf';
        const msgEl = document.getElementById('barcodeMessage');
        const outputCard = document.getElementById('barcodeOutputCard');
        const outputArea = document.getElementById('barcodeOutputArea');
        msgEl.innerHTML = '';
        outputCard.style.display = 'none';
        if (!input.trim()) {
            msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.';
            return;
        }
        const { folios } = extraerFolios(input, true);
        if (!folios.length) {
            msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron folios (11+ digitos).';
            return;
        }
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            outputCard.style.display = 'block';
            outputArea.textContent = 'Generando PDF con ' + folios.length + ' folios...\n';
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
            const totalPaginas = Math.ceil(folios.length / (FILAS * COLUMNAS));
            const canvasW = Math.round(anchoCelda * 2.5);
            const canvasH = Math.round(altoCelda * 1.4);
            for (let p = 0; p < totalPaginas; p++) {
                if (p > 0) doc.addPage();
                const inicio = p * FILAS * COLUMNAS;
                const fin = Math.min(inicio + FILAS * COLUMNAS, folios.length);
                for (let i = inicio; i < fin; i++) {
                    const fila = Math.floor((i - inicio) / COLUMNAS);
                    const col = (i - inicio) % COLUMNAS;
                    const x = 15 + col * (anchoCelda + 5);
                    const y = 20 + fila * (altoCelda + 5);
                    const url = generarBarcodeDataURL(folios[i], canvasW, canvasH);
                    doc.addImage(url, 'PNG', x + 8, y + 4, anchoCelda - 16, altoCelda * 0.62);
                    doc.setFontSize(7.5);
                    doc.text(String(folios[i]), x + anchoCelda / 2, y + altoCelda * 0.62 + 14, { align: 'center' });
                }
            }
            doc.save(filename);
            outputArea.textContent += 'PDF generado: ' + filename + '\n';
            msgEl.innerHTML = '<i class="fas fa-check-circle"></i> PDF descargado con <b>' + folios.length + '</b> folios.';
        } catch(e) {
            msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: ' + e.message;
        }
        btn.disabled = false;
        btn.classList.remove('loading');
    });

    document.getElementById('generateAhkBtn').addEventListener('click', function() {
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.';
            return;
        }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length === 0) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron codigos.';
            return;
        }
        let unicos = [...folios];
        const ordenAscendente = document.getElementById('centralizadoOrdenAscendente').checked;
        if (ordenAscendente) unicos.sort(function(a, b) { return a.localeCompare(b); });
        const delay = parseInt(document.getElementById('centralizadoDelay').value) || 100;
        let nombreBase = document.getElementById('centralizadoNombreBase').value.trim();
        if (!nombreBase) nombreBase = 'arribo';
        const ahk = generarAHKConGrupos(unicos, 'Codigos de Arribo (' + unicos.length + ' codigos)', delay);
        if (!ahk) return;
        const blob = new Blob([ahk], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreBase + '.ahk';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK descargado con ' + unicos.length + ' codigos (' + Math.ceil(unicos.length / 50) + ' grupos).';
        setTimeout(function() { if (document.getElementById('barcodeMessage').innerHTML.includes('AHK')) document.getElementById('barcodeMessage').innerHTML = ''; }, 3000);
    });

    document.getElementById('copyAhkBtn').addEventListener('click', function() {
        const inputText = document.getElementById('barcodeInput').value;
        if (!inputText.trim()) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.';
            return;
        }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length === 0) {
            document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron codigos.';
            return;
        }
        let unicos = [...folios];
        const ordenAscendente = document.getElementById('centralizadoOrdenAscendente').checked;
        if (ordenAscendente) unicos.sort(function(a, b) { return a.localeCompare(b); });
        const delay = parseInt(document.getElementById('centralizadoDelay').value) || 100;
        const ahk = generarAHKConGrupos(unicos, 'Codigos de Arribo (' + unicos.length + ' codigos)', delay);
        if (!ahk) return;
        core.copiarTexto(ahk, 'barcodeMessage');
        document.getElementById('barcodeMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK copiado (' + unicos.length + ' codigos, ' + Math.ceil(unicos.length / 50) + ' grupos).';
        setTimeout(function() { if (document.getElementById('barcodeMessage').innerHTML.includes('copiado')) document.getElementById('barcodeMessage').innerHTML = ''; }, 3000);
    });

    document.getElementById('generateTraspaleoAhkBtn').addEventListener('click', function() {
        const inputText = document.getElementById('barcodeInput').value;
        let delay = parseInt(document.getElementById('traspaleoDelay').value);
        if (isNaN(delay) || delay < 50) delay = 300;
        if (!inputText.trim()) {
            document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.';
            return;
        }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length === 0) {
            document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron folios.';
            return;
        }
        const foliosOrdenados = [...folios].sort(function(a, b) { return a.localeCompare(b); });
        let nombreBase = document.getElementById('traspaleoFilename').value.trim();
        if (!nombreBase) nombreBase = 'traspaleo';
        const ahk = generarAHKTraspaleo(foliosOrdenados, delay);
        if (!ahk) return;
        const blob = new Blob([ahk], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreBase + '.ahk';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Traspaleo descargado (' + foliosOrdenados.length + ' codigos, ' + Math.ceil(foliosOrdenados.length / 50) + ' grupos).';
        setTimeout(function() { if (document.getElementById('traspaleoMessage').innerHTML.includes('Traspaleo')) document.getElementById('traspaleoMessage').innerHTML = ''; }, 4000);
    });

    document.getElementById('copyTraspaleoAhkBtn').addEventListener('click', function() {
        const inputText = document.getElementById('barcodeInput').value;
        let delay = parseInt(document.getElementById('traspaleoDelay').value);
        if (isNaN(delay) || delay < 50) delay = 300;
        if (!inputText.trim()) {
            document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con folios.';
            return;
        }
        const { folios } = extraerFolios(inputText, true);
        if (folios.length === 0) {
            document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron folios.';
            return;
        }
        const foliosOrdenados = [...folios].sort(function(a, b) { return a.localeCompare(b); });
        const ahk = generarAHKTraspaleo(foliosOrdenados, delay);
        if (!ahk) return;
        core.copiarTexto(ahk, 'traspaleoMessage');
        document.getElementById('traspaleoMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Traspaleo copiado (' + foliosOrdenados.length + ' codigos).';
        setTimeout(function() { if (document.getElementById('traspaleoMessage').innerHTML.includes('copiado')) document.getElementById('traspaleoMessage').innerHTML = ''; }, 3000);
    });

    let contenedoresMap = new Map();
    let contenedoresResultados = [];

    const csvUploadBtn = document.getElementById('uploadContenedoresCsvBtn');
    const csvFileInput = document.getElementById('contenedoresCsvFile');
    const csvStatus = document.getElementById('csvFileStatus');
    const csvWixStatus = document.getElementById('csvWixStatus');

    async function cargarYProcesarCSV(texto, nombreArchivo) {
        const lineas = texto.split(/\r?\n/);
        if (lineas.length === 0) {
            csvStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Archivo vacio';
            return false;
        }
        contenedoresMap.clear();
        const header = lineas[0].split('\t').map(function(c) { return c.trim().toLowerCase(); });
        const idxOBLPN = header.findIndex(function(c) { return c === 'oblpn'; });
        const idxContenedor = header.findIndex(function(c) { return c === 'contenedor'; });
        if (idxOBLPN === -1 || idxContenedor === -1) {
            csvStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Columnas "OBLPN" y "Contenedor" no encontradas';
            return false;
        }
        let count = 0;
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            const cols = linea.split('\t').map(function(c) { return c.trim(); });
            if (cols.length <= Math.max(idxOBLPN, idxContenedor)) continue;
            const oblpn = cols[idxOBLPN];
            const contenedor = cols[idxContenedor];
            if (oblpn && contenedor) {
                contenedoresMap.set(oblpn, contenedor);
                count++;
            }
        }
        csvStatus.innerHTML = '<i class="fas fa-file"></i> ' + nombreArchivo + ' (' + count + ' registros)';
        document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> CSV cargado: ' + count + ' relaciones OBLPN→Contenedor.';
        setTimeout(function() { if (document.getElementById('contenedoresMessage').innerHTML.includes('cargado')) document.getElementById('contenedoresMessage').innerHTML = ''; }, 3000);
        return true;
    }

    csvUploadBtn.addEventListener('click', function() { csvFileInput.click(); });
    csvFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(ev) {
            const texto = ev.target.result;
            const ok = await cargarYProcesarCSV(texto, file.name);
            if (ok && texto.length > 0) {
                await subirCsvContenedoresAWix(texto);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    async function cargarCsvDesdeWix() {
        const texto = await cargarCsvContenedoresDesdeWix();
        if (texto && texto !== 'SIN_DATOS') {
            await cargarYProcesarCSV(texto, 'Wix');
        }
    }

    setTimeout(cargarCsvDesdeWix, 500);

    document.getElementById('buscarContenedoresBtn').addEventListener('click', function() {
        const oblpnText = document.getElementById('oblpnListInput').value;
        if (!oblpnText.trim()) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Escribe al menos un OBLPN.';
            return;
        }
        if (contenedoresMap.size === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Primero sube un archivo CSV o carga desde Wix.';
            return;
        }
        const lista = oblpnText.split(/\r?\n/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
        if (lista.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay OBLPN validos.';
            return;
        }
        const encontrados = [];
        const noEncontrados = [];
        lista.forEach(function(oblpn) {
            if (contenedoresMap.has(oblpn)) {
                encontrados.push(contenedoresMap.get(oblpn));
            } else {
                noEncontrados.push(oblpn);
            }
        });
        contenedoresResultados = encontrados;
        const outputDiv = document.getElementById('contenedoresResultado');
        const countDiv = document.getElementById('contenedoresCount');
        if (encontrados.length > 0) {
            outputDiv.innerHTML = encontrados.join('\n');
            outputDiv.style.display = 'block';
            countDiv.innerHTML = '<i class="fas fa-check-circle"></i> ' + encontrados.length + ' contenedores encontrados' + (noEncontrados.length > 0 ? ' (' + noEncontrados.length + ' no encontrados)' : '');
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + encontrados.length + ' contenedores encontrados.';
        } else {
            outputDiv.innerHTML = '';
            outputDiv.style.display = 'none';
            countDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ningun OBLPN encontrado';
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Ningun OBLPN encontrado.';
        }
    });

    document.getElementById('limpiarContenedoresBtn').addEventListener('click', function() {
        document.getElementById('contenedoresResultado').innerHTML = '';
        document.getElementById('contenedoresResultado').style.display = 'none';
        document.getElementById('contenedoresCount').innerHTML = '';
        document.getElementById('contenedoresMessage').innerHTML = '';
        contenedoresResultados = [];
    });

    document.getElementById('copyContenedoresBtn').addEventListener('click', function() {
        if (!contenedoresResultados || contenedoresResultados.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para copiar.';
            return;
        }
        const texto = contenedoresResultados.join('\n');
        core.copiarTexto(texto, 'contenedoresMessage');
        document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + contenedoresResultados.length + ' contenedores copiados.';
        setTimeout(function() { if (document.getElementById('contenedoresMessage').innerHTML.includes('copiados')) document.getElementById('contenedoresMessage').innerHTML = ''; }, 3000);
    });

    document.getElementById('agregarContenedoresAlTextoBtn').addEventListener('click', function() {
        if (!contenedoresResultados || contenedoresResultados.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay contenedores para agregar.';
            return;
        }
        const textarea = document.getElementById('barcodeInput');
        let currentText = textarea.value;
        if (!currentText.endsWith('\n') && currentText.trim() !== '') {
            currentText += '\n';
        }
        currentText += contenedoresResultados.join('\n');
        textarea.value = currentText;
        document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + contenedoresResultados.length + ' contenedores agregados al texto principal.';
        setTimeout(function() { if (document.getElementById('contenedoresMessage').innerHTML.includes('agregados')) document.getElementById('contenedoresMessage').innerHTML = ''; }, 3000);
        actualizarConteoVivo();
    });

    document.getElementById('copyContenedoresAhkBtn').addEventListener('click', function() {
        if (!contenedoresResultados || contenedoresResultados.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para generar AHK.';
            return;
        }
        const ordenAscendente = document.getElementById('contenedoresOrdenAscendente').checked;
        let codigos = [...contenedoresResultados];
        if (ordenAscendente) codigos.sort(function(a, b) { return a.localeCompare(b); });
        const ahk = generarAHKConGrupos(codigos, 'Contenedores FA (' + codigos.length + ' contenedores)', 100);
        if (!ahk) return;
        core.copiarTexto(ahk, 'contenedoresMessage');
        document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK copiado (' + codigos.length + ' contenedores).';
        setTimeout(function() { if (document.getElementById('contenedoresMessage').innerHTML.includes('copiado')) document.getElementById('contenedoresMessage').innerHTML = ''; }, 3000);
    });

    document.getElementById('downloadContenedoresAhkBtn').addEventListener('click', function() {
        if (!contenedoresResultados || contenedoresResultados.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para generar AHK.';
            return;
        }
        const ordenAscendente = document.getElementById('contenedoresOrdenAscendente').checked;
        let codigos = [...contenedoresResultados];
        if (ordenAscendente) codigos.sort(function(a, b) { return a.localeCompare(b); });
        const ahk = generarAHKConGrupos(codigos, 'Contenedores FA (' + codigos.length + ' contenedores)', 100);
        if (!ahk) return;
        let nombreBase = construirNombreConDropdowns('barcode_contenedores') || 'contenedores_fa';
        const blob = new Blob([ahk], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreBase + '.ahk';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK descargado (' + codigos.length + ' contenedores).';
        setTimeout(function() { if (document.getElementById('contenedoresMessage').innerHTML.includes('descargado')) document.getElementById('contenedoresMessage').innerHTML = ''; }, 3000);
    });

    let editandoContenedores = false;
    document.getElementById('editContenedoresBtn').addEventListener('click', function() {
        const outputDiv = document.getElementById('contenedoresResultado');
        if (!contenedoresResultados || contenedoresResultados.length === 0) {
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para editar.';
            return;
        }
        editandoContenedores = !editandoContenedores;
        if (editandoContenedores) {
            const textarea = document.createElement('textarea');
            textarea.id = 'contenedoresEditArea';
            textarea.style.width = '100%';
            textarea.style.height = '200px';
            textarea.style.background = 'var(--blud)';
            textarea.style.color = 'var(--white)';
            textarea.style.border = '1px solid var(--blu)';
            textarea.style.borderRadius = '4px';
            textarea.style.padding = '0.5rem';
            textarea.style.fontFamily = 'monospace';
            textarea.style.fontSize = '0.8rem';
            textarea.value = contenedoresResultados.join('\n');
            outputDiv.innerHTML = '';
            outputDiv.appendChild(textarea);
            this.innerHTML = '<i class="fas fa-save"></i> Guardar';
            document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-info-circle"></i> Edita los contenedores y haz clic en Guardar.';
        } else {
            const textarea = document.getElementById('contenedoresEditArea');
            if (textarea) {
                const nuevos = textarea.value.split(/\r?\n/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
                if (nuevos.length > 0) {
                    contenedoresResultados = nuevos;
                    outputDiv.innerHTML = nuevos.join('\n');
                    document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + nuevos.length + ' contenedores actualizados.';
                } else {
                    document.getElementById('contenedoresMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay contenedores validos.';
                    editandoContenedores = true;
                    this.innerHTML = '<i class="fas fa-pen"></i> Editar';
                    return;
                }
            }
            this.innerHTML = '<i class="fas fa-pen"></i> Editar';
        }
    });

    const modeToggle = document.getElementById('barcodeModeToggle');
    const centralizadoPanel = document.getElementById('centralizadoPanel');
    const traspaleoPanel = document.getElementById('traspaleoPanel');
    const contenedoresPanel = document.getElementById('contenedoresPanel');

    modeToggle.querySelectorAll('.toggle-option').forEach(function(tab) {
        tab.addEventListener('click', function() {
            modeToggle.querySelectorAll('.toggle-option').forEach(function(t) { t.classList.remove('active-toggle'); });
            this.classList.add('active-toggle');
            const mode = this.dataset.mode;
            centralizadoPanel.classList.remove('active');
            traspaleoPanel.classList.remove('active');
            contenedoresPanel.classList.remove('active');
            if (mode === 'centralizado') centralizadoPanel.classList.add('active');
            else if (mode === 'traspaleo') traspaleoPanel.classList.add('active');
            else if (mode === 'contenedores') contenedoresPanel.classList.add('active');
            if (window.updateHash) window.updateHash('tab4', mode);
        });
    });
    centralizadoPanel.classList.add('active');

    window.addEventListener('restoreSubmodule', function(e) {
        if (e.detail.tabId === 'tab4' && e.detail.subMode) {
            const targetTab = modeToggle.querySelector('.toggle-option[data-mode="' + e.detail.subMode + '"]');
            if (targetTab) targetTab.click();
        }
    });

    const clearBtn = document.querySelector('#tab4 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcode_tipoPrincipal').value = '';
            document.getElementById('barcode_tipoSecundario').value = '';
            document.getElementById('barcode_personalizado').value = '';
            document.getElementById('barcode_incluirFecha').checked = false;
            document.getElementById('centralizadoNombreBase').value = '';
            document.getElementById('cajasInput').value = '';
            document.getElementById('centralizadoDelay').value = '100';
            document.getElementById('centralizadoOrdenAscendente').checked = true;
            document.getElementById('centralizadoTicketMode').checked = false;
            document.getElementById('barcode_traspaleo_tipoPrincipal').value = '';
            document.getElementById('barcode_traspaleo_tipoSecundario').value = '';
            document.getElementById('barcode_traspaleo_personalizado').value = '';
            document.getElementById('barcode_traspaleo_incluirFecha').checked = false;
            document.getElementById('traspaleoFilename').value = '';
            document.getElementById('traspaleoDelay').value = '300';
            document.getElementById('barcode_contenedores_tipoPrincipal').value = '';
            document.getElementById('barcode_contenedores_tipoSecundario').value = '';
            document.getElementById('barcode_contenedores_personalizado').value = '';
            document.getElementById('barcode_contenedores_incluirFecha').checked = false;
            document.getElementById('contenedoresOrdenAscendente').checked = true;
            document.getElementById('contenedoresTicketMode').checked = false;
            document.getElementById('faltantesOutput').style.display = 'none';
            document.getElementById('faltantesOutput').innerHTML = '';
            document.getElementById('agregarFaltantesBtn').style.display = 'none';
            document.getElementById('barcodeMessage').innerHTML = '';
            document.getElementById('traspaleoMessage').innerHTML = '';
            document.getElementById('barcodeOutputCard').style.display = 'none';
            document.getElementById('contenedoresResultado').innerHTML = '';
            document.getElementById('contenedoresResultado').style.display = 'none';
            document.getElementById('contenedoresCount').innerHTML = '';
            document.getElementById('contenedoresMessage').innerHTML = '';
            document.getElementById('csvFileStatus').innerHTML = '<i class="fas fa-file"></i> Sin archivo';
            contenedoresMap.clear();
            contenedoresResultados = [];
            codigosFaltantes = [];
            editandoContenedores = false;
            actualizarNombreCentralizado();
            actualizarNombreTraspaleo();
            setTimeout(actualizarConteoVivo, 50);
        });
    }

    if (csvFileInput) {
        csvFileInput.addEventListener('change', function() {
            setTimeout(actualizarConteoVivo, 200);
        });
    }

    const agregarFaltantesBtn2 = document.getElementById('agregarFaltantesBtn');
    if (agregarFaltantesBtn2) {
        agregarFaltantesBtn2.addEventListener('click', function() {
            setTimeout(actualizarConteoVivo, 100);
        });
    }
})();