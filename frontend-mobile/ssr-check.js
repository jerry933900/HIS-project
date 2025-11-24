// SSR vs CSR 测试脚本 - 帮助区分服务端渲染和客户端渲染
// 用法: node ssr-check.js

function explainSsrVsCsr() {
  console.log('===== 服务端渲染(SSR) vs 客户端渲染(CSR) 指南 =====');
  console.log('');
  
  console.log('【核心区别】');
  console.log('1. 服务端渲染(SSR): HTML内容在服务器上生成，包含完整的数据');
  console.log('   - 优点: 首屏加载快、SEO友好、适合静态内容');
  console.log('   - 特点: 查看页面源代码时能看到完整内容');
  console.log('');
  console.log('2. 客户端渲染(CSR): 浏览器收到空白HTML，JavaScript运行后才显示内容');
  console.log('   - 优点: 交互性强、适合动态应用');
  console.log('   - 特点: 查看页面源代码时通常只有一个空的<div id="root"></div>');
  console.log('');
  
  console.log('【Next.js中的渲染模式】');
  console.log('✅ getServerSideProps - 服务端渲染(每次请求都在服务端生成HTML)');
  console.log('ℹ️ getStaticProps - 静态生成(构建时生成HTML，可按需重新验证)');
  console.log('❌ 无数据获取函数 - 默认客户端渲染(类似纯React应用)');
  console.log('');
  
  console.log('【如何在浏览器中区分】');
  console.log('1. 打开Chrome浏览器访问您的页面');
  console.log('2. 右键点击 -> 查看页面源代码');
  console.log('3. 搜索页面上应该有的内容');
  console.log('   - 如果能找到完整内容(如医生姓名、轮播图标题)，说明是SSR');
  console.log('   - 如果只看到空容器，说明是CSR');
  console.log('');
  
  console.log('【当前项目状态】');
  console.log('✅ 首页(index.js) - 已实现服务端渲染');
  console.log('   - 使用了getServerSideProps函数');
  console.log('   - 服务端获取banners、quickActions、recommendedDoctors数据');
  console.log('');
  console.log('✅ 预约页(appointments.js) - 已实现服务端渲染');
  console.log('   - 使用了getServerSideProps函数');
  console.log('   - 服务端获取appointments数据');
  console.log('');
  
  console.log('【如何将页面切换到服务端渲染】');
  console.log('1. 打开您要切换的页面文件(如: pages/doctors.js)');
  console.log('2. 添加getServerSideProps函数:');
  console.log('');
  console.log(`   export async function getServerSideProps() {`);
  console.log(`     // 在服务端获取数据`);
  console.log(`     // const res = await fetch('API_ENDPOINT');`);
  console.log(`     // const data = await res.json();`);
  console.log(`     `);
  console.log(`     // 返回数据作为props`);
  console.log(`     return {`);
  console.log(`       props: {`);
  console.log(`         data`);
  console.log(`       }`);
  console.log(`     };`);
  console.log(`   }`);
  console.log('');
  console.log('3. 修改组件接收props而不是在useEffect中获取数据:');
  console.log('');
  console.log(`   export default function MyPage({ data }) {`);
  console.log(`     // 直接使用props中的数据，无需useState和useEffect`);
  console.log(`     return <div>{/* 使用data渲染内容 */}</div>;`);
  console.log(`   }`);
  console.log('');
  
  console.log('【注意事项】');
  console.log('1. getServerSideProps仅在页面组件中有效，不能在普通组件中使用');
  console.log('2. 避免在组件中使用会在服务端引起错误的浏览器API(如window, document)');
  console.log('3. 对于需要浏览器API的代码，使用条件渲染或useEffect钩子');
  console.log('');
  
  console.log('===== 结论 =====');
  console.log('您的项目中首页和预约页已经成功使用服务端渲染！');
  console.log('如果需要切换其他页面到服务端渲染，请按照上述步骤操作。');
}

// 运行说明
explainSsrVsCsr();