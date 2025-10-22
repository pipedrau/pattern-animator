/**
 * preset-manager.js
 * Gestión de presets y randomización de configuraciones
 */
const PresetManager = (() => {
  const STORAGE_KEY = 'pattern-animator-presets-v1';
  const COMPACT_KEY = 'pattern-animator-compact-mode';

  const DEFAULT_PRESETS = [
    {
      id: 'default-aurora-trails',
      name: 'Aurora Trails',
      data: () => ({
        canvasWidth: Config.canvasWidth,
        canvasHeight: Config.canvasHeight,
        cantidadParticulas: 280,
        tamanoParticula: 6,
        velocidadMaxima: 3,
        turbulencia: 25,
        patronInicial: 'Ondas',
        modoMovimiento: 'Movimiento Espiral',
        mostrarRastro: true,
        trailLength: 32,
        trailFinalSize: 0.05,
        formaParticula: 'Círculo',
        rotacionParticula: 0,
        desenfoque: 22,
        ruidoGrafico: 12,
        pixeladoActivo: false,
        bloomActivo: true,
        bloomIntensidad: 45,
        bloomUmbral: 42,
        gradienteFondo: false,
        colorFondo: '#04030f',
        paletaColores: [
          { r: 83, g: 119, b: 255, a: 255 },
          { r: 22, g: 9, b: 76, a: 255 },
          { r: 73, g: 157, b: 255, a: 255 },
          { r: 163, g: 255, b: 233, a: 255 },
          { r: 255, g: 226, b: 182, a: 255 },
          { r: 83, g: 119, b: 255, a: 160 },
          { r: 22, g: 9, b: 76, a: 180 },
          { r: 73, g: 157, b: 255, a: 150 },
          { r: 163, g: 255, b: 233, a: 120 },
          { r: 255, g: 226, b: 182, a: 110 }
        ]
      })
    },
    {
      id: 'default-neon-grid',
      name: 'Neon Grid',
      data: () => ({
        canvasWidth: Config.canvasWidth,
        canvasHeight: Config.canvasHeight,
        cantidadParticulas: 180,
        tamanoParticula: 10,
        velocidadMaxima: 4,
        turbulencia: 10,
        patronInicial: 'Cuadrícula',
        modoMovimiento: 'Movimiento Lissajous',
        mostrarRastro: false,
        trailLength: 20,
        trailFinalSize: 0.1,
        formaParticula: 'Hexágono',
        rotacionParticula: 0,
        desenfoque: 8,
        ruidoGrafico: 0,
        pixeladoActivo: true,
        pixeladoTamano: 6,
        bloomActivo: true,
        bloomIntensidad: 55,
        bloomUmbral: 35,
        gradienteFondo: false,
        colorFondo: '#020208',
        paletaColores: [
          { r: 0, g: 255, b: 199, a: 255 },
          { r: 0, g: 120, b: 255, a: 255 },
          { r: 255, g: 0, b: 245, a: 255 },
          { r: 255, g: 134, b: 0, a: 255 },
          { r: 246, g: 255, b: 0, a: 255 },
          { r: 0, g: 255, b: 199, a: 180 },
          { r: 0, g: 120, b: 255, a: 180 },
          { r: 255, g: 0, b: 245, a: 180 },
          { r: 255, g: 134, b: 0, a: 160 },
          { r: 246, g: 255, b: 0, a: 140 }
        ]
      })
    },
    {
      id: 'default-dusk-field',
      name: 'Dusk Field',
      data: () => ({
        canvasWidth: Config.canvasWidth,
        canvasHeight: Config.canvasHeight,
        cantidadParticulas: 220,
        tamanoParticula: 7,
        velocidadMaxima: 2,
        turbulencia: 35,
        patronInicial: 'Centro',
        modoMovimiento: 'Movimiento Rosa Polar',
        mostrarRastro: true,
        trailLength: 48,
        trailFinalSize: 0.02,
        formaParticula: 'Curva',
        rotacionParticula: 0,
        desenfoque: 40,
        ruidoGrafico: 6,
        pixeladoActivo: false,
        bloomActivo: true,
        bloomIntensidad: 65,
        bloomUmbral: 60,
        gradienteFondo: true,
        fondoColor1: '#090320',
        fondoColor2: '#22082f',
        colorFondo: '#090320',
        paletaColores: [
          { r: 255, g: 112, b: 67, a: 255 },
          { r: 255, g: 202, b: 58, a: 255 },
          { r: 124, g: 77, b: 255, a: 255 },
          { r: 53, g: 38, b: 89, a: 255 },
          { r: 188, g: 71, b: 255, a: 255 },
          { r: 255, g: 112, b: 67, a: 170 },
          { r: 255, g: 202, b: 58, a: 150 },
          { r: 124, g: 77, b: 255, a: 150 },
          { r: 53, g: 38, b: 89, a: 140 },
          { r: 188, g: 71, b: 255, a: 130 }
        ]
      })
    }
  ];

  const getLocalStorage = () => {
    try {
      return window.localStorage;
    } catch (error) {
      console.warn('PresetManager: localStorage no disponible', error);
      return null;
    }
  };

  const serializeConfig = () => {
    const data = {};
    for (const key in Config) {
      if (!Object.prototype.hasOwnProperty.call(Config, key)) continue;
      const value = Config[key];
      if (typeof value === 'function') continue;
      if (key === 'paletaColores') continue;
      try {
        data[key] = JSON.parse(JSON.stringify(value));
      } catch (error) {
        data[key] = value;
      }
    }

    data.paletaColores = Config.paletaColores.map(col => {
      if (!col) return { r: 0, g: 0, b: 0, a: 255 };
      if (typeof col === 'string') {
        const c = color(col);
        return { r: red(c), g: green(c), b: blue(c), a: alpha(c) };
      }
      if (typeof col === 'object' && 'levels' in col) {
        const [r, g, b, a] = col.levels;
        return { r, g, b, a };
      }
      if (typeof col === 'object' && 'r' in col) {
        return {
          r: col.r,
          g: col.g,
          b: col.b,
          a: col.a ?? 255
        };
      }
      return { r: 0, g: 0, b: 0, a: 255 };
    });

    return data;
  };

  const hydrateConfig = (data) => {
    if (!data) return;

    for (const key in data) {
      if (key === 'paletaColores') continue;
      if (Object.prototype.hasOwnProperty.call(Config, key)) {
        Config[key] = data[key];
      }
    }

    if (Array.isArray(data.paletaColores)) {
      Config.paletaColores = data.paletaColores.map(col => {
        if (!col) return color(0, 0, 0);
        if (typeof col === 'string') return color(col);
        const r = col.r ?? 0;
        const g = col.g ?? 0;
        const b = col.b ?? 0;
        const a = col.a ?? 255;
        return color(r, g, b, a);
      });
      window.paletaColores = Config.paletaColores;
    }
  };

  const loadCustomPresets = () => {
    const storage = getLocalStorage();
    if (!storage) return [];

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.warn('PresetManager: no se pudieron parsear los presets', error);
      return [];
    }
  };

  const saveCustomPresets = (presets) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.warn('PresetManager: no se pudieron guardar los presets', error);
    }
  };

  const listPresets = () => {
    const custom = loadCustomPresets();
    const defaults = DEFAULT_PRESETS.map(preset => ({
      id: preset.id,
      name: preset.name,
      data: preset.data(),
      source: 'default'
    }));

    const enrichedCustom = custom.map(preset => ({
      ...preset,
      source: 'custom'
    }));

    return [...defaults, ...enrichedCustom];
  };

  const savePreset = (name) => {
    const trimmedName = name?.trim();
    if (!trimmedName) return null;

    const preset = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      data: serializeConfig()
    };

    const custom = loadCustomPresets();
    custom.push(preset);
    saveCustomPresets(custom);

    return preset;
  };

  const deletePreset = (id) => {
    const custom = loadCustomPresets();
    const filtered = custom.filter(preset => preset.id !== id);
    saveCustomPresets(filtered);
    return filtered.length !== custom.length;
  };

  const applyPreset = (id) => {
    const presets = listPresets();
    const preset = presets.find(item => item.id === id);
    if (!preset) return null;

    hydrateConfig(preset.data);
    return preset;
  };

  const randomizeAll = () => {
    Config.patronInicial = random(Config.patronesDisponibles);
    Config.modoMovimiento = random(Config.modosDisponibles);

    Config.cantidadParticulas = Math.floor(random(80, 380));
    Config.tamanoParticula = Math.floor(random(3, 16));
    Config.velocidadMaxima = Math.floor(random(1, 12));
    Config.turbulencia = Math.floor(random(0, 60));

    Config.mostrarRastro = random([true, false]);
    Config.trailLength = Math.floor(random(10, 60));
    Config.trailFinalSize = random(0.02, 0.2);

    Config.formaParticula = random(Config.formasDisponibles);
    Config.rotacionParticula = Math.floor(random(0, 360));

    Config.desenfoque = Math.floor(random(0, 60));
    Config.ruidoGrafico = Math.floor(random(0, 30));
    Config.pixeladoActivo = random([true, false]);
    Config.pixeladoTamano = Config.pixeladoActivo ? Math.floor(random(2, 12)) : Config.pixeladoTamano;
    Config.bloomActivo = random([true, false]);
    Config.bloomIntensidad = Config.bloomActivo ? Math.floor(random(20, 80)) : 0;
    Config.bloomUmbral = Math.floor(random(20, 60));

    Config.gradienteFondo = random([true, false]);
    if (Config.gradienteFondo) {
      const color1 = color(random(0, 80), random(0, 80), random(0, 80));
      const color2 = color(random(80, 255), random(80, 255), random(80, 255));
      Config.fondoColor1 = `#${hex(red(color1), 2)}${hex(green(color1), 2)}${hex(blue(color1), 2)}`;
      Config.fondoColor2 = `#${hex(red(color2), 2)}${hex(green(color2), 2)}${hex(blue(color2), 2)}`;
    }

    const fondo = color(random(0, 20), random(0, 20), random(0, 40));
    Config.colorFondo = `#${hex(red(fondo), 2)}${hex(green(fondo), 2)}${hex(blue(fondo), 2)}`;

    Config.paletaColores = Array.from({ length: 10 }, () => {
      const c = color(random(30, 255), random(30, 255), random(30, 255), random(120, 255));
      return color(red(c), green(c), blue(c), alpha(c));
    });

    window.paletaColores = Config.paletaColores;
    return serializeConfig();
  };

  const persistCompactMode = (value) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(COMPACT_KEY, value ? '1' : '0');
    } catch (error) {
      console.warn('PresetManager: no se pudo guardar el modo compacto', error);
    }
  };

  const loadCompactMode = () => {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
      const value = storage.getItem(COMPACT_KEY);
      if (value === null) return null;
      return value === '1';
    } catch (error) {
      console.warn('PresetManager: no se pudo leer el modo compacto', error);
      return null;
    }
  };

  return {
    listar: listPresets,
    guardar: savePreset,
    eliminar: deletePreset,
    aplicar: applyPreset,
    randomizeAll,
    persistCompactMode,
    loadCompactMode,
    serializeConfig,
    hydrateConfig
  };
})();
