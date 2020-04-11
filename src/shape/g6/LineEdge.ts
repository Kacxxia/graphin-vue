import setEdgeState from './setState.edge';
import { Item } from '@/common/interfaces'

// eslint-disable-next-line
export default (G6: any) => {
  G6.registerEdge(
    'LineEdge',
    {
      // 设置状态
      setState(name: string, value: string, item: Item) {
        setEdgeState(name, value, item);
      },
    },
    'line',
  );
};
