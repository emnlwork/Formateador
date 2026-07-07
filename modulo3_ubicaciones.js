// Módulo Ubicaciones (Detector + Existencia) - v3.1
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab3');
    if (!container) return;

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

    // ========== FUNCIÓN PARA PROCESAR TEXTO UNIVERSAL ==========
    function procesarTextoUniversal(texto) {
        if (!texto || !texto.trim()) return [];
        
        const parsed = core.parsearTextoUniversal(texto);
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

    // ========== FUNCIÓN DRAG AND DROP ==========
    function setupDragAndDrop(textarea, messageDiv) {
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
            const validExtensions = ['txt', 'csv', 'log', 'dat'];
            
            if (!validExtensions.includes(extension)) {
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Archivo no soportado. Solo se permiten .txt, .csv, .log, .dat';
                    setTimeout(function() {
                        if (messageDiv.innerHTML.includes('no soportado')) messageDiv.innerHTML = '';
                    }, 3000);
                }
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(ev) {
                textarea.value = ev.target.result;
                textarea.dispatchEvent(new Event('input'));
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Archivo "' + file.name + '" cargado correctamente (' + (file.size / 1024).toFixed(1) + ' KB)';
                    setTimeout(function() {
                        if (messageDiv.innerHTML.includes('cargado correctamente')) {
                            messageDiv.innerHTML = '';
                        }
                    }, 3000);
                }
            };
            reader.onerror = function() {
                if (messageDiv) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el archivo "' + file.name + '"';
                }
            };
            reader.readAsText(file);
        });
    }

    // ========== RENDERIZAR TABLA CON FILTRO DE POSICIÓN INTEGRADO ==========
    function renderTablaUbicaciones(data, filtroTexto) {
        if (!data || !data.length) {
            return '<p style="color:#666;">Sin resultados. Realiza una búsqueda.</p>';
        }
        
        // Aplicar filtro de posición si existe
        let datosFiltrados = data;
        let mensajeFiltro = '';
        
        if (filtroTexto && filtroTexto.trim()) {
            const posicionesFiltro = parsearFiltroPosicion(filtroTexto);
            if (posicionesFiltro) {
                datosFiltrados = data.filter(function(r) {
                    const posNum = (r.POSICION || '').match(/\d+/);
                    if (!posNum) return false;
                    return posicionesFiltro.has(posNum[0]);
                });
                mensajeFiltro = '<div style="background:rgba(241,196,15,0.1); border:1px solid #f1c40f; border-radius:4px; padding:0.3rem 0.6rem; margin-bottom:0.5rem; font-size:0.75rem; color:#f1c40f;">';
                mensajeFiltro += '<i class="fas fa-filter"></i> Filtrado por posición: <strong>' + filtroTexto + '</strong> - ';
                mensajeFiltro += datosFiltrados.length + ' resultados de ' + data.length + ' totales';
                if (datosFiltrados.length === 0) {
                    mensajeFiltro += ' <span style="color:#e74c3c;">(sin coincidencias)</span>';
                }
                mensajeFiltro += '</div>';
            }
        }
        
        if (datosFiltrados.length === 0) {
            return mensajeFiltro + '<p style="color:#e74c3c;">No hay resultados para la posición seleccionada.</p>';
        }
        
        const headers = Object.keys(datosFiltrados[0]);
        let html = mensajeFiltro;
        html += '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.75rem;">';
        html += '<thead><tr>';
        headers.forEach(function(h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        
        datosFiltrados.forEach(function(r) {
            html += '<tr>';
            headers.forEach(function(h) {
                let val = r[h] !== undefined && r[h] !== null ? r[h] : '';
                if (h === 'POSICION' && val) {
                    html += '<td style="font-weight:bold; color:#f1c40f;">' + val + '</td>';
                } else {
                    html += '<td>' + val + '</td>';
                }
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    // ========== PARSEAR FILTRO DE POSICIÓN ==========
    function parsearFiltroPosicion(texto) {
        if (!texto || !texto.trim()) return null;
        
        const posiciones = new Set();
        const partes = texto.split(',').map(function(p) { return p.trim(); });
        for (var i = 0; i < partes.length; i++) {
            var parte = partes[i];
            if (parte.includes('-')) {
                var rango = parte.split('-').map(Number);
                var inicio = rango[0];
                var fin = rango[1];
                if (!isNaN(inicio) && !isNaN(fin) && inicio > 0 && fin >= inicio) {
                    for (var j = inicio; j <= fin; j++) {
                        posiciones.add(String(j));
                    }
                }
            } else {
                var num = Number(parte);
                if (!isNaN(num) && num > 0) {
                    posiciones.add(String(num));
                }
            }
        }
        return posiciones.size > 0 ? posiciones : null;
    }

    // ========== FUNCIÓN PARA ACTUALIZAR OUTPUT CON FILTRO ==========
    function actualizarOutputConFiltro(data, filtroTexto, outputDiv) {
        if (!outputDiv) return;
        if (!data || !data.length) {
            outputDiv.innerHTML = '<p style="color:#666;">Sin resultados. Realiza una búsqueda.</p>';
            return;
        }
        outputDiv.innerHTML = renderTablaUbicaciones(data, filtroTexto);
    }

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-map-pin"></i> Ubicaciones</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v3.1</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
            <div class="sub-module-tabs" id="ubicacionesSubTabs">
                <div class="sub-module-tab active" data-submode="detector">Detector</div>
                <div class="sub-module-tab" data-submode="existencia">Existencia</div>
            </div>

            <!-- ========== DETECTOR ========== -->
            <div id="ubicacionDetector" class="sub-panel active">
                <div style="border:2px solid var(--blu); border-radius:6px; padding:0.8rem; margin-bottom:1rem;">
                    <!-- CONTROLES UNIFICADOS -->
                    <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.8rem; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                        <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                            <input type="checkbox" class="autocompletarCheckbox" checked style="width:16px; height:16px; accent-color:#2ecc71;"> 
                            <strong style="color:#2ecc71; font-size:0.8rem;"><i class="fas fa-sync-alt"></i> Autocompletar</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                            <input type="checkbox" class="autoservicioCheckbox" style="width:16px; height:16px; accent-color:#ffa500;"> 
                            <strong style="color:#ffa500; font-size:0.8rem;"><i class="fas fa-plus-circle"></i> Autoservicio</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                            <input type="checkbox" class="modoModeloCheckbox" style="width:16px; height:16px; accent-color:#8b00ff;"> 
                            <strong style="color:#8b00ff; font-size:0.8rem;"><i class="fas fa-layer-group"></i> Modo Modelo</strong>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                            <input type="checkbox" class="ticketModeCheckbox" style="width:16px; height:16px; accent-color:#3498db;"> 
                            <strong style="color:#3498db; font-size:0.8rem;"><i class="fas fa-ticket-alt"></i> Modo Ticket</strong>
                        </label>
                    </div>

                    <!-- INPUTS -->
                    <div style="margin-bottom:0.8rem;">
                        <label style="font-size:0.85rem;"><b>Lista de modelos (pega texto o sube archivo):</b></label>
                        <textarea id="modelosInput" placeholder="Pega la lista de modelos..." rows="4" style="font-size:0.75rem; font-family:monospace;"></textarea>
                        <div class="row" style="margin-top:0.3rem;">
                            <button id="uploadModelosBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-folder-open"></i> Subir archivo</button>
                            <input type="file" id="modelosFile" accept=".csv,.txt" style="display:none;">
                            <span style="font-size:0.65rem; color:var(--grayl);">Formatos: Formato 1, Formato 2, CSV, EAN-13/14</span>
                        </div>
                    </div>

                    <div style="margin-bottom:0.8rem;">
                        <label style="font-size:0.85rem;"><b>Archivo de posiciones (Posicion.txt):</b></label>
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                            <button id="posFileUploadBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-upload"></i> Subir Posicion.txt</button>
                            <input type="file" id="posFileUpload" accept=".txt" style="display:none;">
                            <span id="archivoEstado" style="font-size:0.7rem; color:var(--grayl);"></span>
                        </div>
                    </div>

                    <!-- TIPO DE BÚSQUEDA Y FILTRO DE POSICIÓN (mejorado UI) -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-bottom:0.8rem;">
                        <div>
                            <label style="font-size:0.85rem;"><b>Tipo de búsqueda:</b></label>
                            <select id="searchType" style="width:100%; font-size:0.75rem; padding:0.2rem 0.4rem;">
                                <option value="integridad">INTEGRIDAD</option>
                                <option value="bodega">BODEGA AUTOSERVICIO / POS 699</option>
                                <option value="piso_general">PISO GENERAL (POSICION 1-99)</option>
                                <option value="reporte_completo">REPORTE COMPLETO</option>
                                <option value="contenedor">CONTENEDOR (mostrar contenedor)</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.85rem;"><b><i class="fas fa-filter"></i> Filtrar por posición:</b></label>
                            <div style="display:flex; gap:0.3rem; align-items:center;">
                                <input type="text" id="posicionFiltroInput" placeholder="Ej: 14, 1-30, 14,30-40" style="flex:1; font-size:0.75rem; padding:0.2rem 0.4rem;">
                                <button id="aplicarFiltroBtn" style="font-size:0.65rem; padding:0.15rem 0.4rem; background:#f1c40f; border-color:#f1c40f; color:#000;"><i class="fas fa-check"></i> Aplicar</button>
                                <button id="limpiarFiltroBtn" style="font-size:0.65rem; padding:0.15rem 0.4rem; background:#444; border-color:#444;"><i class="fas fa-times"></i></button>
                            </div>
                            <div style="font-size:0.6rem; color:var(--grayl); margin-top:0.1rem;">
                                <i class="fas fa-info-circle"></i> Ejemplos: "14" (una posición), "1-30" (rango), "14,30-40" (múltiples)
                            </div>
                        </div>
                    </div>

                    <!-- BOTONES -->
                    <div class="row" style="margin:0.5rem 0; flex-wrap:wrap; gap:0.3rem;">
                        <button id="searchUbicacionBtn" class="btn-primary" style="padding:0.3rem 0.8rem; font-size:0.85rem;"><i class="fas fa-search"></i> Buscar</button>
                        <button id="copyUbicacionTsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyUbicacionCsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="ubicacionFilename" value="ubicaciones.csv" style="width:200px; font-size:0.7rem; padding:0.15rem 0.4rem;">
                        <button id="downloadUbicacionBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="ubicacionCopyFeedback" style="font-size:0.7rem;"></span>
                    </div>
                    <div class="row" style="margin-top:0.3rem; flex-wrap:wrap; gap:0.3rem;">
                        <button id="downloadAhkUbicacionBtn" style="background:#ffa500; border-color:#ffa500; font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-code"></i> AHK por Ubicación</button>
                        <button id="downloadAhkRestantesBtn" style="background:#ffa500; border-color:#ffa500; font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-code"></i> AHK Restantes</button>
                        <button id="copyAhkUbicacionBtn" style="background:#444; border-color:#ffa500; font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar AHK por Ubicación</button>
                        <button id="copyAhkRestantesBtn" style="background:#444; border-color:#ffa500; font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar AHK Restantes</button>
                    </div>

                    <div id="ubicacionMessage" class="message" style="font-size:0.85rem; padding:0.4rem 0.8rem;"></div>
                    <div id="ubicacionOutput" class="output-area" style="max-height:500px; overflow:auto; font-size:0.75rem;"></div>
                </div>

                <div class="instructions-box" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Detector de Ubicación</b><br>
                    1. Pega la lista de modelos.<br>
                    2. Carga Posicion.txt (se guarda automáticamente).<br>
                    3. Selecciona tipo y pulsa Buscar.<br>
                    <b>AUTOCOMPLETAR:</b> agrega automáticamente la ubicación encontrada.<br>
                    <b>AUTOSERVICIO:</b> añade un 0 al final del código EAN-13 (13 → 14 dígitos).<br>
                    <b>MODO MODELO:</b> agrupa por modelo, línea, tipo (sin tallas).<br>
                    <b>FILTRO POR POSICIÓN:</b> escribe "14" para una posición, "1-30" para rango, "14,30-40" para múltiples.<br>
                    <b>MODO TICKET:</b> exporta solo MODELO, LINEA, TIPO, TALLA, CANTIDAD.<br>
                    <b>AHK:</b> genera script con los códigos EAN-13 correspondientes.
                </div>
            </div>

            <!-- ========== EXISTENCIA ========== -->
            <div id="ubicacionExistencia" class="sub-panel">
                <div style="border:2px solid var(--blu); border-radius:6px; padding:0.8rem; margin-bottom:1rem;">
                    <h4 style="color:#f1c40f; margin:0 0 0.5rem 0;"><i class="fas fa-location-dot"></i> Ubicaciones (prioridad de izquierda a derecha)</h4>
                    <div id="locationsContainer">
                        <div class="location-tabs" id="locationTabsContainer"></div>
                        <div style="margin-top:0.5rem;" id="locationPanelsContainer"></div>
                    </div>
                    <div class="row" style="margin-top:0.3rem;">
                        <button id="addLocationBtn" class="add-location-btn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-plus"></i> Agregar ubicación</button>
                    </div>

                    <h4 style="color:#2ecc71; margin:1rem 0 0.5rem 0;"><i class="fas fa-qrcode"></i> Escaneado (formato universal)</h4>
                    <textarea id="scanInput" placeholder="Pega aquí el escaneado (formato 1, 2, CSV, EAN-13/14)..." rows="4" style="font-size:0.75rem; font-family:monospace;"></textarea>
                    <div class="row" style="margin-top:0.3rem;">
                        <button id="uploadScanBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-folder-open"></i> Subir archivo</button>
                        <input type="file" id="scanFile" accept=".csv,.txt" style="display:none;">
                    </div>

                    <div style="display:flex; align-items:center; gap:0.8rem; margin:0.8rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                        <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                            <input type="checkbox" id="sortByPriorityCheckbox" style="width:16px; height:16px; accent-color:#f1c40f;"> 
                            <strong style="color:#f1c40f; font-size:0.8rem;"><i class="fas fa-sort"></i> Ordenar por prioridad</strong>
                        </label>
                    </div>

                    <div class="row" style="margin:0.5rem 0; flex-wrap:wrap; gap:0.3rem;">
                        <button id="processExistenciaBtn" class="btn-primary" style="padding:0.3rem 0.8rem; font-size:0.85rem;"><i class="fas fa-play"></i> Procesar asignación</button>
                        <button id="copyExistenciaTsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-copy"></i> Copiar TSV</button>
                        <button id="copyExistenciaCsvBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                        <input type="text" id="existenciaFilename" value="existencia.csv" style="width:200px; font-size:0.7rem; padding:0.15rem 0.4rem;">
                        <button id="downloadExistenciaBtn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-download"></i> Descargar CSV</button>
                        <span class="copy-feedback" id="existenciaCopyFeedback" style="font-size:0.7rem;"></span>
                    </div>

                    <div id="existenciaMessage" class="message" style="font-size:0.85rem; padding:0.4rem 0.8rem;"></div>
                    <div id="existenciaSummary" class="message" style="background:#1a2a1a; border-color:#2ecc71; font-size:0.85rem; padding:0.4rem 0.8rem; display:none;"></div>
                    <div id="existenciaOutput" class="output-area" style="max-height:400px; overflow:auto; font-size:0.75rem;"></div>
                </div>

                <div class="instructions-box" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Existencia en Ubicaciones</b><br>
                    1. Agrega ubicaciones con el botón <span style="color:#ff8888;">+</span>. Cada ubicación tiene un stock.<br>
                    2. Cambia el nombre con doble clic sobre su pestaña.<br>
                    3. Usa ⬆️ / ⬇️ para cambiar la prioridad.<br>
                    4. Marca/desmarca el checkbox para incluirla.<br>
                    5. Pega el escaneado.<br>
                    6. Haz clic en Procesar asignación.<br>
                    7. Los resultados muestran qué ubicación se asignó a cada modelo/talla.
                </div>
            </div>
        </div>
    `;

    // ========== VARIABLES GLOBALES ==========
    let posicionesData = null;
    var STORAGE_KEY = 'posicion_txt_content';
    var resultadosUbicacion = null;
    var todosLosModelos = null;
    var ahkUbicacion = null;
    var ahkRestantes = null;

    // ========== FUNCIONES DE POSICION ==========
    function guardarPosicionLocal(content) {
        if (content) {
            localStorage.setItem(STORAGE_KEY, content);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function cargarPosicionLocal() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            posicionesData = saved;
            document.getElementById('archivoEstado').textContent = 'Archivo cargado (desde almacenamiento local)';
        } else {
            posicionesData = null;
            document.getElementById('archivoEstado').textContent = '';
        }
    }

    // ========== PARSEAR POSICIONES ==========
    function parsearPosiciones(texto) {
        var lineas = texto.split('\n');
        var datosPos = [];
        var empezar = false;
        for (var i = 0; i < lineas.length; i++) {
            var limpia = lineas[i].trim();
            if (!empezar && limpia.includes('--------')) { empezar = true; continue; }
            if (!empezar) continue;
            if (limpia.includes('--------') || limpia.startsWith('Total:')) continue;
            if (!limpia) continue;
            var match = limpia.match(/^\s*(\d+)\s+([A-Z0-9]{2,3})\s+([A-Z0-9]{2,4})\s+(.+?)\s*$/i);
            if (match) {
                datosPos.push({
                    modelo: match[1],
                    color: match[2].toUpperCase(),
                    material: match[3].toUpperCase(),
                    posicion: match[4].replace(/[^\w\s]/g, '').trim().toUpperCase()
                });
            }
        }
        return datosPos;
    }

    // ========== OBTENER POSICIÓN FINAL ==========
    function obtenerPosicionFinal(posicionesArray, tipo) {
        if (!posicionesArray || posicionesArray.length === 0) return null;
        
        if (tipo === 'integridad') {
            var integridad = posicionesArray.filter(function(p) { return p.includes('INTEGRIDAD'); });
            if (integridad.length) return 'INTEGRIDAD';
        }
        if (tipo === 'bodega') {
            var bodega = posicionesArray.filter(function(p) { 
                return p.includes('BODEGA AUTOSERVICIO') || p.includes('POS AUTOSERVICIO 699'); 
            });
            if (bodega.length) return 'BODEGA AUTOSERVICIO / POS 699';
        }
        if (tipo === 'piso_general') {
            var pisos = posicionesArray.filter(function(p) { return /^POSICION\s+([1-9]|[1-9][0-9])$/.test(p); });
            if (pisos.length) return pisos.join(', ');
            return null;
        }
        if (tipo === 'reporte_completo') {
            var pisoRegex = /^POSICION\s+([1-9]|[1-9][0-9])$/;
            var piso = posicionesArray.find(function(p) { return pisoRegex.test(p); });
            if (piso) return piso;
            var bodega2 = posicionesArray.find(function(p) { 
                return p.includes('BODEGA AUTOSERVICIO') || p.includes('POS AUTOSERVICIO 699'); 
            });
            if (bodega2) return bodega2;
            return posicionesArray[0];
        }
        return posicionesArray[0];
    }

    // ========== GENERAR AHK DESDE MODELOS ==========
    function generarAHKDesdeModelos(modelos, titulo) {
        if (!modelos || modelos.length === 0) return null;
        var lib = core.obtenerBiblioteca();
        var autoservicioCheckbox = document.querySelector('.autoservicioCheckbox');
        var autoservicio = autoservicioCheckbox ? autoservicioCheckbox.checked : false;
        var codigosConCantidad = [];
        
        for (var i = 0; i < modelos.length; i++) {
            var item = modelos[i];
            var encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (!encontrado) {
                encontrado = lib.find(function(reg) { 
                    return String(reg.MODELO).trim() === String(item.MODELO).trim(); 
                });
            }
            if (encontrado) {
                var talla = item.TALLA || '';
                var codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, talla, item.MODELO);
                if (autoservicio) {
                    codigoEAN13 = codigoEAN13 + '0';
                }
                var cantidad = parseInt(item.CANTIDAD) || 1;
                codigosConCantidad.push({ codigo: codigoEAN13, cantidad: cantidad });
            }
        }
        if (codigosConCantidad.length === 0) return null;
        
        var codigosExpandidos = [];
        for (var j = 0; j < codigosConCantidad.length; j++) {
            var c = codigosConCantidad[j];
            for (var k = 0; k < c.cantidad; k++) {
                codigosExpandidos.push(c.codigo);
            }
        }
        return generarAHKDesdeCodigos(codigosExpandidos, titulo);
    }

    // ========== BUSCADOR DE UBICACIONES ==========
    document.getElementById('searchUbicacionBtn').addEventListener('click', function() {
        var textoModelos = document.getElementById('modelosInput').value;
        var msgDiv = document.getElementById('ubicacionMessage');
        var outputDiv = document.getElementById('ubicacionOutput');
        
        if (!textoModelos.trim() || !posicionesData) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega los modelos y carga el archivo de posiciones.';
            outputDiv.innerHTML = '';
            return;
        }
        
        try {
            var tipo = document.getElementById('searchType').value;
            var autocompletarCheckbox = document.querySelector('.autocompletarCheckbox');
            var autocompletar = autocompletarCheckbox ? autocompletarCheckbox.checked : true;
            var modoModeloCheckbox = document.querySelector('.modoModeloCheckbox');
            var modoModelo = modoModeloCheckbox ? modoModeloCheckbox.checked : false;
            
            // Procesar modelos
            var items = procesarTextoUniversal(textoModelos);
            if (!items.length) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron interpretar los modelos.';
                outputDiv.innerHTML = '';
                return;
            }
            
            // Parsear posiciones
            var datosPos = parsearPosiciones(posicionesData);
            if (!datosPos.length) {
                msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se parsearon posiciones.';
                outputDiv.innerHTML = '';
                return;
            }
            
            var posicionesPorModelo = new Map();
            for (var p = 0; p < datosPos.length; p++) {
                var item = datosPos[p];
                var key = item.modelo + '|' + item.color + '|' + item.material;
                if (!posicionesPorModelo.has(key)) posicionesPorModelo.set(key, []);
                posicionesPorModelo.get(key).push(item.posicion);
            }
            
            var resultados = [];
            var todosLosModelosArr = [];
            
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var key = item.MODELO + '|' + item.LINEA + '|' + item.TIPO;
                var posicionesArray = posicionesPorModelo.get(key);
                
                if (!posicionesArray || posicionesArray.length === 0) continue;
                
                var posicionFinal = '';
                if (tipo === 'contenedor') {
                    posicionFinal = 'CONTENEDOR';
                } else {
                    posicionFinal = obtenerPosicionFinal(posicionesArray, tipo);
                }
                
                if (!posicionFinal) continue;
                
                var resultadoItem = {
                    MODELO: item.MODELO,
                    LINEA: item.LINEA,
                    TIPO: item.TIPO,
                    TALLA: item.TALLA || '',
                    CANTIDAD: item.CANTIDAD || 1,
                    POSICION: posicionFinal
                };
                
                if (autocompletar) {
                    var textoCompletado = item.MODELO + ' ' + item.LINEA + ' ' + item.TIPO + ' ' + item.TALLA + ' ' + posicionFinal;
                    document.getElementById('modelosInput').value += '\n' + textoCompletado;
                }
                
                resultados.push(resultadoItem);
                todosLosModelosArr.push({ MODELO: item.MODELO, LINEA: item.LINEA, TIPO: item.TIPO });
            }
            
            // Aplicar modo modelo
            if (modoModelo) {
                var agrupados = new Map();
                for (var r = 0; r < resultados.length; r++) {
                    var row = resultados[r];
                    var groupKey = row.MODELO + '|' + row.LINEA + '|' + row.TIPO;
                    if (agrupados.has(groupKey)) {
                        var existing = agrupados.get(groupKey);
                        existing.CANTIDAD += row.CANTIDAD;
                        var tallasSet = new Set();
                        if (existing.TALLA) {
                            existing.TALLA.split(',').forEach(function(t) { if (t) tallasSet.add(t); });
                        }
                        if (row.TALLA) tallasSet.add(row.TALLA);
                        existing.TALLA = Array.from(tallasSet).join(', ');
                    } else {
                        agrupados.set(groupKey, {
                            MODELO: row.MODELO,
                            LINEA: row.LINEA,
                            TIPO: row.TIPO,
                            TALLA: row.TALLA || '',
                            CANTIDAD: row.CANTIDAD,
                            POSICION: row.POSICION
                        });
                    }
                }
                resultados = Array.from(agrupados.values());
            }
            
            // Ordenar
            resultados.sort(function(a, b) {
                return (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0);
            });
            
            window.resultadosUbicacion = resultados;
            window.todosLosModelos = todosLosModelosArr;
            
            // Mostrar con filtro aplicado
            var filtroTexto = document.getElementById('posicionFiltroInput').value;
            outputDiv.innerHTML = renderTablaUbicaciones(resultados, filtroTexto);
            
            var totalUnidades = resultados.reduce(function(s, r) { return s + (parseInt(r.CANTIDAD) || 0); }, 0);
            msgDiv.innerHTML = '<i class="fas fa-check-circle"></i> <b>' + resultados.length + '</b> modelos encontrados. Unidades totales: <b>' + totalUnidades + '</b>.';
            
            // Generar AHKs
            var ahkPorTipo = generarAHKDesdeModelos(resultados, 'Ubicación (' + resultados.length + ' productos)');
            window.ahkUbicacion = ahkPorTipo;
            
            var resultadosSet = new Set();
            for (var s = 0; s < resultados.length; s++) {
                resultadosSet.add(resultados[s].MODELO + '|' + resultados[s].LINEA + '|' + resultados[s].TIPO);
            }
            var restantes = todosLosModelosArr.filter(function(m) {
                var key = m.MODELO + '|' + m.LINEA + '|' + m.TIPO;
                return !resultadosSet.has(key);
            });
            var ahkRest = generarAHKDesdeModelos(restantes, 'Restantes (' + restantes.length + ' productos)');
            window.ahkRestantes = ahkRest;
            
        } catch (e) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: ' + e.message;
            console.error(e);
        }
    });

    // ========== FILTRO DE POSICIÓN EN EL OUTPUT ==========
    document.getElementById('aplicarFiltroBtn').addEventListener('click', function() {
        var filtroTexto = document.getElementById('posicionFiltroInput').value;
        var outputDiv = document.getElementById('ubicacionOutput');
        var data = window.resultadosUbicacion;
        if (!data || !data.length) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Primero realiza una búsqueda.';
            return;
        }
        if (!filtroTexto.trim()) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-info-circle"></i> Escribe una posición o rango para filtrar.';
            return;
        }
        outputDiv.innerHTML = renderTablaUbicaciones(data, filtroTexto);
        document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-check-circle"></i> Filtro aplicado: <strong>' + filtroTexto + '</strong>';
    });

    document.getElementById('limpiarFiltroBtn').addEventListener('click', function() {
        document.getElementById('posicionFiltroInput').value = '';
        var outputDiv = document.getElementById('ubicacionOutput');
        var data = window.resultadosUbicacion;
        if (data && data.length) {
            outputDiv.innerHTML = renderTablaUbicaciones(data, '');
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-check-circle"></i> Filtro eliminado.';
        } else {
            outputDiv.innerHTML = '<p style="color:#666;">Sin resultados. Realiza una búsqueda.</p>';
        }
    });

    // Enter en el campo de filtro
    document.getElementById('posicionFiltroInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('aplicarFiltroBtn').click();
        }
    });

    // ========== AHK Y COPIA ==========
    function getTicketDataUbicacion() {
        if (!window.resultadosUbicacion) return [];
        var ticketMode = document.querySelector('.ticketModeCheckbox');
        var esTicket = ticketMode ? ticketMode.checked : false;
        if (esTicket) {
            return window.resultadosUbicacion.map(function(r) {
                return {
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA || '',
                    CANTIDAD: r.CANTIDAD
                };
            });
        }
        return window.resultadosUbicacion;
    }

    document.getElementById('copyUbicacionTsvBtn').addEventListener('click', function() {
        var data = getTicketDataUbicacion();
        if (!data || !data.length) {
            document.getElementById('ubicacionCopyFeedback').textContent = 'Sin datos';
            setTimeout(function() { document.getElementById('ubicacionCopyFeedback').textContent = ''; }, 1500);
            return;
        }
        var content = core.dfToCsv(data, '\t', true, true);
        core.copiarTexto(content, 'ubicacionCopyFeedback');
    });

    document.getElementById('copyUbicacionCsvBtn').addEventListener('click', function() {
        var data = getTicketDataUbicacion();
        if (!data || !data.length) {
            document.getElementById('ubicacionCopyFeedback').textContent = 'Sin datos';
            setTimeout(function() { document.getElementById('ubicacionCopyFeedback').textContent = ''; }, 1500);
            return;
        }
        var content = core.dfToCsv(data, ',', true, true);
        core.copiarTexto(content, 'ubicacionCopyFeedback');
    });

    document.getElementById('downloadUbicacionBtn').addEventListener('click', function() {
        var data = getTicketDataUbicacion();
        if (!data || !data.length) return;
        var filename = document.getElementById('ubicacionFilename').value.trim();
        if (!filename) filename = core.generarNombreFecha('csv');
        if (!filename.endsWith('.csv')) filename += '.csv';
        var content = core.dfToCsv(data, ',', true, true);
        core.downloadCsv(content, filename);
    });

    // ========== BOTONES AHK ==========
    document.getElementById('downloadAhkUbicacionBtn').addEventListener('click', function() {
        if (!window.ahkUbicacion) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay AHK para la ubicación seleccionada.';
            return;
        }
        var blob = new Blob([window.ahkUbicacion], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ubicacion_' + core.generarNombreFecha('ahk');
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('downloadAhkRestantesBtn').addEventListener('click', function() {
        if (!window.ahkRestantes) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay AHK de restantes.';
            return;
        }
        var blob = new Blob([window.ahkRestantes], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'restantes_' + core.generarNombreFecha('ahk');
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('copyAhkUbicacionBtn').addEventListener('click', function() {
        if (!window.ahkUbicacion) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay AHK para la ubicación.';
            return;
        }
        core.copiarTexto(window.ahkUbicacion, 'ubicacionCopyFeedback');
    });

    document.getElementById('copyAhkRestantesBtn').addEventListener('click', function() {
        if (!window.ahkRestantes) {
            document.getElementById('ubicacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay AHK de restantes.';
            return;
        }
        core.copiarTexto(window.ahkRestantes, 'ubicacionCopyFeedback');
    });

    // ========== UPLOAD POSICION ==========
    document.getElementById('posFileUploadBtn').addEventListener('click', function() {
        document.getElementById('posFileUpload').click();
    });

    document.getElementById('posFileUpload').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            var content = ev.target.result;
            posicionesData = content;
            guardarPosicionLocal(content);
            document.getElementById('archivoEstado').textContent = 'Archivo cargado y guardado localmente';
            setTimeout(function() {
                if (document.getElementById('archivoEstado').textContent === 'Archivo cargado y guardado localmente') {
                    document.getElementById('archivoEstado').textContent = 'Archivo cargado (desde almacenamiento local)';
                }
            }, 3000);
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ========== UPLOAD MODELOS ==========
    core.setupFileUpload('uploadModelosBtn', 'modelosFile', 'modelosInput');

    // ========== DRAG AND DROP ==========
    var modelosInput = document.getElementById('modelosInput');
    var msgDiv = document.getElementById('ubicacionMessage');
    setupDragAndDrop(modelosInput, msgDiv);
    setupDragAndDrop(document.getElementById('scanInput'), document.getElementById('existenciaMessage'));

    // ========== CARGAR POSICIÓN LOCAL ==========
    cargarPosicionLocal();

    // ========== SECCIÓN EXISTENCIA ==========
    var locationCounter = 1;
    var activeLocationId = null;
    var locationData = {};
    var currentExistenciaResults = null;

    function crearUbicacion(nombre) {
        var panelId = 'loc_panel_' + locationCounter++;
        var tabName = nombre || 'Ubicacion ' + locationCounter;
        var tabsContainer = document.getElementById('locationTabsContainer');
        var tabDiv = document.createElement('div');
        tabDiv.className = 'location-tab';
        tabDiv.dataset.panelId = panelId;
        tabDiv.innerHTML = '<span class="tab-name">' + core.escapeHtml(tabName) + '</span><span class="move-up" title="Mover arriba"><i class="fas fa-arrow-up"></i></span><span class="move-down" title="Mover abajo"><i class="fas fa-arrow-down"></i></span><span class="tab-close" title="Eliminar">✖</span>';
        tabsContainer.appendChild(tabDiv);
        var panelsContainer = document.getElementById('locationPanelsContainer');
        var panelDiv = document.createElement('div');
        panelDiv.id = panelId;
        panelDiv.className = 'location-panel';
        panelDiv.innerHTML = `
            <div class="checkbox-label">
                <input type="checkbox" class="include-location" checked style="width:16px; height:16px; accent-color:#2ecc71;"> 
                <b style="font-size:0.85rem;">Incluir esta ubicacion en el analisis</b>
            </div>
            <label style="font-size:0.85rem;"><b>Stock (formato universal):</b></label>
            <textarea class="stock-textarea" rows="4" placeholder="Pega aqui el stock de esta ubicacion..." style="font-size:0.75rem; font-family:monospace;"></textarea>
            <div class="row" style="margin-top:0.3rem;">
                <button class="upload-stock-btn" style="font-size:0.7rem; padding:0.2rem 0.6rem;"><i class="fas fa-folder-open"></i> Subir archivo</button>
                <input type="file" class="stock-file" accept=".csv,.txt" style="display:none;">
            </div>
        `;
        panelsContainer.appendChild(panelDiv);
        locationData[panelId] = { name: tabName, include: true, stockMap: new Map() };
        
        var nameSpan = tabDiv.querySelector('.tab-name');
        nameSpan.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            var oldName = nameSpan.textContent;
            var input = document.createElement('input');
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
            input.addEventListener('blur', function() {
                var newName = input.value.trim() || oldName;
                nameSpan.textContent = newName;
                locationData[panelId].name = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', function(e) { if (e.key === 'Enter') input.blur(); });
        });
        
        var chk = panelDiv.querySelector('.include-location');
        chk.addEventListener('change', function(e) { locationData[panelId].include = e.target.checked; });
        
        var uploadBtn = panelDiv.querySelector('.upload-stock-btn');
        var fileInput = panelDiv.querySelector('.stock-file');
        var stockTa = panelDiv.querySelector('.stock-textarea');
        uploadBtn.addEventListener('click', function() { fileInput.click(); });
        fileInput.addEventListener('change', function(e) {
            var f = e.target.files[0];
            if (!f) return;
            var reader = new FileReader();
            reader.onload = function(ev) { stockTa.value = ev.target.result; fileInput.value = ''; };
            reader.readAsText(f);
        });
        
        setupDragAndDrop(stockTa, document.getElementById('existenciaMessage'));
        
        var closeBtn = tabDiv.querySelector('.tab-close');
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            tabDiv.remove();
            panelDiv.remove();
            delete locationData[panelId];
            if (activeLocationId === panelId) {
                var firstTab = document.querySelector('#locationTabsContainer .location-tab');
                if (firstTab) firstTab.click();
            }
        });
        
        var upBtn = tabDiv.querySelector('.move-up');
        var downBtn = tabDiv.querySelector('.move-down');
        upBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var tabs = Array.from(tabsContainer.children);
            var idx = tabs.indexOf(tabDiv);
            if (idx > 0) tabsContainer.insertBefore(tabDiv, tabs[idx-1]);
        });
        downBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var tabs = Array.from(tabsContainer.children);
            var idx = tabs.indexOf(tabDiv);
            if (idx < tabs.length - 1) {
                if (idx + 1 < tabs.length) tabsContainer.insertBefore(tabDiv, tabs[idx+2]);
                else tabsContainer.appendChild(tabDiv);
            }
        });
        
        tabDiv.addEventListener('click', function(e) {
            if (e.target.classList.contains('move-up') || e.target.classList.contains('move-down') || e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('.location-tab').forEach(function(t) { t.classList.remove('active'); });
            tabDiv.classList.add('active');
            document.querySelectorAll('.location-panel').forEach(function(p) { p.classList.remove('active'); });
            panelDiv.classList.add('active');
            activeLocationId = panelId;
        });
        if (document.querySelectorAll('.location-tab').length === 1) tabDiv.click();
        return panelId;
    }

    function parsearStockPanel(texto) {
        var items = procesarTextoUniversal(texto);
        var map = new Map();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var key = item.MODELO + '|' + item.LINEA + '|' + item.TIPO + '|' + item.TALLA;
            map.set(key, (map.get(key) || 0) + (item.CANTIDAD || 1));
        }
        return map;
    }

    function ordenarPorPrioridadYModelo(results, locationOrder) {
        var priorityMap = new Map();
        for (var i = 0; i < locationOrder.length; i++) {
            priorityMap.set(locationOrder[i], i);
        }
        return results.sort(function(a, b) {
            var prioA = priorityMap.has(a.UBICACION) ? priorityMap.get(a.UBICACION) : Number.MAX_SAFE_INTEGER;
            var prioB = priorityMap.has(b.UBICACION) ? priorityMap.get(b.UBICACION) : Number.MAX_SAFE_INTEGER;
            if (prioA !== prioB) return prioA - prioB;
            return (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0);
        });
    }

    document.getElementById('processExistenciaBtn').addEventListener('click', function() {
        var scanText = document.getElementById('scanInput').value;
        var msgDiv = document.getElementById('existenciaMessage');
        var summaryDiv = document.getElementById('existenciaSummary');
        var outputDiv = document.getElementById('existenciaOutput');
        
        if (!scanText.trim()) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar el escaneado.';
            summaryDiv.style.display = 'none';
            return;
        }
        
        var scanItems = procesarTextoUniversal(scanText);
        if (scanItems.length === 0) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron items validos en el escaneado.';
            summaryDiv.style.display = 'none';
            return;
        }
        
        var tabs = Array.from(document.querySelectorAll('#locationTabsContainer .location-tab'));
        var orderedLocations = [];
        var locationNamesInOrder = [];
        
        for (var t = 0; t < tabs.length; t++) {
            var tab = tabs[t];
            var panelId = tab.dataset.panelId;
            var loc = locationData[panelId];
            if (!loc) continue;
            var includeCheckbox = document.getElementById(panelId).querySelector('.include-location');
            var include = includeCheckbox.checked;
            if (!include) continue;
            var stockTa = document.getElementById(panelId).querySelector('.stock-textarea');
            var stockMap = parsearStockPanel(stockTa.value);
            orderedLocations.push({ id: panelId, name: loc.name, stockMap: stockMap });
            locationNamesInOrder.push(loc.name);
        }
        
        if (orderedLocations.length === 0) {
            msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay ubicaciones incluidas.';
            summaryDiv.style.display = 'none';
            return;
        }
        
        var demandMap = new Map();
        for (var i = 0; i < scanItems.length; i++) {
            var item = scanItems[i];
            var key = item.MODELO + '|' + item.LINEA + '|' + item.TIPO + '|' + item.TALLA;
            demandMap.set(key, (demandMap.get(key) || 0) + (item.CANTIDAD || 1));
        }
        
        var assignments = [];
        var stocksCopy = orderedLocations.map(function(loc) {
            return { name: loc.name, stock: new Map(loc.stockMap) };
        });
        
        for (var [key, demanda] of demandMap) {
            var restante = demanda;
            for (var j = 0; j < stocksCopy.length && restante > 0; j++) {
                var loc = stocksCopy[j];
                var disponible = loc.stock.get(key) || 0;
                if (disponible > 0) {
                    var tomado = Math.min(restante, disponible);
                    assignments.push({ key: key, cantidad: tomado, ubicacion: loc.name });
                    restante -= tomado;
                    loc.stock.set(key, disponible - tomado);
                    if (loc.stock.get(key) === 0) loc.stock.delete(key);
                }
            }
            if (restante > 0) assignments.push({ key: key, cantidad: restante, ubicacion: "NO ENCONTRADA" });
        }
        
        var results = [];
        for (var a = 0; a < assignments.length; a++) {
            var ass = assignments[a];
            var parts = ass.key.split('|');
            results.push({
                MODELO: parts[0],
                LINEA: parts[1],
                TIPO: parts[2],
                TALLA: parts[3],
                CANTIDAD: ass.cantidad,
                UBICACION: ass.ubicacion
            });
        }
        
        var sortByPriority = document.getElementById('sortByPriorityCheckbox').checked;
        if (sortByPriority) {
            results = ordenarPorPrioridadYModelo(results, locationNamesInOrder);
        } else {
            results.sort(function(a, b) { return (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0); });
        }
        
        currentExistenciaResults = results;
        outputDiv.innerHTML = renderTablaUbicaciones(results, '');
        
        var summary = {};
        for (var r = 0; r < results.length; r++) {
            var row = results[r];
            summary[row.UBICACION] = (summary[row.UBICACION] || 0) + row.CANTIDAD;
        }
        var summaryHtml = '<strong>Resumen de asignacion:</strong><br>';
        for (var [ubi, cant] of Object.entries(summary)) {
            summaryHtml += ubi + ': ' + cant + ' unidades<br>';
        }
        summaryDiv.innerHTML = summaryHtml;
        summaryDiv.style.display = 'block';
        var totalItems = scanItems.reduce(function(s, it) { return s + (parseInt(it.CANTIDAD) || 1); }, 0);
        msgDiv.innerHTML = '<i class="fas fa-check-circle"></i> Asignacion completada. Total de items procesados: ' + totalItems + ' unidades.';
    });

    // ========== COPIAR Y DESCARGAR EXISTENCIA ==========
    document.getElementById('copyExistenciaTsvBtn').addEventListener('click', function() {
        if (!currentExistenciaResults) {
            document.getElementById('existenciaCopyFeedback').textContent = 'Sin datos';
            setTimeout(function() { document.getElementById('existenciaCopyFeedback').textContent = ''; }, 1500);
            return;
        }
        var content = core.dfToCsv(currentExistenciaResults, '\t', true, true);
        core.copiarTexto(content, 'existenciaCopyFeedback');
    });

    document.getElementById('copyExistenciaCsvBtn').addEventListener('click', function() {
        if (!currentExistenciaResults) {
            document.getElementById('existenciaCopyFeedback').textContent = 'Sin datos';
            setTimeout(function() { document.getElementById('existenciaCopyFeedback').textContent = ''; }, 1500);
            return;
        }
        var content = core.dfToCsv(currentExistenciaResults, ',', true, true);
        core.copiarTexto(content, 'existenciaCopyFeedback');
    });

    document.getElementById('downloadExistenciaBtn').addEventListener('click', function() {
        if (!currentExistenciaResults) return;
        var filename = document.getElementById('existenciaFilename').value.trim();
        if (!filename) filename = core.generarNombreFecha('csv');
        if (!filename.endsWith('.csv')) filename += '.csv';
        var content = core.dfToCsv(currentExistenciaResults, ',', true, true);
        core.downloadCsv(content, filename);
    });

    // ========== UPLOAD SCAN ==========
    core.setupFileUpload('uploadScanBtn', 'scanFile', 'scanInput');

    // ========== CREAR UBICACIÓN POR DEFECTO ==========
    crearUbicacion('PISO GENERAL');
    document.getElementById('addLocationBtn').addEventListener('click', function() { crearUbicacion(); });

    // ========== SUB-TABS ==========
    var subTabs = document.querySelectorAll('#ubicacionesSubTabs .sub-module-tab');
    var detectorDiv = document.getElementById('ubicacionDetector');
    var existenciaDiv = document.getElementById('ubicacionExistencia');
    
    subTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            subTabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            if (this.dataset.submode === 'detector') {
                detectorDiv.style.display = 'block';
                existenciaDiv.style.display = 'none';
            } else {
                detectorDiv.style.display = 'none';
                existenciaDiv.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab3', this.dataset.submode);
        });
    });
    detectorDiv.style.display = 'block';
    existenciaDiv.style.display = 'none';

    window.addEventListener('restoreSubmodule', function(e) {
        if (e.detail.tabId === 'tab3' && e.detail.subMode) {
            var targetTab = document.querySelector('#ubicacionesSubTabs .sub-module-tab[data-submode="' + e.detail.subMode + '"]');
            if (targetTab) targetTab.click();
        }
    });

    // ========== LIMPIAR ==========
    var clearBtn = document.querySelector('#tab3 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // Detector
            document.getElementById('modelosInput').value = '';
            document.getElementById('ubicacionOutput').innerHTML = '';
            document.getElementById('ubicacionMessage').innerHTML = '';
            document.getElementById('posicionFiltroInput').value = '';
            window.resultadosUbicacion = null;
            window.ahkUbicacion = null;
            window.ahkRestantes = null;
            
            var autocompletar = document.querySelector('.autocompletarCheckbox');
            if (autocompletar) autocompletar.checked = true;
            var autoservicio = document.querySelector('.autoservicioCheckbox');
            if (autoservicio) autoservicio.checked = false;
            var modoModelo = document.querySelector('.modoModeloCheckbox');
            if (modoModelo) modoModelo.checked = false;
            var ticketMode = document.querySelector('.ticketModeCheckbox');
            if (ticketMode) ticketMode.checked = false;
            
            // Existencia
            var locationTabs = Array.from(document.querySelectorAll('#locationTabsContainer .location-tab'));
            locationTabs.forEach(function(tab, idx) {
                var panelId = tab.dataset.panelId;
                if (panelId) {
                    var textarea = document.getElementById(panelId)?.querySelector('.stock-textarea');
                    if (textarea) textarea.value = '';
                    var checkbox = document.getElementById(panelId)?.querySelector('.include-location');
                    if (checkbox) checkbox.checked = true;
                }
                if (idx > 0) {
                    var panelId = tab.dataset.panelId;
                    if (panelId) document.getElementById(panelId)?.remove();
                    tab.remove();
                    delete locationData[panelId];
                }
            });
            var firstTab = document.querySelector('#locationTabsContainer .location-tab');
            if (firstTab) {
                var nameSpan = firstTab.querySelector('.tab-name');
                if (nameSpan && nameSpan.textContent !== 'PISO GENERAL') nameSpan.textContent = 'PISO GENERAL';
                var panelId = firstTab.dataset.panelId;
                if (panelId && locationData[panelId]) locationData[panelId].name = 'PISO GENERAL';
            }
            document.getElementById('scanInput').value = '';
            document.getElementById('existenciaOutput').innerHTML = '';
            document.getElementById('existenciaSummary').innerHTML = '';
            document.getElementById('existenciaMessage').innerHTML = '';
            currentExistenciaResults = null;
            document.getElementById('sortByPriorityCheckbox').checked = false;
        });
    }
})();