<template>
  <Graphin
    ref="graphRef"
    :data="data"
    :layout="layout"
    :extend="extend"
  />
</template>

<script lang="ts">
// import Graphin from '../src/dist/graphin-vue.min'
import Graphin from '../src/Graphin.vue'
import extend from './Extend'
export default {
  name: 'app',
  components: { Graphin },
  data () {
    return {
      extend,
      data: {
        nodes: [],
        edges: [],
      },
      layout: {
          name: 'force',
          options: {
              preset: {
                  name: 'concentric',
              },
          },
      },

      selectedNodes: [],
    }
  }
}
</script>

<style>

</style>