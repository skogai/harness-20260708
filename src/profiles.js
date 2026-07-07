export const SKILLS = [
  { id: 'harness-creator', category: 'development', name: 'Harness creator' },
  { id: 'toon-formatter', category: 'utilities', name: 'TOON formatter' },
];

export const profiles = {
  all: {
    name: 'All skills',
    description: 'Every shipped skill',
    skills: SKILLS.map((s) => s.id),
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'],
  },

  minimal: {
    name: 'Minimal (TOON only)',
    description: 'Just TOON token-optimization utilities',
    skills: ['toon-formatter'],
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'],
  },

  custom: {
    name: 'Custom',
    description: 'Pick skills interactively',
    skills: [],
    toon: true,
    hooks: false,
    commands: [],
  },
};

export function getProfile(id) {
  return profiles[id];
}

export function getProfileChoices() {
  return Object.entries(profiles).map(([id, profile]) => ({
    name: `${profile.name} — ${profile.description}`,
    value: id,
    short: profile.name,
  }));
}

export function getSkillChoices() {
  return SKILLS.map((s) => ({
    name: `${s.id} — ${s.name}`,
    value: s.id,
    short: s.id,
  }));
}
