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
    }
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
      title: 'Carga de archivos',
      feature1: 'Soporte para archivos grandes de 100MB+ con carga rápida',
      feature2: 'Arrastra y suelta archivos para abrir',
      feature3: 'Detección automática de archivos .jsonl, .ndjson'
    },
    searchFilter: {
      title: 'Búsqueda y filtrado',
      feature1: 'Búsqueda por palabras clave: Soporta múltiples palabras clave separadas por espacios',
      feature2: 'Expresión regular: Haz clic en .* para activar el modo regex',
      feature3: 'Ruta JSON: Usa sintaxis de ruta como user.name',
      feature4: 'Filtro de tipo: Filtrar por cadena, número, booleano, objeto, array'
    },
    smartDecoding: {
      title: 'Decodificación inteligente',
      feature1: 'Decodificación automática de cadenas JSON anidadas',
      feature2: 'Codificación/decodificación URL',
      feature3: 'Codificación/decodificación Base64',
      feature4: 'Haz clic en el icono 👁 junto a los campos para ver el contenido decodificado'
    },
    themesSettings: {
      title: 'Temas y configuración',
      feature1: 'Alternancia entre tema claro y oscuro',
      feature2: 'Múltiples esquemas de color (haz clic en el icono de paleta)',
      feature3: 'Personalizar profundidad de expansión y sangría'
    },
    moreInfo: {
      title: 'Más información',
      content: 'Visita GitHub Wiki para documentación detallada'
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
