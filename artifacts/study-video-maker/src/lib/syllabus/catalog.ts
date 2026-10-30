import { civilServicesStages } from './civil-services';
import { subject, type ExamSyllabus } from './types';

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
  {
    id: 'tait', title: 'TAIT', subtitle: 'Teacher Aptitude & Intelligence Test',
    scope: 'Maharashtra teacher aptitude and intelligence preparation. This is TAIT, not the TET subject-content syllabus.',
    sourceLabel: 'MSCE Pune · official TAIT notices', sourceUrl: 'https://mscepune.in/',
    note: 'Curated aptitude and intelligence practice topics; not a verbatim official syllabus. Refer to MSCE Pune TAIT notices for the applicable pattern and coverage. TAIT and TET are different exams.',
    stages: [
      { id: 'aptitude', title: 'Aptitude', subjects: [
        subject('Numerical aptitude', [
          'Number system and divisibility', 'Fractions, decimals and simplification', 'Percentages and averages',
          'Ratio and proportion', 'Profit, loss and interest', 'Time and work', 'Speed, distance and time', 'Basic data interpretation',
        ]),
        subject('Marathi language aptitude', [
          'Marathi parts of speech', 'Marathi synonyms and antonyms', 'Marathi sentence correction',
          'Marathi idioms and proverbs', 'Marathi reading comprehension',
        ]),
        subject('English language aptitude', [
          'English parts of speech', 'Tenses and subject-verb agreement', 'English vocabulary in context',
          'English sentence correction', 'English reading comprehension',
        ]),
        subject('Learning, interests and adjustment', [
          'Learning motivation and interests', 'Adapting to a new situation', 'Effective interpersonal communication',
          'Understanding individual differences', 'Spatial aptitude and visualisation',
        ]),
      ] },
      { id: 'intelligence', title: 'Intelligence', subjects: [
        subject('Verbal and analytical reasoning', [
          'Analogy and classification', 'Number and letter series', 'Coding and decoding', 'Blood relations',
          'Direction sense', 'Syllogisms and logical conclusions', 'Ordering and seating puzzles',
        ]),
        subject('Non-verbal reasoning', [
          'Figure series and odd-one-out', 'Mirror and water images', 'Paper folding and cutting',
          'Embedded figures', 'Cubes and dice', 'Pattern completion and visual sequences',
        ]),
      ] },
    ],
  },
  {
    id: 'banking', title: 'Banking', subtitle: 'IBPS PO / Clerk foundations',
    scope: 'Common IBPS PO and clerical recruitment preparation. Exam-specific sections and patterns vary.',
    sourceLabel: 'IBPS PO/MT XV official notification',
    sourceUrl: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XV.pdf',
    note: 'Common preparation guide, not a universal syllabus for every bank exam. The linked PO/MT XV notice is a reference, not a claim of the latest cycle. Clerk/CSA, SBI and other notices may differ; descriptive writing is PO-focused.',
    stages: [
      { id: 'prelims', title: 'Prelims', subjects: [
        subject('Quantitative / numerical aptitude', [
          'Simplification and approximation', 'Number series', 'Quadratic equations', 'Percentages and ratios',
          'Profit, loss and discounts', 'Simple and compound interest', 'Time and work', 'Speed, time and distance',
          'Averages, ages and mixtures', 'Tabular and graphical data interpretation',
        ]),
        subject('Reasoning ability', [
          'Linear and circular seating arrangements', 'Floor and scheduling puzzles', 'Syllogisms',
          'Inequalities', 'Coding and decoding', 'Blood relations and directions', 'Alphanumeric series',
        ]),
        subject('English language', [
          'Reading comprehension', 'Cloze tests', 'Error spotting and sentence correction',
          'Para jumbles', 'Vocabulary and word usage', 'Fill in the blanks',
        ]),
      ] },
      { id: 'mains', title: 'Mains', subjects: [
        subject('Advanced reasoning and aptitude', [
          'Multi-variable puzzles', 'Data sufficiency', 'Input-output reasoning',
          'Critical reasoning and assumptions', 'Caselet data interpretation', 'Probability and permutations',
          'Data comparison and missing-data interpretation',
        ]),
        subject('Banking, economy and financial awareness', [
          'RBI and the Indian banking system', 'Repo rate, CRR and SLR concepts', 'Types of bank accounts and deposits',
          'Digital payments: UPI, NEFT, RTGS and IMPS', 'Financial inclusion and priority-sector lending',
          'Inflation and monetary policy', 'Budget and economic survey fundamentals',
          'How to prepare dated banking current affairs',
        ]),
        subject('Computer and digital literacy · exam-dependent', [
          'Computer hardware and software', 'Operating systems and office applications',
          'Networks and internet basics', 'Cybersecurity and safe digital banking',
        ]),
        subject('English and descriptive skills · PO focus', [
          'Advanced English comprehension', 'Writing a structured essay', 'Writing a formal letter',
          'Precis and comprehension practice',
        ]),
      ] },
    ],
  },
];
