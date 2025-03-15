// 导入Vue Router相关的类型和方法
import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory, Router } from 'vue-router'
// 导入布局组件
import Layout from '@/layout/index.vue'
// 定义扩展路由接口，添加可选的hidden属性
interface extendRoute {
  hidden?: boolean // 定义是否在导航菜单中隐藏该路由
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
    redirect: '/home/idear', // 重定向到"AI文员"页面
    meta: { title: 'AI员工', icon: 'Calendar' }, // 设置菜单标题和图标
    children: [ // 子路由配置
      {
        path: '/home/idear', // AI文员路径
        component: () => import('@/views/home/idear.vue'), // 懒加载AI文员组件
        name: 'idear', // 路由名称
        meta: { title: 'AI文员', keepAlive: true, icon: 'Notebook' }, // 设置标题、缓存和图标
      },
      {
        path: '/home/achieve', // AI人力路径
        component: () => import('@/views/home/achieve.vue'), // 懒加载AI人力组件
        name: 'achieve', // 路由名称
        meta: { title: 'AI人力', icon: 'MenuIcon' }, // 设置标题和图标
      },
      {
        path: '/home/examine', // 审稿路径
        component: () => import('@/views/home/examine.vue'), // 懒加载审稿组件
        name: 'examine', // 路由名称
        meta: { title: '审稿', keepAlive: true, icon: 'FolderChecked' }, // 设置标题、缓存和图标
      },
     
      {
        path: '/home/AI_customer', // AI客服路径
        component: () => import('@/views/home/AI_customer.vue'), // 懒加载AI客服组件
        name: 'creativeDrawing', // 路由名称
        meta: { title: 'AI客服', keepAlive: true, icon: 'SetUp' }, // 设置标题、缓存和图标
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
