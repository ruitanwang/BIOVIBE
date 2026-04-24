# BIOVIBE - 生物信息学分析平台

![BIOVIBE](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

BIOVIBE 是一个现代化的生物信息学分析平台，提供多种组学数据分析功能，包括Bulk转录组、单细胞转录组、空间转录组等分析流程。

## 功能特性

- **Bulk转录组分析** - 差异分析、富集分析、聚类分析、降维分析
- **单细胞转录组分析** - 数据质控、标准化、降维、细胞聚类、细胞类型注释、差异分析、轨迹分析
- **空间转录组分析** - 空间表达模式分析
- **蛋白质组学分析** - 蛋白质鉴定与定量
- **代谢组学分析** - 代谢物鉴定与通路分析
- **表观基因组分析** - 甲基化、染色质可及性分析
- **基因组变异检测** - SNP、InDel检测
- **微生物组分析** - 微生物群落分析
- **药物靶点预测** - 药物-靶点相互作用预测
- **生物网络构建** - 基因调控网络、蛋白质互作网络
- **通路富集分析** - KEGG、GO通路富集
- **疾病关联分析** - 基因-疾病关联分析

## 技术栈

### 前端
- **React 18** - 用户界面框架
- **React Router 7** - 路由管理
- **Vite 5** - 构建工具
- **Axios** - HTTP客户端
- **React Markdown** - Markdown渲染

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **CORS** - 跨域支持
- **dotenv** - 环境变量

## 项目结构

```
BIOVIBE/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   │   ├── HomePage.jsx
│   │   │   ├── FeaturesPage.jsx
│   │   │   ├── BulkTranscriptomePage.jsx
│   │   │   ├── SingleCellTranscriptomePage.jsx
│   │   │   └── sc-overview.md
│   │   ├── App.jsx          # 主应用组件
│   │   ├── main.jsx         # 入口文件
│   │   └── *.css            # 样式文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                  # 后端项目
│   ├── src/
│   │   └── routes/          # 路由
│   ├── server.js            # 服务器入口
│   ├── package.json
│   └── .env                 # 环境变量
└── .gitignore
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/ruitanwang/BIOVIBE.git
cd BIOVIBE

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 开发模式

```bash
# 启动前端开发服务器
cd frontend
npm run dev

# 启动后端服务器
cd backend
npm run dev
```

前端默认运行在 `http://localhost:5173`
后端默认运行在 `http://localhost:3000`

### 构建生产版本

```bash
cd frontend
npm run build
```

## 功能模块

### 单细胞转录组分析

单细胞分析模块包含完整的分析流程：

1. **数据质控** - 线粒体基因过滤、基因数过滤、双细胞检测
2. **数据标准化** - SCTransform、LogNormalize、CLR
3. **降维分析** - PCA、t-SNE、UMAP
4. **细胞聚类** - Louvain、Leiden、层次聚类
5. **细胞类型注释** - Marker基因、自动注释、手动注释
6. **差异分析** - FindMarkers、FindAllMarkers、GSEA
7. **轨迹分析** - Monocle、Slingshot、PAGA

### 界面特性

- 可动态拉伸的侧边栏导航
- 可折叠/展开的导航栏
- 方法说明与工作区切换
- 响应式设计

## 开发指南

### 添加新页面

1. 在 `frontend/src/pages/` 创建新的页面组件
2. 在 `App.jsx` 中添加路由
3. 在 `FeaturesPage.jsx` 中添加功能卡片链接

### 环境变量

在 `backend/.env` 中配置：

```env
PORT=3000
NODE_ENV=development
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- GitHub: [https://github.com/ruitanwang/BIOVIBE](https://github.com/ruitanwang/BIOVIBE)
