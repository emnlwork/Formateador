// modulo9_depurador_vr.js
// Módulo Depurador VR - Ventas Reservadas
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab9');
    if (!container) {
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            const newTab = document.createElement('button');
            newTab.className = 'tab-btn';
            newTab.dataset.tab = 'tab9';
            newTab.innerHTML = '<i class="fas fa-broom"></i> Depurador VR';
            tabsContainer.appendChild(newTab);
            
            const panelsContainer = document.querySelector('.container');
            if (panelsContainer) {
                const newPanel = document.createElement('div');
                newPanel.id = 'tab9';
                newPanel.className = 'panel';
                panelsContainer.appendChild(newPanel);
            }
        }
        const newContainer = document.getElementById('tab9');
        if (!newContainer) {
            console.error('No se pudo crear la pestaña Depurador VR');
            return;
        }
        initModule(newContainer);
    } else {
        initModule(container);
    }

    function initModule(container) {
        container.innerHTML = `
            <div class="card">
                <div class="row" style="justify-content:space-between;">
                    <h3><i class="fas fa-broom"></i> Depurador VR · Ventas Reservadas</h3>
                    <div style="display:flex; align-items:center; gap:0.8rem;">
                        <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v1.3</span>
                        <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                    </div>
                </div>
                
                <div class="row" style="margin-bottom:0.5rem;">
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
                        <button id="vrProcessBtn" class="btn-primary"><i class="fas fa-play"></i> Procesar</button>
                        <button id="vrCopyTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="vrCopyCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="vrFilename" value="depuracion_vr.csv" style="width:200px;">
                        <button id="vrDownloadBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="vrCopyFeedback"></span>
                    </div>
                </div>
                <div class="row" style="flex-wrap:wrap; gap:0.5rem;">
                    <button id="vrDownloadAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK (incorrectos)</button>
                    <button id="vrCopyAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                    <button id="vrDownloadAhkFaltantesBtn" style="background:#ff8c00; border-color:#ff8c00;"><i class="fas fa-code"></i> AHK Faltantes</button>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
                    <div>
                        <label><b>📋 Datos VR (formato de texto):</b></label>
                        <textarea id="vrInput" rows="12" placeholder="Pega aquí los datos de Ventas Reservadas..." style="font-family:monospace; font-size:0.75rem;"></textarea>
                        <div class="row"><button id="vrUploadBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="vrFile" accept=".csv,.txt" style="display:none;"></div>
                        <div style="font-size:0.7rem; color:var(--grayl); margin-top:0.3rem;">
                            <b>Formato esperado:</b> Líneas con tabs, debe contener "RECIBIDA".<br>
                            Ej: <code>True	CDR BAJIO WMS	ANDREA MOVIL	2778038	...	3905807-95827 NE SLI	26	 	1	RECIBIDA	...</code>
                            <br>Se extrae: modelo (5 dígitos después del guion), línea, tipo, talla, cantidad, cliente.
                        </div>
                    </div>
                    <div>
                        <label><b>📊 Escaneo (códigos EAN-13/14):</b></label>
                        <textarea id="vrScanInput" rows="12" placeholder="Pega aquí los códigos escaneados (EAN-13/14)...&#10;Usa '43760' como separador de posiciones." style="font-family:monospace; font-size:0.75rem;"></textarea>
                        <div class="row"><button id="vrScanUploadBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" id="vrScanFile" accept=".csv,.txt" style="display:none;"></div>
                        <div style="font-size:0.7rem; color:var(--grayl); margin-top:0.3rem;">
                            <b>Formato:</b> Códigos EAN-13 (13 dígitos) o EAN-14 (14 dígitos).<br>
                            <b>Separador de posición:</b> <code>43760</code> → indica cambio de posición.
                            <br>Ej: <code>0612901220106 0612901220205 43760 0612901220304</code>
                        </div>
                    </div>
                </div>
                
                <div id="vrMessage" class="message"></div>
                <div id="vrSummary" class="message" style="background:#1a2a1a; border-color:#2ecc71;"></div>
                <div id="vrOutput" class="output-area" style="max-height:500px; overflow:auto;"></div>
                
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Depurador VR</b><br>
                    1. En el panel izquierdo pega los datos de Ventas Reservadas (formato de texto con tabs).<br>
                    2. En el panel derecho pega el escaneo de códigos EAN-13/14 (usa <code>43760</code> como separador de posiciones).<br>
                    3. Haz clic en <b>Procesar</b> para analizar.<br>
                    4. El sistema comparará cada producto con su posición esperada y detectará:<br>
                    &nbsp;&nbsp;• <b style="color:#e74c3c;">Posición incorrecta</b> (está en otra posición)<br>
                    &nbsp;&nbsp;• <b style="color:#f1c40f;">Faltante</b> (debería estar pero no fue escaneado)<br>
                    5. Los códigos de cliente <code>0000000000</code> son ignorados.<br>
                    6. Solo se procesan registros con <b>RECIBIDA</b>.
                </div>
            </div>
        `;

        // Configurar uploads
        core.setupFileUpload('vrUploadBtn', 'vrFile', 'vrInput');
        core.setupFileUpload('vrScanUploadBtn', 'vrScanFile', 'vrScanInput');

        // Estado
        let vrData = [];
        let scanData = [];
        let resultados = [];
        let resultadosFaltantes = [];

        // ==================== PARSEADOR DE DATOS VR (COMPLETAMENTE REWRITE) ====================
        function parsearDatosVR(texto) {
            const lineas = texto.split(/\r?\n/).filter(l => l.trim() !== '');
            const resultados = [];
            
            for (const lineaCompleta of lineas) {
                // Verificar que contenga "RECIBIDA" (case insensitive)
                if (!lineaCompleta.toUpperCase().includes('RECIBIDA')) {
                    continue;
                }
                
                // Buscar el patrón del modelo con guion: XXXXX-YYYYY
                const regexModelo = /\b(\d{5,7})-(\d{5})\b/;
                const matchModelo = lineaCompleta.match(regexModelo);
                
                if (!matchModelo) continue;
                
                const modelo = matchModelo[2]; // Los 5 dígitos después del guion
                
                // Buscar los campos después del modelo usando una expresión regular más flexible
                // El patrón es: modelo + espacio + LINEA + espacio + TIPO + espacio + TALLA + espacio + CANTIDAD + espacio + CLIENTE
                // Ej: "3905807-95827 NE SLI 26 1 0520247200"
                
                // Buscar la posición del modelo en la línea
                const idxModelo = lineaCompleta.indexOf(matchModelo[0]);
                const resto = lineaCompleta.substring(idxModelo + matchModelo[0].length);
                
                // Dividir el resto por espacios y tabs, filtrando vacíos
                const tokens = resto.split(/[\t\s]+/).filter(t => t.trim() !== '');
                
                if (tokens.length < 5) continue;
                
                // Los primeros 4 tokens deberían ser: LINEA, TIPO, TALLA, CANTIDAD
                const lineaVal = tokens[0] || '';
                const tipoVal = tokens[1] || '';
                const tallaVal = tokens[2] || '';
                
                // Buscar cantidad (debe ser un número entero pequeño)
                let cantidadVal = 1;
                let idxCantidad = -1;
                for (let i = 3; i < Math.min(tokens.length, 10); i++) {
                    const t = tokens[i];
                    if (/^\d+$/.test(t) && parseInt(t) >= 1 && parseInt(t) <= 999) {
                        cantidadVal = parseInt(t);
                        idxCantidad = i;
                        break;
                    }
                }
                
                if (idxCantidad === -1) continue;
                
                // Buscar cliente (10 dígitos) después de la cantidad
                let clienteVal = '0000000000';
                for (let i = idxCantidad + 1; i < tokens.length; i++) {
                    const t = tokens[i];
                    if (/^\d{10}$/.test(t)) {
                        clienteVal = t;
                        break;
                    }
                }
                
                // Verificar que tenemos los datos mínimos
                if (modelo && lineaVal && tipoVal) {
                    resultados.push({
                        modelo: modelo,
                        linea: lineaVal.toUpperCase(),
                        tipo: tipoVal.toUpperCase(),
                        talla: tallaVal,
                        cantidad: cantidadVal,
                        cliente: clienteVal,
                        posicionEsperada: null,
                        textoOriginal: lineaCompleta
                    });
                }
            }
            
            return resultados;
        }

        // ==================== PARSEADOR DE ESCANEO ====================
        function parsearEscaneo(texto) {
            const lineas = texto.split(/\r?\n/).filter(l => l.trim() !== '');
            const todosCodigos = [];
            for (const linea of lineas) {
                // Extraer todos los códigos de 13 o 14 dígitos
                const patron = /\b(\d{13,14})\b/g;
                let match;
                while ((match = patron.exec(linea)) !== null) {
                    todosCodigos.push(match[1]);
                }
                // También extraer separadores 43760 (como texto plano)
                const separadores = linea.match(/\b43760\b/g);
                if (separadores) {
                    for (const sep of separadores) {
                        todosCodigos.push('POS_SEP');
                    }
                }
            }
            
            // Procesar los códigos en posiciones
            const posiciones = [];
            let posicionActual = 1;
            let buffer = [];
            
            for (const item of todosCodigos) {
                if (item === 'POS_SEP') {
                    if (buffer.length > 0) {
                        posiciones.push({ posicion: posicionActual, codigos: [...buffer] });
                        buffer = [];
                        posicionActual++;
                    }
                } else {
                    buffer.push(item);
                }
            }
            if (buffer.length > 0) {
                posiciones.push({ posicion: posicionActual, codigos: [...buffer] });
            }
            
            // Decodificar cada código usando la biblioteca
            const lib = core.obtenerBiblioteca();
            const resultados = [];
            
            for (const pos of posiciones) {
                for (const codigo of pos.codigos) {
                    let codigoParaDecodificar = codigo;
                    // Si es EAN-14 (autoservicio), quitar el último 0
                    if (codigo.length === 14 && codigo.endsWith('0')) {
                        codigoParaDecodificar = codigo.slice(0, 13);
                    }
                    const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                    if (decodificado) {
                        resultados.push({
                            modelo: decodificado.modelo,
                            linea: decodificado.linea,
                            tipo: decodificado.tipo,
                            talla: decodificado.talla,
                            codigoOriginal: codigo,
                            posicionEscaneada: pos.posicion,
                            valido: true
                        });
                    } else {
                        // Intentar buscar por modelo (primeros 5 dígitos)
                        const modeloIntento = codigo.slice(0, 5);
                        const encontrado = core.buscarCodigoPrioritario(modeloIntento, '', '', lib);
                        if (encontrado) {
                            const tallaCode = codigo.slice(9, 12);
                            const tallaNum = parseInt(tallaCode);
                            let talla = '';
                            if (tallaNum % 10 === 5) talla = String(tallaNum / 10);
                            else talla = String(tallaNum / 10);
                            resultados.push({
                                modelo: encontrado.MODELO,
                                linea: encontrado.LINEA,
                                tipo: encontrado.TIPO,
                                talla: talla,
                                codigoOriginal: codigo,
                                posicionEscaneada: pos.posicion,
                                valido: true
                            });
                        } else {
                            resultados.push({
                                modelo: 'NO_DECODIFICADO',
                                linea: '?',
                                tipo: '?',
                                talla: '?',
                                codigoOriginal: codigo,
                                posicionEscaneada: pos.posicion,
                                valido: false
                            });
                        }
                    }
                }
            }
            
            return resultados;
        }

        // ==================== ASIGNAR POSICIONES ====================
        function asignarPosiciones(vrItems) {
            let posicion = 1;
            for (const item of vrItems) {
                if (item.cliente === '0000000000') {
                    item.posicionEsperada = null;
                    continue;
                }
                item.posicionEsperada = posicion;
                posicion++;
            }
            return vrItems;
        }

        // ==================== COMPARAR ====================
        function comparar(vrItems, scanItems) {
            const vrMap = new Map();
            for (const item of vrItems) {
                if (item.cliente === '0000000000') continue;
                const key = `${item.modelo}|${item.linea}|${item.tipo}|${item.talla}`;
                if (!vrMap.has(key)) {
                    vrMap.set(key, { ...item, cantidad: item.cantidad || 1 });
                } else {
                    vrMap.get(key).cantidad += item.cantidad || 1;
                }
            }
            
            const scanMap = new Map();
            for (const item of scanItems) {
                if (!item.valido) continue;
                const key = `${item.modelo}|${item.linea}|${item.tipo}|${item.talla}`;
                if (!scanMap.has(key)) {
                    scanMap.set(key, { ...item, cantidad: 1, posiciones: new Set([item.posicionEscaneada]) });
                } else {
                    const existing = scanMap.get(key);
                    existing.cantidad += 1;
                    existing.posiciones.add(item.posicionEscaneada);
                }
            }
            
            const incorrectos = [];
            const faltantes = [];
            
            for (const [key, vr] of vrMap.entries()) {
                const scan = scanMap.get(key);
                if (!scan) {
                    faltantes.push({
                        ...vr,
                        posicionEscaneada: null,
                        estado: 'FALTANTE',
                        key: key
                    });
                    continue;
                }
                
                const posicionesEscaneadas = Array.from(scan.posiciones);
                const posicionEsperada = vr.posicionEsperada;
                
                if (posicionEsperada === null) {
                    continue;
                }
                
                const enPosicionCorrecta = posicionesEscaneadas.includes(posicionEsperada);
                
                if (!enPosicionCorrecta) {
                    incorrectos.push({
                        ...vr,
                        posicionesEncontradas: posicionesEscaneadas.join(', '),
                        posicionEscaneada: posicionesEscaneadas[0] || '?',
                        cantidadEscaneada: scan.cantidad,
                        estado: 'POSICION_INCORRECTA',
                        key: key
                    });
                }
            }
            
            const sobrantes = [];
            for (const [key, scan] of scanMap.entries()) {
                if (!vrMap.has(key)) {
                    sobrantes.push({
                        ...scan,
                        estado: 'SOBRANTE_EN_ESCANEO',
                        key: key
                    });
                }
            }
            
            incorrectos.sort((a, b) => (a.posicionEsperada || 999) - (b.posicionEsperada || 999));
            faltantes.sort((a, b) => (a.posicionEsperada || 999) - (b.posicionEsperada || 999));
            
            return { incorrectos, faltantes, sobrantes };
        }

        // ==================== PROCESAR PRINCIPAL ====================
        function procesarVR() {
            const vrText = document.getElementById('vrInput').value;
            const scanText = document.getElementById('vrScanInput').value;
            const msgDiv = document.getElementById('vrMessage');
            const outputDiv = document.getElementById('vrOutput');
            const summaryDiv = document.getElementById('vrSummary');
            
            if (!vrText.trim()) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ingresa los datos de Ventas Reservadas.';
                return;
            }
            if (!scanText.trim()) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ingresa los códigos de escaneo.';
                return;
            }
            
            try {
                const vrItems = parsearDatosVR(vrText);
                if (vrItems.length === 0) {
                    msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron parsear los datos VR. Verifica que contengan "RECIBIDA" y el formato correcto.';
                    return;
                }
                
                const vrConPosiciones = asignarPosiciones(vrItems);
                vrData = vrConPosiciones;
                
                const scanItems = parsearEscaneo(scanText);
                if (scanItems.length === 0) {
                    msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron códigos válidos en el escaneo.';
                    return;
                }
                scanData = scanItems;
                
                const { incorrectos, faltantes, sobrantes } = comparar(vrConPosiciones, scanItems);
                resultados = incorrectos;
                resultadosFaltantes = faltantes;
                
                let summaryHtml = `
                    <b><i class="fas fa-chart-bar"></i> Resumen:</b><br>
                    Total VR procesados (con RECIBIDA): ${vrConPosiciones.filter(v => v.cliente !== '0000000000').length}<br>
                    <span style="color:#e74c3c;">Posiciones incorrectas: ${incorrectos.length}</span><br>
                    <span style="color:#f1c40f;">Faltantes en escaneo: ${faltantes.length}</span><br>
                    <span style="color:#3498db;">Sobrantes en escaneo (no en VR): ${sobrantes.length}</span>
                `;
                
                let html = '';
                if (incorrectos.length > 0) {
                    html += `<h4 style="color:#e74c3c;">🔴 Productos en posición incorrecta (${incorrectos.length})</h4>`;
                    html += renderTablaIncorrectos(incorrectos);
                } else {
                    html += `<p style="color:#2ecc71;">✅ Todos los productos están en la posición correcta.</p>`;
                }
                
                if (faltantes.length > 0) {
                    html += `<h4 style="color:#f1c40f; margin-top:1rem;">⚠️ Productos faltantes en escaneo (${faltantes.length})</h4>`;
                    html += renderTablaFaltantes(faltantes);
                }
                
                if (sobrantes.length > 0) {
                    html += `<h4 style="color:#3498db; margin-top:1rem;">📦 Productos sobrantes en escaneo (no están en VR) (${sobrantes.length})</h4>`;
                    html += renderTablaSobrantes(sobrantes);
                }
                
                outputDiv.innerHTML = html;
                summaryDiv.innerHTML = summaryHtml;
                msgDiv.innerHTML = `<i class="fas fa-check-circle"></i> Procesamiento completado. Se encontraron ${incorrectos.length} incorrectos y ${faltantes.length} faltantes.`;
                
                window.vrResultados = {
                    incorrectos,
                    faltantes,
                    sobrantes,
                    vrData: vrConPosiciones,
                    scanData
                };
                
            } catch (e) {
                msgDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${e.message}`;
                console.error(e);
            }
        }

        // ==================== RENDER TABLAS ====================
        function renderTablaIncorrectos(data) {
            if (!data.length) return '<p>Sin datos</p>';
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += `<thead><tr>
                <th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th>
                <th>POS. ESPERADA</th><th>POS. ENCONTRADA</th><th>CLIENTE</th>
            </tr></thead><tbody>`;
            for (const row of data) {
                html += `<tr style="background:#2a1a1a;">
                    <td>${row.modelo}</td>
                    <td>${row.linea}</td>
                    <td>${row.tipo}</td>
                    <td>${row.talla}</td>
                    <td style="color:#2ecc71; font-weight:bold;">${row.posicionEsperada}</td>
                    <td style="color:#e74c3c; font-weight:bold;">${row.posicionesEncontradas || row.posicionEscaneada}</td>
                    <td style="font-family:monospace;">${row.cliente}</td>
                </tr>`;
            }
            html += '</tbody></table>';
            return html;
        }

        function renderTablaFaltantes(data) {
            if (!data.length) return '<p>Sin datos</p>';
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += `<thead><tr>
                <th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th>
                <th>POS. ESPERADA</th><th>CLIENTE</th>
            </tr></thead><tbody>`;
            for (const row of data) {
                html += `<tr style="background:#2a2a1a;">
                    <td>${row.modelo}</td>
                    <td>${row.linea}</td>
                    <td>${row.tipo}</td>
                    <td>${row.talla}</td>
                    <td style="color:#f1c40f; font-weight:bold;">${row.posicionEsperada}</td>
                    <td style="font-family:monospace;">${row.cliente}</td>
                </tr>`;
            }
            html += '</tbody></table>';
            return html;
        }

        function renderTablaSobrantes(data) {
            if (!data.length) return '<p>Sin datos</p>';
            let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
            html += `<thead><tr>
                <th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th>
                <th>POS. ENCONTRADA</th><th>CÓDIGO</th>
            </tr></thead><tbody>`;
            for (const row of data) {
                html += `<tr style="background:#1a1a2a;">
                    <td>${row.modelo}</td>
                    <td>${row.linea}</td>
                    <td>${row.tipo}</td>
                    <td>${row.talla}</td>
                    <td style="color:#3498db; font-weight:bold;">${row.posicionEscaneada}</td>
                    <td style="font-family:monospace; font-size:0.7rem;">${row.codigoOriginal || ''}</td>
                </tr>`;
            }
            html += '</tbody></table>';
            return html;
        }

        // ==================== FUNCIONES PARA CSV Y AHK ====================
        function getIncorrectosFlat() {
            const data = window.vrResultados?.incorrectos || [];
            return data.map(r => ({
                MODELO: r.modelo,
                LINEA: r.linea,
                TIPO: r.tipo,
                TALLA: r.talla,
                POSICION_ESPERADA: r.posicionEsperada,
                POSICION_ENCONTRADA: r.posicionesEncontradas || r.posicionEscaneada,
                CLIENTE: r.cliente
            }));
        }

        function getFaltantesFlat() {
            const data = window.vrResultados?.faltantes || [];
            return data.map(r => ({
                MODELO: r.modelo,
                LINEA: r.linea,
                TIPO: r.tipo,
                TALLA: r.talla,
                POSICION_ESPERADA: r.posicionEsperada,
                CLIENTE: r.cliente
            }));
        }

        function generarAHKDesdeIncorrectos() {
            const data = window.vrResultados?.incorrectos || [];
            if (!data.length) return null;
            
            const lib = core.obtenerBiblioteca();
            const codigosConCantidad = [];
            
            for (const item of data) {
                const encontrado = core.buscarCodigoPrioritario(item.modelo, item.linea, item.tipo, lib);
                if (encontrado) {
                    const codigo = core.generarCodigoEAN13(encontrado.CODIGO, item.talla);
                    codigosConCantidad.push({ codigo: codigo, cantidad: 1 });
                }
            }
            
            if (codigosConCantidad.length === 0) return null;
            return core.generarAHKDesdeCodigosConCantidad(codigosConCantidad, `Productos en posición incorrecta (${codigosConCantidad.length})`);
        }

        function generarAHKDesdeFaltantes() {
            const data = window.vrResultados?.faltantes || [];
            if (!data.length) return null;
            
            const lib = core.obtenerBiblioteca();
            const codigosConCantidad = [];
            
            for (const item of data) {
                const encontrado = core.buscarCodigoPrioritario(item.modelo, item.linea, item.tipo, lib);
                if (encontrado) {
                    const codigo = core.generarCodigoEAN13(encontrado.CODIGO, item.talla);
                    codigosConCantidad.push({ codigo: codigo, cantidad: 1 });
                }
            }
            
            if (codigosConCantidad.length === 0) return null;
            return core.generarAHKDesdeCodigosConCantidad(codigosConCantidad, `Productos faltantes (${codigosConCantidad.length})`);
        }

        function actualizarNombreArchivo() {
            const ahora = new Date();
            const fecha = `${ahora.getFullYear()}${String(ahora.getMonth()+1).padStart(2,'0')}${String(ahora.getDate()).padStart(2,'0')}`;
            document.getElementById('vrFilename').value = `depuracion_vr_${fecha}.csv`;
        }

        // ==================== EVENTOS ====================
        document.getElementById('vrProcessBtn').addEventListener('click', procesarVR);
        
        document.getElementById('vrCopyTsvBtn').addEventListener('click', () => {
            const data = getIncorrectosFlat();
            if (!data.length) {
                document.getElementById('vrCopyFeedback').textContent = 'Sin datos';
                setTimeout(() => document.getElementById('vrCopyFeedback').textContent = '', 1500);
                return;
            }
            const content = core.dfToCsv(data, '\t', true, true);
            core.copiarTexto(content, 'vrCopyFeedback');
        });
        
        document.getElementById('vrCopyCsvBtn').addEventListener('click', () => {
            const data = getIncorrectosFlat();
            if (!data.length) {
                document.getElementById('vrCopyFeedback').textContent = 'Sin datos';
                setTimeout(() => document.getElementById('vrCopyFeedback').textContent = '', 1500);
                return;
            }
            const content = core.dfToCsv(data, ',', true, true);
            core.copiarTexto(content, 'vrCopyFeedback');
        });
        
        document.getElementById('vrDownloadBtn').addEventListener('click', () => {
            const data = getIncorrectosFlat();
            if (!data.length) return;
            let filename = document.getElementById('vrFilename').value.trim() || 'depuracion_vr.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            const content = core.dfToCsv(data, ',', true, true);
            core.downloadCsv(content, filename);
        });
        
        document.getElementById('vrDownloadAhkBtn').addEventListener('click', () => {
            const ahk = generarAHKDesdeIncorrectos();
            if (!ahk) {
                document.getElementById('vrMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay productos en posición incorrecta o no se pudieron generar códigos.';
                return;
            }
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `incorrectos_vr_${core.generarNombreFecha('ahk')}`;
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('vrMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK de incorrectos descargado.`;
            setTimeout(() => { if (document.getElementById('vrMessage').innerHTML.includes('AHK')) document.getElementById('vrMessage').innerHTML = ''; }, 3000);
        });
        
        document.getElementById('vrCopyAhkBtn').addEventListener('click', () => {
            const ahk = generarAHKDesdeIncorrectos();
            if (!ahk) {
                document.getElementById('vrMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay productos en posición incorrecta.';
                return;
            }
            core.copiarTexto(ahk, 'vrCopyFeedback');
        });
        
        document.getElementById('vrDownloadAhkFaltantesBtn').addEventListener('click', () => {
            const ahk = generarAHKDesdeFaltantes();
            if (!ahk) {
                document.getElementById('vrMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay productos faltantes.';
                return;
            }
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faltantes_vr_${core.generarNombreFecha('ahk')}`;
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('vrMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK de faltantes descargado.`;
            setTimeout(() => { if (document.getElementById('vrMessage').innerHTML.includes('AHK')) document.getElementById('vrMessage').innerHTML = ''; }, 3000);
        });

        // ==================== LIMPIAR ====================
        const clearBtn = container.querySelector('.clear-module-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('vrInput').value = '';
                document.getElementById('vrScanInput').value = '';
                document.getElementById('vrOutput').innerHTML = '';
                document.getElementById('vrMessage').innerHTML = '';
                document.getElementById('vrSummary').innerHTML = '';
                document.getElementById('vrCopyFeedback').textContent = '';
                window.vrResultados = null;
                vrData = [];
                scanData = [];
                resultados = [];
                resultadosFaltantes = [];
                actualizarNombreArchivo();
            });
        }

        actualizarNombreArchivo();
    }
})();