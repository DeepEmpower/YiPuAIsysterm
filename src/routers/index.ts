// 导入Vue Router相关的类型和方法
import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory, Router } from 'vue-router'
// 导入布局组件
import Layout from '@/layout/index.vue'
// 定义扩展路由接口，添加可选的hidden属性
interface extendRoute {
  hidden?: boolean // 定义是否在导航菜单中隐藏该路由
  children?: Array<RouteRecordRaw & extendRoute>
  meta?: {
    title?: string
    icon?: string
    keepAlive?: boolean
  }
}
// 分割线，下面导入模块化的路由配置
// 导入工具类路由
import toolRouter from './modules/tool'
// 导入知识类路由
import knowledge from './modules/knowledge'
// 导入管理类路由
import managementRouter from './modules/management'
// 导入招标类路由
import tenderingRouter from './modules/tendering'


// 定义异步加载的路由，这些路由通常需要权限验证
export const asyncRoutes = [
  ...managementRouter, // 展开管理类路由
  ...knowledge,        // 展开知识类路由
  ...tenderingRouter,  // 展开招标类路由
  ...toolRouter,       // 展开工具类路由
 
]

/**
 * 路由配置项说明:
 * path ==> 路由路径
 * name ==> 路由名称
 * component ==> 路由组件
 * redirect ==> 路由重定向
 * alwaysShow ==> 如果设置为true，将始终显示根菜单，无论其子路由长度如何
 * hidden ==> 如果"hidden:true"不会显示在侧边栏中（默认值为false）
 * keepAlive ==> 设为true 缓存
 * meta ==> 路由元信息
 * meta.title ==> 路由标题
 * meta.icon ==> 菜单icon
 * meta.affix ==> 如果设置为true将会出现在 标签栏中
 * meta.breadcrumb ==> 如果设置为false，该项将隐藏在breadcrumb中（默认值为true）
 * meta.activeMenu ==> 详情页的时候可以设置菜单高亮 ,高亮菜单的path
 */

