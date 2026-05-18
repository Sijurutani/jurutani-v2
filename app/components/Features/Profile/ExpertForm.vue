<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { Database } from '~/types/database.types'

  const emit = defineEmits<{
    update: []
  }>()

  const authStore = useAuthStore()
  const supabase = useSupabaseClient<Database>()
  const { fetchExpertByUserId } = useProfessionalProfile()
  const toast = useJuruTaniToast()

  const schema = z.object({
    category: z.string().min(1, 'Kategori keahlian wajib dipilih'),
    note: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
  })

  type Schema = z.output<typeof schema>

  // Form state
  const state = reactive<Schema>({
    category: '',
    note: '',
  })

  const isSubmitting = ref(false)
  const isLoading = ref(true)
  const expertCategories = ref<{ name: string }[]>([])

  const resolveUserId = async () => {
    if (authStore.currentUserId) return authStore.currentUserId

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (authStore.currentUserId) return authStore.currentUserId
    }

    return null
  }

  // Computed
  const categoryOptions = computed(() => {
    return expertCategories.value.map((cat) => ({
      label: cat.name,
      value: cat.name,
    }))
  })

  const isFormValid = computed(() => {
    return state.category && state.category.trim().length > 0
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
      // Fetch categories
      const { data: categories } = await supabase
        .from('category_expert')
        .select('name')
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (categories) {
        expertCategories.value = categories as { name: string }[]
      }

      // Fetch expert data
      const { data: expertData, error: expertError } =
        await fetchExpertByUserId(userId)

      if (expertError) {
        console.error('Failed to fetch expert data', expertError)
      } else if (expertData) {
        state.category = expertData.category || ''
        state.note = expertData.note || ''
      }
    } catch (error) {
      console.error('Failed to fetch expert data', error)
    } finally {
      isLoading.value = false
    }
  }

  // Submit handler
  const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (!authStore.currentUserId) return

    isSubmitting.value = true

    try {
      const userId = await resolveUserId()
      if (!userId) {
        toast.error('Sesi login belum siap. Coba lagi beberapa saat.')
        return
      }

      const updates = {
        user_id: userId,
        category: event.data.category || null,
        note: event.data.note || null,
        updated_at: new Date().toISOString(),
      }

      // Check if expert exists
      const { data: existingData, error: existingError } =
        await fetchExpertByUserId(userId, 'id')

      if (existingError) {
        toast.error(
          existingError.message || 'Gagal memeriksa data pakar.',
        )
        return
      }

      let error
      if (existingData) {
        const { error: updErr } = await supabase
          .from('experts')
          .update(updates)
          .eq('user_id', userId)
        error = updErr
      } else {
        const { error: insErr } = await supabase
          .from('experts')
          .insert({ ...updates, created_at: new Date().toISOString() })
        error = insErr
      }

      if (!error) {
        toast.success('Data profesional pakar berhasil diperbarui.')
        emit('update')
      } else {
        toast.error(error.message || 'Gagal memperbarui data pakar.')
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
  <div class="p-5 sm:p-6 transition-all duration-200">

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
      <!-- Category -->
      <UFormField label="Kategori Keahlian" name="category" required>
        <USelect
          id="expert-category"
          v-model="state.category"
          :items="categoryOptions"
          placeholder="Pilih kategori keahlian"
          size="lg"
          :disabled="categoryOptions.length === 0"
          class="w-full"
        />
        <p v-if="categoryOptions.length === 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Tidak ada kategori tersedia. Hubungi admin untuk menambahkan kategori.
        </p>
      </UFormField>

      <!-- Note -->
      <UFormField label="Catatan / Deskripsi" name="note">
        <UTextarea
          id="expert-note"
          v-model="state.note"
          :rows="5"
          placeholder="Ceritakan tentang keahlian dan pengalaman Anda di bidang ini..."
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
              <li>Kategori keahlian akan ditampilkan di profil publik Anda</li>
              <li>Catatan membantu petani memahami keahlian spesifik Anda</li>
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
