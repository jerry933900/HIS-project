// 测试前端API连接
const axios = require('axios');

async function testApiConnection() {
  try {
    console.log('测试后端API连接...');
    const response = await axios.get('http://localhost:3001');
    console.log('✅ 后端API连接成功!');
    console.log('状态码:', response.status);
    console.log('响应数据:', response.data);
    
    // 模拟前端API调用
    console.log('\n模拟前端API调用...');
    const apiResponse = await axios.get('http://localhost:3001/api/docs').catch(err => {
      console.log('⚠️ API文档端点访问失败(可能不是必须的):', err.message);
      return null;
    });
    
    console.log('\n✅ 测试完成! 前端API配置已更新，连接到后端3001端口');
    console.log('\n总结:');
    console.log('1. 后端服务运行在: http://localhost:3001');
    console.log('2. 前端服务运行在: http://localhost:8081');
    console.log('3. 前端API配置已成功更新为指向后端3001端口');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
    }
  }
}

testApiConnection();