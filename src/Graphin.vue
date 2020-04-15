<template>
  <div id="graphin-container">
    <div
      class="graphin-core"
      ref='graphDOM'
    />
    <div class="graphin-components">
      <template v-if="isGraphReady">
        <slot></slot>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { cloneDeep } from 'lodash';
/** controller */
import initController, { initGraphAfterRender } from './controller/init';
import registerController from './controller/register';
import HistoryController from './controller/history';

import layoutController from './controller/layout';
import apisController from './apis';
import eventController from './events/index';

/** types  */
import {
  GraphinProps,
  GraphinState,
  ExtendedGraphOptions,
  GraphType,
  ForceSimulation,
  Data,
  Layout,
  ExtendLayout,
  GraphinPropsExtend,
  GraphinPropsRegister
} from './types';

/** utils */
import shallowEqual from './utils/shallowEqual';

@Component({
  name: 'GraphinVue',
  created() {
    this.history = new HistoryController()
  },
  mounted () {
    const { data } = this.$props;
    this.graphDOM = this.$refs.graphDOM
    // register props.extend and props.register
    const behaviorsMode = registerController(this.$props as GraphinProps);

    // init G6 instance
    const { instance, width, height, options } = initController(
      this.$props as GraphinProps,
      this.graphDOM as HTMLDivElement,
      behaviorsMode,
    );

    this.g6Options = options;
    this.graph = instance as GraphType;
    this.history = new HistoryController()
    const { data: newData, forceSimulation } = layoutController(this.getContext(), { data });

    this.$data.forceSimulation = forceSimulation!;

    this.setState(
      {
        isGraphReady: true,
        // graph: this.graph,
        width,
        height,
        sdata: newData,
        forceSimulation,
        // history: this.history
      },
      () => {
        this.renderGraphWithLifeCycle(true);
      },
    );
    this.handleEvents();
  },
  beforeDestroy () {
    this.clearEvents!()
  },
  errorCaptured (error: Error, vm: Vue, info: String) {
    console.error('Catch component error: ', error, info)
  }
})
export default class Graphin extends Vue {
  @Prop(Object) data: Data
  @Prop(Object) options?: Partial<ExtendedGraphOptions>
  @Prop(Object) layout?: Layout
  @Prop(Object) extend?: GraphinPropsExtend
  @Prop(Object) register?: GraphinPropsRegister

  isGraphReady: boolean = false
  sdata: Data = {
    nodes: [],
    edges: []
  }
  width: number = 0
  height: number = 0
  graphSave?: any

  graphDOM: HTMLDivElement | null = null
  // graph?: GraphType

  // history: HistoryController = new HistoryController()

  forceSimulation: ForceSimulation | null = null

  g6Options?: Partial<ExtendedGraphOptions>

  @Watch('data.nodes')
  onDataNodesChanged() {
    const p: GraphinProps = {
      data: this.$props.data
    }
    this.rerenderGraph(true, p)
  }
  @Watch('data.edges')
  onDataEdgesChanged() {
    const p: GraphinProps = {
      data: this.$props.data
    }
    this.rerenderGraph(true, p)
  }
  @Watch('layout', { deep: true })
  onLayoutChanged(val: Layout, oldVal: Layout) {
    const p: GraphinProps = {
      data: this.sdata,
      layout: oldVal
    }
    this.rerenderGraph(false, p)
  }

  clearEvents?: () => void
  getLayoutInfo () {}

  setState (option: { [key: string]: any }, callback?: Function) {
    Object.keys(option).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = option[key]
      } else {
        this.$set(this, key, option[key])
      }
    })
    if (callback) {
      this.$nextTick(() => {
        callback()
      })
    }
  }

  rerenderGraph(dataChanged: Boolean, prevProps: GraphinProps) {
    let { sdata: currentData } = this;
    if (dataChanged) {
      const { data } = this.$props
      currentData = data
    }
    const { data, forceSimulation } = layoutController(this.getContext(), { data: currentData, prevProps });
    this.forceSimulation = forceSimulation!;
    this.setState(
      {
        sdata: data,
        forceSimulation,
      },
      () => {
        // rerender Graph
        this.renderGraphWithLifeCycle();
      },
    );
  }

  getApis() {
    return apisController(this);
  };

  getHistoryInfo = () => {
    return this.history.getHistoryInfo();
  };

  clear = () => {
    this.graph!.clear();
    this.history.reset();
    this.clearEvents!();

    this.setState(
      {
        sdata: { nodes: [], edges: [] },

        forceSimulation: null,
        graphSave: null,
      },
      () => {
        const { sdata: data } = this;
        this.renderGraph(data);
      },
    );
  };

  handleEvents() {
    this.clearEvents = eventController(this.getContext()).clear;
  }

  getContext() {
    return this;
  }

  renderGraphWithLifeCycle(fristRender: boolean) {
    const { sdata: data } = this;
    this.graph!.changeData(cloneDeep(data));
    this.graph!.emit('afterchangedata');
    this.handleSaveHistory();
    if (fristRender) {
      initGraphAfterRender(this.$props, this.graphDOM, this.graph);
    }
  };

  stopForceSimulation() {
    const { forceSimulation } = this;
    if (forceSimulation) {
      forceSimulation.stop();
    }
  };

  handleSaveHistory() {
    const currentState = {
      isGraphReady: this.isGraphReady,
      width: this.width,
      height: this.height,
      data: this.sdata,
      graph: this.graph,
      forceSimulation: this.forceSimulation,
      graphSave: cloneDeep(this.graph!.save()),
    };
    this.history.save(currentState);
  };

  handleUndo() {
    this.stopForceSimulation();

    const prevState = this.history.undo();
    if (prevState) {
      this.setState(
        Object.assign({}, prevState, { sdata: prevState.data }),
        () => {
          this.renderGraphByHistory();
        },
      );
    }
  };

  handleRedo() {
    this.stopForceSimulation();

    const nextState = this.history.redo();
    if (nextState) {
      this.setState(
        Object.assign({}, prevState, { sdata: prevState.data }),
        () => {
          this.renderGraphByHistory();
        },
      );
    }
  };

  renderGraph(data: Data) {
    this.graph!.changeData(cloneDeep(data));
    /**
     * TODO 移除 `afterchangedata` Event
     * 此方法应该放到G6的changeData方法中去emit
     */
    this.graph!.emit('afterchangedata');
  };

  renderGraphByHistory() {
    const { forceSimulation, graphSave } = this;
    if (forceSimulation) {
      forceSimulation.restart(graphSave.nodes || [], this.graph!);
    }
    this.renderGraph(graphSave);
  };

}
</script>
<style lang="less">
.graphin-core {
    height: 100%;
    width: 100%;
    min-height: 500px;
    background: #fff;
}

@font-face {
    font-family: 'graphin'; /* project id 1522921 */
    src: url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.eot');
    src: url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.eot?#iefix') format('embedded-opentype'),
        url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.woff2') format('woff2'),
        url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.woff') format('woff'),
        url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.ttf') format('truetype'),
        url('//at.alicdn.com/t/font_1522921_m3irqw8ynx.svg#graphin') format('svg');
}
</style>
