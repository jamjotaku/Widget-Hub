import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL linked:', supabaseUrl?.substring(0, 20) + '...');
console.log('Supabase Key linked:', supabaseKey ? 'PRESENT (starts with ' + supabaseKey.substring(0, 10) + '...)' : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ブックマークデータを取得するユーティリティ
 */
export async function getBookmarks(tableName = 'bookmarks') {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}
