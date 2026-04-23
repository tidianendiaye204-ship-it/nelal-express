
const { createClient } = require('@supabase/supabase-js');

async function checkAllProfiles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('Checking all profiles...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Found', profiles.length, 'profiles:');
    profiles.forEach(p => {
      console.log(`- ${p.full_name} (ID: ${p.id}, Role: ${p.role})`);
    });
  }
}

checkAllProfiles();
