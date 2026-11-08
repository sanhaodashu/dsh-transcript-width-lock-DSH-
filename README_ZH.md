# 正文宽度锁定 · Transcript width lock

一个 DeepSeek Harness **桌面端**插件。它针对主对话区里、**正文（消息区）左右两侧那两根几乎看不见的拖动条**——它们只调整正文的阅读宽度、不影响侧栏。

插件做两件事：

1. **让边界常显**：正文两侧常驻一条细边界线，一眼看得出手柄位置（原版只有鼠标悬停时才出现）。
2. **可锁定**：设置 ▸ 常规里新增 **「锁定正文宽度手柄」** 开关。开启后，正文两侧的宽度拖条**无法拖动**，于是你**拖蓝选字时再也不会误改正文宽度**。锁定态下手柄变暗、光标恢复正常。

> 开关**默认开启**。想手动调整阅读宽度时，到 设置 ▸ 常规 把开关关掉即可。

## 兼容性

- 面向 DeepSeek Harness 桌面端（Electron，Web 前端）。
- 依赖对话组件里 `WidthHandle` 的稳定属性 `data-width-handle`（`@deepseek-ai/dsh-client-ui-conversation`，当前版本 0.2.2-rc.1）。
- 若将来 DSH 大改导致该属性消失，插件会**安全地不生效**（不会报错、不影响其他功能）。

## 安装（接收方）

`<profile>` 一般填 `desktop`（桌面端默认 profile；也可用 `dsh` 里实际的 profile 名）。
安装后**完全退出并重新打开**桌面端即可生效。

### 方式 A：用本地文件夹 / 压缩包
把整个 `dsh-transcript-width-lock` 文件夹（或 `.tgz` 包）发给对方，然后在对方机器上执行：

```bash
# 目录形式
dsh plugin --profile desktop add "<文件夹绝对路径>/dsh-transcript-width-lock"

# tgz 形式
dsh plugin --profile desktop add "<tgz 绝对路径>/dsh-transcript-width-lock-1.0.0.tgz"
```

### 方式 B：GitHub 仓库
把这个包推到一个 GitHub 仓库，对方执行：

```bash
dsh plugin --profile desktop add "github:<用户名>/<仓库名>"
```

### 方式 C：npm 发布
先把 `package.json` 里的 `name` / `author` / `repository` 改成你自己的，然后：

```bash
npm publish            # 或 pnpm publish
# 对方：
dsh plugin --profile desktop add dsh-transcript-width-lock
```

> 安装命令走 pnpm：`dsh plugin ... add <npm名 | github:... | 本地目录 | 本地tgz>` 均可。

## 卸载

```bash
dsh plugin --profile desktop remove dsh-transcript-width-lock
```

然后重启桌面端。

## 分发清单（打包发给别人时，目录里要有这些文件）

```
dsh-transcript-width-lock/
├── package.json          # 包名/版本/dsh 元数据
├── cordis.patch.yml      # 把插件挂进 profile
├── index.js              # Host 半（空实现）
├── client.js             # 全部逻辑：常显边界 + 锁定开关
├── locale/{en,zh}.json   # 插件元标题/描述 + 设置文案
├── icon.svg              # 插件图标
├── LICENSE               # MIT
├── README.md             # 英文说明
└── README_ZH.md          # 本文件
```
