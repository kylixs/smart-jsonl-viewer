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
    }
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
      title: 'Datei laden',
      feature1: 'Unterstützung für 100MB+ große Dateien mit schnellem Laden',
      feature2: 'Dateien per Drag & Drop öffnen',
      feature3: 'Automatische Erkennung von .jsonl, .ndjson Dateien'
    },
    searchFilter: {
      title: 'Suche & Filter',
      feature1: 'Stichwortsuche: Mehrere durch Leerzeichen getrennte Stichwörter unterstützt',
      feature2: 'Regulärer Ausdruck: Klicken Sie auf .* um Regex-Modus zu aktivieren',
      feature3: 'JSON-Pfad: Verwenden Sie Pfadsyntax wie user.name',
      feature4: 'Typfilter: Nach Zeichenkette, Zahl, Boolean, Objekt, Array filtern'
    },
    smartDecoding: {
      title: 'Intelligente Dekodierung',
      feature1: 'Automatische Dekodierung verschachtelter JSON-Strings',
      feature2: 'URL-Kodierung/-Dekodierung',
      feature3: 'Base64-Kodierung/-Dekodierung',
      feature4: 'Klicken Sie auf das 👁 Symbol neben Feldern, um dekodierte Inhalte anzuzeigen'
    },
    themesSettings: {
      title: 'Themen & Einstellungen',
      feature1: 'Hell/Dunkel-Thema-Umschalter',
      feature2: 'Mehrere Farbschemata (Klicken Sie auf Palettensymbol)',
      feature3: 'Erweitern Sie Tiefe und Einrückung anpassen'
    },
    moreInfo: {
      title: 'Weitere Informationen',
      content: 'Besuchen Sie GitHub Wiki für detaillierte Dokumentation'
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
