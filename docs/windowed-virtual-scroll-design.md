# 窗口式虚拟滚动设计方案

## 一、核心问题分析

### 当前问题
- 传统虚拟滚动需要预先知道所有项的高度才能计算总高度和滚动位置
- JSON Tree 展开/折叠会改变项的高度，导致位置计算失效
- 重新计算所有位置会导致 scrollTop 跳跃，用户体验差

### 根本矛盾
虚拟滚动需要"总高度"来撑开滚动条，但我们无法提前知道所有 JSON 展开后的真实高度

---

## 二、新方案设计思路

### 核心理念：放弃计算总高度，改用动态窗口

不再试图模拟一个包含所有数据的虚拟容器，而是：
1. 只维护一个"滑动窗口"，窗口内的数据完全真实渲染
2. 随着用户滚动，窗口动态向前/后扩展
3. 浏览器自己管理滚动条，基于真实 DOM 高度

---

## 三、关键机制

### 1. 渲染窗口 (Sliding Window)

**状态维护：**
- `startIndex`: 当前渲染的第一项在数据源中的索引（例如：50）
- `endIndex`: 当前渲染的最后一项的索引（例如：100）
- 窗口大小: `endIndex - startIndex`（例如：50 项）

**初始状态：**
- 页面加载时，渲染前 N 项（如前 50 项）
- 不设置虚拟容器总高度
- 滚动条长度 = 这 50 项的真实 DOM 高度

### 2. 向下滚动 - 底部加载

**触发条件：**
```javascript
距离底部的距离 = scrollHeight - (scrollTop + clientHeight)
当 距离底部 < 阈值（如 500px） 时触发
```

**执行流程：**
1. 从数据源取出接下来的 M 项（如 20 项）
2. 追加渲染到 DOM 底部
3. 更新窗口：`endIndex += M`
4. **不需要调整 scrollTop**
5. 浏览器自动延长滚动条

**效果：**
- 用户看到的内容位置不变
- 滚动条自然延长
- 可以继续向下滚动

### 3. 向上滚动 - 顶部加载（关键难点）

**触发条件：**
```javascript
当 scrollTop < 阈值（如 500px） 时触发
```

**执行流程：**
1. **保存当前状态：** `oldScrollTop = container.scrollTop`
2. 从数据源取出前面的 M 项（如 20 项）
3. 插入到 DOM 顶部（在现有内容之前）
4. 更新窗口：`startIndex -= M`
5. **关键步骤 - 测量新增高度：**
   - 获取新插入的前 M 个 DOM 元素
   - 累加它们的 `offsetHeight` 得到 `addedHeight`
6. **调整滚动位置：** `container.scrollTop = oldScrollTop + addedHeight`

**为什么要调整 scrollTop？**

DOM 顶部插入内容后，原来的内容被"向下推"了。如果不调整，用户会看到内容突然向下跳。通过增加 scrollTop 相同的距离，抵消这个位移。结果：用户视觉上看到的内容位置保持不变。

**示意图：**
```
插入前：
scrollTop = 200px
[可视区域] ← 用户看到第51-60项
  项51
  项52
  ...

插入20项后（每项50px，共1000px）：
DOM结构：
  项31 ← 新插入
  项32
  ...
  项50
  [可视区域] ← 我们希望用户仍然看到第51-60项
  项51
  项52
  ...

调整：scrollTop = 200 + 1000 = 1200px
结果：用户仍然看到第51-60项
```

### 4. 窗口大小控制

**为什么需要控制？**
- 如果用户持续滚动，窗口会不断扩大
- DOM 节点过多会影响性能

**控制策略：**
- 设置最大窗口大小（如 200 项）
- 当窗口超过最大值时，从远端移除项

**向下滚动时窗口溢出：**
```
当前窗口：[50, 250]，大小 200 项
加载 20 项后：[50, 270]，大小 220 项 → 超出！
处理：移除顶部 20 项
结果：[70, 270]，大小 200 项
```

**向上滚动时窗口溢出：**
```
当前窗口：[50, 250]，大小 200 项
加载 20 项后：[30, 250]，大小 220 项 → 超出！
处理：移除底部 20 项
结果：[30, 230]，大小 200 项
```

### 5. 展开/折叠的自然适配

**当用户展开 JSON Tree：**
1. JsonTree 组件的 DOM 高度自然增加（如从 40px 变成 200px）
2. 浏览器重新计算 contentWrapper 的总高度
3. 滚动条自动调整长度
4. **关键：** scrollTop 不需要调整
   - 因为展开的项在当前视口内
   - 它下方的内容被自然向下推
   - 滚动条变长，但用户正在看的内容位置不变

