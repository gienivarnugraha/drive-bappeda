<script setup lang="ts">
import { useItems } from '~/composables/useItems'

definePageMeta({
  layout: 'home',
  auth:true
})

const { categories, divisions } = await useItems()

</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
    <SettingsUpdateUser key="setting-update-user" />

    <SettingsUsersTable key="settings-users-table" />

    <SettingsAddUser key="settings-add-user" />

    <SettingsPassword key="settings-password" />

    <SettingsItemsEditor :options="categories" title="Kategori" type="categories"
      :additional-fields="{ description: '' }" />

    <SettingsItemsEditor :options="divisions" title="Bidang" type="divisions" :additional-fields="{ icon: '' }" />
  </div>
</template>
