import type { StudyLanguage } from '@workspace/api-client-react';

const localeIndex = { hi: 0, mr: 1, es: 2, fr: 3, de: 4 } as const;
// Fixed labels belong to the drawing templates; lesson prose comes from the AI.
const labels: Record<string, [string, string, string, string, string]> = {
  'The whole': ['पूर्ण मात्रा', 'पूर्ण रक्कम', 'El total', 'Le total', 'Das Ganze'],
  Rate: ['प्रतिशत दर', 'टक्केवारी', 'Porcentaje', 'Taux', 'Prozentsatz'],
  Formula: ['सूत्र', 'सूत्र', 'Fórmula', 'Formule', 'Formel'],
  Answer: ['उत्तर', 'उत्तर', 'Respuesta', 'Réponse', 'Ergebnis'],
  '100 equal parts': ['100 बराबर भाग', '100 समान भाग', '100 partes iguales', '100 parts égales', '100 gleiche Teile'],
  Evaporation: ['वाष्पीकरण', 'बाष्पीभवन', 'Evaporación', 'Évaporation', 'Verdunstung'],
  Condensation: ['संघनन', 'संघनन', 'Condensación', 'Condensation', 'Kondensation'],
  Precipitation: ['वर्षण', 'पर्जन्य', 'Precipitación', 'Précipitations', 'Niederschlag'],
  Collection: ['जल संचय', 'पाणी साठणे', 'Acumulación', 'Accumulation', 'Sammlung'],
  'Sun heats the sea': ['सूर्य समुद्र को गर्म करता है', 'सूर्य समुद्राला उष्णता देतो', 'El sol calienta el mar', 'Le soleil chauffe la mer', 'Die Sonne erwärmt das Meer'],
  'Seed coat': ['बीज का आवरण', 'बियाचे आवरण', 'Cubierta de la semilla', 'Enveloppe de la graine', 'Samenschale'],
  'Stored food': ['संचित भोजन', 'साठवलेले अन्न', 'Alimento almacenado', 'Réserves nutritives', 'Nährstoffvorrat'],
  'Seed absorbs water and swells': ['बीज पानी सोखकर फूलता है', 'बी पाणी शोषून फुगते', 'La semilla absorbe agua', 'La graine absorbe de l’eau', 'Der Samen nimmt Wasser auf'],
  'Root grows down': ['जड़ नीचे बढ़ती है', 'मूळ खाली वाढते', 'La raíz crece hacia abajo', 'La racine pousse vers le bas', 'Die Wurzel wächst nach unten'],
  'Shoot grows up': ['अंकुर ऊपर बढ़ता है', 'अंकुर वर वाढतो', 'El brote crece hacia arriba', 'La pousse grandit vers le haut', 'Der Spross wächst nach oben'],
  'First leaves open': ['पहली पत्तियाँ खुलती हैं', 'पहिली पाने उलगडतात', 'Se abren las primeras hojas', 'Les premières feuilles s’ouvrent', 'Die ersten Blätter öffnen sich'],
  'Germination: the seed uses its stored food to start growing.': ['अंकुरण: बीज संचित भोजन से बढ़ना शुरू करता है।', 'अंकुरण: बी साठवलेल्या अन्नाचा वापर करून वाढते.', 'Germinación: la semilla crece usando sus reservas.', 'Germination : la graine utilise ses réserves pour grandir.', 'Keimung: Der Samen nutzt seine Nährstoffreserven.'],
  '2 H₂ molecules': ['2 H₂ अणु', '2 H₂ रेणू', '2 moléculas de H₂', '2 molécules de H₂', '2 H₂-Moleküle'],
  '1 O₂ molecule': ['1 O₂ अणु', '1 O₂ रेणू', '1 molécula de O₂', '1 molécule de O₂', '1 O₂-Molekül'],
  '2 H₂O molecules': ['2 H₂O अणु', '2 H₂O रेणू', '2 moléculas de H₂O', '2 molécules de H₂O', '2 H₂O-Moleküle'],
  'Bonds break': ['बंध टूटते हैं', 'बंध तुटतात', 'Se rompen los enlaces', 'Les liaisons se rompent', 'Bindungen lösen sich'],
  'Atoms rearrange': ['परमाणु पुनर्व्यवस्थित होते हैं', 'अणूंची पुनर्रचना होते', 'Los átomos se reorganizan', 'Les atomes se réorganisent', 'Atome ordnen sich neu'],
  'H  hydrogen atom': ['H  हाइड्रोजन परमाणु', 'H  हायड्रोजन अणू', 'H  átomo de hidrógeno', 'H  atome d’hydrogène', 'H  Wasserstoffatom'],
  'O  oxygen atom': ['O  ऑक्सीजन परमाणु', 'O  ऑक्सिजन अणू', 'O  átomo de oxígeno', 'O  atome d’oxygène', 'O  Sauerstoffatom'],
  'Atoms are conserved: 4 H and 2 O before, 4 H and 2 O after.': ['परमाणु संरक्षित: पहले और बाद में 4 H तथा 2 O।', 'अणू जतन होतात: आधी व नंतर 4 H आणि 2 O.', 'Se conservan: 4 H y 2 O antes y después.', 'Conservation : 4 H et 2 O avant et après.', 'Erhalten: vorher und nachher 4 H und 2 O.'],
  'Schematic model only, not lab instructions.': ['केवल आरेखीय मॉडल, प्रयोग के निर्देश नहीं।', 'केवळ आकृतीरूप नमुना; प्रयोगाच्या सूचना नाहीत.', 'Modelo esquemático, no instrucciones de laboratorio.', 'Schéma uniquement, pas un protocole expérimental.', 'Schematisches Modell, keine Versuchsanleitung.'],
  VS: ['बनाम', 'विरुद्ध', 'frente a', 'contre', 'gegen'],
};

