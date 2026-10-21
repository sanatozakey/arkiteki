export interface PhilippineSchool {
  id: string;
  name: string;
  shortName: string;
  campus?: string;
  region: string;
}

export const PHILIPPINE_SCHOOLS: PhilippineSchool[] = [
  { id: 'ust', name: 'University of Santo Tomas (UST)', shortName: 'UST', campus: 'Manila', region: 'NCR' },
  { id: 'up-diliman', name: 'University of the Philippines Diliman (UP Diliman)', shortName: 'UP Diliman', campus: 'Quezon City', region: 'NCR' },
  { id: 'tip-qc', name: 'Technological Institute of the Philippines (TIP QC)', shortName: 'TIP QC', campus: 'Quezon City', region: 'NCR' },
  { id: 'tip-manila', name: 'Technological Institute of the Philippines (TIP Manila)', shortName: 'TIP Manila', campus: 'Manila', region: 'NCR' },
  { id: 'mapua', name: 'Mapúa University', shortName: 'Mapúa', campus: 'Intramuros / Makati', region: 'NCR' },
  { id: 'feu-manila', name: 'Far Eastern University (FEU - IARFA)', shortName: 'FEU', campus: 'Manila', region: 'NCR' },
  { id: 'benilde', name: 'De La Salle-College of Saint Benilde (DLS-CSB)', shortName: 'Benilde / CSB', campus: 'Manila', region: 'NCR' },
  { id: 'dlsu', name: 'De La Salle University (DLSU)', shortName: 'DLSU', campus: 'Taft, Manila', region: 'NCR' },
  { id: 'pup-manila', name: 'Polytechnic University of the Philippines (PUP)', shortName: 'PUP', campus: 'Sta. Mesa, Manila', region: 'NCR' },
  { id: 'adamson', name: 'Adamson University (AdU)', shortName: 'Adamson', campus: 'Manila', region: 'NCR' },
  { id: 'nu-manila', name: 'National University (NU)', shortName: 'NU', campus: 'Manila / MOA', region: 'NCR' },
  { id: 'usc-cebu', name: 'University of San Carlos (USC SAFAD)', shortName: 'USC', campus: 'Cebu City', region: 'Region VII (Central Visayas)' },
  { id: 'slu-baguio', name: 'Saint Louis University (SLU Baguio)', shortName: 'SLU', campus: 'Baguio City', region: 'CAR' },
  { id: 'batstateu', name: 'Batangas State University (BatStateU)', shortName: 'BatStateU', campus: 'Batangas', region: 'Region IV-A (CALABARZON)' },
  { id: 'bulsu', name: 'Bulacan State University (BulSU)', shortName: 'BulSU', campus: 'Malolos, Bulacan', region: 'Region III (Central Luzon)' },
  { id: 'dhvsu', name: 'Don Honorio Ventura State University (DHVSU)', shortName: 'DHVSU', campus: 'Bacolor, Pampanga', region: 'Region III (Central Luzon)' },
  { id: 'hau', name: 'Holy Angel University (HAU)', shortName: 'HAU', campus: 'Angeles City, Pampanga', region: 'Region III (Central Luzon)' },
  { id: 'tup-manila', name: 'Technological University of the Philippines (TUP)', shortName: 'TUP', campus: 'Manila', region: 'NCR' },
  { id: 'rtu', name: 'Rizal Technological University (RTU)', shortName: 'RTU', campus: 'Mandaluyong / Pasig', region: 'NCR' },
  { id: 'ue-caloocan', name: 'University of the East (UE Caloocan)', shortName: 'UE Caloocan', campus: 'Caloocan', region: 'NCR' },
  { id: 'ue-manila', name: 'University of the East (UE Manila)', shortName: 'UE Manila', campus: 'Manila', region: 'NCR' },
  { id: 'admu', name: 'Ateneo de Manila University (ADMU)', shortName: 'Ateneo', campus: 'Quezon City', region: 'NCR' },
  { id: 'addu', name: 'Ateneo de Davao University (ADDU)', shortName: 'AdDU', campus: 'Davao City', region: 'Region XI (Davao)' },
  { id: 'cit-u', name: 'Cebu Institute of Technology - University (CIT-U)', shortName: 'CIT-U', campus: 'Cebu City', region: 'Region VII (Central Visayas)' },
  { id: 'usa-iloilo', name: 'University of San Agustin (USA)', shortName: 'San Agustin', campus: 'Iloilo City', region: 'Region VI (Western Visayas)' },
  { id: 'cpu-iloilo', name: 'Central Philippine University (CPU)', shortName: 'CPU', campus: 'Iloilo City', region: 'Region VI (Western Visayas)' },
  { id: 'bicol-u', name: 'Bicol University (BU)', shortName: 'BU', campus: 'Legazpi, Albay', region: 'Region V (Bicol)' },
  { id: 'uc-baguio', name: 'University of the Cordilleras (UC)', shortName: 'UC Baguio', campus: 'Baguio City', region: 'CAR' },
  { id: 'ub-baguio', name: 'University of Baguio (UB)', shortName: 'UB Baguio', campus: 'Baguio City', region: 'CAR' },
  { id: 'up-mindanao', name: 'University of the Philippines Mindanao (UP Mindanao)', shortName: 'UP Mindanao', campus: 'Davao City', region: 'Region XI (Davao)' },
  { id: 'msu-iit', name: 'Mindanao State University - IIT (MSU-IIT)', shortName: 'MSU-IIT', campus: 'Iligan City', region: 'Region X (Northern Mindanao)' },
  { id: 'um-davao', name: 'University of Mindanao (UM Davao)', shortName: 'UM Davao', campus: 'Davao City', region: 'Region XI (Davao)' },
  { id: 'wmsu', name: 'Western Mindanao State University (WMSU)', shortName: 'WMSU', campus: 'Zamboanga City', region: 'Region IX (Zamboanga)' },
  { id: 'plm', name: 'Pamantasan ng Lungsod ng Maynila (PLM)', shortName: 'PLM', campus: 'Intramuros, Manila', region: 'NCR' },
  { id: 'lpu', name: 'Lyceum of the Philippines University (LPU)', shortName: 'LPU', campus: 'Manila / Cavite', region: 'NCR' },
  { id: 'tsu', name: 'Tarlac State University (TSU)', shortName: 'TSU', campus: 'Tarlac City', region: 'Region III (Central Luzon)' },
  { id: 'cvsu', name: 'Cavite State University (CvSU)', shortName: 'CvSU', campus: 'Indang, Cavite', region: 'Region IV-A (CALABARZON)' },
  { id: 'earist', name: 'Eulogio "Amang" Rodriguez Institute of Science and Technology (EARIST)', shortName: 'EARIST', campus: 'Manila', region: 'NCR' },
  { id: 'uphsd', name: 'University of Perpetual Help System DALTA (UPHSD)', shortName: 'Perpetual Help', campus: 'Las Piñas / Calamba', region: 'NCR' },
  { id: 'neust', name: 'Nueva Ecija University of Science and Technology (NEUST)', shortName: 'NEUST', campus: 'Cabanatuan City', region: 'Region III (Central Luzon)' },
  { id: 'evsu', name: 'Eastern Visayas State University (EVSU)', shortName: 'EVSU', campus: 'Tacloban City', region: 'Region VIII (Eastern Visayas)' },
  { id: 'unp-vigan', name: 'University of Northern Philippines (UNP)', shortName: 'UNP', campus: 'Vigan, Ilocos Sur', region: 'Region I (Ilocos)' },
  { id: 'smu', name: 'Saint Mary\'s University (SMU)', shortName: 'SMU', campus: 'Bayombong, Nueva Vizcaya', region: 'Region II (Cagayan Valley)' },
  { id: 'psu-palawan', name: 'Palawan State University (PSU)', shortName: 'PSU Palawan', campus: 'Puerto Princesa', region: 'MIMAROPA' },
  { id: 'psu-pangasinan', name: 'Pangasinan State University (PSU)', shortName: 'PSU Pangasinan', campus: 'Lingayen, Pangasinan', region: 'Region I (Ilocos)' },
  { id: 'slsu', name: 'Southern Luzon State University (SLSU)', shortName: 'SLSU', campus: 'Lucban, Quezon', region: 'Region IV-A (CALABARZON)' },
  { id: 'lspu', name: 'Laguna State Polytechnic University (LSPU)', shortName: 'LSPU', campus: 'Laguna', region: 'Region IV-A (CALABARZON)' },
];

export function filterPhilippineSchools(query: string): PhilippineSchool[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  return PHILIPPINE_SCHOOLS.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(clean);
    const shortMatch = s.shortName.toLowerCase().includes(clean);
    const campusMatch = s.campus?.toLowerCase().includes(clean);
    return nameMatch || shortMatch || campusMatch;
  }).slice(0, 8);
}
