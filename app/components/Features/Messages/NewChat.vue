<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'
  import type { Database } from '~/types/database.types'

  type ProfileLite = Pick<
    Database['public']['Tables']['profiles']['Row'],
    'id' | 'full_name' | 'username' | 'email' | 'avatar_url' | 'role'
  >

  const props = defineProps<{
    myId: string
  }>()

  const open = defineModel<boolean>('open', { default: false })
  const emit = defineEmits<{ created: [conversationId: string] }>()

  const supabase = useSupabaseClient<Database>()
  const toast = useToast()

  const search = ref('')
  const results = ref<ProfileLite[]>([])
  const searching = ref(false)
  const creating = ref(false)
  const selected = ref<ProfileLite | null>(null)

  const roleLabel: Record<string, string> = {
    petani: 'Petani',
    pakar: 'Pakar',
    penyuluh: 'Penyuluh',
    admin: 'Admin',
    superadmin: 'Superadmin',
  }

  const debouncedSearch = useDebounceFn(async () => {
    const q = search.value.trim()
    if (!q) {
      results.value = []
      return
    }
    searching.value = true
    const { data, error } = await supabase.rpc('search_users', {
      search_term: q,
      user_limit: 10,
    })
    if (error) {
      searching.value = false
      results.value = []
      return
    }
    results.value = ((data ?? []) as unknown as ProfileLite[]).filter(
      (u) => u.id !== props.myId,
    )
    searching.value = false
  }, 300)

  watch(search, debouncedSearch)

  function selectUser(user: ProfileLite) {
    selected.value = user
    search.value = ''
    results.value = []
  }

  async function startChat() {
    if (!selected.value) return
    creating.value = true
    try {
      const res = await supabase.rpc('create_or_get_conversation', {
        other_user_id: selected.value.id,
      })
      if (res.error) throw res.error
      emit('created', res.data as unknown as string)
      open.value = false
      selected.value = null
      search.value = ''
      results.value = []
    } catch (err: any) {
      toast.add({
        title: 'Gagal membuat percakapan',
        description: err?.message,
        color: 'error',
      })
    } finally {
      creating.value = false
    }
  }

  function onClose() {
    open.value = false
    selected.value = null
    search.value = ''
    results.value = []
  }
</script>

<template>
  <UModal
    v-model:open="open"
    title="Mulai Chat Baru"
    description="Cari pengguna untuk memulai percakapan."
    :ui="{ content: 'max-w-sm' }"
    @close="onClose"
  >
    <template #body>
      <div class="space-y-4">
        <div
          v-if="selected"
          class="flex items-center gap-3 rounded-xl border border-default bg-elevated p-3"
        >
          <UAvatar
            :src="selected.avatar_url ?? undefined"
            :alt="selected.full_name ?? ''"
            size="sm"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ selected.full_name || selected.username }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ selected.email }}
            </p>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            size="xs"
            @click="selected = null"
          />
        </div>

        <div v-else>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Cari nama atau username..."
            autofocus
            :loading="searching"
            class="w-full"
          />

          <div
            v-if="results.length"
            class="mt-1.5 rounded-xl border border-default bg-default shadow-lg overflow-hidden divide-y divide-default"
          >
            <UButton
              color="neutral"
              variant="ghost"
              v-for="user in results"
              :key="user.id"
              type="button"
              class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-elevated transition-colors text-left"
              @mousedown.prevent="selectUser(user)"
            >
              <UAvatar
                :src="user.avatar_url ?? undefined"
                :alt="user.full_name ?? ''"
                size="sm"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-highlighted truncate">
                  {{ user.full_name || user.username || 'Pengguna' }}
                </p>
                <p class="text-xs text-muted truncate">
                  {{ roleLabel[user.role ?? ''] ?? user.role ?? '' }}
                  {{ user.email ? '· ' + user.email : '' }}
                </p>
              </div>
            </UButton>
          </div>

          <p
            v-else-if="search && !searching"
            class="text-xs text-muted mt-2 text-center"
          >
            Tidak ada pengguna ditemukan
          </p>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
            label="Batal"
            color="neutral"
            variant="ghost"
            :disabled="creating"
            @click="onClose"
          />
          <UButton
            label="Mulai Chat"
            icon="i-lucide-message-circle"
            :loading="creating"
            :disabled="!selected"
            @click="startChat"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
