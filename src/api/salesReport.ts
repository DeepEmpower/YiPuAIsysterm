import { ref } from 'vue';

// 定义状态接口
export interface SalesReportState {
  isGenerating: boolean;
  content: string;
  error: string | null;
}

// 定义配置接口
export interface SalesReportConfig {
  productName: string;
  productType: string;
  marketPosition: string;
  targetMarket: string;
  sections: string[];
  salesPeriod: string;
  salesTarget: number;
  additionalInfo: string;
}

// 创建状态
const state = ref<SalesReportState>({
  isGenerating: false,
  content: '',
  error: null
});

// 构建查询内容
const buildQuery = (config: SalesReportConfig): string => {
  return `请为${config.productName}（${config.productType}类型）编写一份销售报告。产品定位：${config.marketPosition}。目标市场：${config.targetMarket}。销售周期：${config.salesPeriod}。销售目标：${config.salesTarget}万元。`;
};

// 生成销售报告
export const generateSalesReport = async (config: SalesReportConfig) => {
  // 重置状态
  state.value = {
    isGenerating: true,
    content: '',
    error: null
  };

  try {
    // 构建查询
    const query = buildQuery(config);

    // 调用API
    const response = await fetch('http://115.190.30.196:2001/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-X7YkTKQgqHD0KcZmIVFCRDeK',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: 'streaming',
        conversation_id: '',
        user: 'abc-123'
      })
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 将响应数据转换为文本
      const text = new TextDecoder().decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.answer) {
              state.value.content += data.answer;
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
          }
        }
      }
    }

  } catch (error) {
    console.error('生成销售报告失败:', error);
    state.value.error = error instanceof Error ? error.message : '生成销售报告失败';
  } finally {
    state.value.isGenerating = false;
  }
};

// 停止生成
export const stopGeneration = () => {
  state.value.isGenerating = false;
};

// 导出状态和方法
export const useSalesReport = () => {
  return {
    state,
    generateSalesReport,
    stopGeneration
  };
}; 