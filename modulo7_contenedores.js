// Módulo Contenedores - Generador AHK, Buscador, Eliminador, Resumen por Contenedor y Tallas múltiples
// CON OPCIÓN DE SELECCIONAR WINDOWS 10 O WINDOWS 11
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab7');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-boxes"></i> Contenedores · Encontrador de Alternativas</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            
            <div class="sub-module-tabs" id="contenedorSubTabs">
                <div class="sub-module-tab active" data-submode="ahk">Generador AHK</div>
                <div class="sub-module-tab" data-submode="buscador">Buscador de Contenedores</div>
            </div>

            <!-- Panel Generador AHK -->
            <div id="contenedorAhkPanel" class="sub-panel active">
                <div style="border-left: 3px solid var(--blu); padding-left: 1rem;">
                    <h4><i class="fas fa-code"></i> Script para capturar folios desde SIAV</h4>
                    <div class="row">
                        <label>Total folios (totalFolios):</label>
                        <input type="number" id="totalFolios" value="10" min="1" max="999" style="width:100px;">
                        <label>Sleep tiempo (ms):</label>
                        <input type="number" id="sleepTime" value="250" min="50" max="5000" step="10" style="width:100px;">
                        <label>Sleep copia (ms):</label>
                        <input type="number" id="sleepCopy" value="50" min="10" max="1000" step="10" style="width:100px;">
                    </div>
                    <div class="row">
                        <label style="display:inline-flex; align-items:center; gap:0.5rem;">
                            <b>Versión de Windows:</b>
                            <select id="windowsVersion" style="width:130px;">
                                <option value="win10">Windows 10</option>
                                <option value="win11" selected>Windows 11</option>
                            </select>
                        </label>
                        <button id="generateAhkContBtn" class="btn-primary"><i class="fas fa-download"></i> Descargar AHK</button>
                    </div>
                    <div class="instructions-box" style="margin-top:0.5rem;">
                        <b>Script generado:</b> Captura el texto de cada folio y lo guarda en un archivo <code>contenedores_fecha.txt</code>.<br>
                        Atajo <kbd>Ctrl+Q</kbd> para iniciar, <kbd>Esc</kbd> para detener.<br>
                        <b>Windows 11:</b> Usa <code>SendEvent</code> en lugar de <code>Send</code> para mejor compatibilidad.
                    </div>
                </div>
            </div>

            <!-- Panel Buscador de Contenedores -->
            <div id="contenedorBuscadorPanel" class="sub-panel">
                <div style="border-left: 3px solid var(--blu); padding-left: 1rem;">
                    <h4><i class="fas fa-search"></i> Buscar productos en contenedores</h4>
                    
                    <div class="row" style="margin-top:0.5rem;">
                        <label><b>Texto de contenedores (captura AHK o diferencias de envío):</b></label>
                    </div>
                    <textarea id="contenedoresTextoInput" rows="8" placeholder="Pega aquí el contenido (formato AHK o diferencias de envío)..."></textarea>
                    <div class="row"><button id="uploadContenedoresBtn"><i class="fas fa-folder-open"></i> Subir archivo .txt</button><input type="file" id="contenedoresFile" accept=".txt" style="display:none;"></div>
                    
                    <!-- Eliminador por folios -->
                    <div style="margin-top:1rem; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                        <h5><i class="fas fa-trash-alt"></i> Eliminar contenedores por folio</h5>
                        <div class="row">
                            <label><b>Folios a eliminar (uno por línea o separados por comas/espacios):</b></label>
                            <textarea id="foliosAEliminarInput" rows="3" placeholder="Ejemplo:&#10;0936008033980&#10;0936008227576"></textarea>
                            <button id="eliminarFoliosBtn" class="btn-danger"><i class="fas fa-trash"></i> Eliminar folios</button>
                            <button id="exportarRestantesBtn" class="btn-secondary"><i class="fas fa-download"></i> Exportar contenedores restantes</button>
                        </div>
                        <div id="eliminacionMessage" class="message" style="margin-top:0.5rem;"></div>
                    </div>
                    
                    <div class="row" style="margin-top:1rem;">
                        <label><b>Búsqueda libre (modelo, línea, tipo):</b></label>
                        <input type="text" id="busquedaLibreInput" placeholder="Ej: 94974  o  94974 NE  o  NE SLI" style="flex:2;">
                        <button id="buscarLibreBtn" class="btn-primary"><i class="fas fa-search"></i> Buscar</button>
                    </div>
                    
                    <div class="row" style="margin-top:0.5rem;">
                        <label style="display:inline-flex; align-items:center; gap:0.5rem;">
                            <input type="checkbox" id="paquetes5Checkbox"> <strong>Paquetes de 5</strong> (solo cantidades ≤5)
                        </label>
                    </div>
                    
                    <div class="instructions-box" style="margin:0.5rem 0;">
                        <b>Lista de modelos (CSV):</b> Pegar CSV con columnas MODELO, LINEA, TIPO, TALLA (opcional). <br>
                        Si un mismo modelo tiene varias tallas, se combinarán con comas en la columna TALLA.<br>
                        <b>Resumen por contenedor:</b> Al buscar por lista sin "Paquetes de 5", se muestra qué contenedor contiene cada modelo.
                    </div>
                    
                    <div class="row" style="margin-top:1rem;">
                        <label><b>Lista de modelos (CSV con cabecera):</b></label>
                    </div>
                    <textarea id="modelosBuscarInput" rows="6" placeholder="Pega aquí un CSV con columnas MODELO,LINEA,TIPO,TALLA (opcional)&#10;Ejemplo:&#10;MODELO,LINEA,TIPO,TALLA&#10;57981,NE,SIN,24&#10;62828,CA,SLI,26"></textarea>
                    <div class="row"><button id="uploadModelosBuscarBtn"><i class="fas fa-folder-open"></i> Subir archivo de modelos</button><input type="file" id="modelosBuscarFile" accept=".csv,.txt" style="display:none;"></div>
                    
                    <div class="row" style="margin-top:1rem;">
                        <button id="buscarListaBtn" class="btn-secondary"><i class="fas fa-list"></i> Buscar por lista de modelos</button>
                        <button id="descargarResultadosCsvBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar CSV</button>
                        <button id="limpiarResultadosBtn" class="btn-danger"><i class="fas fa-trash"></i> Limpiar resultados</button>
                    </div>
                    
                    <div id="buscadorMessage" class="message"></div>
                    <div class="output-area" id="buscadorOutput" style="max-height: 300px; overflow: auto;"></div>
                    
                    <!-- Resumen por contenedor -->
                    <div id="contenedorSummaryContainer" style="margin-top:1rem; display:none;">
                        <h4><i class="fas fa-boxes"></i> Resumen por contenedor</h4>
                        <div class="output-area" id="contenedorSummaryOutput" style="max-height: 300px; overflow: auto;"></div>
                    </div>
                </div>
            </div>

            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Instrucciones – Contenedores</b><br>
                <b>AHK:</b> Configura y descarga script para SIAV. Selecciona tu versión de Windows.<br>
                <b>Buscador:</b> Pega texto con contenedores.<br>
                <b>Lista de modelos:</b> Sube/pega CSV con MODELO, LINEA, TIPO, TALLA (opcional). Las tallas se combinan.<br>
                <b>Resumen por contenedor:</b> Al buscar por lista sin "Paquetes de 5", se muestra qué contenedor contiene cada modelo.
            </div>
        </div>
    `;

    core.setupFileUpload('uploadModelosBuscarBtn', 'modelosBuscarFile', 'modelosBuscarInput');
    core.setupFileUpload('uploadContenedoresBtn', 'contenedoresFile', 'contenedoresTextoInput');

    document.getElementById('generateAhkContBtn').addEventListener('click', () => {
        let totalFolios = parseInt(document.getElementById('totalFolios').value) || 10;
        let sleepTime = parseInt(document.getElementById('sleepTime').value) || 250;
        let sleepCopy = parseInt(document.getElementById('sleepCopy').value) || 50;
        let windowsVersion = document.getElementById('windowsVersion').value || 'win11';
        
        let ahkContent;
        
        if (windowsVersion === 'win11') {
            ahkContent = `#SingleInstance Force