**当用户折叠 JSON Tree：**
1. DOM 高度减小（如从 200px 变成 40px）
2. 浏览器重新计算总高度
3. 滚动条自动缩短
4. **关键：** scrollTop 不需要调整
   - 折叠的项在当前视口内
   - 它下方的内容被自然向上拉
   - 用户正在看的内容位置保持稳定

---

## 四、与传统虚拟滚动的对比

| 特性 | 传统虚拟滚动 | 窗口式虚拟滚动 |
|------|------------|--------------|
| 总高度计算 | 需要：总高度 = 项数 × 固定高度 | 不需要：由真实 DOM 决定 |
| 高度缓存 | 需要维护每项的高度 Map | 不需要：浏览器自己知道 |
| 位置计算 | 需要：累加前面所有项的高度 | 不需要：浏览器自己布局 |
| DOM 定位 | 使用 transform: translateY | 使用正常文档流 |
| 展开/折叠 | 需要重算位置，可能跳跃 | 自然处理，不会跳跃 |
| 滚动条 | 虚拟的，长度固定 | 真实的，动态变化 |
| 性能优化 | 只渲染可见区域 | 渲染当前窗口（可见 + 缓冲） |

---

## 五、优势与局限

### 优势
1. ✅ **零高度计算：** 完全不需要测量或缓存高度
2. ✅ **滚动稳定：** 展开/折叠不会导致位置跳跃
3. ✅ **实现简单：** 不需要复杂的位置索引和二分查找
4. ✅ **浏览器原生：** 滚动行为由浏览器原生控制，流畅自然
5. ✅ **性能良好：** 只有窗口内的项（如 50-200 项）在 DOM 中

### 局限性
1. ❌ **滚动条不精确：** 无法知道总高度，滚动条长度只反映当前窗口
2. ❌ **跳转受限：** 无法精确跳转到远处索引（如跳转到第 10000 项）
   - 解决方案重置窗口到目标位置附近
3. ⚠️ **滚动条会动态变化：** 用户滚动时滚动条长度会改变
   - 这在无限滚动场景下是正常的

### 对于 JSONL Viewer 的适用性
- ✅ 用户主要是顺序浏览，很少跳转到远处
- ✅ 展开/折叠是核心功能，必须保持稳定
- ✅ 数据量虽大，但用户一次只看一小部分
- ✅ 滚动条不精确是可接受的

---

## 六、实现要点

### 1. 防抖与节流
- 向上/向下加载都需要设置 `isLoading` 标志
- 防止短时间内重复触发加载

### 2. requestAnimationFrame 时机
- 向上加载后调整 scrollTop 必须在 DOM 更新后
- 使用 `requestAnimationFrame` 等待浏览器完成渲染

### 3. 高度测量方式
```javascript
// 测量新增项高度：
// 累加前 M 个子元素的 offsetHeight
// 这是最准确的方式，因为元素已经完全渲染
let totalHeight = 0
for (let i = 0; i < addedCount; i++) {
  totalHeight += children[i].offsetHeight
}
```

### 4. 边界处理
- 检查 `startIndex >= 0` 和 `endIndex <= totalCount`
- 到达数据边界时停止加载

### 5. 窗口重置策略
- 数据源变化时（如搜索过滤），重置窗口到起始位置
- 跳转到远处索引时，重置窗口到目标位置附近

---

## 七、实现流程总结

```
初始化：
1. 渲染 startIndex=0, endIndex=50
2. 监听滚动事件

滚动到底部附近（距离 < 500px）：
1. 检查是否已到数据末尾
2. 加载接下来 20 项
3. endIndex += 20
4. 浏览器��动延长滚动条

滚动到顶部附近（scrollTop < 500px）：
1. 检查是否已到数据开头
2. 保存 oldScrollTop
3. 加载前面 20 项，插入 DOM 顶部
4. startIndex -= 20
5. 测量新增高度 addedHeight
6. scrollTop = oldScrollTop + addedHeight
7. 浏览器重新计算滚动条

用户展开 JSON：
1. JsonTree 的 DOM 高度自动增加
2. 浏览器重新计算滚动条
3. 什么都不需要做 ✓

窗口超过最大值：
1. 向下滚动时，移除顶部多余项
2. 向上滚动时，移除底部多余项
```

---

## 八、核心原理总结

**这个方案的本质是：**

> 把复杂的高度计算问题交给浏览器，我们只负责在合适的时机加载/卸载数据，并保持视觉位置稳定。

**三个关键点：**

1. **不计算总高度** - 让真实 DOM 自己决定滚动条
2. **双向动态加载** - 接近边界时扩展窗口，保持视觉位置不变
3. **浏览器原生布局** - 展开/折叠自然处理，无需手动干预

**适用场景：**
- 列表项高度可变（如可展开的内容）
- 用户主要顺序浏览
- 滚动条精确度要求不高
- 追求实现简单和滚动稳定性

---

## 九、配置参数说明

