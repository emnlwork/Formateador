// Módulo Seccionador - v2.2
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab10');
    if (!container) {
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            const newTab = document.createElement('button');
            newTab.className = 'tab-btn';
            newTab.dataset.tab = 'tab10';
            newTab.innerHTML = '<i class="fas fa-cut"></i> Seccionador';
            tabsContainer.appendChild(newTab);
            const panelsContainer = document.querySelector('.container');
            if (panelsContainer) {
                const newPanel = document.createElement('div');
                newPanel.id = 'tab10';
                newPanel.className = 'panel';
                panelsContainer.appendChild(newPanel);
            }
        }
        const newContainer = document.getElementById('tab10');
        if (!newContainer) {
            console.error('No se pudo crear la pestaña Seccionador');
            return;
        }
        initModule(newContainer);
    } else {
        initModule(container);
    }

    function initModule(container) {
        const WIX_API_URL = 'https://emanuelcontructora.wixsite.com/jajajeje/_functions';

        container.innerHTML = `
            <div class="card">
                <div class="row" style="justify-content:space-between;">
                    <h3><i class="fas fa-cut"></i> Seccionador · Separador de EANs</h3>
                    <div style="display:flex; align-items:center; gap:0.8rem;">
                        <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v2.2</span>
                        <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" id="autocompletarCheckbox" checked style="width:16px; height:16px; accent-color:#2ecc71;"> 
                        <strong style="color:#2ecc71;"><i class="fas fa-sync-alt"></i> Auto-completar</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" id="mostrarDanadosCheckbox" style="width:16px; height:16px; accent-color:#e74c3c;"> 
                        <strong style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Mostrar dañados</strong>
                    </label>
                    <button id="subirAWixBtn" style="background:#8b00ff; border-color:#8b00ff; font-size:0.75rem;"><i class="fas fa-cloud-upload-alt"></i> Subir a Wix</button>
                    <span id="wixStatus" style="font-size:0.7rem; color:var(--grayl);"></span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
                    <div style="border:1px solid var(--blu); border-radius:4px; padding:0.5rem;">
                        <label><b><i class="fas fa-upload"></i> Códigos separados por SSSSSSSS:</b></label>
                        <textarea id="seccionadorInput" placeholder="Pega aquí los códigos EAN-13/14 separados por SSSSSSSS..." rows="6" style="font-family:monospace; font-size:0.75rem; width:100%;"></textarea>
                        <div class="row" style="margin-top:0.3rem;">
                            <button id="uploadTxtBtn" style="font-size:0.7rem;"><i class="fas fa-folder-open"></i> Subir .txt</button>
                            <input type="file" id="txtFile" accept=".txt" style="display:none;">
                            <button id="processSeccionadorBtn" class="btn-primary" style="font-size:0.7rem;"><i class="fas fa-play"></i> Procesar</button>
                            <button id="cargarDesdeWixBtn" style="background:#3498db; border-color:#3498db; font-size:0.7rem;"><i class="fas fa-cloud-download-alt"></i> Cargar Wix</button>
                        </div>
                    </div>
                    <div style="border:1px solid var(--blu); border-radius:4px; padding:0.5rem;">
                        <label><b><i class="fas fa-search"></i> Buscar calzado (múltiples, separar por comas o líneas):</b></label>
                        <textarea id="buscarInput" placeholder="38091 NE TEX 26&#10;38091 XX XX 26" rows="3" style="width:100%; font-size:0.75rem; font-family:monospace;"></textarea>
                        <div class="row" style="margin-top:0.3rem;">
                            <button id="buscarCalzadoBtn" class="btn-secondary" style="font-size:0.7rem;"><i class="fas fa-search"></i> Buscar</button>
                            <button id="limpiarBusquedaBtn" style="font-size:0.7rem;"><i class="fas fa-times"></i> Limpiar</button>
                        </div>
                        <div id="busquedaResultado" style="font-size:0.75rem; margin-top:0.3rem; max-height:120px; overflow:auto;"></div>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:1.5rem; margin:0.3rem 0 0.5rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.08); padding:0.2rem 0.8rem; border-radius:4px;">
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-hashtag"></i> Total: <strong id="totalEans" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-layer-group"></i> Secciones: <strong id="totalSecciones" style="color:#f1c40f; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-check-circle"></i> Válidos: <strong id="validosCount" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-exclamation-triangle"></i> Dañados: <strong id="danadosCount" style="color:#e74c3c; font-size:1rem;">0</strong>
                    </span>
                </div>

                <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:0.3rem;">
                    <button id="agregarPosicionBtn" style="background:#2ecc71; border-color:#2ecc71; color:#000; font-size:0.7rem;"><i class="fas fa-plus"></i> Agregar posición</button>
                    <button id="eliminarPosicionBtn" style="background:#e74c3c; border-color:#e74c3c; font-size:0.7rem;"><i class="fas fa-trash"></i> Eliminar posición</button>
                    <button id="descargarCsvBtn" class="btn-secondary" style="font-size:0.7rem;"><i class="fas fa-file-csv"></i> Descargar CSV</button>
                    <button id="copiarCsvBtn" class="btn-secondary" style="font-size:0.7rem;"><i class="fas fa-copy"></i> Copiar CSV</button>
                    <button id="descargarAhkGlobalBtn" style="background:#ffa500; border-color:#ffa500; font-size:0.7rem;"><i class="fas fa-code"></i> Descargar AHK Global</button>
                    <button id="copiarAhkGlobalBtn" style="background:#444; border-color:#ffa500; font-size:0.7rem;"><i class="fas fa-copy"></i> Copiar AHK Global</button>
                    <span class="copy-feedback" id="seccionadorCopyFeedback"></span>
                </div>

                <div id="seccionadorMessage" class="message" style="font-size:0.8rem;"></div>

                <div id="seccionadorResumen" style="display:none; margin-top:0.5rem; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:4px; border:1px solid var(--blu);">
                    <div id="seccionadorResumenContent"></div>
                </div>

                <div id="seccionadorDanados" style="display:none; margin-top:0.5rem; border:2px solid #e74c3c; border-radius:6px; padding:0.6rem; background:rgba(231,76,60,0.08);">
                    <h4 style="color:#e74c3c; margin:0 0 0.3rem 0; font-size:0.85rem;">
                        <i class="fas fa-exclamation-triangle"></i> Códigos dañados / no reconocidos
                    </h4>
                    <div id="seccionadorDanadosList" style="font-size:0.75rem; color:#e74c3c; max-height:200px; overflow:auto; font-family:monospace;"></div>
                </div>

                <div id="seccionadorOutput" class="output-area" style="max-height:500px; overflow:auto; font-size:0.75rem; margin-top:0.5rem;"></div>

                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Seccionador</b><br>
                    <b>Separador:</b> <code style="background:#333; padding:0.05rem 0.3rem; border-radius:3px;">SSSSSSSS</code> o <code>ssssssss</code> (8 S mayúsculas o minúsculas).<br>
                    <b>Auto-completar:</b> Escribe "94701 XX XX 24" y el sistema completa automáticamente.<br>
                    <b>Posiciones:</b> A0, A1, A2... Cada separador inicia una nueva sección.<br>
                    <b>Buscar:</b> Múltiples búsquedas separadas por comas o saltos de línea.<br>
                    <b>AHK por posición:</b> Botón "Generar AHK" en cada sección o en el panel de detalles.<br>
                    <b>Wix:</b> Guarda/carga los datos desde la nube para compartir entre sesiones.
                </div>
            </div>
        `;

        // Variables de estado
        let posicionesOrden = [];
        let resultadosProcesados = {};
        let danadosPorPosicion = {};
        let datosActuales = {};

        const SEPARADOR = 'SSSSSSSS';
        const SEPARADOR_MINUS = 'ssssssss';

        function generarPosicionDesdeIndice(idx) {
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const letra = letras[Math.floor(idx / 6)];
            const numero = idx % 6;
            return letra + numero;
        }

        function extraerSecciones(texto) {
            if (!texto.trim()) return { secciones: [], posiciones: [] };
            
            // Reemplazar minúsculas por mayúsculas
            let textoNormalizado = texto;
            if (textoNormalizado.includes(SEPARADOR_MINUS)) {
                textoNormalizado = textoNormalizado.replace(new RegExp(SEPARADOR_MINUS, 'g'), SEPARADOR);
            }
            
            const partes = textoNormalizado.split(SEPARADOR);
            const secciones = [];
            const posiciones = [];
            
            for (let i = 0; i < partes.length; i++) {
                const contenido = partes[i].trim();
                const pos = generarPosicionDesdeIndice(i);
                if (contenido) {
                    secciones.push(contenido);
                    posiciones.push(pos);
                } else {
                    secciones.push('');
                    posiciones.push(pos);
                }
            }
            
            return { secciones, posiciones };
        }

        function decodificarEANs(texto) {
            const patron = /\b(\d{13,14})\b/g;
            const codigos = [];
            let match;
            while ((match = patron.exec(texto)) !== null) {
                codigos.push(match[1]);
            }
            return codigos; // No eliminar duplicados - cada código cuenta individualmente
        }

        function esEANValido(codigo, lib) {
            if (!codigo) return false;
            let codigoParaVerificar = codigo;
            if (codigo.length === 14 && /^\d+$/.test(codigo)) {
                codigoParaVerificar = codigo.slice(0, 13);
            }
            if (codigoParaVerificar.length !== 13) return false;
            const decodificado = core.decodificarCodigoEAN13(codigoParaVerificar, lib);
            if (!decodificado) return false;
            return decodificado.modelo && decodificado.linea && decodificado.tipo;
        }

        // ========== AUTOCOMPLETAR (usando core.js) ==========
        function autocompletarLinea(linea) {
            const trimmed = linea.trim();
            if (!trimmed) return linea;
            
            if (/\b\d{13,14}\b/.test(trimmed)) return trimmed;
            
            const tokens = trimmed.split(/\s+/);
            if (tokens.length < 3) return linea;
            
            const modelo = tokens[0];
            const lineaInput = tokens.length > 1 ? tokens[1].toUpperCase() : '';
            const tipoInput = tokens.length > 2 ? tokens[2].toUpperCase() : '';
            const talla = tokens.length > 3 ? tokens[3] : '';
            
            const lib = core.obtenerBiblioteca();
            if (!lib || lib.length === 0) return linea;
            
            const encontrados = lib.filter(item => String(item.MODELO).trim() === modelo.trim());
            if (encontrados.length === 0) return linea;
            
            const esGenerico = !lineaInput || !tipoInput || lineaInput === 'XX' || tipoInput === 'XX';
            if (esGenerico) {
                const primero = encontrados[0];
                const lineaCompleta = primero.LINEA || '';
                const tipoCompleto = primero.TIPO || '';
                const tallaFinal = talla || '';
                return `${modelo} ${lineaCompleta} ${tipoCompleto} ${tallaFinal}`.trim();
            }
            
            const encontrado = encontrados.find(item => 
                String(item.LINEA || '').toUpperCase() === lineaInput && 
                String(item.TIPO || '').toUpperCase() === tipoInput
            );
            if (encontrado) {
                const tallaFinal = talla || '';
                return `${modelo} ${encontrado.LINEA} ${encontrado.TIPO} ${tallaFinal}`.trim();
            }
            
            const parcial = encontrados.find(item => {
                const lineaItem = String(item.LINEA || '').toUpperCase();
                const tipoItem = String(item.TIPO || '').toUpperCase();
                return lineaItem.includes(lineaInput) || tipoItem.includes(tipoInput);
            });
            if (parcial) {
                const tallaFinal = talla || '';
                return `${modelo} ${parcial.LINEA} ${parcial.TIPO} ${tallaFinal}`.trim();
            }
            
            const primero = encontrados[0];
            const tallaFinal = talla || '';
            return `${modelo} ${primero.LINEA} ${primero.TIPO} ${tallaFinal}`.trim();
        }

        function autocompletarTexto(texto) {
            if (!texto.trim()) return texto;
            
            const lines = texto.split(/\r?\n/);
            const resultado = [];
            
            for (const line of lines) {
                if (!line.trim()) {
                    resultado.push(line);
                    continue;
                }
                const completada = autocompletarLinea(line);
                resultado.push(completada);
            }
            
            return resultado.join('\n');
        }

        function procesarSecciones() {
            let texto = document.getElementById('seccionadorInput').value;
            if (!texto.trim()) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con códigos separados por SSSSSSSS.';
                return;
            }

            const lib = core.obtenerBiblioteca();
            if (!lib || lib.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                return;
            }

            const autocompletar = document.getElementById('autocompletarCheckbox').checked;
            if (autocompletar) {
                const textoOriginal = texto;
                texto = autocompletarTexto(texto);
                if (texto !== textoOriginal) {
                    document.getElementById('seccionadorInput').value = texto;
                }
            }

            const { secciones, posiciones } = extraerSecciones(texto);
            if (secciones.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron secciones válidas.';
                return;
            }

            const mostrarDanados = document.getElementById('mostrarDanadosCheckbox').checked;

            posicionesOrden = [];
            resultadosProcesados = {};
            danadosPorPosicion = {};
            datosActuales = {};

            let totalEANs = 0;
            let totalInvalidos = 0;
            let validos = 0;

            for (let i = 0; i < secciones.length; i++) {
                const pos = posiciones[i] || generarPosicionDesdeIndice(i);
                const contenido = secciones[i];
                const codigos = decodificarEANs(contenido);
                
                if (codigos.length === 0) continue;

                if (!posicionesOrden.includes(pos)) {
                    posicionesOrden.push(pos);
                }

                const items = [];
                const danados = [];

                for (const codigo of codigos) {
                    totalEANs++;
                    let codigoParaDecodificar = codigo;
                    if (codigo.length === 14) {
                        codigoParaDecodificar = codigo.slice(0, 13);
                    }
                    const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                    
                    if (decodificado && decodificado.valido) {
                        validos++;
                        const resultado = core.obtenerCodigoTallaEspecial(decodificado.talla, 'normal', decodificado.modelo);
                        items.push({
                            MODELO: decodificado.modelo,
                            LINEA: decodificado.linea,
                            TIPO: decodificado.tipo,
                            TALLA: decodificado.talla,
                            CANTIDAD: 1,
                            CODIGO_EAN13: codigo,
                            tipoTalla: resultado.categoria || 'normal',
                            editando: false,
                            esOriginal: true
                        });
                    } else {
                        totalInvalidos++;
                        danados.push({
                            codigo: codigo,
                            posicion: pos,
                            razon: 'EAN-13 no válido o no reconocido'
                        });
                    }
                }

                // NO eliminar duplicados - cada código cuenta individualmente
                resultadosProcesados[pos] = items;
                danadosPorPosicion[pos] = danados;
                datosActuales[pos] = items.map(item => ({ ...item, editando: false }));
            }

            // Ordenar posiciones
            posicionesOrden.sort((a, b) => {
                const letraA = a.charAt(0);
                const letraB = b.charAt(0);
                const numA = parseInt(a.substring(1));
                const numB = parseInt(b.substring(1));
                if (letraA !== letraB) return letraA.localeCompare(letraB);
                return numA - numB;
            });

            document.getElementById('totalEans').textContent = totalEANs;
            document.getElementById('validosCount').textContent = validos;
            document.getElementById('danadosCount').textContent = totalInvalidos;
            document.getElementById('totalSecciones').textContent = Object.keys(resultadosProcesados).filter(k => resultadosProcesados[k].length > 0).length;

            mostrarResumen();
            mostrarDanados(mostrarDanados);
            renderizarTablas();

            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Procesado: ${totalEANs} EANs en ${Object.keys(resultadosProcesados).filter(k => resultadosProcesados[k].length > 0).length} secciones. Válidos: ${validos}, dañados: ${totalInvalidos}.`;
        }

        function mostrarResumen() {
            const container = document.getElementById('seccionadorResumen');
            const content = document.getElementById('seccionadorResumenContent');
            
            let html = '<div style="display:flex; flex-wrap:wrap; gap:0.5rem;">';
            for (const pos of posicionesOrden) {
                const items = resultadosProcesados[pos] || [];
                const danados = danadosPorPosicion[pos] || [];
                const total = items.length + danados.length;
                if (total === 0) continue;
                const color = danados.length > 0 ? '#e74c3c' : '#2ecc71';
                html += `<span class="resumen-posicion" data-pos="${pos}" style="background:rgba(0,0,0,0.3); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid ${color}; cursor:pointer;">
                    <strong>${pos}</strong>: ${items.length} ${danados.length > 0 ? `(${danados.length} dañados)` : ''}
                </span>`;
            }
            html += '</div>';
            content.innerHTML = html;
            container.style.display = 'block';

            content.querySelectorAll('.resumen-posicion').forEach(el => {
                el.addEventListener('click', function() {
                    const pos = this.dataset.pos;
                    scrollToPosicion(pos);
                });
            });
        }

        function scrollToPosicion(pos) {
            const outputDiv = document.getElementById('seccionadorOutput');
            const targetEl = outputDiv.querySelector(`[data-pos="${pos}"]`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                targetEl.style.borderColor = '#f1c40f';
                targetEl.style.borderWidth = '3px';
                setTimeout(() => {
                    targetEl.style.borderColor = 'var(--blu)';
                    targetEl.style.borderWidth = '2px';
                }, 2000);
            } else {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-info-circle"></i> Posición ${pos} no encontrada en el output.`;
            }
        }

        function mostrarDanados(mostrar) {
            const container = document.getElementById('seccionadorDanados');
            const list = document.getElementById('seccionadorDanadosList');
            
            if (!mostrar) {
                container.style.display = 'none';
                return;
            }

            let totalDanados = 0;
            let html = '';
            for (const pos of posicionesOrden) {
                const danados = danadosPorPosicion[pos] || [];
                if (danados.length === 0) continue;
                totalDanados += danados.length;
                html += `<div style="margin-bottom:0.3rem;"><strong style="color:#f1c40f;">${pos}:</strong>`;
                for (const d of danados) {
                    html += `<div style="margin-left:1rem; font-family:monospace;">${d.codigo} <span style="color:#e74c3c; font-size:0.65rem;">(no reconocido)</span></div>`;
                }
                html += '</div>';
            }

            if (totalDanados === 0) {
                html = '<span style="color:#2ecc71;"><i class="fas fa-check-circle"></i> No hay códigos dañados.</span>';
                container.style.borderColor = '#2ecc71';
            } else {
                container.style.borderColor = '#e74c3c';
            }
            list.innerHTML = html;
            container.style.display = 'block';
        }

        function renderizarTablas() {
            const outputDiv = document.getElementById('seccionadorOutput');
            let html = '';

            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                const danados = danadosPorPosicion[pos] || [];
                const total = items.length + danados.length;
                if (total === 0) continue;

                html += `<div style="margin-top:1rem; border:2px solid var(--blu); border-radius:6px; padding:0.5rem; background:rgba(0,0,0,0.1);" data-pos="${pos}">`;
                html += `<h4 style="color:#f1c40f; margin:0 0 0.3rem 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.3rem;">`;
                html += `<span><i class="fas fa-box"></i> Posición ${pos} (${items.length} items${danados.length > 0 ? `, ${danados.length} dañados` : ''})</span>`;
                html += `<span style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                    <button class="generarAhkPosBtn" data-pos="${pos}" style="background:#ffa500; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button class="copiarAhkPosBtn" data-pos="${pos}" style="background:#444; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-copy"></i> Copiar AHK</button>
                </span></h4>`;

                if (items.length > 0) {
                    html += renderTablaItems(items, pos);
                }

                if (danados.length > 0) {
                    html += `<div style="font-size:0.7rem; color:#e74c3c; margin-top:0.3rem;">⚠️ ${danados.length} código(s) dañado(s): `;
                    html += danados.map(d => `<span style="font-family:monospace;">${d.codigo}</span>`).join(', ');
                    html += '</div>';
                }

                html += '</div>';
            }

            if (html === '') {
                html = '<p style="color:#666;">No hay datos para mostrar. Procesa primero.</p>';
            }

            outputDiv.innerHTML = html;

            outputDiv.querySelectorAll('.generarAhkPosBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const pos = this.dataset.pos;
                    generarAhkPosicion(pos, false);
                });
            });
            outputDiv.querySelectorAll('.copiarAhkPosBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const pos = this.dataset.pos;
                    generarAhkPosicion(pos, true);
                });
            });
        }

        function renderTablaItems(items, pos) {
            if (!items || items.length === 0) return '';

            let html = '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.7rem;">';
            html += '<thead><tr>';
            html += '<th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th><th>CANTIDAD</th><th>CÓDIGO EAN-13</th><th>ACCIONES</th>';
            html += '</tr></thead><tbody>';

            items.forEach((item, idx) => {
                const modoEdicion = item.editando || false;
                const bgNormal = (item.tipoTalla === 'normal') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
                const bgPants = (item.tipoTalla === 'pantalon') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
                const bgBelt = (item.tipoTalla === 'cinto') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';

                html += '<tr>';
                html += `<td>${item.MODELO || ''}</td>`;
                html += `<td>${item.LINEA || ''}</td>`;
                html += `<td>${item.TIPO || ''}</td>`;

                if (modoEdicion) {
                    html += `<td><input type="text" class="talla-edit" data-pos="${pos}" data-idx="${idx}" value="${item.TALLA || ''}" style="width:60px; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.2rem; font-size:0.65rem;"></td>`;
                    html += `<td><input type="number" class="cantidad-edit" data-pos="${pos}" data-idx="${idx}" value="${item.CANTIDAD || 1}" min="1" style="width:50px; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.2rem; font-size:0.65rem;"></td>`;
                } else {
                    html += `<td>${item.TALLA || ''}</td>`;
                    html += `<td>${item.CANTIDAD || 1}</td>`;
                }

                html += `<td style="font-family:monospace; font-weight:bold; font-size:0.7rem;">${item.CODIGO_EAN13 || ''}</td>`;

                html += `<td style="white-space:nowrap; font-size:0.6rem;">`;
                if (modoEdicion) {
                    html += `<button class="save-edit-btn" data-pos="${pos}" data-idx="${idx}" style="background:#2ecc71; border:1px solid #2ecc71; color:#000; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Guardar"><i class="fas fa-save"></i></button>`;
                    html += `<button class="cancel-edit-btn" data-pos="${pos}" data-idx="${idx}" style="background:#ffa500; border:1px solid #ffa500; color:#000; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Cancelar"><i class="fas fa-times"></i></button>`;
                } else {
                    html += `<button class="edit-row-btn" data-pos="${pos}" data-idx="${idx}" style="background:#3498db; border:1px solid #3498db; color:white; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Editar"><i class="fas fa-pen"></i></button>`;
                    html += `<button class="talla-btn-sec" data-pos="${pos}" data-idx="${idx}" data-tipo="normal" style="${bgNormal} border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Calzado"><i class="fas fa-shoe-prints"></i></button>`;
                    html += `<button class="talla-btn-sec" data-pos="${pos}" data-idx="${idx}" data-tipo="pantalon" style="${bgPants} border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Pantalón"><i class="fas fa-tag"></i></button>`;
                    html += `<button class="talla-btn-sec" data-pos="${pos}" data-idx="${idx}" data-tipo="cinto" style="${bgBelt} border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Cinto"><i class="fas fa-circle"></i></button>`;
                    html += `<button class="delete-row-btn-sec" data-pos="${pos}" data-idx="${idx}" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Eliminar"><i class="fas fa-trash"></i></button>`;
                    html += `<button class="copy-row-btn-sec" data-codigo="${item.CODIGO_EAN13 || ''}" style="background:#444; border:1px solid var(--blu); color:white; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Copiar"><i class="fas fa-copy"></i></button>`;
                }
                html += '</td>';
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        function guardarEdicion(pos, idx) {
            const items = datosActuales[pos] || [];
            if (idx >= items.length) return;

            const tr = document.querySelector(`#seccionadorOutput .talla-edit[data-pos="${pos}"][data-idx="${idx}"]`)?.closest('tr');
            if (!tr) return;

            const tallaInput = tr.querySelector('.talla-edit');
            const cantidadInput = tr.querySelector('.cantidad-edit');

            const item = items[idx];
            if (tallaInput) item.TALLA = tallaInput.value.trim();
            if (cantidadInput) {
                const nuevaCant = parseInt(cantidadInput.value);
                if (!isNaN(nuevaCant) && nuevaCant > 0) item.CANTIDAD = nuevaCant;
            }
            item.editando = false;

            const lib = core.obtenerBiblioteca();
            const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (encontrado) {
                const codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                if (item.CODIGO_EAN13 && item.CODIGO_EAN13.length === 14) {
                    if (!codigoEAN.endsWith('0')) {
                        item.CODIGO_EAN13 = codigoEAN + '0';
                    } else {
                        item.CODIGO_EAN13 = codigoEAN;
                    }
                } else {
                    item.CODIGO_EAN13 = codigoEAN;
                }
            }

            renderizarTablas();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Fila ${idx+1} de ${pos} actualizada.`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('actualizada')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 2000);
        }

        function cambiarTallaSec(pos, idx, nuevoTipo) {
            const items = datosActuales[pos] || [];
            if (idx >= items.length) return;

            const item = items[idx];
            const lib = core.obtenerBiblioteca();
            const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (!encontrado) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontró código para ${item.MODELO} ${item.LINEA} ${item.TIPO}`;
                return;
            }

            const resultado = core.obtenerCodigoTallaEspecial(item.TALLA, nuevoTipo, item.MODELO);
            const codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
            
            item.tipoTalla = resultado.categoria || nuevoTipo;
            if (item.CODIGO_EAN13 && item.CODIGO_EAN13.length === 14) {
                if (!codigoEAN.endsWith('0')) {
                    item.CODIGO_EAN13 = codigoEAN + '0';
                } else {
                    item.CODIGO_EAN13 = codigoEAN;
                }
            } else {
                item.CODIGO_EAN13 = codigoEAN;
            }

            renderizarTablas();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> ${pos} ${item.MODELO} cambiado a ${nuevoTipo}.`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('cambiado')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 2000);
        }

        function eliminarFilaSec(pos, idx) {
            const items = datosActuales[pos] || [];
            if (idx >= items.length) return;
            if (!confirm(`¿Eliminar fila ${idx+1} de ${pos}?`)) return;
            items.splice(idx, 1);
            renderizarTablas();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Fila eliminada de ${pos}.`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('eliminada')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 2000);
        }

        function generarAhkPosicion(pos, copiar) {
            const items = datosActuales[pos] || [];
            if (items.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> No hay datos en ${pos}.`;
                return;
            }

            const codigos = [];
            for (const item of items) {
                if (item.CODIGO_EAN13) {
                    const cantidad = item.CANTIDAD || 1;
                    for (let i = 0; i < cantidad; i++) {
                        codigos.push(item.CODIGO_EAN13);
                    }
                }
            }

            if (codigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> No hay códigos válidos en ${pos}.`;
                return;
            }

            // Usar core.generarAHKDesdeCodigos del core.js
            const ahk = core.generarAHKDesdeCodigos(codigos, `Seccionador ${pos} (${codigos.length} códigos)`);
            if (!ahk) return;

            if (copiar) {
                core.copiarTexto(ahk, 'seccionadorCopyFeedback');
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK de ${pos} copiado (${codigos.length} códigos).`;
            } else {
                const blob = new Blob([ahk], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `seccionador_${pos}_${core.generarNombreFecha('ahk')}`;
                a.click();
                URL.revokeObjectURL(url);
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK de ${pos} descargado (${codigos.length} códigos).`;
            }
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('AHK')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        function buscarCalzado() {
            const busqueda = document.getElementById('buscarInput').value;
            const resultadoDiv = document.getElementById('busquedaResultado');
            
            if (!busqueda.trim()) {
                resultadoDiv.innerHTML = '<span style="color:#f1c40f;">⚠️ Escribe al menos un modelo para buscar.</span>';
                return;
            }

            // Separar por comas y saltos de línea
            const busquedas = busqueda.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
            
            if (busquedas.length === 0) {
                resultadoDiv.innerHTML = '<span style="color:#f1c40f;">⚠️ No hay búsquedas válidas.</span>';
                return;
            }

            const lib = core.obtenerBiblioteca();
            let resultadosHtml = '';

            for (const busquedaItem of busquedas) {
                const tokens = busquedaItem.trim().split(/\s+/);
                if (tokens.length < 3) {
                    resultadosHtml += `<div style="color:#f1c40f;">⚠️ Formato inválido: "${busquedaItem}" (MODELO LINEA TIPO [TALLA])</div>`;
                    continue;
                }

                const modeloBuscado = tokens[0];
                const lineaBuscada = tokens[1].toUpperCase();
                const tipoBuscado = tokens[2].toUpperCase();
                const tallaBuscada = tokens.length > 3 ? tokens[3] : '';

                // Buscar el modelo en la biblioteca para obtener el nombre correcto
                const encontrados = lib.filter(item => String(item.MODELO).trim() === modeloBuscado.trim());
                let nombreMostrar = busquedaItem;

                let resultados = [];
                let totalCantidad = 0;

                for (const pos of posicionesOrden) {
                    const items = datosActuales[pos] || [];
                    let cantidadEnPos = 0;
                    for (const item of items) {
                        const itemLinea = String(item.LINEA || '').toUpperCase();
                        const itemTipo = String(item.TIPO || '').toUpperCase();
                        const modeloMatch = item.MODELO === modeloBuscado;
                        const lineaMatch = itemLinea === lineaBuscada || lineaBuscada === 'XX' || !lineaBuscada;
                        const tipoMatch = itemTipo === tipoBuscado || tipoBuscado === 'XX' || !tipoBuscado;
                        
                        if (modeloMatch && lineaMatch && tipoMatch) {
                            if (tallaBuscada && item.TALLA !== tallaBuscada) continue;
                            cantidadEnPos += item.CANTIDAD || 1;
                            resultados.push({
                                pos: pos,
                                item: item
                            });
                        }
                    }
                    totalCantidad += cantidadEnPos;
                }

                if (resultados.length === 0) {
                    // Intentar auto-completar para mostrar sugerencia
                    let sugerencia = '';
                    if (encontrados.length > 0) {
                        const primero = encontrados[0];
                        sugerencia = `${modeloBuscado} ${primero.LINEA} ${primero.TIPO} ${tallaBuscada || ''}`.trim();
                    }
                    resultadosHtml += `<div style="color:#e74c3c;">❌ "${busquedaItem}" no encontrado${sugerencia ? ` (¿quisiste decir: "${sugerencia}"?)` : ''}</div>`;
                    continue;
                }

                const posMap = {};
                for (const r of resultados) {
                    if (!posMap[r.pos]) posMap[r.pos] = 0;
                    posMap[r.pos] += r.item.CANTIDAD || 1;
                }

                let posHtml = '';
                const posKeys = Object.keys(posMap);
                posHtml += posKeys.map(p => {
                    const total = posMap[p];
                    return `<strong style="color:#f1c40f; cursor:pointer; background:rgba(0,0,0,0.3); padding:0.1rem 0.5rem; border-radius:3px; margin:0.1rem;" onclick="window.scrollToPosicion('${p}')">${p}(${total})</strong>`;
                }).join(' ');
                
                // Obtener el nombre completo para mostrar
                let nombreMostrarFinal = busquedaItem;
                if (encontrados.length > 0 && (lineaBuscada === 'XX' || tipoBuscado === 'XX' || !lineaBuscada || !tipoBuscada)) {
                    const primero = encontrados[0];
                    nombreMostrarFinal = `${modeloBuscado} ${primero.LINEA} ${primero.TIPO} ${tallaBuscada || ''}`.trim();
                }

                resultadosHtml += `<div style="color:#2ecc71; margin-bottom:0.2rem;">✅ "${nombreMostrarFinal}" encontrado en: ${posHtml} <span style="color:#2ecc71; font-size:0.7rem;">(Total: ${totalCantidad})</span></div>`;
            }

            resultadoDiv.innerHTML = resultadosHtml;
        }

        function eliminarPosicion() {
            const posicionesConDatos = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                if (items.length > 0) {
                    posicionesConDatos.push(pos);
                }
            }

            if (posicionesConDatos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> No hay posiciones con datos.';
                return;
            }

            const opciones = posicionesConDatos.join(', ');
            const seleccion = prompt(`Posiciones con datos: ${opciones}\n\nEscribe la posición que quieres eliminar (ej: A3):`);
            if (!seleccion) return;

            const posEliminar = seleccion.trim().toUpperCase();
            if (!posicionesConDatos.includes(posEliminar)) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> "${posEliminar}" no tiene datos o no existe.`;
                return;
            }

            const idx = posicionesOrden.indexOf(posEliminar);
            if (idx !== -1) {
                posicionesOrden.splice(idx, 1);
                delete datosActuales[posEliminar];
                delete resultadosProcesados[posEliminar];
                delete danadosPorPosicion[posEliminar];
            }

            renderizarTablas();
            mostrarResumen();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Posición ${posEliminar} eliminada.`;
        }

        function agregarPosicion() {
            const posActuales = posicionesOrden;
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let nuevaPos = 'A0';
            
            for (let i = 0; i < 26; i++) {
                for (let j = 0; j < 6; j++) {
                    const pos = letras[i] + j;
                    if (!posActuales.includes(pos)) {
                        nuevaPos = pos;
                        break;
                    }
                }
                if (!posActuales.includes(nuevaPos)) break;
            }

            const nombre = prompt(`Agregar nueva posición (ej: ${nuevaPos}):`, nuevaPos);
            if (!nombre) return;

            const pos = nombre.trim().toUpperCase();
            if (posActuales.includes(pos)) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> La posición ${pos} ya existe.`;
                return;
            }

            posicionesOrden.push(pos);
            posicionesOrden.sort((a, b) => {
                const letraA = a.charAt(0);
                const letraB = b.charAt(0);
                const numA = parseInt(a.substring(1));
                const numB = parseInt(b.substring(1));
                if (letraA !== letraB) return letraA.localeCompare(letraB);
                return numA - numB;
            });

            datosActuales[pos] = [];
            resultadosProcesados[pos] = [];
            danadosPorPosicion[pos] = [];

            renderizarTablas();
            mostrarResumen();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Posición ${pos} agregada.`;
        }

        // ========== SUBIR A WIX ==========
        async function subirAWix() {
            const statusEl = document.getElementById('wixStatus');
            if (!datosActuales || Object.keys(datosActuales).length === 0) {
                statusEl.textContent = '⚠️ No hay datos para subir. Procesa primero.';
                return;
            }

            const dataToSave = {
                posiciones: posicionesOrden,
                datos: {}
            };

            for (const pos of posicionesOrden) {
                dataToSave.datos[pos] = datosActuales[pos] || [];
            }

            const jsonData = JSON.stringify(dataToSave);
            const CHUNK_SIZE = 500000;
            const DELAY_MS = 200;
            const totalChunks = Math.ceil(jsonData.length / CHUNK_SIZE);
            const uploadId = 'seccionador_' + Date.now();

            statusEl.textContent = 'Subiendo a Wix...';

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, jsonData.length);
                const chunk = jsonData.substring(start, end);

                const progress = Math.round(((i + 1) / totalChunks) * 100);
                statusEl.textContent = `Subiendo ${i+1}/${totalChunks} (${progress}%)...`;

                const payload = JSON.stringify({
                    chunkIndex: i,
                    totalChunks: totalChunks,
                    uploadId: uploadId,
                    chunkData: chunk
                });

                try {
                    const response = await fetch(`${WIX_API_URL}/seccionadorData`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json; charset=utf-8' },
                        body: payload
                    });

                    if (!response.ok) throw new Error('Error ' + response.status);
                    const result = await response.json();

                    if (result.complete) {
                        statusEl.textContent = '✅ Datos subidos a Wix correctamente.';
                    }
                } catch (error) {
                    statusEl.textContent = `❌ Error en parte ${i+1}: ${error.message}`;
                    return;
                }

                if (i < totalChunks - 1) await new Promise(r => setTimeout(r, DELAY_MS));
            }
        }

        async function cargarDesdeWix() {
            const statusEl = document.getElementById('wixStatus');
            const msgEl = document.getElementById('seccionadorMessage');
            statusEl.textContent = 'Cargando desde Wix...';

            try {
                const response = await fetch(`${WIX_API_URL}/seccionadorData`);
                if (!response.ok) {
                    if (response.status === 404) {
                        statusEl.textContent = '⚠️ No hay datos guardados en Wix.';
                        return;
                    }
                    throw new Error('Error ' + response.status);
                }

                const text = await response.text();
                if (!text || text === 'SIN_DATOS') {
                    statusEl.textContent = '⚠️ No hay datos guardados en Wix.';
                    return;
                }

                const data = JSON.parse(text);
                if (!data.posiciones || !data.datos) {
                    statusEl.textContent = '⚠️ Datos inválidos.';
                    return;
                }

                posicionesOrden = data.posiciones;
                datosActuales = data.datos;

                resultadosProcesados = {};
                danadosPorPosicion = {};
                for (const pos of posicionesOrden) {
                    const items = datosActuales[pos] || [];
                    resultadosProcesados[pos] = items.map(item => ({ ...item }));
                    danadosPorPosicion[pos] = [];
                }

                let totalEANs = 0;
                let validos = 0;
                for (const pos of posicionesOrden) {
                    const items = datosActuales[pos] || [];
                    totalEANs += items.length;
                    validos += items.filter(i => i.CODIGO_EAN13).length;
                }

                document.getElementById('totalEans').textContent = totalEANs;
                document.getElementById('validosCount').textContent = validos;
                document.getElementById('danadosCount').textContent = 0;
                document.getElementById('totalSecciones').textContent = posicionesOrden.filter(p => (datosActuales[p] || []).length > 0).length;

                mostrarResumen();
                renderizarTablas();
                statusEl.textContent = '✅ Datos cargados desde Wix.';
                msgEl.innerHTML = `<i class="fas fa-check-circle"></i> Cargados ${totalEANs} EANs en ${posicionesOrden.length} secciones.`;

            } catch (error) {
                statusEl.textContent = `❌ Error: ${error.message}`;
                msgEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error al cargar: ${error.message}`;
            }
        }

        // Exponer función para el onclick de las búsquedas
        window.scrollToPosicion = scrollToPosicion;

        // ========== DESCARGAR CSV ==========
        function descargarCSV() {
            let todasLasFilas = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                for (const item of items) {
                    if (!item.CODIGO_EAN13) continue;
                    todasLasFilas.push({
                        POSICION: pos,
                        MODELO: item.MODELO || '',
                        LINEA: item.LINEA || '',
                        TIPO: item.TIPO || '',
                        TALLA: item.TALLA || '',
                        CANTIDAD: item.CANTIDAD || 1,
                        CODIGO_EAN13: item.CODIGO_EAN13 || '',
                        CATEGORIA: item.tipoTalla || 'normal'
                    });
                }
            }

            if (todasLasFilas.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para descargar.';
                return;
            }

            const csv = core.dfToCsv(todasLasFilas, ',', true, true);
            const filename = `seccionador_${core.generarNombreFecha('csv')}`;
            core.downloadCsv(csv, filename);
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> CSV descargado (${todasLasFilas.length} filas).`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('CSV')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        function copiarCSV() {
            let todasLasFilas = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                for (const item of items) {
                    if (!item.CODIGO_EAN13) continue;
                    todasLasFilas.push({
                        POSICION: pos,
                        MODELO: item.MODELO || '',
                        LINEA: item.LINEA || '',
                        TIPO: item.TIPO || '',
                        TALLA: item.TALLA || '',
                        CANTIDAD: item.CANTIDAD || 1,
                        CODIGO_EAN13: item.CODIGO_EAN13 || '',
                        CATEGORIA: item.tipoTalla || 'normal'
                    });
                }
            }

            if (todasLasFilas.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para copiar.';
                return;
            }

            const csv = core.dfToCsv(todasLasFilas, ',', true, true);
            core.copiarTexto(csv, 'seccionadorCopyFeedback');
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> CSV copiado (${todasLasFilas.length} filas).`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('CSV')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        function copiarAHKGlobal() {
            let todosLosCodigos = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                for (const item of items) {
                    if (item.CODIGO_EAN13) {
                        const cantidad = item.CANTIDAD || 1;
                        for (let i = 0; i < cantidad; i++) {
                            todosLosCodigos.push(item.CODIGO_EAN13);
                        }
                    }
                }
            }

            if (todosLosCodigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK.';
                return;
            }

            const ahk = core.generarAHKDesdeCodigos(todosLosCodigos, `Seccionador (${todosLosCodigos.length} códigos)`);
            if (!ahk) return;
            core.copiarTexto(ahk, 'seccionadorCopyFeedback');
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK Global copiado (${todosLosCodigos.length} códigos).`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('AHK')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        function descargarAHKGlobal() {
            let todosLosCodigos = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                for (const item of items) {
                    if (item.CODIGO_EAN13) {
                        const cantidad = item.CANTIDAD || 1;
                        for (let i = 0; i < cantidad; i++) {
                            todosLosCodigos.push(item.CODIGO_EAN13);
                        }
                    }
                }
            }

            if (todosLosCodigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK.';
                return;
            }

            const ahk = core.generarAHKDesdeCodigos(todosLosCodigos, `Seccionador (${todosLosCodigos.length} códigos)`);
            if (!ahk) return;
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seccionador_global_${core.generarNombreFecha('ahk')}`;
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK Global descargado (${todosLosCodigos.length} códigos).`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('AHK')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        // ========== EVENT LISTENERS ==========
        document.getElementById('processSeccionadorBtn').addEventListener('click', procesarSecciones);
        document.getElementById('buscarCalzadoBtn').addEventListener('click', buscarCalzado);
        document.getElementById('limpiarBusquedaBtn').addEventListener('click', function() {
            document.getElementById('buscarInput').value = '';
            document.getElementById('busquedaResultado').innerHTML = '';
        });
        document.getElementById('agregarPosicionBtn').addEventListener('click', agregarPosicion);
        document.getElementById('eliminarPosicionBtn').addEventListener('click', eliminarPosicion);
        document.getElementById('descargarCsvBtn').addEventListener('click', descargarCSV);
        document.getElementById('copiarCsvBtn').addEventListener('click', copiarCSV);
        document.getElementById('copiarAhkGlobalBtn').addEventListener('click', copiarAHKGlobal);
        document.getElementById('descargarAhkGlobalBtn').addEventListener('click', descargarAHKGlobal);
        document.getElementById('subirAWixBtn').addEventListener('click', subirAWix);
        document.getElementById('cargarDesdeWixBtn').addEventListener('click', cargarDesdeWix);

        document.getElementById('buscarInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarCalzado();
            }
        });

        core.setupFileUpload('uploadTxtBtn', 'txtFile', 'seccionadorInput');

        const textarea = document.getElementById('seccionadorInput');
        textarea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '#2ecc71';
        });
        textarea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '';
        });
        textarea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '';
            const files = e.dataTransfer.files;
            if (files.length === 0) return;
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function(ev) {
                textarea.value = ev.target.result;
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Archivo "${file.name}" cargado.`;
                setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('cargado')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
            };
            reader.readAsText(file);
        });

        // Eventos de la tabla (delegación)
        document.getElementById('seccionadorOutput').addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-row-btn');
            if (editBtn) {
                const pos = editBtn.dataset.pos;
                const idx = parseInt(editBtn.dataset.idx);
                const items = datosActuales[pos] || [];
                if (idx >= items.length) return;
                items[idx].editando = true;
                renderizarTablas();
                return;
            }

            const saveBtn = e.target.closest('.save-edit-btn');
            if (saveBtn) {
                const pos = saveBtn.dataset.pos;
                const idx = parseInt(saveBtn.dataset.idx);
                guardarEdicion(pos, idx);
                return;
            }

            const cancelBtn = e.target.closest('.cancel-edit-btn');
            if (cancelBtn) {
                const pos = cancelBtn.dataset.pos;
                const idx = parseInt(cancelBtn.dataset.idx);
                const items = datosActuales[pos] || [];
                if (idx >= items.length) return;
                items[idx].editando = false;
                renderizarTablas();
                return;
            }

            const tallaBtn = e.target.closest('.talla-btn-sec');
            if (tallaBtn) {
                const pos = tallaBtn.dataset.pos;
                const idx = parseInt(tallaBtn.dataset.idx);
                const nuevoTipo = tallaBtn.dataset.tipo;
                cambiarTallaSec(pos, idx, nuevoTipo);
                return;
            }

            const deleteBtn = e.target.closest('.delete-row-btn-sec');
            if (deleteBtn) {
                const pos = deleteBtn.dataset.pos;
                const idx = parseInt(deleteBtn.dataset.idx);
                eliminarFilaSec(pos, idx);
                return;
            }

            const copyBtn = e.target.closest('.copy-row-btn-sec');
            if (copyBtn) {
                const codigo = copyBtn.dataset.codigo;
                if (codigo) {
                    navigator.clipboard.writeText(codigo).then(() => {
                        const original = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i>';
                        setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
                    }).catch(() => {});
                }
                return;
            }
        });

        // Limpiar módulo
        const clearBtn = container.querySelector('.clear-module-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                document.getElementById('seccionadorInput').value = '';
                document.getElementById('seccionadorOutput').innerHTML = '';
                document.getElementById('seccionadorMessage').innerHTML = '';
                document.getElementById('seccionadorResumen').style.display = 'none';
                document.getElementById('seccionadorDanados').style.display = 'none';
                document.getElementById('buscarInput').value = '';
                document.getElementById('busquedaResultado').innerHTML = '';
                document.getElementById('wixStatus').textContent = '';
                document.getElementById('totalEans').textContent = '0';
                document.getElementById('validosCount').textContent = '0';
                document.getElementById('danadosCount').textContent = '0';
                document.getElementById('totalSecciones').textContent = '0';
                posicionesOrden = [];
                resultadosProcesados = {};
                danadosPorPosicion = {};
                datosActuales = {};
                document.getElementById('autocompletarCheckbox').checked = true;
                document.getElementById('mostrarDanadosCheckbox').checked = false;
            });
        }

        document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> Pega los códigos separados por SSSSSSSS y haz clic en Procesar.';

        // Cargar automáticamente desde Wix al iniciar
        setTimeout(cargarDesdeWix, 1000);
    }
})();