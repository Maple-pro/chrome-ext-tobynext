# TobyNext 开发文档

本文说明如何启动、调试、测试和打包 TobyNext，并介绍维护交互与数据逻辑时需要遵守的约定。命令默认在项目根目录执行，Shell 示例适用于 Linux/macOS 的 Bash 或 Zsh。

## 1. 环境准备

| 工具        | 要求或用途                                              |
| ----------- | ------------------------------------------------------- |
| Node.js     | 22.12+                                                  |
| pnpm        | 建议使用 `packageManager` 指定的 10.6.4，保持锁文件一致 |
| Chrome      | 134+，用于加载扩展                                      |
| zip / unzip | 生成和检查应用商店上传包                                |

```bash
node --version
pnpm --version
pnpm install --frozen-lockfile
```

技术栈为 React 18、TypeScript、Vite 5、CRXJS 2 和 Tailwind CSS 4。精确依赖版本以 [package.json](../package.json) 和 [pnpm-lock.yaml](../pnpm-lock.yaml) 为准。

更新依赖时使用 `pnpm add`、`pnpm update` 等命令，并同时提交 `package.json` 和 `pnpm-lock.yaml`。安装现有依赖时使用 `--frozen-lockfile` 可以检查两者是否一致。

## 2. 启动开发模式

```bash
pnpm dev
```

保持终端运行，然后在 Chrome 中完成以下操作：

1. 打开 `chrome://extensions`。
2. 开启右上角的「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择项目的 `dist/` 目录。
4. 如果之前已经加载过这个目录，点击扩展卡片上的「重新加载」。
5. 新建标签页，或点击扩展图标，再点击 **Open tab manager**。

