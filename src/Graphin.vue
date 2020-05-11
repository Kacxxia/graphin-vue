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
  CommonData,
  Layout,
  ExtendLayout,
  GraphinPropsExtend,
  GraphinPropsRegister,
  Group
} from './types';

/** utils */
import shallowEqual from './utils/shallowEqual';

function plainData<T>(arg: T): T {
  return JSON.parse(JSON.stringify(arg))
}

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
    this.behaviorsMode = behaviorsMode
    // init G6 instance
    const { instance, width, height, options } = initController(
      this.$props as GraphinProps,
      this.graphDOM as HTMLDivElement,
      behaviorsMode,
    );

    this.g6Options = options;
    this.graph = instance as GraphType;
    this.history = new HistoryController()
    const { data: newData, forceSimulation } = layoutController(this.getContext(), { data: cloneDeep(data) });
    if (this.$props.layout && this.$props.layout.name) {
      this.currentLayout = this.$props.layout.name
    } else {
      this.currentLayout = 'concentric'
    }
    this.centerView()
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
    this.graph.destroy()
  },
  errorCaptured (error: Error, vm: Vue, info: String) {
    console.error('Catch component error: ', error, info)
  }
})
export default class Graphin extends Vue {
  @Prop(Object) data: Data
  @Prop(String) graphType: 'Graph' | 'TreeGraph'
  @Prop(Object) options?: Partial<ExtendedGraphOptions>
  @Prop(Object) layout?: Layout
  @Prop(Object) extend?: GraphinPropsExtend
  @Prop(Object) register?: GraphinPropsRegister

  isGraphReady: boolean = false
  sdata: CommonData = {
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

  currentLayout: string

  @Watch('graphType')
  onGraphTypeChanged() {
    this.history.reset()
    this.graph.destroy()
    const { instance, width, height, options } = initController(
      this.$props as GraphinProps,
      this.graphDOM as HTMLDivElement,
      this.behaviorsMode,
    );
    this.graph = instance as GraphType;
    console.log('graph-inst-canged')
    this.$emit('graph-inst-changed')

    const { data: newData, forceSimulation } = layoutController(this.getContext(), { data: cloneDeep(this.$props.data) });
    
    this.setState(
      {
        width,
        height,
        sdata: newData,
        forceSimulation,
      },
      () => {
        this.renderGraphWithLifeCycle();
      },
    );
  }

  @Watch('data.nodes')
  onDataNodesChanged() {
    const p: GraphinProps = {
      data: this.$props.data
    }
    this.$nextTick(() => {
      this.rerenderGraph(p)
    })
  }
  @Watch('data.edges')
  onDataEdgesChanged() {
    const p: GraphinProps = {
      data: this.$props.data
    }
    this.rerenderGraph(p)
  }
  @Watch('layout', { deep: true })
  onLayoutChanged(val: Layout, oldVal: Layout) {
    const p: GraphinProps = {
      data: this.$props.data,
      layout: oldVal
    }

    // 保证树图布局和普通布局的切换后的渲染由graphType的watcher执行
    const builtinTreeLayouts = ['dendrogram', 'compactBox', 'indented', 'mindmap']
    if ((builtinTreeLayouts.includes(this.currentLayout) && !builtinTreeLayouts.includes(val.name || 'concentric'))
    || (!builtinTreeLayouts.includes(this.currentLayout) && builtinTreeLayouts.includes(val.name || 'concentric'))) {
    } else {
      this.$nextTick(() => {
        this.rerenderGraph(p)
      })
    }
    this.currentLayout = val.name || 'concentric'
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

  rerenderGraph(prevProps: GraphinProps) {
    const { data, forceSimulation } = layoutController(this.getContext(), { data: cloneDeep(prevProps.data), prevProps });
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
    // this.centerView()
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

  renderGraph(data: CommonData) {
    this.graph!.changeData(plainData(data));
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

  centerView() {
    const { graph } = this;
    const group: Group = graph.get('group');
    const width: number = graph.get('width');
    const height: number = graph.get('height');
    group.resetMatrix();
    const bbox = group.getCanvasBBox();
    if (bbox.width === 0 || bbox.height === 0) return;
    const viewCenter = {
      x: width / 2,
      y: height / 2
    };
    const groupCenter = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };
    graph.translate(viewCenter.x - groupCenter.x, viewCenter.y - groupCenter.y);
  }

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
