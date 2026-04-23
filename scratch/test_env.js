
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing ENV!');
    return;
  }

  const supabase = createClient(url, key);
  console.log('Client created.');

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Auth Error:', error.message);
  } else {
    console.log('User:', user?.id);
  }
}

test();
