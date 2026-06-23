// ==================== CORE: funciones universales ====================
window.core = (function() {
    // Normalización de tallas (incluye ½)
    function normalizarTalla(t) {
        if (!t) return '';
        return t.replace(/½/g, '.5').replace(/\.0$/, '');
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

    // Parseador universal (para textos con tallas, usado en diferencias, etc.)
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

    // parsearFormato1 CORREGIDO: soporta tallas con letras y números
    function parsearFormato1(entrada) {
        const fantasma = "1 RS TX\t\t\t\t13\t\t\t\t\t\t\t\n";
        const completo = fantasma + entrada;
        const lines = completo.trim().split('\n');
        const data = lines.map(l => l.split('\t'));
        const maxCols = Math.max(...data.map(r => r.length));
        const norm = data.map(r => [...r, ...Array(maxCols - r.length).fill('')]);
        let tallas = {};
        const resultados = [];

        // Función auxiliar para detectar si un valor es una talla (numérica o letras)
        function esTalla(valor) {
            if (!valor) return false;
            const v = valor.trim();
            // Números con o sin .5, o con ½
            if (/^\d+(\.5|½)?$/.test(v)) return true;
            // Letras mayúsculas/minúsculas con posibles / (ej: I/MT, G/EG)
            if (/^[A-Za-z][A-Za-z0-9\/]*$/.test(v) && v.length >= 1 && v.length <= 6) return true;
            return false;
        }

        for (let i = 0; i < norm.length; i++) {
            const fila = norm[i];
            const primera = (fila[0] || '').trim();

            // Si la primera celda está vacía o es un número (como talla) -> es línea de tallas
            if (primera === '' || /^\d+$/.test(primera) || esTalla(primera)) {
                tallas = {};
                for (let j = 1; j < fila.length; j++) {
                    const v = (fila[j] || '').trim();
                    if (v && esTalla(v)) {
                        let t = normalizarTalla(v);
                        if (t) tallas[j] = t;
                    }
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
                        if (!isNaN(c) && c > 0) {
                            resultados.push({ MODELO: mod, LINEA: lin, TIPO: tip, TALLA: tallas[j], CANTIDAD: c });
                        }
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

    // ==================== FUNCIÓN CORREGIDA: extraerModelosConCantidad ====================
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

    // ==================== FUNCIONES PARA CÓDIGOS DE BARRAS Y ALTERNATIVAS ====================
    
    let extraSizes = {};

    function cargarExtraSizesDesdeCSV(texto) {
        if (!texto || !texto.trim()) {
            extraSizes = {};
            return false;
        }
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
        } catch (e) {
            console.error('Error cargando extraSizes:', e);
        }
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

    function obtenerExtraSizes() {
        return extraSizes;
    }

    function buscarCodigoEnBiblioteca(modelo, linea, tipo, biblioteca) {
        if (!biblioteca || biblioteca.length === 0) return null;
        const modeloStr = String(modelo).trim();
        const lineaStr = String(linea || '').toUpperCase().trim();
        const tipoStr = String(tipo || '').toUpperCase().trim();
        
        if (lineaStr && tipoStr) {
            const matches = biblioteca.filter(item => {
                const modeloItem = String(item.MODELO || '').trim();
                const lineaItem = String(item.LINEA || '').toUpperCase().trim();
                const tipoItem = String(item.TIPO || '').toUpperCase().trim();
                return modeloItem === modeloStr && lineaItem === lineaStr && tipoItem === tipoStr;
            });
            if (matches.length === 1) return matches[0];
            if (matches.length > 1) return matches[0];
        }
        
        const matches = biblioteca.filter(item => String(item.MODELO || '').trim() === modeloStr);
        if (matches.length === 1) return matches[0];
        if (matches.length > 1 && lineaStr && tipoStr) {
            const exact = matches.find(item => 
                String(item.LINEA || '').toUpperCase().trim() === lineaStr && 
                String(item.TIPO || '').toUpperCase().trim() === tipoStr
            );
            if (exact) return exact;
        }
        if (matches.length > 0) return matches[0];
        return null;
    }

    // Formatear talla para código EAN-13 (3 dígitos) - con soporte para tallas especiales
    function formatearTallaParaCodigo(talla) {
        if (!talla && talla !== 0) return '000';
        const tallaStr = String(talla).trim().toUpperCase();
        const extraSizesData = obtenerExtraSizes();
        if (extraSizesData[tallaStr]) {
            return extraSizesData[tallaStr];
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
        return String(Math.round(num * 10)).padStart(3, '0');
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

    function parsearEntradaCodigo(entrada) {
        if (!entrada || !entrada.trim()) return null;
        const limpio = entrada.trim().replace(/\s+/g, ' ');
        const partes = limpio.split(' ');
        if (partes.length < 4) return null;
        const modelo = partes[0];
        if (!/^\d+$/.test(modelo)) return null;
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

    // Parsear formato de tabla con código (CORREGIDO)
    function parsearFormatoTablaConCodigo(texto) {
        if (!texto || !texto.trim()) return [];
        const resultados = [];
        const lines = texto.split(/\r?\n/);
        
        for (const line of lines) {
            if (!line.trim()) continue;
            
            // Dividir por tabs o espacios (múltiples)
            let partes = line.split('\t').filter(p => p.trim() !== '');
            if (partes.length < 6) {
                partes = line.split(/\s+/).filter(p => p.trim() !== '');
            }
            if (partes.length < 6) continue;
            
            partes = partes.map(p => p.trim());
            
            // Formato: MODELO, COLOR, TIPO, TALLA, CANTIDAD, ... (precios, etc.) ..., CODIGO (9 dígitos)
            const modelo = partes[0].trim();
            // partes[1] es el color (se ignora)
            const tipo = partes[2].trim().toUpperCase();
            const talla = partes[3].trim();
            const cantidad = parseInt(partes[4]) || 1;
            
            let codigo = null;
            // Buscar en todas las partes restantes (a partir del índice 5)
            for (let i = 5; i < partes.length; i++) {
                const p = partes[i].trim();
                if (/^\d{9}$/.test(p)) {
                    codigo = p;
                    break;
                }
            }
            
            // Si no se encontró código, intentar buscar en la biblioteca por modelo y tipo
            if (!codigo) {
                const lib = obtenerBiblioteca();
                if (lib && lib.length > 0) {
                    const encontrado = lib.find(item => 
                        String(item.MODELO).trim() === modelo && 
                        String(item.TIPO).trim().toUpperCase() === tipo
                    );
                    if (encontrado) codigo = encontrado.CODIGO;
                }
            }
            
            resultados.push({
                modelo: modelo,
                linea: '',  // Se buscará en la biblioteca usando el código
                tipo: tipo,
                talla: talla,
                cantidad: cantidad,
                codigoEncontrado: codigo || null
            });
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
                            codigoEncontrado: decodificado.codigo9,
                            codigoEAN13: codigo,
                            decodificado: decodificado
                        });
                    } else {
                        resultados.push({
                            modelo: codigo.slice(0, 5),
                            linea: '',
                            tipo: '',
                            talla: '',
                            cantidad: 1,
                            codigoEncontrado: null,
                            codigoEAN13: codigo,
                            decodificado: null
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
                            codigoEncontrado: null,
                            codigoEAN13: null,
                            decodificado: null
                        });
                    }
                }
            }
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
            const patron = /(\d{4,5})([A-Z]{2,4})([A-Z]{2,4})([A-Z0-9.]+)(\d+)?/gi;
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

    // Parser universal mejorado - detecta formato de tallas primero
    function parsearEntradaUniversal(texto) {
        if (!texto || !texto.trim()) return [];
        
        // 1. DETECTAR CÓDIGOS EAN-13 PRIMERO
        const biblioteca = obtenerBiblioteca();
        if (biblioteca && biblioteca.length > 0 && /\b\d{13}\b/.test(texto)) {
            const resultadoEAN13 = parsearEntradaEAN13(texto, biblioteca);
            if (resultadoEAN13.length > 0) {
                return resultadoEAN13;
            }
        }
        
        // 2. DETECTAR FORMATO DE TALLAS
        const lines = texto.split(/\r?\n/).filter(l => l.trim() !== '');
        let tieneTallas = false;
        let tieneModelos = false;
        // Función para detectar tallas (numéricas o letras)
        function esTalla(valor) {
            if (!valor) return false;
            const v = valor.trim();
            if (/^\d+(\.5|½)?$/.test(v)) return true;
            if (/^[A-Za-z][A-Za-z0-9\/]*$/.test(v) && v.length >= 1 && v.length <= 6) return true;
            return false;
        }
        for (const line of lines) {
            const trimmed = line.trim();
            // Línea de tallas: comienza con tab o tiene tallas separadas por tabs
            if (trimmed.match(/^\t/) || trimmed.split('\t').some(t => esTalla(t))) {
                tieneTallas = true;
            }
            // Línea de modelo: tiene modelo de 4-5 dígitos al inicio
            if (trimmed.match(/^\d{4,5}\s+[A-Z]{2,}\s+[A-Z]{2,}/)) {
                tieneModelos = true;
            }
        }
        if (tieneTallas && tieneModelos) {
            const resultado = parsearTextoUniversal(texto);
            if (resultado && resultado.length > 0) {
                return resultado;
            }
        }
        
        // 3. FORMATO DE TABLA CON CÓDIGO
        const resultadoTabla = parsearFormatoTablaConCodigo(texto);
        if (resultadoTabla.length > 0) {
            if (lines.length > 0) {
                const tabCount = (lines[0].match(/\t/g) || []).length;
                if (tabCount >= 5) {
                    return resultadoTabla;
                }
                const spaceParts = lines[0].split(/\s+/).filter(p => p.trim() !== '');
                if (spaceParts.length >= 8) {
                    return resultadoTabla;
                }
            }
        }
        
        // 4. PARSER INTELIGENTE
        const resultadoInteligente = parsearEntradaCodigoInteligente(texto);
        if (resultadoInteligente.length > 0) {
            return resultadoInteligente;
        }
        
        // 5. PARSER ESTÁNDAR
        const resultadoEstandar = parsearEntradaCodigoMultiple(texto);
        if (resultadoEstandar.length > 0) {
            return resultadoEstandar;
        }
        
        // 6. FALLBACK
        const resultadoFallback = parsearTextoUniversal(texto);
        if (resultadoFallback && resultadoFallback.length > 0) {
            return resultadoFallback;
        }
        
        return [];
    }

    // ==================== FUNCIONES PARA GENERAR AHK ====================
    function generarAHKDesdeCodigos(codigos, titulo = '') {
        if (!codigos || codigos.length === 0) return null;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        ahk += `; Total: ${codigos.length} códigos\n\n`;
        ahk += '^q::\n';
        ahk += '    Loop, % ' + codigos.length + ' {\n';
        for (const c of codigos) {
            ahk += `        Send, ${c}{Enter}\n`;
        }
        ahk += '    }\n';
        ahk += '    return\n\n';
        ahk += '+Esc::\n';
        ahk += '    Send, {Esc}\n';
        ahk += '    return';
        return ahk;
    }

    function generarAHKDesdeCodigosConCantidad(codigosConCantidad, titulo = '') {
        if (!codigosConCantidad || codigosConCantidad.length === 0) return null;
        let ahk = '#SingleInstance Force\n\n';
        if (titulo) ahk += `; ${titulo}\n`;
        let total = 0;
        for (const item of codigosConCantidad) {
            total += item.cantidad || 1;
        }
        ahk += `; Total: ${total} envíos\n\n`;
        ahk += 'abort := false\n\n';
        ahk += '^q::\n';
        ahk += '    abort := false\n';
        ahk += '    Loop, % ' + codigosConCantidad.length + ' {\n';
        ahk += '        if abort\n';
        ahk += '            break\n';
        for (const item of codigosConCantidad) {
            const cant = item.cantidad || 1;
            const codigo = item.codigo || item.codigoFinal || item;
            if (typeof codigo === 'string') {
                for (let i = 0; i < cant; i++) {
                    ahk += `        Send, ${codigo}{Enter}\n`;
                }
            }
        }
        ahk += '    }\n';
        ahk += '    return\n\n';
        ahk += '+Esc::\n';
        ahk += '    abort := true\n';
        ahk += '    Send, {Esc}\n';
        ahk += '    return';
        return ahk;
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

    // ==================== CARGAR BIBLIOTECA ====================
    let codeLibrary = [];

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

    // ==================== EXPORTAR ====================
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
        agregarFolioDinamico,
        buscarCodigoEnBiblioteca,
        formatearTallaParaCodigo,
        calcularDigitoControlEAN13,
        generarCodigoEAN13,
        verificarCodigoEAN13,
        parsearEntradaCodigo,
        parsearEntradaCodigoMultiple,
        decodificarCodigoEAN13,
        parsearFormatoTablaConCodigo,
        parsearEntradaEAN13,
        parsearEntradaCodigoInteligente,
        parsearEntradaUniversal,
        cargarExtraSizesDesdeCSV,
        cargarExtraSizesDesdeRoot,
        obtenerExtraSizes,
        generarAHKDesdeCodigos,
        generarAHKDesdeCodigosConCantidad,
        cargarBibliotecaDesdeCSV,
        cargarBibliotecaDesdeRoot,
        obtenerBiblioteca
    };
})();

// ==================== INICIALIZACIÓN SILENCIOSA ====================
if (typeof window.core !== 'undefined' && window.core.cargarBibliotecaDesdeRoot) {
    if (document.readyState === 'complete') {
        window.core.cargarBibliotecaDesdeRoot();
        window.core.cargarExtraSizesDesdeRoot();
    } else {
        window.addEventListener('load', function() {
            window.core.cargarBibliotecaDesdeRoot();
            window.core.cargarExtraSizesDesdeRoot();
        });
    }
}