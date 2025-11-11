<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { User } from '@supabase/supabase-js'
import type { TableColumn, DropdownMenuItem } from '#ui/types'
import { useClipboard } from '@vueuse/core'
import { h, resolveComponent } from 'vue'

const UAvatar = resolveComponent('UAvatar')

const toast = useToast()
const config = useRuntimeConfig()
const { copy } = useClipboard()

const page = ref(1)

/**
 * Converts ISO date string to a readable format or 'N/A'.
 * @param dateString The ISO 8601 date string.
 */
function formatDateTime(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('id-ID')
}

const columns: TableColumn<User>[] = [
    {
        id: 'avatar',
        header: 'Avatar',
        cell: ({ row }) => {
            console.log(row.original.user_metadata)
            return h(UAvatar, {
                src: row.original.user_metadata.avatar ? sanitizeUrl(`${config.public.avatarUrl}/${row.original.user_metadata.avatar}`) : '',
                alt: row.original.user_metadata.display_name,
                size: 'lg'
            })
        }
    },
    {
        id: 'display_name',
        header: 'Nama',
        cell: ({ row }) => {
            return row.original.user_metadata.display_name ?? ''
        }
    },
    { accessorKey: 'email', header: 'Email', },
    {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ row }) => {
            return formatDateTime(row.getValue('created_at'))
        }
    },
    {
        accessorKey: 'last_sign_in_at',
        header: 'Terahir Login',
        cell: ({ row }) => {
            return formatDateTime(row.getValue('last_sign_in_at'))
        }
    },
    {
        id: 'action'
    }
]

function getDropdownActions(user: User): DropdownMenuItem[][] {
    return [
        [
            {
                label: 'Copy user Id',
                icon: 'i-lucide-copy',
                onSelect: () => {
                    copy(user.id.toString())

                    toast.add({
                        title: 'User ID copied to clipboard!',
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                }
            }
        ],
        [
            {
                label: 'Delete',
                icon: 'i-lucide-trash',
                color: 'error',
                onSelect: async () => {
                    toast.add({
                        title: 'Hapus pengguna?',
                        description: 'Berkas akan dihapus secara permanen',
                        color: 'error',
                        icon: 'i-lucide-circle-x',
                        duration: 0,
                        actions: [{
                            label: 'Hapus',
                            onClick: (e: any) => deleteUser(user.id.toString()),
                            variant: 'solid',
                            color: 'error'
                        }]
                    })
                }
            }
        ]
    ]
}

const deleteAvatar = async (filename: string) => {
    const { data, error } = await supabase
        .storage
        .from('avatars')
        .remove([filename])

    if (error) {
        toast.add({
            title: 'Error deleting avatar',
            description: error.message,
            icon: 'i-lucide-x',
            color: 'error'
        })
    }
}
const deleteUser = async (id: string) => {
    const { data, error } = await $fetch('/api/admin/user', {
        method: 'DELETE',
        body: { id }
    })

    if (data) {
        await deleteAvatar(data.user?.user_metadata.avatar)

        toast.add({
            title: 'Sukses menghapus pengguna!',
            description: `Pengguna .... dihapus`,
        })
    } else if (error) {
        toast.add({
            title: 'Error',
            description: error.message,
            icon: 'i-lucide-x',
            color: 'error'
        })
    }

}

/**
 * Fetches the list of users from Supabase.
 * NOTE: This requires the user running the app to have the `supabase_admin` role
 * or appropriate RLS policies for `auth.users` table access.
 */
const { data, pending, execute, error } = await useAsyncData<{ users: User[], total: number, nextPage: number, lastPage: number }>('users', async () =>
    $fetch('/api/admin/user', {
        query: {
            page: page.value,
        },
    }),
    {
        watch: [page],
        immediate: true

    }
)


</script>

<template>
    <div>
        <UPageCard title="Users" description="List of users in the system." variant="naked" orientation="horizontal"
            class="mb-4">
            <UButton icon="i-lucide-rotate-cw" color="neutral" class="max-w-fit lg:ms-auto" :loading="pending"
                @click="(e: any) => execute()">
                Refresh
            </UButton>
        </UPageCard>

        <UPageCard variant="subtle" class="bg-linear-to-tl from-primary/10 from-5% to-default overflow-auto">

            <UCard>
                <div v-if="pending" class="flex justify-center items-center h-48">
                    <div class="flex flex-col items-center">
                        <UProgress animation="elastic" indicator />
                        <p class="mt-2 text-sm text-gray-500">Loading users...</p>
                    </div>
                </div>

                <UAlert v-else-if="error" icon="i-lucide-alert-triangle" color="error" variant="subtle"
                    title="Data Access Error" :description="`Could not load user list. Details: ${error}`" />

                <UTable v-else :data="data?.users" :ui="{
                separator: 'divide-y divide-gray-200 dark:divide-gray-800'
            }" :columns="columns" :empty-state="{ icon: 'i-lucide-users', label: 'No users found' }">

                    <template #action-cell="{ row }">
                        <UDropdownMenu :items="getDropdownActions(row.original)">
                            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost"
                                aria-label="Actions" />
                        </UDropdownMenu>
                    </template>

                </UTable>
            </UCard>
        </UPageCard>

    </div>
</template>