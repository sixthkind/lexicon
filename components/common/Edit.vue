<template>
  <div v-if="isLoaded" class="k-container animated fadeInUp">

    <div class="mb-4 flex justify-between">
      <div class="flex items-center gap-2">
        <button 
          @click="goBack" 
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
        >
          <Icon name="lucide:chevron-left" size="1.4em" class="text-slate-500" />
        </button>
        <h2 class="font-bold text-2xl text-slate-600">
          {{ id ? 'Edit' : 'Add' }} {{ Utils.capitalize(Utils.decamelize(Utils.singular(type))) }}
        </h2>
      </div>
      <div class="flex gap-2" v-if="id && isDeletionAllowed">
        <button 
          v-if="!isConfirm"
          @click="toggleConfirm" 
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
        >
          <Icon name="lucide:trash-2" size="1.4em" class="text-red-500" />
        </button>

        <button 
          v-if="isConfirm"
          @click="deleteItem" 
          class="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-all"
        >
          <Icon name="lucide:check" size="1.4em" class="text-white" />
        </button>

        <button 
          v-if="isConfirm"
          @click="toggleConfirm" 
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
        >
          <Icon name="lucide:x" size="1.4em" class="text-slate-500" />
        </button>
      </div>
    </div>

    <div class="k-item animated fadeInUp">
      <Vueform :schema="schema" v-model="data" @submit="handleSubmit" sync></Vueform>
    </div>
    <div v-if="isSuccess" class="mt-4 bg-green-50 text-green-700 px-6 py-3 rounded-2xl flex items-center gap-2 animated fadeInUp">
      <Icon name="lucide:check-circle" class="text-green-600" />
      <span>Successfully saved!</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { pb, getSchema, Utils } from '#imports';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const isLoaded = ref(false);
  const isSuccess = ref(false);
  const isConfirm = ref(false);
  const schema = ref({});
  const data = ref({});
  

  const type = route.params.type;
  const id = route.params.id;

  // the following are used when creating a new item and the item is related to another item
  const field = route.query.field; // the field that this item is occupying
  const collection = route.query.collection; // the collection that this item is related to
  const relationid = route.query.relationid; // the id of the item that this item is related to

  // Check if the type is in the array of non-deletable types
  const isDeletionAllowed = !getSchema('notdeletable').includes(type);
  const formSchema = getSchema(type);

  if (id) {
    // If there is an id, get the record
    const record = await pb.collection(type).getOne(id);
    // Set the data to the record using schema keys
    Object.keys(formSchema).forEach(key => {
      if(record[key]) data.value[key] = record[key];
    });    
  }
  
  // add a button to the schema
  schema.value = {
    ...formSchema,
    button: { type: 'button', "button-label": `${id ? 'Save' : 'Add'}`, submits: true, class: 'ml-auto font-bold' }
  }

  const goBack = () => {
    window.history.back();
  }

  const toggleConfirm = () => {
    isConfirm.value = !isConfirm.value;
  }

  const handleSubmit = async () => {
    try {
      if (id) {
        await updateItem();
      } else {
        await createItem();
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  const createSharedFormData = () => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Append all non-file data
    Object.keys(data.value).forEach(key => {
      if (formSchema[key]?.type !== 'file') {
        formData.append(key, data.value[key]);
      }
    });

    // Handle file fields
    Object.keys(formSchema).forEach(key => {
      if (formSchema[key].type === 'file') {
        console.log("key: ", key);
        if(data.value[key]) {
          if (data.value[key] instanceof File) {
            formData.append(key, data.value[key]);
          }
        } else {
          formData.append(key, "");
        }
      }
    });

    // Log each key-value pair in FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    return formData;
  }

  const updateItem = async () => {
    const formData = createSharedFormData();

    // Update with FormData
    await pb.collection(type).update(id, formData);
    
    isSuccess.value = true;
    setTimeout(() => {
      isSuccess.value = false;
    }, 3000);
  }

  const createItem = async () => {
    const formData = createSharedFormData();

    // Add user ID
    formData.append('user', pb.authStore.record?.id);

    // Create with FormData
    const record = await pb.collection(type).create(formData);

    // Update back-relation
    if(field && collection && relationid) {
      await pb.collection(collection).update(relationid, { [field]: record.id });
    }

    isSuccess.value = true;
    setTimeout(() => {
      isSuccess.value = false;
      goBack();
    }, 1000);
  }

  const deleteItem = async () => {
    // Safety check - prevent deletion if type is in nonDeletableTypes
    if (!isDeletionAllowed) {
      console.error('This type cannot be deleted');
      return;
    }

    // Check and Delete item's address if it exists
    if(data.value.address) {
      await pb.collection('addresses').delete(data.value.address);
    }

    // Delete the item
    await pb.collection(type).delete(id);
    goBack();
  }

  isLoaded.value = true;
</script>

<style scoped>
  .vueform__file__upload-button {
    display: none;
  }
</style>