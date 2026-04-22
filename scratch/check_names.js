const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'livreur');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Livreurs found:', data.length);
  const nullNames = data.filter(l => !l.full_name);
  console.log('Livreurs with null name:', nullNames.length);
  if (nullNames.length > 0) {
    console.log(JSON.stringify(nullNames, null, 2));
  }
}

check();
