<template>
  <article class="app">
    <header>
      graphType: {{ graphType }}
      <button @click="changeGraphType">改变图类型</button>
    </header>
    <Graphin
      ref="Graphin"
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
          { id: '1', label: '1', text: '1', x: 50, y: 100,  data: { x: 50, y: 100 } },
          { id: '2', label: '2', text: '2', x: 150, y: 100, data: { x: 150, y: 100 } },
          { id: '3', label: '3', text: '3', x: 200, y: 100, data: {x: 200, y: 100} },
          { id: '4', label: '4', text: '4', x: 250, y: 100, data: {x: 250, y: 100} },
        ],
        edges: [
          { source: '1', target: '2', data: {} },
          { source: '2', target: '3', data: {} },
          { source: '4', target: '3', data: {} }
        ],
      },
      layout: {
          name: 'force',
          options: {
            preset: {
              name: 'circle'
            }
          }
      },
      options: {
        autoPinWithForce: false
      }
    }
  },
  mounted () {
    this.graph = this.$refs.Graphin.graph
    this.graph.on('afterlayout', () => {
      console.log(7777777777)
    })
    // setTimeout(() => {
    //   this.graph.getNodes().forEach(nodeInst => {
    //     const node = this.data.nodes.find(node => {
    //       console.log(node.id, nodeInst.getModel().id)
    //       return node.id === nodeInst.getModel().id
    //     })
    //     if (node) {
    //       nodeInst.update({ x: node.x, y: node.y })
    //     }
    //   })
    //   console.log(6)
    //   this.graph.refreshPositions()
    // }, 0)
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