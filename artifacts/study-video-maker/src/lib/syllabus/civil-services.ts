import { subject, type SyllabusStage } from './types';

export function civilServicesStages(maharashtra: boolean): SyllabusStage[] {
  const prelims = [
    subject('History and culture', [
      'Indus Valley civilization', 'Buddhism and Jainism', 'Medieval Indian kingdoms',
      'The revolt of 1857', 'Indian national movement', 'Indian art and architecture',
    ]),
    subject('Geography', [
      'Latitude, longitude and time zones', 'Monsoons and Indian climate', 'Indian rivers and drainage',
      'Soils and natural vegetation', 'World physical geography', 'Agriculture and mineral resources',
    ]),
    subject('Indian polity', [
      'Preamble and features of the Constitution', 'Fundamental Rights and Fundamental Duties',
      'Directive Principles of State Policy', 'Parliament and lawmaking', 'President and Prime Minister',
      'Federalism and Centre-State relations', 'Panchayati Raj and local government',
    ]),
    subject('Economy and development', [
      'GDP and national income', 'Inflation and monetary policy', 'Fiscal policy and the Union Budget',
      'Poverty, inclusion and unemployment', 'Sustainable development', 'Population and social-sector initiatives',
    ]),
    subject('Environment and general science', [
      'Ecosystems and food chains', 'Biodiversity and conservation', 'Climate change and greenhouse gases',
      'Pollution and waste management', 'Human health and nutrition', 'Everyday physics and chemistry',
    ]),
    subject('Current affairs foundations', [
      'How to analyse a current-affairs article', 'Understanding government policies and schemes',
      'International organisations and their mandates', 'Reading economic and environmental reports',
    ]),
    subject('CSAT / aptitude', [
      'Reading comprehension', 'Logical reasoning and analytical ability', 'Decision-making and problem-solving',
      'Percentages and ratios', 'Averages and basic numeracy', 'Data interpretation from tables and charts',
      'Interpersonal and communication skills',
    ]),
  ];
  if (maharashtra) prelims.push(
    subject('Maharashtra focus', [
      'Chhatrapati Shivaji Maharaj and the Maratha state', 'Social reform movements in Maharashtra',
      'Maharashtra rivers, regions and climate', 'Agriculture and industry in Maharashtra',
      'Maharashtra state government and local bodies',
    ]),
  );
  return [
    { id: 'prelims', title: 'Prelims', subjects: prelims },
    { id: 'mains', title: 'Mains · common papers', subjects: [
      subject('Essay', ['Planning an analytical essay', 'Building arguments with examples', 'Writing introductions and conclusions']),
      subject('GS I · history, society and geography', [
        'Indian cultural heritage', 'Modern history and post-independence consolidation', 'World history foundations',
        'Indian society and social change', 'Women, urbanisation and social empowerment', 'Physical geography and natural resources',
        ...(maharashtra ? ['Maharashtra culture and social reform'] : []),
      ]),
      subject('GS II · governance and international relations', [
        'Constitutional institutions and accountability', 'Separation of powers and judicial review',
        'Governance, transparency and citizen charters', 'Social justice, health and education',
        'Welfare policy implementation', 'India and its neighbours', 'International institutions and bilateral relations',
      ]),
      subject('GS III · economy, science and security', [
        'Inclusive growth and infrastructure', 'Agriculture, food security and public distribution',
        'Science and technology applications', 'Environmental assessment and conservation',
        'Disaster management', 'Cybersecurity and internal security',
      ]),
      subject('GS IV · ethics and integrity', [
        'Ethics and human values', 'Attitude and emotional intelligence', 'Integrity and impartiality in public service',
        'Probity and accountability', 'Solving an ethics case study',
      ]),
      subject(maharashtra ? 'Marathi and English language papers' : 'Qualifying language papers', [
        ...(maharashtra ? ['Marathi grammar and comprehension', 'Marathi-English translation techniques'] : ['Indian-language comprehension and translation techniques']),
        'English comprehension and vocabulary', 'Precis writing', 'Language-paper essay writing',
      ]),
    ] },
  ];
}
