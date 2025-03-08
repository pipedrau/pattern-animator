# Pattern Animator

Un entorno interactivo para crear animaciones basadas en patrones, partículas y efectos visuales utilizando p5.js.

## Características

- **Sistema de Partículas**: Crea y manipula partículas con diferentes comportamientos y apariencias.
- **Efectos Visuales**: Aplica efectos como kaleidoscopio, pixelado, desenfoque y ruido gráfico.
- **Patrones de Movimiento**: Elige entre diferentes patrones de movimiento como flujo de campo, espiral, circular, etc.
- **Personalización Completa**: Controla colores, formas, tamaños, velocidades y más.
- **Importación de SVG**: Carga archivos SVG y conviértelos en animaciones de partículas.
- **Exportación de Animaciones**: Graba y exporta tus creaciones en diferentes formatos.
- **Interfaz Intuitiva**: Panel de control completo con todas las opciones disponibles.

## Estructura del Proyecto

El proyecto está organizado en módulos para facilitar el mantenimiento y la extensibilidad:

```
Pattern Animator/
├── js/
│   ├── core/           # Núcleo del sistema de partículas
│   │   ├── Config.js   # Configuración global
│   │   ├── Particula.js # Clase Particula
│   │   └── ParticleSystem.js # Sistema de partículas
│   ├── effects/        # Efectos visuales
│   │   └── VisualEffects.js # Efectos como kaleidoscopio, ruido, etc.
│   ├── ui/             # Interfaz de usuario
│   │   ├── Controls.js # Creación de controles
│   │   └── ControlHandlers.js # Manejadores de eventos
│   ├── utils/          # Utilidades
│   │   ├── Export.js   # Exportación de animaciones
│   │   ├── SVGImport.js # Importación de SVG
│   │   └── Shapes.js   # Funciones para dibujar formas
│   └── main.js         # Archivo principal
├── Index.html          # Página HTML principal
├── Styles.css          # Estilos CSS
└── README.md           # Documentación
```

## Cómo Empezar

1. Abre el archivo `Index.html` en tu navegador.
2. Utiliza el panel de control para ajustar los parámetros de la animación.
3. Experimenta con diferentes combinaciones de efectos y movimientos.
4. Presiona 'S' para guardar una imagen, 'H' para ocultar/mostrar controles, 'F' para pantalla completa.

## Nuevas Funcionalidades

### Importación de SVG

Puedes cargar archivos SVG y convertirlos en animaciones de partículas:

1. Haz clic en "Examinar" en la sección "Importar SVG".
2. Selecciona un archivo SVG de tu computadora.
3. Las partículas se reorganizarán para formar la imagen SVG.
4. Puedes aplicar diferentes efectos y movimientos a las partículas.

### Exportación de Animaciones

Graba y exporta tus animaciones:

1. Ajusta la duración y los FPS en la sección "Grabación".
2. Haz clic en "Iniciar Grabación".
3. Espera a que termine la grabación.
4. Selecciona el formato de exportación y la calidad.
5. Haz clic en "Exportar" para descargar tu animación.

## Requisitos

- Navegador web moderno con soporte para JavaScript y HTML5 Canvas.
- Para la exportación de GIF y secuencias PNG, se requieren bibliotecas adicionales (gif.js y JSZip).

## Personalización Avanzada

Para añadir nuevos efectos o comportamientos, puedes modificar los siguientes archivos:

- `js/core/Particula.js`: Para añadir nuevos comportamientos de partículas.
- `js/effects/VisualEffects.js`: Para añadir nuevos efectos visuales.
- `js/utils/Export.js`: Para añadir nuevos formatos de exportación.

## Licencia

Este proyecto está disponible como código abierto bajo la licencia MIT. 