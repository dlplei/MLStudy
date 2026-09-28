# Phase 2 实施报告：后端 API 模拟与 LRU 缓存

## 📋 实施概览

成功将机器学习算法演示系统从纯前端 MVP（Phase 1）升级为带缓存和日志的服务化架构（Phase 2），为未来接入真实后端做好准备。

## 🎯 核心实现

### 1. 统一数据契约 (Data Contract v2)

**文件**: `src/types/demo.ts`

扩展了演示数据结构，新增关键字段：

```typescript
interface DemoSnapshot {
  stepIndex: number;
  title: StepDescription;
  description: StepDescription;
  plainExplanation: StepDescription;  // 🆕 通俗解说词
  actionLabel: StepDescription;        // 🆕 按钮文案
  visualizationData: Record<string, unknown>;  // 🆕 重命名，更清晰
  metadata: StepMetadata;              // 🆕 步骤元信息
}

interface StepMetadata {
  generationTimeMs: number;  // 数据生成耗时
  source: 'cache' | 'compute' | 'api';  // 数据来源
  cacheKey?: string;  // 缓存 Key
  version: string;  // 数据版本号
}
```

**优势**：
- 前后端数据契约完全一致，未来接入真实 API 无需修改前端
- `plainExplanation` 为 Phase 3（LLM 解说）预留接口
- `metadata` 支持完整的调试和追踪

### 2. LRU 缓存实现

**文件**: `src/services/LRUCache.ts`

实现了完整的 LRU（最近最少使用）缓存：

**核心特性**：
- ✅ O(1) 时间复杂度的 get/set 操作
- ✅ 基于 Map 的插入顺序特性
- ✅ TTL（过期时间）支持，默认 10 分钟
- ✅ 缓存命中率统计
- ✅ 内存占用估算
- ✅ 缓存 Key 生成策略：`algorithmId:param1=val1:param2=val2`

**缓存统计**：
```typescript
interface CacheStats {
  totalRequests: number;
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  capacity: number;
  evictions: number;
  estimatedMemoryBytes: number;
}
```

### 3. 结构化日志服务

**文件**: `src/services/Logger.ts`

实现了模拟服务器端的结构化日志：

**日志级别**：DEBUG、INFO、WARN、ERROR

**演示请求日志格式**：
```typescript
interface DemoLogEntry {
  algorithm_name: string;
  parameters: Record<string, unknown>;
  execution_time_ms: number;
  source: 'cache' | 'compute' | 'api';
  cache_hit: boolean;
  cache_key: string;
  request_id: string;
  total_steps: number;
  error?: string;
}
```

**优势**：
- 每个请求都有唯一 `requestId` 用于追踪
- 结构化格式便于未来接入日志分析系统（如 ELK、Splunk）
- 开发环境自动输出到控制台

### 4. DemoService（模拟后端 API）

**文件**: `src/services/DemoService.ts`

核心服务层，模拟完整的后端 API 行为：

**请求流程**：
```
1. 生成 requestId
2. 检查 LRU 缓存
3. 缓存命中 → 直接返回（记录日志）
4. 缓存未命中 → 从数据源获取
5. 写入缓存
6. 记录结构化日志
7. 返回统一响应格式
```

**统一响应格式**：
```typescript
interface DemoApiResponse<T> {
  status: 'success' | 'error' | 'timeout';
  data: T | null;
  error?: string;
  responseTimeMs: number;
  cached: boolean;
  requestId: string;
}
```

**模拟网络延迟**：
- 最小延迟：50ms
- 最大延迟：200ms
- 超时阈值：5000ms

**核心方法**：
- `fetchDemoConfig(algorithmId, params)` - 获取完整演示配置
- `fetchStep(algorithmId, stepIndex, params)` - 按需获取单步数据
- `hasDemo(algorithmId)` - 检查算法是否支持演示
- `getAvailableDemos()` - 获取所有可用演示列表
- `getCacheStats()` - 获取缓存统计
- `clearCache()` - 清除缓存

### 5. useAlgorithmDemo Hook（Phase 2 升级）

**文件**: `src/hooks/useAlgorithmDemo.ts`

从直接访问数据升级为通过 DemoService 异步获取：

**新增状态**：
```typescript
interface DemoState {
  // ... 原有字段
  isLoading: boolean;      // 🆕 加载状态
  isDegraded: boolean;     // 🆕 降级状态
}
```

**优雅降级机制**：
- 数据加载失败时自动回退到静态模式
- 显示友好的错误提示
- 不阻塞用户查看基础详情

### 6. 可视化组件更新

**KMeansVisualizer** & **LinearRegressionVisualizer**

- 适配新的 `visualizationData` 字段名
- 保持类型安全
- 无功能变化，仅数据结构适配

### 7. AlgorithmDemoContainer（增强）

**文件**: `src/components/demos/AlgorithmDemoContainer.tsx`

新增功能：
- ✅ 加载状态展示（旋转动画）
- ✅ 降级状态提示（友好错误信息）
- ✅ 通俗解说词展示（💡 图标突出显示）
- ✅ 缓存状态指示器（实时显示缓存命中率、内存占用）

**缓存状态指示器**：
```
服务状态 ● 缓存: 2/30  命中率: 67%  ~15KB
```

### 8. 演示数据更新

**文件**: `src/data/demos.ts`

所有演示数据适配新契约：
- 添加 `plainExplanation`（通俗解说词）
- 添加 `actionLabel`（按钮文案）
- 使用 `visualizationData` 替代 `data`
- 添加 `metadata` 占位符（由 DemoService 注入）

