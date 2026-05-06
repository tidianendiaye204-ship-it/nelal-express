
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kpofakieaiyxjnhmkapd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb2Zha2llYWl5eGpuaG1rYXBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NzYxOCwiZXhwIjoyMDkxODIzNjE4fQ.i_0Q2jdMrqiMuMze1_gkPKE1TJhKDEPUYv9Gg7L36ME'
);

async function checkOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at')
    .limit(5)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log('Recent orders:', data);
}

checkOrders();
