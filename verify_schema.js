const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://kpofakieaiyxjnhmkapd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb2Zha2llYWl5eGpuaG1rYXBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NzYxOCwiZXhwIjoyMDkxODIzNjE4fQ.i_0Q2jdMrqiMuMze1_gkPKE1TJhKDEPUYv9Gg7L36ME';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Order columns:', Object.keys(data[0] || {}));
  }
}
test();
