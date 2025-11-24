# 医院信息管理系统(HIS)MongoDB数据库设计文档

## 1. 数据库设计原则

### 1.1 设计理念
- **文档模型优先**：充分利用MongoDB的文档模型特性，将相关数据组织为文档
- **适度范式化**：关键引用数据采用引用模式，频繁访问的关联数据考虑内嵌
- **查询优化**：基于查询模式设计索引，避免全集合扫描
- **扩展性考虑**：设计支持未来业务增长的数据模型
- **数据安全**：敏感字段加密存储，实现字段级访问控制

### 1.2 命名规范
- 集合名称：使用小写字母，复数形式，如`patients`、`doctors`
- 字段名称：使用驼峰命名法，如`patientName`、`createTime`
- 索引名称：使用`idx_字段名`格式，如`idx_patientId`
- 常量值：使用大写字母加下划线，如`STATUS_ACTIVE`

## 2. 核心集合设计

### 2.1 用户集合 (users)

**描述**：存储系统用户信息，包括医生、护士、管理员等

**字段设计**：
```javascript
{
  _id: ObjectId,               // 用户ID
  username: String,            // 用户名（登录账号）
  passwordHash: String,        // 密码哈希值
  fullName: String,            // 全名
  gender: String,              // 性别
  age: Number,                 // 年龄
  phone: String,               // 手机号码
  email: String,               // 电子邮箱
  department: ObjectId,        // 所属科室ID
  position: String,            // 职位
  role: String,                // 角色（doctor/nurse/admin/pharmacist/finance）
  status: String,              // 状态（active/inactive/locked）
  avatar: String,              // 头像URL
  lastLoginTime: Date,         // 最后登录时间
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  permissions: [String],       // 权限列表
  settings: {                  // 用户个性化设置
    theme: String,
    language: String,
    // 其他设置项
  }
}
```

**索引设计**：
- `{ username: 1 }`：唯一索引，用于登录查询
- `{ department: 1 }`：用于按科室查询用户
- `{ phone: 1 }`：唯一索引，用于手机号查询
- `{ email: 1 }`：唯一索引，用于邮箱查询

### 2.2 患者集合 (patients)

**描述**：存储患者基本信息和就诊记录引用

**字段设计**：
```javascript
{
  _id: ObjectId,               // 患者ID
  patientId: String,           // 患者编号（唯一，如"PAT20240001"）
  fullName: String,            // 姓名
  gender: String,              // 性别
  birthDate: Date,             // 出生日期
  age: Number,                 // 年龄
  idCard: String,              // 身份证号（加密存储）
  phone: String,               // 手机号码
  address: String,             // 地址
  bloodType: String,           // 血型
  allergies: [String],         // 过敏史
  medicalHistory: String,      // 既往病史
  emergencyContact: {          // 紧急联系人
    name: String,
    relationship: String,
    phone: String
  },
  registrationDate: Date,      // 首次注册日期
  lastVisitDate: Date,         // 最后就诊日期
  status: String,              // 状态（active/inactive）
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  visits: [ObjectId]           // 就诊记录ID数组（可选，考虑内嵌或引用）
}
```

**索引设计**：
- `{ patientId: 1 }`：唯一索引，用于患者编号查询
- `{ fullName: 1 }`：用于姓名查询
- `{ phone: 1 }`：用于手机号查询
- `{ idCard: 1 }`：唯一索引，用于身份证查询

### 2.3 科室集合 (departments)

**描述**：存储医院科室信息

**字段设计**：
```javascript
{
  _id: ObjectId,               // 科室ID
  departmentCode: String,      // 科室编码
  departmentName: String,      // 科室名称
  description: String,         // 科室描述
  parentDepartment: ObjectId,  // 父科室ID（用于科室层级）
  status: String,              // 状态（active/inactive）
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  doctors: [ObjectId]          // 医生ID数组（可选）
}
```

**索引设计**：
- `{ departmentCode: 1 }`：唯一索引，用于科室编码查询
- `{ departmentName: 1 }`：用于科室名称查询
- `{ parentDepartment: 1 }`：用于查询子科室

### 2.4 挂号记录集合 (registrations)

**描述**：存储患者挂号信息

**字段设计**：
```javascript
{
  _id: ObjectId,               // 挂号ID
  registrationNo: String,      // 挂号单号
  patientId: ObjectId,         // 患者ID
  departmentId: ObjectId,      // 科室ID
  doctorId: ObjectId,          // 医生ID
  visitType: String,           // 就诊类型（普通/专家）
  registrationDate: Date,      // 挂号日期
  visitDate: Date,             // 就诊日期
  visitTimeSlot: String,       // 就诊时间段
  fee: Number,                 // 挂号费用
  paymentStatus: String,       // 支付状态（unpaid/paid/refunded）
  status: String,              // 挂号状态（pending/completed/cancelled/no-show）
  diagnosisStatus: String,     // 诊断状态（undiagnosed/diagnosed）
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  paymentInfo: {               // 支付信息
    paymentMethod: String,
    transactionId: String,
    paymentTime: Date
  }
}
```

