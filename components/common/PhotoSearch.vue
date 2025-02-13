<template>
  <div class="photo-search">
    <div v-if="loading" class="images-grid">
      <div v-for="n in NUM_IMAGES" :key="n" class="image-item">
        <USkeleton class="skeleton-image" />
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div class="images-grid" v-if="!loading && images.length">
      <div 
        v-for="image in images" 
        :key="image.title"
        class="image-item"
        @click="selectImage(image)"
      >
        <img :src="image.thumbUrl" :alt="image.title">
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: {
    type: String,
    required: true
  }
})

const images = ref([])
const loading = ref(false)
const error = ref(null)
const NUM_IMAGES = 3;

const emit = defineEmits(['select'])

watch(() => props.input, async (newTerm) => {
  if (!newTerm.trim()) return
  await searchPhotos()
}, { immediate: true })

async function searchPhotos() {
  loading.value = true
  error.value = null
  images.value = []

  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|drawing ${props.input}&gsrlimit=${NUM_IMAGES}&prop=imageinfo&iiprop=url|dimensions&iiurlwidth=400&format=json&origin=*`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!data.query || !data.query.pages) {
      images.value = []
      return
    }

    images.value = Object.values(data.query.pages).map(page => ({
      title: page.title,
      thumbUrl: page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url,
      fullUrl: page.imageinfo?.[0]?.url,
      width: page.imageinfo?.[0]?.width,
      height: page.imageinfo?.[0]?.height
    }))
  } catch (e) {
    error.value = 'Error fetching images. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function selectImage(image) {
  emit('select', image)
}
</script>

<style scoped>
.photo-search {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-container, .search-input, .search-button {
  display: none;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
  text-align: center;
  padding: 20px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.image-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}
</style>
