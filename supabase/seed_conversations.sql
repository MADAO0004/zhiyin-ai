-- 新增 25 条对话及消息（演示用）
-- 在 Supabase SQL Editor 中执行

DO $$
DECLARE
  cid UUID;
  titles TEXT[] := ARRAY[
    'React Hooks 与 useState 用法',
    'TypeScript 泛型进阶',
    'Next.js 服务端渲染',
    '闭包与内存泄漏',
    'Promise 和 async/await',
    'Tailwind CSS 响应式布局',
    'Vue3 Composition API',
    '算法：二分查找',
    'Redux 状态管理',
    '前端性能优化实践',
    'Node.js 事件循环',
    'CSS Flexbox 布局',
    'GraphQL 与 REST 对比',
    'Docker 容器化部署',
    'Git 分支管理策略',
    'Webpack 打包优化',
    'Python 装饰器',
    'LeetCode 动态规划',
    'Redis 缓存策略',
    'RESTful API 设计',
    '前端面试准备',
    'JavaScript 原型链',
    'Vite 构建原理',
    'PostgreSQL 索引优化',
    'React 性能优化 useMemo'
  ];
  questions TEXT[] := ARRAY[
    'React Hooks 中 useState 和 useEffect 的使用场景有什么区别？',
    'TypeScript 的泛型约束 extends 和 keyof 怎么用？',
    'Next.js 的 getServerSideProps 和 getStaticProps 有什么区别？',
    'JavaScript 闭包会不会导致内存泄漏？如何避免？',
    'Promise.all 和 Promise.allSettled 的区别是什么？',
    'Tailwind 的 sm: md: lg: 断点具体是多少 px？',
    'Vue3 的 setup 和 Options API 如何选？',
    '二分查找的时间复杂度为什么是 O(log n)？',
    'Redux 和 Zustand 各自的优缺点是什么？',
    '首屏加载慢有哪些常见的优化手段？',
    'Node.js 事件循环的六个阶段是什么？',
    'Flexbox 的 justify-content 和 align-items 分别控制什么？',
    'GraphQL 相比 REST 有哪些优势？',
    'Docker 的 Dockerfile 里 CMD 和 ENTRYPOINT 有什么区别？',
    'Git flow 和 GitHub flow 的主要区别？',
    'Webpack 的 tree-shaking 是怎么实现的？',
    'Python 装饰器 @wraps 的作用是什么？',
    '动态规划的状态转移方程怎么找？',
    'Redis 的 LRU 淘汰策略如何配置？',
    'RESTful 的 PUT 和 PATCH 区别？',
    '前端面试常见的手写题有哪些？',
    'JavaScript 原型链的终点是什么？',
    'Vite 为什么比 Webpack 快？',
    'PostgreSQL 的 B-tree 和 Hash 索引适用场景？',
    'useMemo 和 useCallback 什么时候用？'
  ];
  answers TEXT[] := ARRAY[
    'useState 用于状态，useEffect 用于副作用（如请求、订阅）。useEffect 的依赖数组决定何时重新执行。',
    'extends 约束泛型类型，keyof 取对象键的联合类型。例如 T extends keyof Obj 表示 T 必须是 Obj 的键之一。',
    'getServerSideProps 每次请求都执行，getStaticProps 在构建时执行。后者适合静态内容，前者适合个性化数据。',
    '闭包会持有引用，若不释放可能导致内存泄漏。注意及时解除事件监听、清空大对象引用。',
    'Promise.all 任一失败即失败；Promise.allSettled 等待全部完成，返回每项的状态（fulfilled/rejected）。',
    '默认 sm:640px, md:768px, lg:1024px, xl:1280px。可在 tailwind.config 中自定义。',
    '新项目建议 Composition API，逻辑复用更灵活。老项目可渐进迁移。',
    '每次比较淘汰一半，n 个元素最多 log₂n 次。满足单调性时可用二分。',
    'Redux 生态完善但样板多；Zustand 轻量、API 简单，中小项目更合适。',
    '代码分割、懒加载、CDN、图片压缩、服务端渲染、减少首屏请求数。',
    'timers、pending、idle、poll、check、close。process.nextTick 和 Promise 在每阶段间执行。',
    'justify-content 控制主轴（默认水平），align-items 控制交叉轴（默认垂直）。',
    '按需查询减少 over-fetching、强类型 schema、单端点、适合复杂关联数据。',
    'CMD 可被覆盖，ENTRYPOINT 不可。通常 ENTRYPOINT 写可执行文件，CMD 写默认参数。',
    'Git flow 有 develop、release 分支，流程重；GitHub flow 只有 main，PR 为主，更轻量。',
    'ES Module 静态分析，识别未引用 export，在打包时剔除。CommonJS 难以分析。',
    '@wraps 把原函数的元信息复制到装饰后的函数，避免 __name__、__doc__ 丢失。',
    '定义状态、找子问题、写转移式、确定初值和计算顺序。多刷题找感觉。',
    'maxmemory-policy 配置 noeviction/allkeys-lru/volatile-lru 等。',
    'PUT 全量更新，PATCH 部分更新。PATCH 更符合 REST 语义。',
    '防抖节流、深拷贝、手写 Promise、扁平化数组、发布订阅等。',
    'Object.prototype，其 __proto__ 为 null。',
    'ESM 原生支持、esbuild 预构建依赖、按需编译。开发时不用打包整应用。',
    'B-tree 支持范围查询和排序，最常用。Hash 只支持等值查询。',
    'useMemo 缓存计算结果，useCallback 缓存函数引用。子组件用 React.memo 时配合用。'
  ];
  reasonings TEXT[] := ARRAY[
    'Hooks 是 React 16.8 引入的，用于在函数组件中使用状态和生命周期。',
    '泛型约束让类型更安全，避免传入不符合预期的类型。',
    'SSR 和 SSG 是 Next.js 的核心能力，选型要根据数据更新频率。',
    '闭包是 JS 基础，理解它对排查内存问题很重要。',
    'Promise 组合 API 在处理并发时很常用。',
    '响应式设计是现代前端必备技能。',
    'Vue3 的 Composition API 受 React Hooks 启发。',
    '二分查找是基础算法，很多题会用到。',
    '状态管理选型要根据团队和项目规模。',
    '性能优化要结合实际 profiling 数据。',
    '事件循环是 Node.js 异步的基石。',
    'Flexbox 是日常布局首选。',
    'GraphQL 适合前后端分离的复杂应用。',
    'Docker 已成为部署标配。',
    '分支策略影响协作效率。',
    '构建工具原理有助于优化配置。',
    '装饰器是 Python 的语法糖。',
    'DP 需要大量练习形成直觉。',
    '缓存策略影响系统性能。',
    'API 设计影响前后端协作。',
    '面试要系统准备。',
    '原型链是 JS 继承的基础。',
    'Vite 代表前端工具链新方向。',
    '数据库索引是性能关键。',
    'React 优化要避免过度。'
  ];
  i INT;
  ts TIMESTAMPTZ;
BEGIN
  FOR i IN 1..25 LOOP
    ts := NOW() - (i::text || ' days')::INTERVAL;
    INSERT INTO conversations (title, created_at, updated_at)
    VALUES (titles[i], ts, ts)
    RETURNING id INTO cid;

    INSERT INTO messages (conversation_id, role, content, reasoning, created_at)
    VALUES
      (cid, 'user', questions[i], '', ts),
      (cid, 'assistant', answers[i], reasonings[i], ts + INTERVAL '5 seconds');
  END LOOP;
END $$;