#Persistent
SetKeyDelay, 50, 50

times := ${totalFolios}
sleepTime := ${sleepTime}

$+Esc::ExitApp

$^q::
Send {F6}
Sleep 100
Send {Enter}
Sleep 500
Send ^e
Sleep %sleepTime%
Loop 5
{
    Send ^c
    Sleep %sleepTime%
}
Sleep %sleepTime%
Send ^u
Sleep %sleepTime%
Send ^v
Sleep %sleepTime%
Send ^1
Sleep %sleepTime%
Send ^w
Sleep %sleepTime%
Send !{Tab}
Sleep 700

Loop % times - 1
{
    Send {Down}
    Sleep %sleepTime%
    Send {F6}
    Sleep %sleepTime%
    Send {Enter}
    Sleep %sleepTime%
    Send ^e
    Sleep %sleepTime%
    Loop 5
    {
        Send ^c
        Sleep %sleepTime%
    }
    Sleep %sleepTime%
    Send ^1
    Sleep %sleepTime%
    Send ^v
    Sleep %sleepTime%
    Send ^2
    Sleep %sleepTime%
    Send ^w
    Sleep %sleepTime%
    Send !{Tab}
    Sleep 500
}
return`;
        } else {
            const sendCommand = 'Send';
            ahkContent = `#SingleInstance Force

