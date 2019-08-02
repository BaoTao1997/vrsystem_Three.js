import Vue from 'vue';
import Router from 'vue-router';

/* layout */
import Layout from '../components/layout/Layout';



/* dashboard */
const editor = () => import('../components/editor/index');



Vue.use(Router);

 /**
  * icon : the icon show in the sidebar
  * hidden : if hidden:true will not show in the sidebar
  * redirect : if redirect:noredirect will not redirct in the levelbar
  * noDropdown : if noDropdown:true will not has submenu
  * meta : { role: ['admin'] }  will control the page role
  **/

 // path和component.  path 指路径，component 指的是组件
export const constantRouterMap = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    hidden: true,
    icon: 'xinrenzhinan',
    noDropdown: true,
    children: [{ path: 'index', component: editor, name: '编辑器' }]
  }


]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
});

// export const asyncRouterMap = [
//   {
//     path: '/permission',
//     component: Layout,
//     redirect: '/permission/index',
//     name: '权限测试',
//     icon: 'quanxian',
//     meta: { role: ['admin'] },
//     noDropdown: true,
//     children: [{ path: 'index', component: Permission, name: '权限测试页', meta: { role: ['admin'] } }]
//   },
//   {
//     path: '/components',
//     component: Layout,
//     redirect: '/components/index',
//     name: '组件',
//     icon: 'zujian',
//     children: [
//       { path: 'index', component: componentsIndex, name: '介绍 ' },
//       { path: 'tinymce', component: Tinymce, name: '富文本编辑器' },
//       { path: 'markdown', component: Markdown, name: 'Markdown' },
//       { path: 'jsoneditor', component: JsonEditor, name: 'JSON编辑器' },
//       { path: 'dndlist', component: DndList, name: '列表拖拽' },
//       { path: 'splitpane', component: SplitPane, name: 'SplitPane' },
//       { path: 'avatarupload', component: AvatarUpload, name: '头像上传' },
//       { path: 'dropzone', component: Dropzone, name: 'Dropzone' },
//       { path: 'sticky', component: Sticky, name: 'Sticky' },
//       { path: 'countto', component: CountTo, name: 'CountTo' },
//       { path: 'mixin', component: Mixin, name: '小组件' }
//     ]
//   },
//   {
//     path: '/charts',
//     component: Layout,
//     redirect: '/charts/index',
//     name: '图表',
//     icon: 'tubiaoleixingzhengchang',
//     children: [
//       { path: 'index', component: chartIndex, name: '介绍' },
//       { path: 'keyboard', component: KeyboardChart, name: '键盘图表' },
//       { path: 'keyboard2', component: KeyboardChart2, name: '键盘图表2' },
//       { path: 'line', component: LineMarker, name: '折线图' },
//       { path: 'mixchart', component: MixChart, name: '混合图表' }
//     ]
//   },
//   {
//     path: '/errorpage',
//     component: Layout,
//     redirect: 'noredirect',
//     name: '错误页面',
//     icon: '404',
//     children: [
//       { path: '401', component: Err401, name: '401' },
//       { path: '404', component: Err404, name: '404' }
//     ]
//   },
//   {
//     path: '/errlog',
//     component: Layout,
//     redirect: 'noredirect',
//     name: 'errlog',
//     icon: 'bug',
//     noDropdown: true,
//     children: [{ path: 'log', component: ErrorLog, name: '错误日志' }]
//   },
//   {
//     path: '/excel',
//     component: Layout,
//     redirect: 'noredirect',
//     name: 'excel',
//     icon: 'EXCEL',
//     noDropdown: true,
//     children: [{ path: 'download', component: ExcelDownload, name: '导出excel' }]
//   },
//   {
//     path: '/theme',
//     component: Layout,
//     redirect: 'noredirect',
//     name: 'theme',
//     icon: 'theme',
//     noDropdown: true,
//     children: [{ path: 'index', component: Theme, name: '换肤' }]
//   },
//   {
//     path: '/example',
//     component: Layout,
//     redirect: 'noredirect',
//     name: '综合实例',
//     icon: 'zonghe',
//     children: [
//       {
//         path: '/table',
//         component: TableLayout,
//         redirect: '/table/table',
//         name: 'table',
//         children: [
//           { path: 'dynamictable', component: DynamicTable, name: '动态table' },
//           { path: 'dragtable', component: DragTable, name: '拖拽table' },
//           { path: 'inline_edit_table', component: InlineEditTable, name: 'table内编辑' },
//           { path: 'table', component: Table, name: '综合table' }
//         ]
//       },
//       { path: 'form/edit', component: Form, name: '编辑form', meta: { isEdit: true } },
//       { path: 'form/create', component: Form, name: '创建form' }
//     ]
//   },
//   { path: '*', redirect: '/404', hidden: true }
// ];
