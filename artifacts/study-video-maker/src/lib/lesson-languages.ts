import type { StudyLanguage } from '@workspace/api-client-react';

export const LESSON_LANGUAGES: { value: StudyLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi · हिन्दी' },
  { value: 'mr', label: 'Marathi · मराठी' },
  { value: 'es', label: 'Spanish · Español' },
  { value: 'fr', label: 'French · Français' },
  { value: 'de', label: 'German · Deutsch' },
];

export const languageLabel = (language: StudyLanguage = 'en') =>
  LESSON_LANGUAGES.find((option) => option.value === language)?.label ?? 'English';

export async function loadLessonFont(language: StudyLanguage = 'en') {
  if (language !== 'hi' && language !== 'mr') return;
  await Promise.all([
    document.fonts.load('500 22px "Noto Sans Devanagari"', 'अध्ययन'),
    document.fonts.load('800 38px "Noto Sans Devanagari"', 'अध्ययन'),
  ]);
}
