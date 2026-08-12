/** Demo TEAM roster — replace with npm run sync:team-roster for production data. */
export interface TeamHospitalInput {
  name: string;
  state: string;
  city?: string;
  ccn?: string;
  cbsaCode?: string;
  participation?: 'Mandatory' | 'Voluntary';
  healthSystem?: string;
}

export interface TeamHospital extends TeamHospitalInput {
  slug: string;
}

export const teamHospitals: TeamHospital[] = [
  { slug: "cedars-sinai-medical-center-ca", name: "Cedars-Sinai Medical Center", state: 'CA', city: "Los Angeles", ccn: '050625', participation: 'Mandatory', healthSystem: "Cedars-Sinai" },
  { slug: "ucla-medical-center-ca", name: "UCLA Medical Center", state: 'CA', city: "Los Angeles", ccn: '050262', participation: 'Mandatory', healthSystem: "UCLA Health" },
  { slug: "stanford-health-care-ca", name: "Stanford Health Care", state: 'CA', city: "Stanford", ccn: '050441', participation: 'Mandatory', healthSystem: "Stanford Medicine" },
  { slug: "memorial-hermann-texas-medical-center-tx", name: "Memorial Hermann Texas Medical Center", state: 'TX', city: "Houston", ccn: '450068', participation: 'Mandatory', healthSystem: "Memorial Hermann" },
  { slug: "houston-methodist-hospital-tx", name: "Houston Methodist Hospital", state: 'TX', city: "Houston", ccn: '450076', participation: 'Mandatory', healthSystem: "Houston Methodist" },
  { slug: "nyu-langone-hospitals-ny", name: "NYU Langone Hospitals", state: 'NY', city: "New York", ccn: '330214', participation: 'Mandatory', healthSystem: "NYU Langone" },
  { slug: "mount-sinai-hospital-ny", name: "Mount Sinai Hospital", state: 'NY', city: "New York", ccn: '330024', participation: 'Mandatory', healthSystem: "Mount Sinai" },
  { slug: "massachusetts-general-hospital-ma", name: "Massachusetts General Hospital", state: 'MA', city: "Boston", ccn: '220071', participation: 'Mandatory', healthSystem: "Mass General Brigham" },
  { slug: "mayo-clinic-hospital-rochester-mn", name: "Mayo Clinic Hospital Rochester", state: 'MN', city: "Rochester", ccn: '240014', participation: 'Mandatory', healthSystem: "Mayo Clinic" },
  { slug: "northwestern-memorial-hospital-il", name: "Northwestern Memorial Hospital", state: 'IL', city: "Chicago", ccn: '140281', participation: 'Mandatory', healthSystem: "Northwestern Medicine" },
  { slug: "emory-university-hospital-ga", name: "Emory University Hospital", state: 'GA', city: "Atlanta", ccn: '110079', participation: 'Mandatory', healthSystem: "Emory Healthcare" },
  { slug: "duke-university-hospital-nc", name: "Duke University Hospital", state: 'NC', city: "Durham", ccn: '340030', participation: 'Mandatory', healthSystem: "Duke Health" },
  { slug: "university-of-michigan-hospital-mi", name: "University of Michigan Hospital", state: 'MI', city: "Ann Arbor", ccn: '230046', participation: 'Mandatory', healthSystem: "Michigan Medicine" },
  { slug: "banner-university-medical-center-phoenix-az", name: "Banner University Medical Center Phoenix", state: 'AZ', city: "Phoenix", ccn: '030014', participation: 'Mandatory', healthSystem: "Banner Health" },
  { slug: "mercy-hospital-springfield-mo", name: "Mercy Hospital Springfield", state: 'MO', city: "Springfield", ccn: '260047', participation: 'Mandatory', healthSystem: "Mercy" },
  { slug: "st-mary-medical-center-pa", name: "St. Mary Medical Center", state: 'PA', city: "Langhorne", ccn: '390049', participation: 'Mandatory', healthSystem: "Trinity Health" },
  { slug: "uchealth-university-of-colorado-hospital-co", name: "UCHealth University of Colorado Hospital", state: 'CO', city: "Aurora", ccn: '060009', participation: 'Mandatory', healthSystem: "UCHealth" },
  { slug: "oregon-health-science-university-hospital-or", name: "Oregon Health & Science University Hospital", state: 'OR', city: "Portland", ccn: '220009', participation: 'Mandatory', healthSystem: "OHSU" },
  { slug: "vanderbilt-university-medical-center-tn", name: "Vanderbilt University Medical Center", state: 'TN', city: "Nashville", ccn: '440039', participation: 'Mandatory', healthSystem: "Vanderbilt Health" },
  { slug: "university-of-washington-medical-center-wa", name: "University of Washington Medical Center", state: 'WA', city: "Seattle", ccn: '500008', participation: 'Mandatory', healthSystem: "UW Medicine" },
  { slug: "intermountain-medical-center-ut", name: "Intermountain Medical Center", state: 'UT', city: "Murray", ccn: '460009', participation: 'Mandatory', healthSystem: "Intermountain Health" },
];

export const TEAM_MANDATED_HOSPITAL_COUNT = teamHospitals.length;
