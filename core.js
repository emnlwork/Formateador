// ==================== CORE: funciones universales ====================
window.core = (function() {
    // Normalización de tallas
    function normalizarTalla(t) {
        return t ? t.replace(/½/g, '.5').replace(/\.0$/, '') : t;
    }

    // Agregar fila de TOTAL
    function agregarFilaTotal(df, colCant = 'CANTIDAD') {
        if (!df || !df.length) return df;
        const total = df.reduce((s, r) => s + (parseInt(r[colCant]) || 0), 0);
        const fila = {};
        Object.keys(df[0]).forEach(k => fila[k] = '');
        fila[colCant] = total;
        fila['TALLA'] = 'TOTAL';
        return [...df, fila];
    }

    // Generar nombre de archivo con fecha
    function generarNombreFecha(ext) {
        const ahora = new Date();
        const y = ahora.getFullYear();
        const m = String(ahora.getMonth() + 1).padStart(2, '0');
        const d = String(ahora.getDate()).padStart(2, '0');
        const h = String(ahora.getHours()).padStart(2, '0');
        const min = String(ahora.getMinutes()).padStart(2, '0');
        return `${y}${m}${d}${h}${min}.${ext}`;
    }

    function parsearTextoUniversal(texto) {
        if (!texto.trim()) return [];
        if (texto.includes('\t')) return parsearFormatoTabs(texto);
        if (texto.includes('MODELO') && texto.includes(',')) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data.length) {
                    return parsed.data.filter(r => {
                        const modelo = String(r.MODELO || '').trim();
                        const linea = String(r.LINEA || '').trim();
                        const tipo = String(r.TIPO || '').trim();
                        if (modelo === '1' && linea === 'RS' && tipo === 'TX') return false;
                        return r.MODELO && r.TALLA !== 'TOTAL' && r.CANTIDAD !== undefined;
                    }).map(r => ({
                        MODELO: String(r.MODELO).trim(),
                        LINEA: String(r.LINEA || '').trim(),
                        TIPO: String(r.TIPO || '').trim(),
                        TALLA: String(r.TALLA).trim(),
                        CANTIDAD: parseInt(r.CANTIDAD) || 0
                    }));
                }
            } catch (e) { }
        }
        return parsearFormatoTabs(texto);
    }

    function parsearFormatoTabs(texto) {
        const esFormato2 = texto.includes('Si') || texto.includes('No');
        return esFormato2 ? parsearFormato2(texto) : parsearFormato1(texto);
    }

    function parsearFormato1(entrada) {
        const fantasma = "1 RS TX\t\t\t\t13\t\t\t\t\t\t\t\n";
        const completo = fantasma + entrada;
        const lines = completo.trim().split('\n');
        const data = lines.map(l => l.split('\t'));
        const maxCols = Math.max(...data.map(r => r.length));
        const norm = data.map(r => [...r, ...Array(maxCols - r.length).fill('')]);
        let tallas = {};
        const resultados = [];
        for (let i = 0; i < norm.length; i++) {
            const fila = norm[i];
            const primera = (fila[0] || '').trim();
            if (primera === '') {
                tallas = {};
                for (let j = 1; j < fila.length; j++) {
                    const v = (fila[j] || '').trim();
                    if (v) { let t = normalizarTalla(v); if (t) tallas[j] = t; }
                }
                continue;
            }
            if (primera === 'Si' || primera === 'No') continue;
            const partes = primera.split(/\s+/);
            if (partes.length >= 3) {
                let mod = partes[0].replace(/\.0$/, '');
                if (mod === '1' && partes[1] === 'RS' && partes[2] === 'TX') continue;
                const lin = partes.slice(1, -1).join(' ') || partes[1];
                const tip = partes[partes.length - 1];
                for (let j = 1; j < fila.length; j++) {
                    const val = (fila[j] || '').trim();
                    if (val && tallas[j]) {
                        const c = parseInt(val);
                        if (!isNaN(c) && c > 0) resultados.push({ MODELO: mod, LINEA: lin, TIPO: tip, TALLA: tallas[j], CANTIDAD: c });
                    }
                }
            }
        }
        const map = new Map();
        resultados.forEach(r => {
            const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
            map.set(k, map.has(k) ? { ...map.get(k), CANTIDAD: map.get(k).CANTIDAD + r.CANTIDAD } : { ...r });
        });
        let df = Array.from(map.values());
        df.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
        return agregarFilaTotal(df);
    }

    function parsearFormato2(entrada) {
        const fantasma = "\t3\t5\t7\t9\t11\t13\n1 AS ALE\t\t\t\t\t\t2\t\t\t2\n\tCH\tM\tG\tEG\n";
        const completo = fantasma + entrada;
        const lines = completo.trim().split('\n');
        const data = lines.map(l => l.split('\t'));
        const maxCols = Math.max(...data.map(r => r.length));
        const norm = data.map(r => [...r, ...Array(maxCols - r.length).fill('')]);
        const resultados = [];
        const tallasFila0 = [];
        for (let j = 0; j < norm[0].length; j++) {
            const v = (norm[0][j] || '').trim();
            if (v) tallasFila0.push({ pos: j, talla: normalizarTalla(v) });
        }
        let tallasActuales = null;
        for (let i = 3; i < norm.length; i++) {
            const fila = norm[i];
            const primera = (fila[0] || '').trim();
            if (primera === '' && fila.some(c => (c || '').trim())) {
                tallasActuales = [];
                for (let j = 0; j < fila.length; j++) {
                    const v = (fila[j] || '').trim();
                    if (v) tallasActuales.push({ pos: j, talla: normalizarTalla(v) });
                }
                continue;
            }
            if (primera === '1' && (fila[1] || '').trim() === 'AS' && (fila[2] || '').trim() === 'ALE') continue;
            for (let j = 0; j < fila.length; j++) {
                const valor = (fila[j] || '').trim();
                if (valor && valor !== 'Si' && valor !== 'No' && /\d/.test(valor) && /[a-zA-Z]/.test(valor)) {
                    const partes = valor.split(/\s+/);
                    if (partes.length >= 3) {
                        const mod = partes[0];
                        const lin = partes.slice(1, -1).join(' ') || partes[1];
                        const tip = partes[partes.length - 1];
                        const ref = tallasActuales || tallasFila0;
                        const dict = {};
                        ref.forEach(t => dict[t.pos] = t.talla);
                        for (let k = 0; k < fila.length; k++) {
                            if (k === j) continue;
                            const vk = (fila[k] || '').trim();
                            if (vk && vk !== 'Si' && vk !== 'No' && !isNaN(parseInt(vk)) && dict[k]) {
                                const c = parseInt(vk);
                                if (c > 0) resultados.push({ MODELO: mod, LINEA: lin, TIPO: tip, TALLA: dict[k], CANTIDAD: c });
                            }
                        }
                        break;
                    }
                }
            }
        }
        const map = new Map();
        resultados.forEach(r => {
            const k = `${r.MODELO}|${r.LINEA}|${r.TIPO}|${r.TALLA}`;
            map.set(k, map.has(k) ? { ...map.get(k), CANTIDAD: map.get(k).CANTIDAD + r.CANTIDAD } : { ...r });
        });
        let df = Array.from(map.values());
        df.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
        return agregarFilaTotal(df);
    }

    function extraerModelosConCantidad(texto) {
        if (!texto.trim()) return [];
        let cleanText = texto.replace(/^\uFEFF/, '');
        const primerasLineas = cleanText.slice(0, 500).toUpperCase();
        const esCsv = primerasLineas.includes('MODELO') && (primerasLineas.includes('LINEA') || primerasLineas.includes('TIPO'));
        if (esCsv) {
            try {
                const parsed = Papa.parse(cleanText, { header: true, skipEmptyLines: true, dynamicTyping: false, transformHeader: h => h.trim().toUpperCase() });
                if (parsed.data && parsed.data.length) {
                    const acumulador = new Map();
                    for (const row of parsed.data) {
                        const modelo = (row.MODELO || '').trim();
                        const linea = (row.LINEA || row.COLOR || '').trim();
                        const tipo = (row.TIPO || row.MATERIAL || '').trim();
                        if (!modelo || !linea || !tipo) continue;
                        if (modelo === '1' && linea === 'RS' && tipo === 'TX') continue;
                        let cantidad = parseFloat(row.CANTIDAD);
                        if (isNaN(cantidad)) cantidad = 1;
                        if (cantidad === 0) continue;
                        const key = `${modelo}|${linea}|${tipo}`;
                        acumulador.set(key, (acumulador.get(key) || 0) + cantidad);
                    }
                    if (acumulador.size > 0) {
                        const result = [];
                        for (let [key, cant] of acumulador.entries()) {
                            const [modelo, linea, tipo] = key.split('|');
                            result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, CANTIDAD: cant });
                        }
                        return result;
                    }
                }
            } catch (e) { console.warn(e); }
        }
        const lines = cleanText.split(/\r?\n/);
        if (lines.length >= 2) {
            const firstLine = lines[0].trim();
            const tieneMuchasTallas = (firstLine.match(/\d+(?:\.5|½)?/g) || []).length >= 3;
            if (tieneMuchasTallas) {
                const data = lines.map(l => l.split('\t'));
                const maxCols = Math.max(...data.map(r => r.length));
                const norm = data.map(r => [...r, ...Array(maxCols - r.length).fill('')]);
                const tallasCols = [];
                for (let j = 0; j < norm[0].length; j++) {
                    let val = (norm[0][j] || '').trim();
                    if (val && !/^[A-Za-z]/.test(val)) {
                        const num = parseFloat(val);
                        if (!isNaN(num) && num < 100 && Number.isInteger(num)) {
                            tallasCols.push(j);
                        }
                    }
                }
                const acumulador = new Map();
                for (let i = 1; i < norm.length; i++) {
                    const fila = norm[i];
                    const primeraCelda = (fila[0] || '').trim();
                    if (!primeraCelda) continue;
                    const partes = primeraCelda.split(/\s+/);
                    if (partes.length < 3) continue;
                    const modelo = partes[0];
                    const linea = partes[1];
                    const tipo = partes.slice(2).join(' ') || partes[2];
                    if (modelo === '1' && linea === 'RS' && tipo === 'TX') continue;
                    let suma = 0;
                    for (const col of tallasCols) {
                        const valorCelda = (fila[col] || '').trim();
                        if (valorCelda && !isNaN(parseFloat(valorCelda))) {
                            const num = parseFloat(valorCelda);
                            if (Number.isInteger(num) && num >= 0 && num <= 9999) {
                                suma += num;
                            }
                        }
                    }
                    if (suma > 0) {
                        const key = `${modelo}|${linea}|${tipo}`;
                        acumulador.set(key, (acumulador.get(key) || 0) + suma);
                    }
                }
                if (acumulador.size > 0) {
                    const result = [];
                    for (let [key, cant] of acumulador.entries()) {
                        const [modelo, linea, tipo] = key.split('|');
                        result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, CANTIDAD: cant });
                    }
                    return result;
                }
            }
        }
        const cantidadMap = new Map();
        for (let rawLine of lines) {
            let linea = rawLine.trim();
            if (!linea) continue;
            let modelo = '', lineaVal = '', tipoVal = '';
            let cantidad = 1;
            if (linea.includes('\t')) {
                const parts = linea.split('\t');
                const firstField = parts[0];
                const tokens = firstField.split(/\s+/);
                if (tokens.length >= 3) {
                    modelo = tokens[0];
                    lineaVal = tokens[1];
                    tipoVal = tokens.slice(2).join(' ') || tokens[2];
                } else {
                    const allTokens = linea.split(/\s+/);
                    if (allTokens.length >= 3) {
                        modelo = allTokens[0];
                        lineaVal = allTokens[1];
                        tipoVal = allTokens.slice(2).join(' ') || allTokens[2];
                    } else continue;
                }
                for (let k = 1; k < parts.length; k++) {
                    const q = parseInt(parts[k]);
                    if (!isNaN(q)) { cantidad = q; break; }
                }
            } else {
                const tokens = linea.split(/\s+/);
                if (tokens.length >= 3) {
                    modelo = tokens[0];
                    lineaVal = tokens[1];
                    tipoVal = tokens.slice(2).join(' ') || tokens[2];
                    if (tokens.length >= 4) {
                        const q = parseInt(tokens[3]);
                        if (!isNaN(q)) cantidad = q;
                    }
                } else continue;
            }
            if (modelo === '1' && lineaVal === 'RS' && tipoVal === 'TX') continue;
            if (/^\d+$/.test(modelo) && /^[A-Za-z]{2,}$/.test(lineaVal) && tipoVal.length >= 2) {
                const key = `${modelo}|${lineaVal}|${tipoVal}`;
                cantidadMap.set(key, (cantidadMap.get(key) || 0) + cantidad);
            }
        }
        const result = [];
        for (let [key, cant] of cantidadMap.entries()) {
            const [modelo, linea, tipo] = key.split('|');
            result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, CANTIDAD: cant });
        }
        return result;
    }

    function setupFileUpload(btnId, fileId, textareaId) {
        const btn = document.getElementById(btnId), file = document.getElementById(fileId), ta = document.getElementById(textareaId);
        if (!btn || !file || !ta) return;
        btn.addEventListener('click', () => file.click());
        file.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => { ta.value = ev.target.result; file.value = ''; };
            r.readAsText(f);
        });
    }

    function copiarTexto(texto, fbId) {
        if (!texto) return;
        navigator.clipboard.writeText(texto).then(() => {
            const el = document.getElementById(fbId);
            if (el) { el.textContent = 'Copiado'; setTimeout(() => el.textContent = '', 1500); }
        }).catch(() => { });
    }

    function dfToCsv(df, sep = ',', header = true, quoted = true) {
        if (!df || !df.length) return '';
        const options = { quotes: quoted, delimiter: sep, header: header };
        return Papa.unparse(df, options);
    }

    function downloadCsv(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function renderTableHtml(df) {
        if (!df || !df.length) return '<p>Sin datos</p>';
        const headers = Object.keys(df[0]);
        let html = '<table class="output-table"><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        df.forEach(r => {
            html += '<tr>';
            headers.forEach(h => html += `<td>${r[h] ?? ''}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    function renderTableToElement(df, elementId) {
        const container = document.getElementById(elementId);
        if (!df || !df.length) { container.innerHTML = '<p>Sin datos</p>'; return; }
        container.innerHTML = renderTableHtml(df);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    // ==================== FUNCIONES PARA CÓDIGOS DE BARRAS Y ALTERNATIVAS ====================

    // Buscar en un array de objetos por coincidencia parcial de código (primeros N dígitos)
    function buscarCodigoEnBiblioteca(codigoBase, linea, tipo, biblioteca) {
        if (!biblioteca || biblioteca.length === 0) return null;
        const matches = biblioteca.filter(item => {
            const codigoStr = String(item.CODIGO || '');
            const lineaStr = String(item.LINEA || '').toUpperCase().trim();
            const tipoStr = String(item.TIPO || '').toUpperCase().trim();
            return codigoStr.startsWith(codigoBase) && 
                lineaStr === linea.toUpperCase().trim() && 
                tipoStr === tipo.toUpperCase().trim();
        });
        if (matches.length === 0) return null;
        return matches[0];
    }

    // Formatear talla para código EAN-13 (3 dígitos)
    function formatearTallaParaCodigo(talla) {
        if (!talla) return '000';
        const tallaStr = String(talla).trim();
        const num = parseFloat(tallaStr);
        if (isNaN(num)) return '000';
        if (Number.isInteger(num)) {
            return String(num * 10).padStart(3, '0');
        }
        const partes = tallaStr.split('.');
        if (partes.length === 2 && partes[1] === '5') {
            const entero = parseInt(partes[0]);
            return String(entero * 10 + 5).padStart(3, '0');
        }
        return String(Math.round(num * 10)).padStart(3, '0');
    }

    // Calcular dígito de control EAN-13 para los primeros 12 dígitos
    function calcularDigitoControlEAN13(base12) {
        if (!base12 || base12.length !== 12) return '0';
        const digitos = String(base12).split('').map(Number);
        let sumaImpares = 0;
        let sumaPares = 0;
        for (let i = 0; i < 12; i++) {
            if (i % 2 === 0) {
                sumaImpares += digitos[i];
            } else {
                sumaPares += digitos[i];
            }
        }
        const total = sumaImpares + (sumaPares * 3);
        const resto = total % 10;
        if (resto === 0) return '0';
        return String(10 - resto);
    }

    // Generar código EAN-13 completo a partir de código base + talla + dígito de control
    function generarCodigoEAN13(codigoBase, talla) {
        const base12 = String(codigoBase) + formatearTallaParaCodigo(talla);
        const digitoControl = calcularDigitoControlEAN13(base12);
        return base12 + digitoControl;
    }

    function verificarCodigoEAN13(codigo) {
    if (!codigo || codigo.length !== 13) return false;
    const primeros12 = codigo.slice(0, 12);
    const digitoEsperado = calcularDigitoControlEAN13(primeros12);
    return digitoEsperado === codigo.slice(12);
}

// Parsear entrada de usuario para generación de códigos (formato libre)
    function parsearEntradaCodigo(entrada) {
        if (!entrada || !entrada.trim()) return null;
        const limpio = entrada.trim().replace(/\s+/g, ' ');
        const partes = limpio.split(' ');
        if (partes.length < 4) return null;
        if (!/^\d+$/.test(partes[0])) return null;
        const codigoBase = partes[0];
        if (!/^[A-Za-z]{2,}$/.test(partes[1])) return null;
        const linea = partes[1].toUpperCase();
        if (!/^[A-Za-z]{2,}$/.test(partes[2])) return null;
        const tipo = partes[2].toUpperCase();
        if (!/^(\d+)(\.5)?$/.test(partes[3])) return null;
        const talla = partes[3];
        let cantidad = 1;
        if (partes.length >= 5) {
            const posibleCantidad = parseInt(partes[4]);
            if (!isNaN(posibleCantidad) && posibleCantidad > 0) {
                cantidad = posibleCantidad;
            }
        }
        return { codigoBase, linea, tipo, talla, cantidad };
    }

    // Parsear múltiples líneas de entrada (texto plano o CSV)
    function parsearEntradaCodigoMultiple(texto) {
        if (!texto || !texto.trim()) return [];
        const lines = texto.split(/\r?\n/).filter(l => l.trim() !== '');
        const resultados = [];
        const primeraLinea = lines[0]?.toUpperCase() || '';
        const esCSV = primeraLinea.includes('CODIGO_BASE') || 
                    primeraLinea.includes('CODIGO') ||
                    primeraLinea.includes('LINEA') ||
                    primeraLinea.includes('TIPO') ||
                    primeraLinea.includes('TALLA');

        if (esCSV) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length) {
                    for (const row of parsed.data) {
                        const codigoBase = String(row.CODIGO_BASE || row.CODIGO || '').trim();
                        const linea = String(row.LINEA || '').trim().toUpperCase();
                        const tipo = String(row.TIPO || '').trim().toUpperCase();
                        const talla = String(row.TALLA || '').trim();
                        let cantidad = parseInt(row.CANTIDAD) || 1;
                        if (codigoBase && linea && tipo && talla) {
                            resultados.push({ codigoBase, linea, tipo, talla, cantidad });
                        }
                    }
                    return resultados;
                }
            } catch (e) {
                console.warn('Error parseando CSV, intentando como texto plano');
            }
        }

        // Si no es CSV, parsear como texto plano línea por línea
        for (const line of lines) {
            const parsed = parsearEntradaCodigo(line);
            if (parsed) resultados.push(parsed);
        }
        return resultados;
    }

    function agregarFolioDinamico(containerId) {
        const c = document.getElementById(containerId);
        if (!c) return null;
        const div = document.createElement('div');
        div.className = 'row';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `<b>Nombre:</b> <input type="text" class="folio-name-input" value="ADICIONAL" style="width:120px;"> 
                         <textarea rows="2" style="flex:1;"></textarea>
                         <button class="btn-danger remove-folio"><i class="fas fa-trash"></i></button>
                         <button class="upload-csv-btn"><i class="fas fa-folder-open"></i></button><input type="file" accept=".csv,.txt,text/plain" style="display:none;">`;
        c.appendChild(div);
        const nameInput = div.querySelector('.folio-name-input');
        const upBtn = div.querySelector('.upload-csv-btn'), fileInp = div.querySelector('input[type="file"]'), ta = div.querySelector('textarea');
        upBtn.addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => { ta.value = ev.target.result; fileInp.value = ''; };
            r.readAsText(f);
        });
        const index = c.children.length;
        nameInput.value = `ADICIONAL${index}`;
        return div;
    }

    return {
        normalizarTalla,
        agregarFilaTotal,
        generarNombreFecha,
        parsearTextoUniversal,
        extraerModelosConCantidad,
        setupFileUpload,
        copiarTexto,
        dfToCsv,
        downloadCsv,
        renderTableHtml,
        renderTableToElement,
        escapeHtml,
        agregarFolioDinamico
    };
})();