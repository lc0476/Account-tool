# 代购记账 App — 项目上下文

## 基本信息

- 项目名称：代购记账（Account Book）
- 当前版本：v2.0.0
- 仓库地址：https://github.com/lc0476/Account-tool.git
- 技术栈：纯前端 PWA，原生 JS，零依赖，无框架
- 存储：IndexedDB（7 个 Store）
- 离线：Service Worker cache-first
- 云备份：Cloudflare Workers KV
- 托管：GitHub Pages

## 核心业务流程

```
客户下单 → 创建预购订单 → 标记"买到"(库存+) → 收款发货 → 已付+已发 → 自动归档 → 统计报表
```

## 文件结构

- `index.html` — 页面结构，所有 dialog 弹窗
- `app.js` — 全部前端逻辑（渲染、事件绑定、交互）
- `db.js` — IndexedDB 数据层（IIFE，挂载到 window.DB）
- `styles.css` — 样式
- `sw.js` — Service Worker
- `manifest.json` — PWA manifest
- `cloud-backup/worker.js` — Cloudflare Workers 云备份脚本

## 数据模型（7 个 IndexedDB Store）

- categories — 商品分类
- customers — 客户
- products — 商品（含库存、进价、售价）
- preorders — 预购订单（关联分类、客户、商品，含定金）
- fulfillments — 履约记录（付款、发货状态）
- productBatches — 商品批次（按日期分批，独立库存和价格）
- purchaseHistory — 已完成交易的归档记录（支持独立编辑，不回写其他表）

## 主要模块

1. 预购清单 — 按分类/买家分组，支持连续添加模式
2. 收款发货 — 已付/已发独立切换，双完成自动归档
3. 记录统计 — 按日期/买家筛选，点击行可弹窗编辑全部字段
4. 商品库 — CRUD + 批次管理
5. 客户管理 — CRUD + 购买历史
6. 分类管理 — CRUD

## Obsidian 文档位置

- 主文档：`/Users/shenglu/Documents/Obsidian Vault/app develop/Account Book.md`
- 更新日志：`/Users/shenglu/Documents/Obsidian Vault/app develop/Changelog vX.X.X.md`

## 开发约定

- 所有 DB 方法通过 window.DB 暴露
- 代码风格：ES6+，但兼容旧写法（var/function 混用）
- 无构建工具，直接编辑源文件
- 发版流程：git add → commit → push origin main
