<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { Database } from '~/types/database.types'

  const emit = defineEmits<{
    update: []
  }>()

  const authStore = useAuthStore()
  const supabase = useSupabaseClient<Database>()
  const { fetchInstructorByUserId } = useProfessionalProfile()
  const toast = useJuruTaniToast()

  const schema = z.object({
    provinces: z.string().min(1, 'Provinsi wajib dipilih'),
    district: z.string().min(1, 'Kabupaten/Kota wajib dipilih'),
    note: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
  })

  type Schema = z.output<typeof schema>

  // Form state
  const state = reactive<Schema>({
    provinces: '',
    district: '',
    note: '',
  })

  const isSubmitting = ref(false)
  const isLoading = ref(true)

  const resolveUserId = async () => {
    if (authStore.user?.id) return authStore.user.id

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (authStore.user?.id) return authStore.user.id
    }

    return null
  }

  // District data from Supabase
  const districts = ref<Database['public']['Tables']['districts']['Row'][]>([])

  const provinceOptions = computed(() => {
    const set = new Set<string>()
    for (const d of districts.value) {
      if (d.province) set.add(d.province)
    }
    return Array.from(set)
      .sort()
      .map((p) => ({ label: p, value: p }))
  })

  const districtOptions = computed(() => {
    if (!state.provinces) return []
    return districts.value
      .filter((d) => d.province === state.provinces)
      .map((d) => ({ label: d.name, value: d.name }))
  })

  // Computed
  const isFormValid = computed(() => {
    return !!state.provinces && !!state.district
  })

  // Load data
  const loadData = async () => {
    isLoading.value = true
    const userId = await resolveUserId()
    if (!userId) {
      isLoading.value = false
      return
    }

    try {
      // load districts
      const { data: districtsData } = await supabase
        .from('districts')
        .select('id, name, province')
        .order('province', { ascending: true })
        .order('name', { ascending: true })

      districts.value = (districtsData ??
        []) as Database['public']['Tables']['districts']['Row'][]

      // load instructor profile
      const { data: instructorData, error: instructorError } =
        await fetchInstructorByUserId(userId)

      if (instructorError) {
        console.error('Failed to fetch instructor data', instructorError)
      } else if (instructorData) {
        state.provinces = instructorData.provinces || ''
        state.district = instructorData.district || ''
        state.note = instructorData.note || ''
      }
    } catch (error) {
      console.error('Failed to fetch instructor data', error)
    } finally {
      isLoading.value = false
    }
  }

  // Submit handler
  const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (!authStore.user?.id) return

    isSubmitting.value = true

    try {
      const userId = await resolveUserId()
      if (!userId) {
        toast.error('Sesi login belum siap. Coba lagi beberapa saat.')
        return
      }

      const updates = {
        user_id: userId,
        provinces: event.data.provinces || null,
        district: event.data.district || null,
        note: event.data.note || null,
        updated_at: new Date().toISOString(),
      }

      // Check if instructor exists
      const { data: existingData, error: existingError } =
        await fetchInstructorByUserId(userId, 'id')

      if (existingError) {
        toast.error(
          existingError.message || 'Gagal memeriksa data penyuluh.',
        )
        return
      }

      let error
      if (existingData) {
        const { error: updErr } = await supabase
          .from('instructors')
          .update(updates)
          .eq('user_id', userId)
        error = updErr
      } else {
        const { error: insErr } = await supabase
          .from('instructors')
          .insert({ ...updates, created_at: new Date().toISOString() })
        error = insErr
      }

      if (!error) {
        toast.success('Data profesional penyuluh berhasil diperbarui.')
        emit('update')
      } else {
        toast.error(error.message || 'Gagal memperbarui data penyuluh.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.')
    } finally {
      isSubmitting.value = false
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-lg border border-gray-100 dark:border-gray-800 p-6 transition-all duration-200"
  >
    <h3
      class="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center"
    >
      <UIcon
        name="i-lucide-user-check"
        class="w-5 h-5 mr-2 text-green-600 dark:text-green-400"
      />
      Data Profesional Penyuluh
    </h3>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <UIcon
        name="i-lucide-refresh-cw"
        class="animate-spin h-6 w-6 text-green-600 dark:text-green-400 mr-2"
      />
      <span class="text-gray-600 dark:text-gray-400">Memuat data...</span>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
      <!-- Provinces -->
      <UFormField label="Provinsi" name="provinces" required hint="Provinsi wilayah kerja Anda sebagai penyuluh">
        <USelect
          id="instructor-provinces"
          v-model="state.provinces"
          :items="provinceOptions"
          placeholder="Pilih provinsi"
          class="w-full"
        />
      </UFormField>

      <!-- District -->
      <UFormField label="Kabupaten/Kota" name="district" required hint="Kabupaten atau kota wilayah kerja Anda">
        <USelect
          id="instructor-district"
          v-model="state.district"
          :items="districtOptions"
          :disabled="!state.provinces"
          placeholder="Pilih kabupaten/kota"
          class="w-full"
        />
      </UFormField>

      <!-- Note -->
      <UFormField label="Catatan / Deskripsi" name="note">
        <UTextarea
          id="instructor-note"
          v-model="state.note"
          :rows="5"
          placeholder="Ceritakan tentang pengalaman dan fokus penyuluhan Anda..."
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ (state.note || '').length }}/500 karakter
        </p>
      </UFormField>

      <!-- Info Box -->
      <div
        class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <div class="flex">
          <UIcon
            name="i-lucide-info"
            class="w-5 h-5 text-green-600 dark:text-green-400 mr-2 shrink-0 mt-0.5"
          />
          <div class="text-sm text-gray-700 dark:text-gray-300">
            <p class="font-medium mb-1">Informasi Penting:</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Wilayah kerja membantu petani menemukan penyuluh terdekat</li>
              <li>
                Catatan dapat berisi spesialisasi atau program unggulan Anda
              </li>
              <li>Data ini dapat dilihat oleh pengguna lain</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <UButton
          type="submit"
          color="success"
          variant="solid"
          size="lg"
          :loading="isSubmitting"
          icon="i-lucide-save"
        >
          Simpan Perubahan
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<style scoped>
  /* Custom scrollbar for textarea */
  textarea::-webkit-scrollbar {
    width: 6px;
  }

  textarea::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
