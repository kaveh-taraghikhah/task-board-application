import * as argon2 from 'argon2';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';

const SEED_USERS = [
  {
    email: 'owner@taskboard.local',
    fullName: 'صاحب سیستم',
    password: 'OwnerPass123!',
    role: UserRole.Owner,
  },
  {
    email: 'manager@taskboard.local',
    fullName: 'مدیر تیم',
    password: 'ManagerPass123!',
    role: UserRole.Manager,
  },
  {
    email: 'member@taskboard.local',
    fullName: 'عضو تیم',
    password: 'MemberPass123!',
    role: UserRole.Member,
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const users = AppDataSource.getRepository(User);

  for (const item of SEED_USERS) {
    const existing = await users.findOne({ where: { email: item.email } });
    if (existing) {
      console.log(`Skipping ${item.email}; already present.`);
      continue;
    }

    const user = users.create({
      email: item.email,
      fullName: item.fullName,
      role: item.role,
      isActive: true,
      passwordHash: await argon2.hash(item.password),
    });
    await users.save(user);
    console.log(`Created ${item.role} user: ${item.email}`);
  }

  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
