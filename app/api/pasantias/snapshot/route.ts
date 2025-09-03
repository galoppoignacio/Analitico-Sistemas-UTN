import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  const { data, error } = await supabase
    .from('pasantias_snapshot')
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pasantias: data?.data || [] });
}
