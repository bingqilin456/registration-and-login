# CHANGELOG

## 2026-01-05
- Fix: 不再在用户“我的”页显示“返回后台”按钮（避免混淆与遮挡）。
- Fix: 将“返回后台”改为圆形小图标（bottom: 80px）以避免与页面底部元素重叠。
- Fix: 优先使用 `sessionStorage.lastAdminUrl` 回跳到管理员来源页面；若缺失则回退到管理员“我的”页。
- Fix: 修正 `exitWorkbench()` 的跳转目标为学生首页（`../用户/用户“首页”界面.html`），并在退出时把当前 admin 页面记录到 `sessionStorage.lastAdminUrl`。
- Fix: 修正用户侧回退目标到管理员首页（管理员“我的”页已被覆盖时使用 `../管理员/管理员首页.html` 回退）。
- Dev: 在 `navbar.js` 中添加本地开发便捷项：若未设置 `userRole`，默认设置为 `admin`（便于开发、可移除）。
- Fix: 管理员/用户登录页现在会写入 `localStorage.userRole` 并跳转到对应首页（管理员/用户）。

> 变更均为前端改动，无需后端修改。