
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kpofakieaiyxjnhmkapd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb2Zha2llYWl5eGpuaG1rYXBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NzYxOCwiZXhwIjoyMDkxODIzNjE4fQ.i_0Q2jdMrqiMuMze1_gkPKE1TJhKDEPUYv9Gg7L36ME'
);

async function checkToken() {
  const token = 'QVFULJ';
  const { data, error } = await supabase
    .from('tracking_tokens')
    .select('*')
    .ilike('token', token);

  if (error) {
    console.error('Error fetching token:', error);
    return;
  }

  console.log('Token data:', data);

  // Also check if there are any tokens at all to see the format
  const { data: allTokens, error: allErr } = await supabase
    .from('tracking_tokens')
    .select('*')
    .limit(5);
  
  if (allErr) console.error('Error fetching all tokens:', allErr);
  else console.log('Sample tokens:', allTokens);
}

checkToken();
