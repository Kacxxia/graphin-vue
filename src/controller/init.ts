import G6 from '@antv/g6';
import { GraphinProps, ExtendedGraphOptions, CommonGraph as GraphType } from '../types';
import { ILayoutOptions } from '../common/interfaces' 

export interface BehaviorModeItem {
  type: string;
  [key: string]: string | number | boolean | undefined;
}

interface BehaviorsMode {
  [mode: string]: (BehaviorModeItem | string)[];
}

export const initGraphAfterRender = (props: GraphinProps, graphDOM: HTMLDivElement, instance: GraphType) => {
  const { options = {} } = props;
  const { pan, zoom } = options;

  // 平移
  if (pan) instance.moveTo(pan.x, pan.y);

  // 缩放
  if (zoom) instance.zoomTo(zoom, pan!);
};

const getTreeLayout = (props: GraphinProps): ILayoutOptions => {
  const defaultLayout: ILayoutOptions = {
    type: 'dendrogram'
  }
  const builtinTreeLayouts = ['dendrogram', 'compactBox', 'indented', 'mindmap']
  if (props.layout) {
    if (builtinTreeLayouts.includes(props.layout.name)) {
      let options = {}
      if (props.layout.options) {
        options = { ...props.layout.options }
      }
      return {
        type: props.layout.name,
        ...options
      }
    }
  }
  return defaultLayout
}

const initGraph = (props: GraphinProps, graphDOM: HTMLDivElement, behaviorsMode: BehaviorsMode) => {
  const { clientWidth, clientHeight } = graphDOM;
  /** default options  */
  const defaultOptions: Partial<ExtendedGraphOptions> = {
    // initial canvas
    container: graphDOM,
    renderer: 'canvas',
    width: clientWidth,
    height: clientHeight,
    // initial viewport state:
    zoom: 1,
    pan: { x: clientWidth / 2, y: clientHeight / 2 },
    // interaction options:
    minZoom: 0.2,
    maxZoom: 10,
    // rendering options:
    animate: true,
    animateCfg: {
      duration: 500,
      easing: 'easeLinear',
    },
    plugins: [],
    modes: {
      default: [],
    },
    // Graphin unique options
    disablePan: false, // 禁止画布平移
    disableZoom: false, // 禁用画布缩放
    disableDrag: false, // 禁用节点拖拽
    wheelSensitivity: 1, // 缩放的敏感度，我们在内部有不同设备的最佳匹配
  };

  /** merged options */
  const options: Partial<ExtendedGraphOptions> = {
    ...defaultOptions,
    ...(props.options || {}),
  };

  /** deconstruct g6 Options */
  const {
    disableZoom, // 禁用画布缩放
    disablePan, // 禁用移动画布
    disableDrag, // 禁用节点拖拽
    disableClick, // 禁止节点点击
    disableBrush, // 禁止框选
    wheelSensitivity, // 缩放的敏感度，我们在内部有不同设备的最佳匹配
    pan, // 默认移动到位置
    zoom, // 默认缩放比例

    modes, // 需要内置default mode

    ...g6Options
  } = options as ExtendedGraphOptions;

  /** Graphin built-in g6 behaviors */
  const innerBehaviors = [
    // 拖拽画布
    {
      type: 'drag-canvas',
      disable: disablePan,
      options: {},
    },
    // 缩放画布
    {
      type: 'zoom-canvas',
      disable: disableZoom,
      options: {
        sensitivity: wheelSensitivity,
      },
    },
    // 画布框选
    {
      type: 'brush-select',
      disable: disableBrush,
      options: {
        trigger: 'shift',
        includeEdges: false,
      },
    },
    // 点击选择
    {
      type: 'click-select',
      disable: disableClick,
      options: {
        multiple: true, // 允许多选
        trigger: 'alt',
      },
    },
    // 拖拽节点
    {
      type: 'drag-node',
      disable: disableDrag,
      options: {},
    },
  ];
  const defaultModes = innerBehaviors
    .filter(c => {
      return !c.disable;
    })
    .map(c => {
      return {
        type: c.type,
        ...c.options,
      };
    });
  let instance: GraphType
  const commonOptions = {
    ...g6Options,
    modes: {
      ...behaviorsMode, // Add multiple G6 behavior modes
      default: [...defaultModes, ...modes!.default!, ...behaviorsMode.default],
    },
  }
  if (props.graphType === 'TreeGraph') {
    instance = new G6.TreeGraph({
      ...commonOptions,
      layout: getTreeLayout(props)
    })
  } else {
    instance = new G6.Graph({
      ...commonOptions
    })
  }

  // 平移
  if (pan) instance.moveTo(pan.x, pan.y);

  // 缩放
  if (zoom) instance.zoomTo(zoom, pan!);

  return {
    options: props.options || defaultOptions,
    instance,
    width: clientWidth,
    height: clientHeight,
  };
};

export default initGraph;
