import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const sections = [
    { type: 'Residential Plot', label: 'Plot' },
    { type: 'Flat,Penthouse,Floor', label: 'Apartment' },
    { type: 'House,Villa', label: 'Villa' },
    { type: 'Commercial Built-up', label: 'Commercial' }
  ];

  console.log('Starting speed test...');
  const startAll = Date.now();

  const results = await Promise.all(sections.map(async (s) => {
    const start = Date.now();
    const { data, error } = await supabase.rpc('get_public_properties_v2', {
      p_city: 'Panipat',
      p_type: s.type,
      p_area: 'All',
      p_page: 0,
      p_limit: 6,
      p_sort_field: 'approved_on',
      p_sort_order: 'desc'
    });
    const end = Date.now();
    return { label: s.label, time: end - start, error: error?.message };
  }));

  const endAll = Date.now();
  console.table(results);
  console.log(`Total time for 4 parallel requests: ${endAll - startAll}ms`);
}

test();
