import { civilServicesStages } from './civil-services';
import type { ExamSyllabus } from './types';

export { buildSyllabusLessonSource } from './types';
export type { SyllabusSelection, ExamSyllabus, SyllabusStage, SyllabusSubject, SyllabusTopic } from './types';

/** Curated learning topics, not a verbatim or exhaustive official syllabus. */
export const EXAM_SYLLABI: ExamSyllabus[] = [
  {
    id: 'mpsc', title: 'MPSC', subtitle: 'Maharashtra State Services',
    scope: 'State Services / Rajyaseva foundations with Maharashtra-specific context where relevant.',
    sourceLabel: 'MPSC official syllabus directory', sourceUrl: 'https://mpsc.gov.in/examination_syllabus/18',
    note: 'State Services core-topic guide, not all MPSC recruitments. Optional-subject papers are not expanded here. Check the official revised scheme and your notification.',
    stages: civilServicesStages(true),
  },
  {
    id: 'upsc', title: 'UPSC', subtitle: 'Civil Services Examination',
    scope: 'Civil Services General Studies, CSAT, essay and language-paper foundations.',
    sourceLabel: 'UPSC CSE 2026 notification',
    sourceUrl: 'https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf',
    note: 'Civil Services core-topic guide, not all UPSC exams. Optional-subject syllabi and the personality test are not expanded here. Verify the notification for your exam year.',
    stages: civilServicesStages(false),
  },
];