**索引设计**：
- `{ registrationNo: 1 }`：唯一索引，用于挂号单查询
- `{ patientId: 1 }`：用于查询患者的挂号记录
- `{ doctorId: 1, visitDate: 1 }`：用于查询医生某日的挂号情况
- `{ visitDate: 1, departmentId: 1 }`：用于按日期和科室统计挂号量

### 2.5 病历记录集合 (medicalRecords)

**描述**：存储患者的电子病历信息

**字段设计**：
```javascript
{
  _id: ObjectId,               // 病历ID
  registrationId: ObjectId,    // 关联的挂号记录ID
  patientId: ObjectId,         // 患者ID
  doctorId: ObjectId,          // 医生ID
  chiefComplaint: String,      // 主诉
  presentIllness: String,      // 现病史
  pastHistory: String,         // 既往史
  physicalExam: String,        // 体格检查
  diagnosis: [String],         // 诊断结果
  treatmentPlan: String,       // 治疗计划
  medications: [{              // 处方药品
    medicineId: ObjectId,
    name: String,              // 冗余存储药品名称，提高查询效率
    dosage: String,
    frequency: String,
    duration: String,
    usage: String
  }],
  examinations: [{             // 检查检验项目
    examId: ObjectId,
    name: String,
    resultStatus: String,      // pending/completed
    result: String,
    resultDate: Date
  }],
  followUpAdvice: String,      // 随访建议
  recordDate: Date,            // 记录日期
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  status: String               // 状态（draft/submitted/revised）
}
```

**索引设计**：
- `{ patientId: 1, recordDate: -1 }`：用于查询患者的病历历史
- `{ registrationId: 1 }`：唯一索引，关联挂号记录
- `{ doctorId: 1, recordDate: -1 }`：用于查询医生的病历记录

### 2.6 药品集合 (medicines)

**描述**：存储药品信息和库存管理

**字段设计**：
```javascript
{
  _id: ObjectId,               // 药品ID
  medicineCode: String,        // 药品编码
  medicineName: String,        // 药品名称
  genericName: String,         // 通用名称
  specification: String,       // 规格
  unit: String,                // 单位
  manufacturer: String,        // 生产厂家
  batchNo: String,             // 批次号
  expiryDate: Date,            // 有效期
  category: String,            // 药品类别
  price: Number,               // 售价
  costPrice: Number,           // 成本价
  stockQuantity: Number,       // 库存数量
  minimumStock: Number,        // 最低库存
  storageLocation: String,     // 存储位置
  usageInstructions: String,   // 使用说明
  contraindications: String,   // 禁忌症
  status: String,              // 状态（active/inactive/outOfStock）
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  stockAlerts: [{              // 库存预警记录
    alertTime: Date,
    currentStock: Number,
    alertStatus: String
  }]
}
```

**索引设计**：
- `{ medicineCode: 1 }`：唯一索引，用于药品编码查询
- `{ medicineName: 1 }`：用于药品名称查询
- `{ stockQuantity: 1 }`：用于库存预警查询
- `{ expiryDate: 1 }`：用于近效期药品查询

### 2.7 处方集合 (prescriptions)

**描述**：存储处方信息，关联病历和药品

**字段设计**：
```javascript
{
  _id: ObjectId,               // 处方ID
  prescriptionNo: String,      // 处方编号
  registrationId: ObjectId,    // 关联挂号记录ID
  medicalRecordId: ObjectId,   // 关联病历ID
  patientId: ObjectId,         // 患者ID
  doctorId: ObjectId,          // 医生ID
  issueDate: Date,             // 开具日期
  status: String,              // 状态（pending/dispensed/cancelled）
  pharmacyRemark: String,      // 药房备注
  medicines: [{                // 处方药品明细
    medicineId: ObjectId,
    medicineName: String,      // 冗余存储
    specification: String,
    quantity: Number,
    dosage: String,
    frequency: String,
    usage: String,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,         // 总金额
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  dispenserId: ObjectId,       // 调剂人ID
  dispenseTime: Date           // 调剂时间
}
```

**索引设计**：
- `{ prescriptionNo: 1 }`：唯一索引，用于处方编号查询
- `{ patientId: 1, issueDate: -1 }`：用于查询患者处方历史
- `{ doctorId: 1, issueDate: -1 }`：用于查询医生开具的处方
- `{ status: 1 }`：用于查询待调配处方

### 2.8 收费记录集合 (charges)

**描述**：存储患者的收费和支付信息

