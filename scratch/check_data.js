
const { createClient } = require('@supabase/supabase-js');

async function checkData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('Checking for orders with null price...');
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, price, description')
    .is('price', null);

  if (error) {
    console.error('Error:', error.message);
  } else if (orders && orders.length > 0) {
    console.log('FOUND ORDERS WITH NULL PRICE:', orders);
  } else {
    console.log('No orders with null price found.');
  }

  console.log('Checking for orders with missing zone data...');
  const { data: joinData, error: joinError } = await supabase
    .from('orders')
    .select(`
      id,
      description,
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .limit(100);

  if (joinError) {
    console.error('Join Error:', joinError.message);
  } else {
    const missing = joinData.filter(o => !o.zone_from || !o.zone_to);
    if (missing.length > 0) {
      console.log('Found orders with missing zones:', missing.length);
    } else {
      console.log('All checked orders have zones.');
    }
  }
}

checkData();