```typescript
interface WindowedScrollConfig {
  // 初始窗口大小（项数）
  // 推荐值：50-100，太小频繁加载，太大初始渲染慢
  initialWindowSize: number

  // 触发加载的阈值（像素）
  // 推荐值：500-1000，距离边界多远时开始预加载
  loadThreshold: number

  // 每次加载的批次大小（项数）
  // 推荐值：20-50，太小频繁触发，太大卡顿明显
  batchSize: number

  // 最大窗口大小（项数）
  // 推荐值：150-300，防止 DOM 节点过多
  maxWindowSize: number
}
```

**默认配置：**
```typescript
{
  initialWindowSize: 50,    // 初始显示50项
  loadThreshold: 500,       // 距离边界500px时加载
  batchSize: 20,            // 每次加载20项
  maxWindowSize: 200        // 最大窗口200项
}
```

---

## 十、与之前动态高度方案的区别

### 之前的方案（失败）
- 尝试测量和缓存每项的实际高度
- 使用位置缓存和二分查找定位项
- 需要在展开/折叠时更新缓存和重建位置索引
- 问题：scrollTop 调整不准确，导致跳跃

### 新方案（成功）
- 完全不测量高度，不维护缓存
- 只维护渲染窗口的索引范围
- 展开/折叠由浏览器自然处理
- 优势：简单、稳定、无跳跃

**关键差异：**
```
旧方案：试图"欺骗"浏览器，模拟一个虚拟的大容器
新方案：顺应浏览器，只管理真实渲染的那部分内容
```

---

## 十一、实际问题与优化方案（2026-01-10）

### 11.1 遇到的实际问题

在实际使用中，窗口式虚拟滚动遇到了以下问题：

#### 问题1：连续自动滚动
**现象**：
- 用户滚动到顶部或底部边缘时，触发自动加载
- 加载完成后，滚动位置调整触发新的滚动事件
- 新的滚动事件再��触发自动加载
- 形成连续不断的自动滚动循环

**触发场景**：
1. 加载大文件后点击"到底部"按钮
2. 从底部向上滚动到顶部边缘
3. 从顶部向下滚动到底部边缘

#### 问题2：视觉位置跳动
**现象**：
- 向上滚动时在顶部插入新内容后，视觉位置发生跳动
- 原本看到的内容位置发生偏移

#### 问题3：底部内容不可见
**现象**：
- 点击"到底部"按钮后，最后几行内容看不见
- 滚动条位置超出可视范围

---

### 11.2 优化方案

#### 方案1：用户交互门控机制（解决连续滚动）

**核心思路**：
在自动加载一次后，要求必须有用户主动交互才能触发下一次自动加载。

**实现**：

```typescript
// 添加交互标志
private requireUserInteraction: boolean = false

// 在 loadPrevious() 和 loadNext() 完成后设置标志
this.isLoadingPrev = false
this.requireUserInteraction = true

// 检测用户主动滚动
private handleScroll = () => {
  if (!this.isLoadingPrev && !this.isLoadingNext && !this.isProgrammaticScroll) {
    if (this.requireUserInteraction) {
      this.requireUserInteraction = false  // 清除标志，允许下次加载
    }
  }
  this.checkAndLoadMore()
}

// 检查时跳过
private checkAndLoadMore() {
  if (this.requireUserInteraction) {
    return  // 需要用户交互，跳过
  }
  // ... 继续检查
}
```

**效果**：
- ✅ 自动加载一次后停止
- ✅ 手动滚动后才能再次触发
- ✅ 彻底解决连续滚动问题

---

#### 方案2：禁用滚动条方法（解决视觉跳动）

**核心思路**：
在插入新内容前禁用滚动条，渲染完成后调整位置并恢复滚动条。

**对比两种方法**：

| 特性 | 锚点法（旧） | 禁用滚动条法（新） |
|------|------------|------------------|
| 实现复杂度 | 需要查找锚点元素，复杂的位置计算 | 简单的高度差值计算 |
| 可靠性 | 可能找不到锚点，浏览器可能干扰 | 防止浏览器干扰，更可靠 |
| 准确性 | getBoundingClientRect 可能有误差 | scrollHeight 差值，准确 |
| 视觉效果 | 可能短暂闪烁 | 无闪烁 |

**实现**：

```typescript
private loadPrevious() {
  // 1. 保存状态
  const oldScrollTop = this.container.scrollTop
  const oldScrollHeight = this.container.scrollHeight
  
  // 2. 禁用滚动条
  const oldOverflow = this.container.style.overflow
  this.container.style.overflow = 'hidden'
  
  // 3. 插入新内容
  this.renderWindow.startIndex = newStartIndex
  this.onWindowChange()
  
  // 4. 等待渲染完成
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 5. 计算新增高度
      const newScrollHeight = this.container.scrollHeight
      const addedHeight = newScrollHeight - oldScrollHeight
      
      // 6. 调整位置
      this.container.scrollTop = oldScrollTop + addedHeight
      
      // 7. 恢复滚动条
      this.container.style.overflow = oldOverflow
      
      this.isLoadingPrev = false
      this.requireUserInteraction = true
    })
  })
}
```

