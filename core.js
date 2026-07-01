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

    // ==================== PARSEADORES DE FORMATOS ====================
    
    // NUEVA FUNCIÓN: parsear códigos EAN-13/14 desde texto
    function parsearEANs(texto, biblioteca) {
        if (!texto || !texto.trim()) return [];
        if (!biblioteca || biblioteca.length === 0) return [];
        
        // Extraer todos los números de 13 o 14 dígitos
        const patron = /\b(\d{13,14})\b/g;
        const codigos = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            codigos.push(match[1]);
        }
        if (codigos.length === 0) return [];
        
        // Decodificar y agrupar
        const mapa = new Map();
        for (const codigo of codigos) {
            let codigoParaDecodificar = codigo;
            // Si es de 14 dígitos y termina en 0, quitar el 0 (autoservicio)
            if (codigo.length === 14 && codigo.endsWith('0')) {
                codigoParaDecodificar = codigo.slice(0, 13);
            }
            const decodificado = decodificarCodigoEAN13(codigoParaDecodificar, biblioteca);
            if (decodificado) {
                const clave = `${decodificado.modelo}|${decodificado.linea}|${decodificado.tipo}|${decodificado.talla}`;
                if (mapa.has(clave)) {
                    mapa.get(clave).CANTIDAD += 1;
                } else {
                    mapa.set(clave, {
                        MODELO: decodificado.modelo,
                        LINEA: decodificado.linea,
                        TIPO: decodificado.tipo,
                        TALLA: decodificado.talla,
                        CANTIDAD: 1
                    });
                }
            }
        }
        return Array.from(mapa.values());
    }

    // ==================== PARSEADOR UNIVERSAL (MEJORADO) ====================
    function parsearTextoUniversal(texto) {
        if (!texto.trim()) return [];
        
        // 1. Intentar con EAN-13/14
        const biblioteca = obtenerBiblioteca();
        if (biblioteca && biblioteca.length > 0) {
            const eanItems = parsearEANs(texto, biblioteca);
            if (eanItems.length > 0) {
                // Ordenar por modelo
                eanItems.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                return agregarFilaTotal(eanItems);
            }
        }
        
        // 2. Si no, intentar con formato de tabs (Formato 1/2)
        if (texto.includes('\t')) return parsearFormatoTabs(texto);
        
        // 3. CSV con cabecera
        if (texto.includes('MODELO') && texto.includes(',')) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data.length) {
                    const items = parsed.data.filter(r => {
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
                    if (items.length) {
                        items.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                        return agregarFilaTotal(items);
                    }
                }
            } catch (e) { }
        }
        
        // 4. Fallback: intentar extraer modelos con cantidad
        const extraidos = extraerModelosConCantidad(texto);
        if (extraidos.length) return agregarFilaTotal(extraidos);
        
        return [];
    }

    // ==================== FORMATO TABS (DETECCIÓN SIMPLE) ====================
    function parsearFormatoTabs(texto) {
        const esFormato2 = texto.includes('Si') || texto.includes('No');
        return esFormato2 ? parsearFormato2(texto) : parsearFormato1(texto);
    }

    // ==================== FORMATO 1 (ORIGINAL, FUNCIONA CORRECTAMENTE) ====================
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

    // ==================== FORMATO 2 (ORIGINAL) ====================
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

    // ==================== EXTRAER MODELOS CON CANTIDAD (MEJORADO) ====================
    function extraerModelosConCantidad(texto) {
        if (!texto.trim()) return [];
        
        // 1. Intentar EAN-13/14
        const biblioteca = obtenerBiblioteca();
        if (biblioteca && biblioteca.length > 0) {
            const eanItems = parsearEANs(texto, biblioteca);
            if (eanItems.length > 0) {
                eanItems.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                return eanItems;
            }
        }
        
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

    // ==================== FUNCIONES PARA CÓDIGOS EAN-13 ====================
    
    let extraSizes = {};
    let codeLibrary = [];
    let pantsSizes = {};
    let beltSizes = {};
    let tallaMode = 'normal'; // 'normal', 'pantalon', 'cinto'

    function cargarExtraSizesDesdeCSV(texto) {
        if (!texto || !texto.trim()) { extraSizes = {}; return false; }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                const map = {};
                for (const row of parsed.data) {
                    const nombre = String(row.NOMBRE || '').trim().toUpperCase();
                    const codigo = String(row.CODIGO || '').trim();
                    if (nombre && codigo) {
                        map[nombre] = codigo;
                    }
                }
                extraSizes = map;
                window.extraSizes = extraSizes;
                return true;
            }
        } catch (e) { console.error('Error cargando extraSizes:', e); }
        return false;
    }

    function cargarExtraSizesDesdeRoot() {
        return fetch('extraSizes.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró extraSizes.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarExtraSizesDesdeCSV(texto);
                console.log(`Tallas especiales cargadas: ${Object.keys(extraSizes).length} registros`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar extraSizes.csv:', err.message);
                return false;
            });
    }

    function obtenerExtraSizes() { return extraSizes; }

    function cargarBibliotecaDesdeCSV(texto) {
        if (!texto || !texto.trim()) { codeLibrary = []; return false; }
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
                codeLibrary = items;
                window.codeLibrary = codeLibrary;
                return true;
            }
        } catch (e) { console.error('Error cargando biblioteca:', e); }
        return false;
    }

    function cargarBibliotecaDesdeRoot() {
        return fetch('codeLibrary.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró codeLibrary.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarBibliotecaDesdeCSV(texto);
                console.log(`Biblioteca cargada: ${codeLibrary.length} registros`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar codeLibrary.csv:', err.message);
                return false;
            });
    }

    function obtenerBiblioteca() { return codeLibrary; }

    function cargarPantsSizesDesdeCSV(texto) {
        if (!texto || !texto.trim()) { pantsSizes = {}; return false; }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                const map = {};
                for (const row of parsed.data) {
                    const nombre = String(row.NOMBRE || '').trim();
                    const codigo = String(row.CODIGO || '').trim();
                    if (nombre && codigo) {
                        map[nombre] = codigo;
                    }
                }
                pantsSizes = map;
                window.pantsSizes = pantsSizes;
                return true;
            }
        } catch (e) { console.error('Error cargando pantsSizes:', e); }
        return false;
    }

    function cargarBeltSizesDesdeCSV(texto) {
        if (!texto || !texto.trim()) { beltSizes = {}; return false; }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                const map = {};
                for (const row of parsed.data) {
                    const nombre = String(row.NOMBRE || '').trim();
                    const codigo = String(row.CODIGO || '').trim();
                    if (nombre && codigo) {
                        map[nombre] = codigo;
                    }
                }
                beltSizes = map;
                window.beltSizes = beltSizes;
                return true;
            }
        } catch (e) { console.error('Error cargando beltSizes:', e); }
        return false;
    }

    function cargarPantsSizesDesdeRoot() {
        return fetch('pantsSizes.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró pantsSizes.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarPantsSizesDesdeCSV(texto);
                console.log(`Tallas de pantalón cargadas: ${Object.keys(pantsSizes).length} registros`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar pantsSizes.csv:', err.message);
                return false;
            });
    }

    function cargarBeltSizesDesdeRoot() {
        return fetch('beltSizes.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró beltSizes.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarBeltSizesDesdeCSV(texto);
                console.log(`Tallas de cinto cargadas: ${Object.keys(beltSizes).length} registros`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar beltSizes.csv:', err.message);
                return false;
            });
    }

    function obtenerPantsSizes() { return pantsSizes; }
    function obtenerBeltSizes() { return beltSizes; }
    function setTallaMode(mode) { tallaMode = mode; }
    function getTallaMode() { return tallaMode; }

    function obtenerCodigoTallaEspecial(talla, tipo) {
        if (!talla && talla !== 0) return '000';
        const tallaStr = String(talla).trim().toUpperCase();
        
        const extra = obtenerExtraSizes();
        if (extra[tallaStr]) return extra[tallaStr];
        
        if (tipo === 'pantalon') {
            const pants = obtenerPantsSizes();
            if (pants[tallaStr]) return pants[tallaStr];
        } else if (tipo === 'cinto') {
            const belt = obtenerBeltSizes();
            if (belt[tallaStr]) return belt[tallaStr];
        }
        const num = parseFloat(tallaStr);
        if (isNaN(num)) return '000';
        if (Number.isInteger(num) && num >= 0) {
            return String(num * 10).padStart(3, '0');
        }
        const partes = tallaStr.split('.');
        if (partes.length === 2 && partes[1] === '5') {
            const entero = parseInt(partes[0]);
            return String(entero * 10 + 5).padStart(3, '0');
        }
        return '000';
    }

    function buscarCodigoPrioritario(modelo, linea, tipo, biblioteca) {
        if (!biblioteca || biblioteca.length === 0) return null;
        const modeloStr = String(modelo).trim();
        const lineaStr = String(linea || '').toUpperCase().trim();
        const tipoStr = String(tipo || '').toUpperCase().trim();
        
        if (lineaStr && tipoStr) {
            const exact = biblioteca.find(item => {
                const m = String(item.MODELO).trim();
                const l = String(item.LINEA || '').toUpperCase().trim();
                const t = String(item.TIPO || '').toUpperCase().trim();
                return m === modeloStr && l === lineaStr && t === tipoStr;
            });
            if (exact) return { ...exact, matchType: 'exacto' };
        }
        
        if (lineaStr) {
            const matchLinea = biblioteca.find(item => {
                const m = String(item.MODELO).trim();
                const l = String(item.LINEA || '').toUpperCase().trim();
                return m === modeloStr && l === lineaStr;
            });
            if (matchLinea) return { ...matchLinea, matchType: 'modelo+linea' };
        }
        
        const matchModelo = biblioteca.find(item => String(item.MODELO).trim() === modeloStr);
        if (matchModelo) return { ...matchModelo, matchType: 'modelo' };
        
        return null;
    }

    function formatearTallaParaCodigo(talla) {
        const mode = getTallaMode();
        return obtenerCodigoTallaEspecial(talla, mode);
    }

    function calcularDigitoControlEAN13(base12) {
        if (!base12 || base12.length !== 12) return '0';
        const digitos = String(base12).split('').map(Number);
        let sumaImpares = 0, sumaPares = 0;
        for (let i = 0; i < 12; i++) {
            if (i % 2 === 0) sumaImpares += digitos[i];
            else sumaPares += digitos[i];
        }
        const total = sumaImpares + (sumaPares * 3);
        const resto = total % 10;
        if (resto === 0) return '0';
        return String(10 - resto);
    }

    function generarCodigoEAN13(codigo9, talla) {
        const codigoStr = String(codigo9).trim().padStart(9, '0');
        const tallaFormateada = formatearTallaParaCodigo(talla);
        const base12 = codigoStr + tallaFormateada;
        const digitoControl = calcularDigitoControlEAN13(base12);
        return base12 + digitoControl;
    }

    function verificarCodigoEAN13(codigo) {
        if (!codigo || codigo.length !== 13) return false;
        const primeros12 = codigo.slice(0, 12);
        const digitoEsperado = calcularDigitoControlEAN13(primeros12);
        return digitoEsperado === codigo.slice(12);
    }

    function decodificarCodigoEAN13(codigo, biblioteca) {
        if (!codigo || codigo.length !== 13) return null;
        const codigo9 = codigo.slice(0, 9);
        const tallaCode = codigo.slice(9, 12);
        const digitoControl = codigo.slice(12);
        if (!biblioteca || biblioteca.length === 0) return null;
        const found = biblioteca.find(item => String(item.CODIGO).trim().padStart(9, '0') === codigo9);
        if (!found) return null;
        const tallaNum = parseInt(tallaCode);
        let talla = '';
        if (tallaNum % 10 === 5) talla = String(tallaNum / 10);
        else talla = String(tallaNum / 10);
        return {
            codigoCompleto: codigo,
            codigo9: codigo9,
            modelo: found.MODELO,
            linea: found.LINEA,
            tipo: found.TIPO,
            talla: talla,
            digitoControl: digitoControl,
            valido: verificarCodigoEAN13(codigo)
        };
    }

    function parsearEntradaCodigo(entrada) {
        if (!entrada || !entrada.trim()) return null;
        const limpio = entrada.trim().replace(/\s+/g, ' ');
        const partes = limpio.split(' ');
        if (partes.length < 4) return null;
        const modelo = partes[0];
        if (!/^\d+$/.test(modelo)) return null;
        if (!/^[A-Za-z0-9]{2,}$/.test(partes[1])) return null;
        const linea = partes[1].toUpperCase();
        if (!/^[A-Za-z0-9]{2,}$/.test(partes[2])) return null;
        const tipo = partes[2].toUpperCase();
        const talla = partes[3];
        if (!talla) return null;
        let cantidad = 1;
        if (partes.length >= 5) {
            const posibleCantidad = parseInt(partes[4]);
            if (!isNaN(posibleCantidad) && posibleCantidad > 0) {
                cantidad = posibleCantidad;
            }
        }
        return { modelo, linea, tipo, talla, cantidad };
    }

    function parsearEntradaCodigoMultiple(texto) {
        if (!texto || !texto.trim()) return [];
        const lines = texto.split(/\r?\n/).filter(l => l.trim() !== '');
        const resultados = [];
        const primeraLinea = lines[0]?.toUpperCase() || '';
        const esCSV = primeraLinea.includes('MODELO') || primeraLinea.includes('CODIGO_BASE') || 
                      primeraLinea.includes('CODIGO') || primeraLinea.includes('LINEA') ||
                      primeraLinea.includes('TIPO') || primeraLinea.includes('TALLA');
        if (esCSV && lines.length > 1) {
            try {
                const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length) {
                    for (const row of parsed.data) {
                        const modelo = String(row.MODELO || row.CODIGO_BASE || row.CODIGO || '').trim();
                        const linea = String(row.LINEA || '').trim().toUpperCase();
                        const tipo = String(row.TIPO || '').trim().toUpperCase();
                        const talla = String(row.TALLA || '').trim();
                        let cantidad = parseInt(row.CANTIDAD) || 1;
                        if (modelo && linea && tipo && talla) {
                            resultados.push({ modelo, linea, tipo, talla, cantidad });
                        }
                    }
                    return resultados;
                }
            } catch (e) { console.warn('Error parseando CSV'); }
        }
        for (const line of lines) {
            const parsed = parsearEntradaCodigo(line);
            if (parsed) resultados.push(parsed);
        }
        return resultados;
    }

    function parsearEntradaCodigoInteligente(texto) {
        if (!texto || !texto.trim()) return [];
        let partes = [];
        const lineas = texto.split(/\r?\n/);
        for (const linea of lineas) {
            if (!linea.trim()) continue;
            const porComas = linea.split(',').map(s => s.trim()).filter(s => s);
            for (const item of porComas) {
                if (!item) continue;
                const porTabs = item.split('\t').map(s => s.trim()).filter(s => s);
                for (const sub of porTabs) {
                    if (sub) partes.push(sub);
                }
            }
        }
        if (partes.length === 0) partes = [texto.trim()];
        const resultados = [];
        for (const parte of partes) {
            const items = parsearEntradaCodigoMultiple(parte);
            if (items.length > 0) {
                resultados.push(...items);
                continue;
            }
            const patron = /(\d{4,5})([A-Z0-9]{2,4})([A-Z0-9]{2,4})([A-Z0-9.]+)(\d+)?/gi;
            let match, encontrado = false;
            while ((match = patron.exec(parte)) !== null) {
                encontrado = true;
                const modelo = match[1];
                const linea = match[2].toUpperCase();
                const tipo = match[3].toUpperCase();
                const talla = match[4];
                const cantidad = match[5] ? parseInt(match[5]) : 1;
                resultados.push({ modelo, linea, tipo, talla, cantidad });
            }
            if (!encontrado) {
                const basicItems = parsearEntradaCodigo(parte);
                if (basicItems) resultados.push(basicItems);
            }
        }
        return resultados;
    }

    function parsearEntradaEAN13(texto, biblioteca) {
        if (!texto || !texto.trim()) return [];
        if (!biblioteca || biblioteca.length === 0) return [];
        const lines = texto.split(/\r?\n/).filter(l => l.trim() !== '');
        const resultados = [];
        const patronEAN13 = /\b(\d{13})\b/g;
        for (const line of lines) {
            let codigos = [];
            let match;
            while ((match = patronEAN13.exec(line)) !== null) {
                codigos.push(match[1]);
            }
            if (codigos.length > 0) {
                for (const codigo of codigos) {
                    const decodificado = decodificarCodigoEAN13(codigo, biblioteca);
                    if (decodificado) {
                        let cantidad = 1;
                        const resto = line.replace(codigo, '').trim();
                        const nums = resto.match(/\d+/g);
                        if (nums && nums.length > 0) {
                            const posibleCantidad = parseInt(nums[0]);
                            if (!isNaN(posibleCantidad) && posibleCantidad > 0) {
                                cantidad = posibleCantidad;
                            }
                        }
                        resultados.push({
                            modelo: decodificado.modelo,
                            linea: decodificado.linea,
                            tipo: decodificado.tipo,
                            talla: decodificado.talla,
                            cantidad: cantidad,
                            decodificado: decodificado
                        });
                    }
                }
            } else {
                const items = parsearEntradaCodigoMultiple(line);
                if (items.length > 0) {
                    for (const item of items) {
                        resultados.push({
                            modelo: item.modelo,
                            linea: item.linea || '',
                            tipo: item.tipo || '',
                            talla: item.talla || '',
                            cantidad: item.cantidad || 1,
                            decodificado: null
                        });
                    }
                }
            }
        }
        return resultados;
    }

    function parsearEntradaUniversal(texto) {
        if (!texto || !texto.trim()) return [];
        const parsed = parsearTextoUniversal(texto);
        if (parsed && parsed.length > 0) {
            return parsed.map(item => ({
                modelo: item.MODELO,
                linea: item.LINEA || '',
                tipo: item.TIPO || '',
                talla: item.TALLA || '',
                cantidad: item.CANTIDAD || 1
            }));
        }
        const resultadoInteligente = parsearEntradaCodigoInteligente(texto);
        if (resultadoInteligente.length > 0) return resultadoInteligente;
        return parsearEntradaCodigoMultiple(texto);
    }

    // ==================== FUNCIONES PARA GENERAR AHK ====================
    function generarAHKDesdeCodigos(codigos, titulo = '') {
        if (!codigos || codigos.length === 0) return null;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigos.length} códigos\n\n`;
        ahk += '^q::\n';
        ahk += '    codigos := [' + codigos.map(c => `"${c}"`).join(', ') + ']\n';
        ahk += '    for index, codigo in codigos\n';
        ahk += '    {\n';
        ahk += '        if GetKeyState("Shift") && GetKeyState("Esc")\n';
        ahk += '            break\n';
        ahk += '        SendInput %codigo%{Enter}\n';
        ahk += '    }\n';
        ahk += '    SoundBeep\n';
        ahk += 'Return\n\n';
        ahk += '+Esc::ExitApp';
        return ahk;
    }

    function generarAHKDesdeCodigosConCantidad(codigosConCantidad, titulo = '') {
        if (!codigosConCantidad || codigosConCantidad.length === 0) return null;
        let codigosExpandidos = [];
        for (const item of codigosConCantidad) {
            const cant = item.cantidad || 1;
            const codigo = item.codigo || item.codigoFinal || item;
            if (typeof codigo === 'string') {
                for (let i = 0; i < cant; i++) {
                    codigosExpandidos.push(codigo);
                }
            }
        }
        return generarAHKDesdeCodigos(codigosExpandidos, titulo);
    }

    // ==================== Helpers UI ====================
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

    // ==================== EXPORTAR ====================
    return {
        normalizarTalla,
        agregarFilaTotal,
        generarNombreFecha,
        parsearTextoUniversal,
        parsearFormato1,
        parsearFormato2,
        extraerModelosConCantidad,
        setupFileUpload,
        copiarTexto,
        dfToCsv,
        downloadCsv,
        renderTableHtml,
        renderTableToElement,
        escapeHtml,
        agregarFolioDinamico,
        // EAN-13 y búsqueda
        parsearEANs, // EXPORTADA
        buscarCodigoPrioritario,
        formatearTallaParaCodigo,
        calcularDigitoControlEAN13,
        generarCodigoEAN13,
        verificarCodigoEAN13,
        decodificarCodigoEAN13,
        parsearEntradaCodigo,
        parsearEntradaCodigoMultiple,
        parsearEntradaCodigoInteligente,
        parsearEntradaEAN13,
        parsearEntradaUniversal,
        generarAHKDesdeCodigos,
        generarAHKDesdeCodigosConCantidad,
        cargarExtraSizesDesdeCSV,
        cargarExtraSizesDesdeRoot,
        obtenerExtraSizes,
        cargarBibliotecaDesdeCSV,
        cargarBibliotecaDesdeRoot,
        obtenerBiblioteca,
        cargarPantsSizesDesdeCSV,
        cargarBeltSizesDesdeCSV,
        cargarPantsSizesDesdeRoot,
        cargarBeltSizesDesdeRoot,
        obtenerPantsSizes,
        obtenerBeltSizes,
        setTallaMode,
        getTallaMode,
        obtenerCodigoTallaEspecial
    };
})();

// ==================== INICIALIZACIÓN SILENCIOSA ====================
if (typeof window.core !== 'undefined' && window.core.cargarBibliotecaDesdeRoot) {
    if (document.readyState === 'complete') {
        window.core.cargarBibliotecaDesdeRoot();
        window.core.cargarExtraSizesDesdeRoot();
        window.core.cargarPantsSizesDesdeRoot();
        window.core.cargarBeltSizesDesdeRoot();
    } else {
        window.addEventListener('load', function() {
            window.core.cargarBibliotecaDesdeRoot();
            window.core.cargarExtraSizesDesdeRoot();
            window.core.cargarPantsSizesDesdeRoot();
            window.core.cargarBeltSizesDesdeRoot();
        });
    }
}