export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: 'Volver al inicio',
    help: 'Ayuda',
    settings: 'Configuración',
    export: 'Exportar',
    github: 'Proyecto GitHub'
  },
  upload: {
    title: 'Arrastra el archivo aquí',
    subtitle: 'Soporta formatos .jsonl, .json, .ndjson',
    button: 'Haz clic para seleccionar archivo',
    or: 'o',
    paste: 'Presiona Ctrl+V para pegar contenido'
  },
  search: {
    placeholder: 'Buscar palabras clave...',
    mode: {
      fuzzy: 'Coincidencia difusa',
      exact: 'Coincidencia exacta',
      regex: 'Expresión regular',
      jsonpath: 'Ruta JSON'
    },
    typeFilter: 'Filtro de tipo',
    types: {
      all: 'Todos',
      string: 'Cadena',
      number: 'Número',
      boolean: 'Booleano',
      object: 'Objeto',
      array: 'Array'
    },
    clear: 'Limpiar',
    viewHistory: 'Ver historial de búsqueda',
    history: 'Historial de búsqueda',
    clearHistory: 'Borrar historial',
    delete: 'Eliminar',
    filterScope: 'Ámbito del filtro',
    filterByLine: 'Por línea',
    filterByNode: 'Por nodo',
    matchMode: 'Modo de coincidencia',
    fuzzy: 'Difusa',
    fuzzyHint: 'Insensible a mayúsculas, contiene coincidencia',
    exact: 'Exacta',
    exactHint: 'Insensible a mayúsculas, coincidencia de palabra completa',
    jsonpathLabel: 'JSONPath',
    jsonpathHint: 'Usar expresión JSONPath',
    searchDecoded: 'Contenido decodificado',
    expandDepth: 'Profundidad de expansión',
    expandAll: 'Expandir todo',
    collapseAll: 'Contraer todo',
    expandLevel: 'Expandir {level} nivel(es)',
    jsonpathExamples: 'Ejemplos',
    statsDisplay: 'Mostrando',
    statsOf: '/',
    statsLines: 'líneas'
  },
  settings: {
    title: 'Configuración',
    close: 'Cerrar',
    maxLines: 'Líneas de vista previa',
    indentSize: 'Tamaño de sangría',
    unlimited: 'Ilimitado',
    lines: 'líneas',
    spaces: 'espacios'
  },
  theme: {
    toggle: 'Cambiar tema',
    light: 'Cambiar a tema claro',
    dark: 'Cambiar a tema oscuro',
    selectColor: 'Seleccionar color del tema',
    colors: {
      ocean: 'Azul océano',
      forest: 'Verde bosque',
      sunset: 'Naranja atardecer',
      purple: 'Púrpura lavanda',
      ruby: 'Rojo rubí'
    }
  },
  help: {
    title: 'Ayuda de Smart JSONL Viewer',
    close: 'Cerrar',
    fileLoading: {
      title: '📁 Carga de archivos',
      feature1: 'Abra rápidamente archivos grandes de 100MB+ con carga asíncrona en segundo plano',
      feature2: 'Soporte para arrastrar y soltar, hacer clic para seleccionar o pegar contenido',
      feature3: 'Detección automática de formatos .jsonl, .json, .ndjson'
    },
    searchFilter: {
      title: '🔍 Búsqueda y filtrado',
      feature1: 'Alcance del filtro: Por línea / Por nodo',
      feature2: 'Modo de coincidencia: Difusa / Exacta / JSONPath',
      feature3: 'Ejemplos de JSONPath: $.user.name, $.data[0], $..content',
      feature4: 'Buscar en contenido decodificado',
      feature5: 'Historial de búsqueda para consultas repetidas rápidas'
    },
    smartDecoding: {
      title: '✨ Decodificación inteligente',
      feature1: 'Decodificación automática de secuencias de escape (\\n, \\", \\t, etc.)',
      feature2: 'Análisis de cadenas JSON anidadas',
      feature3: 'Resaltado de sintaxis JSON/código, vista previa de Markdown',
      feature4: 'Haz clic en el icono 👁 junto a los campos para ver el contenido decodificado'
    },
    themesSettings: {
      title: '🎨 Temas y configuración',
      feature1: 'Alternancia rápida entre temas claro/oscuro',
      feature2: '5 esquemas de color: Azul océano, Verde bosque, Naranja atardecer, Púrpura lavanda, Rojo rubí',
      feature3: 'Personalizar líneas de vista previa y tamaño de sangría',
      feature4: 'Control flexible de profundidad de expansión (0-5 niveles o expansión completa)'
    },
    moreFeatures: {
      title: '🚀 Más funciones',
      feature1: 'Exportar resultados filtrados en formato JSONL o JSON',
      feature2: 'Carga por lotes con soporte "Cargar más"',
      feature3: 'Desplazamiento rápido hacia arriba/abajo'
    },
    moreInfo: {
      title: '📖 Más información',
      content: 'Visite GitHub para documentación detallada, informar problemas o contribuir',
      github: 'Proyecto GitHub'
    }
  },
  loading: {
    title: 'Cargando archivo JSONL...',
    subtitle: 'Por favor espera',
    progress: 'Cargando...',
    rendering: 'Renderizando...'
  },
  result: {
    noResults: 'No se encontraron resultados coincidentes',
    hint: 'Intenta usar otras palabras clave o cambiar el modo de filtro',
    displayed: 'Mostrado',
    of: '/',
    lines: 'líneas',
    loadMore: 'Cargar más',
    loadMoreCount: 'líneas'
  },
  paste: {
    title: 'Pegar contenido JSONL',
    placeholder: 'Pega el contenido JSONL aquí...\nUn objeto JSON por línea, por ejemplo:\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: 'Enviar',
    cancel: 'Cancelar'
  },
  drag: {
    title: 'Arrastra el archivo aquí',
    subtitle: 'Se cargará un nuevo archivo'
  },
  scroll: {
    toTop: 'Arriba',
    toBottom: 'Abajo'
  },
  confirm: {
    goHome: '¿Estás seguro de que quieres volver al inicio? Los datos actuales se borrarán.'
  },
  error: {
    fileRead: 'Error al leer el archivo: ',
    parse: 'No se puede analizar el contenido del archivo: ',
    pasteContent: 'No se puede analizar el contenido pegado: '
  },
  language: {
    select: 'Seleccionar idioma',
    current: 'Idioma actual'
  }
}
