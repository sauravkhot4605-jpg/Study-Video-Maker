export type CurrentAffairsYear = 2025 | 2026;

export type CurrentAffairsCategory =
  | 'Economy'
  | 'Polity & governance'
  | 'National security'
  | 'Science & technology'
  | 'Culture & heritage'
  | 'International relations'
  | 'Sports';

export type CurrentAffair = {
  id: string;
  year: CurrentAffairsYear;
  date: string;
  title: string;
  category: CurrentAffairsCategory;
  summary: string;
  examAngle: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const CURRENT_AFFAIRS: CurrentAffair[] = [
  {
    id: 'union-budget-2025',
    year: 2025,
    date: '1 February 2025',
    title: 'Union Budget 2025–26: income-tax rebate',
    category: 'Economy',
    summary: 'The Budget proposed a full tax rebate under the new tax regime for eligible individuals with normal income up to ₹12 lakh. This was a major change to personal income-tax relief.',
    examAngle: 'Revise direct taxes, tax rebates, the Union Budget process, and the difference between a rebate and an exemption.',
    sourceLabel: 'Union Budget 2025–26 speech',
    sourceUrl: 'https://www.indiabudget.gov.in/budget2025-26/doc/Budget_Speech.pdf',
  },
  {
    id: 'operation-sindoor-2025',
    year: 2025,
    date: '7 May 2025',
    title: 'Operation Sindoor',
    category: 'National security',
    summary: 'India announced targeted action against terrorist infrastructure following the 22 April Pahalgam attack. Government briefings described the operation as focused and calibrated.',
    examAngle: 'Connect the event to counter-terrorism, multi-service coordination, deterrence, and India’s regional security environment.',
    sourceLabel: 'Press Information Bureau',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2129453',
  },
  {
    id: 'waqf-amendment-2025',
    year: 2025,
    date: 'April 2025',
    title: 'Waqf (Amendment) Act, 2025',
    category: 'Polity & governance',
    summary: 'Parliament passed amendments to the law governing the administration of Waqf properties. The legislation became a major public and constitutional debate.',
    examAngle: 'Review how Parliament amends laws, the governance of religious endowments, minority rights, and relevant court proceedings.',
    sourceLabel: 'Ministry of Minority Affairs',
    sourceUrl: 'https://www.minorityaffairs.gov.in/show_content.php?lang=1&level=2&ls_id=936&lid=1163',
  },
  {
    id: 'caste-enumeration-2025',
    year: 2025,
    date: '30 April 2025',
    title: 'Caste enumeration approved for Census 2027',
    category: 'Polity & governance',
    summary: 'The Cabinet Committee on Political Affairs decided to include caste enumeration in the upcoming Census 2027.',
    examAngle: 'Consider census data, social justice, evidence-based welfare, and the policy uses and privacy limits of population data.',
    sourceLabel: 'Prime Minister of India',
    sourceUrl: 'https://www.pmindia.gov.in/en/news_updates/cabinet-approves-caste-enumeration-in-the-upcoming-census/',
  },
  {
    id: 'axiom-4-2025',
    year: 2025,
    date: '25 June–15 July 2025',
    title: 'Shubhanshu Shukla’s Axiom-4 mission',
    category: 'Science & technology',
    summary: 'ISRO astronaut Shubhanshu Shukla took part in an 18-day scientific mission aboard the International Space Station, becoming the first Indian to visit the ISS.',
    examAngle: 'Review the ISS, microgravity research, international space cooperation, and links to India’s human-spaceflight programme.',
    sourceLabel: 'ISRO mission update',
    sourceUrl: 'https://new1.isro.gov.in/ISRO_EN/Axiom04_mission_successfully_concluded_return_ISRO_Gaganyatri_ShubhanshuShukla.html',
  },
  {
    id: 'maratha-landscapes-2025',
    year: 2025,
    date: '11 July 2025',
    title: 'Maratha Military Landscapes enter UNESCO’s World Heritage List',
    category: 'Culture & heritage',
    summary: 'UNESCO inscribed 12 forts across Maharashtra and Tamil Nadu as the Maratha Military Landscapes of India, bringing India’s total to 44 World Heritage properties.',
    examAngle: 'Remember the site’s location and significance, and revise UNESCO’s World Heritage Convention and India’s listed properties.',
    sourceLabel: 'UNESCO',
    sourceUrl: 'https://www.unesco.org/en/articles/maratha-military-landscapes-india-inscribed-unesco-world-heritage-list-indias-44th-world-heritage-0',
  },
  {
    id: 'union-budget-2026',
    year: 2026,
    date: '1 February 2026',
    title: 'Union Budget 2026–27: services and data-centre proposals',
    category: 'Economy',
    summary: 'The Budget proposed an Education-to-Employment-and-Enterprise committee focused on the services sector and a tax holiday through 2047 for qualifying foreign cloud-service providers using data-centre services in India.',
    examAngle: 'Connect the proposals to fiscal policy, employment, services-led growth, digital infrastructure, and investment.',
    sourceLabel: 'Press Information Bureau budget highlights',
    sourceUrl: 'https://archive.pib.gov.in/newsite/PrintRelease.aspx?relid=283160',
  },
  {
    id: 'india-eu-fta-2026',
    year: 2026,
    date: '27 January 2026',
    title: 'India–EU free-trade agreement negotiations conclude',
    category: 'International relations',
    summary: 'India and the European Union concluded negotiations on a free-trade agreement. The published text was still subject to legal revision and formal steps before entering into force.',
    examAngle: 'Study trade agreements, market access, supply chains, and the India–EU strategic partnership.',
    sourceLabel: 'European Commission agreement text',
    sourceUrl: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements/text-agreements_en',
  },
  {
    id: 'ai-impact-summit-2026',
    year: 2026,
    date: '18–19 February 2026',
    title: 'India AI Impact Summit and New Delhi Declaration',
    category: 'Science & technology',
    summary: 'The global AI summit in New Delhi concluded with adoption of the New Delhi Declaration on AI Impact, marking a new step in international cooperation on artificial intelligence.',
    examAngle: 'Review responsible AI, digital governance, international cooperation, and inclusive access to emerging technology.',
    sourceLabel: 'Ministry of External Affairs',
    sourceUrl: 'https://www.mea.gov.in/press-releases?dtl/40810/AI_Impact_Summit_2026_Concludes_with_Adoption_of_New_Delhi_Declaration',
  },
  {
    id: 't20-world-cup-2026',
    year: 2026,
    date: '8 March 2026',
    title: 'India wins the 2026 Men’s T20 World Cup',
    category: 'Sports',
    summary: 'India defeated New Zealand by 96 runs in the final in Ahmedabad, becoming the first team to win consecutive Men’s T20 World Cup titles.',
    examAngle: 'Note the host nations, final venue, result, and India’s record in international cricket.',
    sourceLabel: 'International Cricket Council',
    sourceUrl: 'https://www.icc-cricket.com/tournaments/mens-t20-world-cup-2026/news/live-india-new-zealand-chase-world-cup-glory',
  },
  {
    id: 'artemis-ii-2026',
    year: 2026,
    date: '1–10 April 2026',
    title: 'Artemis II completes a crewed lunar flyby',
    category: 'Science & technology',
    summary: 'NASA’s Artemis II carried four astronauts around the Moon aboard Orion. It was the first crewed Artemis flight and the first crewed lunar voyage since Apollo 17.',
    examAngle: 'Understand the difference between a lunar flyby and a landing, and revise Orion, SLS, and the Artemis programme.',
    sourceLabel: 'NASA Artemis II mission',
    sourceUrl: 'https://www.nasa.gov/mission/artemis-ii/',
  },
  {
    id: 'brics-summit-2026',
    year: 2026,
    date: '12–13 September 2026',
    title: '18th BRICS Summit and New Delhi Declaration',
    category: 'International relations',
    summary: 'BRICS leaders met in New Delhi under India’s 2026 chairship and adopted the New Delhi Declaration, themed “Building for Resilience, Innovation, Cooperation and Sustainability.”',
    examAngle: 'Revise BRICS membership, summit diplomacy, multilateral cooperation, and the Global South.',
    sourceLabel: 'Prime Minister of India',
    sourceUrl: 'https://www.pmindia.gov.in/en/news_updates/brics-new-delhi-declaration-building-for-resilience-innovation-cooperation-and-sustainability-september-12-2026/',
  },
  {
    id: 'asian-games-2026',
    year: 2026,
    date: '19 September–4 October 2026',
    title: 'Aichi-Nagoya hosts the 20th Asian Games',
    category: 'Sports',
    summary: 'The 20th Asian Games brought athletes from across the continent to Aichi-Nagoya, Japan. The official dates were 19 September to 4 October 2026.',
    examAngle: 'Remember the edition, host region, dates, and the role of major multi-sport events in international relations.',
    sourceLabel: 'Aichi-Nagoya 2026 official site',
    sourceUrl: 'https://www.aichi-nagoya2026.org/',
  },
];
