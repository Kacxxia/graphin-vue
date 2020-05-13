import { VNodeChildren } from 'vue'
import {
  Graph as IGraph,
  TreeGraph as ITreeGraph,
  GraphOptions,
  Canvas as ICanvas,
  Node as INode,
  Edge as IEdge,
  GraphData,
  TreeGraphData,
  NodeConfig,
  ShapeStyle,
  EdgeConfig,
  GShapeType,
  Group
} from './common/interfaces/index'
import ForceLayout from '@/layout/force/ForceLayout';
import { LayoutOption } from '@/controller/layout/defaultLayouts';
import Graphin from './Graphin.vue';

export {
  NodeConfig,
  Group
}

/** export types  */
export type G6Type = any; // eslint-disable-line
export type Graph = IGraph;
export type CommonGraph = IGraph | ITreeGraph;

export type GraphNode = INode;
export type GraphEdge = IEdge;

export interface GraphType extends IGraph {}
export interface ExtendedGraph extends IGraph {}

/** G6 没有暴露这个类型 */
export interface G6Event extends MouseEvent {
  item: INode & IEdge;
  target: MouseEvent['target'];
}

export interface G6KeyboardEvent extends KeyboardEvent {
  item: INode & IEdge;
  target: KeyboardEvent['target'];
}

/** Graphin 用到一些 G6 官方没有暴露的 API，所以需要 extend 官方的类型 */
export interface ExtendedGraphOptions extends GraphOptions {
  /**
   * 默认缩放比例
   */
  zoom?: number;
  /**
   * 像素比率
   * 默认值 1.0
   */
  pixelRatio?: number;

  pan?: { x: number; y: number };

  disablePan?: boolean; // 禁止画布平移
  disableZoom?: boolean; // 禁用画布缩放
  disableDrag?: boolean; // 禁用节点拖拽
  disableHighlight?: boolean; // 禁用highlight
  delegateNode?: boolean;
  wheelSensitivity?: number;
  isZoomOptimize?: (graph?: Graph, e?: G6Event) => boolean;
  keyShapeZoom?: number;
  autoFollowWithForce?: boolean;
  autoPinWithForce?: boolean;
  restartForceOnDrag?: boolean;
  [key: string]: any; // eslint-disable-line
}

export interface Canvas extends ICanvas {}



/** 默认节点样式 */
export interface NodeStyle extends ShapeStyle {
  /** 节点的大小 */
  nodeSize?: number;
  /** 节点的主要颜色 */
  primaryColor?: string;
  /** 文本的字体大小 */
  fontSize?: number;
  /** 文本的字体颜色 */
  fontColor?: string;
  /** dark 置灰 */
  dark?: string;
  /** iconfont 的 font-family */
  fontFamily?: string;
  /** icon 的类型 */
  icon?: string;
}

export interface Node extends NodeConfig {
  /** 节点源数据 */
  data: {
    /** 唯一标示ID，必选 */
    id: string;
    /** 节点数据类型 */
    type?: string;
    /** 节点文本 */
    label?: string;
    /** 节点属性 */
    properties?: any[]; // eslint-disable-line
  };
  /** 唯一标示ID，必选 */
  id: string;
  /** 节点类型 */
  shape?: string;
  /** 节点文本 */
  label?: string;
  /** 节点样式 */
  style?: Partial<NodeStyle>;
  /** 节点位置信息 */
  x?: number;
  y?: number;
  /** 内置的布局，追加的额外属性 */
  layout?: NodeLayoutType;
  /** 节点度数 */
  degree?: number;
  searchTypes?: string[];
}

