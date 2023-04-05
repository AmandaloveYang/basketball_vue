<template>
  <div class="app-container">
    user-async
  </div>
</template>

<script>
export default {
  components: {

  },
  data() {
    return {

    }
  },
  mounted() {
    console.log(this.$route)
    console.log(this.$router.options.routes, 'user')
  },
}
</script>

<style>

</style>
