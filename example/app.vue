<template>
  <article class="app">
    <header>
      graphType: {{ graphType }}
      <button @click="changeGraphType">改变图类型</button>
    </header>
    <Graphin
      ref="graphRef"
      :data="data"
      :layout="layout"
      :extend="extend"
      :options="options"
      :graphType="graphType"
    />
  </article>
</template>

<script lang="ts">
// import Graphin from '../dist/graphin-vue.min'
import Graphin from '../src/Graphin.vue'
import extend from './Extend'
export default {
  name: 'app',
  components: { Graphin },
  data () {
    return {
      graphType: 'Graph',
      extend,
      data: {
        nodes: [
          { id: 1, label: '1', text: '1', data: {} },
          { id: 2, label: '2', text: '2', data: {} },
          { id: 3, label: '3', text: '3', data: {} },
          { id: 4, label: '4', text: '4', data: {} },
        ],
        edges: [
          { source: 1, target: 2, data: {} },
          { source: 2, target: 3, data: {} },
          { source: 4, target: 3, data: {} }
        ],
      },
      layout: {
          name: 'force'
      },
      options: {
        autoPinWithForce: false
      }
    }
  },
  methods: {
    changeGraphType() {
      if (this.graphType === 'Graph') {
        this.graphType = 'TreeGraph'
        this.layout = {
          name: 'dendrogram',
          options: {
            direction: 'LR'
          }
        }
      } else {
        this.graphType = 'Graph'
        this.layout = {
          name: 'force'
        }
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
}
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app #graphin-container {
  flex-grow: 1;
}
</style>