**字段设计**：
```javascript
{
  _id: ObjectId,               // 收费ID
  chargeNo: String,            // 收费单号
  registrationId: ObjectId,    // 关联挂号记录ID
  patientId: ObjectId,         // 患者ID
  chargeDate: Date,            // 收费日期
  items: [{                    // 收费项目明细
    itemId: ObjectId,          // 项目ID（药品/检查/治疗等）
    itemType: String,          // 项目类型（medicine/exam/treatment/registration）
    itemName: String,          // 项目名称
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,         // 总金额
  paymentMethod: String,       // 支付方式（cash/creditCard/wechat/alipay）
  paymentStatus: String,       // 支付状态（unpaid/paid/partiallyPaid/refunded）
  transactionId: String,       // 交易流水号
  operatorId: ObjectId,        // 收费员ID
  createTime: Date,            // 创建时间
  updateTime: Date,            // 更新时间
  paymentDetails: [{           // 支付详情
    amount: Number,
    paymentTime: Date,
    paymentMethod: String,
    transactionId: String
  }]
}
```

**索引设计**：
- `{ chargeNo: 1 }`：唯一索引，用于收费单号查询
- `{ patientId: 1, chargeDate: -1 }`：用于查询患者收费历史
- `{ registrationId: 1 }`：用于查询挂号关联的收费
- `{ paymentStatus: 1 }`：用于查询未支付收费

## 3. 数据关系设计

### 3.1 主要引用关系

```
users ←─┐
        ├─ departments
patients ←─┐  ┌─ medicines
           │  │
registrations ┬─ prescriptions
           │  │
medicalRecords ┘
           │
charges ───┘
```

### 3.2 关系设计原则

1. **引用模式**：
   - 用户与科室：`users`引用`departments`
   - 挂号与患者/医生/科室：`registrations`引用`patients`、`users`、`departments`
   - 病历与挂号/患者/医生：`medicalRecords`引用`registrations`、`patients`、`users`
   - 处方与病历/药品：`prescriptions`引用`medicalRecords`、`medicines`

2. **内嵌模式**：
   - 药品明细：处方中内嵌常用药品信息，减少查询次数
   - 支付详情：收费记录中内嵌支付明细
   - 用户设置：用户集合中内嵌个性化设置

3. **反范式设计**：
   - 冗余关键信息：如处方中存储药品名称，避免每次查询都关联药品表
   - 聚合字段：在患者集合中存储最后就诊日期，便于快速查询

## 4. 索引优化策略

### 4.1 复合索引设计
- 针对常见查询场景设计复合索引，如`{ doctorId: 1, visitDate: 1 }`
- 考虑索引前缀匹配原则，优化查询性能
- 避免创建过多索引，平衡写入性能和查询性能

### 4.2 索引使用建议
- 对频繁排序的字段创建索引
- 对正则表达式查询的字段创建索引（前缀匹配）
- 对文本搜索字段使用全文索引
- 定期监控索引使用情况，移除未使用的索引

## 5. 数据安全与性能优化

### 5.1 数据安全
- 敏感字段加密存储，如患者身份证号、手机号
- 实现字段级访问控制，根据角色限制数据访问
- 定期数据备份，实现异地备份策略
- 配置适当的访问权限，限制数据库连接

### 5.2 性能优化
- 使用投影操作限制返回字段
- 利用聚合管道进行数据统计和分析
- 合理使用读写分离，减轻主库压力
- 实现数据分片策略，应对大数据量
- 使用TTL索引自动清理过期数据

### 5.3 查询优化
- 使用explain()分析查询执行计划
- 避免在大型集合上执行全表扫描
- 合理使用游标分页，避免一次性加载大量数据
- 利用MongoDB的内存排序，优化复杂查询

## 6. 数据库连接设计

### 6.1 连接池配置
- 根据服务器资源和并发需求设置合适的连接池大小
- 配置连接超时和重试策略
- 使用连接池监控工具，及时发现连接问题

### 6.2 连接字符串示例
```
mongodb+srv://username:password@cluster0.mongodb.net/his_system?retryWrites=true&w=majority&maxPoolSize=100
```

### 6.3 Node.js连接配置示例
```javascript
const mongoose = require('mongoose');

// 连接配置选项
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
};

// 建立数据库连接
mongoose.connect(process.env.MONGODB_URI, options)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose已连接到数据库');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose已断开连接');
});

// 进程结束时关闭连接
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose连接已关闭，进程退出');
    process.exit(0);
  });
});
```

## 7. 数据迁移与维护

### 7.1 数据迁移策略
- 制定详细的数据迁移计划，包括测试和回滚机制
- 使用MongoDB的导入导出工具进行数据迁移
- 实现增量数据同步，减少迁移风险

### 7.2 数据库维护计划
- 定期执行数据库检查，确保数据一致性
- 监控数据库性能指标，及时发现问题
- 制定索引维护计划，定期重建或优化索引
- 实施数据归档策略，将历史数据迁移到归档集合

### 7.3 监控与告警
- 使用MongoDB Atlas监控工具或自建监控系统
- 设置关键性能指标的告警阈值
- 监控慢查询日志，及时优化查询性能
- 跟踪数据库资源使用情况，预测扩容需求