totalFolios := ${totalFolios}
sleepTime := ${sleepTime}
sleepCopy := ${sleepCopy}

ejecutando := false
FormatTime, fecha, , yyyyMMddHHmmss
archivoSalida := A_ScriptDir . "\\contenedores_" . fecha . ".txt"

^+N::
    if ejecutando
        return
    ejecutando := true
    FileDelete, %archivoSalida%
    FileAppend, === INICIO DE CAPTURA DE FOLIOS ===\`n\`n, %archivoSalida%
    WinActivate, SIAV ahk_exe SIAsucursal.exe
    if !WinActive("SIAV ahk_exe SIAsucursal.exe")
    {
        MsgBox, No se encuentra la ventana SIAV. Asegurate de que SIAsucursal.exe este abierto.
        ejecutando := false
        return
    }
    GoSub, IniciarProceso
return

Esc::
    ejecutando := false
    MsgBox, Proceso detenido manualmente. Informacion guardada en: %archivoSalida%
return

IniciarProceso:
    Loop, %totalFolios%
    {
        if !ejecutando
            break
        GoSub, ProcesarFolio
    }
    ejecutando := false
    MsgBox, Proceso completado. Se procesaron %totalFolios% folios. Informacion guardada en: %archivoSalida%
return

ProcesarFolio:
    WinActivate, SIAV ahk_exe SIAsucursal.exe
    Sleep, 200
    ${sendCommand}, {F6}
    Sleep, sleepTime
    ${sendCommand}, {Enter}
    Sleep, sleepTime
    ${sendCommand}, ^e
    Sleep, sleepTime
    textoCopiado := ""
    Loop, 10
    {
        Clipboard := ""
        ${sendCommand}, ^c
        Sleep, sleepCopy
        ClipWait, 0.3
        if (Clipboard != "")
        {
            textoCopiado := Clipboard
            break
        }
    }
    if (textoCopiado != "")
    {
        FileAppend, === FOLIO %A_Index% ===\`n%textoCopiado%\`n\`n, %archivoSalida%
    }
    else
    {
        FileAppend, === FOLIO %A_Index% ===\`n[Error: No se pudo copiar el texto]\`n\`n, %archivoSalida%
    }
    ${sendCommand}, !{F4}
    Sleep, sleepTime
    WinActivate, SIAV ahk_exe SIAsucursal.exe
    Sleep, 200
    ${sendCommand}, {Down}
    Sleep, sleepTime
return`;
        }

        const blob = new Blob([ahkContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contenedor_siav_${windowsVersion}_${core.generarNombreFecha('ahk')}`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('buscadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Script AHK descargado (totalFolios=${totalFolios}, sleepTime=${sleepTime}, sleepCopy=${sleepCopy}, Windows: ${windowsVersion === 'win11' ? '11' : '10'}).`;
        setTimeout(() => { const msg = document.getElementById('buscadorMessage'); if (msg.innerHTML.includes('AHK')) msg.innerHTML = ''; }, 3000);
    });

    // ==================== FUNCIONES MEJORADAS DE PARSEO ====================
    
    /**
     * Parsea una línea del formato de diferencias de envío
     * Ejemplo: "67683 NE CBR          1      0       1"
     * Formato: MODELO LINEA TIPO CANTIDAD_ENVIO CANTIDAD_RECIBIDO DIFERENCIA
     */
    function parsearLineaDiferencias(linea) {
        const trimmed = linea.trim();
        if (!trimmed) return null;
        // Eliminar múltiples espacios y separar por espacios
        const parts = trimmed.replace(/\s+/g, ' ').split(' ');
        // Filtrar partes vacías
        const tokens = parts.filter(p => p !== '');
        
        if (tokens.length < 4) return null;
        
        // El formato es: MODELO LINEA TIPO CANTIDAD (y opcionalmente más números)
        // Ejemplo: "67683 NE CBR 1 0 1"
        // Ejemplo con talla: "67683 NE CBR 24 1 0 1"
        // Ejemplo con cantidad: "95863 CF TLI 5 0 5"
        
        // Buscar dónde empiezan los números
        let firstNumberIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (/^\d+$/.test(tokens[i])) {
                firstNumberIndex = i;
                break;
            }
        }
        
        if (firstNumberIndex < 3) return null;
        
        // Extraer modelo, línea, tipo
        const modelo = tokens[0];
        const lineaVal = tokens[1];
        const tipoVal = tokens[2];
        
        // Extraer talla si existe (antes del primer número)
        let talla = '';
        let cantidadIndex = firstNumberIndex;
        
        // Si hay más tokens antes del primer número, puede ser talla
        // Ejemplo: "67683 NE CBR 24 1 0 1" -> talla = "24"
        if (firstNumberIndex > 3) {
            talla = tokens[3];
            cantidadIndex = 4;
        }
        
        // Extraer cantidad (primer número después de modelo/linea/tipo o talla)
        let cantidad = parseInt(tokens[cantidadIndex]);
        if (isNaN(cantidad) || cantidad <= 0) return null;
        
        // Verificar que no sea el fantasma "1 RS TX"
        if (modelo === '1' && lineaVal === 'RS' && tipoVal === 'TX') return null;
        
        return { modelo, linea: lineaVal, tipo: tipoVal, talla, cantidad };
    }

    /**
     * Extrae contenedores de texto en formato de diferencias de envío o AHK
     */
    function extraerContenedoresUniversal(texto) {
        // Primero intentar con formato AHK
        const ahkRegex = /=== FOLIO (\d+) ===\n([\s\S]*?)(?=\n=== FOLIO \d+ ===|\n*$)/g;
        let match, contenedores = [], foundAhk = false;
        while ((match = ahkRegex.exec(texto)) !== null) {
            foundAhk = true;
            const contenidoBloque = match[2].trim();
            if (contenidoBloque && !contenidoBloque.includes('[Error:') && contenidoBloque.trim() !== '') {
                const info = extraerInfoBloqueAHK(contenidoBloque, match[1]);
                if (info.folio && info.alternativas.length) contenedores.push(info);
            }
        }
        if (foundAhk) return contenedores;

        // Si no es AHK, intentar con formato de diferencias de envío
        const lines = texto.split('\n');
        let contenedorActual = null;
        let buffer = [];
        let folioActual = '';
        let fechaActual = '';
        let dentroTabla = false;
        let contadorLineasVacio = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Detectar inicio de un nuevo contenedor
            if (trimmed.includes('DIFERENCIAS EN FOLIOS DE ENVIO')) {
                // Guardar contenedor anterior si existe
                if (contenedorActual && contenedorActual.alternativas.length > 0) {
                    contenedores.push(contenedorActual);
                }
                contenedorActual = null;
                folioActual = '';
                fechaActual = '';
                buffer = [];
                dentroTabla = false;
                contadorLineasVacio = 0;
                continue;
            }
            
            // Buscar FOLIO
            if (trimmed.startsWith('FOLIO') || trimmed.startsWith('FOLIO  :')) {
                const folioMatch = trimmed.match(/FOLIO\s*:?\s*(\S+)/);
                if (folioMatch) {
                    folioActual = folioMatch[1];
                    contenedorActual = {
                        folio: folioActual,
                        total: 0,
                        alternativas: [],
                        textoOriginal: ''
                    };
                }
                continue;
            }
            
            // Buscar FECHA
            if (trimmed.startsWith('FECHA') || trimmed.startsWith('FECHA  :')) {
                const fechaMatch = trimmed.match(/FECHA\s*:?\s*(\S+)/);
                if (fechaMatch) {
                    fechaActual = fechaMatch[1];
                }
                continue;
            }
            
            // Buscar cabecera de tabla
            if (trimmed.includes('Alternativa') && trimmed.includes('Env.') && trimmed.includes('Rec.') && trimmed.includes('Dif.')) {
                dentroTabla = true;
                continue;
            }
            
            // Buscar separador
            if (trimmed.includes('---') || trimmed.includes('___')) {
                continue;
            }
            
            // Buscar Total
            if (trimmed.startsWith('Total:')) {
                const totalMatch = trimmed.match(/Total:\s*(\d+)/);
                if (totalMatch && contenedorActual) {
                    contenedorActual.total = parseInt(totalMatch[1]) || 0;
                }
                dentroTabla = false;
                continue;
            }
            
            // Dentro de la tabla, parsear líneas de alternativas
            if (dentroTabla && contenedorActual) {
                // Verificar si es una línea de alternativa (tiene números)
                const parts = trimmed.replace(/\s+/g, ' ').split(' ');
                const numParts = parts.filter(p => /^\d+$/.test(p));
                
                if (numParts.length >= 1 && /^[A-Z0-9]/.test(trimmed)) {
                    const alt = parsearLineaDiferencias(trimmed);
                    if (alt) {
                        contenedorActual.alternativas.push(alt);
                    }
                }
            }
        }
        
        // Guardar último contenedor
        if (contenedorActual && contenedorActual.alternativas.length > 0) {
            contenedores.push(contenedorActual);
        }
        
        // Si no se encontraron contenedores con el formato de diferencias, intentar con bloques genéricos
        if (contenedores.length === 0) {
            // Buscar bloques que contengan FOLIO y alternativas
            const bloques = texto.split(/\n\s*\n\s*\n/);
            for (const bloque of bloques) {
                if (!bloque.trim()) continue;
                const folioMatch = bloque.match(/FOLIO\s*:?\s*(\S+)/);
                if (!folioMatch) continue;
                const folio = folioMatch[1];
                const linesBloque = bloque.split('\n');
                const alternativas = [];
                for (const line of linesBloque) {
                    const alt = parsearLineaDiferencias(line);
                    if (alt) alternativas.push(alt);
                }
                if (alternativas.length) {
                    const total = alternativas.reduce((s, a) => s + a.cantidad, 0);
                    contenedores.push({
                        folio: folio,
                        total: total,
                        alternativas: alternativas,
                        textoOriginal: bloque.trim()
                    });
                }
            }
        }
        
        return contenedores;
    }

    function extraerInfoBloqueAHK(contenidoBloque, numero) {
        const folioMatch = contenidoBloque.match(/FOLIO\s*:\s*(\S+)/);
        const folio = folioMatch ? folioMatch[1] : null;
        const lineas = contenidoBloque.split('\n');
        const alternativas = [];
        for (const linea of lineas) {
            const alt = parsearLineaDiferencias(linea);
            if (alt) alternativas.push(alt);
        }
        const total = alternativas.reduce((s, a) => s + a.cantidad, 0);
        return { folio, total, alternativas, textoOriginal: contenidoBloque };
    }

    // ==================== VARIABLES DE ESTADO ====================
    
    let currentResultados = [];
    let currentResumenContenedores = null;
    let contenedoresCache = [];
    let contenedoresOriginales = [];

    // ==================== FUNCIONES PRINCIPALES ====================
    
    function cargarContenedoresDesdeTexto() {
        const contenedoresRaw = document.getElementById('contenedoresTextoInput').value;
        if (!contenedoresRaw.trim()) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el texto de los contenedores capturados.';
            return false;
        }
        const contenedores = extraerContenedoresUniversal(contenedoresRaw);
        if (contenedores.length === 0) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron bloques de folios válidos.';
            return false;
        }
        contenedoresOriginales = JSON.parse(JSON.stringify(contenedores));
        contenedoresCache = JSON.parse(JSON.stringify(contenedores));
        document.getElementById('buscadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se cargaron ${contenedores.length} contenedores.`;
        return true;
    }

    function extraerFoliosDeTexto(texto) {
        const patron = /\b(0936\d{9}|\d{13})\b/g;
        const folios = new Set();
        let match;
        while ((match = patron.exec(texto)) !== null) folios.add(match[1]);
        return Array.from(folios);
    }

    function eliminarFolios() {
        const foliosText = document.getElementById('foliosAEliminarInput').value;
        if (!foliosText.trim()) { 
            document.getElementById('eliminacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Escribe los folios a eliminar.'; 
            return; 
        }
        const foliosAEliminar = extraerFoliosDeTexto(foliosText);
        if (!foliosAEliminar.length) { 
            document.getElementById('eliminacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se detectaron folios válidos.'; 
            return; 
        }
        
        // Mostrar qué folios se van a eliminar
        const foliosEnCache = contenedoresCache.map(c => c.folio);
        const foliosEncontrados = foliosAEliminar.filter(f => foliosEnCache.includes(f));
        const foliosNoEncontrados = foliosAEliminar.filter(f => !foliosEnCache.includes(f));
        
        if (foliosEncontrados.length === 0) {
            document.getElementById('eliminacionMessage').innerHTML = `<i class="fas fa-info-circle"></i> Ninguno de los folios coincide con los contenedores cargados. Folios buscados: ${foliosAEliminar.join(', ')}`;
            return;
        }
        
        const nuevos = contenedoresCache.filter(c => !foliosAEliminar.includes(c.folio));
        const eliminados = contenedoresCache.length - nuevos.length;
        contenedoresCache = nuevos;
        
        let mensaje = `<i class="fas fa-check-circle"></i> Eliminados ${eliminados} contenedores. Restantes: ${contenedoresCache.length}.`;
        if (foliosNoEncontrados.length > 0) {
            mensaje += `<br><i class="fas fa-info-circle"></i> Folios no encontrados: ${foliosNoEncontrados.join(', ')}`;
        }
        document.getElementById('eliminacionMessage').innerHTML = mensaje;
        currentResultados = [];
        document.getElementById('buscadorOutput').innerHTML = '';
        document.getElementById('contenedorSummaryContainer').style.display = 'none';
    }

    function exportarContenedoresRestantes() {
        if (!contenedoresCache.length) { 
            document.getElementById('eliminacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay contenedores para exportar.'; 
            return; 
        }
        let output = '';
        for (let i = 0; i < contenedoresCache.length; i++) {
            const c = contenedoresCache[i];
            output += `=== FOLIO ${i+1} ===\nFOLIO : ${c.folio}\nAlternativa         Env.    Rec.    Dif.\n`;
            for (const a of c.alternativas) {
                const tallaStr = a.talla ? ` ${a.talla}` : '';
                output += `${a.modelo} ${a.linea} ${a.tipo}${tallaStr}          ${a.cantidad}      0       ${a.cantidad}\n`;
            }
            output += `----------------------------------------\nTotal:               ${c.total}      0       ${c.total}\n\n`;
        }
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contenedores_restantes_${core.generarNombreFecha('txt')}`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('eliminacionMessage').innerHTML = '<i class="fas fa-check-circle"></i> Exportado.';
        setTimeout(() => { if (document.getElementById('eliminacionMessage').innerHTML.includes('Exportado')) document.getElementById('eliminacionMessage').innerHTML = ''; }, 3000);
    }

    function parsearListaModelos(texto) {
        const lineas = texto.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lineas.length === 0) return [];
        const primera = lineas[0].toUpperCase();
        const esCSV = primera.includes('MODELO') && (primera.includes('LINEA') || primera.includes('TIPO'));
        const grupos = new Map();
        if (esCSV) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length) {
                    for (const row of parsed.data) {
                        const modelo = (row.MODELO || '').trim();
                        const linea = (row.LINEA || '').trim();
                        const tipo = (row.TIPO || '').trim();
                        const talla = (row.TALLA || '').trim();
                        if (!modelo || !linea || !tipo) continue;
                        const key = `${modelo}|${linea}|${tipo}`;
                        if (!grupos.has(key)) {
                            grupos.set(key, { modelo, linea, tipo, tallas: new Set() });
                        }
                        if (talla) grupos.get(key).tallas.add(talla);
                    }
                }
            } catch(e) { console.warn(e); }
        } else {
            for (const line of lineas) {
                const tokens = line.trim().split(/\s+/);
                if (tokens.length < 3) continue;
                const modelo = tokens[0];
                const linea = tokens[1];
                const tipo = tokens[2];
                let talla = tokens.length > 3 ? tokens[3] : '';
                if (!modelo || !linea || !tipo) continue;
                const key = `${modelo}|${linea}|${tipo}`;
                if (!grupos.has(key)) {
                    grupos.set(key, { modelo, linea, tipo, tallas: new Set() });
                }
                if (talla) grupos.get(key).tallas.add(talla);
            }
        }
        const resultado = [];
        for (const [key, val] of grupos.entries()) {
            resultado.push({
                MODELO: val.modelo,
                LINEA: val.linea,
                TIPO: val.tipo,
                TALLAS: Array.from(val.tallas).filter(t => t).join(', ')
            });
        }
        return resultado;
    }

    function buscarPorLista() {
        const modelosRaw = document.getElementById('modelosBuscarInput').value;
        if (!modelosRaw.trim()) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega la lista de modelos.';
            return;
        }
        if (contenedoresCache.length === 0 && !cargarContenedoresDesdeTexto()) return;

        const paquetes5 = document.getElementById('paquetes5Checkbox').checked;
        const modelosQuery = parsearListaModelos(modelosRaw);
        if (modelosQuery.length === 0) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron interpretar los modelos.';
            return;
        }

        const resultados = [];
        const contenedorMap = new Map();

        for (const q of modelosQuery) {
            const encontrados = [];
            let totalCantidad = 0;
            for (const cont of contenedoresCache) {
                for (const alt of cont.alternativas) {
                    if (alt.modelo === q.MODELO && alt.linea === q.LINEA && alt.tipo === q.TIPO) {
                        if (paquetes5 && alt.cantidad > 5) continue;
                        encontrados.push({ folio: cont.folio, cantidad: alt.cantidad });
                        totalCantidad += alt.cantidad;
                        if (!contenedorMap.has(cont.folio)) {
                            contenedorMap.set(cont.folio, { folio: cont.folio, modelos: [] });
                        }
                        const entry = contenedorMap.get(cont.folio);
                        const keyModelo = `${q.MODELO}|${q.LINEA}|${q.TIPO}`;
                        if (!entry.modelos.some(m => m.key === keyModelo)) {
                            entry.modelos.push({
                                key: keyModelo,
                                modelo: q.MODELO,
                                linea: q.LINEA,
                                tipo: q.TIPO,
                                tallas: q.TALLAS,
                                cantidad: alt.cantidad
                            });
                        }
                    }
                }
            }
            resultados.push({
                MODELO: q.MODELO,
                LINEA: q.LINEA,
                TIPO: q.TIPO,
                TALLA: q.TALLAS,
                CANTIDAD: totalCantidad,
                CONTENEDORES_LIST: encontrados
            });
        }

        currentResultados = resultados.filter(r => r.CONTENEDORES_LIST.length > 0);
        currentResultados.sort((a,b) => (parseInt(a.MODELO)||0) - (parseInt(b.MODELO)||0));

        mostrarResultadosMejorados(currentResultados);
        document.getElementById('buscadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se procesaron ${modelosQuery.length} modelos, se encontraron ${currentResultados.length} coincidencias.`;

        if (!paquetes5 && contenedorMap.size > 0) {
            const resumen = Array.from(contenedorMap.values());
            resumen.sort((a,b) => a.folio.localeCompare(b.folio));
            currentResumenContenedores = resumen;
            mostrarResumenContenedores(resumen);
            document.getElementById('contenedorSummaryContainer').style.display = 'block';
        } else {
            document.getElementById('contenedorSummaryContainer').style.display = 'none';
            currentResumenContenedores = null;
        }
    }

    function mostrarResumenContenedores(contenedoresData) {
        if (!contenedoresData.length) {
            document.getElementById('contenedorSummaryOutput').innerHTML = '<p>No se encontraron contenedores con los modelos buscados.</p>';
            return;
        }
        let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr><th>Contenedor (Folio)</th><th>Modelos encontrados (Modelo, Línea, Tipo, Tallas solicitadas)</th></tr></thead><tbody>';
        for (const c of contenedoresData) {
            html += '<tr>';
            html += `<td style="vertical-align:top;"><strong>${escapeHtml(c.folio)}</strong></td>`;
            html += '<td><ul style="margin:0; padding-left:1.2rem;">';
            for (const m of c.modelos) {
                html += `<li>${escapeHtml(m.modelo)} ${escapeHtml(m.linea)} ${escapeHtml(m.tipo)} (Tallas: ${escapeHtml(m.tallas) || '—'}) - Cant: ${m.cantidad}</li>`;
            }
            html += '</ul></td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        document.getElementById('contenedorSummaryOutput').innerHTML = html;
    }

    function buscarLibre() {
        const busqueda = document.getElementById('busquedaLibreInput').value.trim();
        if (!busqueda) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Escribe algo para buscar.';
            return;
        }
        if (contenedoresCache.length === 0 && !cargarContenedoresDesdeTexto()) return;
        const paquetes5 = document.getElementById('paquetes5Checkbox').checked;
        const busquedaLower = busqueda.toLowerCase();
        const resultados = [];
        for (const cont of contenedoresCache) {
            for (const alt of cont.alternativas) {
                const texto = `${alt.modelo} ${alt.linea} ${alt.tipo}`.toLowerCase();
                if (texto.includes(busquedaLower)) {
                    if (paquetes5 && alt.cantidad > 5) continue;
                    resultados.push({
                        MODELO: alt.modelo,
                        LINEA: alt.linea,
                        TIPO: alt.tipo,
                        TALLA: alt.talla || '',
                        CANTIDAD: alt.cantidad,
                        CONTENEDOR_INFO: { folio: cont.folio, cantidad: alt.cantidad }
                    });
                }
            }
        }
        const agrupados = new Map();
        for (const r of resultados) {
            const key = `${r.MODELO}|${r.LINEA}|${r.TIPO}`;
            if (agrupados.has(key)) {
                const e = agrupados.get(key);
                e.CONTENEDORES_LIST.push(r.CONTENEDOR_INFO);
                e.CANTIDAD += r.CANTIDAD;
            } else {
                agrupados.set(key, {
                    MODELO: r.MODELO,
                    LINEA: r.LINEA,
                    TIPO: r.TIPO,
                    TALLA: r.TALLA,
                    CANTIDAD: r.CANTIDAD,
                    CONTENEDORES_LIST: [r.CONTENEDOR_INFO]
                });
            }
        }
        currentResultados = Array.from(agrupados.values());
        currentResultados.sort((a,b) => (parseInt(a.MODELO)||0) - (parseInt(b.MODELO)||0));
        mostrarResultadosMejorados(currentResultados);
        document.getElementById('buscadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Búsqueda "${escapeHtml(busqueda)}" encontró ${currentResultados.length} productos.`;
        document.getElementById('contenedorSummaryContainer').style.display = 'none';
        currentResumenContenedores = null;
    }

    function mostrarResultadosMejorados(data) {
        if (!data.length) {
            document.getElementById('buscadorOutput').innerHTML = '<p>No hay resultados.</p>';
            return;
        }
        let html = '<table class="output-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr><th>MODELO</th><th>LINEA</th><th>TIPO</th><th>TALLA</th><th>CANTIDAD</th><th>CONTENEDORES</th></tr></thead><tbody>';
        for (const row of data) {
            html += `<tr>
                        <td>${escapeHtml(row.MODELO)}</td>
                        <td>${escapeHtml(row.LINEA)}</td>
                        <td>${escapeHtml(row.TIPO)}</td>
                        <td>${escapeHtml(row.TALLA)}</td>
                        <td style="text-align:right;">${row.CANTIDAD}</td>
                        <td style="max-width:350px;">`;
            const lista = row.CONTENEDORES_LIST || [];
            if (!lista.length) html += 'NO ENCONTRADO';
            else {
                html += '<ul style="margin:0; padding-left:1.2rem;">';
                for (const item of lista) html += `<li>Folio: ${item.folio} (Cant: ${item.cantidad})</li>`;
                html += '</ul>';
            }
            html += `</td></tr>`;
        }
        html += '</tbody></table>';
        document.getElementById('buscadorOutput').innerHTML = html;
    }

    function descargarResultados() {
        if (!currentResultados.length) {
            document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay resultados.';
            return;
        }
        const csvData = currentResultados.map(row => ({
            MODELO: row.MODELO,
            LINEA: row.LINEA,
            TIPO: row.TIPO,
            TALLA: row.TALLA,
            CANTIDAD: row.CANTIDAD,
            CONTENEDORES: (row.CONTENEDORES_LIST || []).map(c => `${c.folio}(${c.cantidad})`).join('; ')
        }));
        const csv = core.dfToCsv(csvData, ',', true, true);
        core.downloadCsv(csv, `contenedores_encontrados_${core.generarNombreFecha('csv')}`);
        document.getElementById('buscadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> CSV descargado.`;
        setTimeout(() => { if (document.getElementById('buscadorMessage').innerHTML.includes('CSV')) document.getElementById('buscadorMessage').innerHTML = ''; }, 3000);
    }

    function limpiarResultados() {
        currentResultados = [];
        document.getElementById('buscadorOutput').innerHTML = '';
        document.getElementById('contenedorSummaryContainer').style.display = 'none';
        document.getElementById('buscadorMessage').innerHTML = '<i class="fas fa-eraser"></i> Resultados limpiados.';
        setTimeout(() => { if (document.getElementById('buscadorMessage').innerHTML.includes('limpiados')) document.getElementById('buscadorMessage').innerHTML = ''; }, 2000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
    }

    // ==================== EVENT LISTENERS ====================
    
    document.getElementById('buscarLibreBtn').addEventListener('click', buscarLibre);
    document.getElementById('buscarListaBtn').addEventListener('click', buscarPorLista);
    document.getElementById('descargarResultadosCsvBtn').addEventListener('click', descargarResultados);
    document.getElementById('limpiarResultadosBtn').addEventListener('click', limpiarResultados);
    document.getElementById('eliminarFoliosBtn').addEventListener('click', eliminarFolios);
    document.getElementById('exportarRestantesBtn').addEventListener('click', exportarContenedoresRestantes);
    
    // Cargar contenedores automáticamente cuando se pega texto
    document.getElementById('contenedoresTextoInput').addEventListener('input', function() {
        if (this.value.trim()) {
            cargarContenedoresDesdeTexto();
        }
    });

    // ==================== SUB-TABS ====================
    
    const subTabs = document.querySelectorAll('#contenedorSubTabs .sub-module-tab');
    const ahkPanel = document.getElementById('contenedorAhkPanel');
    const buscadorPanel = document.getElementById('contenedorBuscadorPanel');
    
    function setActivePanel(mode) {
        if (mode === 'ahk') { 
            ahkPanel.classList.add('active'); 
            buscadorPanel.classList.remove('active'); 
        } else { 
            ahkPanel.classList.remove('active'); 
            buscadorPanel.classList.add('active'); 
        }
        if (window.updateHash) window.updateHash('tab7', mode);
    }
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            setActivePanel(this.dataset.submode);
        });
    });
    setActivePanel('ahk');
    
    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab7' && e.detail.subMode) {
            const targetTab = document.querySelector(`#contenedorSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== BOTÓN LIMPIAR ====================
    
    const clearBtn = document.querySelector('#tab7 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('totalFolios').value = '10';
            document.getElementById('sleepTime').value = '250';
            document.getElementById('sleepCopy').value = '50';
            document.getElementById('windowsVersion').value = 'win11';
            document.getElementById('modelosBuscarInput').value = '';
            document.getElementById('contenedoresTextoInput').value = '';
            document.getElementById('busquedaLibreInput').value = '';
            document.getElementById('foliosAEliminarInput').value = '';
            document.getElementById('paquetes5Checkbox').checked = false;
            document.getElementById('buscadorOutput').innerHTML = '';
            document.getElementById('buscadorMessage').innerHTML = '';
            document.getElementById('eliminacionMessage').innerHTML = '';
            document.getElementById('contenedorSummaryContainer').style.display = 'none';
            currentResultados = [];
            currentResumenContenedores = null;
            contenedoresCache = [];
            contenedoresOriginales = [];
        });
    }
})();