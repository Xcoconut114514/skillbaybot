import { readFileSync, writeFileSync, existsSync } from 'fs';

const DATA_FILE = './data.json';

interface UserData {
  activatedSkills: string[];
}

type Store = Record<string, UserData>;

function load(): Store {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function save(store: Store) {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

export function activateSkill(userId: string, skillId: string) {
  const store = load();
  if (!store[userId]) store[userId] = { activatedSkills: [] };
  if (!store[userId].activatedSkills.includes(skillId)) {
    store[userId].activatedSkills.push(skillId);
  }
  save(store);
}

export function hasSkill(userId: string, skillId: string): boolean {
  const store = load();
  return store[userId]?.activatedSkills?.includes(skillId) ?? false;
}

export function getUserSkills(userId: string): string[] {
  const store = load();
  return store[userId]?.activatedSkills ?? [];
}
