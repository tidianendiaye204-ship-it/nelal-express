
const { createClient } = require('@supabase/supabase-js');

async function checkPolicies() {
  // We need the service role key to check policies from the information_schema or pg_policies
  // But we can just try to select from profiles as an anon user and see if it works.
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('Testing select from profiles...');
  const { data, error } = await supabase.from('profiles').select('id, role').limit(5);

  if (error) {
    console.error('Error selecting from profiles:', error.message);
    if (error.message.includes('recursion') || error.message.includes('stack depth')) {
      console.error('DETECTED INFINITE RECURSION in RLS policies!');
    }
  } else {
    console.log('Select from profiles successful. Count:', data.length);
  }
}

checkPolicies();
