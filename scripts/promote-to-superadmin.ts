/**
 * One-time script to promote a user to superadmin.
 * 
 * This script:
 * - Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
 * - Updates the profiles table to set is_superadmin = true
 * - Only runs locally from terminal, never exposed through UI
 * 
 * Usage:
 *   npm run promote-superadmin <email>
 *   or
 *   npx tsx scripts/promote-to-superadmin.ts <email>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Get email or user ID from command line arguments
const emailOrId = process.argv[2];

if (!emailOrId) {
  console.error('❌ Error: Email address or User ID is required');
  console.log('\nUsage:');
  console.log('  npm run promote-superadmin <email>');
  console.log('  npm run promote-superadmin <user-id>');
  console.log('  or');
  console.log('  npx tsx scripts/promote-to-superadmin.ts <email-or-id>');
  console.log('\nExample:');
  console.log('  npm run promote-superadmin user@example.com');
  console.log('  npm run promote-superadmin 040df492-e0be-4c28-bd1b-ae690f6c6be1');
  console.log('\n💡 Tip: Run "npm run list-users" to see all available users');
  process.exit(1);
}

async function promoteToSuperadmin() {
  // Check if input looks like a UUID (user ID) or email
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailOrId);
  
  console.log(`\n🔍 Looking up user: ${emailOrId}\n`);

  // Create Supabase client with service role key
  // TypeScript assertion: we've already checked these are defined above
  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
    },
  });

  try {
    let userId: string;
    let userEmail: string | undefined;

    if (isUUID) {
      // Input is a user ID - use it directly
      userId = emailOrId;
      console.log(`📋 Using provided User ID: ${userId}\n`);
      
      // Try to get user info for confirmation
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers?.users.find((u) => u.id === userId);
      if (user) {
        userEmail = user.email;
        console.log(`✅ Found user: ${userEmail || 'N/A'} (ID: ${userId})\n`);
      } else {
        console.log(`⚠️  User ID not found in auth.users, but will attempt to create/update profile\n`);
      }
    } else {
      // Input is an email - find the user ID
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Error fetching users:', authError.message);
        process.exit(1);
      }

      const user = authUsers.users.find((u) => u.email?.toLowerCase() === emailOrId.toLowerCase());

      if (!user) {
        console.error(`❌ Error: User with email "${emailOrId}" not found`);
        console.log('\n💡 This user needs to log in first:');
        console.log('   1. Start your dev server: npm run dev');
        console.log('   2. Visit http://localhost:3000/login');
        console.log('   3. Sign in with Google using that email');
        console.log('   4. Then run this script again\n');
        console.log('Available users:');
        authUsers.users.forEach((u) => {
          console.log(`  - ${u.email} (ID: ${u.id})`);
        });
        process.exit(1);
      }

      userId = user.id;
      userEmail = user.email;
      console.log(`✅ Found user: ${userEmail} (ID: ${userId.substring(0, 8)}...)\n`);
    }

    // Step 2: Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, is_superadmin')
      .eq('id', userId)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is okay
      console.error('❌ Error checking profile:', profileCheckError.message);
      process.exit(1);
    }

    if (existingProfile?.is_superadmin) {
      console.log('ℹ️  User is already a superadmin!');
      process.exit(0);
    }

    // Step 3: Upsert profile with is_superadmin = true
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          is_superadmin: true,
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error updating profile:', upsertError.message);
      process.exit(1);
    }

    console.log('✅ Successfully promoted user to superadmin!');
    console.log(`\n   ${userEmail ? `Email: ${userEmail}` : 'User ID'}: ${userId}`);
    console.log(`   is_superadmin: ${profile.is_superadmin}\n`);
    console.log('🎉 You can now access the admin dashboard at /admin\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

promoteToSuperadmin();
