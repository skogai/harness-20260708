export const SKILLS = [
  { id: "harness-creator", category: "development", name: "Harness creator" },
  { id: "toon-formatter", category: "utilities", name: "TOON formatter" },
  {
    id: "agent-entrypoint-design",
    category: "harness",
    name: "agent-entrypoint-design",
  },
  {
    id: "agent-ledger-and-delivery",
    category: "harness",
    name: "agent-ledger-and-delivery",
  },
  {
    id: "atomic-commit-discipline",
    category: "harness",
    name: "atomic-commit-discipline",
  },
  {
    id: "design-doc-and-task-board",
    category: "harness",
    name: "design-doc-and-task-board",
  },
  { id: "quality-gardening", category: "harness", name: "quality-gardening" },
  {
    id: "repo-contracts-and-boundaries",
    category: "harness",
    name: "repo-contracts-and-boundaries",
  },
  {
    id: "repo-harness-assessment",
    category: "harness",
    name: "repo-harness-assessment",
  },
  {
    id: "runtime-evidence-and-tracing",
    category: "harness",
    name: "runtime-evidence-and-tracing",
  },
  {
    id: "validation-harness-design",
    category: "harness",
    name: "validation-harness-design",
  },
];

const TOON_COMMANDS = [
  "analyze-tokens",
  "convert-to-toon",
  "toon-decode",
  "toon-encode",
  "toon-validate",
];

const ALL_SKILL_IDS = SKILLS.map((s) => s.id);

export const profiles = {
  all: {
    name: "All skills",
    description: "Every shipped skill",
    skills: ALL_SKILL_IDS,
    toon: true,
    hooks: false,
    commands: TOON_COMMANDS,
  },

  "harness-meta": {
    name: "Harness/SkogAI meta",
    description:
      "Self-hosting profile for repositories that define or govern agent harness behavior",
    skills: ALL_SKILL_IDS,
    toon: true,
    hooks: true,
    commands: TOON_COMMANDS,
  },

  minimal: {
    name: "Minimal (TOON only)",
    description: "Just TOON token-optimization utilities",
    skills: ["toon-formatter"],
    toon: true,
    hooks: false,
    commands: TOON_COMMANDS,
  },

  custom: {
    name: "Custom",
    description: "Pick skills interactively",
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
