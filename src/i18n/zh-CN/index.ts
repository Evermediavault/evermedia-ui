/**
 * 中文（简体）语言包
 */
export default {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    failed: '操作失败',
    error: '发生错误',
    warning: '警告',
    info: '提示',
  },

  // 表单验证
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    url: '请输入有效的URL地址',
    password: '密码至少8位，包含大小写字母、数字和特殊字符',
    minLength: '长度不能少于 {min} 个字符',
    maxLength: '长度不能超过 {max} 个字符',
    length: '长度必须在 {min} 到 {max} 个字符之间',
    number: '请输入有效的数字',
    integer: '请输入整数',
    positive: '请输入正数',
    negative: '请输入负数',
    range: '数值必须在 {min} 到 {max} 之间',
  },

  // 错误提示
  error: {
    network: '网络错误，请检查网络连接',
    timeout: '请求超时，请稍后重试',
    server: '服务器错误，请稍后重试',
    notFound: '未找到请求的资源',
    unauthorized: '未授权，请先登录',
    forbidden: '没有权限访问',
    unknown: '未知错误',
  },

  // 成功提示
  success: {
    saved: '保存成功',
    deleted: '删除成功',
    updated: '更新成功',
    created: '创建成功',
  },
};
