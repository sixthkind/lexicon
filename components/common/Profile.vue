<template>
<div class="flex items-center justify-center">
  <div class="p-8 w-full rounded-lg k-item animated fadeInUp">
    <div class="flex w-full flex-col lg:flex-row justify-between items-center my-5 px-5">
      <div class="flex w-full items-center justify-between">
        <h2 class="font-bold text-3xl text-gray-800">
          Profile
        </h2>  
      </div>
    </div>

    <div class="flex flex-col gap-3 mx-auto px-6">
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
    <span class="font-mono text-slate-300 text-sm float-right">koala:v{{ version }}</span>
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

  const edit = () => {
    isEditing.value = !isEditing.value;
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