function fractionLabel(text: string, index: number): string | undefined {
  let m = text.match(/^numerator: (\d+) parts? counted$/);
  if (m) return [`अंश: गिने गए ${m[1]} भाग`, `अंश: मोजलेले ${m[1]} भाग`, `numerador: ${m[1]} partes contadas`, `numérateur : ${m[1]} parts comptées`, `Zähler: ${m[1]} gezählte Teile`][index];
  m = text.match(/^denominator: (\d+) equal parts?$/);
  if (m) return [`हर: ${m[1]} बराबर भाग`, `छेद: ${m[1]} समान भाग`, `denominador: ${m[1]} partes iguales`, `dénominateur : ${m[1]} parts égales`, `Nenner: ${m[1]} gleiche Teile`][index];
  m = text.match(/^(\d+) of (\d+) equal parts shaded$/);
  if (m) return [`${m[2]} बराबर भागों में से ${m[1]} रंगे`, `${m[2]} समान भागांपैकी ${m[1]} रंगवले`, `${m[1]} de ${m[2]} partes sombreadas`, `${m[1]} parts colorées sur ${m[2]}`, `${m[1]} von ${m[2]} Teilen gefärbt`][index];
  m = text.match(/^Every part is the same size, so (\d+)\/(\d+) means \d+ of \d+ equal parts\.$/);
  if (m) return [`सभी भाग बराबर हैं: ${m[1]}/${m[2]} का अर्थ ${m[2]} में से ${m[1]} भाग।`, `सर्व भाग समान: ${m[1]}/${m[2]} म्हणजे ${m[2]} पैकी ${m[1]} भाग.`, `Partes iguales: ${m[1]}/${m[2]} significa ${m[1]} de ${m[2]}.`, `Parts égales : ${m[1]}/${m[2]} signifie ${m[1]} parts sur ${m[2]}.`, `Gleiche Teile: ${m[1]}/${m[2]} bedeutet ${m[1]} von ${m[2]}.`][index];
  m = text.match(/^No parts shaded: 0\/(\d+) equals 0\.$/);
  if (m) return [`कोई भाग रंगा नहीं: 0/${m[1]} = 0।`, `एकही भाग रंगवलेला नाही: 0/${m[1]} = 0.`, `Sin partes sombreadas: 0/${m[1]} = 0.`, `Aucune part colorée : 0/${m[1]} = 0.`, `Kein Teil gefärbt: 0/${m[1]} = 0.`][index];
  m = text.match(/^All (\d+) parts shaded: (\d+)\/(\d+) is one whole\.$/);
  if (m) return [`सभी ${m[1]} भाग रंगे: ${m[2]}/${m[3]} एक पूर्ण है।`, `सर्व ${m[1]} भाग रंगवले: ${m[2]}/${m[3]} म्हणजे एक पूर्ण.`, `Las ${m[1]} partes: ${m[2]}/${m[3]} es un entero.`, `Les ${m[1]} parts : ${m[2]}/${m[3]} font un entier.`, `Alle ${m[1]} Teile: ${m[2]}/${m[3]} ist ein Ganzes.`][index];
  return undefined;
}

export function translateDiagramText(text: string, language: StudyLanguage = 'en'): string {
  if (language === 'en') return text;
  const index = localeIndex[language];
  if (index === undefined) return text;
  return labels[text]?.[index] ?? fractionLabel(text, index) ?? text;
}

const contexts = new WeakMap<CanvasRenderingContext2D, Map<StudyLanguage, CanvasRenderingContext2D>>();

/** Keeps text measurement and drawing localized identically, including exported frames. */
export function localizedContext(context: CanvasRenderingContext2D, language: StudyLanguage = 'en') {
  if (language === 'en') return context;
  let cache = contexts.get(context);
  if (!cache) { cache = new Map(); contexts.set(context, cache); }
  const cached = cache.get(language);
  if (cached) return cached;
  const proxy = new Proxy(context, {
    get(target, property) {
      if (property === 'fillText') return (text: string, x: number, y: number, maxWidth?: number) => {
        const translated = translateDiagramText(text, language);
        if (maxWidth === undefined) target.fillText(translated, x, y);
        else target.fillText(translated, x, y, maxWidth);
      };
      if (property === 'measureText') return (text: string) => target.measureText(translateDiagramText(text, language));
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, property, value) {
      if (property === 'font' && typeof value === 'string' && !value.includes('Noto Sans Devanagari')) {
        value = value.replace('sans-serif', '"Noto Sans Devanagari", sans-serif');
      }
      return Reflect.set(target, property, value, target);
    },
  });
  cache.set(language, proxy);
  return proxy;
}
