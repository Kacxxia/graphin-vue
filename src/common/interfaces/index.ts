
import { INode, IEdge } from '@antv/g6/lib/interface/item';
import IGroup from '@antv/g-canvas/lib/group';
import { IShape as IGShape } from '@antv/g-canvas/lib/interfaces';
export { GraphOptions, ILayoutOptions } from '@antv/g6/lib/interface/graph';
export { default as Canvas } from '@antv/g-canvas/lib/canvas'
export { Marker } from '@antv/g-canvas/lib/shape'
export { Graph, TreeGraph, Layout } from '@antv/g6';
export {
  GraphData,
  TreeGraphData,
  IG6GraphEvent as GraphEvent,
  NodeConfig,
  EdgeConfig,
  ModelConfig,
  ShapeStyle
} from '@antv/g6/lib/types';

export type Item = Node | Edge
export interface Node extends INode {}
export interface Edge extends IEdge {}

// G
export type GAttrs = { [k in string]: any };
export type GShapeType =
    | 'arc'
    | 'circle'
    | 'dom'
    | 'ellipse'
    | 'fan'
    | 'image'
    | 'line'
    | 'marker'
    | 'path'
    | 'polygon'
    | 'polyline'
    | 'rect'
    | 'text';
export interface GShape extends IGShape {}
export interface Group extends IGroup {}