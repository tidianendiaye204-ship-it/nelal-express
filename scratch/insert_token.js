
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kpofakieaiyxjnhmkapd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb2Zha2llYWl5eGpuaG1rYXBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NzYxOCwiZXhwIjoyMDkxODIzNjE4fQ.i_0Q2jdMrqiMuMze1_gkPKE1TJhKDEPUYv9Gg7L36ME'
);

async function insertToken() {
  const orderId = '6b0f4881-98d5-441d-9fb9-49a6bd951b1f';
  const token = 'QVFULJ';
  
  const { data, error } = await supabase
    .from('tracking_tokens')
    .insert({
      order_id: orderId,
      token: token
    })
    .select();

  if (error) {
    console.error('Error inserting token:', error);
    return;
  }

  console.log('Inserted token:', data);
}

insertToken();
