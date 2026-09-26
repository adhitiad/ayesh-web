import { request } from '../libs/http';
import {
  type AgentInfo,
  type SkillInfo,
  agentListSchema,
  skillInfoSchema,
  skillListSchema,
} from '../types';

export async function getAgents(): Promise<AgentInfo[]> {
  const data = await request(agentListSchema, { url: '/agents' });
  return data.agents ?? [];
}

export async function getSkills(): Promise<string[]> {
  const data = await request(skillListSchema, { url: '/skills' });
  return data.skills ?? [];
}

export function getSkillDetail(name: string): Promise<SkillInfo> {
  return request(skillInfoSchema, { url: `/skills/${encodeURIComponent(name)}` });
}
