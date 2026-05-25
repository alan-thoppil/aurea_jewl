import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FALLBACK_RATES = {
  "24K": 7620,
  "22K": 6985,
  "18K": 5715,
  "14K": 4450,
  "PT950": 3100,
  "925": 85
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing in env. Returning fallback gold rates.");
      return NextResponse.json({ rates: FALLBACK_RATES });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try fetching the latest gold rate from the 'gold_rates' table
    const { data, error } = await supabase
      .from('gold_rates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Failed to fetch gold rates from database (table might not exist):", error.message);
      }
      return NextResponse.json({ rates: FALLBACK_RATES });
    }

    const latest = data[0];
    const rate24k = parseFloat(latest.rate_24k) || 7620;
    const rate22k = parseFloat(latest.rate_22k) || parseFloat((rate24k * 0.916).toFixed(2));

    const rates = {
      "24K": rate24k,
      "22K": rate22k,
      "18K": parseFloat((rate24k * 0.75).toFixed(2)),
      "14K": parseFloat((rate24k * 0.585).toFixed(2)),
      "PT950": 3100,
      "925": 85
    };

    return NextResponse.json({ rates });
  } catch (error: any) {
    console.error("Gold rate API error:", error);
    return NextResponse.json({ rates: FALLBACK_RATES });
  }
}
