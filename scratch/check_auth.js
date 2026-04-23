
const { createClient } = require('@supabase/supabase-js');

async function checkAuthUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Checking auth.users...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Found', users.length, 'users in Auth:');
    users.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id}, Role: ${u.user_metadata?.role})`);
    });
  }
}

checkAuthUsers();
