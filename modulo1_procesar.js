// Módulo Procesar / Operar (Operador + Seccionador) - CON GENERACIÓN EAN-13 INTEGRADA
// v3.18 - Contador en vivo, detección automática de categoría de talla
(function() {
    const core = window.core;
    if (!core) return;

    const tabContainer = document.getElementById('tab1');
    if (!tabContainer) return;

    tabContainer.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-calculator"></i> Procesar formatos / Operaciones con folios</h3>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span style="font-size:0.7rem; color:var(--grayl); background:rgba(0,0,0,0.3); padding:0.15rem 0.5rem; border-radius:3px; border:1px solid var(--blu);">v3.19e</span>
                    <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
            <div class="sub-module-tabs" id="procesarSubTabs">
                <div class="sub-module-tab active" data-submode="operador">Operador</div>
                <div class="sub-module-tab" data-submode="seccionador">Seccionador</div>
            </div>
            <div id="procesarOperador" class="sub-panel active">
                <div id="procesarMultiTabs"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Operador</b><br>
                    1. Cada pestaña es independiente. Crea nuevas con el boton <span style="color:#ff8888;">+</span>.<br>
                    2. Haz doble clic sobre el nombre de una pestaña para cambiarlo.<br>
                    3. En cada pestaña puedes pegar o subir un Folio Maestro, agregar folios adicionales, elegir SUMAR o RESTAR.<br>
                    4. Puedes agregar varios folios a la vez con el campo "Agregar N folios".<br>
                    5. Los resultados se muestran solo en esa pestaña.<br>
                    <b>MODO TICKET:</b> copia/descarga solo las columnas esenciales sin cabeceras.<br>
                    <b>AUTOCOMPLETAR:</b> agrega los resultados procesados al textarea del Maestro.<br>
                    <b>AUTOSERVICIO:</b> añade un 0 al final del código EAN‑13 (13 → 14 dígitos).<br>
                    <b>ORDEN ORIGINAL:</b> mantiene el orden de aparición de los códigos (no ordena ascendente).<br>
                    <b>MODO SUMINISTROS:</b> AHK especial para suministros (un código de cada modelo con cantidades).<br>
                    <b>AHK:</b> genera scripts con los códigos EAN‑13 generados.<br>
                    <b>Copiar AHK:</b> copia la lista de códigos EAN‑13 expandidos por cantidad, cada código en una línea.<br>
                    <b>Soporte CSV:</b> acepta archivos con comillas y sin cabeceras (orden: MODELO,LINEA,TIPO,TALLA,CANTIDAD).<br>
                    <b>Cambio de talla:</b> usa los botones <i class="fas fa-shoe-prints"></i> (calzado), <i class="fas fa-tag"></i> (pantalón), <i class="fas fa-circle"></i> (cinto) para ajustar el código EAN‑13.<br>
                    <b>Edición:</b> usa el botón <i class="fas fa-pen"></i> para editar talla y cantidad, <i class="fas fa-save"></i> para guardar, <i class="fas fa-times"></i> para cancelar.<br>
                    <b>Arrastrar archivos:</b> puedes arrastrar archivos .txt o .csv directamente a los textareas.
                </div>
            </div>
            <div id="procesarSeccionador" class="sub-panel">
                <div id="categoriasContainer">
                    <div class="categoria-tabs" id="categoriaTabsContainer"></div>
                    <div id="categoriaPanelsContainer"></div>
                </div>
                <div class="row">
                    <button id="addCategoriaBtn" class="add-categoria-btn"><i class="fas fa-plus"></i> Agregar categoria</button>
                </div>
                <div class="row">
                    <button id="unificarCsvBtn" class="btn-primary"><i class="fas fa-file-csv"></i> Generar CSV unificado</button>
                    <button id="descargarPorCategoriaBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar por categoria</button>
                </div>
                <div id="seccionadorMessage" class="message"></div>
                <div id="seccionadorOutput" class="output-area"></div>
                <hr class="separator-18">
                <h4><i class="fas fa-search"></i> Comparacion vs Escaneo (global)</h4>
                <div class="row">
                    <label><b>Escaneo (formato universal):</b></label>
                    <textarea id="scanGlobalInput" rows="4" placeholder="Pega aqui el escaneo (modelos con cantidades)"></textarea>
                </div>
                <div class="row">
                    <div class="checkbox-label">
                        <input type="checkbox" id="includeCategoryInDiffCheckbox">
                        <label for="includeCategoryInDiffCheckbox">Incluir columna CATEGORIA en diferencias</label>
                    </div>
                </div>
                <div class="row">
                    <button id="compararEscaneoBtn" class="btn-primary"><i class="fas fa-balance-scale"></i> Comparar existencias vs escaneo</button>
                    <button id="descargarDiferenciasBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar diferencias CSV</button>
                    <button id="descargarTodosEscaneadosBtn" class="btn-secondary"><i class="fas fa-download"></i> Descargar todos los escaneados con categoria</button>
                </div>
                <div id="comparacionMessage" class="message"></div>
                <div id="comparacionOutput" class="output-area"></div>
                <div class="instructions-box">
                    <b><i class="fas fa-info-circle"></i> Instrucciones – Seccionador</b><br>
                    1. Las categorias predefinidas son: CALZADO, VESTIR INTERIOR, VESTIR EXTERIOR, ACCESORIOS, HOME.<br>
                    2. Puedes agregar mas categorias con el boton <span style="color:#ff8888;">+</span>.<br>
                    3. En cada categoria pega el contenido (formato universal) de los productos correspondientes.<br>
                    4. <b>Generar CSV unificado</b> → descarga un archivo con todas las filas mas la columna CATEGORIA.<br>
                    5. <b>Descargar por categoria</b> → permite elegir una categoria y descargar solo sus datos.<br>
                    6. <b>Comparar existencias vs escaneo</b> → genera diferencias en formato compatible con el modulo de compensacion.<br>
                    7. <b>Incluir categoria en diferencias</b> → añade la columna CATEGORIA en el CSV de diferencias.<br>
                    8. <b>Descargar todos los escaneados con categoria</b> → genera un listado de cada articulo del escaneo con su categoria asignada.<br>
                    9. Los CSV se generan con comillas en todos los campos.
                </div>
            </div>
        </div>
    `;

    // ========== FUNCIÓN GENERAR AHK NORMAL ==========
    function generarAHKConCancelar(codigosConCantidad, titulo = '') {
        if (!codigosConCantidad || codigosConCantidad.length === 0) return null;
        let codigosExpandidos = [];
        for (const item of codigosConCantidad) {
            let cant = 1;
            if (item.cantidad !== undefined && item.cantidad !== null) {
                cant = parseInt(item.cantidad);
                if (isNaN(cant) || cant < 1) cant = 1;
            }
            const codigo = item.codigo || item.codigoFinal || item;
            if (typeof codigo === 'string') {
                for (let i = 0; i < cant; i++) {
                    codigosExpandidos.push(codigo);
                }
            }
        }
        if (codigosExpandidos.length === 0) return null;
        const MAX_CODIGOS_POR_GRUPO = 50;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigosExpandidos.length} envíos (Sleep 50ms entre cada código, 100ms entre grupos)\n\n`;
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        const grupos = [];
        for (let i = 0; i < codigosExpandidos.length; i += MAX_CODIGOS_POR_GRUPO) {
            grupos.push(codigosExpandidos.slice(i, i + MAX_CODIGOS_POR_GRUPO));
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

    // ========== FUNCIÓN GENERAR AHK MODO SUMINISTROS ==========
    function generarAHKSuministros(codigosConCantidad, titulo = '') {
        if (!codigosConCantidad || codigosConCantidad.length === 0) return null;
        const itemsValidos = codigosConCantidad.filter(item => {
            const cant = parseInt(item.cantidad) || 0;
            return cant > 0 && item.codigo;
        });
        if (itemsValidos.length === 0) return null;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${itemsValidos.length} productos (Modo Suministros)\n\n`;
        ahk += '^q::\n';
        ahk += '    ; ===== PASO 1: ESCRIBIR TODOS LOS CODIGOS =====\n';
        ahk += '    codigos := Object()\n';
        for (let i = 0; i < itemsValidos.length; i++) {
            const item = itemsValidos[i];
            const codigo = item.codigo;
            ahk += `    codigos[${i+1}] := "${codigo}"\n`;
        }
        ahk += '    \n';
        ahk += '    Loop, % codigos.Length()\n';
        ahk += '    {\n';
        ahk += '        SendInput, % codigos[A_Index]\n';
        ahk += '        SendInput, {Enter}\n';
        ahk += '        Sleep 100\n';
        ahk += '    }\n';
        ahk += '    \n';
        ahk += '    ; ===== PASO 2: CLICKS CON CANTIDADES =====\n';
        ahk += '    cantidades := Object()\n';
        for (let i = 0; i < itemsValidos.length; i++) {
            const item = itemsValidos[i];
            const cantidad = parseInt(item.cantidad) || 1;
            ahk += `    cantidades[${i+1}] := ${cantidad}\n`;
        }
        ahk += '    \n';
        ahk += '    x := 93\n';
        ahk += '    y := 259\n';
        ahk += '    Sleep 500\n';
        ahk += '    \n';
        ahk += '    Loop, % cantidades.Length()\n';
        ahk += '    {\n';
        ahk += '        ; Click en la posición\n';
        ahk += '        Click, %x%, %y%\n';
        ahk += '        Sleep 100\n';
        ahk += '        \n';
        ahk += '        ; Flechas abajo (0 para el primero, 1 para el segundo, etc.)\n';
        ahk += '        flechas := A_Index - 1\n';
        ahk += '        Loop, %flechas%\n';
        ahk += '        {\n';
        ahk += '            SendInput, {Down}\n';
        ahk += '            Sleep 50\n';
        ahk += '        }\n';
        ahk += '        \n';
        ahk += '        ; Presionar F3\n';
        ahk += '        SendInput, {F3}\n';
        ahk += '        Sleep 100\n';
        ahk += '        \n';
        ahk += '        ; Escribir la cantidad\n';
        ahk += '        SendInput, % cantidades[A_Index]\n';
        ahk += '        Sleep 100\n';
        ahk += '        \n';
        ahk += '        ; Presionar Enter\n';
        ahk += '        SendInput, {Enter}\n';
        ahk += '        Sleep 100\n';
        ahk += '    }\n';
        ahk += '    \n';
        ahk += '    SoundBeep\n';
        ahk += 'Return\n\n';
        ahk += '+Esc::ExitApp';
        return ahk;
    }

    let procesarTabCounter = 1;
    let activeProcesarTabId = 'procesar_tab_0';

    function construirNombreConDropdowns(containerElement) {
        const tipoOrigen = containerElement.querySelector('#tipoOrigen')?.value || '';
        const tipoUbicacion = containerElement.querySelector('#tipoUbicacion')?.value || '';
        const tipoCategoria = containerElement.querySelector('#tipoCategoria')?.value || '';
        const nombrePersonalizado = containerElement.querySelector('#nombrePersonalizado')?.value || '';
        const sufijoAdicional = containerElement.querySelector('#sufijoAdicional')?.value || '';
        let base = '';
        if (tipoOrigen) base += tipoOrigen;
        if (tipoUbicacion) base += tipoUbicacion;
        if (tipoCategoria) base += tipoCategoria;
        if (nombrePersonalizado) base += nombrePersonalizado;
        if (sufijoAdicional) base += sufijoAdicional;
        if (!base) return null;
        return base;
    }

    function getProcesarPanelHTML(tabId) {
        return `
            <div id="${tabId}" class="procesar-panel">
                <div style="margin:0.5rem 0; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:5px;">
                    <b><i class="fas fa-file-format"></i> Formato de entrada:</b>
                    <div class="row" style="margin:0.3rem 0; gap:0.3rem; flex-wrap:wrap;">
                        <button class="format-btn btn-secondary" data-format="auto" style="background:#2ecc71; border-color:#2ecc71;">Auto</button>
                        <button class="format-btn btn-secondary" data-format="folios">Folios (Formato 1)</button>
                        <button class="format-btn btn-secondary" data-format="existencias">Existencias (Formato 2)</button>
                        <button class="format-btn btn-secondary" data-format="contenedor">Contenedor</button>
                        <button class="format-btn btn-secondary" data-format="cambios">Cambios</button>
                        <button class="format-btn btn-secondary" data-format="csv">CSV</button>
                    </div>
                    <span id="formatoSeleccionado_${tabId}" style="font-size:0.8rem; color:var(--grayl);">Formato actual: <strong style="color:#2ecc71;">Auto</strong></span>
                </div>

                <div style="display:flex; align-items:center; gap:1.5rem; margin:0.3rem 0 0.5rem 0; flex-wrap:wrap; background:rgba(0,0,0,0.08); padding:0.2rem 0.8rem; border-radius:4px;">
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-hashtag"></i> Codigos: <strong class="liveCount" style="color:#2ecc71; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-filter"></i> Unicos: <strong class="liveUnique" style="color:#3498db; font-size:1rem;">0</strong>
                    </span>
                    <span style="font-size:0.8rem; color:var(--grayl);">
                        <i class="fas fa-calculator"></i> Suma digitos control: <strong class="liveTotalUnidades" style="color:#f1c40f; font-size:1rem;">0</strong>
                    </span>
                </div>

                <div class="row"><label><b>Nombre Folio Maestro:</b></label><input type="text" class="mainMaestroName" value="MAESTRO" style="width:150px;"></div>
                <label class="form-label"><b>Folio Maestro (pega o sube archivo):</b></label>
                <textarea class="mainMaestroInput" placeholder="Pega el FOLIO MAESTRO..." rows="4"></textarea>
                <div class="row"><button class="uploadMainMaestroBtn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="mainMaestroFile" accept=".csv,.txt,text/plain" style="display:none;"></div>
                <div style="margin:0.5rem 0;">
                    <b>Folios adicionales:</b> 
                    <button class="addMainFolioBtn"><i class="fas fa-plus"></i> Agregar folio</button>
                    <input type="number" class="addMultipleFoliosInput" value="1" min="1" max="50" style="width:70px; text-align:center;">
                    <button class="addMultipleFoliosBtn"><i class="fas fa-plus-circle"></i> Agregar N folios</button>
                    <button class="importMultipleCsvBtn" style="margin-left:0.5rem;"><i class="fas fa-file-import"></i> Importar multiples CSV</button>
                    <input type="file" class="importMultipleFileInput" accept=".csv,.txt,text/plain" multiple style="display:none;">
                    <button class="removeAllFoliosBtn" style="background:#aa2e2e; border-color:#aa2e2e;"><i class="fas fa-trash-alt"></i> Borrar todos los folios adicionales</button>
                </div>
                <div class="mainFoliosContainer"></div>

                <div style="margin:1rem 0; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:8px;">
                    <b><i class="fas fa-tag"></i> Configurar nombre de archivo:</b>
                    <div class="row">
                        <select id="tipoOrigen" style="width:130px;">
                            <option value="">(seleccionar)</option>
                            <option value="escaneo">escaneo</option>
                            <option value="existencia">existencia</option>
                        </select>
                        <select id="tipoUbicacion" style="width:150px;">
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
                        <select id="tipoCategoria" style="width:120px;">
                            <option value="">(seleccionar)</option>
                            <option value="home">home</option>
                            <option value="calzado">calzado</option>
                            <option value="ropa">ropa</option>
                            <option value="catalogos">catalogos</option>
                        </select>
                        <input type="text" id="nombrePersonalizado" placeholder="Personalizado" style="width:130px;">
                        <input type="text" id="sufijoAdicional" placeholder="Sufijo extra" style="width:100px;">
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.8rem; flex-wrap:wrap; background:rgba(0,0,0,0.15); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--blu);">
                    <div class="toggle-group" id="operMainToggle_${tabId}" style="display:inline-flex;">
                        <span class="toggle-option active-toggle" data-op="sumar">+ SUMAR</span>
                        <span class="toggle-option" data-op="restar">- RESTAR</span>
                    </div>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="autocompletarCheckbox" checked style="width:16px; height:16px; accent-color:#2ecc71;"> 
                        <strong style="color:#2ecc71;"><i class="fas fa-sync-alt"></i> Autocompletar</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="autoservicioCheckbox" style="width:16px; height:16px; accent-color:#ffa500;"> 
                        <strong style="color:#ffa500;"><i class="fas fa-plus-circle"></i> Autoservicio</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="ordenOriginalCheckbox" style="width:16px; height:16px; accent-color:#f1c40f;"> 
                        <strong style="color:#f1c40f;"><i class="fas fa-sort-amount-down-alt"></i> Orden original</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="mainTicketMode" style="width:16px; height:16px; accent-color:#3498db;"> 
                        <strong style="color:#3498db;"><i class="fas fa-ticket-alt"></i> Modo Ticket</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="modoSuministrosCheckbox" style="width:16px; height:16px; accent-color:#8b00ff;"> 
                        <strong style="color:#8b00ff;"><i class="fas fa-warehouse"></i> Modo Suministros</strong>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(0,0,0,0.2); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid var(--blu); cursor:pointer;">
                        <input type="checkbox" class="mostrarDanadosCheckbox" style="width:16px; height:16px; accent-color:#e74c3c;"> 
                        <strong style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Mostrar dañados</strong>
                    </label>
                    <button class="toggle-special-models-btn" style="background:#8b00ff; border-color:#8b00ff; color:white; font-size:0.75rem; padding:0.2rem 0.6rem; display:inline-flex; align-items:center; gap:0.3rem; border-radius:4px; cursor:pointer;">
                        <i class="fas fa-plus"></i> MODELOS ESPECIALES
                    </button>
                </div>

                <div id="specialModelsPanel" style="display:none; margin-top:0.5rem; padding:0.8rem; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid var(--blu);">
                    <div class="sub-module-tabs" id="adminSpecialTabs" style="margin-bottom:0.5rem;">
                        <div class="sub-module-tab active" data-admin="mapeo">Mapeo Tallas Especiales</div>
                        <div class="sub-module-tab" data-admin="modelos">Modelos Especiales</div>
                    </div>
                    <div id="adminMapeoContainer">
                        <div style="max-height:300px; overflow:auto; margin-bottom:0.5rem;">
                            <table id="mapeoTallasTable" class="output-table" style="font-size:0.75rem;">
                                <thead><tr><th>MODELO</th><th>TALLA_ORIGINAL</th><th>CODIGO_TALLA</th><th>Acción</th></tr></thead>
                                <tbody id="mapeoTallasBody"></tbody>
                            </table>
                        </div>
                        <div class="row">
                            <button id="addMapeoRowBtn" class="btn-secondary" style="font-size:0.7rem;"><i class="fas fa-plus"></i> Agregar fila</button>
                            <button id="saveMapeoToCmsBtn" class="btn-primary" style="font-size:0.7rem;"><i class="fas fa-save"></i> Guardar en CMS</button>
                            <span id="mapeoFeedback" class="copy-feedback"></span>
                        </div>
                    </div>
                    <div id="adminModelosContainer" style="display:none;">
                        <div style="max-height:300px; overflow:auto; margin-bottom:0.5rem;">
                            <table id="modelosEspecialesTable" class="output-table" style="font-size:0.75rem;">
                                <thead><tr><th>MODELO</th><th>CODIGO_ENTERO</th><th>CODIGO_HALF</th><th>Acción</th></tr></thead>
                                <tbody id="modelosEspecialesBody"></tbody>
                            </table>
                        </div>
                        <div class="row">
                            <button id="addModeloRowBtn" class="btn-secondary" style="font-size:0.7rem;"><i class="fas fa-plus"></i> Agregar fila</button>
                            <button id="saveModelosToCmsBtn" class="btn-primary" style="font-size:0.7rem;"><i class="fas fa-save"></i> Guardar en CMS</button>
                            <span id="modelosFeedback" class="copy-feedback"></span>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <button class="processMainBtn btn-primary"><i class="fas fa-play"></i> Procesar</button>
                    <button class="buscarColoresBtn" style="background:#8b00ff; border-color:#8b00ff;"><i class="fas fa-palette"></i> Buscar colores</button>
                    <button class="editAllBtn" style="background:#3498db; border-color:#3498db;"><i class="fas fa-pen"></i> Editar todos</button>
                    <button class="copyMainTsvBtn"><i class="fas fa-copy"></i> Copiar TSV</button>
                    <button class="copyMainCsvBtn"><i class="fas fa-file-csv"></i> Copiar CSV</button>
                    <input type="text" class="mainFilename" value="archivo.csv" style="width:190px;">
                    <button class="downloadMainBtn"><i class="fas fa-download"></i> Descargar CSV</button>
                    <span class="copy-feedback"></span>
                </div>
                <div class="row" style="margin-top:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <button class="downloadAhkBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-code"></i> Descargar AHK</button>
                    <button class="copyAhkBtn" style="background:#444; border-color:#ffa500;"><i class="fas fa-copy"></i> Copiar AHK</button>
                    <span class="copy-feedback-ahk"></span>
                </div>
                <div class="row" style="margin-top:0.3rem; flex-wrap:wrap; gap:0.5rem; display:none;" id="edicionMasivaContainer_${tabId}">
                    <button class="saveAllBtn" style="background:#2ecc71; border-color:#2ecc71;"><i class="fas fa-save"></i> Guardar todos</button>
                    <button class="cancelAllBtn" style="background:#ffa500; border-color:#ffa500;"><i class="fas fa-times"></i> Cancelar edición</button>
                </div>

                <div id="codigosDanadosContainer_${tabId}" style="display:none; margin-top:0.8rem; border:2px solid #e74c3c; border-radius:6px; padding:0.6rem; background:rgba(231,76,60,0.08);">
                    <h4 style="color:#e74c3c; margin:0 0 0.3rem 0; font-size:0.85rem;">
                        <i class="fas fa-exclamation-triangle"></i> Códigos dañados / no reconocidos
                    </h4>
                    <div id="codigosDanadosList_${tabId}" style="font-size:0.75rem; color:#e74c3c; max-height:200px; overflow:auto; font-family:monospace;"></div>
                </div>
                <div class="message"></div>
                <div class="output-area"></div>
            </div>
        `;
    }

    // ========== FUNCIÓN PARA ACTUALIZAR CONTADOR EN VIVO ==========
    function actualizarConteoVivo(panel) {
        const maestroTextarea = panel?.querySelector('.mainMaestroInput');
        if (!maestroTextarea) return;

        const texto = maestroTextarea.value || '';
        const countEl = panel.querySelector('.liveCount');
        const uniqueEl = panel.querySelector('.liveUnique');
        const totalUnidadesEl = panel.querySelector('.liveTotalUnidades');

        if (!countEl || !uniqueEl || !totalUnidadesEl) return;

        const patron = /\b(\d{13,14})\b/g;
        const encontrados = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            encontrados.push(match[1]);
        }

        const total = encontrados.length;
        const unicos = new Set(encontrados);
        const sumaDigitos = encontrados.reduce(function(s, cod) {
            const ultimoDigito = parseInt(cod.slice(-1));
            return s + (isNaN(ultimoDigito) ? 0 : ultimoDigito);
        }, 0);

        countEl.textContent = total;
        uniqueEl.textContent = unicos.size;
        totalUnidadesEl.textContent = sumaDigitos;

        if (total > 100) {
            countEl.style.color = '#ffa500';
        } else if (total > 50) {
            countEl.style.color = '#f1c40f';
        } else {
            countEl.style.color = '#2ecc71';
        }
    }

    // ========== FUNCIONES DE GENERACIÓN Y RENDERIZADO CON EAN-13 ==========
    function recalcularCodigoEAN(item, nuevoTipo, autoservicio) {
        const lib = core.obtenerBiblioteca();
        if (!lib.length) return item;
        let encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
        if (!encontrado) {
            encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
        }
        if (!encontrado) return item;
        
        const modoAnterior = core.getTallaMode();
        core.setTallaMode(nuevoTipo);
        
        // Obtener código de talla con el modo forzado
        const resultado = core.obtenerCodigoTallaEspecial(item.TALLA, nuevoTipo, item.MODELO);
        const codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
        
        core.setTallaMode(modoAnterior);
        
        if (autoservicio) {
            codigoFinal = codigoFinal + '0';
        }
        
        const categoriaFinal = resultado.categoria || nuevoTipo;
        
        return {
            ...item,
            CODIGO_EAN13: codigoFinal,
            tipoTalla: categoriaFinal
        };
    }

    function renderTablaConBotonesEAN(data, panelId, autoservicio, combinacionesMap) {
        if (!data || !data.length) return '<p style="color:#666;">Sin datos. Procesa nuevamente.</p>';
        const lib = core.obtenerBiblioteca();
        if (!combinacionesMap) {
            combinacionesMap = new Map();
            if (lib && lib.length) {
                for (const item of lib) {
                    const modelo = String(item.MODELO).trim();
                    const key = `${modelo}`;
                    if (!combinacionesMap.has(key)) {
                        combinacionesMap.set(key, []);
                    }
                    combinacionesMap.get(key).push({
                        LINEA: item.LINEA || '',
                        TIPO: item.TIPO || ''
                    });
                }
            }
        }

        let headers = ['MODELO', 'COLOR+TIPO', 'TALLA', 'CANTIDAD', 'CATEGORIA'];
        if (autoservicio) {
            headers.push('AUTOSERVICIO');
        }
        headers.push('CÓDIGO EAN‑13');
        headers.push('ACCIONES');

        let rows = data.map((r, idx) => {
            const isTotal = r.TALLA === 'TOTAL';
            const tipo = r.tipoTalla || 'normal';
            const codigo = r.CODIGO_EAN13 || '';
            const autoservicioVal = autoservicio ? (r.AUTOSERVICIO || '') : '';
            const modoEdicion = r.editando || false;

            const modeloKey = String(r.MODELO).trim();
            const combinaciones = combinacionesMap.get(modeloKey) || [];
            const combinacionesUnicas = [];
            const seen = new Set();
            for (const c of combinaciones) {
                const key = `${c.LINEA}|${c.TIPO}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    combinacionesUnicas.push(c);
                }
            }

            const tieneMultiples = combinacionesUnicas.length > 1;
            const valorActual = `${r.LINEA}|${r.TIPO}`;
            const bgNormal = (tipo === 'normal') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
            const bgPants = (tipo === 'pantalon') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';
            const bgBelt = (tipo === 'cinto') ? 'background:#ff4444; color:#fff;' : 'background:transparent; color:#aaa;';

            let rowHtml = '<tr>';
            rowHtml += `<td>${r.MODELO || ''}</td>`;

            if (!isTotal && tieneMultiples) {
                rowHtml += `<td>
                    <select class="combo-select" data-panel="${panelId}" data-idx="${idx}" style="background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.3rem; font-size:0.75rem; max-width:120px;">
                        ${combinacionesUnicas.map(c => {
                            const val = `${c.LINEA}|${c.TIPO}`;
                            const selected = val === valorActual ? 'selected' : '';
                            return `<option value="${val}" ${selected}>${c.LINEA} ${c.TIPO}</option>`;
                        }).join('')}
                    </select>
                </td>`;
            } else if (!isTotal) {
                rowHtml += `<td>${r.LINEA || ''} ${r.TIPO || ''}</td>`;
            } else {
                rowHtml += `<td></td>`;
            }

            if (!isTotal) {
                if (modoEdicion) {
                    rowHtml += `<td><input type="text" class="talla-edit" data-panel="${panelId}" data-idx="${idx}" value="${r.TALLA || ''}" style="width:60px; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.2rem; font-size:0.75rem;"></td>`;
                } else {
                    rowHtml += `<td class="talla-display">${r.TALLA || ''}</td>`;
                }
            } else {
                rowHtml += `<td style="font-weight:bold;">TOTAL</td>`;
            }

            if (!isTotal) {
                if (modoEdicion) {
                    rowHtml += `<td><input type="number" class="cantidad-edit" data-panel="${panelId}" data-idx="${idx}" value="${r.CANTIDAD || 0}" min="0" style="width:50px; background:var(--blud); color:white; border:1px solid var(--blu); border-radius:3px; padding:0.1rem 0.2rem; font-size:0.75rem;"></td>`;
                } else {
                    rowHtml += `<td class="cantidad-display">${r.CANTIDAD || 0}</td>`;
                }
            } else {
                rowHtml += `<td style="font-weight:bold;">${r.CANTIDAD || 0}</td>`;
            }

            if (!isTotal) {
                rowHtml += `<td style="white-space:nowrap; text-align:center;">
                    <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="normal" style="${bgNormal} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;" title="Calzado"><i class="fas fa-shoe-prints"></i></button>
                    <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="pantalon" style="${bgPants} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;" title="Pantalón"><i class="fas fa-tag"></i></button>
                    <button class="talla-btn" data-panel="${panelId}" data-idx="${idx}" data-tipo="cinto" style="${bgBelt} border:1px solid #555; border-radius:4px; cursor:pointer; padding:2px 6px; margin:0 2px;" title="Cinto"><i class="fas fa-circle"></i></button>
                </td>`;
            } else {
                rowHtml += `<td></td>`;
            }

            if (autoservicio) {
                if (!isTotal && autoservicioVal) {
                    rowHtml += `<td><span style="background:#ff4444; color:white; padding:2px 4px; border-radius:3px; display:inline-block;"><i class="fas fa-check"></i></span></td>`;
                } else {
                    rowHtml += `<td></td>`;
                }
            }

            if (!isTotal && codigo) {
                rowHtml += `<td style="font-family:monospace; font-weight:bold; font-size:0.75rem;">${codigo}</td>`;
            } else {
                rowHtml += `<td>${isTotal ? 'TOTAL' : ''}</td>`;
            }

            if (!isTotal) {
                if (modoEdicion) {
                    rowHtml += `<td style="white-space:nowrap;">
                        <button class="save-edit-btn" data-panel="${panelId}" data-idx="${idx}" style="background:#2ecc71; border:1px solid #2ecc71; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Guardar cambios"><i class="fas fa-save"></i></button>
                        <button class="cancel-edit-btn" data-panel="${panelId}" data-idx="${idx}" style="background:#ffa500; border:1px solid #ffa500; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Cancelar edición"><i class="fas fa-times"></i></button>
                        <button class="delete-row-btn" data-panel="${panelId}" data-idx="${idx}" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Eliminar fila"><i class="fas fa-trash"></i></button>
                    </td>`;
                } else {
                    rowHtml += `<td style="white-space:nowrap;">
                        <button class="edit-row-btn" data-panel="${panelId}" data-idx="${idx}" style="background:#3498db; border:1px solid #3498db; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Editar"><i class="fas fa-pen"></i></button>
                        <button class="delete-row-btn" data-panel="${panelId}" data-idx="${idx}" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Eliminar fila"><i class="fas fa-trash"></i></button>
                        <button class="copy-individual-btn" data-codigo="${codigo}" style="background:#444; border:1px solid var(--blu); color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;" title="Copiar código"><i class="fas fa-copy"></i></button>
                    </td>`;
                }
            } else {
                rowHtml += `<td></td>`;
            }

            rowHtml += '</tr>';
            return rowHtml;
        });

        const total = data.reduce((s, r) => s + (parseInt(r.CANTIDAD) || 0), 0);
        let totalHtml = '<tr>';
        totalHtml += `<td></td><td></td><td style="font-weight:bold;">TOTAL</td><td style="font-weight:bold;">${total}</td><td></td>`;
        if (autoservicio) totalHtml += `<td></td>`;
        totalHtml += `<td></td><td></td></tr>`;
        rows.push(totalHtml);

        // Suma de dígitos de control
        let sumaDigitosControl = 0;
        data.forEach(function(r) {
            if (r.CODIGO_EAN13 && r.TALLA !== 'TOTAL') {
                const ultimoDigito = parseInt(r.CODIGO_EAN13.slice(-1));
                if (!isNaN(ultimoDigito)) {
                    sumaDigitosControl += ultimoDigito;
                }
            }
        });

        let html = '<table class="output-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">';
        html += '<thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        html += rows.join('');
        html += '</tbody></table>';

        // Agregar la suma de dígitos de control debajo de la tabla
        html += '<div style="margin-top:0.5rem; padding:0.3rem 0.8rem; background:rgba(0,0,0,0.2); border-radius:4px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">';
        html += `<span style="font-size:0.8rem; color:var(--grayl);"><i class="fas fa-calculator"></i> Suma de dígitos de control: <strong style="color:#f1c40f;">${sumaDigitosControl}</strong></span>`;
        html += `<span style="font-size:0.8rem; color:var(--grayl);"><i class="fas fa-hashtag"></i> Total registros: <strong style="color:#2ecc71;">${data.filter(r => r.TALLA !== 'TOTAL').length}</strong></span>`;
        html += '</div>';

        return html;
    }

    // ========== PROCESAR TEXTO CON BIBLIOTECA ==========
    function procesarTextoConBiblioteca(texto, formato) {
        if (!texto.trim()) return [];
        const lib = core.obtenerBiblioteca();
        let items = [];
        let resultados = [];
        const lines = texto.split(/\r?\n/);
        let tieneFormato1 = false;
        let lineasTallas = 0;
        let lineasProductos = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (/^\s*\d+(?:\.5|½)?/.test(trimmed) && /^\s*$/.test(line.substring(0, line.indexOf(trimmed) === -1 ? 0 : line.indexOf(trimmed)))) {
                lineasTallas++;
            } else if (/^\d{4,5}\s+[A-Z]{2,}\s+[A-Z]{2,}/.test(trimmed)) {
                lineasProductos++;
            }
        }
        if (lineasTallas > 0 && lineasProductos > 0) {
            tieneFormato1 = true;
        }
        if ((formato === 'folios' || formato === 'auto') && tieneFormato1) {
            const parsed = core.parsearFormato1(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if ((formato === 'existencias' || formato === 'auto') && (texto.includes('Si') || texto.includes('No'))) {
            const parsed = core.parsearFormato2(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if (formato === 'csv' || (formato === 'auto' && texto.includes('MODELO') && texto.includes(','))) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length) {
                    for (const row of parsed.data) {
                        const modelo = String(row.MODELO || '').trim();
                        const linea = String(row.LINEA || row.COLOR || '').trim().toUpperCase();
                        const tipo = String(row.TIPO || row.MATERIAL || '').trim().toUpperCase();
                        const talla = String(row.TALLA || '').trim();
                        let cantidad = parseInt(row.CANTIDAD) || 1;
                        if (modelo && linea && tipo) {
                            items.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla, CANTIDAD: cantidad });
                        }
                    }
                }
            } catch (e) {}
        }
        else if (formato === 'contenedor' || formato === 'auto') {
            const parsed = core.parsearFormatoContenedor ? core.parsearFormatoContenedor(texto) : null;
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        else if (formato === 'cambios' || formato === 'auto') {
            const parsed = core.parsearFormatoCambios ? core.parsearFormatoCambios(texto) : null;
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            }
        }
        if (items.length === 0 && formato === 'auto') {
            const parsed = core.parsearTextoUniversal(texto);
            if (parsed && parsed.length > 0) {
                items = parsed.filter(r => r.TALLA !== 'TOTAL');
            } else {
                const extracted = core.extraerModelosConCantidad(texto);
                if (extracted && extracted.length > 0) {
                    items = extracted;
                }
            }
        }
        for (const item of items) {
            let modelo = item.MODELO;
            let lineaVal = item.LINEA || '';
            let tipo = item.TIPO || '';
            let talla = item.TALLA || '';
            let cantidad = item.CANTIDAD || 1;
            let encontrado = core.buscarCodigoPrioritario(modelo, lineaVal, tipo, lib);
            if (encontrado) {
                resultados.push({
                    MODELO: encontrado.MODELO,
                    LINEA: encontrado.LINEA,
                    TIPO: encontrado.TIPO,
                    TALLA: talla,
                    CANTIDAD: cantidad
                });
            } else {
                resultados.push({
                    MODELO: modelo,
                    LINEA: lineaVal,
                    TIPO: tipo,
                    TALLA: talla,
                    CANTIDAD: cantidad
                });
            }
        }
        return resultados;
    }

    // ========== INICIALIZAR PANEL CON EVENTOS ==========
    function initProcesarPanelEvents(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // ========== CHECKBOXES ==========
        const autocompletarCheckbox = panel.querySelector('.autocompletarCheckbox');
        const autoservicioCheckbox = panel.querySelector('.autoservicioCheckbox');
        const ordenOriginalCheckbox = panel.querySelector('.ordenOriginalCheckbox');
        const ticketCheckbox = panel.querySelector('.mainTicketMode');
        const modoSuministrosCheckbox = panel.querySelector('.modoSuministrosCheckbox');
        const mostrarDanadosCheckbox = panel.querySelector('.mostrarDanadosCheckbox');

        let formatoSeleccionado = 'auto';
        const formatoLabel = panel.querySelector(`#formatoSeleccionado_${panelId}`);
        const formatBtns = panel.querySelectorAll('.format-btn');
        formatBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                formatBtns.forEach(b => {
                    b.style.background = '';
                    b.style.borderColor = '';
                    b.style.color = '';
                });
                this.style.background = '#2ecc71';
                this.style.borderColor = '#2ecc71';
                this.style.color = '#000';
                formatoSeleccionado = this.dataset.format;
                if (formatoLabel) {
                    const nombres = {
                        'auto': 'Auto',
                        'folios': 'Folios (Formato 1)',
                        'existencias': 'Existencias (Formato 2)',
                        'contenedor': 'Contenedor',
                        'cambios': 'Cambios',
                        'csv': 'CSV'
                    };
                    formatoLabel.innerHTML = `Formato actual: <strong style="color:#2ecc71;">${nombres[formatoSeleccionado] || formatoSeleccionado}</strong>`;
                }
            });
        });
        const autoBtn = panel.querySelector('.format-btn[data-format="auto"]');
        if (autoBtn) autoBtn.click();

        const toggleOptions = panel.querySelectorAll('#operMainToggle_' + panelId + ' .toggle-option');
        let mainOp = 'sumar';
        toggleOptions.forEach(opt => {
            opt.addEventListener('click', function() {
                toggleOptions.forEach(o => o.classList.remove('active-toggle'));
                this.classList.add('active-toggle');
                mainOp = this.dataset.op;
            });
        });

        const addFolioBtn = panel.querySelector('.addMainFolioBtn');
        const addMultipleBtn = panel.querySelector('.addMultipleFoliosBtn');
        const multipleCountInput = panel.querySelector('.addMultipleFoliosInput');
        const removeAllBtn = panel.querySelector('.removeAllFoliosBtn');
        const foliosContainer = panel.querySelector('.mainFoliosContainer');
        const importMultipleBtn = panel.querySelector('.importMultipleCsvBtn');
        const importFileInput = panel.querySelector('.importMultipleFileInput');

        // ========== DRAG AND DROP PARA TEXTAREAS ==========
        function setupDragAndDrop(textarea) {
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
                    const msgDiv = panel.querySelector('.message');
                    if (msgDiv) {
                        msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Archivo no soportado. Solo se permiten .txt, .csv, .log, .dat';
                        setTimeout(function() { if (msgDiv.innerHTML.includes('no soportado')) msgDiv.innerHTML = ''; }, 3000);
                    }
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(ev) {
                    textarea.value = ev.target.result;
                    textarea.dispatchEvent(new Event('input'));
                    actualizarConteoVivo(panel);
                    const msgDiv = panel.querySelector('.message');
                    if (msgDiv) {
                        msgDiv.innerHTML = '<i class="fas fa-check-circle"></i> Archivo "' + file.name + '" cargado correctamente (' + (file.size / 1024).toFixed(1) + ' KB)';
                        setTimeout(function() {
                            if (msgDiv.innerHTML.includes('cargado correctamente')) {
                                msgDiv.innerHTML = '';
                            }
                        }, 3000);
                    }
                };
                reader.onerror = function() {
                    const msgDiv = panel.querySelector('.message');
                    if (msgDiv) {
                        msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al leer el archivo "' + file.name + '"';
                    }
                };
                reader.readAsText(file);
            });
        }

        function crearFolioAdicionalConDrag(nombreBase = 'ADICIONAL', contenidoInicial = '') {
            const div = document.createElement('div');
            div.className = 'row';
            div.style.marginBottom = '0.5rem';
            div.innerHTML = `<b>Nombre:</b> <input type="text" class="folio-name-input" value="${nombreBase}" style="width:120px;"> 
                             <textarea rows="2" style="flex:1;"></textarea>
                             <button class="btn-danger remove-folio"><i class="fas fa-trash"></i></button>
                             <button class="upload-csv-btn"><i class="fas fa-folder-open"></i></button><input type="file" accept=".csv,.txt,text/plain" style="display:none;">`;
            foliosContainer.appendChild(div);
            const nameInput = div.querySelector('.folio-name-input');
            const upBtn = div.querySelector('.upload-csv-btn'), fileInp = div.querySelector('input[type="file"]'), ta = div.querySelector('textarea');
            upBtn.addEventListener('click', () => fileInp.click());
            fileInp.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; }; r.readAsText(f); });
            if (contenidoInicial) ta.value = contenidoInicial;
            const currentCount = foliosContainer.children.length;
            nameInput.value = `${nombreBase}${currentCount}`;
            setupDragAndDrop(ta);
            actualizarConteoVivo(panel);
            return div;
        }

        const maestroTextarea = panel.querySelector('.mainMaestroInput');
        setupDragAndDrop(maestroTextarea);

        // Conectar eventos para el contador en vivo
        if (maestroTextarea) {
            maestroTextarea.addEventListener('input', function() { actualizarConteoVivo(panel); });
            maestroTextarea.addEventListener('paste', function() { setTimeout(function() { actualizarConteoVivo(panel); }, 50); });
            maestroTextarea.addEventListener('drop', function() { setTimeout(function() { actualizarConteoVivo(panel); }, 100); });
            maestroTextarea.addEventListener('change', function() { actualizarConteoVivo(panel); });
            setTimeout(function() { actualizarConteoVivo(panel); }, 100);
        }

        // Reemplazar el addFolioBtn por la versión con drag
        const oldAddFolioBtn = panel.querySelector('.addMainFolioBtn');
        if (oldAddFolioBtn) {
            const newAddFolioBtn = oldAddFolioBtn.cloneNode(true);
            oldAddFolioBtn.parentNode.replaceChild(newAddFolioBtn, oldAddFolioBtn);
            newAddFolioBtn.addEventListener('click', () => { crearFolioAdicionalConDrag('ADICIONAL'); });
        }

        // Reemplazar addMultipleBtn
        const oldAddMultipleBtn = panel.querySelector('.addMultipleFoliosBtn');
        if (oldAddMultipleBtn) {
            const newAddMultipleBtn = oldAddMultipleBtn.cloneNode(true);
            oldAddMultipleBtn.parentNode.replaceChild(newAddMultipleBtn, oldAddMultipleBtn);
            newAddMultipleBtn.addEventListener('click', () => {
                let count = parseInt(multipleCountInput.value);
                if (isNaN(count) || count < 1) count = 1;
                if (count > 50) count = 50;
                for (let i = 0; i < count; i++) crearFolioAdicionalConDrag('ADICIONAL');
            });
        }

        // Reemplazar importMultipleBtn
        const oldImportMultipleBtn = panel.querySelector('.importMultipleCsvBtn');
        if (oldImportMultipleBtn) {
            const newImportMultipleBtn = oldImportMultipleBtn.cloneNode(true);
            oldImportMultipleBtn.parentNode.replaceChild(newImportMultipleBtn, oldImportMultipleBtn);
            const importFileInput2 = panel.querySelector('.importMultipleFileInput');
            newImportMultipleBtn.addEventListener('click', () => importFileInput2.click());
            importFileInput2.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                const msgDiv = panel.querySelector('.message');
                let processed = 0;
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const contenido = ev.target.result;
                        crearFolioAdicionalConDrag('ADICIONAL', contenido);
                        processed++;
                        if (processed === files.length) {
                            if (msgDiv) {
                                msgDiv.innerHTML = `<i class="fas fa-check-circle"></i> Se importaron ${processed} archivos como folios adicionales.`;
                                setTimeout(() => { if (msgDiv.innerHTML.includes('importaron')) msgDiv.innerHTML = ''; }, 3000);
                            }
                            importFileInput2.value = '';
                        }
                    };
                    reader.onerror = () => {
                        processed++;
                        if (processed === files.length) importFileInput2.value = '';
                    };
                    reader.readAsText(file, 'UTF-8');
                });
            });
        }

        // Reemplazar removeAllBtn
        const oldRemoveAllBtn = panel.querySelector('.removeAllFoliosBtn');
        if (oldRemoveAllBtn) {
            const newRemoveAllBtn = oldRemoveAllBtn.cloneNode(true);
            oldRemoveAllBtn.parentNode.replaceChild(newRemoveAllBtn, oldRemoveAllBtn);
            newRemoveAllBtn.addEventListener('click', () => {
                while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                actualizarConteoVivo(panel);
            });
        }

        // Reemplazar uploadMainMaestroBtn
        const oldUploadBtn = panel.querySelector('.uploadMainMaestroBtn');
        const fileInput = panel.querySelector('.mainMaestroFile');
        if (oldUploadBtn && fileInput) {
            const newUploadBtn = oldUploadBtn.cloneNode(true);
            oldUploadBtn.parentNode.replaceChild(newUploadBtn, oldUploadBtn);
            newUploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', e => {
                const f = e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = ev => {
                    maestroTextarea.value = ev.target.result;
                    fileInput.value = '';
                    actualizarConteoVivo(panel);
                };
                r.readAsText(f);
            });
        }

        // ========== BOTONES DE EDICIÓN MASIVA ==========
        const editAllBtn = panel.querySelector('.editAllBtn');
        const edicionMasivaContainer = panel.querySelector(`#edicionMasivaContainer_${panelId}`);
        const saveAllBtn = panel.querySelector('.saveAllBtn');
        const cancelAllBtn = panel.querySelector('.cancelAllBtn');

        function asegurarDatosProcesados() {
            if (datosActualesConEAN && datosActualesConEAN.length > 0) {
                return true;
            }
            const maestroTexto = maestroTextarea.value;
            if (!maestroTexto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para procesar. Pega un Folio Maestro primero.';
                return false;
            }
            processBtn.click();
            return datosActualesConEAN && datosActualesConEAN.length > 0;
        }

        if (editAllBtn) {
            editAllBtn.addEventListener('click', function() {
                if (!asegurarDatosProcesados()) return;
                if (!datosActualesConEAN || datosActualesConEAN.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para editar. Procesa primero.';
                    return;
                }
                let modoEdicionActivado = false;
                for (const item of datosActualesConEAN) {
                    if (item.TALLA !== 'TOTAL') {
                        if (!item.editando) {
                            item.editando = true;
                            modoEdicionActivado = true;
                        }
                    }
                }
                if (!modoEdicionActivado) {
                    messageDiv.innerHTML = '<i class="fas fa-info-circle"></i> Todas las filas ya están en modo edición.';
                    return;
                }
                if (edicionMasivaContainer) edicionMasivaContainer.style.display = 'flex';
                actualizarDatosYTabla();
                messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Modo edición activado para todas las filas.';
                setTimeout(function() { if (messageDiv.innerHTML.includes('edición activado')) messageDiv.innerHTML = ''; }, 2000);
            });
        }

        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', function() {
                if (!datosActualesConEAN || datosActualesConEAN.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para guardar.';
                    return;
                }
                const tbody = outputDiv.querySelector('tbody');
                if (!tbody) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontró la tabla.';
                    return;
                }
                const trs = tbody.querySelectorAll('tr');
                let guardados = 0;
                const filasData = [];
                for (let i = 0; i < trs.length && i < datosActualesConEAN.length; i++) {
                    const tr = trs[i];
                    const tallaCell = tr.querySelector('.talla-edit');
                    if (tallaCell && tallaCell.value === 'TOTAL') continue;
                    const tallaDisplay = tr.querySelector('.talla-display');
                    if (tallaDisplay && tallaDisplay.textContent === 'TOTAL') continue;
                    filasData.push(tr);
                }
                for (let i = 0; i < filasData.length && i < datosActualesConEAN.length; i++) {
                    const tr = filasData[i];
                    const tallaInput = tr.querySelector('.talla-edit');
                    const cantidadInput = tr.querySelector('.cantidad-edit');
                    if (tallaInput) {
                        datosActualesConEAN[i].TALLA = tallaInput.value.trim();
                    }
                    if (cantidadInput) {
                        const nuevaCant = parseInt(cantidadInput.value);
                        if (!isNaN(nuevaCant) && nuevaCant >= 0) {
                            datosActualesConEAN[i].CANTIDAD = nuevaCant;
                        }
                    }
                    const autoservicio = autoservicioCheckbox.checked;
                    const item = datosActualesConEAN[i];
                    const lib = core.obtenerBiblioteca();
                    let encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                    if (!encontrado) {
                        encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
                    }
                    if (encontrado) {
                        const modoAnterior = core.getTallaMode();
                        core.setTallaMode(item.tipoTalla || 'normal');
                        let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                        core.setTallaMode(modoAnterior);
                        if (autoservicio) {
                            codigoFinal = codigoFinal + '0';
                        }
                        item.CODIGO_EAN13 = codigoFinal;
                    }
                    item.editando = false;
                    guardados++;
                }
                if (edicionMasivaContainer) edicionMasivaContainer.style.display = 'none';
                actualizarDatosYTabla();
                messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> ' + guardados + ' filas guardadas correctamente.';
                setTimeout(function() { if (messageDiv.innerHTML.includes('guardadas')) messageDiv.innerHTML = ''; }, 2000);
                actualizarConteoVivo(panel);
            });
        }

        if (cancelAllBtn) {
            cancelAllBtn.addEventListener('click', function() {
                if (!datosActualesConEAN || datosActualesConEAN.length === 0) return;
                for (const item of datosActualesConEAN) {
                    item.editando = false;
                }
                if (edicionMasivaContainer) edicionMasivaContainer.style.display = 'none';
                actualizarDatosYTabla();
                messageDiv.innerHTML = '<i class="fas fa-info-circle"></i> Edición cancelada.';
                setTimeout(function() { if (messageDiv.innerHTML.includes('Edición cancelada')) messageDiv.innerHTML = ''; }, 1500);
            });
        }

        const processBtn = panel.querySelector('.processMainBtn');
        const filenameInput = panel.querySelector('.mainFilename');
        const copyFeedbackSpan = panel.querySelector('.copy-feedback');
        const copyFeedbackAhkSpan = panel.querySelector('.copy-feedback-ahk');
        const messageDiv = panel.querySelector('.message');
        const outputDiv = panel.querySelector('.output-area');

        function actualizarNombreArchivo() {
            const nombreBase = construirNombreConDropdowns(panel);
            if (nombreBase) filenameInput.value = `${nombreBase}.csv`;
            else filenameInput.value = 'archivo.csv';
        }
        const selects = panel.querySelectorAll('#tipoOrigen, #tipoUbicacion, #tipoCategoria, #nombrePersonalizado, #sufijoAdicional');
        selects.forEach(el => el.addEventListener('input', actualizarNombreArchivo));
        actualizarNombreArchivo();

        function getMainTicketData(df) {
            if (!df) return [];
            return df.filter(r => r.TALLA !== 'TOTAL').map(r => ({ MODELO: r.MODELO, LINEA: r.LINEA, TIPO: r.TIPO, CANTIDAD: r.CANTIDAD }));
        }

        function getBasicData(df) {
            if (!df) return [];
            return df.filter(r => r.TALLA !== 'TOTAL').map(r => ({
                MODELO: r.MODELO || '',
                LINEA: r.LINEA || '',
                TIPO: r.TIPO || '',
                TALLA: r.TALLA || '',
                CANTIDAD: r.CANTIDAD || 0
            }));
        }

        let datosActualesConEAN = [];

        function actualizarDatosYTabla() {
            const autoservicio = autoservicioCheckbox.checked;
            const mantenerOrdenOriginal = ordenOriginalCheckbox ? ordenOriginalCheckbox.checked : false;
            for (const item of datosActualesConEAN) {
                if (item.editando === undefined) item.editando = false;
            }
            let datosParaMostrar = [...datosActualesConEAN];
            if (!mantenerOrdenOriginal) {
                datosParaMostrar.sort((a, b) => {
                    const modeloA = parseInt(a.MODELO) || 0;
                    const modeloB = parseInt(b.MODELO) || 0;
                    if (modeloA !== modeloB) return modeloA - modeloB;
                    const keyA = `${a.LINEA}|${a.TIPO}|${a.TALLA}`;
                    const keyB = `${b.LINEA}|${b.TIPO}|${b.TALLA}`;
                    return keyA.localeCompare(keyB);
                });
            }
            outputDiv.innerHTML = renderTablaConBotonesEAN(datosParaMostrar, panelId, autoservicio);
            const dfDisplay = datosParaMostrar.map(r => ({
                MODELO: r.MODELO,
                LINEA: r.LINEA,
                TIPO: r.TIPO,
                TALLA: r.TALLA,
                CANTIDAD: r.CANTIDAD,
                AUTOSERVICIO: r.AUTOSERVICIO || '',
                'CÓDIGO EAN‑13': r.CODIGO_EAN13 || ''
            }));
            const total = datosParaMostrar.reduce((s, r) => s + (parseInt(r.CANTIDAD) || 0), 0);
            const totalRow = {
                MODELO: '',
                LINEA: '',
                TIPO: '',
                TALLA: 'TOTAL',
                CANTIDAD: total,
                AUTOSERVICIO: '',
                'CÓDIGO EAN‑13': ''
            };
            const dfConTotal = [...dfDisplay, totalRow];
            window[`dfMain_${panelId}`] = dfConTotal;
            window[`dfMainData_${panelId}`] = datosParaMostrar;
            actualizarConteoVivo(panel);
        }

        // ========== BUSCADOR DE COLORES ==========
        const buscarColoresBtn = panel.querySelector('.buscarColoresBtn');
        if (buscarColoresBtn) {
            buscarColoresBtn.addEventListener('click', function() {
                const maestroTexto = maestroTextarea.value;
                if (!maestroTexto.trim()) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega un modelo en el Folio Maestro para buscar sus colores.';
                    return;
                }
                const modelos = [];
                const lines = maestroTexto.split(/\r?\n/);
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    const tokens = trimmed.split(/\s+/);
                    if (tokens.length >= 1 && /^\d+$/.test(tokens[0])) {
                        modelos.push(tokens[0]);
                    }
                }
                if (modelos.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron modelos válidos.';
                    return;
                }
                const lib = core.obtenerBiblioteca();
                if (!lib || lib.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Biblioteca no cargada.';
                    return;
                }
                let html = '<div style="max-height:400px; overflow:auto; font-size:0.75rem;">';
                html += '<table class="output-table" style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th>MODELO</th><th>COLOR + TIPO (disponibles)</th></tr></thead><tbody>';
                const modelosUnicos = [...new Set(modelos)];
                for (const modelo of modelosUnicos) {
                    const encontrados = lib.filter(item => String(item.MODELO).trim() === modelo.trim());
                    if (encontrados.length > 0) {
                        const combinaciones = new Set();
                        for (const item of encontrados) {
                            const linea = item.LINEA || '';
                            const tipo = item.TIPO || '';
                            if (linea && tipo) {
                                combinaciones.add(`${linea} ${tipo}`);
                            }
                        }
                        const combinacionesOrdenadas = Array.from(combinaciones).sort();
                        let combinacionesHtml = '';
                        if (combinacionesOrdenadas.length <= 6) {
                            combinacionesHtml = combinacionesOrdenadas.join(' · ');
                        } else {
                            const mitad = Math.ceil(combinacionesOrdenadas.length / 2);
                            const col1 = combinacionesOrdenadas.slice(0, mitad);
                            const col2 = combinacionesOrdenadas.slice(mitad);
                            combinacionesHtml = `
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.2rem 1rem;">
                                    <div>${col1.join('<br>')}</div>
                                    <div>${col2.join('<br>')}</div>
                                </div>
                            `;
                        }
                        html += `<tr>
                            <td><strong>${modelo}</strong></td>
                            <td>${combinacionesHtml}</td>
                        </tr>`;
                    } else {
                        html += `<tr>
                            <td><strong>${modelo}</strong></td>
                            <td style="color:#f1c40f;">❌ No encontrado en biblioteca</td>
                        </tr>`;
                    }
                }
                html += '</tbody></table></div>';
                outputDiv.innerHTML = html;
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Mostrando combinaciones COLOR + TIPO para ${modelosUnicos.length} modelos.`;
            });
        }

        // ========== PROCESAR ==========
        processBtn.addEventListener('click', function() {
            const maestroTexto = maestroTextarea.value;
            const maestroRows = procesarTextoConBiblioteca(maestroTexto, formatoSeleccionado);
            if (maestroRows.length === 0 && maestroTexto.trim()) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo interpretar el Maestro. Prueba con "Auto" o selecciona otro formato.';
                return;
            }
            const foliosTextos = [...foliosContainer.querySelectorAll('textarea')].map(ta => ta.value);
            const foliosRows = [];
            for (const texto of foliosTextos) {
                if (texto.trim()) {
                    const rows = procesarTextoConBiblioteca(texto, formatoSeleccionado);
                    foliosRows.push(...rows);
                }
            }
            const mapM = new Map();
            for (const row of maestroRows) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (mapM.has(key)) {
                    mapM.get(key).CANTIDAD += row.CANTIDAD;
                } else {
                    mapM.set(key, { ...row });
                }
            }
            for (const row of foliosRows) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (mapM.has(key)) {
                    const e = mapM.get(key);
                    e.CANTIDAD = mainOp === 'sumar' ? e.CANTIDAD + row.CANTIDAD : e.CANTIDAD - row.CANTIDAD;
                    if (e.CANTIDAD <= 0) mapM.delete(key);
                } else if (mainOp === 'sumar') {
                    mapM.set(key, { ...row });
                }
            }
            const res = Array.from(mapM.values()).filter(r => r.CANTIDAD > 0);
            const mantenerOrdenOriginal = ordenOriginalCheckbox ? ordenOriginalCheckbox.checked : false;
            if (!mantenerOrdenOriginal) {
                res.sort((a, b) => {
                    const modeloA = parseInt(a.MODELO) || 0;
                    const modeloB = parseInt(b.MODELO) || 0;
                    if (modeloA !== modeloB) return modeloA - modeloB;
                    const keyA = `${a.LINEA}|${a.TIPO}|${a.TALLA}`;
                    const keyB = `${b.LINEA}|${b.TIPO}|${b.TALLA}`;
                    return keyA.localeCompare(keyB);
                });
            } else {
                const textoOriginal = maestroTextarea.value;
                const patronEAN = /\b(\d{13,14})\b/g;
                const ordenOriginal = [];
                let match;
                while ((match = patronEAN.exec(textoOriginal)) !== null) {
                    ordenOriginal.push(match[1]);
                }
                if (ordenOriginal.length > 0) {
                    const lib = core.obtenerBiblioteca();
                    const ordenMap = new Map();
                    for (let i = 0; i < ordenOriginal.length; i++) {
                        const codigo = ordenOriginal[i];
                        let codigoParaDecodificar = codigo;
                        if (codigo.length === 14) {
                            codigoParaDecodificar = codigo.slice(0, 13);
                        }
                        const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                        if (decodificado) {
                            if (coinciden) {
                                eanOriginal = codigo;
                                tipoTalla = decodificado.categoria || 'normal';
                                break;
                            }
                        }
                    }
                    res.sort((a, b) => {
                        const keyA = `${a.MODELO}|${a.LINEA}|${a.TIPO}|${a.TALLA}`;
                        const keyB = `${b.MODELO}|${b.LINEA}|${b.TIPO}|${b.TALLA}`;
                        const ordenA = ordenMap.has(keyA) ? ordenMap.get(keyA) : 999999;
                        const ordenB = ordenMap.has(keyB) ? ordenMap.get(keyB) : 999999;
                        return ordenA - ordenB;
                    });
                }
            }
            const autoservicio = autoservicioCheckbox.checked;
            const lib = core.obtenerBiblioteca();
            const resConEAN = res.map(r => {
                let encontrado = core.buscarCodigoPrioritario(r.MODELO, r.LINEA, r.TIPO, lib);
                if (!encontrado) {
                    encontrado = lib.find(reg => String(reg.MODELO).trim() === String(r.MODELO).trim());
                }
                let codigoEAN = '';
                let tipoTalla = 'normal';
                
                if (encontrado) {
                    // Detectar automáticamente la categoría de la talla
                    const resultado = core.obtenerCodigoTallaEspecial(r.TALLA, 'normal', r.MODELO);
                    tipoTalla = resultado.categoria || 'normal';
                    
                    // VERIFICAR SI EL TEXTO ORIGINAL CONTENÍA UN EAN (13 o 14 dígitos)
                    // Buscar en el texto original si este modelo corresponde a un EAN
                    const textoOriginal = maestroTextarea.value;
                    const patronEAN = /\b(\d{13,14})\b/g;
                    let match;
                    let eanOriginal = null;
                    while ((match = patronEAN.exec(textoOriginal)) !== null) {
                        const codigo = match[1];
                        // Decodificar para ver si coincide con este modelo
                        let codigoParaDecodificar = codigo;
                        if (codigo.length === 14) {
                            codigoParaDecodificar = codigo.slice(0, 13);
                        }
                        const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                        if (decodificado) {
                            const modeloDecodificado = String(decodificado.modelo).trim();
                            const lineaDecodificada = String(decodificado.linea || '').toUpperCase().trim();
                            const tipoDecodificado = String(decodificado.tipo || '').toUpperCase().trim();
                            const tallaDecodificada = String(decodificado.talla || '').trim();
                            if (modeloDecodificado === String(r.MODELO).trim() &&
                                lineaDecodificada === String(r.LINEA || '').toUpperCase().trim() &&
                                tipoDecodificado === String(r.TIPO || '').toUpperCase().trim() &&
                                tallaDecodificada === String(r.TALLA || '').trim()) {
                                eanOriginal = codigo;
                                break;
                            }
                        }
                    }
                    
                    if (eanOriginal) {
                        codigoEAN = eanOriginal;
                        // Usar la categoría del decodificado
                        const decodificado = core.decodificarCodigoEAN13(codigoParaDecodificar, lib);
                        if (decodificado && decodificado.categoria) {
                            tipoTalla = decodificado.categoria;
                        } else {
                            // fallback
                            const resultado = core.obtenerCodigoTallaEspecial(r.TALLA, 'normal', r.MODELO);
                            tipoTalla = resultado.categoria || 'normal';
                        }
                    }
                }
                
                return {
                    ...r,
                    CODIGO_EAN13: codigoEAN,
                    tipoTalla: tipoTalla,
                    AUTOSERVICIO: autoservicio ? '✅' : '',
                    editando: false
                };
            });

            // ========== DETECTAR CÓDIGOS EAN DAÑADOS ==========
            const textoOriginal = maestroTextarea.value;
            const danadosContainer = panel.querySelector(`#codigosDanadosContainer_${panelId}`);
            const danadosList = panel.querySelector(`#codigosDanadosList_${panelId}`);
            if (danadosContainer) danadosContainer.style.display = 'none';
            if (mostrarDanadosCheckbox && mostrarDanadosCheckbox.checked && danadosContainer && danadosList) {
                const todosEANs = textoOriginal.match(/\b\d{13,14}\b/g) || [];
                const todosConLetras = textoOriginal.match(/\b[A-Z]{0,2}\d{10,14}[A-Z]{0,2}\b/g) || [];
                const numerosCortos = textoOriginal.match(/\b\d{1,12}\b/g) || [];
                const todosPosibles = [...new Set([...todosEANs, ...todosConLetras, ...numerosCortos])];
                function esEANValido(codigo) {
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
                const danados = todosPosibles.filter(cod => {
                    if (/^\d{1,2}$/.test(cod)) return true;
                    if (/[A-Za-z]/.test(cod)) return true;
                    if (/^\d{13,14}$/.test(cod)) {
                        return !esEANValido(cod);
                    }
                    if (/^\d{10,12}$/.test(cod)) return true;
                    if (/^\d{3,9}$/.test(cod)) return true;
                    return true;
                });
                const danadosUnicos = [...new Set(danados)];
                if (danadosUnicos.length > 0) {
                    danadosContainer.style.display = 'block';
                    let html = '<ul style="margin:0.3rem 0 0 1.2rem; padding:0; list-style:square;">';
                    for (const cod of danadosUnicos) {
                        const esMuyCorto = /^\d{1,2}$/.test(cod);
                        const esCorto = /^\d{3,9}$/.test(cod);
                        const esCasiEAN = /^\d{10,12}$/.test(cod);
                        const esEAN14 = /^\d{14}$/.test(cod) && !esEANValido(cod);
                        const esEAN13 = /^\d{13}$/.test(cod) && !esEANValido(cod);
                        const tieneLetras = /[A-Za-z]/.test(cod);
                        let icono = 'fa-question-circle';
                        let extra = ' (no reconocido)';
                        if (esMuyCorto) {
                            icono = 'fa-times-circle';
                            extra = ' (código muy corto)';
                        } else if (esCorto) {
                            icono = 'fa-cut';
                            extra = ` (${cod.length} dígitos, debería ser 13)`;
                        } else if (esCasiEAN) {
                            icono = 'fa-exclamation-circle';
                            extra = ` (${cod.length} dígitos, incompleto)`;
                        } else if (esEAN14) {
                            icono = 'fa-exclamation-circle';
                            extra = ' (EAN-14 no reconocido)';
                        } else if (esEAN13) {
                            icono = 'fa-exclamation-circle';
                            extra = ' (EAN-13 no reconocido)';
                        } else if (tieneLetras) {
                            icono = 'fa-font';
                            extra = ' (contiene letras)';
                        }
                        html += `<li><i class="fas ${icono}" style="color:#e74c3c; width:16px;"></i> <span style="font-family:monospace; color:#ffffff;">${cod}</span><span style="color:#e74c3c; font-size:0.7rem; margin-left:0.3rem;">${extra}</span></li>`;
                    }
                    html += '</ul>';
                    const countMsg = `<div style="font-size:0.7rem; color:#e74c3c; margin-top:0.2rem;"><i class="fas fa-info-circle"></i> ${danadosUnicos.length} código(s) dañado(s) o no reconocido(s)</div>`;
                    danadosList.innerHTML = html + countMsg;
                } else {
                    danadosContainer.style.display = 'none';
                }
            }

            datosActualesConEAN = resConEAN;
            actualizarDatosYTabla();
            const totalUnidades = res.reduce((s, r) => s + r.CANTIDAD, 0);
            const uniqueModelos = new Set(res.map(r => `${r.MODELO}|${r.LINEA}|${r.TIPO}`)).size;
            const ordenMsg = mantenerOrdenOriginal ? ' (orden original)' : '';
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Operacion completada${ordenMsg}. Unidades procesadas: <b>${totalUnidades}</b> en <b>${uniqueModelos}</b> modelos distintos.`;

            // ========== AUTOCOMPLETAR ==========
            if (autocompletarCheckbox && autocompletarCheckbox.checked) {
                const textoOriginal2 = maestroTextarea.value;
                const tieneEANs2 = /\b\d{13,14}\b/.test(textoOriginal2);
                if (!tieneEANs2) {
                    let textoCompletado = '';
                    for (const row of res) {
                        textoCompletado += `${row.MODELO} ${row.LINEA} ${row.TIPO} ${row.TALLA} ${row.CANTIDAD}\n`;
                    }
                    if (textoCompletado) {
                        let textoLimpio = textoCompletado.replace(/\t/g, ' ').replace(/-/g, ' ');
                        textoLimpio = textoLimpio.replace(/\s+/g, ' ').trim();
                        if (!textoLimpio.endsWith('\n')) textoLimpio += '\n';
                        const currentValue = maestroTextarea.value;
                        if (!currentValue.endsWith('\n') && currentValue.trim() !== '') {
                            maestroTextarea.value = currentValue + '\n' + textoLimpio;
                        } else if (currentValue.trim() === '') {
                            maestroTextarea.value = textoLimpio;
                        } else {
                            maestroTextarea.value = currentValue + textoLimpio;
                        }
                    }
                }
            }
            actualizarConteoVivo(panel);
        });

        // ========== EVENTOS DE EDICIÓN, ELIMINACIÓN Y DROPDOWN ==========
        outputDiv.addEventListener('click', function(e) {
            // Cambio de tipo de talla
            const btn = e.target.closest('.talla-btn');
            if (btn) {
                const idx = parseInt(btn.dataset.idx);
                const nuevoTipo = btn.dataset.tipo;
                if (idx >= datosActualesConEAN.length) return;
                const autoservicio = autoservicioCheckbox.checked;
                const item = datosActualesConEAN[idx];
                const nuevoItem = recalcularCodigoEAN(item, nuevoTipo, autoservicio);
                datosActualesConEAN[idx] = nuevoItem;
                actualizarDatosYTabla();
                return;
            }

            // Editar fila
            const editBtn = e.target.closest('.edit-row-btn');
            if (editBtn) {
                const idx = parseInt(editBtn.dataset.idx);
                if (idx >= datosActualesConEAN.length) return;
                datosActualesConEAN[idx].editando = true;
                actualizarDatosYTabla();
                return;
            }

            // Guardar edición
            const saveBtn = e.target.closest('.save-edit-btn');
            if (saveBtn) {
                const idx = parseInt(saveBtn.dataset.idx);
                if (idx >= datosActualesConEAN.length) return;
                const tr = saveBtn.closest('tr');
                const tallaInput = tr.querySelector('.talla-edit');
                const cantidadInput = tr.querySelector('.cantidad-edit');
                if (tallaInput) {
                    datosActualesConEAN[idx].TALLA = tallaInput.value.trim();
                }
                if (cantidadInput) {
                    const nuevaCant = parseInt(cantidadInput.value);
                    if (!isNaN(nuevaCant) && nuevaCant >= 0) {
                        datosActualesConEAN[idx].CANTIDAD = nuevaCant;
                    }
                }
                const autoservicio = autoservicioCheckbox.checked;
                const item = datosActualesConEAN[idx];
                const lib = core.obtenerBiblioteca();
                let encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                if (!encontrado) {
                    encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
                }
                if (encontrado) {
                    const modoAnterior = core.getTallaMode();
                    core.setTallaMode(item.tipoTalla || 'normal');
                    let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                    core.setTallaMode(modoAnterior);
                    if (autoservicio) {
                        codigoFinal = codigoFinal + '0';
                    }
                    item.CODIGO_EAN13 = codigoFinal;
                }
                item.editando = false;
                actualizarDatosYTabla();
                return;
            }

            // Cancelar edición
            const cancelBtn = e.target.closest('.cancel-edit-btn');
            if (cancelBtn) {
                const idx = parseInt(cancelBtn.dataset.idx);
                if (idx >= datosActualesConEAN.length) return;
                datosActualesConEAN[idx].editando = false;
                actualizarDatosYTabla();
                return;
            }

            // Eliminar fila
            const deleteBtn = e.target.closest('.delete-row-btn');
            if (deleteBtn) {
                const idx = parseInt(deleteBtn.dataset.idx);
                if (idx >= datosActualesConEAN.length) return;
                if (confirm(`¿Eliminar la fila ${idx + 1}?`)) {
                    datosActualesConEAN.splice(idx, 1);
                    if (datosActualesConEAN.length === 0) {
                        window[`dfMainData_${panelId}`] = null;
                        window[`dfMain_${panelId}`] = null;
                        outputDiv.innerHTML = '<p style="color:#666;">Sin datos. Procesa nuevamente.</p>';
                        messageDiv.innerHTML = '<i class="fas fa-info-circle"></i> Todos los elementos eliminados.';
                        return;
                    }
                    actualizarDatosYTabla();
                    const totalUnidades = datosActualesConEAN.reduce((s, r) => s + (parseInt(r.CANTIDAD) || 0), 0);
                    const uniqueModelos = new Set(datosActualesConEAN.map(r => `${r.MODELO}|${r.LINEA}|${r.TIPO}`)).size;
                    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> Fila eliminada. Unidades restantes: <b>${totalUnidades}</b> en <b>${uniqueModelos}</b> modelos.`;
                }
                return;
            }

            // Copiar código individual
            const copyBtn = e.target.closest('.copy-individual-btn');
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

        // ========== EVENTO PARA DROPDOWN DE COMBINACIONES ==========
        outputDiv.addEventListener('change', function(e) {
            const select = e.target.closest('.combo-select');
            if (!select) return;
            const idx = parseInt(select.dataset.idx);
            const valor = select.value;
            const [nuevaLinea, nuevoTipo] = valor.split('|');
            if (idx >= datosActualesConEAN.length) return;
            const item = datosActualesConEAN[idx];
            const autoservicio = autoservicioCheckbox.checked;
            item.LINEA = nuevaLinea;
            item.TIPO = nuevoTipo;
            const lib = core.obtenerBiblioteca();
            let encontrado = core.buscarCodigoPrioritario(item.MODELO, nuevaLinea, nuevoTipo, lib);
            if (!encontrado) {
                encontrado = lib.find(reg => String(reg.MODELO).trim() === String(item.MODELO).trim());
            }
            if (encontrado) {
                const modoAnterior = core.getTallaMode();
                core.setTallaMode(item.tipoTalla || 'normal');
                let codigoFinal = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                core.setTallaMode(modoAnterior);
                if (autoservicio) {
                    codigoFinal = codigoFinal + '0';
                }
                item.CODIGO_EAN13 = codigoFinal;
            }
            actualizarDatosYTabla();
        });

        // ========== COPIAR, DESCARGAR ==========
        panel.querySelector('.copyMainTsvBtn').addEventListener('click', function() {
            if (!asegurarDatosProcesados()) return;
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const ticketMode = ticketCheckbox ? ticketCheckbox.checked : false;
            let content;
            if (ticketMode) {
                content = core.dfToCsv(getMainTicketData(df), '\t', false, true);
            } else {
                const basicData = getBasicData(df);
                content = core.dfToCsv(basicData, '\t', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.copyMainCsvBtn').addEventListener('click', function() {
            if (!asegurarDatosProcesados()) return;
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) {
                copyFeedbackSpan.textContent = 'Sin datos';
                setTimeout(() => copyFeedbackSpan.textContent = '', 1500);
                return;
            }
            const ticketMode = ticketCheckbox ? ticketCheckbox.checked : false;
            let content;
            if (ticketMode) {
                content = core.dfToCsv(getMainTicketData(df), ',', false, true);
            } else {
                const basicData = getBasicData(df);
                content = core.dfToCsv(basicData, ',', true, true);
            }
            core.copiarTexto(content, copyFeedbackSpan);
        });

        panel.querySelector('.downloadMainBtn').addEventListener('click', function() {
            if (!asegurarDatosProcesados()) return;
            const df = window[`dfMain_${panelId}`];
            if (!df || !df.length) return;
            const ticketMode = ticketCheckbox ? ticketCheckbox.checked : false;
            let content;
            if (ticketMode) {
                content = core.dfToCsv(getMainTicketData(df), ',', false, true);
            } else {
                const basicData = getBasicData(df);
                content = core.dfToCsv(basicData, ',', true, true);
            }
            let filename = filenameInput.value.trim();
            if (!filename) filename = 'archivo.csv';
            if (!filename.endsWith('.csv')) filename += '.csv';
            core.downloadCsv(content, filename);
        });

        // ========== AHK CON ORDEN ORIGINAL Y MODO SUMINISTROS ==========
        panel.querySelector('.downloadAhkBtn').addEventListener('click', function() {
            if (!asegurarDatosProcesados()) return;
            const data = window[`dfMainData_${panelId}`];
            if (!data || !data.length) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para generar AHK. Procesa primero.';
                return;
            }
            const mantenerOrdenOriginal = ordenOriginalCheckbox ? ordenOriginalCheckbox.checked : false;
            const modoSuministros = modoSuministrosCheckbox ? modoSuministrosCheckbox.checked : false;
            let datosParaAHK = [...data];
            if (!mantenerOrdenOriginal) {
                datosParaAHK.sort((a, b) => {
                    const modeloA = parseInt(a.MODELO) || 0;
                    const modeloB = parseInt(b.MODELO) || 0;
                    if (modeloA !== modeloB) return modeloA - modeloB;
                    const keyA = `${a.LINEA}|${a.TIPO}|${a.TALLA}`;
                    const keyB = `${b.LINEA}|${b.TIPO}|${b.TALLA}`;
                    return keyA.localeCompare(keyB);
                });
            }
            const lib = core.obtenerBiblioteca();
            const autoservicio = autoservicioCheckbox.checked;
            const codigosConCantidad = [];
            for (const item of datosParaAHK) {
                const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                if (encontrado) {
                    let codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                    if (autoservicio) codigoEAN13 = codigoEAN13 + '0';
                    const cantidad = parseInt(item.CANTIDAD) || 1;
                    codigosConCantidad.push({
                        codigo: codigoEAN13,
                        cantidad: cantidad,
                        modelo: item.MODELO
                    });
                }
            }
            if (codigosConCantidad.length === 0) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron generar codigos EAN-13. Verifica la biblioteca.';
                return;
            }
            let ahk;
            let nombreBase = filenameInput.value.trim().replace(/\.csv$/, '');
            if (!nombreBase) nombreBase = 'procesado';
            if (modoSuministros) {
                ahk = generarAHKSuministros(codigosConCantidad, `Suministros (${codigosConCantidad.length} productos)`);
                nombreBase = nombreBase + '_suministros';
            } else {
                ahk = generarAHKConCancelar(codigosConCantidad, `Procesado (${codigosConCantidad.length} productos)`);
            }
            if (!ahk) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error generando AHK.';
                return;
            }
            const blob = new Blob([ahk], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombreBase}.ahk`;
            a.click();
            URL.revokeObjectURL(url);
            const totalEnvios = codigosConCantidad.reduce((s, i) => s + i.cantidad, 0);
            const modoMsg = modoSuministros ? ' (Modo Suministros)' : '';
            messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> AHK descargado${modoMsg} con ${modoSuministros ? codigosConCantidad.length : totalEnvios} envíos (${codigosConCantidad.length} códigos únicos).`;
            setTimeout(() => { if (messageDiv.innerHTML.includes('AHK')) messageDiv.innerHTML = ''; }, 3000);
        });

        panel.querySelector('.copyAhkBtn').addEventListener('click', function() {
            if (!asegurarDatosProcesados()) return;
            const data = window[`dfMainData_${panelId}`];
            if (!data || !data.length) {
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos para copiar. Procesa primero.';
                return;
            }
            const mantenerOrdenOriginal = ordenOriginalCheckbox ? ordenOriginalCheckbox.checked : false;
            const modoSuministros = modoSuministrosCheckbox ? modoSuministrosCheckbox.checked : false;
            let datosParaAHK = [...data];
            if (!mantenerOrdenOriginal) {
                datosParaAHK.sort((a, b) => {
                    const modeloA = parseInt(a.MODELO) || 0;
                    const modeloB = parseInt(b.MODELO) || 0;
                    if (modeloA !== modeloB) return modeloA - modeloB;
                    const keyA = `${a.LINEA}|${a.TIPO}|${a.TALLA}`;
                    const keyB = `${b.LINEA}|${b.TIPO}|${b.TALLA}`;
                    return keyA.localeCompare(keyB);
                });
            }
            const lib = core.obtenerBiblioteca();
            const autoservicio = autoservicioCheckbox.checked;
            if (modoSuministros) {
                const codigosTexto = [];
                for (const item of datosParaAHK) {
                    const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                    if (encontrado) {
                        let codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                        if (autoservicio) codigoEAN13 = codigoEAN13 + '0';
                        const cantidad = parseInt(item.CANTIDAD) || 1;
                        codigosTexto.push(`${codigoEAN13} ${cantidad}`);
                    }
                }
                if (codigosTexto.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron generar códigos.';
                    return;
                }
                const textoParaCopiar = codigosTexto.join('\n');
                core.copiarTexto(textoParaCopiar, copyFeedbackAhkSpan);
                copyFeedbackAhkSpan.textContent = `Copiados ${codigosTexto.length} códigos (Modo Suministros)`;
            } else {
                const codigosExpandidos = [];
                for (const item of datosParaAHK) {
                    const encontrado = core.buscarCodigoPrioritario(item.MODELO, item.LINEA, item.TIPO, lib);
                    if (encontrado) {
                        let codigoEAN13 = core.generarCodigoEAN13(encontrado.CODIGO, item.TALLA, item.MODELO);
                        if (autoservicio) codigoEAN13 = codigoEAN13 + '0';
                        const cantidad = parseInt(item.CANTIDAD) || 1;
                        for (let i = 0; i < cantidad; i++) {
                            codigosExpandidos.push(codigoEAN13);
                        }
                    }
                }
                if (codigosExpandidos.length === 0) {
                    messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudieron generar códigos.';
                    return;
                }
                const textoParaCopiar = codigosExpandidos.join('\n');
                core.copiarTexto(textoParaCopiar, copyFeedbackAhkSpan);
                const totalUnidades = codigosExpandidos.length;
                const codigosUnicos = new Set(codigosExpandidos).size;
                copyFeedbackAhkSpan.textContent = `Copiados ${totalUnidades} códigos (${codigosUnicos} únicos)`;
            }
            setTimeout(() => {
                if (copyFeedbackAhkSpan.textContent.includes('Copiados')) {
                    copyFeedbackAhkSpan.textContent = '';
                }
            }, 3000);
        });

        foliosContainer.addEventListener('click', function(e) {
            if (e.target.closest('.remove-folio')) e.target.closest('.row').remove();
            actualizarConteoVivo(panel);
        });

        // ========== ADMINISTRACIÓN DE MODELOS ESPECIALES ==========
        const specialPanel = document.getElementById('specialModelsPanel');
        if (specialPanel) {
            const toggleBtn = panel.querySelector('.toggle-special-models-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function() {
                    if (specialPanel.style.display === 'none') {
                        specialPanel.style.display = 'block';
                        toggleBtn.innerHTML = '<i class="fas fa-minus"></i> MODELOS ESPECIALES';
                        cargarDatosEnTablas();
                    } else {
                        specialPanel.style.display = 'none';
                        toggleBtn.innerHTML = '<i class="fas fa-plus"></i> MODELOS ESPECIALES';
                    }
                });
            }

            const adminTabs = specialPanel.querySelectorAll('#adminSpecialTabs .sub-module-tab');
            adminTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    adminTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const target = this.dataset.admin;
                    const mapeoContainer = document.getElementById('adminMapeoContainer');
                    const modelosContainer = document.getElementById('adminModelosContainer');
                    if (target === 'mapeo') {
                        mapeoContainer.style.display = 'block';
                        modelosContainer.style.display = 'none';
                    } else {
                        mapeoContainer.style.display = 'none';
                        modelosContainer.style.display = 'block';
                    }
                });
            });

            function agregarFilaVaciaMapeo() {
                const tbody = document.getElementById('mapeoTallasBody');
                if (!tbody) return;
                const primeraFila = tbody.querySelector('tr:first-child');
                if (primeraFila) {
                    const inputs = primeraFila.querySelectorAll('input');
                    const todosVacios = Array.from(inputs).every(inp => inp.value.trim() === '');
                    if (todosVacios) return;
                }
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="text" class="mapeo-modelo" placeholder="Ej: 99999" style="width:80px;"></td>
                    <td><input type="text" class="mapeo-talla" placeholder="Ej: 25" style="width:80px;"></td>
                    <td><input type="text" class="mapeo-codigo" placeholder="Ej: 420" style="width:80px;"></td>
                    <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.insertBefore(tr, tbody.firstChild);
            }

            function agregarFilaVaciaModelos() {
                const tbody = document.getElementById('modelosEspecialesBody');
                if (!tbody) return;
                const primeraFila = tbody.querySelector('tr:first-child');
                if (primeraFila) {
                    const inputs = primeraFila.querySelectorAll('input');
                    const todosVacios = Array.from(inputs).every(inp => inp.value.trim() === '');
                    if (todosVacios) return;
                }
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="text" class="modelo-modelo" placeholder="Ej: 63164" style="width:80px;"></td>
                    <td><input type="text" class="modelo-entero" placeholder="Ej: 6" style="width:80px;"></td>
                    <td><input type="text" class="modelo-half" placeholder="Ej: 7" style="width:80px;"></td>
                    <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.insertBefore(tr, tbody.firstChild);
            }

            function cargarDatosEnTablas() {
                const mapeo = core.obtenerMapeoTallasEspeciales() || {};
                const tbodyMapeo = document.getElementById('mapeoTallasBody');
                if (tbodyMapeo) {
                    tbodyMapeo.innerHTML = '';
                    for (const [modelo, tallas] of Object.entries(mapeo)) {
                        for (const [tallaOriginal, codigoTalla] of Object.entries(tallas)) {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td><input type="text" class="mapeo-modelo" value="${core.escapeHtml(modelo)}" style="width:80px;"></td>
                                <td><input type="text" class="mapeo-talla" value="${core.escapeHtml(tallaOriginal)}" style="width:80px;"></td>
                                <td><input type="text" class="mapeo-codigo" value="${core.escapeHtml(codigoTalla)}" style="width:80px;"></td>
                                <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                            `;
                            tbodyMapeo.appendChild(tr);
                        }
                    }
                    agregarFilaVaciaMapeo();
                }

                const modelos = core.obtenerModelosEspeciales() || {};
                const tbodyModelos = document.getElementById('modelosEspecialesBody');
                if (tbodyModelos) {
                    tbodyModelos.innerHTML = '';
                    for (const [modelo, config] of Object.entries(modelos)) {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><input type="text" class="modelo-modelo" value="${core.escapeHtml(modelo)}" style="width:80px;"></td>
                            <td><input type="text" class="modelo-entero" value="${core.escapeHtml(config.entero)}" style="width:80px;"></td>
                            <td><input type="text" class="modelo-half" value="${core.escapeHtml(config.half)}" style="width:80px;"></td>
                            <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                        `;
                        tbodyModelos.appendChild(tr);
                    }
                    agregarFilaVaciaModelos();
                }
            }

            specialPanel.addEventListener('click', function(e) {
                const deleteBtn = e.target.closest('.delete-row-btn');
                if (deleteBtn) {
                    const row = deleteBtn.closest('tr');
                    if (row) {
                        row.remove();
                        const feedback = document.getElementById('mapeoFeedback') || document.getElementById('modelosFeedback');
                        if (feedback) {
                            feedback.textContent = '✅ Fila eliminada';
                            setTimeout(() => { feedback.textContent = ''; }, 1500);
                        }
                    }
                }
            });

            const addMapeoBtn = document.getElementById('addMapeoRowBtn');
            if (addMapeoBtn) {
                addMapeoBtn.addEventListener('click', function() {
                    const tbody = document.getElementById('mapeoTallasBody');
                    if (!tbody) return;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><input type="text" class="mapeo-modelo" placeholder="Modelo" style="width:80px;"></td>
                        <td><input type="text" class="mapeo-talla" placeholder="Talla" style="width:80px;"></td>
                        <td><input type="text" class="mapeo-codigo" placeholder="Código" style="width:80px;"></td>
                        <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            const addModeloBtn = document.getElementById('addModeloRowBtn');
            if (addModeloBtn) {
                addModeloBtn.addEventListener('click', function() {
                    const tbody = document.getElementById('modelosEspecialesBody');
                    if (!tbody) return;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><input type="text" class="modelo-modelo" placeholder="Modelo" style="width:80px;"></td>
                        <td><input type="text" class="modelo-entero" placeholder="Código entero" style="width:80px;"></td>
                        <td><input type="text" class="modelo-half" placeholder="Código half" style="width:80px;"></td>
                        <td><button class="delete-row-btn" style="background:#ff4444; border:1px solid #ff4444; color:white; padding:0.1rem 0.4rem; border-radius:3px; cursor:pointer; font-size:0.65rem;"><i class="fas fa-trash"></i></button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            function obtenerDatosTabla(tableId, classMap) {
                const tbody = document.querySelector(`#${tableId} tbody`);
                if (!tbody) return [];
                const rows = tbody.querySelectorAll('tr');
                const data = [];
                rows.forEach(row => {
                    const inputs = row.querySelectorAll('input');
                    if (inputs.length < 3) return;
                    const obj = {};
                    let tieneDatos = false;
                    for (const [key, cls] of Object.entries(classMap)) {
                        const input = row.querySelector(`.${cls}`);
                        if (input) {
                            const valor = input.value.trim();
                            obj[key] = valor;
                            if (valor !== '') tieneDatos = true;
                        }
                    }
                    if (tieneDatos) {
                        data.push(obj);
                    }
                });
                return data;
            }

            const saveMapeoBtn = document.getElementById('saveMapeoToCmsBtn');
            if (saveMapeoBtn) {
                saveMapeoBtn.addEventListener('click', async function() {
                    const data = obtenerDatosTabla('mapeoTallasTable', {
                        modelo: 'mapeo-modelo',
                        talla_original: 'mapeo-talla',
                        codigo_talla: 'mapeo-codigo'
                    });
                    if (data.length === 0) {
                        document.getElementById('mapeoFeedback').textContent = '⚠️ No hay datos para guardar';
                        setTimeout(() => document.getElementById('mapeoFeedback').textContent = '', 2000);
                        return;
                    }
                    try {
                        const response = await fetch(`${window.WIX_BASE_URL}/mapeoTallasEspeciales`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        if (result.error) throw new Error(result.error);
                        document.getElementById('mapeoFeedback').textContent = `✅ Guardado (${data.length} registros)`;
                        await core.cargarMapeoTallasEspecialesDesdeRoot();
                        cargarDatosEnTablas();
                        setTimeout(() => document.getElementById('mapeoFeedback').textContent = '', 3000);
                    } catch (err) {
                        document.getElementById('mapeoFeedback').textContent = `Error: ${err.message}`;
                        console.error(err);
                    }
                });
            }

            const saveModelosBtn = document.getElementById('saveModelosToCmsBtn');
            if (saveModelosBtn) {
                saveModelosBtn.addEventListener('click', async function() {
                    const data = obtenerDatosTabla('modelosEspecialesTable', {
                        modelo: 'modelo-modelo',
                        codigo_entero: 'modelo-entero',
                        codigo_half: 'modelo-half'
                    });
                    if (data.length === 0) {
                        document.getElementById('modelosFeedback').textContent = ' No hay datos para guardar';
                        setTimeout(() => document.getElementById('modelosFeedback').textContent = '', 2000);
                        return;
                    }
                    try {
                        const response = await fetch(`${window.WIX_BASE_URL}/modelosEspeciales`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        if (result.error) throw new Error(result.error);
                        document.getElementById('modelosFeedback').textContent = `Guardado (${data.length} registros)`;
                        await core.cargarModelosEspecialesDesdeRoot();
                        cargarDatosEnTablas();
                        setTimeout(() => document.getElementById('modelosFeedback').textContent = '', 3000);
                    } catch (err) {
                        document.getElementById('modelosFeedback').textContent = `Error: ${err.message}`;
                        console.error(err);
                    }
                });
            }
        }
    }

    // ========== CREAR PESTAÑAS DEL OPERADOR ==========
    function createProcesarTab(tabName = null) {
        const tabId = `procesar_tab_${procesarTabCounter}`;
        const tabTitle = tabName || `Procesar ${procesarTabCounter}`;
        const tabsContainer = document.getElementById('procesarTabsContainer');
        const addBtn = document.getElementById('addProcesarTabBtn');
        const tabButton = document.createElement('div');
        tabButton.className = 'procesar-tab';
        tabButton.setAttribute('data-tab-id', tabId);
        tabButton.innerHTML = `<span class="tab-name">${core.escapeHtml(tabTitle)}</span><span class="tab-close" title="Cerrar">✖</span>`;
        tabsContainer.insertBefore(tabButton, addBtn);
        const panelsContainer = document.getElementById('procesarPanelsContainer');
        const panelHtml = getProcesarPanelHTML(tabId);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = panelHtml;
        const panel = tempDiv.firstElementChild;
        panelsContainer.appendChild(panel);
        initProcesarPanelEvents(tabId);
        const closeBtn = tabButton.querySelector('.tab-close');
        if (tabId === 'procesar_tab_0') closeBtn.style.display = 'none';
        else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tabButton.remove();
                panel.remove();
                if (activeProcesarTabId === tabId) {
                    const firstTab = document.querySelector('#procesarTabsContainer .procesar-tab');
                    if (firstTab) firstTab.click();
                }
            });
        }
        const nameSpan = tabButton.querySelector('.tab-name');
        nameSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const oldName = nameSpan.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldName;
            input.style.width = 'auto';
            input.style.minWidth = '60px';
            input.style.background = 'var(--blud)';
            input.style.color = 'var(--white)';
            input.style.border = '1px solid var(--blu)';
            input.style.borderRadius = '3px';
            input.style.padding = '0 2px';
            nameSpan.style.display = 'none';
            nameSpan.parentNode.insertBefore(input, nameSpan);
            input.focus();
            input.select();
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || oldName;
                nameSpan.textContent = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        tabButton.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('#procesarTabsContainer .procesar-tab').forEach(t => t.classList.remove('active'));
            tabButton.classList.add('active');
            document.querySelectorAll('#procesarPanelsContainer .procesar-panel').forEach(p => p.classList.remove('active'));
            panel.classList.add('active');
            activeProcesarTabId = tabId;
        });
        const existingTabs = document.querySelectorAll('#procesarTabsContainer .procesar-tab');
        if (existingTabs.length === 1) tabButton.click();
        procesarTabCounter++;
    }

    function initProcesarMultiTabs() {
        const container = document.getElementById('procesarMultiTabs');
        container.innerHTML = `
            <div class="procesar-tabs-container">
                <div class="procesar-tabs" id="procesarTabsContainer"></div>
                <div style="margin-top:0.5rem;" id="procesarPanelsContainer"></div>
            </div>
        `;
        const tabsContainer = document.getElementById('procesarTabsContainer');
        const addBtn = document.createElement('div');
        addBtn.id = 'addProcesarTabBtn';
        addBtn.className = 'add-tab-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva pestana';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => { createProcesarTab(); });
        createProcesarTab('Procesar 1');
    }

    // ========== SECCIONADOR ==========
    let categoriaCounter = 1;
    let activeCategoriaId = null;
    let categoriaData = {};
    let currentUnificadoDf = null;
    let currentComparacionDf = null;
    const categoriasDefault = ['CALZADO', 'VESTIR INTERIOR', 'VESTIR EXTERIOR', 'ACCESORIOS', 'HOME'];

    function crearCategoria(nombre = null) {
        const panelId = `cat_panel_${categoriaCounter++}`;
        const tabName = nombre || `Categoria ${categoriaCounter}`;
        const tabsContainer = document.getElementById('categoriaTabsContainer');
        const tabDiv = document.createElement('div');
        tabDiv.className = 'categoria-tab';
        tabDiv.dataset.panelId = panelId;
        tabDiv.innerHTML = `<span class="tab-name">${core.escapeHtml(tabName)}</span><span class="tab-close" title="Eliminar">✖</span>`;
        const addBtn = document.getElementById('addCategoriaBtn');
        if (addBtn && tabsContainer.contains(addBtn)) tabsContainer.insertBefore(tabDiv, addBtn);
        else tabsContainer.appendChild(tabDiv);
        const panelsContainer = document.getElementById('categoriaPanelsContainer');
        const panelDiv = document.createElement('div');
        panelDiv.id = panelId;
        panelDiv.className = 'categoria-panel';
        panelDiv.innerHTML = `
            <label><b>Contenido (formato universal):</b></label>
            <textarea class="categoria-textarea" rows="6" placeholder="Pega aqui los productos de esta categoria..."></textarea>
            <div class="row"><button class="upload-cat-btn"><i class="fas fa-folder-open"></i> Subir archivo</button><input type="file" class="cat-file" accept=".csv,.txt" style="display:none;"></div>
        `;
        panelsContainer.appendChild(panelDiv);
        categoriaData[panelId] = { name: tabName };
        const ta = panelDiv.querySelector('.categoria-textarea');
        const upBtn = panelDiv.querySelector('.upload-cat-btn');
        const fileInp = panelDiv.querySelector('.cat-file');
        upBtn.addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; };
            r.readAsText(f);
        });
        ta.addEventListener('input', () => { categoriaData[panelId].content = ta.value; });
        const nameSpan = tabDiv.querySelector('.tab-name');
        nameSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const oldName = nameSpan.textContent;
            const input = document.createElement('input');
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
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || oldName;
                nameSpan.textContent = newName;
                categoriaData[panelId].name = newName;
                nameSpan.style.display = '';
                input.remove();
            });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        const closeBtn = tabDiv.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tabDiv.remove();
            panelDiv.remove();
            delete categoriaData[panelId];
            if (activeCategoriaId === panelId) {
                const firstTab = document.querySelector('#categoriaTabsContainer .categoria-tab');
                if (firstTab) firstTab.click();
            }
        });
        tabDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) return;
            document.querySelectorAll('.categoria-tab').forEach(t => t.classList.remove('active'));
            tabDiv.classList.add('active');
            document.querySelectorAll('.categoria-panel').forEach(p => p.classList.remove('active'));
            panelDiv.classList.add('active');
            activeCategoriaId = panelId;
        });
        if (document.querySelectorAll('.categoria-tab').length === 1) tabDiv.click();
        return panelId;
    }

    function obtenerDatosUnificados() {
        const allRows = [];
        for (const [panelId, data] of Object.entries(categoriaData)) {
            const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
            if (!ta) continue;
            const raw = ta.value;
            if (!raw.trim()) continue;
            const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
            for (const row of parsed) {
                allRows.push({
                    MODELO: row.MODELO,
                    LINEA: row.LINEA,
                    TIPO: row.TIPO,
                    TALLA: row.TALLA,
                    CANTIDAD: row.CANTIDAD,
                    CATEGORIA: data.name
                });
            }
        }
        return allRows;
    }

    function generarCsvUnificado() {
        const rows = obtenerDatosUnificados();
        if (rows.length === 0) {
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay datos en ninguna categoria.';
            return null;
        }
        currentUnificadoDf = rows;
        const csv = core.dfToCsv(rows, ',', true, true);
        document.getElementById('seccionadorOutput').innerHTML = core.renderTableHtml(rows);
        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se generaron ${rows.length} filas unificadas.`;
        return csv;
    }

    function construirMapaArticuloCategoria() {
        const mapa = new Map();
        for (const [panelId, data] of Object.entries(categoriaData)) {
            const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
            if (!ta) continue;
            const raw = ta.value;
            if (!raw.trim()) continue;
            const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
            for (const row of parsed) {
                const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
                if (!mapa.has(key)) mapa.set(key, data.name);
            }
        }
        return mapa;
    }

    function generarCsvTodosEscaneadosConCategoria() {
        const scanRaw = document.getElementById('scanGlobalInput').value;
        if (!scanRaw.trim()) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el escaneo primero.';
            return null;
        }
        const scanItems = core.parsearTextoUniversal(scanRaw).filter(r => r.TALLA !== 'TOTAL');
        if (scanItems.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> El escaneo no contiene elementos validos.';
            return null;
        }
        const mapaCategoria = construirMapaArticuloCategoria();
        const resultados = [];
        for (const item of scanItems) {
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            const categoria = mapaCategoria.get(key) || 'SIN CATEGORIA';
            resultados.push({
                MODELO: item.MODELO,
                LINEA: item.LINEA,
                TIPO: item.TIPO,
                TALLA: item.TALLA,
                CANTIDAD: item.CANTIDAD,
                CATEGORIA: categoria
            });
        }
        resultados.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
        const csv = core.dfToCsv(resultados, ',', true, true);
        return { csv, total: resultados.length };
    }

    function compararConEscaneo() {
        const scanRaw = document.getElementById('scanGlobalInput').value;
        if (!scanRaw.trim()) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> Pega el escaneo primero.';
            return;
        }
        const stockRows = obtenerDatosUnificados();
        if (stockRows.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay existencias cargadas en las categorias.';
            return;
        }
        const scanItems = core.parsearTextoUniversal(scanRaw).filter(r => r.TALLA !== 'TOTAL');
        if (scanItems.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> El escaneo no contiene elementos validos.';
            return;
        }
        const stockMap = new Map();
        for (const row of stockRows) {
            const key = `${row.MODELO}|${row.LINEA}|${row.TIPO}|${row.TALLA}`;
            stockMap.set(key, (stockMap.get(key) || 0) + row.CANTIDAD);
        }
        const scanMap = new Map();
        for (const item of scanItems) {
            const key = `${item.MODELO}|${item.LINEA}|${item.TIPO}|${item.TALLA}`;
            scanMap.set(key, (scanMap.get(key) || 0) + item.CANTIDAD);
        }
        const allKeys = new Set([...stockMap.keys(), ...scanMap.keys()]);
        const diferencias = [];
        let faltantes = 0, sobrantes = 0;
        const mapaCategoria = construirMapaArticuloCategoria();
        for (const key of allKeys) {
            const stock = stockMap.get(key) || 0;
            const scan = scanMap.get(key) || 0;
            const diff = scan - stock;
            if (diff !== 0) {
                const [modelo, linea, tipo, talla] = key.split('|');
                const rowDif = {
                    MODELO: modelo,
                    LINEA: linea,
                    TIPO: tipo,
                    TALLA: talla,
                    CANTIDAD_REAL: stock,
                    CANTIDAD_COMPARAR: scan,
                    DIFERENCIA: diff,
                    RESULTADO: diff > 0 ? 'SOBRANTE' : 'FALTANTE'
                };
                if (document.getElementById('includeCategoryInDiffCheckbox').checked) {
                    rowDif.CATEGORIA = mapaCategoria.get(key) || 'SIN CATEGORIA';
                }
                diferencias.push(rowDif);
                if (diff > 0) sobrantes += diff;
                else if (diff < 0) faltantes += Math.abs(diff);
            }
        }
        diferencias.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
        if (diferencias.length) {
            const totalReal = diferencias.reduce((s, r) => s + r.CANTIDAD_REAL, 0);
            const totalComparar = diferencias.reduce((s, r) => s + r.CANTIDAD_COMPARAR, 0);
            diferencias.push({
                MODELO: '', LINEA: '', TIPO: '', TALLA: 'TOTALES:',
                CANTIDAD_REAL: totalReal,
                CANTIDAD_COMPARAR: totalComparar,
                DIFERENCIA: totalComparar - totalReal,
                RESULTADO: `Faltante: ${faltantes} | Sobrante: ${sobrantes}`
            });
        }
        currentComparacionDf = diferencias;
        document.getElementById('comparacionOutput').innerHTML = core.renderTableHtml(diferencias);
        document.getElementById('comparacionMessage').innerHTML = `<i class="fas fa-chart-line"></i> Total faltantes en stock: ${faltantes}, sobrantes en stock: ${sobrantes}`;
    }

    function descargarDiferencias() {
        if (!currentComparacionDf || currentComparacionDf.length === 0) {
            document.getElementById('comparacionMessage').innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay diferencias para descargar.';
            return;
        }
        let dataToExport = currentComparacionDf;
        if (dataToExport.length && dataToExport[dataToExport.length - 1].TALLA === 'TOTALES:') {
            dataToExport = dataToExport.slice(0, -1);
        }
        const csv = core.dfToCsv(dataToExport, ',', true, true);
        core.downloadCsv(csv, `diferencias_vs_escaneo_${core.generarNombreFecha('csv')}`);
    }

    function descargarTodosEscaneados() {
        const result = generarCsvTodosEscaneadosConCategoria();
        if (result) {
            core.downloadCsv(result.csv, `todos_escaneados_con_categoria_${core.generarNombreFecha('csv')}`);
            document.getElementById('comparacionMessage').innerHTML = `<i class="fas fa-check-circle"></i> Se descargaron ${result.total} articulos del escaneo con su categoria.`;
        }
    }

    function descargarPorCategoria() {
        const categorias = Object.values(categoriaData).map(c => c.name);
        if (categorias.length === 0) { alert('No hay categorias'); return; }
        const seleccion = prompt(`Selecciona categoria para descargar (escribe el nombre exacto):\n${categorias.join(', ')}\n\nDejar vacio para descargar todas individualmente.`);
        if (seleccion === null) return;
        if (seleccion.trim() === '') {
            for (const [panelId, data] of Object.entries(categoriaData)) {
                const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
                if (!ta) continue;
                const raw = ta.value;
                if (!raw.trim()) continue;
                const parsed = core.parsearTextoUniversal(raw).filter(r => r.TALLA !== 'TOTAL');
                if (parsed.length === 0) continue;
                const csv = core.dfToCsv(parsed, ',', true, true);
                core.downloadCsv(csv, `${data.name}_${core.generarNombreFecha('csv')}`);
            }
            document.getElementById('seccionadorMessage').innerHTML = '<i class="fas fa-check-circle"></i> Se descargaron todas las categorias.';
        } else {
            const cat = seleccion.trim();
            let found = false;
            for (const [panelId, data] of Object.entries(categoriaData)) {
                if (data.name === cat) {
                    const ta = document.getElementById(panelId)?.querySelector('.categoria-textarea');
                    if (ta && ta.value.trim()) {
                        const parsed = core.parsearTextoUniversal(ta.value).filter(r => r.TALLA !== 'TOTAL');
                        const csv = core.dfToCsv(parsed, ',', true, true);
                        core.downloadCsv(csv, `${cat}_${core.generarNombreFecha('csv')}`);
                        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-check-circle"></i> Descargada categoria ${cat}.`;
                        found = true;
                    } else {
                        document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> La categoria ${cat} no tiene datos.`;
                    }
                    break;
                }
            }
            if (!found) document.getElementById('seccionadorMessage').innerHTML = `<i class="fas fa-exclamation-circle"></i> Categoria "${cat}" no encontrada.`;
        }
    }

    function initSeccionador() {
        const tabsContainer = document.getElementById('categoriaTabsContainer');
        const panelsContainer = document.getElementById('categoriaPanelsContainer');
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        categoriaData = {};
        categoriaCounter = 1;
        for (const cat of categoriasDefault) crearCategoria(cat);
        const addBtn = document.createElement('div');
        addBtn.id = 'addCategoriaBtn';
        addBtn.className = 'add-categoria-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar categoria';
        tabsContainer.appendChild(addBtn);
        addBtn.addEventListener('click', () => crearCategoria());
    }

    initProcesarMultiTabs();
    initSeccionador();

    document.getElementById('unificarCsvBtn').addEventListener('click', function() {
        const csv = generarCsvUnificado();
        if (csv) core.downloadCsv(csv, `unificado_${core.generarNombreFecha('csv')}`);
    });
    document.getElementById('descargarPorCategoriaBtn').addEventListener('click', descargarPorCategoria);
    document.getElementById('compararEscaneoBtn').addEventListener('click', compararConEscaneo);
    document.getElementById('descargarDiferenciasBtn').addEventListener('click', descargarDiferencias);
    document.getElementById('descargarTodosEscaneadosBtn').addEventListener('click', descargarTodosEscaneados);

    const subTabs = document.querySelectorAll('#procesarSubTabs .sub-module-tab');
    const operadorDiv = document.getElementById('procesarOperador');
    const seccionadorDiv = document.getElementById('procesarSeccionador');
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            subTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.submode === 'operador') {
                operadorDiv.style.display = 'block';
                seccionadorDiv.style.display = 'none';
            } else {
                operadorDiv.style.display = 'none';
                seccionadorDiv.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab1', this.dataset.submode);
        });
    });
    operadorDiv.style.display = 'block';
    seccionadorDiv.style.display = 'none';

    window.addEventListener('restoreSubmodule', function(e) {
        if (e.detail.tabId === 'tab1' && e.detail.subMode) {
            const targetTab = document.querySelector(`#procesarSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    const clearBtn = tabContainer.querySelector('.clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const procesarPanels = document.querySelectorAll('#procesarPanelsContainer .procesar-panel');
            procesarPanels.forEach(pnl => {
                const maestroInput = pnl.querySelector('.mainMaestroInput');
                if (maestroInput) maestroInput.value = '';
                const foliosContainer = pnl.querySelector('.mainFoliosContainer');
                if (foliosContainer) {
                    while (foliosContainer.firstChild) foliosContainer.removeChild(foliosContainer.firstChild);
                }
                const maestroName = pnl.querySelector('.mainMaestroName');
                if (maestroName) maestroName.value = 'MAESTRO';
                const toggleSumar = pnl.querySelector('.toggle-option[data-op="sumar"]');
                if (toggleSumar) toggleSumar.click();
                const tipoOrigen = pnl.querySelector('#tipoOrigen');
                if (tipoOrigen) tipoOrigen.value = '';
                const tipoUbicacion = pnl.querySelector('#tipoUbicacion');
                if (tipoUbicacion) tipoUbicacion.value = '';
                const tipoCategoria = pnl.querySelector('#tipoCategoria');
                if (tipoCategoria) tipoCategoria.value = '';
                const nombrePersonalizado = pnl.querySelector('#nombrePersonalizado');
                if (nombrePersonalizado) nombrePersonalizado.value = '';
                const sufijoAdicional = pnl.querySelector('#sufijoAdicional');
                if (sufijoAdicional) sufijoAdicional.value = '';
                const outputDiv = pnl.querySelector('.output-area');
                if (outputDiv) outputDiv.innerHTML = '';
                const messageDiv = pnl.querySelector('.message');
                if (messageDiv) messageDiv.innerHTML = '';
                const autoBtn = pnl.querySelector('.format-btn[data-format="auto"]');
                if (autoBtn) autoBtn.click();
                if (pnl.querySelector('#tipoOrigen')) {
                    const evt = new Event('input');
                    pnl.querySelector('#tipoOrigen').dispatchEvent(evt);
                }
                const autocompletar = pnl.querySelector('.autocompletarCheckbox');
                if (autocompletar) autocompletar.checked = true;
                const autoservicio = pnl.querySelector('.autoservicioCheckbox');
                if (autoservicio) autoservicio.checked = false;
                const ordenOriginal = pnl.querySelector('.ordenOriginalCheckbox');
                if (ordenOriginal) ordenOriginal.checked = false;
                const ticketMode = pnl.querySelector('.mainTicketMode');
                if (ticketMode) ticketMode.checked = false;
                const modoSuministros = pnl.querySelector('.modoSuministrosCheckbox');
                if (modoSuministros) modoSuministros.checked = false;
                const mostrarDanados = pnl.querySelector('.mostrarDanadosCheckbox');
                if (mostrarDanados) mostrarDanados.checked = false;
                datosActualesConEAN = [];
                window[`dfMainData_${pnl.id}`] = null;
                window[`dfMain_${pnl.id}`] = null;
                const danadosContainer = pnl.querySelector(`#codigosDanadosContainer_${pnl.id}`);
                if (danadosContainer) danadosContainer.style.display = 'none';
                const danadosList = pnl.querySelector(`#codigosDanadosList_${pnl.id}`);
                if (danadosList) danadosList.innerHTML = '';
                const specialPanel = document.getElementById('specialModelsPanel');
                if (specialPanel && specialPanel.style.display !== 'none') {
                    specialPanel.style.display = 'none';
                    const toggleBtn = pnl.querySelector('.toggle-special-models-btn');
                    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-plus"></i> MODELOS ESPECIALES';
                }
                actualizarConteoVivo(pnl);
            });
            const seccionadorDivEl = document.getElementById('procesarSeccionador');
            if (seccionadorDivEl) {
                const categoriaTextareas = seccionadorDivEl.querySelectorAll('.categoria-textarea');
                categoriaTextareas.forEach(ta => ta.value = '');
                const scanGlobal = document.getElementById('scanGlobalInput');
                if (scanGlobal) scanGlobal.value = '';
                const includeCat = document.getElementById('includeCategoryInDiffCheckbox');
                if (includeCat) includeCat.checked = false;
                const seccionadorOutput = document.getElementById('seccionadorOutput');
                if (seccionadorOutput) seccionadorOutput.innerHTML = '';
                const comparacionOutput = document.getElementById('comparacionOutput');
                if (comparacionOutput) comparacionOutput.innerHTML = '';
                const seccionadorMessage = document.getElementById('seccionadorMessage');
                if (seccionadorMessage) seccionadorMessage.innerHTML = '';
                const comparacionMessage = document.getElementById('comparacionMessage');
                if (comparacionMessage) comparacionMessage.innerHTML = '';
                currentUnificadoDf = null;
                currentComparacionDf = null;
            }
        });
    }
})();