export interface NodeLayoutType {
  /** 节点度数 */
  degree?: number;
  /** 力导布局 */
  force?: {
    mass?: number;
  };
  /** 同心圆布局 */
  concentric?: {
    outerR?: number;
    center: {
      x: number;
      y: number;
    };
    theta: number;
  };
}
export interface Edge extends EdgeConfig {
  /** 边的数据，必选 */
  data: {
    /** 边的属性 */
    properties?: object[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  /** 边的源节点，必选 */
  source: string;
  /** 边的目标节点，必选 */
  target: string;
  /** 边的类型 */
  shape?: string;

  /** 边的文本 */
  label?: string;
  /** 边的样式 */
  style?: object;
  id?: string;
  /** 边的弹簧长度，力导时使用 */
  spring?: number;
}

export type NodeData = Node['data'];
export type EdgeData = Edge['data'];

export interface Data extends GraphData {
  nodes: Node[],
  edges: Edge[]
}
export interface TreeData extends TreeGraphData {}
export type CommonData = Data | TreeData
export interface Layout {
  /** 布局名称，必选 */
  name: string;
  /** 布局配置，可选 */
  options?: object;
}

export interface Layout {
  /** 布局名称，必选 */
  name: string;
  /** 布局配置，可选 */
  options?: object;
}

/** 用户自定义shape的样式 */
export interface NodeShape {
  name: string;
  shapeComponent?: ShapeComponent;
}
export interface EdgeShape {
  name: string;
  style?: object;
}

export interface ShapeComponent {
  shape: GShapeType;
  attrs: {
    /** 这个shape图形的ID，用户自定义，保证不重复即可 */
    id: string;
    // eslint-disable-next-line
    [key: string]: any;
  };
  isKeyShape?: boolean;
  noReset?: boolean;
}

export interface NodeShapeFunction {
  (node: Node): {
    /** 自定义Shape的名称，之后数据指定即可调用这个Shape定义 */
    shape: string;
    shapeComponents: ShapeComponent[];
    state: {
      [stateName: string]: {
        [id: string]: {
          [attr: string]: any; // eslint-disable-line
        };
      };
    };
  };
}

export interface ExtendNodeShape {
  name: string;
  render: NodeShapeFunction;
}
export interface ExtendLayout {
  /** 布局名称，唯一标示 */
  name: string;
  /** 布局展示名称 */
  desc: string;
  /** antd icon */
  icon: string;
  /** Graphin在切换到力导图布局时会先用前布局处理一下数据，用treelike字段区分，以防止从类树布局切换到正常布局时漏节点 */
  treelike?: boolean;
  /** layout 布局执行函数 */
  layout: (
    data: Data,
    options: LayoutOption,
  ) => {
    data: CommonData;
    forceSimulation?: ForceSimulation;
  };
}
export interface ExtendMarker {
  /** 唯一标示名称 */
  name: string;
  /** Marker的Path路径 */
  path: string;
}

export interface IconFontMapItem {
  name: string;
  unicode_decimal: number;
}

export interface ExtendIcon {
  /** 字体名称 */
  fontFamily: string;
  /** iconfont 的 class name 和 unicode decimal 的映射 */
  map: IconFontMapItem[];
}

export interface Register {
  /** 节点名称 */
  name: string;
  /** register执行函数,参数为G6对象 */
  register: (G6: G6Type) => void;
}

export interface BehaviorRegister extends Register {
  options: any; // eslint-disable-line
  mode: string;
}

export type GraphinPropsExtend = {
  layout?: (graphin: Graphin, prevProps: GraphinProps) => ExtendLayout[];
  nodeShape?: () => ExtendNodeShape[];
  marker?: () => ExtendMarker[];
  icon?: () => ExtendIcon[];
}

export type GraphinPropsRegister = {
  /** 通过G6原生方法，注册节点 */
  nodeShape?: (G6: G6Type) => Register[];
  /** 通过G6原生方法，注册边 */
  edgeShape?: (G6: G6Type) => Register[];
  /** 通过G6原生方法，注册事件 */
  behavior?: (G6: G6Type) => BehaviorRegister[];
};

export interface GraphinProps {
  /** render */
  data: Data;
  /** options */
  options?: Partial<ExtendedGraphOptions>;
  /** layout */
  layout?: Layout;

  extend?: GraphinPropsExtend;
  register?: GraphinPropsRegister;

  children?: VNodeChildren;

  [key: string]: GraphinProps[keyof GraphinProps];
}

export type ForceSimulation = ForceLayout;

export interface GraphinHistory extends GraphinState {
  graphSave: any; // eslint-disable-line
}

export interface GraphinState {
  isGraphReady: boolean;
  width: number;
  height: number;
  data: CommonData;
  graph?: GraphType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphSave?: any;
  forceSimulation?: ForceSimulation | null;
}

export interface LayoutOptionBase {
  graph: GraphType;
  width: number;
  height: number;
  data: Data;
  defaultLayouts: (graphin: Graphin, prevProps: GraphinProps) => ExtendLayout[],
  extendLayouts: (graphin: Graphin, prevProps: GraphinProps) => ExtendLayout[],
}
