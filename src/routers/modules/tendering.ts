/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout/index.vue'

const tenderingRouter = [
  {
    path: '/tendering',
    component: Layout,
    redirect: '/tendering/Generation',
    name: 'projectManagement',
    meta: {
      title: '合同管理',
      icon: 'Notebook',
    },
    children: [
      {
        path: '/tendering/Generation',
        component: () => import('@/views/tendering/Generation.vue'),
        name: 'Generation',
        meta: { title: '合同生成', keepAlive: true, icon: 'Rank' },
      },
      {
        path: '/tendering/comparison',
        component: () => import('@/views/tendering/comparison.vue'),
        name: 'comparison',
        meta: { title: '合同比对', icon: 'Goods' },
      },
      {
        path: '/tendering/copyright',
        component: () => import('@/views/tendering/copyright.vue'),
        name: 'copyright',
        meta: { title: '合同审阅', icon: 'Document' },
      }
    ],
  },
]

export default tenderingRouter
