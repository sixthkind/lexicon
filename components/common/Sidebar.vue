<template>
  <div class="flex h-screen k-item">
    <!-- Vertical Navigation -->
    <div class="w-48 border-r ">
      <div class="h-16 flex items-center px-6">
        <h2 class="text-lg font-semibold text-gray-800">
          <span class="font-bold text-primary">_</span><span class="font-bold text-slate-600">lex</span><span class="font-bold text-slate-500">icon</span>
        </h2>
      </div>
      <div class="p-3">
        <div
          v-for="item in navigation"
          :key="item.to"
          class="flex items-center justify-between group mb-1"
        >
          <ULink
            :to="item.to"
            class="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            {{ item.label }}
          </ULink>
          <button
            @click.prevent="confirmDelete(item.id)"
            class="hidden group-hover:block p-1 hover:bg-gray-200 rounded-md"
            :title="pendingDeleteId === item.id ? 'Click again to confirm delete' : 'Delete note'"
          >
            <UIcon 
              :name="pendingDeleteId === item.id ? 'i-heroicons-check-circle-solid' : 'i-heroicons-trash'" 
              :class="[
                'w-4 h-4',
                pendingDeleteId === item.id ? 'text-red-500' : 'text-gray-500'
              ]"
            />
          </button>
        </div>
      </div>
      <!-- Add New Note Button -->
      <div class="px-3 mt-2">
        <button
          @click="createNewNote"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <UIcon name="i-heroicons-plus-circle" />
          New Note
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { getNotes, deleteNote } from '@/utils/notes'
import { ref, onUnmounted } from 'vue'

const route = useRoute();
const router = useRouter();

// Add state for pending deletion
const pendingDeleteId = ref(null);
const deleteTimeout = ref(null);

// Navigation items
const notes = getNotes()

const navigation = computed(() => {
  return notes.map(note => ({
    label: note.title,
    icon: 'document',
    to: `/notes/${note.id}`,
    id: note.id // Add id to use for deletion
  }));
});

// Determine which section to show based on route
const currentSection = computed(() => {
  const path = route.path;
  if (path.includes('/appointments')) return 'appointments';
  return 'members'; // default view
});

// Add function to handle new note creation
const createNewNote = () => {
  // TODO: Implement note creation logic
  console.log('Create new note clicked')
  window.location.href = '/notes';
}

// Replace removeNote with confirmDelete
const confirmDelete = async (noteId) => {
  if (pendingDeleteId.value === noteId) {
    // Second click - perform deletion
    await deleteNote(noteId);
    if (route.params.id === noteId) {
      router.push('/notes');
    }
    pendingDeleteId.value = null;
    if (deleteTimeout.value) {
      clearTimeout(deleteTimeout.value);
    }
  } else {
    // First click - show confirmation
    pendingDeleteId.value = noteId;
    // Reset after 3 seconds if not confirmed
    if (deleteTimeout.value) {
      clearTimeout(deleteTimeout.value);
    }
    deleteTimeout.value = setTimeout(() => {
      pendingDeleteId.value = null;
    }, 3000);
  }
}

// Clean up timeout when component unmounts
onUnmounted(() => {
  if (deleteTimeout.value) {
    clearTimeout(deleteTimeout.value);
  }
});
</script>

<style scoped>
  /* Ensure the dashboard takes full height */
  .h-screen {
    height: calc(100vh - 120px); /* Adjust based on your navbar height */
  }

  .k-item {
    padding: 0;
  }
</style>
