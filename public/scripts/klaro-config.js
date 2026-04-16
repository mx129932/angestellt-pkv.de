/**
 * Klaro Cookie Consent – Konfiguration für angestellt-pkv.de
 * ============================================================
 * Docs: https://klaro.org/docs/integration/annotated-configuration
 *
 * Services:
 * - Google Analytics 4 (Statistik) – ID wird nach Einrichtung ergänzt
 *
 * Vorlage: selbststaendig-pkv.de (identische Struktur, eigene Domain/Farben)
 */

var klaroConfig = {

  // Version des Consent-Eintrags
  version: 1,

  elementID: 'klaro',

  storageMethod: 'cookie',
  storageName: 'klaro',

  // Cookie auf Hauptdomain setzen
  cookieDomain: 'angestellt-pkv.de',

  cookieExpiresAfterDays: 365,

  lang: 'de',

  // Kein implizites Consent durch Weitersurfen
  default: false,

  mustConsent: false,

  acceptAll: true,

  hideDeclineAll: false,

  groupByPurpose: true,

  translations: {
    de: {
      consentModal: {
        title: 'Datenschutz-Einstellungen',
        description: 'Wir nutzen Cookies und externe Dienste, um unsere Website zu verbessern. Du kannst wählen, welche Dienste du zulassen möchtest.',
      },
      consentNotice: {
        title: 'Cookie-Hinweis',
        description: 'Wir nutzen Cookies für Statistiken und externe Inhalte.',
        changeDescription: 'Es gab Änderungen seit deinem letzten Besuch. Bitte aktualisiere deine Einwilligung.',
        learnMore: 'Einstellungen',
      },
      privacyPolicy: {
        name: 'Datenschutzerklärung',
        text: 'Mehr dazu in unserer {privacyPolicy}.',
      },
      ok: 'Alle akzeptieren',
      decline: 'Ablehnen',
      save: 'Speichern',
      acceptAll: 'Alle akzeptieren',
      acceptSelected: 'Auswahl speichern',
      purposes: {
        essential: {
          title: 'Essenziell',
          description: 'Diese Dienste sind für die Grundfunktion der Website erforderlich.',
        },
        statistics: {
          title: 'Statistiken',
          description: 'Diese Dienste helfen uns zu verstehen, wie Besucher unsere Website nutzen.',
        },
        media: {
          title: 'Externe Medien',
          description: 'Diese Dienste ermöglichen die Darstellung externer Inhalte wie Videos.',
        },
      },
    },
  },

  privacyPolicy: '/datenschutz/',

  services: [

    // ===== Google Analytics 4 =====
    {
      name: 'google-analytics',
      title: 'Google Analytics 4',
      purposes: ['statistics'],
      default: false,
      required: false,
      optOut: false,
      onlyOnce: false,
      cookies: [
        /^_ga/,
        /^_gid/,
        /^_gat/,
        /^_gcl/,
        /^_gac/,
      ],
      description: 'Webanalyse-Dienst von Google zur Auswertung der Website-Nutzung.',
    },
  ],
};
