# @deepseek-ai/dsh-client-ui-taskboard

[English](README.md) | 中文

Web 任务面板插件：其浏览器半边在侧边栏的 `sidebar.footer.action` 列表插槽注册两个入口——议题看板（`taskboard`，order 0）与节点工作流（`taskboard-workflow`，order 1，通过 `?view=workflow` 深链直达）——各自打开一个占满除侧边栏外全部主区域的整版面板，通过 iframe 内嵌本地运行的 [Codex Taskboard](https://github.com/chuspeeism/dashi-taskboard) 服务（`http://127.0.0.1:47823`）。宿主半边刻意保持为空——任务面板服务仍然是独立进程，本插件只提供浏览器表面。

入口渲染方式与设置触发按钮一致：宽侧边栏中为紧凑行加清单图标，折叠为 36px 圆形轨道图标，轨道态由 Tooltip 提供无障碍名称。

面板打开期间会探测服务：打开时、点击刷新时以及每 5 秒一次，使用 `no-cors` fetch（任何 HTTP 响应都算在线，只有网络失败才算离线）。服务可达时挂载 iframe；不可达时退化为居中的离线状态，附带启动提示与重试按钮，而不是一个死掉的框架。Escape、遮罩点击与头部关闭按钮均可关闭面板；刷新会重新探测并重新挂载 iframe。

面板文案双语：插件在 `dsh-client-locale` 的 `taskboard` 命名空间注册中英文词典，并走标准 locale 席位。

## 模型体验

无直接模型面：本插件只是浏览器界面。任务面板自身的模型面是其 `taskctl` CLI / Codex Skill。

#### KV 缓存影响

无直接失效；本插件不读取任何会话状态。

## 已知限制与待办

- **内嵌服务必须正在运行**——插件不会启动它；请在任务面板检出目录运行 `npm start`（面板离线状态会提示）。
- **服务来源是常量**——`http://127.0.0.1:47823/`；任务面板绑定在其他地址（如局域网主机）时需要改代码。
