<script setup>
definePageMeta({
  layout: "landing",
  middleware: "auth"
});
</script>

<template>
  <LandingContainer>
    <LandingHero></LandingHero>
  </LandingContainer>
</template>
