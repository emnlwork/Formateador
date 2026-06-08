// Módulo Posiciones en Stock (Comparador + Eliminador)
(function() {
    const core = window.core;
    if (!core) return;

    const container = document.getElementById('tab6');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="row" style="justify-content:space-between;">
                <h3><i class="fas fa-warehouse"></i> Posiciones en Stock</h3>
                <button class="clear-module-btn"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
            <div class="sub-module-tabs" id="stockSubTabs">
                <div class="sub-module-tab active" data-submode="comparador">Comparador</div>
                <div class="sub-module-tab" data-submode="eliminador">Eliminador</div>
            </div>
            <!-- Comparador -->
            <div id="stockComparador" class="sub-stock-panel active">
                <label><b>Stock (CSV):</b><br><small>Formato: código1, código2, código3, posición (ej: "4137,NE,TEX,1")</small></label>
                <textarea id="stockInput" placeholder="Pega aquí el STOCK (CSV)..." rows="6"></textarea>
                <div class="row"><button id="uploadStockBtn"><i class="fas fa-folder-open"></i> Subir archivo CSV</button><input type="file" id="stockFile" accept=".csv,.txt" style="display:none;"></div>
                <label style="margin-top:1rem;"><b>Alternativas (tabulado) - opcional:</b><br><small>Si está vacío, se mostrará solo el stock.</small></label>
                <textarea id="alternativasInput" placeholder="Pega aquí las alternativas (separadas por tabulador)..." rows="6"></textarea>
                <div class="row"><button id="uploadAlternativasBtn"><i class="fas fa-folder-open"></i> Subir archivo de alternativas</button><input type="file" id="alternativasFile" accept=".txt,.csv" style="display:none;"></div>
                <div class="row" style="margin-top:0.5rem;">
                    <label><b>Filtrar por posición (1-99):</b></label>
                    <input type="number" id="filterPosition" value="" min="0" max="99" step="1" style="width:80px;">
                    <span style="font-size:0.8rem; color:var(--grayl);">(0 o vacío = todas)</span>
                </div>
                <div class="row" style="margin-top:0.5rem;">
                    <div class="toggle-group" id="viewModeToggle" style="margin-right: 1rem;">
                        <span class="toggle-option" data-mode="completa">Completa</span>
                        <span class="toggle-option active-toggle" data-mode="segmentos">Segmentos</span>
                    </div>
                    <div class="toggle-group" id="typeToggle" style="opacity: 1; pointer-events: auto;">
                        <span class="toggle-option active-toggle" data-type="faltan">Faltan</span>
                        <span class="toggle-option" data-type="sobran">Sobran</span>
                    </div>
                </div>
                <div class="row"><button id="compareStockBtn" class="btn-primary"><i class="fas fa-exchange-alt"></i> Comparar</button></div>
                <div id="stockMessage" class="message"></div>
                <div id="segmentTitle" class="segment-title"></div>
                <div id="stockOutput" class="output-area"></div>
                <div id="paginationControls" class="pagination-controls" style="display: none;">
                    <button id="prevPageBtn" class="btn-secondary"><i class="fas fa-chevron-left"></i> Anterior</button>
                    <span id="pageInfo" class="page-info">Página 1 / 1</span>
                    <button id="nextPageBtn" class="btn-secondary">Siguiente <i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <!-- Eliminador -->
            <div id="stockEliminador" class="sub-stock-panel">
                <label><b>Stock (CSV):</b><br><small>Formato: código1, código2, código3, posición (la posición se ignorará)</small></label>
                <textarea id="stockElimInput" placeholder="Pega aquí el STOCK (CSV)..." rows="6"></textarea>
                <div class="row"><button id="uploadStockElimBtn"><i class="fas fa-folder-open"></i> Subir archivo CSV</button><input type="file" id="stockElimFile" accept=".csv,.txt" style="display:none;"></div>
                <label style="margin-top:1rem;"><b>Alternativas (tabulado):</b><br><small>Columnas: (cualquiera) pero se usan las columnas 2,3,4 (la posición se ignora). Mínimo 6 columnas separadas por tab.</small></label>
                <textarea id="alternativasElimInput" placeholder="Pega aquí las alternativas (separadas por tabulador)..." rows="6"></textarea>
                <div class="row"><button id="uploadAlternativasElimBtn"><i class="fas fa-folder-open"></i> Subir archivo de alternativas</button><input type="file" id="alternativasElimFile" accept=".txt,.csv" style="display:none;"></div>
                <div class="row" style="margin-top:0.5rem;">
                    <div class="toggle-group" id="viewModeToggleElim" style="margin-right: 1rem;">
                        <span class="toggle-option" data-mode="completa">Completa</span>
                        <span class="toggle-option active-toggle" data-mode="segmentos">Segmentos</span>
                    </div>
                </div>
                <div class="row"><button id="eliminarBtn" class="btn-primary"><i class="fas fa-trash-alt"></i> Calcular eliminaciones</button></div>
                <div id="elimMessage" class="message"></div>
                <div id="elimSegmentTitle" class="segment-title"></div>
                <div id="elimOutput" class="output-area"></div>
                <div id="elimPaginationControls" class="pagination-controls" style="display: none;">
                    <button id="prevPageElimBtn" class="btn-secondary"><i class="fas fa-chevron-left"></i> Anterior</button>
                    <span id="pageInfoElim" class="page-info">Página 1 / 1</span>
                    <button id="nextPageElimBtn" class="btn-secondary">Siguiente <i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="instructions-box">
                <b><i class="fas fa-info-circle"></i> Instrucciones – Posiciones en Stock</b><br>
                <b>Comparador:</b> Compara stock y alternativas por posición. Muestra faltantes y sobrantes.<br>
                <b>Eliminador:</b> Ignora la posición. Dice qué productos de alternativas no están en el stock.
            </div>
        </div>
    `;

    // Configurar uploads
    core.setupFileUpload('uploadStockBtn', 'stockFile', 'stockInput');
    core.setupFileUpload('uploadAlternativasBtn', 'alternativasFile', 'alternativasInput');
    core.setupFileUpload('uploadStockElimBtn', 'stockElimFile', 'stockElimInput');
    core.setupFileUpload('uploadAlternativasElimBtn', 'alternativasElimFile', 'alternativasElimInput');

    let stockData = { faltanAll: [], sobranAll: [], positionsHtml: null };
    let currentPage = 1;
    let itemsPerPage = 18;
    let currentType = 'faltan';
    let currentView = 'segmentos';

    let elimData = { items: [] };
    let elimCurrentPage = 1;
    let elimCurrentView = 'segmentos';
    let elimItemsPerPage = 18;

    function parsearStock(texto) {
        const stock = new Set();
        const lineas = texto.trim().split(/\r?\n/);
        for (let linea of lineas) {
            linea = linea.trim();
            if (!linea) continue;
            const partes = linea.split(',').map(p => p.trim());
            if (partes.length !== 4) continue;
            const cod1 = partes[0];
            const cod2 = partes[1];
            const cod3 = partes[2];
            const pos = partes[3];
            stock.add(`${cod1}|${cod2}|${cod3}|${pos}`);
        }
        return stock;
    }

    function parsearAlternativas(texto) {
        const alternativasPorPos = new Map();
        if (!texto.trim()) return alternativasPorPos;
        const lineas = texto.trim().split(/\r?\n/);
        const regexNumero = /\d+/;
        for (let linea of lineas) {
            linea = linea.trim();
            if (!linea) continue;
            const campos = linea.split('\t');
            if (campos.length < 6) continue;
            const cod1 = campos[1].trim();
            const cod2 = campos[2].trim();
            const cod3 = campos[3].trim();
            const posStr = campos[5].trim();
            const match = posStr.match(regexNumero);
            if (!match) continue;
            const numPos = match[0];
            const key = `${cod1}|${cod2}|${cod3}|${numPos}`;
            if (!alternativasPorPos.has(numPos)) alternativasPorPos.set(numPos, new Set());
            alternativasPorPos.get(numPos).add(key);
        }
        return alternativasPorPos;
    }

    function renderListWithSeparator(items, maxPerGroup = 18) {
        if (!items.length) return '<span style="margin-left: 1rem;"> Ninguno.</span>';
        let html = '<ul style="margin: 0.5rem 0 0 1.5rem;">';
        for (let i = 0; i < items.length; i++) {
            html += `<li>${items[i]}</li>`;
            if ((i + 1) % maxPerGroup === 0 && i !== items.length - 1) html += `<hr class="separator-18">`;
        }
        html += '</ul>';
        return html;
    }

    function updateSegmentTitle() {
        const titleDiv = document.getElementById('segmentTitle');
        if (currentView !== 'segmentos') { titleDiv.innerHTML = ''; return; }
        const items = (currentType === 'faltan') ? stockData.faltanAll : stockData.sobranAll;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        titleDiv.innerHTML = `<strong>Mostrando ${currentType === 'faltan' ? 'FALTANTES' : 'SOBRANTES'}</strong> (${items.length} elementos) - Página ${currentPage} de ${totalPages || 1}`;
    }

    function renderStockOutput() {
        const outputDiv = document.getElementById('stockOutput');
        if (currentView === 'completa') {
            if (stockData.positionsHtml) outputDiv.innerHTML = stockData.positionsHtml;
            else outputDiv.innerHTML = '<p>No hay datos. Haz clic en "Comparar" primero.</p>';
            document.getElementById('paginationControls').style.display = 'none';
            const typeToggle = document.getElementById('typeToggle');
            typeToggle.style.opacity = '0.5';
            typeToggle.style.pointerEvents = 'none';
            document.getElementById('segmentTitle').innerHTML = '';
        } else {
            const items = (currentType === 'faltan') ? stockData.faltanAll : stockData.sobranAll;
            const totalPages = Math.ceil(items.length / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = items.slice(start, end);
            let html = '';
            if (pageItems.length === 0) html = '<p>No hay elementos para mostrar.</p>';
            else {
                html = '<ul style="margin: 0.5rem 0 0 1.5rem;">';
                pageItems.forEach(item => { html += `<li>${item}</li>`; });
                html += '</ul>';
            }
            outputDiv.innerHTML = html;
            const paginationDiv = document.getElementById('paginationControls');
            paginationDiv.style.display = 'flex';
            document.getElementById('pageInfo').textContent = `Página ${currentPage} / ${totalPages || 1}`;
            document.getElementById('prevPageBtn').disabled = (currentPage <= 1);
            document.getElementById('nextPageBtn').disabled = (currentPage >= totalPages);
            const typeToggle = document.getElementById('typeToggle');
            typeToggle.style.opacity = '1';
            typeToggle.style.pointerEvents = 'auto';
            updateSegmentTitle();
        }
    }

    function compararStock() {
        const stockText = document.getElementById('stockInput').value;
        const altText = document.getElementById('alternativasInput').value;
        const outputDiv = document.getElementById('stockOutput');
        const msgDiv = document.getElementById('stockMessage');
        if (!stockText.trim()) { msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar el texto del Stock (CSV).'; outputDiv.innerHTML = ''; return; }
        try {
            const stockSet = parsearStock(stockText);
            if (stockSet.size === 0) { msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron elementos válidos en el stock. Revisa el formato (CSV con 4 columnas).'; outputDiv.innerHTML = ''; return; }
            let filterPos = document.getElementById('filterPosition').value;
            let posFilter = null;
            if (filterPos !== undefined && filterPos !== null && filterPos !== '') {
                let num = parseInt(filterPos);
                if (!isNaN(num) && num >= 1 && num <= 99) posFilter = num.toString();
            }
            const altPorPos = parsearAlternativas(altText);
            const hayAlternativas = altPorPos.size > 0;
            const stockPorPos = new Map();
            for (const item of stockSet) {
                const partes = item.split('|');
                const pos = partes[3];
                if (!stockPorPos.has(pos)) stockPorPos.set(pos, new Set());
                stockPorPos.get(pos).add(item);
            }
            let posicionesBase;
            if (hayAlternativas) posicionesBase = Array.from(altPorPos.keys());
            else posicionesBase = Array.from(stockPorPos.keys());
            let posicionesMostrar;
            if (posFilter !== null) {
                if (!posicionesBase.includes(posFilter)) { msgDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> La posición ${posFilter} no aparece en las ${hayAlternativas ? 'alternativas' : 'stock'}.`; outputDiv.innerHTML = ''; return; }
                posicionesMostrar = [posFilter];
            } else {
                posicionesMostrar = posicionesBase.sort((a,b) => parseInt(a) - parseInt(b));
            }
            let html = '';
            const faltanAll = [];
            const sobranAll = [];
            for (const pos of posicionesMostrar) {
                const stockPos = stockPorPos.get(pos) || new Set();
                const altPos = (hayAlternativas && altPorPos.has(pos)) ? altPorPos.get(pos) : new Set();
                const faltan = new Set([...stockPos].filter(x => !altPos.has(x)));
                const sobran = new Set([...altPos].filter(x => !stockPos.has(x)));
                const faltanArray = Array.from(faltan).sort((a,b) => parseInt(a.split('|')[0]) - parseInt(b.split('|')[0]))
                    .map(item => { const [c1,c2,c3,posItem] = item.split('|'); return `${c1}, ${c2}, ${c3}, POSICION ${posItem}`; });
                const sobranArray = Array.from(sobran).sort((a,b) => parseInt(a.split('|')[0]) - parseInt(b.split('|')[0]))
                    .map(item => { const [c1,c2,c3,posItem] = item.split('|'); return `${c1}, ${c2}, ${c3}, POSICION ${posItem}`; });
                faltanAll.push(...faltanArray);
                sobranAll.push(...sobranArray);
                html += `<div style="margin-bottom: 2rem; border-left: 3px solid var(--blu); padding-left: 1rem;">`;
                html += `<h4>POSICIÓN ${pos}</h4>`;
                html += `<div style="margin-top: 0.5rem;"><b>FALTAN DE PONER (en stock pero NO en alternativas) (${faltanArray.length} elementos):</b>`;
                html += renderListWithSeparator(faltanArray, 18);
                html += `</div>`;
                html += `<div style="margin-top: 1rem;"><b>TIENE DE MÁS (en alternativas pero NO en stock) (${sobranArray.length} elementos):</b>`;
                if (sobranArray.length === altPos.size && altPos.size > 0) html += `<span style="margin-left: 1rem;"> Todos los elementos deben ser removidos.</span>`;
                else html += renderListWithSeparator(sobranArray, 18);
                html += `</div></div>`;
            }
            html += `<p style="margin-top: 1rem;"><i class="fas fa-check-circle"></i> --- FIN DEL ANÁLISIS ---</p>`;
            stockData.positionsHtml = html;
            stockData.faltanAll = faltanAll;
            stockData.sobranAll = sobranAll;
            currentPage = 1;
            renderStockOutput();
            msgDiv.innerHTML = `<i class="fas fa-check-circle"></i> Comparación completada. Se analizaron ${posicionesMostrar.length} posiciones.`;
        } catch(e) { msgDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${e.message}`; outputDiv.innerHTML = ''; console.error(e); }
    }

    // Eliminador
    function parsearStockSinPosicion(texto) {
        const set = new Set();
        const lineas = texto.trim().split(/\r?\n/);
        for (let linea of lineas) {
            linea = linea.trim();
            if (!linea) continue;
            const partes = linea.split(',').map(p => p.trim());
            if (partes.length < 3) continue;
            const cod1 = partes[0];
            const cod2 = partes[1];
            const cod3 = partes[2];
            set.add(`${cod1}|${cod2}|${cod3}`);
        }
        return set;
    }

    function parsearAlternativasSinPosicion(texto) {
        const set = new Set();
        if (!texto.trim()) return set;
        const lineas = texto.trim().split(/\r?\n/);
        for (let linea of lineas) {
            linea = linea.trim();
            if (!linea) continue;
            const campos = linea.split('\t');
            if (campos.length < 4) continue;
            const cod1 = campos[1].trim();
            const cod2 = campos[2].trim();
            const cod3 = campos[3].trim();
            set.add(`${cod1}|${cod2}|${cod3}`);
        }
        return set;
    }

    function renderElimOutput() {
        const outputDiv = document.getElementById('elimOutput');
        const titleDiv = document.getElementById('elimSegmentTitle');
        if (elimCurrentView === 'completa') {
            if (elimData.items.length === 0) outputDiv.innerHTML = '<p>No hay elementos para eliminar.</p>';
            else {
                let html = '<ul style="margin: 0.5rem 0 0 1.5rem;">';
                elimData.items.forEach(item => { html += `<li>${item}</li>`; });
                html += '</ul>';
                outputDiv.innerHTML = html;
            }
            document.getElementById('elimPaginationControls').style.display = 'none';
            titleDiv.innerHTML = '';
        } else {
            const totalPages = Math.ceil(elimData.items.length / elimItemsPerPage);
            const start = (elimCurrentPage - 1) * elimItemsPerPage;
            const end = start + elimItemsPerPage;
            const pageItems = elimData.items.slice(start, end);
            let html = '';
            if (pageItems.length === 0) html = '<p>No hay elementos para mostrar.</p>';
            else {
                html = '<ul style="margin: 0.5rem 0 0 1.5rem;">';
                pageItems.forEach(item => { html += `<li>${item}</li>`; });
                html += '</ul>';
            }
            outputDiv.innerHTML = html;
            const paginationDiv = document.getElementById('elimPaginationControls');
            paginationDiv.style.display = 'flex';
            document.getElementById('pageInfoElim').textContent = `Página ${elimCurrentPage} / ${totalPages || 1}`;
            document.getElementById('prevPageElimBtn').disabled = (elimCurrentPage <= 1);
            document.getElementById('nextPageElimBtn').disabled = (elimCurrentPage >= totalPages);
            titleDiv.innerHTML = `<strong>Mostrando ELEMENTOS A ELIMINAR</strong> (${elimData.items.length} elementos) - Página ${elimCurrentPage} de ${totalPages || 1}`;
        }
    }

    function calcularEliminaciones() {
        const stockText = document.getElementById('stockElimInput').value;
        const altText = document.getElementById('alternativasElimInput').value;
        const msgDiv = document.getElementById('elimMessage');
        const outputDiv = document.getElementById('elimOutput');
        if (!stockText.trim() || !altText.trim()) { msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Debes pegar ambos textos (Stock y Alternativas).'; outputDiv.innerHTML = ''; return; }
        try {
            const stockSet = parsearStockSinPosicion(stockText);
            const altSet = parsearAlternativasSinPosicion(altText);
            if (stockSet.size === 0) { msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron elementos válidos en el stock. Revisa el formato (CSV con al menos 3 columnas).'; outputDiv.innerHTML = ''; return; }
            if (altSet.size === 0) { msgDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron alternativas válidas. Revisa el formato (tabulaciones, al menos 4 columnas).'; outputDiv.innerHTML = ''; return; }
            const aEliminar = [];
            for (const altItem of altSet) {
                if (!stockSet.has(altItem)) {
                    const [c1, c2, c3] = altItem.split('|');
                    aEliminar.push(`${c1}, ${c2}, ${c3}`);
                }
            }
            aEliminar.sort((a,b) => parseInt(a.split(',')[0]) - parseInt(b.split(',')[0]));
            elimData.items = aEliminar;
            elimCurrentPage = 1;
            renderElimOutput();
            msgDiv.innerHTML = `<i class="fas fa-check-circle"></i> Se encontraron ${aEliminar.length} elementos para eliminar.`;
        } catch(e) { msgDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${e.message}`; outputDiv.innerHTML = ''; console.error(e); }
    }

    // Eventos del comparador
    document.getElementById('compareStockBtn').addEventListener('click', compararStock);
    const viewModeToggle = document.getElementById('viewModeToggle');
    const typeToggle = document.getElementById('typeToggle');
    viewModeToggle.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', function() {
            viewModeToggle.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active-toggle'));
            this.classList.add('active-toggle');
            currentView = this.dataset.mode;
            currentPage = 1;
            renderStockOutput();
        });
    });
    typeToggle.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', function() {
            if (currentView !== 'segmentos') return;
            typeToggle.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active-toggle'));
            this.classList.add('active-toggle');
            currentType = this.dataset.type;
            currentPage = 1;
            renderStockOutput();
        });
    });
    document.getElementById('prevPageBtn').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderStockOutput(); } });
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        const items = (currentType === 'faltan') ? stockData.faltanAll : stockData.sobranAll;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        if (currentPage < totalPages) { currentPage++; renderStockOutput(); }
    });

    // Eventos del eliminador
    document.getElementById('eliminarBtn').addEventListener('click', calcularEliminaciones);
    const viewModeToggleElim = document.getElementById('viewModeToggleElim');
    viewModeToggleElim.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', function() {
            viewModeToggleElim.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active-toggle'));
            this.classList.add('active-toggle');
            elimCurrentView = this.dataset.mode;
            elimCurrentPage = 1;
            renderElimOutput();
        });
    });
    document.getElementById('prevPageElimBtn').addEventListener('click', () => { if (elimCurrentPage > 1) { elimCurrentPage--; renderElimOutput(); } });
    document.getElementById('nextPageElimBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(elimData.items.length / elimItemsPerPage);
        if (elimCurrentPage < totalPages) { elimCurrentPage++; renderElimOutput(); }
    });

    // Cambio entre submódulos de stock
    const stockSubTabs = document.querySelectorAll('#stockSubTabs .sub-module-tab');
    const stockComparador = document.getElementById('stockComparador');
    const stockEliminador = document.getElementById('stockEliminador');
    stockSubTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            stockSubTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.submode === 'comparador') {
                stockComparador.style.display = 'block';
                stockEliminador.style.display = 'none';
            } else {
                stockComparador.style.display = 'none';
                stockEliminador.style.display = 'block';
            }
            if (window.updateHash) window.updateHash('tab6', this.dataset.submode);
        });
    });
    stockComparador.style.display = 'block';
    stockEliminador.style.display = 'none';

    window.addEventListener('restoreSubmodule', (e) => {
        if (e.detail.tabId === 'tab6' && e.detail.subMode) {
            const targetTab = document.querySelector(`#stockSubTabs .sub-module-tab[data-submode="${e.detail.subMode}"]`);
            if (targetTab) targetTab.click();
        }
    });

    // ==================== LIMPIAR MÓDULO (silencioso) ====================
    const clearBtn = document.querySelector('#tab6 .clear-module-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Comparador
            document.getElementById('stockInput').value = '';
            document.getElementById('alternativasInput').value = '';
            document.getElementById('filterPosition').value = '';
            document.getElementById('stockOutput').innerHTML = '';
            document.getElementById('stockMessage').innerHTML = '';
            const viewSegmentos = document.querySelector('#viewModeToggle .toggle-option[data-mode="segmentos"]');
            if (viewSegmentos) viewSegmentos.click();
            const typeFaltan = document.querySelector('#typeToggle .toggle-option[data-type="faltan"]');
            if (typeFaltan) typeFaltan.click();
            // Eliminador
            document.getElementById('stockElimInput').value = '';
            document.getElementById('alternativasElimInput').value = '';
            document.getElementById('elimOutput').innerHTML = '';
            document.getElementById('elimMessage').innerHTML = '';
            const viewElimSegmentos = document.querySelector('#viewModeToggleElim .toggle-option[data-mode="segmentos"]');
            if (viewElimSegmentos) viewElimSegmentos.click();
            // Resetear datos
            stockData = { faltanAll: [], sobranAll: [], positionsHtml: null };
            elimData = { items: [] };
            currentPage = 1;
            elimCurrentPage = 1;
        });
    }
})();