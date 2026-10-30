export type SyllabusTopic = { id: string; title: string };
export type SyllabusSubject = { id: string; title: string; topics: SyllabusTopic[] };
export type SyllabusStage = { id: string; title: string; subjects: SyllabusSubject[] };
export type ExamSyllabus = {
  id: string;
  title: string;
  subtitle: string;
  scope: string;
  sourceLabel: string;
  sourceUrl: string;
  note: string;
  stages: SyllabusStage[];
};
export type SyllabusSelection = {
  exam: ExamSyllabus;
  stage: SyllabusStage;
  subject: SyllabusSubject;
  topic: SyllabusTopic;
};

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function subject(title: string, titles: string[]): SyllabusSubject {
  return { id: slug(title), title, topics: titles.map((name) => ({ id: slug(name), title: name })) };
}

export function buildSyllabusLessonSource({ exam, stage, subject: area, topic }: SyllabusSelection): string {
  return [
    `Exam preparation: ${exam.title} (${exam.subtitle}).`,
    `Stage / section: ${stage.title}. Subject: ${area.title}. Topic: ${topic.title}.`,
    `Learning scope: ${exam.scope}`,
    'Teach this specific topic from fundamentals to exam-level application, with one idea per scene.',
    'Include a clear definition, a worked example or relevant illustration, common mistakes, and a short practice question with its explained answer.',
    'Practice examples are illustrative, not claims about actual past-paper questions. Do not invent official marks, weightage, exam dates, or guaranteed questions.',
    'For language and grammar topics, preserve the language being taught in example words and sentences while explaining them in the chosen lesson language.',
    'For current-affairs-related topics, teach the underlying concepts and how to assess a dated reliable source; do not claim live updates or invent recent news, office-holders, rates, statistics, or policy changes.',
  ].join('\n');
}
