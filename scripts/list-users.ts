/**
 * Helper script to list all users in Supabase Auth.
 * Useful for finding the correct email to use with promote-superadmin.
 * 
 * Usage:
 *   npm run list-users
 *   or
 *   npx tsx scripts/list-users.ts
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

async function listUsers() {
  console.log('\n🔍 Fetching all users from Supabase Auth...\n');

  // Create Supabase client with service role key
  // TypeScript assertion: we've already checked these are defined above
  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
    },
  });

  try {
    // List all users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError.message);
      process.exit(1);
    }

    if (!authUsers || authUsers.users.length === 0) {
      console.log('⚠️  No users found in Supabase Auth.');
      console.log('\n💡 You need to log in first:');
      console.log('   1. Start your dev server: npm run dev');
      console.log('   2. Visit http://localhost:3000/login');
      console.log('   3. Sign in with Google');
      console.log('   4. Then run this script again\n');
      process.exit(0);
    }

    console.log(`✅ Found ${authUsers.users.length} user(s):\n`);
    
    // Check profiles for all users
    for (const user of authUsers.users) {
      console.log(`${authUsers.users.indexOf(user) + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log(`   Profile: error checking (${profileError.message})`);
      } else if (profile) {
        console.log(`   Profile: exists (is_superadmin: ${profile.is_superadmin})`);
      } else {
        console.log(`   Profile: not found`);
      }
      
      console.log('');
    }

    console.log('\n💡 To promote a user to superadmin, use:');
    console.log('   npm run promote-superadmin <email>\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

listUsers();
