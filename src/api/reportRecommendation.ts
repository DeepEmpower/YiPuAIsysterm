import { ref } from 'vue';

// 推荐报表接口返回类型
export interface RecommendedReport {
  id: string;
  name: string;
  description?: string;
  type: string;
}

// 推荐报表状态接口
export interface RecommendationState {
  isGenerating: boolean;
  reports: RecommendedReport[];
  error: string | null;
}

// 创建状态
const state = ref<RecommendationState>({
  isGenerating: false,
  reports: [],
  error: null
});

// 获取推荐报表
export const getRecommendedReports = async (keyword: string): Promise<RecommendedReport[]> => {
  state.value.isGenerating = true;
  state.value.error = null;
  
  try {
    const response = await fetch('/api/get_recommand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: keyword })
    });
    
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    
    const data = await response.json();
    console.log('API完整返回数据:', JSON.stringify(data, null, 2));
    
    // 检查数据结构
    if (!data || typeof data !== 'object') {
      throw new Error('API返回数据格式异常：数据不是对象');
    }
    
    if (data.status !== 'success') {
      throw new Error('API返回状态异常');
    }
    
    // 直接使用tables数组
    const tables = data.tables;
    console.log('tables数组:', tables);
    
    if (!Array.isArray(tables) || tables.length === 0) {
      console.log('实际数据结构:', data);
      throw new Error('API返回数据格式异常：未找到有效的表单列表');
    }
    
    // 将数组内容转换为推荐报表对象
    const reports: RecommendedReport[] = tables.map((item: string, index: number) => ({
      id: (index + 1).toString(),
      name: item.trim(),
      type: 'recommended'
    }));
    
    state.value.reports = reports;
    return reports;
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