**关键点**：
- 使用 `overflow: hidden` 禁用滚动条
- 使用双重 RAF 确保渲染完成
- 高度差值 = 新 scrollHeight - 旧 scrollHeight
- 调整 scrollTop = 旧 scrollTop + 高度差值

---

#### 方案3：正确的底部位置计算

**问题**：
使用 `scrollTop = Number.MAX_SAFE_INTEGER` 会超出可滚动范围。

**解决方案**：

```typescript
scrollToBottom() {
  // 等待渲染完成
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 计算正确的底部位置
      const maxScrollTop = this.container.scrollHeight - this.container.clientHeight
      this.container.scrollTop = maxScrollTop
    })
  })
}
```

**公式说明**：
- `scrollHeight`：整个内容高度（包括不可见部分）
- `clientHeight`：可见区域高度
- `maxScrollTop = scrollHeight - clientHeight`：最大可滚动距离

---

#### 方案4：其他辅助优化

**1. 防抖机制**（防止频繁触发）：
```typescript
private readonly DEBOUNCE_INTERVAL: number = 150
private lastLoadTime: number = 0

private checkAndLoadMore() {
  const now = Date.now()
  if (now - this.lastLoadTime < this.DEBOUNCE_INTERVAL) {
    return
  }
  this.lastLoadTime = now
  // ...
}
```

**2. 编程式滚动标志**（区分用户滚动和程序滚动）：
```typescript
private isProgrammaticScroll: boolean = false

private setProgrammaticScroll(delay: number = 500) {
  this.isProgrammaticScroll = true
  
  window.setTimeout(() => {
    this.isProgrammaticScroll = false
  }, delay)
}
```

**3. 底部 padding**（确保最后几行可见）：
```css
.content-wrapper {
  padding-bottom: 20px;
}
```

---

### 11.3 更新后的实现流程

```
滚动到顶部附近（scrollTop < 500px）：
1. 检查是否已到数据开头
2. 检查 requireUserInteraction 标志
3. 检查防抖（距离上次加载 > 150ms）
4. 保存 oldScrollTop 和 oldScrollHeight
5. 禁用滚动条（overflow: hidden）
6. 加载前面 20 项，插入 DOM 顶部
7. startIndex -= 20
8. 等待渲染完成（双重 RAF）
9. 计算新增高度：addedHeight = newScrollHeight - oldScrollHeight
10. 调整滚动位置：scrollTop = oldScrollTop + addedHeight
11. 恢复滚动条（overflow = oldOverflow）
12. 设置 requireUserInteraction = true

用户手动滚动：
1. 检测到非加载、非编程式滚动
2. 清除 requireUserInteraction 标志
3. 允许下次自动加载
```

---

### 11.4 状态标志说明

| 标志 | 类型 | 作用 |
|------|------|------|
| `isLoadingPrev` | boolean | 正在加载前面的数据 |
| `isLoadingNext` | boolean | 正在加载后面的数据 |
| `isProgrammaticScroll` | boolean | 正在执行编程式滚动（如点击"到底部"） |
| `requireUserInteraction` | boolean | 需要用户交互才能触发下一次加载 |
| `lastLoadTime` | number | 上次加载的时间戳（用于防抖） |
| `programmaticScrollTimer` | number \| null | 编程式滚动定时器 |

---

### 11.5 测试验证

#### 测试1：连续滚动
**步骤**：
1. 加载大文件（1000+ 行）
2. 点击"到底部"
3. 从底部向上滚动到顶部边缘

**预期**：
- ✅ 自动加载一次后停止
- ✅ 手动滚动后才能再次加载

#### 测试2：视觉位置
**步骤**：
1. 滚动到中间位置
2. 向上滚动触发加载

**预期**：
- ✅ 视觉位置不跳动
- ✅ 原内容仍在相同位置

#### 测试3：底部可见性
**步骤**：
1. 点击"到底部"
2. 检查最后几行

**预期**：
- ✅ 最后一行完全可见
- ✅ 滚动条位置正确

---

### 11.6 性能优化总结

1. **内存管理**：窗口化渲染，只保留可见区域 DOM
2. **渲染性能**：双重 RAF 确保渲染完成，最小化重排
3. **滚动性能**：防抖 + 用户交互门控 + 编程式滚动标志

---

### 11.7 未来优化方向

1. **键盘交互**：监听 Page Up/Down、Home/End、方向键
2. **触摸设备**：支持触摸滑动作为用户交互
3. **动态批次大小**：根据滚动速度调整加载量

---

**更新时间**：2026-01-10
