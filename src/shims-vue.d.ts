declare module "*.vue" {
  import Vue from 'vue';
  import {
    GraphinProps,
    GraphinState,
    ExtendedGraphOptions,
    GraphType,
    ForceSimulation,
    Data,
    Layout,
    ExtendLayout,
  } from '@/types';
  import HistoryController from '@/controller/history';

  export default class AVue extends Vue {
    graphDOM: HTMLDivElement | null
    graph?: GraphType;

    history: HistoryController;

    forceSimulation: ForceSimulation | null;

    g6Options?: Partial<ExtendedGraphOptions>;

    getLayoutInfo: () => any; // eslint-disable-line
    
    clear: () => void;
    getHistoryInfo: () => any;
    handleSaveHistory: () => void;
    handleUndo: () => void;
    handleRedo: () => void;

    clearEvents?: () => void;

    setState: (option: { [key: string]: any }, callback?: Function) => void
  }
}