// 定义基础路由，这些路由不需要权限验证
export const constantRoutes: Array<RouteRecordRaw & extendRoute> = [
  {
    path: '/404', // 404页面路径
    name: '404',  // 路由名称
    component: () => import('@/views/errorPages/404.vue'), // 懒加载404页面组件
    hidden: true, // 在导航菜单中隐藏
  },
  {
    path: '/403', // 403页面路径
    name: '403',  // 路由名称
    component: () => import('@/views/errorPages/403.vue'), // 懒加载403页面组件
    hidden: true, // 在导航菜单中隐藏
  },
  {
    path: '/login', // 登录页面路径
    name: 'Login',  // 路由名称
    component: () => import('@/views/login/index.vue'), // 懒加载登录页面组件
    hidden: true,   // 在导航菜单中隐藏
    meta: { title: '登录' }, // 设置页面标题为"登录"
  },
  {
    path: '/', // 根路径
    name: 'layout', // 路由名称
    component: Layout, // 使用Layout布局组件
    redirect: '/home/AI_writer/AIWriter', // 重定向到"AI文员"页面
    meta: { title: 'AI员工', icon: 'Calendar' }, // 设置菜单标题和图标
    children: [ // 子路由配置
      {
        path: '/home/AI_writer/AIWriter', // AI文员路径
        component: () => import('@/views/home/AI_writer/AIWriter.vue'), // 懒加载AI文员组件
        name: 'AIWriter', // 路由名称
        meta: { title: 'AI文员', keepAlive: true, icon: 'Document' }, // 设置标题、缓存和图标
      },
      {
        path: '/home/AI_writer/feasibility-report',
        component: () => import('@/views/home/AI_writer/FeasibilityReport.vue'),
        name: 'FeasibilityReport',
        meta: { title: '可研报告编写', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_writer/product-planning',
        component: () => import('@/views/home/AI_writer/ProductPlanningReport.vue'),
        name: 'ProductPlanningReport',
        meta: { title: '产品策划编写', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_writer/sales-report',
        component: () => import('@/views/home/AI_writer/SalesReport.vue'),
        name: 'SalesReport',
        meta: { title: '销售报告编写', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_writer/custom-assistant',
        component: () => import('@/views/home/AI_writer/CustomAssistant.vue'),
        name: 'CustomAssistant',
        meta: { title: '自定义AI助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_writer/custom-creation',
        component: () => import('@/views/home/AI_writer/CustomCreation.vue'),
        name: 'CustomCreation',
        meta: { title: '创建自定义助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/AIHr.vue', // AI人力路径
        component: () => import('@/views/home/AI_hr/AIHr.vue'), // 懒加载AI人力组件
        name: 'achieve', // 路由名称
        meta: { title: 'AI人力', icon: 'MenuIcon' }, // 设置标题和图标
      },
      {
        path: '/home/AI_hr/resume-screening',
        component: () => import('@/views/home/AI_hr/ResumeScreening.vue'),
        name: 'ResumeScreening',
        meta: { title: '简历筛选助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/interview-questions',
        component: () => import('@/views/home/AI_hr/InterviewQuestions.vue'),
        name: 'InterviewQuestions',
        meta: { title: '面试问题生成', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/training-plan',
        component: () => import('@/views/home/AI_hr/TrainingPlan.vue'),
        name: 'TrainingPlan',
        meta: { title: '培训方案设计', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/performance-evaluation',
        component: () => import('@/views/home/AI_hr/PerformanceEvaluation.vue'),
        name: 'PerformanceEvaluation',
        meta: { title: '绩效考核方案', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/personnel-deployment',
        component: () => import('@/views/home/AI_hr/PersonnelDeployment.vue'),
        name: 'PersonnelDeployment',
        meta: { title: '人员调派方案', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_hr/custom',
        component: () => import('@/views/home/AI_hr/CustomAssistant.vue'),
        name: 'HRCustomAssistant',
        meta: { title: '自定义AI助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/examine', // 审稿路径
        component: () => import('@/views/home/examine.vue'), // 懒加载审稿组件
        name: 'examine', // 路由名称
        meta: { title: '审稿', keepAlive: true, icon: 'FolderChecked' }, // 设置标题、缓存和图标
      }, 
      {
        path: '/home/AI_service/AIService.vue', // AI客服路径
        component: () => import('@/views/home/AI_service/AIService.vue'), // 懒加载AI客服组件
        name: 'AIService',
        meta: { title: 'AI客服', keepAlive: true, icon: 'Service' },
      },
      {
        path: '/home/AI_service/smart-qa',
        component: () => import('@/views/home/AI_service/smart-qa.vue'),
        name: 'SmartQA',
        meta: { title: '智能问答助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/after-sales',
        component: () => import('@/views/home/AI_service/after-sales.vue'),
        name: 'AfterSales',
        meta: { title: '售后服务助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/complaint-handling',
        component: () => import('@/views/home/AI_service/complaint-handling.vue'),
        name: 'ComplaintHandling',
        meta: { title: '投诉处理助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/customer-analysis',
        component: () => import('@/views/home/AI_service/customer-analysis.vue'),
        name: 'CustomerAnalysis',
        meta: { title: '客户分析助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/auto-followup',
        component: () => import('@/views/home/AI_service/auto-followup.vue'),
        name: 'AutoFollowup',
        meta: { title: '自动回访助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/product-service',
        component: () => import('@/views/home/AI_service/product-service.vue'),
        name: 'ProductService',
        meta: { title: '产品客服助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/AI_service/custom-assistant',
        component: () => import('@/views/home/AI_service/custom-assistant.vue'),
        name: 'CustomAssistant',
        meta: { title: '自定义助手', keepAlive: true, icon: 'Document' },
        hidden: true,
      },
      {
        path: '/home/voice', // 语音生成路径
        component: () => import('@/views/home/voice.vue'), // 懒加载语音生成组件
        name: 'voice', // 路由名称
        meta: { title: 'AI播报员', keepAlive: true, icon: 'Collection' }, // 设置标题、缓存和图标
      }, 
    ],
  },
]

/**
 * notFoundRouter(找不到路由)
 * 当访问的路径不存在时，重定向到404页面
 */
export const notFoundRouter = {
  path: '/:pathMatch(.*)', // 匹配所有未定义的路由
  name: 'notFound',        // 路由名称
  redirect: '/404',        // 重定向到404页面
}

// 创建路由实例
const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL), // history模式（已注释）
  history: createWebHashHistory(), // 使用hash模式
  routes: constantRoutes, // 使用基础路由配置
})

// 导出路由实例
export default router
