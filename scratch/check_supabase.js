
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('Checking orders table structure...');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Orders fetch successful.');
  }

  console.log('Checking join query...');
  const { data: joinData, error: joinError } = await supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type),
      livreur:profiles!orders_livreur_id_fkey(full_name)
    `)
    .limit(1);

  if (joinError) {
    console.error('Join query failed:', joinError.message);
    console.log('Hint:', joinError.hint);
    console.log('Details:', joinError.details);
  } else {
    console.log('Join query successful.');
  }
}

checkSchema();
