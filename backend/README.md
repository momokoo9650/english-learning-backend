# 英语学习平台后端

基于 Node.js + Express + MongoDB 的后端服务。

## 📋 功能特性

- ✅ 用户认证与授权（JWT）
- ✅ 三级权限管理（管理员/作者/观众）
- ✅ 视频管理（CRUD）
- ✅ 关键词管理（批量导入）
- ✅ RESTful API

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
nano .env
```

### 3. 启动 MongoDB

确保 MongoDB 已安装并运行：

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community
```

### 4. 运行服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3001` 启动。

## 📡 API 文档

### 认证相关

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 注册（仅管理员）
```
POST /api/auth/register
Authorization: Bearer <token>

{
  "username": "newuser",
  "password": "password123",
  "role": "author"
}
```

### 视频管理

#### 获取所有视频
```
GET /api/videos
Authorization: Bearer <token>
```

#### 创建视频
```
POST /api/videos
Authorization: Bearer <token>

{
  "title": "视频标题",
  "videoUrl": "https://example.com/video.mp4",
  "subtitleUrl": "https://example.com/subtitle.vtt",
  "author": "作者名称"
}
```

### 关键词管理

#### 获取视频关键词
```
GET /api/keywords/:videoId
Authorization: Bearer <token>
```

#### 批量创建关键词
```
POST /api/keywords/batch
Authorization: Bearer <token>

{
  "videoId": "视频ID",
  "keywords": [
    {
      "word": "understanding",
      "phonetic": "/ˌʌndərˈstændɪŋ/",
      "partOfSpeech": "noun",
      "chineseDefinition": "理解；领悟",
      "englishDefinition": "the ability to understand",
      "examples": [
        {
          "en": "Thank you for your understanding.",
          "zh": "感谢你的理解。"
        }
      ]
    }
  ]
}
```

## 🔒 权限说明

- **admin（管理员）**: 所有权限
- **author（作者）**: 可以创建、编辑视频和关键词
- **viewer（观众）**: 只能查看内容

## 🗄️ 数据模型

### User（用户）
```javascript
{
  username: String,      // 用户名
  password: String,      // 加密密码
  role: String,          // 角色：admin/author/viewer
  createdAt: Date        // 创建时间
}
```

### Video（视频）
```javascript
{
  title: String,         // 标题
  videoUrl: String,      // 视频 URL
  subtitleUrl: String,   // 字幕 URL
  author: String,        // 作者
  createdAt: Date,       // 创建时间
  createdBy: ObjectId    // 创建者 ID
}
```

### Keyword（关键词）
```javascript
{
  videoId: ObjectId,           // 关联视频
  word: String,                // 单词
  phonetic: String,            // 音标
  partOfSpeech: String,        // 词性
  chineseDefinition: String,   // 中文释义
  englishDefinition: String,   // 英文释义
  examples: [{                 // 例句
    en: String,
    zh: String
  }],
  synonyms: String,            // 同义词
  antonyms: String,            // 反义词
  usage: String,               // 用法说明
  memoryTip: String,           // 记忆技巧
  createdAt: Date              // 创建时间
}
```

## 🛠️ 部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name english-learning

# 设置开机自启
pm2 save
pm2 startup
```

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

## 📞 技术支持

如有问题，请查看完整部署文档或联系开发者。

## 📄 许可证

MIT License