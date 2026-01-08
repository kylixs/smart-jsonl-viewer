export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: 'Retour à l\'accueil',
    help: 'Aide',
    settings: 'Paramètres',
    export: 'Exporter',
    github: 'Projet GitHub'
  },
  upload: {
    title: 'Glisser-déposer le fichier ici',
    subtitle: 'Supporte les formats .jsonl, .json, .ndjson',
    button: 'Cliquer pour sélectionner un fichier',
    or: 'ou',
    paste: 'Appuyez sur Ctrl+V pour coller le contenu'
  },
  search: {
    placeholder: 'Rechercher des mots-clés...',
    mode: {
      fuzzy: 'Correspondance floue',
      exact: 'Correspondance exacte',
      regex: 'Expression régulière',
      jsonpath: 'Chemin JSON'
    },
    typeFilter: 'Filtre de type',
    types: {
      all: 'Tous',
      string: 'Chaîne',
      number: 'Nombre',
      boolean: 'Booléen',
      object: 'Objet',
      array: 'Tableau'
    },
    clear: 'Effacer',
    viewHistory: 'Voir l\'historique de recherche',
    history: 'Historique de recherche',
    clearHistory: 'Effacer l\'historique',
    delete: 'Supprimer',
    filterScope: 'Portée du filtre',
    filterByLine: 'Par ligne',
    filterByNode: 'Par nœud',
    matchMode: 'Mode de correspondance',
    fuzzy: 'Floue',
    fuzzyHint: 'Insensible à la casse, contient la correspondance',
    exact: 'Exacte',
    exactHint: 'Insensible à la casse, correspondance de mot complet',
    jsonpathLabel: 'JSONPath',
    jsonpathHint: 'Utiliser une expression JSONPath',
    searchDecoded: 'Contenu décodé',
    expandDepth: 'Profondeur d\'expansion',
    expandAll: 'Tout développer',
    collapseAll: 'Tout réduire',
    expandLevel: 'Développer {level} niveau(x)',
    jsonpathExamples: 'Exemples',
    statsDisplay: 'Affichage',
    statsOf: '/',
    statsLines: 'lignes'
  },
  settings: {
    title: 'Paramètres',
    close: 'Fermer',
    language: 'Langue',
    themeColor: 'Couleur du thème',
    themeMode: 'Mode du thème',
    maxLines: 'Lignes d\'aperçu',
    indentSize: 'Taille d\'indentation',
    fontFamily: 'Police',
    fontSize: 'Taille de police',
    unlimited: 'Illimité',
    lines: 'lignes',
    spaces: 'espaces',
    px: 'px'
  },
  theme: {
    toggle: 'Basculer le thème',
    light: 'Passer au thème clair',
    lightMode: 'Clair',
    dark: 'Passer au thème sombre',
    darkMode: 'Sombre',
    selectColor: 'Sélectionner la couleur du thème',
    colors: {
      ocean: 'Bleu océan',
      forest: 'Vert forêt',
      sunset: 'Orange coucher de soleil',
      purple: 'Violet lavande',
      ruby: 'Rouge rubis',
      gray: 'Gris minimaliste'
    }
  },
  help: {
    title: 'Aide Smart JSONL Viewer',
    close: 'Fermer',
    fileLoading: {
      title: '📁 Chargement de fichiers',
      feature1: 'Ouvrez rapidement des fichiers volumineux de 100 Mo+ avec chargement asynchrone en arrière-plan',
      feature2: 'Supporte le glisser-déposer, cliquer pour sélectionner ou coller le contenu',
      feature3: 'Détection automatique des formats .jsonl, .json, .ndjson'
    },
    searchFilter: {
      title: '🔍 Recherche et filtrage',
      feature1: 'Portée du filtre : Par ligne / Par nœud',
      feature2: 'Mode de correspondance : Floue / Exacte / JSONPath',
      feature3: 'Exemples JSONPath : $.user.name, $.data[0], $..content',
      feature4: 'Rechercher dans le contenu décodé',
      feature5: 'Historique de recherche pour des requêtes répétées rapides'
    },
    smartDecoding: {
      title: '✨ Décodage intelligent',
      feature1: 'Décodage automatique des séquences d\'échappement (\\n, \\", \\t, etc.)',
      feature2: 'Analyse des chaînes JSON imbriquées',
      feature3: 'Coloration syntaxique JSON/code, aperçu Markdown',
      feature4: 'Cliquez sur l\'icône 👁 à côté des champs pour afficher le contenu décodé'
    },
    themesSettings: {
      title: '🎨 Thèmes et paramètres',
      feature1: 'Basculement rapide entre les thèmes clair/sombre',
      feature2: '5 schémas de couleurs : Bleu océan, Vert forêt, Orange coucher de soleil, Violet lavande, Rouge rubis',
      feature3: 'Personnaliser les lignes d\'aperçu et la taille d\'indentation',
      feature4: 'Contrôle flexible de la profondeur d\'expansion (0-5 niveaux ou expansion complète)'
    },
    moreFeatures: {
      title: '🚀 Plus de fonctionnalités',
      feature1: 'Exporter les résultats filtrés au format JSONL ou JSON',
      feature2: 'Chargement par lots avec support "Charger plus"',
      feature3: 'Défilement rapide vers le haut/bas'
    },
    moreInfo: {
      title: '📖 Plus d\'informations',
      content: 'Visitez GitHub pour la documentation détaillée, signaler des problèmes ou contribuer',
      github: 'Projet GitHub'
    }
  },
  loading: {
    title: 'Chargement du fichier JSONL...',
    subtitle: 'Veuillez patienter',
    progress: 'Chargement...',
    rendering: 'Rendu...'
  },
  result: {
    noResults: 'Aucun résultat correspondant trouvé',
    hint: 'Essayez d\'autres mots-clés ou changez le mode de filtre',
    displayed: 'Affiché',
    of: '/',
    lines: 'lignes',
    loadMore: 'Charger plus',
    loadMoreCount: 'lignes'
  },
  paste: {
    title: 'Coller le contenu JSONL',
    placeholder: 'Collez le contenu JSONL ici...\nUn objet JSON par ligne, par exemple :\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: 'Soumettre',
    cancel: 'Annuler'
  },
  drag: {
    title: 'Glisser le fichier ici',
    subtitle: 'Chargera un nouveau fichier'
  },
  scroll: {
    toTop: 'Vers le haut',
    toBottom: 'Vers le bas'
  },
  confirm: {
    goHome: 'Êtes-vous sûr de vouloir retourner à l\'accueil ? Les données actuelles seront effacées.'
  },
  error: {
    fileRead: 'Échec de la lecture du fichier : ',
    parse: 'Impossible d\'analyser le contenu du fichier : ',
    pasteContent: 'Impossible d\'analyser le contenu collé : '
  },
  language: {
    select: 'Sélectionner la langue',
    current: 'Langue actuelle'
  },
  decoder: {
    viewFull: 'Voir le contenu complet',
    copied: 'Copié!',
    copyDecoded: 'Copier le contenu décodé',
    copyFailed: 'Échec de la copie',
    copyFailedRetry: 'Échec de la copie, veuillez réessayer',
    markdownRenderError: 'Erreur de rendu Markdown',
    title: 'Contenu décodé',
    originalContent: 'Contenu original',
    markdownPreview: 'Aperçu Markdown',
    showToc: 'Afficher la table des matières',
    hideToc: 'Masquer la table des matières',
    selectLanguage: 'Sélectionner ou rechercher une langue...',
    searchLanguageHint: 'Sélectionner ou saisir un nom de langue pour rechercher',
    autoDetectLanguage: 'Détecter automatiquement le langage de programmation',
    selectTheme: 'Sélectionner le thème de coloration du code',
    showDecoded: 'Afficher le contenu décodé',
    showOriginal: 'Afficher le contenu original',
    truncated: '({count} lignes omises)',
    noMatchingLanguage: 'Aucune langue correspondante trouvée',
    themeLabel: 'Thème:',
    loadingHighlight: 'Chargement de la coloration du code...',
    toc: 'Table des matières',
    programmingLanguage: 'Langage:'
  }
}
