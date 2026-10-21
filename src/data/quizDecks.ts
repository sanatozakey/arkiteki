import type { QuizDeck } from '../types';
import { 
  NBCP_QUESTIONS_50, 
  BP344_QUESTIONS_50, 
  HISTORY_QUESTIONS_50 
} from './preloadedQuestionBanks';

export const ALE_REVIEW_DECKS: QuizDeck[] = [
  {
    id: 'deck-nbcp',
    title: 'National Building Code (PD 1096)',
    subject: 'Building Laws, Setbacks & Zoning',
    badge: 'High Yield ALE',
    description: 'Crucial licensure exam items on parking computations, building height limits, setbacks, ceiling clearances, and open space (TOSL/USA).',
    questionCount: NBCP_QUESTIONS_50.length,
    questions: NBCP_QUESTIONS_50,
    flashcards: [
      {
        id: 'fc-nbcp-1',
        front: 'PD 1096: Standard Perpendicular Parking Dimensions',
        back: '2.50m (width) x 5.00m (length). Aisle width: 6.00m for two-way traffic.',
        category: 'Parking',
      },
      {
        id: 'fc-nbcp-2',
        front: 'Ceiling Height: Habitable Rooms with Natural Ventilation',
        back: '2.70 meters minimum floor-to-ceiling clearance.',
        category: 'Clearance',
      },
      {
        id: 'fc-nbcp-3',
        front: 'Ceiling Height: Habitable Rooms with Artificial Ventilation',
        back: '2.40 meters minimum (first floor still requires 2.70m).',
        category: 'Clearance',
      },
      {
        id: 'fc-nbcp-4',
        front: 'Article 1723 Civil Code: 15-Year Rule',
        back: 'The architect is civilly liable for 15 years if the building collapses due to design, structural, or soil analysis defects.',
        category: 'Legal Liability',
      },
      {
        id: 'fc-nbcp-5',
        front: 'PD 1096 Minimum Habitable Room Floor Area',
        back: '6.00 sq.m with a least horizontal dimension of 2.00 meters.',
        category: 'Room Sizes',
      },
      {
        id: 'fc-nbcp-6',
        front: 'Total Open Space within Lot (TOSL)',
        back: 'TOSL = USA (Unpaved Surface Area) + ISA (Impervious Surface Area).',
        category: 'Open Space',
      },
    ],
  },
  {
    id: 'deck-bp344',
    title: 'Accessibility Law (BP 344)',
    subject: 'Universal Design & Barrier-Free Standards',
    badge: 'Must-Know Code',
    description: 'Master the exact numbers: ramp slopes, PWD parking widths, grab bar elevations, and tactile floor surface indicators.',
    questionCount: BP344_QUESTIONS_50.length,
    questions: BP344_QUESTIONS_50,
    flashcards: [
      {
        id: 'fc-bp-1',
        front: 'BP 344: Max Ramp Slope',
        back: '1:12 (8.33%). Max continuous run between landings is 6.00 meters.',
        category: 'Ramp',
      },
      {
        id: 'fc-bp-2',
        front: 'BP 344: Handrail Heights',
        back: 'Dual rails: 0.70m (lower) and 0.90m (upper). Horizontal extensions: 300mm at top and bottom.',
        category: 'Handrail',
      },
      {
        id: 'fc-bp-3',
        front: 'BP 344: Wheelchair Turning Radius',
        back: '1.50m x 1.50m level clear space for a 360-degree wheelchair turn.',
        category: 'Space',
      },
      {
        id: 'fc-bp-4',
        front: 'BP 344: Accessible Door Clear Width',
        back: '0.80m minimum clear opening width measured between door face and latch stop.',
        category: 'Doors',
      },
      {
        id: 'fc-bp-5',
        front: 'BP 344: Accessible Parking Bay Width',
        back: '3.70 meters total width (2.50m stall + 1.20m shared accessible pedestrian walkway).',
        category: 'Parking',
      },
    ],
  },
  {
    id: 'deck-history',
    title: 'History of Architecture & Master Architects',
    subject: 'Styles, Landmarks & Iconic Philosophies',
    badge: 'Core Theory',
    description: 'Test your memory on famous architects, classic architectural orders, modern movements, and Filipino masters.',
    questionCount: HISTORY_QUESTIONS_50.length,
    questions: HISTORY_QUESTIONS_50,
    flashcards: [
      {
        id: 'fc-h-1',
        front: 'Le Corbusier: 5 Points of Modern Architecture',
        back: '1. Pilotis (stilts), 2. Free ground plan, 3. Free facade, 4. Ribbon windows, 5. Roof garden.',
        category: 'Theory',
      },
      {
        id: 'fc-h-2',
        front: 'Bobby Mañosa Design Philosophy',
        back: '"Architecture must be true to itself, its land, and its people." Champion of Neo-Vernacular Filipino Architecture (Coconut Palace, Amanpulo).',
        category: 'Filipino Arki',
      },
      {
        id: 'fc-h-3',
        front: 'Louis Sullivan Dictum',
        back: '"Form ever follows function." Mentor to Frank Lloyd Wright and father of modern skyscrapers.',
        category: 'Theory',
      },
      {
        id: 'fc-h-4',
        front: 'Ludwig Mies van der Rohe Dictum',
        back: '"Less is more" and "God is in the details." Pioneer of minimalist steel-and-glass architecture.',
        category: 'Modernism',
      },
      {
        id: 'fc-h-5',
        front: 'Leandro V. Locsin Landmark Works',
        back: 'Cultural Center of the Philippines (CCP), PICC, Folk Arts Theater, and Istana Nurul Iman.',
        category: 'Filipino Masters',
      },
    ],
  },
];