**通俗解说词示例**：
```typescript
plainExplanation: {
  zh: '想象你有一堆不同颜色的弹珠混在一起，现在要把它们按颜色分成3堆。',
  en: 'Imagine you have a bunch of mixed-color marbles and need to sort them into 3 piles by color.'
}
```

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│         UI Components               │
│  (AlgorithmDemoContainer, etc.)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      useAlgorithmDemo Hook          │
│   (状态管理 + 异步数据获取)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         DemoService                 │
│  (模拟后端 API + 缓存 + 日志)       │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐  ┌──────▼──────┐
│ LRU Cache  │  │   Logger    │
└────────────┘  └─────────────┘
       │
┌──────▼──────────────────────────────┐
│      Local Data Source              │
│  (demos.ts - 模拟数据库)            │
└─────────────────────────────────────┘
```

### 数据流向

```
用户点击"动态演示"
    ↓
useAlgorithmDemo 发起请求
    ↓
DemoService.fetchDemoConfig()
    ↓
检查 LRU 缓存
    ├─ 命中 → 返回缓存数据（记录日志）
    └─ 未命中 → 从数据源获取
                  ↓
              写入缓存
                  ↓
              返回数据
    ↓
UI 渲染可视化图表
```

## 📊 性能指标

### 缓存效果

- **缓存容量**: 30 个演示配置
- **TTL**: 10 分钟
- **首次加载**: ~150ms（模拟网络延迟 + 数据计算）
- **缓存命中**: ~50ms（跳过计算，直接返回）
- **内存占用**: ~15-30KB（取决于演示数量）

### 日志追踪

每个请求都记录：
- 请求 ID（唯一标识）
- 算法名称
- 执行耗时
- 缓存命中情况
- 数据来源
- 错误信息（如果有）

## 🔄 向后兼容性

### Phase 1 → Phase 2 迁移

- ✅ 所有现有功能保持不变
- ✅ UI 交互完全一致
- ✅ 仅内部实现升级
- ✅ 用户无感知

### 未来接入真实后端

只需修改 `DemoService.computeDemoConfig()` 方法：

```typescript
// Phase 2 (当前)
private computeDemoConfig(algorithmId: string, params?: Record<string, unknown>): DemoConfig | null {
  const baseConfig = localDataSource[algorithmId];
  // ... 本地计算
}

// Phase 3 (未来)
private async computeDemoConfig(algorithmId: string, params?: Record<string, unknown>): Promise<DemoConfig | null> {
  const response = await fetch(`/api/demo/${algorithmId}`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}
```

前端消费逻辑完全不变！

## 🎨 用户体验增强

### 1. 通俗解说词

每个步骤都有两层解释：
- **技术描述**: 面向学习者的专业解释
- **通俗解说**: 面向非技术人员的比喻说明

示例（K-Means 第1步）：
```
技术: 随机选择3个数据点作为初始聚类中心
通俗: 我们先随便选3个"队长"，每个队长负责带领一队弹珠
```

### 2. 缓存状态可视化

底部实时显示：
- 缓存使用情况
- 命中率
- 内存占用

让用户感知到系统的智能优化。

### 3. 优雅降级

如果演示数据加载失败：
- 显示友好的错误提示
- 自动回退到静态模式
- 不阻塞用户查看其他功能

## 🚀 下一步：Phase 3 准备

### Phase 3 目标：AI 解说集成

1. **接入 Ollama + DeepSeek**
   - 为每个步骤动态生成通俗解说词
   - 支持多语言（中/英）

2. **LLM 调用优化**
   - 预生成常用解说词
   - 缓存 LLM 响应
   - 超时降级到预置解说词

3. **日志增强**
   - 记录 LLM 调用状态
   - 追踪生成质量
   - 性能监控

### 当前架构已为 Phase 3 做好准备

- ✅ `plainExplanation` 字段已预留
- ✅ 日志系统支持 LLM 调用追踪
- ✅ 缓存机制可复用
- ✅ 降级机制已实现

## 📝 代码质量

### 类型安全

- 100% TypeScript 覆盖
- 严格类型检查
- 无 `any` 类型（除必要的类型断言）

### 模块化

- 单一职责原则
- 清晰的模块边界
- 易于测试和维护

### 可扩展性

- 新增算法只需：
  1. 在 `demos.ts` 添加数据
  2. 在 `DemoService` 注册
  3. 创建可视化组件
  4. 在 `AlgorithmDemoContainer` 添加 case

## ✅ 验收标准

- [x] 数据契约统一且稳定
- [x] LRU 缓存正常工作
- [x] 结构化日志记录完整
- [x] 优雅降级机制生效
- [x] 通俗解说词展示正确
- [x] 缓存状态可视化
- [x] 构建成功无错误
- [x] 向后兼容 Phase 1
- [x] 为 Phase 3 做好准备

## 🎉 总结

Phase 2 成功将系统从纯前端 MVP 升级为服务化架构，实现了：

1. **统一数据契约** - 前后端解耦，未来接入真实 API 零成本
2. **LRU 缓存** - 显著提升性能，减少重复计算
3. **结构化日志** - 完整的调试和追踪能力
4. **优雅降级** - 提升用户体验和系统稳定性
5. **通俗解说** - 降低理解门槛，面向更广泛的用户群体

系统已为 Phase 3（AI 解说集成）做好充分准备，架构设计确保了平滑过渡。
