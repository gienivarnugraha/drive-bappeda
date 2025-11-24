<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '#ui/types'
import { useClipboard } from '@vueuse/core'
import { sanitizeUrl } from '#shared/utils'
import type { User, FetchResponse } from '#shared/types'
import { h, resolveComponent } from 'vue'

const UAvatar = resolveComponent('UAvatar')

const toast = useToast()

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
        cell: ({ row }: any) => {
            return h(UAvatar, {
                src: row.original.avatar ? `/file?filename=avatars:${row.original.avatar as string}` : '',
                alt: row.original.name,
                size: 'lg'
            })
        }
    },
    {
        id: 'name',
        header: 'Nama',
        cell: ({ row }: any) => {
            return row.original.name ?? ''
        }
    },
    { accessorKey: 'email', header: 'Email', },
    {
        accessorKey: 'createdAt',
        header: 'Dibuat',
        cell: ({ row }: any) => {
            return formatDateTime(row.getValue('createdAt'))
        }
    },
    // {
    //     accessorKey: 'last_sign_in_at',
    //     header: 'Terahir Login',
    //     cell: ({ row }: any) => {
    //         return formatDateTime(row.getValue('last_sign_in_at'))
    //     }
    // },
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
    try {
        const { data, message } = await $fetch<FetchResponse<User>>('/api/avatar', {
            method: 'DELETE',
            body: { filename }
        })
        toast.add({
            title: 'Success avatar',
            description: message,
            icon: 'i-lucide-check',
            color: 'success'
        })
    } catch (error: any) {
        toast.add({
            title: 'Error deleting avatar',
            description: error.message,
            icon: 'i-lucide-x',
            color: 'error'
        })
    }
}

const deleteUser = async (id: string) => {
    try {
        const { data, message } = await $fetch<FetchResponse<User>>('/api/user', {
            method: 'DELETE',
            body: { id }
        })

        if (data) {
            const filename = data?.avatar

            await deleteAvatar(filename as string)

            toast.add({
                title: 'Sukses menghapus pengguna!',
                description: `Pengguna .... dihapus`,
            })

        }


    } catch (error: any) {
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
 * NOTE: This requires the user running the app to have the `admin` role
 * or appropriate RLS policies for `auth.users` table access.
 */
const { data, pending, execute, error } = await useAsyncData<User[]>('users', async () =>
    $fetch('/api/user', {
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

                <UTable v-else :data="data" :ui="{
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