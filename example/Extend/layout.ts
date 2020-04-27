import Graphin, { Data, GraphinProps, CommonData, TreeData, Node, Edge } from '../../src'

class TreeNode implements TreeData {
  id: string
  label?: string;
  x?: number;
  y?: number;
  children?: TreeData[];
  data?: Node;
  side?: 'left' | 'right';
  depth?: number;
  collapsed?: boolean;

  constructor(data: Node) {
    this.id = data.id
    this.data = { ...data }
    this.addTreeNodeProp(this, data)
  }

  addTreeNodeProp(treeNode: TreeNode, node: Node) {
    if (node.x) {
      treeNode.x = node.x
    }
    if (node.y) {
      treeNode.y = node.y
    }
    if (node.name) {
      treeNode.label = node.name as string
    } else if (node.label) {
      treeNode.label = node.label
    }
  }
}

function findRoot(data) {
  // assume data is tree-like
  const { nodes, edges } = data
  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i]
    const isSource = edges.some((edge) => {
      return String(edge.target) === String(node.id)
    })
    if (!isSource) {
      return nodes[i]
    }
  }
  return null
}
function treefy(data: Data): CommonData {
  const { nodes, edges } = data
  const root = findRoot(data)
  if (!root) {
    return {
      id: '',
    }
  }

  type NodeMap = { [id: string]: TreeNode }
  const nodeMap: NodeMap = {} 
  nodes.reduce((acc, node) => {
    acc[node.id] = new TreeNode(node)
    return acc
  }, nodeMap)

  edges.forEach(edge => {
    const source = nodeMap[edge.source]
    const target = nodeMap[edge.target]
    if (source && target) {
      if (!source.children) source.children = []
      source.children.push(target)
    }
  })

  return nodeMap[root.id]
}

const layout = (graphin: Graphin, props: GraphinProps) => {
  return [
    {
      name: 'dendrogram',
      desc: '生态树图',
      icon: 'home',
      layout: (data: Data): { data: CommonData } => {
        return {
          data: treefy(data),
        }
      },
    },
  ]
}

export default layout
