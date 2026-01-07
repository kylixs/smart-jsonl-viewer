export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: 'Zurück zur Startseite',
    help: 'Hilfe',
    settings: 'Einstellungen',
    export: 'Exportieren',
    github: 'GitHub-Projekt'
  },
  upload: {
    title: 'Datei hierher ziehen',
    subtitle: 'Unterstützt .jsonl, .json, .ndjson Formate',
    button: 'Klicken Sie, um eine Datei auszuwählen',
    or: 'oder',
    paste: 'Drücken Sie Strg+V zum Einfügen'
  },
  search: {
    placeholder: 'Suchbegriffe...',
    mode: {
      fuzzy: 'Unscharfe Übereinstimmung',
      exact: 'Exakte Übereinstimmung',
      regex: 'Regulärer Ausdruck',
      jsonpath: 'JSON-Pfad'
    },
    typeFilter: 'Typfilter',
    types: {
      all: 'Alle',
      string: 'Zeichenkette',
      number: 'Zahl',
      boolean: 'Boolean',
      object: 'Objekt',
      array: 'Array'
    },
    clear: 'Löschen',
    viewHistory: 'Suchverlauf anzeigen',
    history: 'Suchverlauf',
    clearHistory: 'Verlauf löschen',
    delete: 'Löschen',
    filterScope: 'Filterbereich',
    filterByLine: 'Nach Zeile',
    filterByNode: 'Nach Knoten',
    matchMode: 'Übereinstimmungsmodus',
    fuzzy: 'Unscharf',
    fuzzyHint: 'Groß-/Kleinschreibung ignorieren, enthält Übereinstimmung',
    exact: 'Exakt',
    exactHint: 'Groß-/Kleinschreibung ignorieren, vollständige Wortübereinstimmung',
    jsonpathLabel: 'JSONPath',
    jsonpathHint: 'JSONPath-Ausdruck verwenden',
    searchDecoded: 'Dekodierter Inhalt',
    expandDepth: 'Erweiterungstiefe',
    expandAll: 'Alle erweitern',
    collapseAll: 'Alle minimieren',
    expandLevel: '{level} Ebene(n) erweitern',
    jsonpathExamples: 'Beispiele',
    statsDisplay: 'Angezeigt',
    statsOf: '/',
    statsLines: 'Zeilen'
  },
  settings: {
    title: 'Einstellungen',
    close: 'Schließen',
    maxLines: 'Vorschauzeilen',
    indentSize: 'Einrückungsgröße',
    unlimited: 'Unbegrenzt',
    lines: 'Zeilen',
    spaces: 'Leerzeichen'
  },
  theme: {
    toggle: 'Thema wechseln',
    light: 'Zum hellen Thema wechseln',
    dark: 'Zum dunklen Thema wechseln',
    selectColor: 'Themenfarbe auswählen',
    colors: {
      ocean: 'Ozeanblau',
      forest: 'Waldgrün',
      sunset: 'Sonnenuntergangsorange',
      purple: 'Lavendelpurpur',
      ruby: 'Rubinrot'
    }
  },
  help: {
    title: 'Smart JSONL Viewer Hilfe',
    close: 'Schließen',
    fileLoading: {
      title: '📁 Datei laden',
      feature1: 'Schnelles Öffnen von 100MB+ großen Dateien mit Hintergrund-Async-Laden',
      feature2: 'Unterstützung für Drag & Drop, Klick zum Auswählen oder Inhalt einfügen',
      feature3: 'Automatische Erkennung von .jsonl, .json, .ndjson Formaten'
    },
    searchFilter: {
      title: '🔍 Suche & Filter',
      feature1: 'Filterbereich: Nach Zeile / Nach Knoten',
      feature2: 'Übereinstimmungsmodus: Unscharf / Exakt / JSONPath',
      feature3: 'JSONPath Beispiele: $.user.name, $.data[0], $..content',
      feature4: 'Suche in dekodiertem Inhalt',
      feature5: 'Suchverlauf für schnelle wiederholte Abfragen'
    },
    smartDecoding: {
      title: '✨ Intelligente Dekodierung',
      feature1: 'Automatische Dekodierung von Escape-Sequenzen (\\n, \\", \\t usw.)',
      feature2: 'Parsen verschachtelter JSON-Strings',
      feature3: 'JSON/Code-Syntaxhervorhebung, Markdown-Vorschau',
      feature4: 'Klicken Sie auf das 👁 Symbol neben Feldern, um dekodierte Inhalte anzuzeigen'
    },
    themesSettings: {
      title: '🎨 Themen & Einstellungen',
      feature1: 'Schneller Wechsel zwischen hellen/dunklen Themen',
      feature2: '5 Farbschemata: Ozeanblau, Waldgrün, Sonnenuntergangsorange, Lavendelpurpur, Rubinrot',
      feature3: 'Vorschauzeilen und Einrückungsgröße anpassen',
      feature4: 'Flexible Steuerung der Erweiterungstiefe (0-5 Ebenen oder vollständige Erweiterung)'
    },
    moreFeatures: {
      title: '🚀 Weitere Funktionen',
      feature1: 'Exportieren Sie gefilterte Ergebnisse als JSONL- oder JSON-Format',
      feature2: 'Stapelverarbeitung mit "Mehr laden"-Unterstützung',
      feature3: 'Schnelles Scrollen nach oben/unten'
    },
    moreInfo: {
      title: '📖 Weitere Informationen',
      content: 'Besuchen Sie GitHub für detaillierte Dokumentation, Problem melden oder beitragen',
      github: 'GitHub-Projekt'
    }
  },
  loading: {
    title: 'JSONL-Datei wird geladen...',
    subtitle: 'Bitte warten',
    progress: 'Laden...',
    rendering: 'Rendern...'
  },
  result: {
    noResults: 'Keine übereinstimmenden Ergebnisse gefunden',
    hint: 'Versuchen Sie andere Stichwörter oder wechseln Sie den Filtermodus',
    displayed: 'Angezeigt',
    of: '/',
    lines: 'Zeilen',
    loadMore: 'Mehr laden',
    loadMoreCount: 'Zeilen'
  },
  paste: {
    title: 'JSONL-Inhalt einfügen',
    placeholder: 'JSONL-Inhalt hier einfügen...\nEin JSON-Objekt pro Zeile, zum Beispiel:\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: 'Bestätigen',
    cancel: 'Abbrechen'
  },
  drag: {
    title: 'Datei hierher ziehen',
    subtitle: 'Neue Datei wird geladen'
  },
  scroll: {
    toTop: 'Nach oben',
    toBottom: 'Nach unten'
  },
  confirm: {
    goHome: 'Sind Sie sicher, dass Sie zur Startseite zurückkehren möchten? Aktuelle Daten werden gelöscht.'
  },
  error: {
    fileRead: 'Datei lesen fehlgeschlagen: ',
    parse: 'Dateiinhalt kann nicht analysiert werden: ',
    pasteContent: 'Eingefügter Inhalt kann nicht analysiert werden: '
  },
  language: {
    select: 'Sprache auswählen',
    current: 'Aktuelle Sprache'
  }
}
