
const { createClient } = require('@supabase/supabase-js');

async function checkLivreurs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('Checking for livreurs in profiles table...');
  const { data: livreurs, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('role', 'livreur')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Found', livreurs.length, 'livreurs:');
    livreurs.forEach(l => {
      console.log(`- ${l.full_name} (ID: ${l.id}, Created: ${l.created_at})`);
    });
  }
}

checkLivreurs();
