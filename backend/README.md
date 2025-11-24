# 医院信息管理系统(HIS) 后端服务

## 项目介绍

这是一个基于Node.js和MongoDB开发的医院信息管理系统后端API服务，提供用户认证、患者管理、挂号预约、病历管理、药品管理、处方管理等功能。

## 技术栈

- **Node.js**: 运行环境
- **Express.js**: Web框架
- **MongoDB**: 数据库
- **Mongoose**: ODM工具
- **JWT**: 身份认证
- **Swagger**: API文档
- **Winston**: 日志管理
- **Nodemailer**: 邮件服务

## 快速开始

### 1. 环境要求

- Node.js (v16+)
- MongoDB (v5.0+)
- Redis (可选，用于速率限制)

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制`.env.example`文件为`.env`，并根据实际情况修改配置：

```bash
cp .env.example .env
```

主要配置项说明：

- `PORT`: 服务器端口
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT签名密钥
- `JWT_EXPIRES_IN`: JWT过期时间
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: 邮件服务配置
- `REDIS_URL`: Redis连接字符串（可选）

### 4. 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

### 5. 访问API文档

服务启动后，可以通过以下地址访问API文档：
```
http://localhost:3000/api/docs
```

## 项目结构

```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── utils/          # 工具函数
│   ├── app.js          # Express应用配置
│   ├── server.js       # 服务器入口
│   └── index.js        # 应用入口
├── logs/               # 日志文件
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## API功能模块

- **认证模块**: 用户登录、注册、密码重置
- **用户管理**: 医生、护士、管理员等用户管理
- **患者管理**: 患者信息的增删改查
- **科室管理**: 医院科室信息管理
- **挂号管理**: 患者挂号预约
- **病历管理**: 电子病历的创建和查询
- **药品管理**: 药品信息和库存管理
- **处方管理**: 处方的开立和查询
- **检查项目**: 检查项目管理和查询

## 安全特性

- JWT认证保护
- 基于角色的访问控制
- 请求速率限制
- 密码加密存储
- 输入验证和消毒
- HTTPS支持（生产环境）

## 开发规范

### 代码规范

使用ESLint和Prettier保持代码风格一致：

```bash
# 检查代码
npm run lint

# 格式化代码
npm run format
```

### 日志规范

- 使用winston进行日志记录
- 日志级别：debug < info < warn < error
- 生产环境日志存储在logs目录

## 部署说明

### Docker部署（推荐）

（待实现）

### 传统部署

1. 安装Node.js和MongoDB
2. 克隆代码仓库
3. 安装依赖
4. 配置环境变量
5. 启动服务

## 故障排除

### 常见问题

1. **MongoDB连接失败**
   - 检查MONGODB_URI配置
   - 确保MongoDB服务已启动

2. **JWT认证失败**
   - 检查JWT_SECRET是否正确
   - 确认token是否过期

3. **邮件发送失败**
   - 检查邮件服务配置
   - 确认SMTP服务是否可访问

## 许可证

MIT License