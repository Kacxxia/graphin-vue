import G6 from '@antv/g6';
import { Graph as IGraph, Node, Edge, Item } from './common/interfaces/index'
import Graphin from './Graphin.vue';
import Utils from './utils';
import Layout from './layout';

export default Graphin;
export { Utils, Layout };

export * from './types';

/** export types  */
export type Graph = IGraph;
export type GraphNode = Node;
export type GraphEdge = Edge;

export interface GraphEvent extends MouseEvent {
  item: Item;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any;
}
