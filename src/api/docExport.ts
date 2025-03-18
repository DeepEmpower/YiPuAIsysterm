import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell } from 'docx';

// 把HTML或Markdown内容转换为docx格式并下载
export async function exportToWord(title: string, content: string, filename: string) {
  // 创建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: parseContentToDocElements(title, content)
      }
    ]
  });

  // 生成Word文档的二进制数据
  const buffer = await Packer.toBlob(doc);
  
  // 创建下载链接
  const url = URL.createObjectURL(buffer);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 将内容解析为docx元素
function parseContentToDocElements(title: string, content: string) {
  const elements = [];
  
  // 添加标题
  elements.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 200
      }
    })
  );
  
  // 添加日期
  elements.push(
    new Paragraph({
      text: `生成日期: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400
      }
    })
  );
  
  // 清理HTML标签
  const cleanContent = content
    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, '$1\n') // 处理标题标签
    .replace(/<p>(.*?)<\/p>/g, '$1\n') // 处理段落标签
    .replace(/<ul>(.*?)<\/ul>/g, '$1\n') // 处理无序列表标签
    .replace(/<ol>(.*?)<\/ol>/g, '$1\n') // 处理有序列表标签
    .replace(/<li>(.*?)<\/li>/g, '• $1\n') // 处理列表项标签
    .replace(/<br\s*\/?>/g, '\n') // 处理换行标签
    .replace(/<strong>(.*?)<\/strong>/g, '$1') // 处理加粗标签
    .replace(/<em>(.*?)<\/em>/g, '$1') // 处理斜体标签
    .replace(/<[^>]*>/g, '') // 移除其他所有HTML标签
    .replace(/\n\s*\n/g, '\n') // 合并多个空行
    .trim();
  
  // 分割内容为行进行处理
  const lines = cleanContent.split('\n');
  
  let inList = false;
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      if (inList) {
        // 结束当前列表
        elements.push(createList(listItems));
        listItems = [];
        inList = false;
      }
      continue;
    }
    
    // 处理标题（以数字开头的行）
    if (/^\d+\.\s/.test(line)) {
      if (inList) {
        elements.push(createList(listItems));
        listItems = [];
        inList = false;
      }
      
      const titleText = line.replace(/^\d+\.\s*/, '');
      elements.push(
        new Paragraph({
          text: titleText,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            before: 300,
            after: 120
          }
        })
      );
      continue;
    }
    
    // 处理列表项（以•开头的行）
    if (line.startsWith('• ')) {
      inList = true;
      listItems.push(line.substring(2));
      continue;
    }
    
    // 常规段落
    if (inList) {
      elements.push(createList(listItems));
      listItems = [];
      inList = false;
    }
    
    elements.push(
      new Paragraph({
        text: line,
        spacing: {
          before: 80,
          after: 80
        }
      })
    );
  }
  
  // 处理最后的列表项
  if (inList && listItems.length > 0) {
    elements.push(createList(listItems));
  }
  
  return elements;
}

// 创建列表格式的段落
function createList(items: string[]) {
  return new Paragraph({
    children: [
      new TextRun({
        text: items.map(item => `• ${item}`).join('\n'),
        size: 24
      })
    ],
    spacing: {
      before: 80,
      after: 80
    },
    indent: {
      left: 500
    }
  });
} 