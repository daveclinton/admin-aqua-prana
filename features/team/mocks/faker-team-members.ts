import { faker } from "@faker-js/faker"
import type { AdminTeamMemberDTO, TeamMemberRole } from "@/features/team/types"

const TEAM_ROLES: TeamMemberRole[] = [
  "Super Admin",
  "Support Lead",
  "Field Ops",
  "Finance",
]

const REGIONS = [
  "Nairobi",
  "Kiambu",
  "Mombasa",
  "Nakuru",
  "Kisumu",
  "Eldoret",
]

faker.seed(20260313)

export const teamMembersDataset: AdminTeamMemberDTO[] = Array.from({
  length: 120,
}).map(() => ({
  user_id: faker.string.uuid(),
  full_name: faker.person.fullName(),
  work_email: faker.internet.email().toLowerCase(),
  region_name: faker.helpers.arrayElement(REGIONS),
  access_role: faker.helpers.arrayElement(TEAM_ROLES),
  status: faker.helpers.weightedArrayElement([
    { value: "active", weight: 7 },
    { value: "pending", weight: 2 },
    { value: "invited", weight: 1 },
  ]),
  open_tickets: faker.number.int({ min: 0, max: 24 }),
  last_active_at: faker.date.recent({ days: 30 }).toISOString(),
}))
