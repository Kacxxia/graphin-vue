import { cloneDeep } from 'lodash';
import { LayoutOptionBase, Data } from '../../types';
import { Layout } from '../../common/interfaces'

export interface RadialLayoutOption extends LayoutOptionBase {
  /** 中心点坐标 */
  center: [number, number];
  /** 防止覆盖 */
  preventOverlap: boolean;
  /** 节点大小 */
  nodeSize: number;
  /** 每层的半径 */
  unitRadius: number;
}

const radialLayout = (data: Data, options: RadialLayoutOption) => {
  const source = cloneDeep(data);
  // eslint-disable-next-line new-cap
  const layout = new Layout.radial({
    ...options,
  });

  layout.init(source);
  layout.execute();

  return {
    nodes: layout.nodes,
    edges: data.edges,
  };
};
export default radialLayout;
