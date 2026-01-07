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
    }
  },
  settings: {
    title: 'Paramètres',
    close: 'Fermer',
    maxLines: 'Lignes d\'aperçu',
    indentSize: 'Taille d\'indentation',
    unlimited: 'Illimité',
    lines: 'lignes',
    spaces: 'espaces'
  },
  theme: {
    toggle: 'Basculer le thème',
    light: 'Passer au thème clair',
    dark: 'Passer au thème sombre',
    selectColor: 'Sélectionner la couleur du thème',
    colors: {
      ocean: 'Bleu océan',
      forest: 'Vert forêt',
      sunset: 'Orange coucher de soleil',
      purple: 'Violet lavande',
      ruby: 'Rouge rubis'
    }
  },
  help: {
    title: 'Aide Smart JSONL Viewer',
    close: 'Fermer',
    fileLoading: {
      title: 'Chargement de fichiers',
      feature1: 'Prise en charge des fichiers volumineux de 100 Mo+ avec chargement rapide',
      feature2: 'Glisser-déposer les fichiers pour ouvrir',
      feature3: 'Détection automatique des fichiers .jsonl, .ndjson'
    },
    searchFilter: {
      title: 'Recherche et filtrage',
      feature1: 'Recherche par mots-clés : Supporte plusieurs mots-clés séparés par des espaces',
      feature2: 'Expression régulière : Cliquez sur .* pour activer le mode regex',
      feature3: 'Chemin JSON : Utilisez la syntaxe de chemin comme user.name',
      feature4: 'Filtre de type : Filtrer par chaîne, nombre, booléen, objet, tableau'
    },
    smartDecoding: {
      title: 'Décodage intelligent',
      feature1: 'Décodage automatique des chaînes JSON imbriquées',
      feature2: 'Encodage/décodage URL',
      feature3: 'Encodage/décodage Base64',
      feature4: 'Cliquez sur l\'icône 👁 à côté des champs pour afficher le contenu décodé'
    },
    themesSettings: {
      title: 'Thèmes et paramètres',
      feature1: 'Basculer entre le thème clair et sombre',
      feature2: 'Plusieurs schémas de couleurs (cliquez sur l\'icône palette)',
      feature3: 'Personnaliser la profondeur d\'expansion et l\'indentation'
    },
    moreInfo: {
      title: 'Plus d\'informations',
      content: 'Visitez GitHub Wiki pour une documentation détaillée'
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
  }
}
