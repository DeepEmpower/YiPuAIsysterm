import { ref } from 'vue'

// 定义自定义表格的接口
export interface CustomTable {
  id: number
  name: string
  description?: string
  created_at?: string
}

// 定义API响应状态接口
export interface SearchState {
  loading: boolean
  error: string | null
  tables: CustomTable[]
}

// 创建响应式状态
const state = ref<SearchState>({
  loading: false,
  error: null,
  tables: []
})

// 定义英文到中文的映射
const tableNameMapping: { [key: string]: string } = {
  'T_BD_SUPPLIERBANK': '供应商银行-单据头',
  'T_BD_SUPPLIERBANK_L': '供应商银行-单据明细',
  'T_BD_CUSTOMER': '客户信息',
  'T_BD_SALESORDER': '销售订单',
  'T_BD_PURCHASEORDER': '采购订单',
  'T_BD_INVENTORY': '库存信息',
  'T_BD_EMPLOYEE': '员工信息',
  'T_BD_DEPARTMENT': '部门信息',
  'T_BD_PRODUCT': '产品信息',
  'T_BD_PAYMENT': '付款信息',
  'T_BD_RECEIPT': '收款信息',
  'T_BD_CONTRACT': '合同信息',
  'T_BD_INVOICE': '发票信息',
  'T_BD_DELIVERY': '发货信息',
  'T_BD_LOGISTICS': '物流信息'
}

// 搜索自定义表格的函数
export const searchCustomTables = async (keyword: string): Promise<CustomTable[]> => {
  state.value.loading = true
  state.value.error = null
  
  try {
    const response = await fetch('/table-api/get_tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        InputList: [keyword]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API请求失败:', errorData)
      throw new Error(errorData.message || 'API请求失败')
    }

    const data = await response.json()
    console.log('API返回的原始数据:', data)
    
    // 处理API返回的数据
    if (data && typeof data === 'object') {
      // 检查数据中是否包含tables字段
      if ('tables' in data && Array.isArray(data.tables)) {
        // 将API返回的数据转换为CustomTable格式，并映射中文名称
        const tables = data.tables.map((table: string, index: number) => {
          console.log('处理表名:', table, '映射结果:', tableNameMapping[table])
          return {
            id: index + 1,
            name: tableNameMapping[table] || table, // 如果找不到映射，使用原始名称
            description: `基于"${keyword}"的查询结果`,
            created_at: new Date().toISOString()
          }
        })
        
        state.value.tables = tables
        return tables
      } 
      // 如果数据本身就是数组
      else if (Array.isArray(data)) {
        const tables = data.map((table: string, index: number) => {
          console.log('处理表名:', table, '映射结果:', tableNameMapping[table])
          return {
            id: index + 1,
            name: tableNameMapping[table] || table, // 如果找不到映射，使用原始名称
            description: `基于"${keyword}"的查询结果`,
            created_at: new Date().toISOString()
          }
        })
        
        state.value.tables = tables
        return tables
      }
      else {
        console.error('API返回的数据结构:', data)
        throw new Error('API返回数据格式异常：未找到有效的表格列表')
      }
    } else {
      console.error('API返回的数据类型:', typeof data)
      throw new Error('API返回数据格式异常：数据不是对象或数组')
    }
  } catch (error) {
    console.error('搜索表格失败:', error)
    state.value.error = error instanceof Error ? error.message : '搜索失败'
    throw error
  } finally {
    state.value.loading = false
  }
}

// 导出状态和函数
export const useCustomTableSearch = () => {
  return {
    state,
    searchCustomTables
  }
} 