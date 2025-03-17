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
      // 构建提示内容
      const prompt = buildPrompt(config);
      
      // 发送请求
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "你是一位专业的可行性研究报告撰写专家。请根据用户提供的信息，生成专业、详细的可行性研究报告。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          stream: true  // 启用流式响应
        }),
        signal: controller.signal  // 传递AbortSignal
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }
      
      const decoder = new TextDecoder();
      
      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理数据块
        processStreamChunk(chunk);
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
  
  // 处理流式数据块
  const processStreamChunk = (chunk: string) => {
    // 解析数据块，通常API会返回以data:开头的JSON行
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          
          // 处理流结束标记
          if (jsonStr === '[DONE]') continue;
          
          const data = JSON.parse(jsonStr);
          
          // 处理内容增量
          if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
            state.value.content += data.choices[0].delta.content;
          }
        }
      } catch (e) {
        console.error('解析数据块失败:', e, '行内容:', line);
      }
    }
  };
  
  // 构建提示内容
  const buildPrompt = (config: ReportConfig): string => {
    // 翻译节段名称
    const translateSection = (section: string): string => {
      const translations: Record<string, string> = {
        'executive_summary': '执行摘要',
        'market_analysis': '市场分析',
        'technical_analysis': '技术可行性分析',
        'financial_analysis': '财务分析',
        'risk_analysis': '风险分析',
        'implementation_plan': '实施计划',
        'conclusion': '结论与建议',
        'appendix': '附录'
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
    
    return `请帮我撰写一份项目可行性研究报告，具体信息如下：
    
项目名称：${config.projectName}
项目类型：${projectTypeMap[config.projectType] || config.projectType}
项目背景：${config.background}
报告深度：${depthMap[config.depth] || config.depth}
预算范围：${config.budget[0]}-${config.budget[1]}万元
需要包含的章节：${config.sections.map(section => translateSection(section)).join('、')}
${config.additionalInfo ? `补充信息：${config.additionalInfo}` : ''}

请按照标准可行性研究报告格式进行编写，使用Markdown格式，包含适当的标题和小标题。报告内容应专业、详实，符合项目特点。`;
  };
  
  return {
    state,
    generateReport,
    stopGeneration
  };
} 