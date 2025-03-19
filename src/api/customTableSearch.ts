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

// 搜索自定义表格的函数
export const searchCustomTables = async (keyword: string): Promise<CustomTable[]> => {
  state.value.loading = true
  state.value.error = null
  
  try {
    const response = await fetch('/api/get_tables', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        InputList: [keyword]
      })
    })

    if (!response.ok) {
      throw new Error('API请求失败')
    }

    const data = await response.json()

    console.log('API返回的原始数据:', data)
    
    // 处理API返回的数据
    if (data && typeof data === 'object') {
      // 检查数据中是否包含tables字段
      if ('tables' in data && Array.isArray(data.tables)) {
        // 将API返回的数据转换为CustomTable格式
        const tables = data.tables.map((table: string, index: number) => ({
          id: index + 1,
          name: table,
          selected: false
        }))
        
        state.value.tables = tables
        return tables
      } 
      // 如果数据本身就是数组
      else if (Array.isArray(data)) {
        const tables = data.map((table: string, index: number) => ({
          id: index + 1,
          name: table,
          selected: false
        }))
        
        state.value.tables = tables
        return tables
      }
      // 如果数据是字符串数组
      else if (Array.isArray(data.InputList)) {
        const tables = data.InputList.map((table: string, index: number) => ({
          id: index + 1,
          name: table,
          selected: false
        }))
        
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