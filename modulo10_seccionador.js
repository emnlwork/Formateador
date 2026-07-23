// Módulo Seccionador - v2.15 (con AHK Crear Folios y Cancelar Folios)
(function() {
    var core = window.core;
    if (!core) return;

    var container = document.getElementById('tab10');
    if (!container) {
        var tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            var newTab = document.createElement('button');
            newTab.className = 'tab-btn';
            newTab.dataset.tab = 'tab10';
            newTab.innerHTML = '<i class="fas fa-cut"></i> Seccionador';
            tabsContainer.appendChild(newTab);
            var panelsContainer = document.querySelector('.container');
            if (panelsContainer) {
                var newPanel = document.createElement('div');
                newPanel.id = 'tab10';
                newPanel.className = 'panel';
                panelsContainer.appendChild(newPanel);
            }
        }
        var newContainer = document.getElementById('tab10');
        if (!newContainer) {
            console.error('No se pudo crear la pestaña Seccionador');
            return;
        }
        initModule(newContainer);
    } else {
        initModule(container);
    }

    function initModule(container) {
        var WIX_API_URL = 'https://emanuelcontructora.wixsite.com/jajajeje/_functions';

        container.innerHTML = `
            <div class="card">
                <div class="row" style="justify-content:space-between;">
                    <h3><i class="fas fa-cut"></i> Seccionador · Separador de EANs</h3>
                    <div style="display:flex; align-items:center; gap:0.8rem;">
                        <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v2.15c</span>
                        <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; cursor:pointer;">
                        <input type="checkbox" id="autocompletarCheckbox" checked style="width:16px; height:16px; accent-color:#2ecc71;"> 
                        <strong style="color:#2ecc71;"><i class="fas fa-sync-alt"></i> Auto-completar</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; cursor:pointer;">
                        <input type="checkbox" id="mostrarDanadosCheckbox" style="width:16px; height:16px; accent-color:#e74c3c;"> 
                        <strong style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Mostrar dañados</strong>
                    </label>
                    <button id="subirAWixBtn" style="background:#8b00ff; border-color:#8b00ff; font-size:0.75rem;"><i class="fas fa-cloud-upload-alt"></i> Subir a Wix</button>
                    <span id="wixStatus" style="font-size:0.7rem; color:var(--grayl);"></span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
                    <div style="border:1px solid #444; border-radius:4px; padding:0.5rem; background:rgba(0,0,0,0.1);">
                        <label><b><i class="fas fa-upload"></i> Códigos separados por SSSSSSSS:</b></label>
                        <textarea id="seccionadorInput" placeholder="Pega aquí los códigos EAN-13/14 separados por SSSSSSSS..." rows="6" style="font-family:monospace; font-size:0.75rem; width:100%; background:var(--blud); color:var(--white); border:1px solid #444; border-radius:4px;"></textarea>
                        <div class="row" style="margin-top:0.3rem;">
                            <button id="uploadTxtBtn" style="font-size:0.7rem; background:#444;"><i class="fas fa-folder-open"></i> Subir .txt</button>
                            <input type="file" id="txtFile" accept=".txt" style="display:none;">
                            <button id="cargarDesdeWixBtn" style="background:#3498db; border-color:#3498db; font-size:0.7rem;"><i class="fas fa-cloud-download-alt"></i> Cargar Wix</button>
                        </div>
                    </div>
                    <div style="border:1px solid #444; border-radius:4px; padding:0.5rem; background:rgba(0,0,0,0.1);">
                        <label><b><i class="fas fa-search"></i> Buscar calzado (múltiples, separar por comas o líneas):</b></label>
                        <textarea id="buscarInput" placeholder="38091 NE TEX 26&#10;38091 XX XX 26" rows="3" style="width:100%; font-size:0.75rem; font-family:monospace; background:var(--blud); color:var(--white); border:1px solid #444; border-radius:4px;"></textarea>
                        <div class="row" style="margin-top:0.3rem;">
                            <button id="buscarCalzadoBtn" class="btn-secondary" style="background:#e74c3c; border-color:#e74c3c; color:#fff; font-size:0.75rem;"><i class="fas fa-search"></i> Buscar</button>
                            <button id="limpiarBusquedaBtn" style="background:#444; border-color:#444; font-size:0.7rem;"><i class="fas fa-times"></i> Limpiar</button>
                            <button id="eliminarEncontradosBtn" style="background:#c0392b; border-color:#c0392b; color:#fff; font-size:0.7rem; display:none;"><i class="fas fa-trash"></i> Eliminar encontrados</button>
                        </div>
                        <div id="busquedaResultado" style="font-size:0.75rem; margin-top:0.3rem; max-height:150px; overflow:auto; color:#ccc;"></div>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:1.5rem; margin:0.3rem 0 0.5rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.08); padding:0.2rem 0.8rem; border-radius:4px;">
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-hashtag"></i> Total: <strong id="totalEans" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-layer-group"></i> Secciones: <strong id="totalSecciones" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-check-circle"></i> Válidos: <strong id="validosCount" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-exclamation-triangle"></i> Dañados: <strong id="danadosCount" style="color:#e74c3c; font-size:1rem;">0</strong>
                    </span>
                </div>

                <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:0.3rem;">
                    <button id="processSeccionadorBtn" class="btn-primary" style="padding:0.5rem 1.5rem; font-size:1rem; background:#e74c3c; border-color:#e74c3c;"><i class="fas fa-play"></i> Procesar</button>
                    <button id="agregarPosicionBtn" style="background:#2ecc71; border-color:#2ecc71; color:#000; font-size:0.7rem;"><i class="fas fa-plus"></i> Agregar posición</button>
                    <button id="eliminarPosicionBtn" style="background:#e74c3c; border-color:#e74c3c; font-size:0.7rem;"><i class="fas fa-trash"></i> Eliminar posición</button>
                    <button id="descargarCsvBtn" class="btn-secondary" style="font-size:0.7rem; background:#444; border-color:#555;"><i class="fas fa-file-csv"></i> Descargar CSV</button>
                    <button id="copiarCsvBtn" class="btn-secondary" style="font-size:0.7rem; background:#444; border-color:#555;"><i class="fas fa-copy"></i> Copiar CSV</button>
                    <button id="descargarCsvBackupBtn" class="btn-secondary" style="background:#3498db; border-color:#3498db; font-size:0.7rem;"><i class="fas fa-file-csv"></i> Descargar Backup</button>
                    <button id="subirBackupWixBtn" style="background:#8b00ff; border-color:#8b00ff; font-size:0.7rem;"><i class="fas fa-cloud-upload-alt"></i> Subir Backup</button>
                    <button id="descargarAhkGlobalBtn" style="background:#ffa500; border-color:#ffa500; font-size:0.7rem;"><i class="fas fa-code"></i> Descargar AHK Global</button>
                    <button id="copiarAhkGlobalBtn" style="background:#444; border-color:#ffa500; font-size:0.7rem;"><i class="fas fa-copy"></i> Copiar AHK Global</button>
                    <!-- NUEVOS BOTONES -->
                    <button id="descargarAhkSeccionesBtn" style="background:#e67e22; border-color:#e67e22; font-size:0.7rem;"><i class="fas fa-code"></i> AHK Crear Folios</button>
                    <button id="descargarAhkPosicionesBtn" style="background:#8e44ad; border-color:#8e44ad; font-size:0.7rem;"><i class="fas fa-code"></i> AHK Cancelar Folios</button>
                    <span class="copy-feedback" id="seccionadorCopyFeedback"></span>
                </div>

                <div id="seccionadorMessage" class="message" style="font-size:0.8rem; background:rgba(0,0,0,0.2); border:1px solid #444; border-radius:5px; padding:0.5rem 1rem; margin:0.5rem 0;"></div>

                <div id="seccionadorResumen" style="display:none; margin-top:0.5rem; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:4px; border:1px solid #444;">
                    <div id="seccionadorResumenContent"></div>
                </div>

                <!-- Panel de Detalle de Posición -->
                <div id="posicionDetallePanel" style="display:none; margin-top:0.5rem; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:4px; border:2px solid #2ecc71;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.3rem;">
                        <h4 id="posicionDetalleTitulo" style="color:#2ecc71; margin:0;"><i class="fas fa-box"></i> Posición <span id="posicionDetalleNombre" style="color:#ffffff;"></span></h4>
                        <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                            <button id="detalleEliminarTodosBtn" style="background:#e74c3c; border-color:#e74c3c; color:#fff; padding:0.1rem 0.5rem; font-size:0.7rem;"><i class="fas fa-trash"></i> Eliminar todos</button>
                            <button id="detalleDescargarAhkBtn" style="background:#ffa500; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.7rem;"><i class="fas fa-code"></i> Descargar AHK</button>
                            <button id="detalleCopiarAhkBtn" style="background:#444; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.7rem;"><i class="fas fa-copy"></i> Copiar AHK</button>
                            <button id="cerrarDetalleBtn" style="background:#ff4444; border-color:#ff4444; padding:0.1rem 0.5rem; font-size:0.7rem;"><i class="fas fa-times"></i> Cerrar</button>
                        </div>
                    </div>
                    <div id="posicionDetalleContenido" style="margin-top:0.5rem; max-height:300px; overflow:auto; font-size:0.75rem; color:#ccc;"></div>
                </div>

                <div id="seccionadorDanados" style="display:none; margin-top:0.5rem; border:2px solid #e74c3c; border-radius:6px; padding:0.6rem; background:rgba(231,76,60,0.08);">
                    <h4 style="color:#e74c3c; margin:0 0 0.3rem 0; font-size:0.85rem;">
                        <i class="fas fa-exclamation-triangle"></i> Códigos dañados / no reconocidos
                    </h4>
                    <div id="seccionadorDanadosList" style="font-size:0.75rem; color:#e74c3c; max-height:200px; overflow:auto; font-family:monospace;"></div>
                </div>

                <div id="seccionadorOutput" class="output-area" style="max-height:500px; overflow:auto; font-size:0.75rem; margin-top:0.5rem; background:#0d0d0d; border:1px solid #444; border-radius:5px; padding:1rem; color:#ffffff;"></div>

                <div class="instructions-box" style="margin-top:0.5rem; padding:0.5rem 1rem; background:#1a1a1a; border:1px solid #444; border-radius:5px; font-size:0.82rem; color:#ccc;">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Seccionador</b><br>
                    <b>Separador:</b> <code style="background:#333; padding:0.05rem 0.3rem; border-radius:3px; color:#f1c40f;">SSSSSSSS</code> o <code style="background:#333; padding:0.05rem 0.3rem; border-radius:3px; color:#f1c40f;">ssssssss</code>.<br>
                    <b>Auto-completar:</b> Escribe "94701 XX XX 24" y completa automáticamente.<br>
                    <b>Posiciones:</b> A0, A1, A2... Cada separador inicia una nueva sección.<br>
                    <b>Orden:</b> Por defecto ascendente por modelo dentro de cada posición. Marca "Orden escaneo" para mantener el orden original del texto.<br>
                    <b>Buscar:</b> Múltiples búsquedas separadas por comas o saltos de línea (no case-sensitive).<br>
                    <b>AHK por posición:</b> Botón "Descargar AHK" en cada sección y en el panel de detalles.<br>
                    <b>AHK Passthrough:</b> Los botones "AHK Crear Folios" y "AHK Cancelar Folios" usan los códigos tal cual (passthrough) sin regenerar.<br>
                    <b>Eliminar:</b> Desde el resultado de búsqueda, elimina todos los encontrados. Desde el detalle, elimina individual o todos.<br>
                    <b>Backup:</b> Descarga un CSV con MODELO,LINEA,TIPO,TALLA,CANTIDAD,POSICION. También lo sube a Wix.<br>
                    <b>Wix:</b> Guarda/carga los datos desde la nube.
                </div>
            </div>
        `;

        // Variables de estado
        var posicionesOrden = [];
        var posicionesOrdenEscaneo = [];
        var resultadosProcesados = {};
        var danadosPorPosicion = {};
        var datosActuales = {};
        var posicionDetalleActual = null;
        var ultimaBusqueda = null;
        var posicionResaltada = null;
        var usarOrdenEscaneo = false;

        var SEPARADOR = 'SSSSSSSS';
        var SEPARADOR_MINUS = 'ssssssss';

        // ============================================================
        // FUNCIÓN GENERAR POSICIÓN (0 a 4)
        // ============================================================
        function generarPosicionDesdeIndice(idx) {
            var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var letra = letras[Math.floor(idx / 5)];
            var numero = (idx % 5);
            return letra + numero;
        }

        function extraerSecciones(texto) {
            if (!texto.trim()) return { secciones: [], posiciones: [] };
            
            var textoNormalizado = texto;
            if (textoNormalizado.indexOf(SEPARADOR_MINUS) !== -1) {
                textoNormalizado = textoNormalizado.replace(new RegExp(SEPARADOR_MINUS, 'g'), SEPARADOR);
            }
            
            var partes = textoNormalizado.split(SEPARADOR);
            var secciones = [];
            var posiciones = [];
            
            for (var i = 0; i < partes.length; i++) {
                var contenido = partes[i].trim();
                var pos = generarPosicionDesdeIndice(i);
                if (contenido) {
                    secciones.push(contenido);
                    posiciones.push(pos);
                } else {
                    secciones.push('');
                    posiciones.push(pos);
                }
            }
            
            return { secciones: secciones, posiciones: posiciones };
        }

        function decodificarEANs(texto) {
            var patron = /\b(\d{13,14})\b/g;
            var codigos = [];
            var match;
            while ((match = patron.exec(texto)) !== null) {
                codigos.push(match[1]);
            }
            return codigos;
        }

        // ============================================================
        // AUTOCOMPLETAR
        // ============================================================

        function autocompletarLinea(linea) {
            var trimmed = linea.trim();
            if (!trimmed) return linea;
            if (/\b\d{13,14}\b/.test(trimmed)) return trimmed;
            
            var tokens = trimmed.split(/\s+/);
            if (tokens.length < 3) return linea;
            
            var modelo = tokens[0];
            var lineaInput = tokens.length > 1 ? tokens[1].toUpperCase() : '';
            var tipoInput = tokens.length > 2 ? tokens[2].toUpperCase() : '';
            var talla = tokens.length > 3 ? tokens[3] : '';
            
            var lib = core.obtenerBiblioteca();
            if (!lib || lib.length === 0) return linea;
            
            var encontrados = lib.filter(function(item) { return String(item.MODELO).trim() === modelo.trim(); });
            if (encontrados.length === 0) return linea;
            
            var esGenerico = !lineaInput || !tipoInput || lineaInput === 'XX' || tipoInput === 'XX';
            if (esGenerico) {
                var primero = encontrados[0];
                var lineaCompleta = primero.LINEA || '';
                var tipoCompleto = primero.TIPO || '';
                var tallaFinal = talla || '';
                return modelo + ' ' + lineaCompleta + ' ' + tipoCompleto + ' ' + tallaFinal;
            }
            
            var encontrado = encontrados.find(function(item) {
                return String(item.LINEA || '').toUpperCase() === lineaInput && 
                       String(item.TIPO || '').toUpperCase() === tipoInput;
            });
            if (encontrado) {
                var tallaFinal = talla || '';
                return modelo + ' ' + encontrado.LINEA + ' ' + encontrado.TIPO + ' ' + tallaFinal;
            }
            
            var parcial = encontrados.find(function(item) {
                var lineaItem = String(item.LINEA || '').toUpperCase();
                var tipoItem = String(item.TIPO || '').toUpperCase();
                return lineaItem.indexOf(lineaInput) !== -1 || tipoItem.indexOf(tipoInput) !== -1;
            });
            if (parcial) {
                var tallaFinal = talla || '';
                return modelo + ' ' + parcial.LINEA + ' ' + parcial.TIPO + ' ' + tallaFinal;
            }
            
            var primero2 = encontrados[0];
            var tallaFinal2 = talla || '';
            return modelo + ' ' + primero2.LINEA + ' ' + primero2.TIPO + ' ' + tallaFinal2;
        }

        function autocompletarTexto(texto) {
            if (!texto.trim()) return texto;
            
            var lines = texto.split(/\r?\n/);
            var resultado = [];
            
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (!line.trim()) {
                    resultado.push(line);
                    continue;
                }
                var completada = autocompletarLinea(line);
                resultado.push(completada);
            }
            
            return resultado.join('\n');
        }

        // ============================================================
        // MOSTRAR DANADOS
        // ============================================================

        function mostrarDanados(mostrar) {
            var container = document.getElementById('seccionadorDanados');
            var list = document.getElementById('seccionadorDanadosList');
            
            if (!mostrar) {
                container.style.display = 'none';
                return;
            }

            var totalDanados = 0;
            var html = '';
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var danados = danadosPorPosicion[pos] || [];
                if (danados.length === 0) continue;
                totalDanados += danados.length;
                html += '<div style="margin-bottom:0.3rem;"><strong style="color:#f1c40f;">' + pos + ':</strong>';
                for (var j = 0; j < danados.length; j++) {
                    var d = danados[j];
                    html += '<div style="margin-left:1rem; font-family:monospace;">' + d.codigo + ' <span style="color:#e74c3c; font-size:0.65rem;">(no reconocido)</span></div>';
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

        // ============================================================
        // MOSTRAR RESUMEN Y PANEL DE DETALLE
        // ============================================================

        function mostrarResumen() {
            var container = document.getElementById('seccionadorResumen');
            var content = document.getElementById('seccionadorResumenContent');
            
            var html = '<div style="display:flex; flex-wrap:wrap; gap:0.5rem;">';
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = resultadosProcesados[pos] || [];
                var danados = danadosPorPosicion[pos] || [];
                var total = items.length + danados.length;
                if (total === 0) continue;
                html += '<span class="resumen-posicion" data-pos="' + pos + '" style="background:rgba(0,0,0,0.3); border:1px solid #2ecc71; color:#2ecc71; padding:0.2rem 0.6rem; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">';
                html += '<strong style="color:#2ecc71;">' + pos + '</strong>';
                html += ': <span style="color:#ffffff;">' + items.length + '</span>';
                if (danados.length > 0) {
                    html += ' <span style="color:#e74c3c;">(' + danados.length + ' dañados)</span>';
                }
                html += '</span>';
            }
            html += '</div>';
            content.innerHTML = html;
            container.style.display = 'block';

            var spans = content.querySelectorAll('.resumen-posicion');
            for (var j = 0; j < spans.length; j++) {
                (function(el) {
                    el.addEventListener('click', function() {
                        var pos = this.dataset.pos;
                        posicionResaltada = pos;
                        mostrarDetallePosicion(pos);
                        resaltarPosicionEnTabla(pos);
                    });
                })(spans[j]);
            }
        }

        function resaltarPosicionEnTabla(pos) {
            var outputDiv = document.getElementById('seccionadorOutput');
            var prevResaltados = outputDiv.querySelectorAll('.posicion-resaltada');
            prevResaltados.forEach(function(el) {
                el.style.background = '';
                el.style.border = '';
                el.style.boxShadow = '';
                el.classList.remove('posicion-resaltada');
                var titulo = el.querySelector('h4');
                if (titulo) {
                    var posSpan = titulo.querySelector('.pos-nombre');
                    if (posSpan) {
                        posSpan.style.color = '';
                    }
                }
            });
            
            var divs = outputDiv.querySelectorAll('div[data-pos]');
            for (var i = 0; i < divs.length; i++) {
                var div = divs[i];
                if (div.dataset.pos === pos) {
                    div.style.background = 'rgba(46, 204, 113, 0.15)';
                    div.style.border = '2px solid #2ecc71';
                    div.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.3)';
                    div.classList.add('posicion-resaltada');
                    var titulo = div.querySelector('h4');
                    if (titulo) {
                        var texto = titulo.innerHTML;
                        var match = texto.match(/Posición\s+([A-Z0-9]+)/);
                        if (match) {
                            var posTexto = match[1];
                            titulo.innerHTML = texto.replace(posTexto, '<span class="pos-nombre" style="color:#2ecc71;">' + posTexto + '</span>');
                        }
                    }
                    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }

        window.mostrarDetallePosicion = function(pos) {
            mostrarDetallePosicion(pos);
        };

        function mostrarDetallePosicion(pos) {
            var panel = document.getElementById('posicionDetallePanel');
            var nombreEl = document.getElementById('posicionDetalleNombre');
            var contenidoEl = document.getElementById('posicionDetalleContenido');
            var btnDescargar = document.getElementById('detalleDescargarAhkBtn');
            var btnCopiar = document.getElementById('detalleCopiarAhkBtn');
            var btnEliminarTodos = document.getElementById('detalleEliminarTodosBtn');

            nombreEl.textContent = pos;
            nombreEl.style.color = '#2ecc71';
            posicionDetalleActual = pos;

            var items = datosActuales[pos] || [];
            var danados = danadosPorPosicion[pos] || [];

            if (items.length === 0 && danados.length === 0) {
                contenidoEl.innerHTML = '<span style="color:#666;">No hay datos en esta posición.</span>';
                panel.style.display = 'block';
                return;
            }

            var html = '';
            if (items.length > 0) {
                html += '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.7rem; color:#ffffff;">';
                html += '<thead style="background:#222;"><tr><th style="padding:0.3rem; color:#ffffff;">MODELO</th><th style="padding:0.3rem; color:#ffffff;">LINEA</th><th style="padding:0.3rem; color:#ffffff;">TIPO</th><th style="padding:0.3rem; color:#ffffff;">TALLA</th><th style="padding:0.3rem; color:#ffffff;">CANTIDAD</th><th style="padding:0.3rem; color:#ffffff;">CÓDIGO EAN-13</th><th style="padding:0.3rem; color:#ffffff;">ACCIONES</th></tr></thead><tbody>';
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    html += '<tr style="border-bottom:1px solid #333;">';
                    html += '<td style="padding:0.2rem; color:#ffffff;">' + (item.MODELO || '') + '</td>';
                    html += '<td style="padding:0.2rem; color:#ffffff;">' + (item.LINEA || '') + '</td>';
                    html += '<td style="padding:0.2rem; color:#ffffff;">' + (item.TIPO || '') + '</td>';
                    html += '<td style="padding:0.2rem; color:#ffffff;">' + (item.TALLA || '') + '</td>';
                    html += '<td style="padding:0.2rem; color:#ffffff;">' + (item.CANTIDAD || 1) + '</td>';
                    html += '<td style="padding:0.2rem; font-family:monospace; color:#ffffff;">' + (item.CODIGO_EAN13 || '') + '</td>';
                    html += '<td style="padding:0.2rem;"><button class="detalle-eliminar-item" data-pos="' + pos + '" data-idx="' + i + '" style="background:#e74c3c; border-color:#e74c3c; color:#fff; padding:0.1rem 0.3rem; border-radius:3px; font-size:0.6rem; cursor:pointer;"><i class="fas fa-trash"></i></button></td>';
                    html += '</tr>';
                }
                html += '</tbody></table>';
            }

            if (danados.length > 0) {
                html += '<div style="margin-top:0.5rem; color:#e74c3c; font-size:0.7rem;"><strong>⚠️ Códigos dañados:</strong> ';
                var danadosHtml = [];
                for (var j = 0; j < danados.length; j++) {
                    danadosHtml.push('<span style="font-family:monospace;">' + danados[j].codigo + '</span>');
                }
                html += danadosHtml.join(', ');
                html += '</div>';
            }

            contenidoEl.innerHTML = html;
            panel.style.display = 'block';

            btnDescargar.onclick = function() {
                generarAhkPosicion(pos, false);
            };
            btnCopiar.onclick = function() {
                generarAhkPosicion(pos, true);
            };
            btnEliminarTodos.onclick = function() {
                if (!confirm('¿Eliminar todos los items de la posición ' + pos + '?')) return;
                eliminarPosicionCompleta(pos);
            };

            var deleteBtns = contenidoEl.querySelectorAll('.detalle-eliminar-item');
            for (var k = 0; k < deleteBtns.length; k++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var pos = this.dataset.pos;
                        var idx = parseInt(this.dataset.idx);
                        eliminarItemDePosicion(pos, idx);
                    });
                })(deleteBtns[k]);
            }
        }

        function eliminarPosicionCompleta(pos) {
            datosActuales[pos] = [];
            resultadosProcesados[pos] = [];
            danadosPorPosicion[pos] = [];
            
            var textbox = document.getElementById('seccionadorInput');
            if (textbox) {
                var textoActual = textbox.value;
                var secciones = extraerSecciones(textoActual);
                var posIndex = secciones.posiciones.indexOf(pos);
                if (posIndex !== -1) {
                    var partes = textoActual.split(SEPARADOR);
                    partes.splice(posIndex, 1);
                    var nuevoTexto = partes.join(SEPARADOR);
                    textbox.value = nuevoTexto;
                }
            }
            
            renderizarTablas();
            mostrarResumen();
            cerrarDetalle();
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Posición ' + pos + ' eliminada completamente.';
        }

        function cerrarDetalle() {
            document.getElementById('posicionDetallePanel').style.display = 'none';
            posicionDetalleActual = null;
            posicionResaltada = null;
            var outputDiv = document.getElementById('seccionadorOutput');
            var prevResaltados = outputDiv.querySelectorAll('.posicion-resaltada');
            prevResaltados.forEach(function(el) {
                el.style.background = '';
                el.style.border = '';
                el.style.boxShadow = '';
                el.classList.remove('posicion-resaltada');
                var titulo = el.querySelector('h4');
                if (titulo) {
                    var posSpan = titulo.querySelector('.pos-nombre');
                    if (posSpan) {
                        posSpan.style.color = '';
                    }
                }
            });
        }

        function eliminarItemDePosicion(pos, idx) {
            var items = datosActuales[pos] || [];
            if (idx >= items.length) return;
            if (!confirm('¿Eliminar el item ' + (idx+1) + ' de ' + pos + '?')) return;
            
            var codigoEliminar = items[idx].CODIGO_EAN13;
            items.splice(idx, 1);
            resultadosProcesados[pos] = items;
            
            var textbox = document.getElementById('seccionadorInput');
            if (textbox && codigoEliminar) {
                var textoActual = textbox.value;
                var secciones = extraerSecciones(textoActual);
                var posIndex = secciones.posiciones.indexOf(pos);
                if (posIndex !== -1) {
                    var partes = textoActual.split(SEPARADOR);
                    if (posIndex < partes.length) {
                        var seccion = partes[posIndex];
                        var codigos = seccion.split(/\s+/).filter(function(c) { return c.trim() !== ''; });
                        var nuevosCodigos = codigos.filter(function(c) { return c !== codigoEliminar; });
                        partes[posIndex] = nuevosCodigos.join(' ');
                        var nuevoTexto = partes.join(SEPARADOR);
                        textbox.value = nuevoTexto;
                    }
                }
            }
            
            renderizarTablas();
            mostrarResumen();
            if (posicionDetalleActual === pos) {
                mostrarDetallePosicion(pos);
            }
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Item eliminado de ' + pos + '.';
        }

        // ============================================================
        // FUNCIONES PARA GENERAR AHK PASSTHROUGH (CORREGIDAS)
        // ============================================================

        function generarAhkCrearFolios() {
            var secciones = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                if (items.length === 0) continue;
                var codigos = [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (item.CODIGO_EAN13) {
                        var cantidad = parseInt(item.CANTIDAD) || 1;
                        for (var k = 0; k < cantidad; k++) {
                            codigos.push(item.CODIGO_EAN13);
                        }
                    }
                }
                if (codigos.length > 0) {
                    secciones.push({ posicion: pos, codigos: codigos });
                }
            }

            if (secciones.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK. Procesa primero.';
                return null;
            }

            var totalCodigos = 0;
            secciones.forEach(function(sec) { totalCodigos += sec.codigos.length; });

            var ahk = '#SingleInstance Force\n\n';
            ahk += '; AHK Crear Folios (códigos originales - Passthrough)\n';
            ahk += '; Secciones: ' + secciones.length + ' · Total envíos: ' + totalCodigos + '\n\n';
            ahk += 'abort := false\n\n';
            ahk += '^q::\n';
            ahk += '    abort := false\n';

            for (var s = 0; s < secciones.length; s++) {
                var sec = secciones[s];
                var codigosStr = sec.codigos.map(function(c) { return '"' + c + '"'; }).join(', ');
                ahk += '    ; === Sección ' + sec.posicion + ' (' + sec.codigos.length + ' códigos) ===\n';
                ahk += '    codigos := [' + codigosStr + ']\n';
                ahk += '    Loop, % codigos.Length()\n';
                ahk += '    {\n';
                ahk += '        if abort\n';
                ahk += '            break\n';
                ahk += '        SendInput % codigos[A_Index] {Enter}\n';
                ahk += '        Sleep 101\n';
                ahk += '    }\n';
                ahk += '    SendInput {F2}\n';
                ahk += '    Sleep 100\n';
                ahk += '    SendInput {Right}\n';
                ahk += '    Sleep 100\n';
                ahk += '    SendInput {Enter}\n';
                ahk += '    Sleep 100\n';
                ahk += '    if abort\n';
                ahk += '        break\n';
            }

            ahk += '    SoundBeep\n';
            ahk += 'Return\n\n';
            ahk += 'Esc::\n';
            ahk += '    abort := true\n';
            ahk += '    Send, {Esc}\n';
            ahk += 'Return';

            return { ahk: ahk, totalCodigos: totalCodigos, totalSecciones: secciones.length };
        }

        function generarAhkCancelarFolios() {
            var posicionesConItems = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                if (items.length > 0) {
                    posicionesConItems.push(pos);
                }
            }

            if (posicionesConItems.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay posiciones con datos para generar AHK.';
                return null;
            }

            var ahk = '#SingleInstance Force\n\n';
            ahk += '; AHK Cancelar Folios (F6 + BODEGA + posición)\n';
            ahk += '; Total: ' + posicionesConItems.length + ' posiciones\n\n';
            ahk += 'abort := false\n\n';
            ahk += '^q::\n';
            ahk += '    abort := false\n';
            ahk += '    posiciones := Object()\n';
            for (var i = 0; i < posicionesConItems.length; i++) {
                ahk += '    posiciones[' + (i+1) + '] := "' + posicionesConItems[i] + '"\n';
            }
            ahk += '    totalPosiciones := posiciones.Length()\n';
            ahk += '    Loop, %totalPosiciones%\n';
            ahk += '    {\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        posicion := posiciones[A_Index]\n';
            ahk += '        SendInput {F6}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput 1295\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput {Enter}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput {Left}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput {Enter}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput BODEGA %posicion%\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput {Enter}{Enter}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '        SendInput {Down}\n';
            ahk += '        Sleep 100\n';
            ahk += '        if abort\n';
            ahk += '            break\n';
            ahk += '    }\n';
            ahk += '    SoundBeep\n';
            ahk += 'Return\n\n';
            ahk += 'Esc::\n';
            ahk += '    abort := true\n';
            ahk += '    Send, {Esc}\n';
            ahk += 'Return';

            return { ahk: ahk, totalPosiciones: posicionesConItems.length };
        }

        // ============================================================
        // EVENT LISTENERS PARA LOS NUEVOS BOTONES
        // ============================================================

        var btnCrear = document.getElementById('descargarAhkSeccionesBtn');
        if (btnCrear) {
            btnCrear.addEventListener('click', function() {
                var result = generarAhkCrearFolios();
                if (!result) return;
                var blob = new Blob([result.ahk], { type: 'text/plain' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'seccionador_crear_folios_' + core.generarNombreFecha('ahk');
                a.click();
                URL.revokeObjectURL(url);
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Crear Folios descargado (' + result.totalCodigos + ' códigos, ' + result.totalSecciones + ' secciones).';
                setTimeout(function() {
                    var msgEl = document.getElementById('seccionadorMessage');
                    if (msgEl.innerHTML.indexOf('AHK Crear Folios') !== -1) msgEl.innerHTML = '';
                }, 3000);
            });
        }

        var btnCancelar = document.getElementById('descargarAhkPosicionesBtn');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                var result = generarAhkCancelarFolios();
                if (!result) return;
                var blob = new Blob([result.ahk], { type: 'text/plain' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'seccionador_cancelar_folios_' + core.generarNombreFecha('ahk');
                a.click();
                URL.revokeObjectURL(url);
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Cancelar Folios descargado (' + result.totalPosiciones + ' posiciones).';
                setTimeout(function() {
                    var msgEl = document.getElementById('seccionadorMessage');
                    if (msgEl.innerHTML.indexOf('AHK Cancelar Folios') !== -1) msgEl.innerHTML = '';
                }, 3000);
            });
        }

        // ============================================================
        // RENDERIZAR TABLA DE ITEMS (orden ascendente por modelo)
        // ============================================================

        function renderTablaItems(items, pos) {
            if (!items || items.length === 0) return '';

            var itemsOrdenados = items.slice().sort(function(a, b) {
                return (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0);
            });

            var html = '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.7rem; color:#ffffff;">';
            html += '<thead style="background:#222;"><tr>';
            html += '<th style="color:#ffffff;">MODELO</th><th style="color:#ffffff;">LINEA</th><th style="color:#ffffff;">TIPO</th><th style="color:#ffffff;">TALLA</th><th style="color:#ffffff;">CANTIDAD</th><th style="color:#ffffff;">CÓDIGO EAN-13</th><th style="color:#ffffff;">ACCIONES</th>';
            html += '</tr></thead><tbody>';

            for (var i = 0; i < itemsOrdenados.length; i++) {
                var item = itemsOrdenados[i];
                var modoEdicion = item.editando || false;
                var bgNormal = (item.tipoTalla === 'normal') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
                var bgPants = (item.tipoTalla === 'pantalon') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
                var bgBelt = (item.tipoTalla === 'cinto') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';

                html += '<tr style="border-bottom:1px solid #333;">';
                html += '<td style="color:#ffffff;">' + (item.MODELO || '') + '</td>';
                html += '<td style="color:#ffffff;">' + (item.LINEA || '') + '</td>';
                html += '<td style="color:#ffffff;">' + (item.TIPO || '') + '</td>';

                if (modoEdicion) {
                    html += '<td><input type="text" class="talla-edit" data-pos="' + pos + '" data-idx="' + i + '" value="' + (item.TALLA || '') + '" style="width:60px; background:var(--blud); color:white; border:1px solid #444; border-radius:3px; padding:0.1rem 0.2rem; font-size:0.65rem;"></td>';
                    html += '<td><input type="number" class="cantidad-edit" data-pos="' + pos + '" data-idx="' + i + '" value="' + (item.CANTIDAD || 1) + '" min="1" style="width:50px; background:var(--blud); color:white; border:1px solid #444; border-radius:3px; padding:0.1rem 0.2rem; font-size:0.65rem;"></td>';
                } else {
                    html += '<td style="color:#ffffff;">' + (item.TALLA || '') + '</td>';
                    html += '<td style="color:#ffffff;">' + (item.CANTIDAD || 1) + '</td>';
                }

                html += '<td style="font-family:monospace; font-weight:bold; font-size:0.7rem; color:#ffffff;">' + (item.CODIGO_EAN13 || '') + '</td>';

                html += '<td style="white-space:nowrap; font-size:0.6rem;">';
                if (modoEdicion) {
                    html += '<button class="save-edit-btn" data-pos="' + pos + '" data-idx="' + i + '" style="background:#2ecc71; border:1px solid #2ecc71; color:#000; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Guardar"><i class="fas fa-save"></i></button>';
                    html += '<button class="cancel-edit-btn" data-pos="' + pos + '" data-idx="' + i + '" style="background:#ffa500; border:1px solid #ffa500; color:#000; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Cancelar"><i class="fas fa-times"></i></button>';
                } else {
                    html += '<button class="edit-row-btn" data-pos="' + pos + '" data-idx="' + i + '" style="background:#3498db; border:1px solid #3498db; color:white; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Editar"><i class="fas fa-pen"></i></button>';
                    html += '<button class="talla-btn-sec" data-pos="' + pos + '" data-idx="' + i + '" data-tipo="normal" style="' + bgNormal + ' border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Calzado"><i class="fas fa-shoe-prints"></i></button>';
                    html += '<button class="talla-btn-sec" data-pos="' + pos + '" data-idx="' + i + '" data-tipo="pantalon" style="' + bgPants + ' border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Pantalón"><i class="fas fa-tag"></i></button>';
                    html += '<button class="talla-btn-sec" data-pos="' + pos + '" data-idx="' + i + '" data-tipo="cinto" style="' + bgBelt + ' border:1px solid #555; border-radius:3px; cursor:pointer; padding:0.1rem 0.3rem; margin:0 1px;" title="Cinto"><i class="fas fa-circle"></i></button>';
                    html += '<button class="delete-row-btn-sec" data-pos="' + pos + '" data-idx="' + i + '" style="background:#e74c3c; border:1px solid #e74c3c; color:#fff; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Eliminar"><i class="fas fa-trash"></i></button>';
                    html += '<button class="copy-row-btn-sec" data-codigo="' + (item.CODIGO_EAN13 || '') + '" style="background:#444; border:1px solid #555; color:white; padding:0.1rem 0.3rem; border-radius:3px; cursor:pointer;" title="Copiar"><i class="fas fa-copy"></i></button>';
                }
                html += '</td>';
                html += '</tr>';
            }

            html += '</tbody></table>';
            return html;
        }

        // ============================================================
        // RENDERIZAR TABLAS (output principal) 
        // ============================================================

        function renderizarTablas() {
            var outputDiv = document.getElementById('seccionadorOutput');
            var html = '';

            var posicionesAMostrar;
            if (usarOrdenEscaneo && posicionesOrdenEscaneo.length > 0) {
                posicionesAMostrar = posicionesOrdenEscaneo;
            } else {
                posicionesAMostrar = posicionesOrden.slice().sort(function(a, b) {
                    var letraA = a.charAt(0);
                    var letraB = b.charAt(0);
                    var numA = parseInt(a.substring(1));
                    var numB = parseInt(b.substring(1));
                    if (letraA !== letraB) return letraA.localeCompare(letraB);
                    return numA - numB;
                });
            }

            for (var i = 0; i < posicionesAMostrar.length; i++) {
                var pos = posicionesAMostrar[i];
                var items = datosActuales[pos] || [];
                var danados = danadosPorPosicion[pos] || [];
                var total = items.length + danados.length;
                if (total === 0) continue;

                var esResaltada = (pos === posicionResaltada);
                var borderStyle = esResaltada ? '2px solid #2ecc71' : '1px solid #444';
                var bgStyle = esResaltada ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0,0,0,0.1)';
                var boxShadow = esResaltada ? '0 0 15px rgba(46, 204, 113, 0.3)' : 'none';

                var posDisplay = pos;
                if (esResaltada) {
                    posDisplay = '<span class="pos-nombre" style="color:#2ecc71;">' + pos + '</span>';
                }

                html += '<div style="margin-top:1rem; border:' + borderStyle + '; border-radius:6px; padding:0.5rem; background:' + bgStyle + '; box-shadow:' + boxShadow + ';" data-pos="' + pos + '" class="' + (esResaltada ? 'posicion-resaltada' : '') + '">';
                html += '<h4 style="color:#f1c40f; margin:0 0 0.3rem 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.3rem;">';
                html += '<span><i class="fas fa-box"></i> Posición ' + posDisplay + ' (' + items.length + ' items' + (danados.length > 0 ? ', ' + danados.length + ' dañados' : '') + ')</span>';
                html += '<span style="display:flex; gap:0.3rem; flex-wrap:wrap;">';
                html += '<button class="generarAhkPosBtn" data-pos="' + pos + '" style="background:#ffa500; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-code"></i> Descargar AHK</button>';
                html += '<button class="copiarAhkPosBtn" data-pos="' + pos + '" style="background:#444; border-color:#ffa500; padding:0.1rem 0.5rem; font-size:0.6rem;"><i class="fas fa-copy"></i> Copiar AHK</button>';
                html += '</span></h4>';

                if (items.length > 0) {
                    html += renderTablaItems(items, pos);
                }

                if (danados.length > 0) {
                    html += '<div style="font-size:0.7rem; color:#e74c3c; margin-top:0.3rem;">⚠️ ' + danados.length + ' código(s) dañado(s): ';
                    var danadosHtml = [];
                    for (var j = 0; j < danados.length; j++) {
                        danadosHtml.push('<span style="font-family:monospace;">' + danados[j].codigo + '</span>');
                    }
                    html += danadosHtml.join(', ');
                    html += '</div>';
                }

                html += '</div>';
            }

            if (html === '') {
                html = '<p style="color:#666;">No hay datos para mostrar. Procesa primero.</p>';
            }

            outputDiv.innerHTML = html;

            var btns = outputDiv.querySelectorAll('.generarAhkPosBtn');
            for (var k = 0; k < btns.length; k++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var pos = this.dataset.pos;
                        generarAhkPosicion(pos, false);
                    });
                })(btns[k]);
            }

            var btns2 = outputDiv.querySelectorAll('.copiarAhkPosBtn');
            for (var l = 0; l < btns2.length; l++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var pos = this.dataset.pos;
                        generarAhkPosicion(pos, true);
                    });
                })(btns2[l]);
            }
        }

        // ============================================================
        // FUNCIONES DE EDICIÓN Y ACCIONES
        // ============================================================

        function guardarEdicion(pos, idx) {
            var items = datosActuales[pos] || [];
            if (idx >= items.length) return;

            var tr = document.querySelector('#seccionadorOutput .talla-edit[data-pos="' + pos + '"][data-idx="' + idx + '"]');
            if (!tr) {
                tr = document.querySelector('#seccionadorOutput .talla-edit[data-pos="' + pos + '"][data-idx="' + idx + '"]')?.closest('tr');
            }
            if (!tr) return;

            var tallaInput = tr.querySelector('.talla-edit');
            var cantidadInput = tr.querySelector('.cantidad-edit');

            var item = items[idx];
            if (tallaInput) item.TALLA = tallaInput.value.trim();
            if (cantidadInput) {
                var nuevaCant = parseInt(cantidadInput.value);
                if (!isNaN(nuevaCant) && nuevaCant > 0) item.CANTIDAD = nuevaCant;
            }
            item.editando = false;

            var lib = core.obtenerBiblioteca();
            var encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (encontrado) {
                var codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                if (item.CODIGO_EAN13 && item.CODIGO_EAN13.length === 14) {
                    if (codigoEAN.slice(-1) !== '0') {
                        item.CODIGO_EAN13 = codigoEAN + '0';
                    } else {
                        item.CODIGO_EAN13 = codigoEAN;
                    }
                } else {
                    item.CODIGO_EAN13 = codigoEAN;
                }
            }

            renderizarTablas();
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Fila ' + (idx+1) + ' de ' + pos + ' actualizada.';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('actualizada') !== -1) msgEl.innerHTML = ''; 
            }, 2000);
        }

        function cambiarTallaSec(pos, idx, nuevoTipo) {
            var items = datosActuales[pos] || [];
            if (idx >= items.length) return;

            var item = items[idx];
            var lib = core.obtenerBiblioteca();
            var encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
            if (!encontrado) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontró código para ' + item.MODELO + ' ' + item.LINEA + ' ' + item.TIPO;
                return;
            }

            var resultado = core.obtenerCodigoTallaEspecial(item.TALLA, nuevoTipo, item.MODELO);
            var codigoEAN = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
            
            item.tipoTalla = resultado.categoria || nuevoTipo;
            if (item.CODIGO_EAN13 && item.CODIGO_EAN13.length === 14) {
                if (codigoEAN.slice(-1) !== '0') {
                    item.CODIGO_EAN13 = codigoEAN + '0';
                } else {
                    item.CODIGO_EAN13 = codigoEAN;
                }
            } else {
                item.CODIGO_EAN13 = codigoEAN;
            }

            renderizarTablas();
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> ' + pos + ' ' + item.MODELO + ' cambiado a ' + nuevoTipo + '.';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('cambiado') !== -1) msgEl.innerHTML = ''; 
            }, 2000);
        }

        function eliminarFilaSec(pos, idx) {
            var items = datosActuales[pos] || [];
            if (idx >= items.length) return;
            if (!confirm('¿Eliminar fila ' + (idx+1) + ' de ' + pos + '?')) return;
            
            var codigoEliminar = items[idx].CODIGO_EAN13;
            items.splice(idx, 1);
            resultadosProcesados[pos] = items;
            
            var textbox = document.getElementById('seccionadorInput');
            if (textbox && codigoEliminar) {
                var textoActual = textbox.value;
                var secciones = extraerSecciones(textoActual);
                var posIndex = secciones.posiciones.indexOf(pos);
                if (posIndex !== -1) {
                    var partes = textoActual.split(SEPARADOR);
                    if (posIndex < partes.length) {
                        var seccion = partes[posIndex];
                        var codigos = seccion.split(/\s+/).filter(function(c) { return c.trim() !== ''; });
                        var nuevosCodigos = codigos.filter(function(c) { return c !== codigoEliminar; });
                        partes[posIndex] = nuevosCodigos.join(' ');
                        var nuevoTexto = partes.join(SEPARADOR);
                        textbox.value = nuevoTexto;
                    }
                }
            }
            
            renderizarTablas();
            mostrarResumen();
            if (posicionDetalleActual === pos) {
                mostrarDetallePosicion(pos);
            }
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Fila eliminada de ' + pos + '.';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('eliminada') !== -1) msgEl.innerHTML = ''; 
            }, 2000);
        }

        function generarAhkPosicion(pos, copiar) {
            var items = datosActuales[pos] || [];
            if (items.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos en ' + pos + '.';
                return;
            }

            var codigos = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.CODIGO_EAN13) {
                    var cantidad = item.CANTIDAD || 1;
                    for (var j = 0; j < cantidad; j++) {
                        codigos.push(item.CODIGO_EAN13);
                    }
                }
            }

            if (codigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos válidos en ' + pos + '.';
                return;
            }

            var ahk = core.generarAHKDesdeCodigos(codigos, 'Seccionador ' + pos + ' (' + codigos.length + ' códigos)');
            if (!ahk) return;

            if (copiar) {
                core.copiarTexto(ahk, 'seccionadorCopyFeedback');
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK de ' + pos + ' copiado (' + codigos.length + ' códigos).';
            } else {
                var blob = new Blob([ahk], { type: 'text/plain' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'seccionador_' + pos + '_' + core.generarNombreFecha('ahk');
                a.click();
                URL.revokeObjectURL(url);
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK de ' + pos + ' descargado (' + codigos.length + ' códigos).';
            }
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('AHK') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        // ============================================================
        // BACKUP: GENERAR CSV SIMPLE
        // ============================================================

        function generarBackupCSV() {
            var filas = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    filas.push({
                        MODELO: item.MODELO || '',
                        LINEA: item.LINEA || '',
                        TIPO: item.TIPO || '',
                        TALLA: item.TALLA || '',
                        CANTIDAD: item.CANTIDAD || 1,
                        POSICION: pos
                    });
                }
            }
            return filas;
        }

        function descargarBackupCSV() {
            var filas = generarBackupCSV();
            if (filas.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para generar backup.';
                return;
            }
            var csv = core.dfToCsv(filas, ',', true, true);
            var filename = 'backup_seccionador_' + core.generarNombreFecha('csv');
            core.downloadCsv(csv, filename);
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Backup CSV descargado (' + filas.length + ' filas).';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('CSV') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        // ============================================================
        // SUBIR BACKUP A WIX
        // ============================================================

        async function subirBackupWix() {
            var statusEl = document.getElementById('wixStatus');
            var filas = generarBackupCSV();
            if (filas.length === 0) {
                statusEl.textContent = '⚠️ No hay datos para subir.';
                return;
            }

            var csv = core.dfToCsv(filas, ',', true, true);
            var CHUNK_SIZE = 500000;
            var DELAY_MS = 200;
            var totalChunks = Math.ceil(csv.length / CHUNK_SIZE);
            var uploadId = 'backup_' + Date.now();

            statusEl.textContent = 'Subiendo backup a Wix...';

            for (var chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
                var start = chunkIdx * CHUNK_SIZE;
                var end = Math.min(start + CHUNK_SIZE, csv.length);
                var chunk = csv.substring(start, end);

                var progress = Math.round(((chunkIdx + 1) / totalChunks) * 100);
                statusEl.textContent = 'Subiendo ' + (chunkIdx+1) + '/' + totalChunks + ' (' + progress + '%)...';

                var payload = JSON.stringify({
                    chunkIndex: chunkIdx,
                    totalChunks: totalChunks,
                    uploadId: uploadId,
                    chunkData: chunk
                });

                try {
                    var response = await fetch(WIX_API_URL + '/seccionadorBackup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json; charset=utf-8' },
                        body: payload
                    });

                    if (!response.ok) throw new Error('Error ' + response.status);
                    var result = await response.json();

                    if (result.complete) {
                        statusEl.textContent = '✅ Backup subido a Wix correctamente.';
                    }
                } catch (error) {
                    statusEl.textContent = '❌ Error en parte ' + (chunkIdx+1) + ': ' + error.message;
                    return;
                }

                if (chunkIdx < totalChunks - 1) await new Promise(function(r) { setTimeout(r, DELAY_MS); });
            }
        }

        // ============================================================
        // ELIMINAR ENCONTRADOS (desde búsqueda)
        // ============================================================

        function eliminarEncontrados() {
            if (!ultimaBusqueda) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay búsqueda activa.';
                return;
            }
            var busqueda = ultimaBusqueda;
            var tokens = busqueda.trim().split(/\s+/);
            if (tokens.length < 3) return;
            var modeloBuscado = tokens[0];
            var lineaBuscada = tokens[1].toUpperCase();
            var tipoBuscado = tokens[2].toUpperCase();
            var tallaBuscada = tokens.length > 3 ? tokens[3] : '';

            var eliminados = 0;
            for (var p = 0; p < posicionesOrden.length; p++) {
                var pos = posicionesOrden[p];
                var items = datosActuales[pos] || [];
                var nuevosItems = [];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var itemLinea = String(item.LINEA || '').toUpperCase();
                    var itemTipo = String(item.TIPO || '').toUpperCase();
                    var modeloMatch = item.MODELO === modeloBuscado;
                    var lineaMatch = itemLinea === lineaBuscada || lineaBuscada === 'XX' || !lineaBuscada;
                    var tipoMatch = itemTipo === tipoBuscado || tipoBuscado === 'XX' || !tipoBuscado;
                    if (modeloMatch && lineaMatch && tipoMatch) {
                        if (tallaBuscada && item.TALLA !== tallaBuscada) {
                            nuevosItems.push(item);
                            continue;
                        }
                        var textbox = document.getElementById('seccionadorInput');
                        if (textbox && item.CODIGO_EAN13) {
                            var textoActual = textbox.value;
                            var secciones = extraerSecciones(textoActual);
                            var posIndex = secciones.posiciones.indexOf(pos);
                            if (posIndex !== -1) {
                                var partes = textoActual.split(SEPARADOR);
                                if (posIndex < partes.length) {
                                    var seccion = partes[posIndex];
                                    var codigos = seccion.split(/\s+/).filter(function(c) { return c.trim() !== ''; });
                                    var nuevosCodigos = codigos.filter(function(c) { return c !== item.CODIGO_EAN13; });
                                    partes[posIndex] = nuevosCodigos.join(' ');
                                    var nuevoTexto = partes.join(SEPARADOR);
                                    textbox.value = nuevoTexto;
                                }
                            }
                        }
                        eliminados++;
                    } else {
                        nuevosItems.push(item);
                    }
                }
                datosActuales[pos] = nuevosItems;
                resultadosProcesados[pos] = nuevosItems;
            }

            renderizarTablas();
            mostrarResumen();
            document.getElementById('busquedaResultado').innerHTML = '';
            document.getElementById('eliminarEncontradosBtn').style.display = 'none';
            ultimaBusqueda = null;
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Eliminados ' + eliminados + ' items que coincidían con la búsqueda.';
        }

        // ============================================================
        // CARGAR DESDE WIX (CON REINTENTOS)
        // ============================================================

        async function cargarDesdeWixConReintentos(maxIntentos) {
            maxIntentos = maxIntentos || 3;
            var intento = 0;
            while (intento < maxIntentos) {
                try {
                    var response = await fetch(WIX_API_URL + '/seccionadorData');
                    if (response.ok) {
                        var text = await response.text();
                        if (text && text !== 'SIN_DATOS') {
                            return JSON.parse(text);
                        }
                        return null;
                    } else {
                        throw new Error('HTTP ' + response.status);
                    }
                } catch (error) {
                    intento++;
                    if (intento < maxIntentos) {
                        await new Promise(function(r) { setTimeout(r, 500 * intento); }); // backoff
                    } else {
                        throw error;
                    }
                }
            }
            return null;
        }

        async function cargarDesdeWix() {
            var statusEl = document.getElementById('wixStatus');
            var msgEl = document.getElementById('seccionadorMessage');
            statusEl.textContent = 'Cargando desde Wix...';

            try {
                var data = await cargarDesdeWixConReintentos(3);
                if (!data) {
                    statusEl.textContent = '⚠️ No hay datos guardados en Wix.';
                    return;
                }

                var textoReconstruido = '';
                var posiciones = data.posiciones || [];
                var datos = data.datos || {};

                for (var i = 0; i < posiciones.length; i++) {
                    var pos = posiciones[i];
                    var items = datos[pos] || [];
                    var codigos = [];
                    for (var j = 0; j < items.length; j++) {
                        var item = items[j];
                        if (item.CODIGO_EAN13) {
                            codigos.push(item.CODIGO_EAN13);
                        }
                    }
                    if (codigos.length > 0) {
                        if (i > 0) textoReconstruido += SEPARADOR + '\n';
                        textoReconstruido += codigos.join('\n');
                    }
                }

                var textbox = document.getElementById('seccionadorInput');
                if (textbox) {
                    textbox.value = textoReconstruido;
                }

                posicionesOrden = data.posiciones || [];
                posicionesOrdenEscaneo = data.posiciones || [];
                datosActuales = data.datos || {};

                resultadosProcesados = {};
                danadosPorPosicion = {};
                for (var p = 0; p < posicionesOrden.length; p++) {
                    var pos = posicionesOrden[p];
                    var items = datosActuales[pos] || [];
                    resultadosProcesados[pos] = items.map(function(item) { 
                        var newItem = {};
                        for (var key in item) {
                            if (item.hasOwnProperty(key)) {
                                newItem[key] = item[key];
                            }
                        }
                        return newItem;
                    });
                    danadosPorPosicion[pos] = [];
                }

                var totalEANs = 0;
                var validos = 0;
                for (p = 0; p < posicionesOrden.length; p++) {
                    pos = posicionesOrden[p];
                    items = datosActuales[pos] || [];
                    totalEANs += items.length;
                    validos += items.filter(function(i) { return i.CODIGO_EAN13; }).length;
                }

                document.getElementById('totalEans').textContent = totalEANs;
                document.getElementById('validosCount').textContent = validos;
                document.getElementById('danadosCount').textContent = 0;

                var seccionesConDatos = posicionesOrden.filter(function(p) { return (datosActuales[p] || []).length > 0; }).length;
                document.getElementById('totalSecciones').textContent = seccionesConDatos;

                mostrarResumen();
                renderizarTablas();
                statusEl.textContent = '✅ Datos cargados desde Wix.';
                msgEl.innerHTML = '<i class="fas fa-check-circle"></i> Cargados ' + totalEANs + ' EANs en ' + seccionesConDatos + ' secciones.';

            } catch (error) {
                statusEl.textContent = '❌ Error al cargar: ' + error.message;
                msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al cargar desde Wix: ' + error.message;
                console.warn('Error cargando Wix:', error);
            }
        }

        // ============================================================
        // PROCESAR SECCIONES (función principal)
        // ============================================================

        function procesarSecciones() {
            var texto = document.getElementById('seccionadorInput').value;
            if (!texto.trim()) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto con códigos separados por SSSSSSSS.';
                return;
            }

            var lib = core.obtenerBiblioteca();
            if (!lib || lib.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                return;
            }

            var autocompletar = document.getElementById('autocompletarCheckbox').checked;
            if (autocompletar) {
                var textoOriginal = texto;
                texto = autocompletarTexto(texto);
                if (texto !== textoOriginal) {
                    document.getElementById('seccionadorInput').value = texto;
                }
            }

            var result = extraerSecciones(texto);
            var secciones = result.secciones;
            var posiciones = result.posiciones;
            
            if (secciones.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron secciones válidas.';
                return;
            }

            var mostrarDanadosCheckbox = document.getElementById('mostrarDanadosCheckbox').checked;

            posicionesOrden = [];
            posicionesOrdenEscaneo = [];
            resultadosProcesados = {};
            danadosPorPosicion = {};
            datosActuales = {};
            posicionResaltada = null;

            var totalEANs = 0;
            var totalInvalidos = 0;
            var validos = 0;

            for (var i = 0; i < secciones.length; i++) {
                var pos = posiciones[i] || generarPosicionDesdeIndice(i);
                var contenido = secciones[i];
                var codigos = decodificarEANs(contenido);
                
                if (codigos.length === 0) continue;

                if (posicionesOrden.indexOf(pos) === -1) {
                    posicionesOrden.push(pos);
                }
                posicionesOrdenEscaneo.push(pos);

                var items = [];
                var danados = [];

                for (var k = 0; k < codigos.length; k++) {
                    var codigo = codigos[k];
                    totalEANs++;
                    var codigoParaDecodificar = codigo;
                    if (codigo.length === 14) {
                        codigoParaDecodificar = codigo.slice(0, 13);
                    }
                    var decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                    
                    if (decodificado && decodificado.valido) {
                        validos++;
                        var resultado = core.obtenerCodigoTallaEspecial(decodificado.talla, 'normal', decodificado.modelo);
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

                resultadosProcesados[pos] = items;
                danadosPorPosicion[pos] = danados;
                datosActuales[pos] = items.map(function(item) { 
                    var newItem = {};
                    for (var key in item) {
                        if (item.hasOwnProperty(key)) {
                            newItem[key] = item[key];
                        }
                    }
                    newItem.editando = false;
                    return newItem;
                });
            }

            document.getElementById('totalEans').textContent = totalEANs;
            document.getElementById('validosCount').textContent = validos;
            document.getElementById('danadosCount').textContent = totalInvalidos;

            var seccionesConDatos = 0;
            for (var key in resultadosProcesados) {
                if (resultadosProcesados[key].length > 0) seccionesConDatos++;
            }
            document.getElementById('totalSecciones').textContent = seccionesConDatos;

            mostrarResumen();
            mostrarDanados(mostrarDanadosCheckbox);
            renderizarTablas();

            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Procesado: ' + totalEANs + ' EANs en ' + seccionesConDatos + ' secciones. Válidos: ' + validos + ', dañados: ' + totalInvalidos + '.';
        }

        // ============================================================
        // BUSCAR CALZADO
        // ============================================================

        function buscarCalzado() {
            var busqueda = document.getElementById('buscarInput').value;
            var resultadoDiv = document.getElementById('busquedaResultado');
            
            if (!busqueda.trim()) {
                resultadoDiv.innerHTML = '<span style="color:#f1c40f;">⚠️ Escribe al menos un modelo para buscar.</span>';
                document.getElementById('eliminarEncontradosBtn').style.display = 'none';
                ultimaBusqueda = null;
                return;
            }

            var busquedas = busqueda.split(/[\n,]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
            
            if (busquedas.length === 0) {
                resultadoDiv.innerHTML = '<span style="color:#f1c40f;">⚠️ No hay búsquedas válidas.</span>';
                document.getElementById('eliminarEncontradosBtn').style.display = 'none';
                ultimaBusqueda = null;
                return;
            }

            var lib = core.obtenerBiblioteca();
            var resultadosHtml = '';
            var hayResultados = false;

            for (var b = 0; b < busquedas.length; b++) {
                var busquedaItem = busquedas[b];
                var tokens = busquedaItem.trim().split(/\s+/);
                if (tokens.length < 3) {
                    resultadosHtml += '<div style="color:#f1c40f;">⚠️ Formato inválido: "' + busquedaItem + '" (MODELO LINEA TIPO [TALLA])</div>';
                    continue;
                }

                var modeloBuscado = tokens[0];
                var lineaBuscada = tokens.length > 1 ? tokens[1].toUpperCase().trim() : '';
                var tipoBuscado = tokens.length > 2 ? tokens[2].toUpperCase().trim() : '';
                var tallaBuscada = tokens.length > 3 ? tokens[3] : '';

                var lineaMatchAny = (lineaBuscada === 'XX' || lineaBuscada === '');
                var tipoMatchAny = (tipoBuscado === 'XX' || tipoBuscado === '');

                var encontradosEnLib = lib.filter(function(item) { return String(item.MODELO).trim() === modeloBuscado.trim(); });

                var resultados = [];
                var totalCantidad = 0;

                for (var p = 0; p < posicionesOrden.length; p++) {
                    var pos = posicionesOrden[p];
                    var items = datosActuales[pos] || [];
                    var cantidadEnPos = 0;
                    for (var it = 0; it < items.length; it++) {
                        var item = items[it];
                        var itemLinea = String(item.LINEA || '').toUpperCase();
                        var itemTipo = String(item.TIPO || '').toUpperCase();
                        var modeloMatch = item.MODELO === modeloBuscado;
                        var lineaMatch = lineaMatchAny || itemLinea === lineaBuscada;
                        var tipoMatch = tipoMatchAny || itemTipo === tipoBuscado;
                        
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
                    var sugerencia = '';
                    if (encontradosEnLib.length > 0) {
                        var primero = encontradosEnLib[0];
                        sugerencia = modeloBuscado + ' ' + primero.LINEA + ' ' + primero.TIPO + (tallaBuscada ? ' ' + tallaBuscada : '');
                    }
                    resultadosHtml += '<div style="color:#e74c3c;">❌ "' + busquedaItem + '" no encontrado' + (sugerencia ? ' (¿quisiste decir: "' + sugerencia + '"?)' : '') + '</div>';
                    continue;
                }

                hayResultados = true;
                var posMap = {};
                for (var r = 0; r < resultados.length; r++) {
                    var rr = resultados[r];
                    if (!posMap[rr.pos]) posMap[rr.pos] = 0;
                    posMap[rr.pos] += rr.item.CANTIDAD || 1;
                }

                var posKeys = Object.keys(posMap);
                var posHtml = '';
                for (var pk = 0; pk < posKeys.length; pk++) {
                    var pKey = posKeys[pk];
                    var total = posMap[pKey];
                    posHtml += '<span style="background:#2ecc71; color:#000; cursor:pointer; padding:0.1rem 0.5rem; border-radius:3px; margin:0.1rem; font-weight:bold;" onclick="window.mostrarDetallePosicion(\'' + pKey + '\')">' + pKey + '(' + total + ')</span>';
                }
                
                var nombreMostrarFinal = busquedaItem;
                if (encontradosEnLib.length > 0 && (lineaMatchAny || tipoMatchAny)) {
                    var primero = encontradosEnLib[0];
                    nombreMostrarFinal = modeloBuscado + ' ' + primero.LINEA + ' ' + primero.TIPO + (tallaBuscada ? ' ' + tallaBuscada : '');
                }

                resultadosHtml += '<div style="color:#2ecc71; margin-bottom:0.2rem;">✅ "' + nombreMostrarFinal + '" encontrado en: ' + posHtml + ' <span style="color:#2ecc71; font-size:0.7rem;">(Total: ' + totalCantidad + ')</span></div>';
            }

            resultadoDiv.innerHTML = resultadosHtml;

            if (hayResultados) {
                document.getElementById('eliminarEncontradosBtn').style.display = 'inline-flex';
                ultimaBusqueda = busquedas[0];
            } else {
                document.getElementById('eliminarEncontradosBtn').style.display = 'none';
                ultimaBusqueda = null;
            }
        }

        // ============================================================
        // AGREGAR / ELIMINAR POSICIÓN
        // ============================================================

        function agregarPosicion() {
            var posActuales = posicionesOrden;
            var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var nuevaPos = 'A0';
            
            for (var i = 0; i < 26; i++) {
                var found = false;
                for (var j = 0; j < 5; j++) {
                    var pos = letras[i] + j;
                    if (posActuales.indexOf(pos) === -1) {
                        nuevaPos = pos;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            var nombre = prompt('Agregar nueva posición (ej: ' + nuevaPos + '):', nuevaPos);
            if (!nombre) return;

            var pos = nombre.trim().toUpperCase();
            if (posActuales.indexOf(pos) !== -1) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> La posición ' + pos + ' ya existe.';
                return;
            }

            posicionesOrden.push(pos);
            posicionesOrdenEscaneo.push(pos);
            
            datosActuales[pos] = [];
            resultadosProcesados[pos] = [];
            danadosPorPosicion[pos] = [];

            renderizarTablas();
            mostrarResumen();
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Posición ' + pos + ' agregada.';
        }

        function eliminarPosicion() {
            var posicionesConDatos = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                if (items.length > 0) {
                    posicionesConDatos.push(pos);
                }
            }

            if (posicionesConDatos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-info-circle"></i> No hay posiciones con datos.';
                return;
            }

            var opciones = posicionesConDatos.join(', ');
            var seleccion = prompt('Posiciones con datos: ' + opciones + '\n\nEscribe la posición que quieres eliminar (ej: A3):');
            if (!seleccion) return;

            var posEliminar = seleccion.trim().toUpperCase();
            if (posicionesConDatos.indexOf(posEliminar) === -1) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> "' + posEliminar + '" no tiene datos o no existe.';
                return;
            }

            var idx = posicionesOrden.indexOf(posEliminar);
            if (idx !== -1) {
                posicionesOrden.splice(idx, 1);
                var idxEscaneo = posicionesOrdenEscaneo.indexOf(posEliminar);
                if (idxEscaneo !== -1) posicionesOrdenEscaneo.splice(idxEscaneo, 1);
                delete datosActuales[posEliminar];
                delete resultadosProcesados[posEliminar];
                delete danadosPorPosicion[posEliminar];
            }

            renderizarTablas();
            mostrarResumen();
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Posición ' + posEliminar + ' eliminada.';
        }

        // ============================================================
        // CSV Y AHK GLOBAL
        // ============================================================

        function descargarCSV() {
            var todasLasFilas = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
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

            var csv = core.dfToCsv(todasLasFilas, ',', true, true);
            var filename = 'seccionador_' + core.generarNombreFecha('csv');
            core.downloadCsv(csv, filename);
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> CSV descargado (' + todasLasFilas.length + ' filas).';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('CSV') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        function copiarCSV() {
            var todasLasFilas = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
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

            var csv = core.dfToCsv(todasLasFilas, ',', true, true);
            core.copiarTexto(csv, 'seccionadorCopyFeedback');
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> CSV copiado (' + todasLasFilas.length + ' filas).';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('CSV') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        function copiarAHKGlobal() {
            var todosLosCodigos = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (item.CODIGO_EAN13) {
                        var cantidad = item.CANTIDAD || 1;
                        for (var k = 0; k < cantidad; k++) {
                            todosLosCodigos.push(item.CODIGO_EAN13);
                        }
                    }
                }
            }

            if (todosLosCodigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK.';
                return;
            }

            var ahk = core.generarAHKDesdeCodigos(todosLosCodigos, 'Seccionador (' + todosLosCodigos.length + ' códigos)');
            if (!ahk) return;
            core.copiarTexto(ahk, 'seccionadorCopyFeedback');
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Global copiado (' + todosLosCodigos.length + ' códigos).';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('AHK') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        function descargarAHKGlobal() {
            var todosLosCodigos = [];
            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                var items = datosActuales[pos] || [];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (item.CODIGO_EAN13) {
                        var cantidad = item.CANTIDAD || 1;
                        for (var k = 0; k < cantidad; k++) {
                            todosLosCodigos.push(item.CODIGO_EAN13);
                        }
                    }
                }
            }

            if (todosLosCodigos.length === 0) {
                document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos para generar AHK.';
                return;
            }

            var ahk = core.generarAHKDesdeCodigos(todosLosCodigos, 'Seccionador (' + todosLosCodigos.length + ' códigos)');
            if (!ahk) return;
            var blob = new Blob([ahk], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'seccionador_global_' + core.generarNombreFecha('ahk');
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> AHK Global descargado (' + todosLosCodigos.length + ' códigos).';
            setTimeout(function() { 
                var msgEl = document.getElementById('seccionadorMessage');
                if (msgEl.innerHTML.indexOf('AHK') !== -1) msgEl.innerHTML = ''; 
            }, 3000);
        }

        // ============================================================
        // SUBIR A WIX
        // ============================================================

        async function subirAWix() {
            var statusEl = document.getElementById('wixStatus');
            if (!datosActuales || Object.keys(datosActuales).length === 0) {
                statusEl.textContent = '⚠️ No hay datos para subir. Procesa primero.';
                return;
            }

            var dataToSave = {
                posiciones: posicionesOrden,
                datos: {}
            };

            for (var i = 0; i < posicionesOrden.length; i++) {
                var pos = posicionesOrden[i];
                dataToSave.datos[pos] = datosActuales[pos] || [];
            }

            var jsonData = JSON.stringify(dataToSave);
            var CHUNK_SIZE = 500000;
            var DELAY_MS = 200;
            var totalChunks = Math.ceil(jsonData.length / CHUNK_SIZE);
            var uploadId = 'seccionador_' + Date.now();

            statusEl.textContent = 'Subiendo a Wix...';

            for (var chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
                var start = chunkIdx * CHUNK_SIZE;
                var end = Math.min(start + CHUNK_SIZE, jsonData.length);
                var chunk = jsonData.substring(start, end);

                var progress = Math.round(((chunkIdx + 1) / totalChunks) * 100);
                statusEl.textContent = 'Subiendo ' + (chunkIdx+1) + '/' + totalChunks + ' (' + progress + '%)...';

                var payload = JSON.stringify({
                    chunkIndex: chunkIdx,
                    totalChunks: totalChunks,
                    uploadId: uploadId,
                    chunkData: chunk
                });

                try {
                    var response = await fetch(WIX_API_URL + '/seccionadorData', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json; charset=utf-8' },
                        body: payload
                    });

                    if (!response.ok) throw new Error('Error ' + response.status);
                    var result = await response.json();

                    if (result.complete) {
                        statusEl.textContent = '✅ Datos subidos a Wix correctamente.';
                    }
                } catch (error) {
                    statusEl.textContent = '❌ Error en parte ' + (chunkIdx+1) + ': ' + error.message;
                    return;
                }

                if (chunkIdx < totalChunks - 1) await new Promise(function(r) { setTimeout(r, DELAY_MS); });
            }
        }

        // ============================================================
        // EVENT LISTENERS
        // ============================================================

        var processBtn = document.getElementById('processSeccionadorBtn');
        if (processBtn) processBtn.addEventListener('click', procesarSecciones);

        var buscarBtn = document.getElementById('buscarCalzadoBtn');
        if (buscarBtn) buscarBtn.addEventListener('click', buscarCalzado);

        var limpiarBusquedaBtn = document.getElementById('limpiarBusquedaBtn');
        if (limpiarBusquedaBtn) {
            limpiarBusquedaBtn.addEventListener('click', function() {
                document.getElementById('buscarInput').value = '';
                document.getElementById('busquedaResultado').innerHTML = '';
                document.getElementById('eliminarEncontradosBtn').style.display = 'none';
                ultimaBusqueda = null;
            });
        }

        var eliminarEncontradosBtn = document.getElementById('eliminarEncontradosBtn');
        if (eliminarEncontradosBtn) eliminarEncontradosBtn.addEventListener('click', eliminarEncontrados);

        var agregarPosBtn = document.getElementById('agregarPosicionBtn');
        if (agregarPosBtn) agregarPosBtn.addEventListener('click', agregarPosicion);

        var eliminarPosBtn = document.getElementById('eliminarPosicionBtn');
        if (eliminarPosBtn) eliminarPosBtn.addEventListener('click', eliminarPosicion);

        var descargarCsvBtn = document.getElementById('descargarCsvBtn');
        if (descargarCsvBtn) descargarCsvBtn.addEventListener('click', descargarCSV);

        var copiarCsvBtn = document.getElementById('copiarCsvBtn');
        if (copiarCsvBtn) copiarCsvBtn.addEventListener('click', copiarCSV);

        var descargarBackupBtn = document.getElementById('descargarCsvBackupBtn');
        if (descargarBackupBtn) descargarBackupBtn.addEventListener('click', descargarBackupCSV);

        var subirBackupBtn = document.getElementById('subirBackupWixBtn');
        if (subirBackupBtn) subirBackupBtn.addEventListener('click', subirBackupWix);

        var descargarAhkGlobalBtn = document.getElementById('descargarAhkGlobalBtn');
        if (descargarAhkGlobalBtn) descargarAhkGlobalBtn.addEventListener('click', descargarAHKGlobal);

        var copiarAhkGlobalBtn = document.getElementById('copiarAhkGlobalBtn');
        if (copiarAhkGlobalBtn) copiarAhkGlobalBtn.addEventListener('click', copiarAHKGlobal);

        var subirAWixBtn = document.getElementById('subirAWixBtn');
        if (subirAWixBtn) subirAWixBtn.addEventListener('click', subirAWix);

        var cargarWixBtn = document.getElementById('cargarDesdeWixBtn');
        if (cargarWixBtn) cargarWixBtn.addEventListener('click', cargarDesdeWix);

        var cerrarDetalleBtn = document.getElementById('cerrarDetalleBtn');
        if (cerrarDetalleBtn) cerrarDetalleBtn.addEventListener('click', cerrarDetalle);

        // Checkbox de orden de escaneo (dentro del panel de detalle)
        var ordenCheckbox = document.getElementById('ordenEscaneoCheckbox');
        if (ordenCheckbox) {
            ordenCheckbox.addEventListener('change', function() {
                usarOrdenEscaneo = this.checked;
                renderizarTablas();
            });
        }

        var buscarInput = document.getElementById('buscarInput');
        if (buscarInput) {
            buscarInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    buscarCalzado();
                }
            });
        }

        core.setupFileUpload('uploadTxtBtn', 'txtFile', 'seccionadorInput');

        var textarea = document.getElementById('seccionadorInput');
        if (textarea) {
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
                var files = e.dataTransfer.files;
                if (files.length === 0) return;
                var file = files[0];
                var reader = new FileReader();
                reader.onload = function(ev) {
                    textarea.value = ev.target.result;
                    document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Archivo "' + file.name + '" cargado.';
                    setTimeout(function() { 
                        var msgEl = document.getElementById('seccionadorMessage');
                        if (msgEl.innerHTML.indexOf('cargado') !== -1) msgEl.innerHTML = ''; 
                    }, 3000);
                };
                reader.readAsText(file);
            });
        }

        var outputDiv = document.getElementById('seccionadorOutput');
        if (outputDiv) {
            outputDiv.addEventListener('click', function(e) {
                var target = e.target;
                
                var editBtn = target.closest('.edit-row-btn');
                if (editBtn) {
                    var pos = editBtn.dataset.pos;
                    var idx = parseInt(editBtn.dataset.idx);
                    var items = datosActuales[pos] || [];
                    if (idx >= items.length) return;
                    items[idx].editando = true;
                    renderizarTablas();
                    return;
                }

                var saveBtn = target.closest('.save-edit-btn');
                if (saveBtn) {
                    var pos = saveBtn.dataset.pos;
                    var idx = parseInt(saveBtn.dataset.idx);
                    guardarEdicion(pos, idx);
                    return;
                }

                var cancelBtn = target.closest('.cancel-edit-btn');
                if (cancelBtn) {
                    var pos = cancelBtn.dataset.pos;
                    var idx = parseInt(cancelBtn.dataset.idx);
                    var items = datosActuales[pos] || [];
                    if (idx >= items.length) return;
                    items[idx].editando = false;
                    renderizarTablas();
                    return;
                }

                var tallaBtn = target.closest('.talla-btn-sec');
                if (tallaBtn) {
                    var pos = tallaBtn.dataset.pos;
                    var idx = parseInt(tallaBtn.dataset.idx);
                    var nuevoTipo = tallaBtn.dataset.tipo;
                    cambiarTallaSec(pos, idx, nuevoTipo);
                    return;
                }

                var deleteBtn = target.closest('.delete-row-btn-sec');
                if (deleteBtn) {
                    var pos = deleteBtn.dataset.pos;
                    var idx = parseInt(deleteBtn.dataset.idx);
                    eliminarFilaSec(pos, idx);
                    return;
                }

                var copyBtn = target.closest('.copy-row-btn-sec');
                if (copyBtn) {
                    var codigo = copyBtn.dataset.codigo;
                    if (codigo) {
                        navigator.clipboard.writeText(codigo).then(function() {
                            var original = copyBtn.innerHTML;
                            copyBtn.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i>';
                            setTimeout(function() { copyBtn.innerHTML = original; }, 1500);
                        }).catch(function() {});
                    }
                    return;
                }
            });
        }

        var clearBtn = container.querySelector('.clear-module-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                document.getElementById('seccionadorInput').value = '';
                document.getElementById('seccionadorOutput').innerHTML = '';
                document.getElementById('seccionadorMessage').innerHTML = '';
                document.getElementById('seccionadorResumen').style.display = 'none';
                document.getElementById('seccionadorDanados').style.display = 'none';
                document.getElementById('posicionDetallePanel').style.display = 'none';
                document.getElementById('buscarInput').value = '';
                document.getElementById('busquedaResultado').innerHTML = '';
                document.getElementById('eliminarEncontradosBtn').style.display = 'none';
                document.getElementById('wixStatus').textContent = '';
                document.getElementById('totalEans').textContent = '0';
                document.getElementById('validosCount').textContent = '0';
                document.getElementById('danadosCount').textContent = '0';
                document.getElementById('totalSecciones').textContent = '0';
                var ordenCheck = document.getElementById('ordenEscaneoCheckbox');
                if (ordenCheck) ordenCheck.checked = false;
                usarOrdenEscaneo = false;
                posicionesOrden = [];
                posicionesOrdenEscaneo = [];
                resultadosProcesados = {};
                danadosPorPosicion = {};
                datosActuales = {};
                ultimaBusqueda = null;
                var autoCheck = document.getElementById('autocompletarCheckbox');
                if (autoCheck) autoCheck.checked = true;
                var danadosCheck = document.getElementById('mostrarDanadosCheckbox');
                if (danadosCheck) danadosCheck.checked = false;
            });
        }

        var msgEl = document.getElementById('seccionadorMessage');
        if (msgEl) msgEl.innerHTML = '<i class="fas fa-info-circle"></i> Pega los códigos separados por SSSSSSSS y haz clic en Procesar.';

        // Cargar desde Wix automáticamente al inicio (con reintentos)
        setTimeout(function() {
            cargarDesdeWix();
        }, 500);
    }
})();