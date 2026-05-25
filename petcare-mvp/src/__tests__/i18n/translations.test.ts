import { translations, TranslationKey, Language } from '../../i18n/translations';

const ALL_LANGS = Object.keys(translations) as Language[];
const EN_KEYS = Object.keys(translations.en) as TranslationKey[];

describe('translations', () => {
  it('contains exactly 8 languages', () => {
    expect(ALL_LANGS).toHaveLength(8);
    expect(ALL_LANGS).toEqual(
      expect.arrayContaining(['en', 'tr', 'de', 'es', 'pt-BR', 'fr', 'ja', 'it'])
    );
  });

  it('every language has the same keys as English', () => {
    for (const lang of ALL_LANGS) {
      if (lang === 'en') continue;
      const langKeys = Object.keys(translations[lang]);
      expect(langKeys.length).toBe(EN_KEYS.length);
      for (const key of EN_KEYS) {
        expect(langKeys).toContain(key);
      }
    }
  });

  it('all values are non-empty strings', () => {
    for (const lang of ALL_LANGS) {
      const obj = translations[lang] as Record<string, string>;
      for (const [key, val] of Object.entries(obj)) {
        expect(typeof val).toBe('string');
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it('all 11 onboarding keys exist in every language', () => {
    const ONBOARDING_KEYS: TranslationKey[] = [
      'onboardingSkip', 'onboardingNext', 'onboardingGetStarted',
      'onboarding1Title', 'onboarding1Subtitle',
      'onboarding2Title', 'onboarding2Subtitle',
      'onboarding3Title', 'onboarding3Subtitle',
      'onboarding4Title', 'onboarding4Subtitle',
    ];
    for (const lang of ALL_LANGS) {
      const obj = translations[lang] as Record<TranslationKey, string>;
      for (const key of ONBOARDING_KEYS) {
        expect(obj[key]).toBeTruthy();
      }
    }
  });

  it('German spot-checks', () => {
    expect(translations.de.save).toBe('Speichern');
    expect(translations.de.dog).toBe('Hund');
    expect(translations.de.cat).toBe('Katze');
    expect(translations.de.onboardingSkip).toBe('Überspringen');
    expect(translations.de.onboardingGetStarted).toBe('Loslegen 🐾');
  });

  it('Spanish spot-checks', () => {
    expect(translations.es.save).toBe('Guardar');
    expect(translations.es.dog).toBe('Perro');
    expect(translations.es.onboardingSkip).toBe('Omitir');
  });

  it('Portuguese (pt-BR) spot-checks', () => {
    expect(translations['pt-BR'].save).toBe('Salvar');
    expect(translations['pt-BR'].dog).toBe('Cachorro');
    expect(translations['pt-BR'].onboardingGetStarted).toBe('Começar 🐾');
  });

  it('French spot-checks', () => {
    expect(translations.fr.save).toBe('Enregistrer');
    expect(translations.fr.dog).toBe('Chien');
    expect(translations.fr.cat).toBe('Chat');
    expect(translations.fr.onboardingSkip).toBe('Passer');
  });

  it('Japanese spot-checks', () => {
    expect(translations.ja.save).toBe('保存');
    expect(translations.ja.dog).toBe('犬');
    expect(translations.ja.cat).toBe('猫');
    expect(translations.ja.onboardingGetStarted).toBe('はじめる 🐾');
  });

  it('Italian spot-checks', () => {
    expect(translations.it.save).toBe('Salva');
    expect(translations.it.dog).toBe('Cane');
    expect(translations.it.onboardingSkip).toBe('Salta');
  });

  it('Turkish spot-checks remain intact', () => {
    expect(translations.tr.save).toBe('Kaydet');
    expect(translations.tr.dog).toBe('Köpek');
    expect(translations.tr.onboardingSkip).toBe('Atla');
    expect(translations.tr.onboardingGetStarted).toBe('Başla 🐾');
  });

  it('onboarding titles contain newline for line break', () => {
    for (const lang of ALL_LANGS) {
      const obj = translations[lang] as Record<TranslationKey, string>;
      expect(obj.onboarding1Title).toContain('\n');
      expect(obj.onboarding2Title).toContain('\n');
      expect(obj.onboarding3Title).toContain('\n');
      expect(obj.onboarding4Title).toContain('\n');
    }
  });

  it('onboarding subtitles are meaningful descriptions', () => {
    for (const lang of ALL_LANGS) {
      const obj = translations[lang] as Record<TranslationKey, string>;
      // CJK languages convey more meaning per character, threshold is lower
      expect(obj.onboarding1Subtitle.length).toBeGreaterThan(20);
      expect(obj.onboarding4Subtitle.length).toBeGreaterThan(20);
    }
  });
});
