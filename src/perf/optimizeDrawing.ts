import { ExtendedGraph } from '../types';
import { GShape, Item } from '@/common/interfaces'

/**
 *
 * @param {boolean} isOptimize 是否开启Shape的渲染优化，默认针对非KeyShape节点
 * @param {Item} node 单个Node
 */
const optimizeDrawingByNode = (isOptimize: boolean, node: Item) => {
  const shapes = node.getContainer().get('children');
  const keyShape = shapes.find((item: any) => item.isKeyShape); //eslint-disable-line
  keyShape.show();

  shapes.forEach((shape: GShape) => {
    if (isOptimize && shape !== keyShape) {
      shape.hide();
    } else {
      shape.show();
    }
  });
};
/**
 *
 * @param {object} graph G6的Graph实例
 * @param {boolean} isOptimize 是否减少Shape的渲染，默认是非KeyShape节点
 */
const optimizeDrawing = (graph: ExtendedGraph, isOptimize: boolean) => {
  graph.getNodes().forEach((node) => {
    optimizeDrawingByNode(isOptimize, node);
  });
  /** 渲染 */

  graph.autoPaint();
};

export { optimizeDrawing, optimizeDrawingByNode };
