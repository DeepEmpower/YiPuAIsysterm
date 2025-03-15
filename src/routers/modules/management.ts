/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout/index.vue'

const managementRouter = [
  {
    path: '/management',
    component: Layout,
    redirect: '/management/analysis',
    name: 'management',
    meta: {
      title: '企业管理',
      icon: 'Management',
    },
    children: [
      {
        path: '/management/analysis',
        component: () => import('@/views/management/analysis.vue'),
        name: 'analysis',
        meta: { title: '企业分析', keepAlive: true, icon: 'DataAnalysis' },
      },
      {
        path: '/management/people',
        component: () => import('@/views/management/people.vue'),
        name: 'people',
        meta: { title: '人员管理', icon: 'UserFilled' },
      },
      {
        path: '/management/report/ReportGenerator',
        component: () => import('@/views/management/report/ReportGenerator.vue'),
        name: 'ReportGenerator',
        meta: { title: '报表生成', keepAlive: true, icon: 'Document' },
      }, 
     
      {
        path: '/management/Approval',
        component: () => import('@/views/management/Approval.vue'),
        name: 'finance',
        meta: { title: '审批助手', keepAlive: true, icon: 'Folder' },
      }, 
    ],
  },
]

export default managementRouter
