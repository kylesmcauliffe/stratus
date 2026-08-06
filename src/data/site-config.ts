export const siteConfig = {
  name: 'Rainfall Hospital Directory',
  tagline: 'Internal CMS TEAM Hospital Lookup',
  description:
    'Internal searchable directory and state map of acute-care hospitals mandated under the CMS Transforming Episode Accountability Model (TEAM).',
  email: 'info@rainfallhealth.com',
  appUrl: 'https://app.rainfallhealth.com/signin',
  social: {
    instagram: 'https://www.instagram.com/rainfallhealth/',
    linkedin: 'https://www.linkedin.com/company/rainfall-health/',
    twitter: 'https://twitter.com/rainfallhealth',
  },
  crisisNotice:
    'If You Are In A Life Threatening Situation Please Call 911. Contact The Suicide And Crisis Lifeline At 988 For Immediate Assistance.',
  copyright: `© ${new Date().getFullYear()} Rainfall Health. Internal Use Only`,
} as const;
