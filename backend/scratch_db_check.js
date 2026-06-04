import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const email = 'devon@luxury.com';
  console.log(`Starting cleanup for email: ${email}`);

  // Delete matching orders first
  const { error: oErr } = await supabase
    .from('orders')
    .delete()
    .eq('shipping_address', 'Devon Lane');
  if (oErr) console.error("Error deleting orders:", oErr.message);

  // Delete matching customer profiles
  const { error: cErr } = await supabase
    .from('customers')
    .delete()
    .ilike('email', email);
  if (cErr) console.error("Error deleting customers:", cErr.message);
  else console.log("✅ Customers deleted successfully.");

  // Delete matching users
  const { error: uErr } = await supabase
    .from('users')
    .delete()
    .ilike('email', email);
  if (uErr) console.error("Error deleting users:", uErr.message);
  else console.log("✅ Users deleted successfully.");

  console.log("Cleanup finished!");
}

main();
