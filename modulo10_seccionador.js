// Módulo Seccionador - v1.0
// Procesamiento de códigos EAN-13/14 por secciones separadas por SSSSSSSS
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
        container.innerHTML = `
            <div class="card">
                <div class="row" style="justify-content:space-between;">
                    <h3><i class="fas fa-cut"></i> Seccionador · Separador de EANs</h3>
                    <div style="display:flex; align-items:center; gap:0.8rem;">
                        <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v1.0</span>
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
                </div>

                <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;">
                    <button id="uploadTxtBtn" style="font-size:0.8rem;"><i class="fas fa-folder-open"></i> Subir archivo .txt</button>
                    <input type="file" id="txtFile" accept=".txt" style="display:none;">
                    <button id="agregarPosicionBtn" style="background:#2ecc71; border-color:#2ecc71; color:#000; font-size:0.8rem;"><i class="fas fa-plus"></i> Agregar posición</button>
                    <button id="eliminarPosicionVaciaBtn" style="background:#e74c3c; border-color:#e74c3c; font-size:0.8rem;"><i class="fas fa-trash"></i> Eliminar posición vacía</button>
                    <button id="buscarCalzadoBtn" style="background:#3498db; border-color:#3498db; font-size:0.8rem;"><i class="fas fa-search"></i> Buscar calzado</button>
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

                <textarea id="seccionadorInput" placeholder="Pega aquí los códigos EAN-13/14 separados por SSSSSSSS..." rows="8" style="font-family:monospace; font-size:0.8rem;"></textarea>

                <div class="row" style="margin-top:0.5rem;">
                    <button id="processSeccionadorBtn" class="btn-primary"><i class="fas fa-play"></i> Procesar</button>
                    <button id="descargarCsvBtn" class="btn-secondary"><i class="fas fa-file-csv"></i> Descargar CSV</button>
                    <button id="copiarCsvBtn" class="btn-secondary"><i class="fas fa-copy"></i> Copiar CSV</button>
                    <button id="copiarAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                    <button id="descargarAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <span class="copy-feedback" id="seccionadorCopyFeedback"></span>
                </div>

                <div id="seccionadorMessage" class="message"></div>

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
                    <b>Separador:</b> <code style="background:#333; padding:0.05rem 0.3rem; border-radius:3px;">SSSSSSSS</code> (8 S mayúsculas).<br>
                    <b>Posiciones:</b> A0, A1, A2, A3, A4, A5, B0, B1... Cada separador inicia una nueva posición.<br>
                    <b>Edición:</b> Haz clic en <i class="fas fa-pen"></i> para editar talla o cantidad, <i class="fas fa-save"></i> para guardar.<br>
                    <b>Búsqueda:</b> Escribe "2558 NE TXS 25.5" y te mostrará en qué posiciones está.<br>
                    <b>Auto-completar:</b> Al escribir "2558 NE TXS 25.5" en el textarea, lo completa automáticamente.<br>
                    <b>Eliminar posición:</b> Elimina la posición seleccionada del desplegable.
                </div>
            </div>
        `;

        // Variables de estado
        let seccionesData = {}; // { posicion: [codigos] }
        let posicionesOrden = [];
        let resultadosProcesados = {}; // { posicion: [items] }
        let danadosPorPosicion = {};
        let datosActuales = {}; // { posicion: [items con editando] }
        let modoEdicionActivo = false;

        const SEPARADOR = 'SSSSSSSS';

        // Generar posiciones: A0, A1, A2... A5, B0, B1... B5, C0...
        function generarPosiciones(cantidad) {
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const posiciones = [];
            let idx = 0;
            while (posiciones.length < cantidad) {
                const letra = letras[Math.floor(idx / 6)];
                const numero = idx % 6;
                posiciones.push(letra + numero);
                idx++;
            }
            return posiciones;
        }

        function generarPosicionDesdeIndice(idx) {
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const letra = letras[Math.floor(idx / 6)];
            const numero = idx % 6;
            return letra + numero;
        }

        function extraerSecciones(texto) {
            if (!texto.trim()) return { secciones: [], posiciones: [] };
            
            // Dividir por el separador
            const partes = texto.split(SEPARADOR);
            const secciones = [];
            const posiciones = [];
            
            // Procesar cada parte
            for (let i = 0; i < partes.length; i++) {
                const contenido = partes[i].trim();
                if (contenido) {
                    const pos = generarPosicionDesdeIndice(i);
                    secciones.push(contenido);
                    posiciones.push(pos);
                } else if (i > 0 && i < partes.length - 1) {
                    // Si hay un separador vacío, igual agregar la posición
                    const pos = generarPosicionDesdeIndice(i);
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
            return codigos;
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

        function procesarSecciones() {
            const texto = document.getElementById('seccionadorInput').value;
            if (!texto.trim()) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con códigos separados por SSSSSSSS.';
                return;
            }

            const lib = core.obtenerBiblioteca();
            if (!lib || lib.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                return;
            }

            const { secciones, posiciones } = extraerSecciones(texto);
            if (secciones.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron secciones válidas.';
                return;
            }

            const autocompletar = document.getElementById('autocompletarCheckbox').checked;
            const mostrarDanados = document.getElementById('mostrarDanadosCheckbox').checked;

            seccionesData = {};
            posicionesOrden = posiciones;
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

                seccionesData[pos] = codigos;
                posicionesOrden.push(pos);

                // Procesar cada código
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
                        // Usar passthrough: mantener el EAN original
                        const codigoEAN = codigo;
                        items.push({
                            MODELO: decodificado.modelo,
                            LINEA: decodificado.linea,
                            TIPO: decodificado.tipo,
                            TALLA: decodificado.talla,
                            CANTIDAD: 1,
                            CODIGO_EAN13: codigoEAN,
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

                resultadosProcesados[pos] = items;
                danadosPorPosicion[pos] = danados;
                datosActuales[pos] = items.map(item => ({ ...item, editando: false }));
            }

            // Actualizar contadores
            document.getElementById('totalEans').textContent = totalEANs;
            document.getElementById('validosCount').textContent = validos;
            document.getElementById('danadosCount').textContent = totalInvalidos;
            document.getElementById('totalSecciones').textContent = Object.keys(resultadosProcesados).filter(k => resultadosProcesados[k].length > 0).length;

            // Mostrar resumen
            mostrarResumen();

            // Mostrar dañados
            mostrarDanados(mostrarDanados);

            // Renderizar tabla
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
                html += `<span style="background:rgba(0,0,0,0.3); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid ${color};">
                    <strong>${pos}</strong>: ${items.length} (${danados.length} dañados)
                </span>`;
            }
            html += '</div>';
            content.innerHTML = html;
            container.style.display = 'block';
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

                html += `<div style="margin-top:1rem; border:2px solid var(--blu); border-radius:6px; padding:0.5rem; background:rgba(0,0,0,0.1);">`;
                html += `<h4 style="color:#f1c40f; margin:0 0 0.3rem 0; display:flex; justify-content:space-between; align-items:center;">`;
                html += `<span><i class="fas fa-box"></i> Posición ${pos} (${items.length} items${danados.length > 0 ? `, ${danados.length} dañados` : ''})</span>`;
                html += `<span style="font-size:0.7rem;">
                    <button class="generarAhkPosBtn" data-pos="${pos}" style="background:#ffa500; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-code"></i> AHK</button>
                    <button class="copiarAhkPosBtn" data-pos="${pos}" style="background:#444; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-copy"></i> Copiar</button>
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

            // Eventos de los botones AHK por posición
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

            // Recalcular EAN si cambió la talla
            const lib = core.obtenerBiblioteca();
            const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (encontrado) {
                const codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                // Verificar si es un código de 14 dígitos original
                if (item.CODIGO_EAN13 && item.CODIGO_EAN13.length === 14) {
                    // Si era de 14, mantener el 0 al final
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
            // Si es un código de 14 dígitos original, mantener el 0 al final
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

            const codigos = items.map(item => item.CODIGO_EAN13).filter(c => c);
            if (codigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> No hay códigos válidos en ${pos}.`;
                return;
            }

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
            const busqueda = prompt('Buscar calzado (ej: 2558 NE TXS 25.5):');
            if (!busqueda) return;

            const tokens = busqueda.trim().split(/\s+/);
            if (tokens.length < 3) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Formato: MODELO LINEA TIPO [TALLA]';
                return;
            }

            const modeloBuscado = tokens[0];
            const lineaBuscada = tokens[1].toUpperCase();
            const tipoBuscado = tokens[2].toUpperCase();
            const tallaBuscada = tokens.length > 3 ? tokens[3] : '';

            let resultados = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                for (const item of items) {
                    if (item.MODELO === modeloBuscado && item.LINEA === lineaBuscada && item.TIPO === tipoBuscado) {
                        if (tallaBuscada && item.TALLA !== tallaBuscada) continue;
                        resultados.push({
                            pos: pos,
                            item: item
                        });
                    }
                }
            }

            if (resultados.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-info-circle"></i> No se encontró "${busqueda}" en ninguna sección.`;
                return;
            }

            let msg = `<i class="fas fa-check-circle"></i> "${busqueda}" encontrado en: `;
            msg += resultados.map(r => `<strong style="color:#f1c40f;">${r.pos}</strong>`).join(', ');
            document.getElementById('seccionadorMessage').innerHTML = msg;
        }

        function eliminarPosicionVacia() {
            const posicionesConDatos = [];
            for (const pos of posicionesOrden) {
                const items = datosActuales[pos] || [];
                const danados = danadosPorPosicion[pos] || [];
                if (items.length > 0 || danados.length > 0) {
                    posicionesConDatos.push(pos);
                }
            }

            if (posicionesConDatos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> No hay posiciones con datos.';
                return;
            }

            const posicionesSinDatos = posicionesOrden.filter(pos => !posicionesConDatos.includes(pos));
            if (posicionesSinDatos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> No hay posiciones vacías.';
                return;
            }

            // Preguntar qué posición eliminar
            const opciones = posicionesSinDatos.join(', ');
            const seleccion = prompt(`Posiciones vacías: ${opciones}\n\nEscribe la posición que quieres eliminar (ej: A3):`);
            if (!seleccion) return;

            const posEliminar = seleccion.trim().toUpperCase();
            if (!posicionesSinDatos.includes(posEliminar)) {
                document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> "${posEliminar}" no está vacía o no existe.`;
                return;
            }

            // Eliminar la posición
            const idx = posicionesOrden.indexOf(posEliminar);
            if (idx !== -1) {
                posicionesOrden.splice(idx, 1);
                delete datosActuales[posEliminar];
                delete resultadosProcesados[posEliminar];
                delete danadosPorPosicion[posEliminar];
                delete seccionesData[posEliminar];
            }

            renderizarTablas();
            mostrarResumen();
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Posición ${posEliminar} eliminada.`;
        }

        function agregarPosicion() {
            const posActuales = posicionesOrden;
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let nuevaPos = 'A0';
            
            // Encontrar la siguiente posición disponible
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

            // Insertar en la posición correcta (orden alfabético)
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
                        // Agregar la posición como comentario
                        todosLosCodigos.push(`; ${pos}`);
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
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK global copiado (${todosLosCodigos.length} códigos).`;
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
            document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> AHK global descargado (${todosLosCodigos.length} códigos).`;
            setTimeout(() => { if (document.getElementById('seccionadorMessage').innerHTML.includes('AHK')) document.getElementById('seccionadorMessage').innerHTML = ''; }, 3000);
        }

        // ========== EVENT LISTENERS ==========
        document.getElementById('processSeccionadorBtn').addEventListener('click', procesarSecciones);
        document.getElementById('buscarCalzadoBtn').addEventListener('click', buscarCalzado);
        document.getElementById('agregarPosicionBtn').addEventListener('click', agregarPosicion);
        document.getElementById('eliminarPosicionVaciaBtn').addEventListener('click', eliminarPosicionVacia);
        document.getElementById('descargarCsvBtn').addEventListener('click', descargarCSV);
        document.getElementById('copiarCsvBtn').addEventListener('click', copiarCSV);
        document.getElementById('copiarAhkBtn').addEventListener('click', copiarAHKGlobal);
        document.getElementById('descargarAhkBtn').addEventListener('click', descargarAHKGlobal);

        // Upload de archivo
        core.setupFileUpload('uploadTxtBtn', 'txtFile', 'seccionadorInput');

        // Drag & Drop en el textarea
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
            // Editar fila
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

            // Guardar edición
            const saveBtn = e.target.closest('.save-edit-btn');
            if (saveBtn) {
                const pos = saveBtn.dataset.pos;
                const idx = parseInt(saveBtn.dataset.idx);
                guardarEdicion(pos, idx);
                return;
            }

            // Cancelar edición
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

            // Cambiar talla
            const tallaBtn = e.target.closest('.talla-btn-sec');
            if (tallaBtn) {
                const pos = tallaBtn.dataset.pos;
                const idx = parseInt(tallaBtn.dataset.idx);
                const nuevoTipo = tallaBtn.dataset.tipo;
                cambiarTallaSec(pos, idx, nuevoTipo);
                return;
            }

            // Eliminar fila
            const deleteBtn = e.target.closest('.delete-row-btn-sec');
            if (deleteBtn) {
                const pos = deleteBtn.dataset.pos;
                const idx = parseInt(deleteBtn.dataset.idx);
                eliminarFilaSec(pos, idx);
                return;
            }

            // Copiar código individual
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

        // Auto-completar: Si el usuario escribe un modelo y presiona Enter, completar con la biblioteca
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // No hacer auto-completar aquí, se usa el botón Procesar
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
                document.getElementById('totalEans').textContent = '0';
                document.getElementById('validosCount').textContent = '0';
                document.getElementById('danadosCount').textContent = '0';
                document.getElementById('totalSecciones').textContent = '0';
                seccionesData = {};
                posicionesOrden = [];
                resultadosProcesados = {};
                danadosPorPosicion = {};
                datosActuales = {};
                document.getElementById('autocompletarCheckbox').checked = true;
                document.getElementById('mostrarDanadosCheckbox').checked = false;
            });
        }

        // Inicializar
        document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> Pega los códigos separados por SSSSSSSS y haz clic en Procesar.';
    }
})();