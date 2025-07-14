// import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { mpCorePerson } from './schema';

async function seed() {
  if (!db) {
    console.error('Database connection not available');
    return;
  }

  const email = 'test@test.com';

  const result = await db
    .insert(mpCorePerson)
    .values([
      {
        email: email,
        firstName: 'Test',
        lastName: 'User',
        personType: 'player',
        role: 'owner',
      },
    ])
    .returning();

  if (result[0]) {
    console.log('Initial user created:', result[0].email);
  } else {
    console.log('Failed to create initial user');
  }

  // Note: Teams are handled as group_id and group_name in current_participants
  // No separate teams table exists in the current schema
}

seed()
  .catch(error => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
