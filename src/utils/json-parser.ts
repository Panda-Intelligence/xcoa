// 安全的JSON解析工具函数
// 用于处理数据库中可能损坏的JSON字段

export function safeJSONParse(jsonString: any, defaultValue: any = null) {
  if (!jsonString) return defaultValue;
  if (typeof jsonString === 'object') return jsonString;
  if (typeof jsonString !== 'string') return defaultValue;
  
  try {
    // 检查是否是无效的JSON字符串
    if (jsonString === '[object Object]' || jsonString.startsWith('[object')) {
      console.warn('Invalid JSON detected:', jsonString);
      return defaultValue;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return defaultValue;
  }
}

// 专门用于解析数组字段
export function safeJSONParseArray(jsonString: any): any[] {
  const result = safeJSONParse(jsonString, []);
  return Array.isArray(result) ? result : [];
}

// 专门用于解析对象字段
export function safeJSONParseObject(jsonString: any): Record<string, any> | null {
  const result = safeJSONParse(jsonString, null);
  return (result && typeof result === 'object' && !Array.isArray(result)) ? result : null;
}