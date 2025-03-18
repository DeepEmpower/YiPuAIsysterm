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
      const response = await fetch('/dify-api/v1/chat-messages', {
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
          user: "user-" + Date.now()  // 生成唯一用户ID
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
    // 分割成行并过滤空行
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        // 检查是否是以 "data: " 开头
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          
          // 跳过特殊的流结束标记
          if (jsonStr === '[DONE]') {
            console.log('流结束');
            continue;
          }
          
          // 安全解析JSON，处理可能的截断数据
          let data;
          try {
            // 解析JSON数据
            data = JSON.parse(jsonStr);
          } catch (jsonError) {
            console.warn('JSON解析失败，可能是不完整的数据块:', jsonError);
            continue; // 跳过这个不完整的数据块
          }
          
          // 处理消息事件
          if (data.event === 'message') {
            if (data.answer) {
              state.value.content += data.answer;
            }
          } 
          // 处理聊天消息事件
          else if (data.event === 'agent_message') {
            if (data.message && data.message.content) {
              state.value.content += data.message.content;
            }
          }
          // 处理文本事件 (用于兼容其他可能的响应格式)
          else if (data.event === 'text' && data.text) {
            state.value.content += data.text;
          }
          // 处理错误事件
          else if (data.event === 'error') {
            state.value.error = data.message || '生成过程中出现错误';
            console.error('API错误:', data);
          }
          // 处理完成事件
          else if (data.event === 'completed') {
            console.log('生成完成');
          }
          // 记录其他事件类型以便调试
          else {
            console.log('其他事件类型:', data.event);
            // 尝试从其他可能的字段中提取内容
            if (data.content) {
              state.value.content += data.content;
            } else if (data.text) {
              state.value.content += data.text;
            } else if (data.message && typeof data.message === 'string') {
              state.value.content += data.message;
            }
          }
        } else {
          console.log('非数据行:', line);
        }
      } catch (e) {
        console.error('解析数据块失败:', e, '行内容:', line);
      }
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
    
    return `项目名称：${config.projectName}
项目类型：${projectTypeMap[config.projectType] || config.projectType}
项目背景：${config.background}
报告深度：${depthMap[config.depth] || config.depth}
预算范围：${config.budget[0]}-${config.budget[1]}万元
需要包含的章节：${config.sections.map(section => translateSection(section)).join('、')}
${config.additionalInfo ? `补充信息：${config.additionalInfo}` : ''}`;
  };
  
  return {
    state,
    generateReport,
    stopGeneration
  };
} 