// Módulo Código Alternativas - Generador de códigos EAN-13 desde biblioteca CSV
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab8');
    if (!container) return;

    // Estado interno
    let biblioteca = []; // Array de objetos {CODIGO, MODELO, LINEA, TIPO}
    let resultadosGenerados = []; // Array de objetos {entrada, codigoFinal, cantidad, info}

    // Función para cargar biblioteca desde CSV
    function cargarBibliotecaDesdeCSV(texto) {
        if (!texto.trim()) {
            biblioteca = [];
            document.getElementById('bibliotecaStatus').textContent = 'Sin datos cargados';
            return false;
        }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true, dynamicTyping: true });
            if (parsed.data && parsed.data.length) {
                const items = [];
                for (const row of parsed.data) {
                    const codigo = String(row.CODIGO || '').trim();
                    const modelo = String(row.MODELO || '').trim();
                    const linea = String(row.LINEA || '').trim().toUpperCase();
                    const tipo = String(row.TIPO || '').trim().toUpperCase();
                    if (codigo && modelo && linea && tipo) {
                        items.push({ CODIGO: codigo, MODELO: modelo, LINEA: linea, TIPO: tipo });
                    }
                }
                biblioteca = items;
                document.getElementById('bibliotecaStatus').textContent = `✅ ${biblioteca.length} registros cargados`;
                return true;
            }
        } catch (e) {
            console.error(e);
            document.getElementById('bibliotecaStatus').textContent = '❌ Error al cargar archivo';
        }
        return false;
    }

    // Función para generar códigos a partir de la entrada del usuario
    function generarCodigosDesdeEntrada(entrada) {
        if (biblioteca.length === 0) {
            document.getElementById('alternativasMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Primero carga la biblioteca (codeLibrary.csv).';
            return;
        }
        const lineas = entrada.split(/\r?\n/).filter(l => l.trim() !== '');
        if (lineas.length === 0) {
            document.getElementById('alternativasMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Ingresa al menos una línea de código.';
            return;
        }
        const resultados = [];
        let errores = 0;
        for (const linea of lineas) {
            const parsed = core.parsearEntradaCodigo(linea);
            if (!parsed) {
                errores++;
                continue;
            }
            // Buscar en biblioteca
            const encontrado = core.buscarCodigoEnBiblioteca(
                parsed.codigoBase,
                parsed.linea,
                parsed.tipo,
                biblioteca
            );
            if (!encontrado) {
                errores++;
                continue;
            }
            // Generar código EAN-13
            const codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, parsed.talla);
            const verificado = core.verificarCodigoEAN13(codigoFinal);
            resultados.push({
                entrada: linea,
                codigoBase: parsed.codigoBase,
                linea: parsed.linea,
                tipo: parsed.tipo,
                talla: parsed.talla,
                cantidad: parsed.cantidad,
                codigoCompleto: encontrado.CODIGO,
                codigoFinal: codigoFinal,
                valido: verificado,
                info: encontrado
            });
        }
        resultadosGenerados = resultados;
        mostrarResultados(resultados);
        document.getElementById('alternativasMessage').innerHTML = `<i class="fas fa-check-circle"></i> Procesados ${resultados.length} códigos. ${errores > 0 ? `⚠️ ${errores} errores.` : ''}`;
    }

    // Mostrar resultados en tabla
    function mostrarResultados(resultados) {
        if (!resultados || resultados.length === 0) {
            document.getElementById('alternativasOutput').innerHTML = '<p>No hay resultados para mostrar.</p>';
            return;
        }
        let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr>';
        html += '<th>Entrada</th><th>Código Base</th><th>Línea</th><th>Tipo</th><th>Talla</th>';
        html += '<th>Cantidad</th><th>Código Final (13 dígitos)</th><th>Válido</th>';
        html += '</tr></thead><tbody>';
        for (const r of resultados) {
            const valido = r.valido ? '✅ Sí' : '❌ No';
            const validoColor = r.valido ? 'color:#2ecc71;' : 'color:#e74c3c;';
            html += `<tr>
                        <td style="max-width:150px; word-break:break-word;">${escapeHtml(r.entrada)}</td>
                        <td>${escapeHtml(r.codigoBase)}</td>
                        <td>${escapeHtml(r.linea)}</td>
                        <td>${escapeHtml(r.tipo)}</td>
                        <td>${escapeHtml(r.talla)}</td>
                        <td style="text-align:right;">${r.cantidad}</td>
                        <td style="font-weight:bold; font-family:monospace;">${escapeHtml(r.codigoFinal)}</td>
                        <td style="${validoColor}">${valido}</td>
                     </tr>`;
        }
        html += '</tbody></table>';
        document.getElementById('alternativasOutput').innerHTML = html;
    }

    // Generar script AHK
    function generarAHK() {
        if (resultadosGenerados.length === 0) {
            document.getElementById('alternativasMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay códigos generados para crear el script.';
            return;
        }
        let ahkContent = '#SingleInstance Force\n\n';
        ahkContent += '; Script generado desde Código Alternativas\n';
        ahkContent += `; ${resultadosGenerados.length} códigos\n\n`;
        ahkContent += '^+n::\n';
        for (const r of resultadosGenerados) {
            if (r.cantidad > 1) {
                for (let i = 0; i < r.cantidad; i++) {
                    ahkContent += `    Send, ${r.codigoFinal}{Enter}\n`;
                }
            } else {
                ahkContent += `    Send, ${r.codigoFinal}{Enter}\n`;
            }
        }
        ahkContent += 'return';
        return ahkContent;
    }

    function descargarAHK() {
        const content = generarAHK();
        if (!content) return;
        const nombreBase = document.getElementById('alternativasFilename').value.trim() || 'codigos';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreBase}.ahk`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('alternativasMessage').innerHTML = `<i class="fas fa-check-circle"></i> Script AHK descargado.`;
        setTimeout(() => { if (document.getElementById('alternativasMessage').innerHTML.includes('AHK')) document.getElementById('alternativasMessage').innerHTML = ''; }, 3000);
    }

    function copiarResultados() {
        if (resultadosGenerados.length === 0) {
            document.getElementById('alternativasMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados para copiar.';
            return;
        }
        let texto = '';
        for (const r of resultadosGenerados) {
            texto += r.codigoFinal + '\n';
        }
        navigator.clipboard.writeText(texto).then(() => {
            document.getElementById('alternativasMessage').innerHTML = `<i class="fas fa-check-circle"></i> ${resultadosGenerados.length} códigos copiados al portapapeles.`;
            setTimeout(() => { if (document.getElementById('alternativasMessage').innerHTML.includes('copiados')) document.getElementById('alternativasMessage').innerHTML = ''; }, 3000);
        }).catch(() => {
            document.getElementById('alternativasMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al copiar.';
        });
    }

    function limpiarTodo() {
        resultadosGenerados = [];
        document.getElementById('alternativasOutput').innerHTML = '';
        document.getElementById('alternativasMessage').innerHTML = '';
        document.getElementById('alternativasInput').value = '';
        document.getElementById('bibliotecaInput').value = '';
        document.getElementById('bibliotecaStatus').textContent = 'Sin datos cargados';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
    }

    // ==================== RENDER HTML ====================
    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-shoe-prints"></i> Código Alternativas</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="instructions-box" style="margin-bottom:1rem;">
                <b><i class="fas fa-info-circle"></i> Instrucciones</b><br>
                1. Carga la biblioteca de códigos (<code>codeLibrary.csv</code>) con columnas: CODIGO, MODELO, LINEA, TIPO.<br>
                2. Ingresa líneas con formato: <code>CODIGO_BASE LINEA TIPO TALLA [CANTIDAD]</code><br>
                3. Ejemplo: <code>27605 NA SLI 27 3</code> → genera código EAN-13 con 3 repeticiones.<br>
                - Puedes usar múltiples líneas.<br>
                - Si no pones cantidad, se usa 1.<br>
                - La talla admite .5 (ej: 24.5 → 245).<br>
                - El código se busca en la biblioteca por coincidencia parcial del CODIGO.
            </div>

            <!-- Carga de biblioteca -->
            <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                <h4><i class="fas fa-database"></i> 1. Cargar biblioteca (codeLibrary.csv)</h4>
                <div class="row">
                    <textarea id="bibliotecaInput" rows="4" placeholder="Pega aquí el contenido de codeLibrary.csv (columnas: CODIGO, MODELO, LINEA, TIPO)..."></textarea>
                </div>
                <div class="row">
                    <button id="cargarBibliotecaBtn" class="btn-primary"><i class="fas fa-upload"></i> Cargar biblioteca</button>
                    <button id="uploadBibliotecaBtn" class="btn-secondary"><i class="fas fa-folder-open"></i> Subir archivo CSV</button>
                    <input type="file" id="bibliotecaFile" accept=".csv" style="display:none;">
                    <span id="bibliotecaStatus" style="margin-left:1rem; color:var(--grayl);">Sin datos cargados</span>
                </div>
            </div>

            <!-- Entrada de datos -->
            <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                <h4><i class="fas fa-keyboard"></i> 2. Ingresar códigos</h4>
                <div class="row">
                    <label><b>Formato por línea:</b> <code>CODIGO_BASE LINEA TIPO TALLA [CANTIDAD]</code></label>
                </div>
                <textarea id="alternativasInput" rows="6" placeholder="Ejemplo:&#10;27605 NA SLI 27 3&#10;2558 NE TLI 25 2&#10;96740 NE SLI 24.5 1"></textarea>
                <div class="row" style="margin-top:0.5rem;">
                    <button id="generarCodigosBtn" class="btn-primary"><i class="fas fa-play"></i> Generar códigos</button>
                    <button id="copiarResultadosBtn" class="btn-secondary"><i class="fas fa-copy"></i> Copiar códigos</button>
                    <button id="descargarAhkBtn" class="btn-secondary" style="background:#444; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <input type="text" id="alternativasFilename" placeholder="Nombre del script" value="codigos" style="width:150px;">
                </div>
            </div>

            <!-- Resultados -->
            <div id="alternativasMessage" class="message"></div>
            <div class="output-area" id="alternativasOutput" style="max-height:400px; overflow:auto;"></div>
            <div class="instructions-box" style="margin-top:1rem;">
                <b><i class="fas fa-info-circle"></i> Detalles técnicos</b><br>
                - El código de 9 dígitos se busca en la biblioteca por los primeros 5 dígitos.<br>
                - La talla se formatea a 3 dígitos: 27 → 270, 24.5 → 245.<br>
                - El dígito de control se calcula con el algoritmo EAN-13.<br>
                - El script AHK usa el hotkey <kbd>Ctrl+Shift+N</kbd>.
            </div>
        </div>
    `;

    // ==================== EVENTOS ====================

    // Cargar biblioteca desde textarea
    document.getElementById('cargarBibliotecaBtn').addEventListener('click', () => {
        const texto = document.getElementById('bibliotecaInput').value;
        cargarBibliotecaDesdeCSV(texto);
    });

    // Cargar biblioteca desde archivo CSV
    core.setupFileUpload('uploadBibliotecaBtn', 'bibliotecaFile', 'bibliotecaInput');

    // Generar códigos
    document.getElementById('generarCodigosBtn').addEventListener('click', () => {
        const entrada = document.getElementById('alternativasInput').value;
        generarCodigosDesdeEntrada(entrada);
    });

    // Copiar resultados (solo los códigos finales)
    document.getElementById('copiarResultadosBtn').addEventListener('click', copiarResultados);

    // Descargar AHK
    document.getElementById('descargarAhkBtn').addEventListener('click', descargarAHK);

    // Limpiar (botón del módulo)
    const clearBtn = container.querySelector('.clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', limpiarTodo);
    }

    // Cargar automáticamente si se pega texto en biblioteca
    document.getElementById('bibliotecaInput').addEventListener('change', () => {
        const texto = document.getElementById('bibliotecaInput').value;
        if (texto.trim()) cargarBibliotecaDesdeCSV(texto);
    });

    // ==================== HASH Y NAVEGACIÓN ====================
    // El módulo no tiene submódulos, pero registramos restauración
    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab8') {
            // No hay submódulos, solo mantener la pestaña activa
        }
    });
})();