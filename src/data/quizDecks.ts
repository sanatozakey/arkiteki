import type { QuizDeck } from '../types';

export const ALE_REVIEW_DECKS: QuizDeck[] = [
  {
    id: 'deck-nbcp',
    title: 'National Building Code (PD 1096)',
    subject: 'Building Laws, Setbacks & Zoning',
    badge: 'High Yield ALE',
    description: 'Crucial licensure exam items on parking computations, building height limits, setbacks, ceiling clearances, and open space (TOSL/USA).',
    questionCount: 6,
    questions: [
      {
        id: 'q-nbcp-1',
        type: 'multiple-choice',
        question: 'Under the National Building Code (PD 1096), what is the minimum ceiling height for habitable rooms with artificial ventilation on the second floor and above?',
        options: [
          '2.10 meters (7 feet)',
          '2.40 meters (7 feet 10 inches)',
          '2.70 meters (8 feet 10 inches)',
          '3.00 meters (9 feet 10 inches)',
        ],
        correctAnswer: 1, // index 1 = 2.40 meters
        explanation: 'Per PD 1096 Section 805: Rooms provided with artificial ventilation shall have ceiling heights not less than 2.40 meters measured from floor to ceiling. For the first story of buildings with artificial ventilation, it shall not be less than 2.70 meters.',
        codeReference: 'PD 1096 Sec. 805 (Ceiling Heights)',
        category: 'Building Laws',
      },
      {
        id: 'q-nbcp-2',
        type: 'multiple-choice',
        question: 'What is the standard minimum dimension for a perpendicular (90-degree) car parking slot under the NBCP?',
        options: [
          '2.15m x 5.00m',
          '2.50m x 5.00m',
          '3.00m x 6.00m',
          '2.75m x 5.50m',
        ],
        correctAnswer: 1, // 2.50m x 5.00m
        explanation: 'PD 1096 Table VII.5 defines the standard perpendicular car parking slot as 2.50 meters in width by 5.00 meters in length. Parallel parking is 2.15m x 6.00m.',
        codeReference: 'PD 1096 Rule VII Table VII.5',
        category: 'Parking & Vehicular',
      },
      {
        id: 'q-nbcp-3',
        type: 'multiple-choice',
        question: 'In an R-1 residential zone (single-family detached), what is the minimum required front setback for a corner lot?',
        options: [
          '3.00 meters',
          '4.50 meters',
          '5.00 meters',
          '6.00 meters',
        ],
        correctAnswer: 1, // 4.50m
        explanation: 'Under PD 1096 Table VIII.2, the minimum front setback for R-1 residential zoning is 4.50 meters, while sides and rear setbacks are 2.00 meters.',
        codeReference: 'PD 1096 Table VIII.2 (Setbacks)',
        category: 'Zoning & Setbacks',
      },
      {
        id: 'q-nbcp-4',
        type: 'multiple-choice',
        question: 'What does USA stand for in open space computations, and what is its minimum percentage in R-2 zoning without firewall?',
        options: [
          'Urban Space Allowance (10%)',
          'Unpaved Surface Area (15%)',
          'Unified Setback Area (20%)',
          'Universal Site Allocation (25%)',
        ],
        correctAnswer: 1, // Unpaved Surface Area (15%)
        explanation: 'USA stands for Unpaved Surface Area (portion of the open space left as bare soil, grass, or permeable planting to absorb stormwater runoff). For basic R-2 without firewall, the minimum USA is 15% of the total lot area.',
        codeReference: 'PD 1096 Rule VIII Table VIII.1',
        category: 'Open Space & TOSL',
      },
      {
        id: 'q-nbcp-5',
        type: 'multiple-choice',
        question: 'What is the maximum allowable travel distance to a fire exit in a fully sprinklered commercial building under RA 9514 (Fire Code)?',
        options: [
          '30.0 meters',
          '45.0 meters',
          '60.0 meters',
          '75.0 meters',
        ],
        correctAnswer: 2, // 60.0 meters
        explanation: 'Under the Fire Code of the Philippines (RA 9514), the maximum travel distance from any occupied point to an approved fire exit is 45 meters in non-sprinklered buildings, but is extended to 60 meters if the building is equipped with an automatic fire suppression system (sprinklers).',
        codeReference: 'RA 9514 Sec. 10.2.5.2',
        category: 'Life Safety & Egress',
      },
      {
        id: 'q-nbcp-6',
        type: 'multiple-choice',
        question: 'Under Philippine civil law (Article 1723 of the Civil Code), what is the liability period of an architect if a building collapses due to defects in the plans and specifications?',
        options: [
          '5 years',
          '10 years',
          '15 years',
          '20 years',
        ],
        correctAnswer: 2, // 15 years
        explanation: 'Article 1723 of the Civil Code of the Philippines dictates that the engineer or architect who drew up the plans and specifications for a building is liable for damages if within 15 years from completion, the edifice should collapse on account of defects in the plans or defects in the ground.',
        codeReference: 'Civil Code of the Philippines Art. 1723',
        category: 'Professional Practice',
      },
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: 'PD 1096: Standard Perpendicular Parking Dimensions',
        back: '2.50m (width) x 5.00m (length). Aisle width: 6.00m for two-way traffic.',
        category: 'Parking',
      },
      {
        id: 'fc-2',
        front: 'Ceiling Height: Habitable Rooms with Natural Ventilation',
        back: '2.70 meters minimum floor-to-ceiling clearance.',
        category: 'Clearance',
      },
      {
        id: 'fc-3',
        front: 'Blondel’s Ergonomic Stair Formula',
        back: '2R + T = 600mm to 650mm (Ideal is 630mm). Maximum riser: 200mm; Minimum tread: 250mm.',
        category: 'Stairways',
      },
      {
        id: 'fc-4',
        front: 'Article 1723 Civil Code: 15-Year Rule',
        back: 'The architect is civilly liable for 15 years if the building collapses due to design, structural, or soil analysis defects.',
        category: 'Legal Liability',
      },
    ],
  },
  {
    id: 'deck-bp344',
    title: 'Accessibility Law (BP 344)',
    subject: 'Universal Design & Barrier-Free Standards',
    badge: 'Must-Know Code',
    description: 'Master the exact numbers: ramp slopes, PWD parking widths, grab bar elevations, and tactile floor surface indicators.',
    questionCount: 4,
    questions: [
      {
        id: 'q-bp344-1',
        type: 'multiple-choice',
        question: 'What is the absolute maximum allowable slope for an accessible wheelchair ramp under BP 344?',
        options: [
          '1:8 (12.5%)',
          '1:10 (10.0%)',
          '1:12 (8.33%)',
          '1:16 (6.25%)',
        ],
        correctAnswer: 2, // 1:12
        explanation: 'BP 344 strictly mandates that accessible wheelchair ramps must not exceed a slope of 1:12 (8.33%). The maximum continuous ramp length without an intermediate landing is 6.00 meters.',
        codeReference: 'BP 344 Rule II Sec. 2.1',
        category: 'Ramps & Slopes',
      },
      {
        id: 'q-bp344-2',
        type: 'multiple-choice',
        question: 'Under BP 344, what are the mandatory mounting heights for dual continuous handrails along ramps and stairs?',
        options: [
          '600mm and 800mm',
          '700mm and 900mm',
          '750mm and 1000mm',
          '800mm and 1050mm',
        ],
        correctAnswer: 1, // 700mm and 900mm
        explanation: 'BP 344 requires dual handrails: the lower rail at 700mm for children and wheelchair users, and the upper rail at 900mm above the ramp or stair surface.',
        codeReference: 'BP 344 Appendix A',
        category: 'Handrails',
      },
      {
        id: 'q-bp344-3',
        type: 'multiple-choice',
        question: 'What is the minimum width for an accessible PWD parking slot under BP 344?',
        options: [
          '2.50 meters',
          '3.00 meters',
          '3.70 meters (3.80m in updated rules)',
          '4.20 meters',
        ],
        correctAnswer: 2, // 3.70m / 3.80m
        explanation: 'Accessible parking stalls for persons with disabilities require a total width of 3.70m to 3.80m (including a 1.20m shared pedestrian access transfer aisle) to allow a wheelchair to deploy safely.',
        codeReference: 'BP 344 Rule III Sec. 1',
        category: 'Parking',
      },
      {
        id: 'q-bp344-4',
        type: 'multiple-choice',
        question: 'What is the minimum clear opening width required for accessible entrance doors under BP 344?',
        options: [
          '0.70 meters',
          '0.80 meters',
          '0.90 meters',
          '1.00 meters',
        ],
        correctAnswer: 1, // 0.80 meters minimum clear (0.90m leaf)
        explanation: 'BP 344 requires all accessible doorways to have a clear opening width of not less than 800mm (0.80m), measured between the face of the door and the stop when opened 90 degrees.',
        codeReference: 'BP 344 Appendix A Sec. 3',
        category: 'Doors & Clearances',
      },
    ],
    flashcards: [
      {
        id: 'fc-bp-1',
        front: 'BP 344: Max Ramp Slope',
        back: '1:12 (8.33%). Max run between landings is 6.00 meters.',
        category: 'Ramp',
      },
      {
        id: 'fc-bp-2',
        front: 'BP 344: Handrail Heights',
        back: 'Dual rails: 0.70m (lower) and 0.90m (upper). Handrail extensions: 300mm at top and bottom.',
        category: 'Handrail',
      },
      {
        id: 'fc-bp-3',
        front: 'BP 344: Wheelchair Turning Radius',
        back: '1.50m x 1.50m level clear space for a 360-degree wheelchair turn.',
        category: 'Space',
      },
    ],
  },
  {
    id: 'deck-history',
    title: 'History of Architecture & Master Architects',
    subject: 'Styles, Landmarks & Iconic Philosophies',
    badge: 'Core Theory',
    description: 'Test your memory on famous architects, classic architectural orders, modern movements, and Filipino masters.',
    questionCount: 4,
    questions: [
      {
        id: 'q-hist-1',
        type: 'multiple-choice',
        question: 'Which master architect coined the legendary dictum "Less is more" and designed the Farnsworth House and Seagram Building?',
        options: [
          'Le Corbusier',
          'Frank Lloyd Wright',
          'Ludwig Mies van der Rohe',
          'Walter Gropius',
        ],
        correctAnswer: 2, // Mies van der Rohe
        explanation: 'Ludwig Mies van der Rohe is famous for "Less is more", pioneered steel and glass skyscraper architecture, and was the director of the Bauhaus before moving to Chicago.',
        category: 'Modern Masters',
      },
      {
        id: 'q-hist-2',
        type: 'multiple-choice',
        question: 'Who was the Philippine National Artist for Architecture known for designing the Cultural Center of the Philippines (CCP) and the Church of the Holy Sacrifice at UP Diliman?',
        options: [
          'Francisco Mañosa',
          'Leandro V. Locsin',
          'Juan Nakpil',
          'Pablo Antonio',
        ],
        correctAnswer: 1, // Leandro V. Locsin
        explanation: 'Leandro V. Locsin (1928–1994) is celebrated for his masterful floating mass of raw concrete (Brutalism combined with tropical monumentality), best exemplified by the CCP and the thin-shell concrete dome of the UP Chapel.',
        category: 'Filipino Masters',
      },
      {
        id: 'q-hist-3',
        type: 'multiple-choice',
        question: 'What are the three classical Greek architectural orders in order of historical emergence and decorative complexity?',
        options: [
          'Corinthian, Ionic, Doric',
          'Doric, Ionic, Corinthian',
          'Tuscan, Composite, Doric',
          'Ionic, Doric, Corinthian',
        ],
        correctAnswer: 1, // Doric, Ionic, Corinthian
        explanation: 'The three Greek orders are Doric (sturdy, simple cushion capital), Ionic (fluted columns with scroll-like volute capitals), and Corinthian (tall, slender with intricate acanthus leaf capitals).',
        category: 'Classical Architecture',
      },
      {
        id: 'q-hist-4',
        type: 'multiple-choice',
        question: 'Which architect is known for "Organic Architecture", "Fallingwater", and the Guggenheim Museum in New York?',
        options: [
          'Alvar Aalto',
          'Louis Kahn',
          'Frank Lloyd Wright',
          'Eero Saarinen',
        ],
        correctAnswer: 2, // Frank Lloyd Wright
        explanation: 'Frank Lloyd Wright pioneered Organic Architecture—the philosophy that structures should exist in harmonious unity with their natural environment, immortalized in Fallingwater.',
        category: 'Modern Masters',
      },
    ],
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
        back: '"Form ever follows function." Mentor to Frank Lloyd Wright.',
        category: 'Theory',
      },
    ],
  },
];
