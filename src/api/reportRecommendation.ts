import { ref } from 'vue';

// 定义推荐报表的接口
export interface RecommendedReport {
  id: string;
  name: string;
  description?: string;
  type: string;
}

// 定义API响应状态接口
export interface RecommendationState {
  isGenerating: boolean;
  reports: RecommendedReport[];
  error: string;
}

// 创建响应式状态
const state = ref<RecommendationState>({
  isGenerating: false,
  reports: [],
  error: ''
});

// 获取推荐报表
export const getRecommendedReports = async (keyword: string): Promise<RecommendedReport[]> => {
  state.value.isGenerating = true;
  state.value.error = '';
  
  try {
    const response = await fetch('/ai/get_recommand', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: keyword
      })
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const data = await response.json();
    console.log('API返回的原始数据:', data);
    
    // 处理API返回的数据
    if (data && typeof data === 'object') {
      // 检查数据中是否包含tables字段
      if ('tables' in data && Array.isArray(data.tables)) {
        // 将API返回的数据转换为RecommendedReport格式
        const reports = data.tables.map((table: string, index: number) => ({
          id: (index + 1).toString(),
          name: table,
          description: `基于"${keyword}"的推荐报表`,
          type: 'custom'
        }));
        
        state.value.reports = reports;
        return reports;
      } 
      // 如果数据本身就是数组
      else if (Array.isArray(data)) {
        const reports = data.map((table: string, index: number) => ({
          id: (index + 1).toString(),
          name: table,
          description: `基于"${keyword}"的推荐报表`,
          type: 'custom'
        }));
        
        state.value.reports = reports;
        return reports;
      }
      else {
        console.error('API返回的数据结构:', data);
        throw new Error('API返回数据格式异常：未找到有效的推荐报表列表');
      }
    } else {
      console.error('API返回的数据类型:', typeof data);
      throw new Error('API返回数据格式异常：数据不是对象或数组');
    }
  } catch (error) {
    state.value.error = error instanceof Error ? error.message : '获取推荐报表失败';
    throw error;
  } finally {
    state.value.isGenerating = false;
  }
};

// 导出状态和函数
export const useReportRecommendation = () => {
  return {
    state,
    getRecommendedReports
  };
}; 