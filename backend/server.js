const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ============ 中间件配置 ============
app.use(cors());
app.use(express.json());

// ============ MongoDB 连接 ============
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning')
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

// ============ 数据模型 ============

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'author', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 视频模型
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  subtitleUrl: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Video = mongoose.model('Video', VideoSchema);

// 关键词模型
const KeywordSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  word: { type: String, required: true },
  phonetic: String,
  partOfSpeech: String,
  chineseDefinition: String,
  englishDefinition: String,
  examples: [{ en: String, zh: String }],
  synonyms: String,
  antonyms: String,
  usage: String,
  memoryTip: String,
  createdAt: { type: Date, default: Date.now }
});

const Keyword = mongoose.model('Keyword', KeywordSchema);

// ============ 认证中间件 ============
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};

// 权限检查中间件
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
};

// ============ 认证路由 ============

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 注册（仅管理员可用）
app.post('/api/auth/register', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'viewer'
    });

    await user.save();

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============ 用户管理路由（仅管理员） ============

// 获取所有用户
app.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户
app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 修改用户密码
app.put('/api/users/:id/password', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ message: '密码已更新' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============ 视频路由 ============

// 获取所有视频
app.get('/api/videos', authMiddleware, async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个视频
app.get('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: '视频不存在' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建视频（仅作者和管理员）
app.post('/api/videos', authMiddleware, requireRole('admin', 'author'), async (req, res) => {
  try {
    const video = new Video({
      ...req.body,
      createdBy: req.user.id
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新视频（仅作者和管理员）
app.put('/api/videos/:id', authMiddleware, requireRole('admin', 'author'), async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ message: '视频不存在' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除视频（仅管理员）
app.delete('/api/videos/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    await Keyword.deleteMany({ videoId: req.params.id });
    res.json({ message: '视频已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============ 关键词路由 ============

// 获取视频的关键词
app.get('/api/keywords/:videoId', authMiddleware, async (req, res) => {
  try {
    const keywords = await Keyword.find({ videoId: req.params.videoId });
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量创建关键词
app.post('/api/keywords/batch', authMiddleware, requireRole('admin', 'author'), async (req, res) => {
  try {
    const { videoId, keywords } = req.body;
    
    const keywordDocs = keywords.map(kw => ({
      videoId,
      ...kw
    }));
    
    const created = await Keyword.insertMany(keywordDocs);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除关键词
app.delete('/api/keywords/:id', authMiddleware, requireRole('admin', 'author'), async (req, res) => {
  try {
    await Keyword.findByIdAndDelete(req.params.id);
    res.json({ message: '关键词已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============ 初始化默认管理员 ============
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ 默认管理员账户已创建: admin/admin123');
    }
  } catch (error) {
    console.error('❌ 初始化管理员失败:', error);
  }
}

// ============ 启动服务器 ============
const PORT = process.env.PORT || 3001;

mongoose.connection.once('open', () => {
  initializeAdmin();
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
  });
});