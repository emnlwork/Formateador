// ==================== CORE: funciones universales ====================
window.coreVersion = '3.9c';

window.core = (function() {

    // ==================== CONFIGURACIÓN WIX ====================
    const WIX_BASE_URL = 'https://emanuelcontructora.wixsite.com/jajajeje/_functions';
    window.WIX_BASE_URL = WIX_BASE_URL;

    // Normalización de tallas
    function normalizarTalla(t) {
        if (!t) return '';
        let talla = t.replace(/½/g, '.5').replace(/\.0$/, '');
        const extraSizes = obtenerExtraSizes();
        if (extraSizes[talla]) {
            return talla;
        }
        return talla;
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
    function parsearEANs(texto, biblioteca) {
        if (!texto || !texto.trim()) return [];
        if (!biblioteca || biblioteca.length === 0) return [];
        const patron = /\b(\d{13,14})\b/g;
        const codigos = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            codigos.push(match[1]);
        }
        if (codigos.length === 0) return [];
        const mapa = new Map();
        for (const codigo of codigos) {
            let codigoParaDecodificar = codigo;
            if (codigo.length === 14) {
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

    function parsearTextoUniversal(texto) {
        if (!texto.trim()) return [];
        const biblioteca = obtenerBiblioteca();
        if (biblioteca && biblioteca.length > 0) {
            const eanItems = parsearEANs(texto, biblioteca);
            if (eanItems.length > 0) {
                eanItems.sort((a, b) => (parseInt(a.MODELO) || 0) - (parseInt(b.MODELO) || 0));
                return agregarFilaTotal(eanItems);
            }
        }
        if (texto.includes('\t')) return parsearFormatoTabs(texto);
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
        const extraidos = extraerModelosConCantidad(texto);
        if (extraidos.length) return agregarFilaTotal(extraidos);
        return [];
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

    // ==================== EXTRAER MODELOS CON CANTIDAD ====================
    function extraerModelosConCantidad(texto) {
        if (!texto.trim()) return [];
        const biblioteca = obtenerBiblioteca();
        if (biblioteca && biblioteca.length > 0) {
            const eanItems = parsearEANsConOrden(texto, biblioteca);
            if (eanItems.length > 0) {
                return eanItems;
            }
        }
        const extraSizes = obtenerExtraSizes();
        function normalizarTallaConExtra(talla) {
            if (!talla) return '';
            const tallaStr = String(talla).trim().toUpperCase();
            if (extraSizes[tallaStr]) return tallaStr;
            return tallaStr;
        }
        function esTalla(token) {
            if (!token) return false;
            const upper = token.toUpperCase();
            if (/^\d+(\.5)?$/.test(token)) return true;
            if (extraSizes[upper]) return true;
            if (/^[A-Z]{1,4}$/.test(upper)) return true;
            if (/^\d+[A-Z]$/.test(upper)) return true;
            if (/^\d+[.;,]\d+$/.test(token)) return true;
            return false;
        }
        let cleanText = texto.replace(/^\uFEFF/, '');
        const primerasLineas = cleanText.slice(0, 500).toUpperCase();
        const esCsv = primerasLineas.includes('MODELO') && (primerasLineas.includes('LINEA') || primerasLineas.includes('TIPO'));
        if (esCsv) {
            try {
                const parsed = Papa.parse(cleanText, { header: true, skipEmptyLines: true, dynamicTyping: false, transformHeader: h => h.trim().toUpperCase() });
                if (parsed.data && parsed.data.length) {
                    const acumulador = new Map();
                    const ordenClaves = [];
                    for (const row of parsed.data) {
                        const modelo = (row.MODELO || '').trim();
                        const linea = (row.LINEA || row.COLOR || '').trim().toUpperCase();
                        const tipo = (row.TIPO || row.MATERIAL || '').trim().toUpperCase();
                        const talla = (row.TALLA || '').trim();
                        if (!modelo || !linea || !tipo) continue;
                        if (modelo === '1' && linea === 'RS' && tipo === 'TX') continue;
                        let cantidad = parseFloat(row.CANTIDAD);
                        if (isNaN(cantidad)) cantidad = 1;
                        if (cantidad === 0) continue;
                        const tallaNorm = normalizarTallaConExtra(talla);
                        const key = `${modelo}|${linea}|${tipo}|${tallaNorm}`;
                        if (!acumulador.has(key)) ordenClaves.push(key);
                        acumulador.set(key, (acumulador.get(key) || 0) + cantidad);
                    }
                    if (acumulador.size > 0) {
                        const result = [];
                        for (const key of ordenClaves) {
                            const [modelo, linea, tipo, talla] = key.split('|');
                            result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla || '', CANTIDAD: acumulador.get(key) });
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
                const ordenClaves = [];
                for (let i = 1; i < norm.length; i++) {
                    const fila = norm[i];
                    const primeraCelda = (fila[0] || '').trim();
                    if (!primeraCelda) continue;
                    const partes = primeraCelda.split(/\s+/);
                    if (partes.length < 3) continue;
                    const modelo = partes[0];
                    const linea = partes[1].toUpperCase();
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
                        const key = `${modelo}|${linea}|${tipo}|`;
                        if (!acumulador.has(key)) ordenClaves.push(key);
                        acumulador.set(key, (acumulador.get(key) || 0) + suma);
                    }
                }
                if (acumulador.size > 0) {
                    const result = [];
                    for (const key of ordenClaves) {
                        const [modelo, linea, tipo, talla] = key.split('|');
                        result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla || '', CANTIDAD: acumulador.get(key) });
                    }
                    return result;
                }
            }
        }
        const cantidadMap = new Map();
        const ordenClaves = [];
        for (let rawLine of lines) {
            let linea = rawLine.trim();
            if (!linea) continue;
            let modelo = '', lineaVal = '', tipoVal = '', talla = '';
            let cantidad = 1;
            if (linea.includes('\t')) {
                const parts = linea.split('\t');
                const partesFiltradas = parts.filter(p => p.trim() !== '');
                if (partesFiltradas.length >= 4) {
                    modelo = partesFiltradas[0].trim();
                    lineaVal = partesFiltradas[1].trim().toUpperCase();
                    tipoVal = partesFiltradas[2].trim().toUpperCase();
                    talla = partesFiltradas[3].trim();
                    if (partesFiltradas.length >= 5 && /^\d+$/.test(partesFiltradas[4].trim())) {
                        cantidad = parseInt(partesFiltradas[4].trim()) || 1;
                    } else {
                        cantidad = 1;
                    }
                } else if (partesFiltradas.length === 3) {
                    modelo = partesFiltradas[0].trim();
                    lineaVal = partesFiltradas[1].trim().toUpperCase();
                    tipoVal = partesFiltradas[2].trim().toUpperCase();
                    talla = '';
                    cantidad = 1;
                } else {
                    const firstField = parts[0].trim();
                    const tokens = firstField.split(/\s+/);
                    if (tokens.length >= 3) {
                        modelo = tokens[0];
                        lineaVal = tokens[1].toUpperCase();
                        tipoVal = tokens.slice(2).join(' ').toUpperCase();
                        for (let k = 1; k < parts.length; k++) {
                            const val = parts[k].trim();
                            if (val && !talla && esTalla(val)) {
                                talla = val;
                            } else if (val && /^\d+$/.test(val) && !talla) {
                                talla = val;
                            } else if (val && /^\d+$/.test(val)) {
                                cantidad = parseInt(val) || 1;
                            }
                        }
                    } else {
                        continue;
                    }
                }
            } else {
                const tokens = linea.split(/\s+/);
                if (tokens.length < 3) continue;
                modelo = tokens[0];
                lineaVal = tokens[1].toUpperCase();
                if (tokens.length === 3) {
                    tipoVal = tokens[2].toUpperCase();
                    talla = '';
                    cantidad = 1;
                } else if (tokens.length === 4) {
                    tipoVal = tokens[2].toUpperCase();
                    talla = tokens[3];
                    cantidad = 1;
                } else if (tokens.length === 5) {
                    tipoVal = tokens[2].toUpperCase();
                    talla = tokens[3];
                    cantidad = parseInt(tokens[4]) || 1;
                } else {
                    let idxTalla = -1;
                    for (let i = 3; i < tokens.length; i++) {
                        if (esTalla(tokens[i])) {
                            idxTalla = i;
                            break;
                        }
                    }
                    if (idxTalla !== -1) {
                        tipoVal = tokens.slice(2, idxTalla).join(' ').toUpperCase();
                        talla = tokens[idxTalla];
                        if (idxTalla + 1 < tokens.length && /^\d+$/.test(tokens[idxTalla + 1])) {
                            cantidad = parseInt(tokens[idxTalla + 1]);
                        }
                    } else {
                        tipoVal = tokens.slice(2).join(' ').toUpperCase();
                        const ultimo = tokens[tokens.length - 1];
                        if (/^\d+$/.test(ultimo)) {
                            cantidad = parseInt(ultimo);
                            tipoVal = tokens.slice(2, tokens.length - 1).join(' ').toUpperCase();
                        }
                    }
                }
            }
            if (modelo === '1' && lineaVal === 'RS' && tipoVal === 'TX') continue;
            if (/^\d+$/.test(modelo) && lineaVal && lineaVal.length >= 1 && tipoVal && tipoVal.length >= 1) {
                const tallaFinal = talla || '';
                const tallaNorm = normalizarTallaConExtra(tallaFinal);
                const key = `${modelo}|${lineaVal}|${tipoVal}|${tallaNorm}`;
                if (!cantidadMap.has(key)) ordenClaves.push(key);
                cantidadMap.set(key, (cantidadMap.get(key) || 0) + cantidad);
            }
        }
        const result = [];
        for (const key of ordenClaves) {
            const [modelo, linea, tipo, talla] = key.split('|');
            result.push({ MODELO: modelo, LINEA: linea, TIPO: tipo, TALLA: talla || '', CANTIDAD: cantidadMap.get(key) });
        }
        return result;
    }

    // ==================== FUNCIONES PARA CÓDIGOS EAN-13 ====================
    let extraSizes = {};
    let codeLibrary = [];
    let pantsSizes = {};
    let beltSizes = {};
    let modelosEspeciales = {};
    let mapeoTallasEspeciales = {};
    let tallaMode = 'normal';

    // --- Funciones de carga desde WIX ---
    async function cargarDesdeWix(endpoint, mapFunction) {
        try {
            const response = await fetch(`${WIX_BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return mapFunction(data);
        } catch (err) {
            console.warn(`Error cargando ${endpoint}:`, err.message);
            return false;
        }
    }

    function cargarExtraSizesDesdeWix() {
        return cargarDesdeWix('extraSizes', (data) => {
            const map = {};
            data.forEach(item => {
                const nombre = String(item.nombre || '').toUpperCase();
                const codigo = String(item.codigo || '').trim();
                if (nombre && codigo) {
                    map[nombre] = codigo;
                }
            });
            extraSizes = map;
            window.extraSizes = map;
            return true;
        });
    }

    function cargarPantsSizesDesdeWix() {
        return cargarDesdeWix('pantsSizes', (data) => {
            const map = {};
            data.forEach(item => {
                const nombre = String(item.nombre || '').toUpperCase();
                const codigo = String(item.codigo || '').trim();
                if (nombre && codigo) {
                    map[nombre] = codigo;
                }
            });
            pantsSizes = map;
            window.pantsSizes = map;
            return true;
        });
    }

    function cargarBeltSizesDesdeWix() {
        return cargarDesdeWix('beltSizes', (data) => {
            const map = {};
            data.forEach(item => {
                const nombre = String(item.nombre || '').toUpperCase();
                const codigo = String(item.codigo || '').trim();
                if (nombre && codigo) {
                    map[nombre] = codigo;
                }
            });
            beltSizes = map;
            window.beltSizes = map;
            return true;
        });
    }

    function cargarModelosEspecialesDesdeWix() {
        return cargarDesdeWix('modelosEspeciales', (data) => {
            const map = {};
            data.forEach(item => {
                const modelo = String(item.modelo || '').trim();
                const codigoEntero = String(item.codigo_entero || '').trim();
                const codigoHalf = String(item.codigo_half || '').trim();
                if (modelo && codigoEntero && codigoHalf) {
                    map[modelo] = {
                        entero: codigoEntero,
                        half: codigoHalf
                    };
                }
            });
            modelosEspeciales = map;
            window.modelosEspeciales = map;
            return true;
        });
    }

    function cargarMapeoTallasEspecialesDesdeWix() {
        return cargarDesdeWix('mapeoTallasEspeciales', (data) => {
            const map = {};
            data.forEach(item => {
                const modelo = String(item.modelo || '').trim();
                const talla = String(item.talla_original || '').trim();
                const codigo = String(item.codigo_talla || '').trim();
                if (modelo && talla && codigo) {
                    if (!map[modelo]) map[modelo] = {};
                    map[modelo][talla] = codigo;
                }
            });
            mapeoTallasEspeciales = map;
            window.mapeoTallasEspeciales = map;
            return true;
        });
    }

    // --- Funciones de carga local (respaldo) ---
    function cargarModelosEspecialesDesdeCSV(texto) {
        if (!texto || !texto.trim()) { modelosEspeciales = {}; return false; }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                const map = {};
                for (const row of parsed.data) {
                    const modelo = String(row.MODELO || '').trim();
                    const codigoEntero = String(row.CODIGO_ENTERO || '').trim();
                    const codigoHalf = String(row.CODIGO_HALF || '').trim();
                    if (modelo && codigoEntero && codigoHalf) {
                        map[modelo] = {
                            entero: codigoEntero,
                            half: codigoHalf
                        };
                    }
                }
                modelosEspeciales = map;
                window.modelosEspeciales = modelosEspeciales;
                return true;
            }
        } catch (e) { console.error('Error cargando modelos especiales:', e); }
        return false;
    }

    function cargarModelosEspecialesDesdeRoot() {
        return fetch('modelosEspeciales.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró modelosEspeciales.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarModelosEspecialesDesdeCSV(texto);
                console.log(`Modelos especiales cargados: ${Object.keys(modelosEspeciales).length} registros`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar modelosEspeciales.csv:', err.message);
                return false;
            });
    }

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

    function cargarMapeoTallasEspecialesDesdeCSV(texto) {
        if (!texto || !texto.trim()) { mapeoTallasEspeciales = {}; return false; }
        try {
            const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length) {
                const map = {};
                for (const row of parsed.data) {
                    const modelo = String(row.MODELO || '').trim();
                    const tallaOriginal = String(row.TALLA_ORIGINAL || '').trim();
                    const codigoTalla = String(row.CODIGO_TALLA || '').trim();
                    if (modelo && tallaOriginal && codigoTalla) {
                        if (!map[modelo]) map[modelo] = {};
                        map[modelo][tallaOriginal] = codigoTalla;
                    }
                }
                mapeoTallasEspeciales = map;
                window.mapeoTallasEspeciales = mapeoTallasEspeciales;
                return true;
            }
        } catch (e) { console.error('Error cargando mapeo de tallas especiales:', e); }
        return false;
    }

    function cargarMapeoTallasEspecialesDesdeRoot() {
        return fetch('mapeoTallasEspeciales.csv')
            .then(response => {
                if (!response.ok) throw new Error('No se encontró mapeoTallasEspeciales.csv');
                return response.text();
            })
            .then(texto => {
                const result = cargarMapeoTallasEspecialesDesdeCSV(texto);
                console.log(`Mapeo de tallas especiales cargado: ${Object.keys(mapeoTallasEspeciales).length} modelos`);
                return result;
            })
            .catch(err => {
                console.warn('No se pudo cargar mapeoTallasEspeciales.csv:', err.message);
                return false;
            });
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

    // --- Getters ---
    function obtenerExtraSizes() { return extraSizes; }
    function obtenerBiblioteca() { return codeLibrary; }
    function obtenerPantsSizes() { return pantsSizes; }
    function obtenerBeltSizes() { return beltSizes; }
    function obtenerModelosEspeciales() { return modelosEspeciales; }
    function obtenerMapeoTallasEspeciales() { return mapeoTallasEspeciales; }
    function setTallaMode(mode) { tallaMode = mode; }
    function getTallaMode() { return tallaMode; }

    // --- Lógica de tallas especiales ---
    function obtenerCodigoTallaEspecial(talla, tipo, modelo) {
        if (talla === undefined || talla === null || talla === '') return { codigo: '000', categoria: 'normal' };
        const tallaStr = String(talla).trim().toUpperCase();
        const modeloStr = modelo ? String(modelo).trim() : null;

        // 1. MAPEO EXPLÍCITO DE TALLAS POR MODELO (mapeoTallasEspeciales)
        if (modeloStr) {
            const mapeo = obtenerMapeoTallasEspeciales();
            if (mapeo[modeloStr] && mapeo[modeloStr][tallaStr]) {
                return { codigo: mapeo[modeloStr][tallaStr], categoria: 'normal' };
            }
        }

        // 2. MODELOS ESPECIALES (modelosEspeciales)
        if (modeloStr) {
            const modelosEsp = obtenerModelosEspeciales();
            if (modelosEsp[modeloStr]) {
                const config = modelosEsp[modeloStr];
                const num = parseFloat(tallaStr);
                if (!isNaN(num)) {
                    let codigo;
                    if (Number.isInteger(num)) {
                        codigo = String(Math.floor(num) * 10 + parseInt(config.entero)).padStart(3, '0');
                    } else {
                        codigo = String(Math.floor(num) * 10 + parseInt(config.half)).padStart(3, '0');
                    }
                    return { codigo: codigo, categoria: 'normal' };
                }
            }
        }

        // 3. PANTALON SIZES (prioridad sobre calzado si la talla existe como clave)
        const pants = obtenerPantsSizes();
        if (pants[tallaStr]) {
            return { codigo: pants[tallaStr], categoria: 'pantalon' };
        }
        // También probar sin punto (para tallas como "25.0" que se convierten a "25")
        const tallaSinPunto = tallaStr.replace('.', '');
        if (pants[tallaSinPunto]) {
            return { codigo: pants[tallaSinPunto], categoria: 'pantalon' };
        }

        // 4. BELT SIZES (prioridad sobre calzado si la talla existe como clave)
        const belt = obtenerBeltSizes();
        if (belt[tallaStr]) {
            return { codigo: belt[tallaStr], categoria: 'cinto' };
        }
        if (belt[tallaSinPunto]) {
            return { codigo: belt[tallaSinPunto], categoria: 'cinto' };
        }

        // 5. EXTRA SIZES
        const extra = obtenerExtraSizes();
        if (extra[tallaStr]) {
            return { codigo: extra[tallaStr], categoria: 'normal' };
        }

        // 6. CALZADO ESTÁNDAR (solo si talla ≤ 31.5, entero, .0 o .5)
        const num = parseFloat(tallaStr);
        if (!isNaN(num) && num >= 0 && num <= 31.5) {
            let codigo;
            if (Number.isInteger(num)) {
                codigo = String(Math.round(num) * 10).padStart(3, '0');
            } else if (tallaStr.includes('.') && tallaStr.split('.')[1] === '0') {
                const entero = parseInt(tallaStr.split('.')[0]);
                codigo = String(entero * 10).padStart(3, '0');
            } else if (tallaStr.includes('.') && tallaStr.split('.')[1] === '5') {
                const entero = parseInt(tallaStr.split('.')[0]);
                codigo = String(entero * 10 + 5).padStart(3, '0');
            } else {
                return { codigo: '000', categoria: 'normal' };
            }
            if (codigo) {
                return { codigo: codigo, categoria: 'normal' };
            }
        }

        // 7. BUSCAR EN PANTALON SIZES POR VALOR (para códigos como "61.1")
        for (const [nombre, codigo] of Object.entries(pants)) {
            if (codigo === tallaStr || codigo === tallaSinPunto) {
                return { codigo: codigo, categoria: 'pantalon' };
            }
        }

        // 8. BUSCAR EN BELT SIZES POR VALOR
        for (const [nombre, codigo] of Object.entries(belt)) {
            if (codigo === tallaStr || codigo === tallaSinPunto) {
                return { codigo: codigo, categoria: 'cinto' };
            }
        }

        // 9. PASSTHROUGH: cualquier código de 3 dígitos no encontrado
        if (/^\d{3,4}$/.test(tallaStr)) {
            let codigo = tallaStr;
            if (tallaStr.length === 4) {
                codigo = tallaStr.slice(1);
            } else {
                const numCodigo = parseInt(tallaStr);
                if (!isNaN(numCodigo) && numCodigo >= 0) {
                    codigo = String(numCodigo).padStart(3, '0').slice(-3);
                }
            }
            return { codigo: codigo, categoria: 'normal' };
        }

        // 10. FALLBACK
        return { codigo: '000', categoria: 'normal' };
    }

    function formatearTallaParaCodigo(talla, modelo = null) {
        const mode = getTallaMode();
        const resultado = obtenerCodigoTallaEspecial(talla, mode, modelo);
        return resultado.codigo;
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

    function generarCodigoEAN13(codigo9, talla, modelo = null) {
        const codigoStr = String(codigo9).trim().padStart(9, '0');
        const resultado = obtenerCodigoTallaEspecial(talla, getTallaMode(), modelo);
        const tallaFormateada = resultado.codigo;
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
        const modeloStr = String(found.MODELO).trim();
        let talla = '';

        // 1. MAPEO EXPLÍCITO DE TALLAS POR MODELO (REVERSA)
        const mapeo = obtenerMapeoTallasEspeciales();
        if (mapeo[modeloStr]) {
            let tallaEncontrada = null;
            for (const [tallaOriginal, codigo] of Object.entries(mapeo[modeloStr])) {
                if (String(codigo) === String(tallaCode)) {
                    tallaEncontrada = tallaOriginal;
                    break;
                }
            }
            if (tallaEncontrada !== null) {
                return {
                    codigoCompleto: codigo,
                    codigo9: codigo9,
                    modelo: found.MODELO,
                    linea: found.LINEA,
                    tipo: found.TIPO,
                    talla: tallaEncontrada,
                    digitoControl: digitoControl,
                    valido: verificarCodigoEAN13(codigo)
                };
            }
        }

        // 2. MODELOS ESPECIALES (REVERSA)
        const modelosEsp = obtenerModelosEspeciales();
        if (modelosEsp[modeloStr]) {
            const config = modelosEsp[modeloStr];
            const codigoEntero = parseInt(config.entero);
            const codigoHalf = parseInt(config.half);
            const ultimoDigito = tallaNum % 10;

            if (ultimoDigito === codigoEntero) {
                talla = String(Math.floor(tallaNum / 10));
            } else if (ultimoDigito === codigoHalf) {
                talla = String(Math.floor(tallaNum / 10)) + '.5';
            } else {
                if (tallaNum % 10 === 5) talla = String(tallaNum / 10);
                else talla = String(tallaNum / 10);
            }

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

        // 3. EXTRA SIZES (REVERSA)
        const extraSizes = obtenerExtraSizes();
        let tallaEncontradaExtra = null;
        for (const [nombre, codigo] of Object.entries(extraSizes)) {
            if (String(codigo) === String(tallaCode)) {
                tallaEncontradaExtra = nombre;
                break;
            }
        }
        if (tallaEncontradaExtra !== null) {
            return {
                codigoCompleto: codigo,
                codigo9: codigo9,
                modelo: found.MODELO,
                linea: found.LINEA,
                tipo: found.TIPO,
                talla: tallaEncontradaExtra,
                digitoControl: digitoControl,
                valido: verificarCodigoEAN13(codigo)
            };
        }

        // 4. PANTALON SIZES (REVERSA)
        const pants = obtenerPantsSizes();
        let tallaEncontradaPants = null;
        for (const [nombre, codigo] of Object.entries(pants)) {
            if (String(codigo) === String(tallaCode)) {
                tallaEncontradaPants = nombre;
                break;
            }
        }
        if (tallaEncontradaPants !== null) {
            return {
                codigoCompleto: codigo,
                codigo9: codigo9,
                modelo: found.MODELO,
                linea: found.LINEA,
                tipo: found.TIPO,
                talla: tallaEncontradaPants,
                digitoControl: digitoControl,
                valido: verificarCodigoEAN13(codigo)
            };
        }

        // 5. BELT SIZES (REVERSA)
        const belt = obtenerBeltSizes();
        let tallaEncontradaBelt = null;
        for (const [nombre, codigo] of Object.entries(belt)) {
            if (String(codigo) === String(tallaCode)) {
                tallaEncontradaBelt = nombre;
                break;
            }
        }
        if (tallaEncontradaBelt !== null) {
            return {
                codigoCompleto: codigo,
                codigo9: codigo9,
                modelo: found.MODELO,
                linea: found.LINEA,
                tipo: found.TIPO,
                talla: tallaEncontradaBelt,
                digitoControl: digitoControl,
                valido: verificarCodigoEAN13(codigo)
            };
        }

        // 6. LÓGICA ESTÁNDAR
        if (tallaNum % 10 === 5) {
            talla = String(tallaNum / 10);
        } else {
            talla = String(tallaNum / 10);
        }

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

    // ==================== PARSEADORES DE ENTRADA ====================
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

    function parsearEANsConOrden(texto, biblioteca) {
        if (!texto || !texto.trim()) return [];
        if (!biblioteca || biblioteca.length === 0) return [];
        const patron = /\b(\d{13,14})\b/g;
        const codigosEnOrden = [];
        let match;
        while ((match = patron.exec(texto)) !== null) {
            codigosEnOrden.push(match[1]);
        }
        if (codigosEnOrden.length === 0) return [];
        const result = [];
        for (const codigo of codigosEnOrden) {
            let codigoParaDecodificar = codigo;
            if (codigo.length === 14) {
                codigoParaDecodificar = codigo.slice(0, 13);
            }
            const decodificado = decodificarCodigoEAN13(codigoParaDecodificar, biblioteca);
            if (decodificado) {
                result.push({
                    MODELO: decodificado.modelo,
                    LINEA: decodificado.linea,
                    TIPO: decodificado.tipo,
                    TALLA: decodificado.talla,
                    CANTIDAD: 1
                });
            }
        }
        return result;
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
        parsearEANs,
        buscarCodigoPrioritario,
        parsearEANsConOrden,
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
        obtenerExtraSizes,
        obtenerBiblioteca,
        obtenerPantsSizes,
        obtenerBeltSizes,
        obtenerModelosEspeciales,
        obtenerMapeoTallasEspeciales,
        setTallaMode,
        getTallaMode,
        obtenerCodigoTallaEspecial,
        cargarExtraSizesDesdeRoot: cargarExtraSizesDesdeWix,
        cargarPantsSizesDesdeRoot: cargarPantsSizesDesdeWix,
        cargarBeltSizesDesdeRoot: cargarBeltSizesDesdeWix,
        cargarModelosEspecialesDesdeRoot: cargarModelosEspecialesDesdeWix,
        cargarMapeoTallasEspecialesDesdeRoot: cargarMapeoTallasEspecialesDesdeWix,
        cargarBibliotecaDesdeRoot: cargarBibliotecaDesdeRoot,
        cargarExtraSizesDesdeCSV,
        cargarPantsSizesDesdeCSV,
        cargarBeltSizesDesdeCSV,
        cargarModelosEspecialesDesdeCSV,
        cargarMapeoTallasEspecialesDesdeCSV,
        cargarBibliotecaDesdeCSV
    };
})();

// ==================== INICIALIZACIÓN SILENCIOSA ====================
if (typeof window.core !== 'undefined') {
    const cargarDatos = async () => {
        const datasets = [
            { name: 'extraSizes', fn: window.core.cargarExtraSizesDesdeRoot },
            { name: 'pantsSizes', fn: window.core.cargarPantsSizesDesdeRoot },
            { name: 'beltSizes', fn: window.core.cargarBeltSizesDesdeRoot },
            { name: 'modelosEspeciales', fn: window.core.cargarModelosEspecialesDesdeRoot },
            { name: 'mapeoTallasEspeciales', fn: window.core.cargarMapeoTallasEspecialesDesdeRoot }
        ];

        const results = await Promise.allSettled(
            datasets.map(d => d.fn())
        );

        let fallos = 0;
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`⚠️ Fallo al cargar ${datasets[index].name}:`, result.reason);
                fallos++;
            } else {
                console.log(`✅ ${datasets[index].name} cargado correctamente`);
            }
        });

        if (fallos === 0) {
            console.log('✅ Todos los datos desde Wix cargados correctamente');
        } else {
            console.log(`⚠️ Datos desde Wix cargados con ${fallos} fallos`);
        }

        if (window.core.cargarBibliotecaDesdeRoot) {
            await window.core.cargarBibliotecaDesdeRoot();
        }
    };

    if (document.readyState === 'complete') {
        cargarDatos();
    } else {
        window.addEventListener('load', cargarDatos);
    }
}