开发版名称带有 `Dev` 标记。CRXJS 在开发模式下生成加载所需的扩展文件，并连接 Vite 开发服务；加载目录和热更新机制见 [CRXJS 官方入门文档](https://crxjs.dev/guide/installation/from-scratch/)。

页面依赖 `chrome.bookmarks`、`chrome.tabs` 等扩展 API，应在加载后的扩展页面中验证。直接访问终端输出的 localhost 地址，或使用 `pnpm preview`，不能替代完整扩展验证。

开发服务和 HMR 共用 `5173` 端口，并设置 `strictPort: true`。如果端口已占用，先停止占用端口的开发服务；需要换端口时修改 `vite.config.ts` 中的 `devPort`，不要仅用 `--port` 改变 HTTP 端口。

### 修改代码后的刷新方式

| 修改内容                 | 操作                                                 |
| ------------------------ | ---------------------------------------------------- |
| React 组件               | 通常由热更新生效；未更新时刷新扩展页面               |
| 样式                     | 保存后查看效果；Shadow DOM 中的样式未更新时刷新页面  |
| manifest、权限、页面入口 | 等待文件生成，在扩展管理页重新加载，再打开新的标签页 |
| Vite 配置或依赖          | 重启 `pnpm dev`，重新加载扩展                        |

开发模式和生产构建共用 `dist/`。运行 `pnpm build` 前先停止 `pnpm dev`，避免两种模式同时写入产物。

### 调试入口

- **新标签页**：在页面按 `F12`，查看 Console、Sources 和 Network。
- **工具栏弹窗**：打开弹窗后右键选择「检查」。
- **扩展加载错误**：在 `chrome://extensions` 查看扩展卡片上的错误信息。
- **DOM 和样式**：页面渲染在开放的 Shadow Root 中，在 Elements 面板展开 `#shadow-root (open)` 后检查节点和样式。

手动操作使用当前 Chrome 配置的真实书签和标签页。需要隔离测试数据时，使用单独的 Chrome 配置；自动化浏览器测试会自行创建临时配置。

## 3. 项目结构

```text
src/
├── manifest.ts                  # 扩展声明，版本读取 package.json
├── types.ts                     # 显式共享 Chrome API 类型
├── newtab/
│   ├── index.html / index.tsx    # 新标签页入口
│   ├── NewTab.tsx               # 页面布局与 Provider
│   ├── components/              # 工作区、空间、集合、书签、窗口和标签页
│   ├── context/                 # 目录快照、当前选择与统一刷新
│   ├── hooks/                   # 存储、窗口事件和拖拽交互
│   ├── services/                # 目录初始化、拖拽协议与数据操作
│   ├── modals/                  # 通用模态层及各业务弹窗
│   └── utils/                   # 目录查询辅助函数
├── popup/                       # 工具栏弹窗入口
├── utils/createShadowRoot.tsx   # Shadow Root 和 React 根节点
└── assets/                      # 图标、字体和全局样式
public/                          # 扩展图标等静态资源
tests/                          # 单元测试与浏览器回归
docs/                           # 开发文档
dist/                           # 生成的扩展目录，不提交
release/                        # 发布包，不提交
```

仓库仍保留部分 `content/`、`options/` 和 `background/` 模板文件，当前 manifest 未启用这些入口。增加入口时需同步修改 [src/manifest.ts](../src/manifest.ts)，不能仅凭文件存在判断它会被加载。

## 4. 数据模型与架构

### 书签目录

业务数据保存在 Chrome 书签树中：

```text
书签栏（本地或账号）
└── TobyNext
    └── Workspace（默认：Toby）
        └── Space（默认：My Collection）
            └── Collection
                └── Bookmark（标题和 URL）
```

Workspace、Space、Collection 都是书签文件夹。右侧窗口和标签页来自 Chrome 的实时窗口数据；保存窗口时才把标签页写入集合。

`chrome.storage.local` 保存以下选择信息：

| 键                 | 内容                      |
| ------------------ | ------------------------- |
| `rootFolderId`     | 已选 TobyNext 根目录的 ID |
| `currentWorkspace` | 当前工作区 ID             |
| `currentSpace`     | 当前空间 ID               |

旧版本保存的完整 workspace/space 对象在读取时兼容，重新从 Chrome 获取节点后，后续写入只保存 ID。

Chrome 可能同时提供账号和本地书签栏，因此根目录查询使用 `folderType`，不固定书签栏 ID 为 `1`。已有 TobyNext 目录优先复用；新建时优先选择可用的账号书签栏。书签是否跨设备同步取决于所处目录和 Chrome 同步设置，`storage.local` 中的当前选择不会自动跨设备同步。相关 API 见 [Chrome 书签文档](https://developer.chrome.com/docs/extensions/reference/api/bookmarks)。

### 模块职责

| 模块                                                                 | 职责                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| [services/bookmarks.ts](../src/newtab/services/bookmarks.ts)         | 识别书签栏、恢复根目录、初始化默认层级、加载目录快照   |
| [context/NewTabContext.tsx](../src/newtab/context/NewTabContext.tsx) | 提供目录和选择状态，订阅书签事件并合并刷新             |
| [hooks/useStoredState.ts](../src/newtab/hooks/useStoredState.ts)     | 选择 ID 的读取、旧数据兼容与顺序写入                   |
| [hooks/useWindows.ts](../src/newtab/hooks/useWindows.ts)             | 一次获取带标签页的窗口快照，响应创建、关闭、移动和更新 |
| [services/drag.ts](../src/newtab/services/drag.ts)                   | 拖拽数据协议、数据校验和书签创建/移动                  |
| [hooks/useDrag.ts](../src/newtab/hooks/useDrag.ts)                   | 拖拽事件、放置提示、滚动与结束状态清理                 |
| [modals/Modal.tsx](../src/newtab/modals/Modal.tsx)                   | 顶层模态显示、焦点管理和事件隔离                       |

初始化使用 Web Locks，避免多个新标签页同时创建默认目录。目录和窗口异步读取使用取消标记或请求序号，避免旧结果覆盖较新的选择。窗口事件合并刷新，减少多次查询。

### 权限

当前使用 Manifest V3，声明的权限为：

| 权限        | 用途                                           |
| ----------- | ---------------------------------------------- |
| `bookmarks` | 查询、创建、编辑、移动和删除目录及书签         |
| `tabs`      | 获取标签页标题、URL 等信息，支持管理当前标签页 |
| `storage`   | 保存根目录和当前选择                           |
| `favicon`   | 通过 Chrome `_favicon` 接口显示书签图标        |

书签图标使用 [Chrome favicon 接口](https://developer.chrome.com/docs/extensions/how-to/ui/favicons)，不再向 Google favicon 服务发送书签域名。当前生产 manifest 没有后台 worker、内容脚本或 host permissions。

## 5. 交互维护约定

### 弹窗与点击隔离

所有业务弹窗复用 `Modal`。它通过 `dialog.showModal()` 进入浏览器顶层，背景不可交互，并提供焦点限制和关闭后的焦点恢复。

弹窗可能位于可点击的书签行组件内，因此还需要阻止 React 点击、指针、键盘和拖放事件冒泡。新增弹窗应复用这层隔离，避免只添加一个 `position: fixed` 遮罩。

编辑、删除等行内按钮需要阻止点击冒泡。列表渲染使用节点 ID 作为稳定的 React key，避免删除或排序后复用到错误的组件状态。

### 拖拽规则

| 拖动内容   | 放置位置                         | 结果                         |
| ---------- | -------------------------------- | ---------------------------- |
| 书签       | 另一书签的上半部/下半部          | 插入目标之前/之后，可跨集合  |
| 书签       | 集合空白处                       | 追加到集合末尾               |
| 标签页     | 书签行或集合                     | 创建书签，保留原标签页       |
| 空间       | 同工作区的另一空间               | 调整空间顺序                 |
| Collection | 当前 Space 中的另一个 Collection | 调整 Collection 顺序         |
| Collection | 左侧已存在的 Space               | 移入该 Space 并自动置顶，不会变成 Space |

Collection 标题栏的 Move 操作可以通过 Workspace/Space 选择器移动到其他 Space。

内部协议使用 `application/x-tobynext-item`，仅接受本页面发起、类型和 ID 匹配的拖拽。外部文本、网页拖拽或格式错误的数据会被忽略；文件导入弹窗使用独立的文件拖放处理。

维护排序时注意：Chrome 会自行调整同目录移动时源节点移除造成的下标变化，传入目标移动前的位置即可，不能重复减一。执行放置前重新查询目标和源节点，避免使用过期下标。

交互包含蓝色插入线、集合高亮、拖动透明度、滚动边缘自动滚动以及结束后的短暂点击抑制。新增动画应尊重 `prefers-reduced-motion`。

## 6. 验证与测试

### 命令

```bash
# 单元测试
pnpm test

# 开发模式 HMR 客户端回归
pnpm test:dev

# 类型检查
pnpm exec tsc -b

# 静态检查
pnpm lint

# 首次准备浏览器测试环境
pnpm exec playwright install chromium

# 浏览器测试使用生产产物，先停止开发服务再构建
pnpm build
pnpm test:e2e
```

浏览器测试在独立临时配置中加载 `dist/`，创建测试书签，并在结束时关闭浏览器、删除临时配置。也可指定兼容的 Chrome for Testing：

```bash
TEST_CHROME_EXECUTABLE=/absolute/path/to/chrome pnpm test:e2e
```

测试配置见 [playwright.config.ts](../playwright.config.ts)。失败时检查 `test-results/` 下的错误上下文和 trace；如有 trace 文件，可运行 `pnpm exec playwright show-trace <trace文件路径>`。

### 覆盖范围

- 单元测试：插入位置、非法拖拽数据、实时目标查询、标签页复制、空间移动限制、账号/本地书签栏、已有目录恢复。
- 浏览器测试：弹窗输入/确认/取消/Escape/背景点击隔离、双向书签排序、搜索关闭、目录复用、跨集合移动、标签页保存、空间排序。

本次改造已验证类型检查和生产构建，9 项单元测试及 Chrome for Testing 153.0.8010.12 下的 5 项浏览器回归通过。这是改造时的验证记录，后续源码变更需要重新执行相关检查。

全量 ESLint 尚未通过，仍有组件风格及可访问性等未清理问题。现有检查规则保留；不能把成功构建等同于 lint 通过。

### 手动回归

发布前在生产构建上检查：新建工作区/空间/集合、切换目录、书签重命名与删除、窗口保存与恢复、关闭标签页、搜索、Toby JSON 导入，以及长列表滚动拖拽。当前自动化测试不覆盖所有这些流程。

## 7. 生成可上传版本

### 更新版本

编辑 `package.json` 中的 `version`。`src/manifest.ts` 会读取该值，不需要手动修改生成的 `dist/manifest.json`。

每次上传更新的版本号必须高于商店已上传的版本，参见 [Chrome 应用商店打包准备文档](https://developer.chrome.com/docs/webstore/prepare)。

### 构建和打包

先停止 `pnpm dev`，在根目录执行以下命令。脚本会运行单元测试、生产构建，并生成带版本号的 ZIP；任一步失败都会停止打包。

```bash
pnpm install --frozen-lockfile
pnpm release
```

脚本使用 `zip -FS` 同步已有同名 ZIP 的文件集合，移除已不在构建目录中的旧文件，并检查 ZIP 完整性与根目录的 manifest。打包后执行 `pnpm test:e2e`，并在 `chrome://extensions` 重新加载生产版 `dist/` 做手动验证。

生成的上传包位于 `release/tobynext-<版本号>.zip`。它的根目录应直接包含 manifest：

```text
manifest.json
icon16.png
icon32.png
icon48.png
icon128.png
assets/...
src/newtab/index.html
src/popup/index.html
```

检查包结构：

```bash
release_version=$(node -p "require('./package.json').version")
unzip -l "release/tobynext-${release_version}.zip"
unzip -p "release/tobynext-${release_version}.zip" manifest.json
```

确认版本正确、名称没有 `Dev` 标记，且 manifest 位于 ZIP 根目录。上传的是生产 ZIP，不是整个源码目录，也不需要把 `.pem` 私钥放入 ZIP。商店要求见 [发布准备说明](https://developer.chrome.com/docs/webstore/prepare)。

### 上传商店

在 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole) 中，新发布创建条目，更新已有扩展则打开原条目上传新包。补全或核对商店资料、权限用途和隐私声明后，按控制台提示提交审核。生成 ZIP 不会自动上传或发布。具体步骤见 [官方发布流程](https://developer.chrome.com/docs/webstore/publish/)。

### 开发 WebSocket 端口错误

若出现 `ws://localhost:undefined/`，确认 `vite.config.ts` 中显式设置了同一个 `server.port` 和 `server.hmr.port`。停止旧的 `pnpm dev` 后重新启动，在 `chrome://extensions` 重新加载扩展，再打开新的标签页，让旧开发 worker 和客户端更新。相关上游问题见 [CRXJS issue #696](https://github.com/crxjs/chrome-extension-tools/issues/696)。

## 8. 常见问题

| 现象                                       | 排查方式                                                             |
| ------------------------------------------ | -------------------------------------------------------------------- |
| 提示缺少 manifest                          | 先启动 `pnpm dev` 或执行 `pnpm build`，选择 `dist/` 而不是源码根目录 |
| localhost 页面报 `chrome.bookmarks` 不存在 | 在 Chrome 加载扩展，通过新标签页或扩展弹窗打开管理器                 |
| 停止开发服务后页面打不开                   | 重启 `pnpm dev`；需要独立运行时改用生产构建并重新加载扩展            |
| 样式或组件没有更新                         | 刷新扩展页面；配置或权限变化时重启服务并重新加载扩展                 |
| 新标签页显示其他扩展页面                   | 检查其他新标签页扩展是否接管入口，或从本扩展弹窗打开管理器           |
| 书签变化未出现                             | 查看页面 Console 和错误提示，确认当前工作区/空间；必要时刷新页面     |
| `--frozen-lockfile` 安装失败               | 核对 pnpm 版本及 package/lock 是否一致；有意更新依赖时重新生成锁文件 |
| Playwright 找不到浏览器                    | 执行浏览器安装命令，或设置 `TEST_CHROME_EXECUTABLE`                  |
| 上传版本号重复                             | 增加 package 版本，重新构建并打包                                    |
| ZIP 带有 `dist/` 顶层目录                  | 进入 `dist/` 后打包其内容                                            |

## 9. Git 与产物管理

提交源码、文档、测试、配置和 pnpm 锁文件。`.gitignore` 忽略 `node_modules/`、缓存、`dist/`、`build/`、`release/`、测试输出、环境配置和签名私钥。

发布 ZIP 通过发布附件或商店上传分发。开发中生成的 `dist/manifest.json` 和打包产物不作为源码修改。已有 `release/` 安装包已取消 Git 跟踪，本地文件可以继续保留。
