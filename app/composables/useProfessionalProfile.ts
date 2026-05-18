import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type InstructorRow = Database['public']['Tables']['instructors']['Row']
type ExpertRow = Database['public']['Tables']['experts']['Row']

// FIX #1: Gunakan type ini sebagai parameter, bukan hanya deklarasi kosong
type ProfessionalRole = 'penyuluh' | 'pakar'

export type ProfessionalFetchResult =
  | { type: 'penyuluh'; data: InstructorRow | null; error: PostgrestError | null }
  | { type: 'pakar'; data: ExpertRow | null; error: PostgrestError | null }
  | { type: 'none'; data: null; error: null }

export const useProfessionalProfile = () => {
  const supabase = useSupabaseClient<Database>()

  // FIX #3: Tambah return type eksplisit
  const fetchInstructorByUserId = async (
    userId: string,
    fields: string = '*',
  ): Promise<{ data: InstructorRow | null; error: PostgrestError | null }> => {
    return await supabase
      .from('instructors')
      .select(fields)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle()
  }

  const fetchExpertByUserId = async (
    userId: string,
    fields: string = '*',
  ): Promise<{ data: ExpertRow | null; error: PostgrestError | null }> => {
    return await supabase
      .from('experts')
      .select(fields)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle()
  }

  // FIX #2: Gunakan ProfessionalRole, bukan string | null | undefined
  const fetchProfessionalByRole = async (
    role: ProfessionalRole | null | undefined,
    userId: string,
  ): Promise<ProfessionalFetchResult> => {
    if (role === 'penyuluh') {
      const { data, error } = await fetchInstructorByUserId(userId)
      return { type: 'penyuluh', data, error }
    }

    if (role === 'pakar') {
      const { data, error } = await fetchExpertByUserId(userId)
      return { type: 'pakar', data, error }
    }

    return { type: 'none', data: null, error: null }
  }

  return {
    fetchInstructorByUserId,
    fetchExpertByUserId,
    fetchProfessionalByRole,
  }
}