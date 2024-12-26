<template>
<div class="k-container animated fadeInUp">
  <div class="mb-4 flex justify-between">
    <div class="flex items-center gap-2">
      <button 
        @click="goBack" 
        class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
      >
        <Icon name="lucide:chevron-left" size="1.4em" class="text-slate-500" />
      </button>
      <h2 class="font-bold text-2xl text-slate-500">
        Profile
      </h2>
    </div>
    <button 
      @click="goEdit" 
      class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
    >
      <Icon name="lucide:edit" size="1.4em" class="text-primary" />
    </button>
  </div>

  <div class="flex items-center justify-center">
    <div class="p-8 w-full rounded-lg k-item animated fadeInUp">

      <div class="flex flex-col gap-3 mx-auto px-6">
        <p v-if="pb.authStore.record?.name" class="text-lg leading-relaxed text-slate-500">
          <span class="flex items-center gap-2"> 
            <b>Name</b>
          </span>
          {{ pb.authStore.record?.name }} 
        </p>

        <p class="text-lg leading-relaxed text-slate-500">
          <span class="flex items-center gap-2"> 
            <b>Email</b>
            <span 
              v-if="emailVerified" 
              class="px-2 py-0.5 text-xs rounded-full bg-primary text-primary bg-opacity-10 border border-primary">
              verified
            </span>
          </span>
          {{ email }} 
        </p>

        <p class="mt-3 cursor-pointer font-bold text-primary" @click="reset">Reset Password</p>
        <p class="cursor-pointer font-bold text-primary" @click="authUtils.logout">Logout</p>
      </div>

      <br/>
      <span class="font-mono text-slate-300 text-sm float-right">_template:v{{ version }}</span>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { authUtils, pb } from '#imports';
  import { useNuxtApp } from '#app';

  const { $version } = useNuxtApp();
  const version = $version;

  const email = ref(pb.authStore.record?.email || '');
  const emailVerified = ref(pb.authStore.record?.verified || '');
  const isEditing = ref(false);

  const goBack = () => {
    window.history.back();
  }

  const goEdit = () => {
    window.location.href = '/edit/users/' + pb.authStore.record?.id;
  }

  const reset = async () => {
    window.location.href = '/auth/reset';
  }
</script>

<style scoped>
  .k-item {
    padding: 10px 20px;
    margin-bottom: 12px;
    max-width: 600px;
  }
</style>


