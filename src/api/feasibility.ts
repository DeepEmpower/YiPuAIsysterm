import { ref } from 'vue';

// 报告生成状态与内容
export interface FeasibilityReportState {
  isGenerating: boolean;  // 是否正在生成
  content: string;        // 报告内容
  error: string | null;   // 错误信息
}

// 报告配置参数接口
export interface ReportConfig {
  projectName: string;
  projectType: string;
  background: string;
  sections: string[];
  depth: string;
  budget: number[];
  additionalInfo?: string;
}

export function useFeasibilityReport() {
  // 状态管理
  const state = ref<FeasibilityReportState>({
    isGenerating: false,
    content: '',
    error: null
  });
  
  // 请求控制器 - 用于中断请求
  let controller: AbortController | null = null;
  
  // 生成报告
  const generateReport = async (config: ReportConfig) => {
    // 重置状态
    state.value.error = null;
    state.value.content = '';
    state.value.isGenerating = true;
    
    // 创建AbortController以允许中断请求
    controller = new AbortController();
    
    try {
      // 构建用户查询内容
      const query = buildQuery(config);
      
      // 发送请求到Dify API
      const response = await fetch('http://115.190.30.196:2001/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer app-INFFV7bmzlWGFiQBq90ol4aF'
        },
        body: JSON.stringify({
          inputs: {},
          query: query,
          response_mode: "streaming",
          conversation_id: "",
          user: "abc-123"
        }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`API请求失败: ${errorData.message || response.statusText}`)
      }
      
      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // 处理数据块
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            
            // 跳过特殊的流结束标记
            if (jsonStr === '[DONE]') {
              console.log('流结束');
              continue;
            }
            
            try {
              const data = JSON.parse(jsonStr);
              console.log('Received SSE message:', data);
              
              if (data.event === 'error') {
                console.error('API错误:', data);
                throw new Error(data.message || 'API返回错误');
              }
              
              if (data.answer) {
                state.value.content += data.answer;
              }
            } catch (e) {
              console.error('解析数据块失败:', e);
              if (e instanceof Error) {
                throw e;
              }
            }
          }
        }
      }
      
      // 处理完成
      state.value.isGenerating = false;
    } catch (error: any) {
      // 判断是否是用户主动取消
      if (error.name === 'AbortError') {
        state.value.error = '报告生成已取消';
      } else {
        state.value.error = `报告生成失败: ${error.message}`;
        console.error('报告生成错误:', error);
      }
      
      state.value.isGenerating = false;
    } finally {
      controller = null;
    }
  };
  
  // 停止生成
  const stopGeneration = () => {
    if (controller) {
      controller.abort();
      state.value.isGenerating = false;
    }
  };
  
  // 构建查询内容
  const buildQuery = (config: ReportConfig): string => {
    // 翻译节段名称
    const translateSection = (section: string): string => {
      const translations: Record<string, string> = {
        'project_background': '项目背景',
        'market_analysis': '市场分析',
        'technical_solution': '技术方案',
        'financial_evaluation': '财务评估',
        'risk_analysis': '风险分析',
        'conclusion': '结论与建议',
      };
      
      return translations[section] || section;
    };
    
    // 翻译深度
    const depthMap: Record<string, string> = {
      'brief': '简要',
      'standard': '标准',
      'detailed': '详细'
    };
    
    // 翻译项目类型
    const projectTypeMap: Record<string, string> = {
      'product': '产品开发',
      'technology': '技术研发',
      'marketing': '市场营销',
      'infrastructure': '基础设施',
      'service': '企业服务',
      'other': '其他类型'
    };
    
    // 简化查询字符串格式
    return `请生成一个${depthMap[config.depth] || config.depth}的${projectTypeMap[config.projectType] || config.projectType}项目可行性研究报告。

项目名称：${config.projectName}
项目背景：${config.background}
预算范围：${config.budget[0]}-${config.budget[1]}万元

需要包含以下章节：
${config.sections.map(section => translateSection(section)).join('\n')}

${config.additionalInfo ? `补充信息：${config.additionalInfo}` : ''}`;
  };
  
  return {
    state,
    generateReport,
    stopGeneration
  };
} 