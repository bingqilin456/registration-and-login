// navbar.js - 设置导航激活项
(function(){
  function setActiveNav(pageName){
    const links = document.querySelectorAll('.admin-navbar .nav-link');
    links.forEach(l => l.classList.remove('active'));
    const target = Array.from(links).find(l => l.getAttribute('data-page') === pageName);
    if(target){
      target.classList.add('active');
      return true;
    }
    return false;
  }

  function autoDetect(){
    const links = document.querySelectorAll('.admin-navbar .nav-link');
    const currentFile = window.location.pathname.split('/').pop() || '管理员首页.html';
    let matched = false;
    links.forEach(l => {
      const href = l.getAttribute('href') || '';
      const hrefFile = href.split('/').pop();
      if(hrefFile && hrefFile === currentFile){
        l.classList.add('active');
        matched = true;
      }
    });
    // 如果没匹配到，尝试从 data-page 比较页面标题
    if(!matched){
      const title = document.title || '';
      links.forEach(l => {
        if(l.getAttribute('data-page') && title.indexOf(l.getAttribute('data-page')) !== -1){
          l.classList.add('active');
          matched = true;
        }
      });
    }
    return matched;
  }

  // 全局暴露函数，允许手动设置
  window.setActiveNav = setActiveNav;

  document.addEventListener('DOMContentLoaded', function(){
    // 开发便捷：若未明确设置身份，默认设为管理员（可按需移除）
    if (!localStorage.getItem('userRole')) {
      try{ localStorage.setItem('userRole','admin'); console.log('开发模式：默认 userRole=admin'); }catch(e){}
    }

    autoDetect();
    // 在主页面注入统一的“退出工作台”按钮（如页面未定义则自动插入）
    if (typeof ensureExitWorkbench === 'function') {
      ensureExitWorkbench();
    }
    // 注入管理员顶部控件（校区选择、登录、消息、退出）
    if (typeof ensureAdminTopControls === 'function') {
      ensureAdminTopControls();
    }
  });

  // 注入退出工作台的函数与样式（如果需要）
  function ensureExitWorkbench() {
    // 已存在则跳过
    if (document.querySelector('.exit-workbench')) return;

    // 查找主内容容器（优先 main.container）
    const main = document.querySelector('main.container') || document.querySelector('main') || document.body;

    // 插入 HTML
    const html = `\n        <!-- 退出工作台按钮（自动注入） -->\n        <div class="exit-workbench">\n            <button class="exit-workbench-btn" onclick="exitWorkbench()">\n                <i class="fas fa-sign-out-alt"></i> 退出工作台，进入学生界面\n            </button>\n        </div>\n\n        <div class="mode-switch-tip">\n            点击上方按钮可切换到学生界面，以学生身份使用平台\n        </div>\n`;
    try {
      main.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.warn('自动注入退出工作台按钮失败', e);
    }

    // 插入 CSS（避免重复）
    if (!document.getElementById('exit-workbench-style')) {
      const style = document.createElement('style');
      style.id = 'exit-workbench-style';
      style.textContent = `/* 注入：退出工作台按钮样式 */\n.exit-workbench { display: flex; justify-content: center; margin-top: 40px; padding-top: var(--spacing-medium); }\n.exit-workbench-btn { background-color: white; border: 1px solid var(--border-color); border-radius: 3px; padding: 12px 24px; font-size: 15px; color: var(--text-dark); cursor: pointer; display: flex; align-items: center; transition: all 0.3s; font-weight: 500; box-shadow: var(--shadow-card); }\n.exit-workbench-btn:hover { border-color: var(--primary-color); color: var(--primary-color); transform: translateY(-2px); box-shadow: var(--shadow-hover); }\n.exit-workbench-btn i { margin-right: 8px; color: var(--primary-color); }\n.mode-switch-tip { text-align: center; margin-top: 12px; color: var(--text-light); font-size: 13px; }`;
      document.head.appendChild(style);
    }

    // 暴露全局函数（如果页面未定义）
    if (!window.exitWorkbench) {
      window.exitWorkbench = function() {
        if (confirm('确定要退出工作台，进入学生界面吗？')) {          // 在 session 中记录当前 admin 页面，以便用户页面可返回到来源页面
          try { sessionStorage.setItem('lastAdminUrl', window.location.href); } catch(e) {}
          // 保留管理员标识，以便在普通用户界面中显示"进入工作台"按钮
          try { localStorage.setItem('userRole', 'admin'); } catch(e) {}
          // 跳转到学生首页（相对路径）
          window.location.href = '../用户/用户“首页”界面.html';
        }
      };
    }
  }

  // 注入管理员顶部控件（校区选择、登录、消息、退出）
  function ensureAdminTopControls() {
    // 防止重复注入
    if (document.querySelector('.admin-top-controls')) return;

    const navRight = document.querySelector('.nav-right');
    if (!navRight) return; // 仅在管理员页面存在时注入

    // 创建容器
    const container = document.createElement('div');
    container.className = 'admin-top-controls';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '12px';

    // 校区选择器
    const schoolWrapper = document.createElement('div');
    schoolWrapper.className = 'school-selector';
    const select = document.createElement('select');
    select.innerHTML = `
      <option value="main">东莞理工学院</option>
      <option value="south">南校区</option>
      <option value="east">东校区</option>
    `;
    select.style.padding = '6px 8px';
    select.style.borderRadius = '4px';
    select.style.border = '1px solid var(--border-color)';
    select.style.background = 'white';
    select.addEventListener('change', function() { switchSchool(this.value); });
    schoolWrapper.appendChild(select);

    // 登录按钮（会调用用户页面的 ensureLoginModal/openLoginModal，如果不可用，跳转到管理员登录页）
    const loginBtn = document.createElement('div');
    loginBtn.className = 'nav-item';
    loginBtn.style.cursor = 'pointer';
    loginBtn.textContent = '登录';
    loginBtn.addEventListener('click', function() { ensureLoginForAdmin(); });

    // 消息
    const msgBtn = document.createElement('div');
    msgBtn.className = 'nav-item';
    msgBtn.style.cursor = 'pointer';
    msgBtn.textContent = '消息';
    msgBtn.addEventListener('click', function() { showMessages(); });

    // 退出（登出）
    const logoutBtn = document.createElement('div');
    logoutBtn.className = 'nav-item';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.textContent = '退出';
    logoutBtn.addEventListener('click', function() { logoutUser(); });

    // 插入：校区 + 登录 + 消息 + 退出 前置于 nav-right 左侧
    container.appendChild(schoolWrapper);
    container.appendChild(loginBtn);
    container.appendChild(msgBtn);
    container.appendChild(logoutBtn);

    // 插入到 navRight（放在开头以靠近 logo）
    navRight.insertBefore(container, navRight.firstChild);

    // 插入样式（一次性）
    if (!document.getElementById('admin-top-controls-style')) {
      const style = document.createElement('style');
      style.id = 'admin-top-controls-style';
      style.textContent = `
.admin-top-controls { display:flex; align-items:center; gap:12px; }
.admin-top-controls .school-selector select { padding:6px 8px; border-radius:4px; border:1px solid var(--border-color); background:white; }
.admin-top-controls .nav-item { margin-left: 8px; }
`;
      document.head.appendChild(style);
    }

    // 恢复上次选择的校区
    const current = localStorage.getItem('currentSchool') || 'main';
    try { select.value = current; } catch(e) {}
    updateBrandSchool(current);

    // 暴露函数
    window.switchSchool = switchSchool;
    window.ensureLoginForAdmin = ensureLoginForAdmin;
    window.showMessages = showMessages;
    window.logoutUser = logoutUser;
  }

  function updateBrandSchool(school) {
    const names = { main: '东莞理工学院', south: '南校区', east: '东校区' };
    const brand = document.querySelector('.logo') || document.querySelector('.navbar-brand');
    if (brand) {
      // 如果有 icon 保留
      const icon = brand.querySelector('i');
      const text = `${names[school] || school}`;
      brand.innerHTML = `${icon ? icon.outerHTML + ' ' : ''}校园食光 - 后台管理 (${text})`;
    }
  }

  function switchSchool(school) {
    const names = { main: '东莞理工学院', south: '南校区', east: '东校区' };
    localStorage.setItem('currentSchool', school);
    updateBrandSchool(school);
    // 这里通常会调用后端接口以切换上下文；当前为示例提示
    alert('已切换校区：' + (names[school] || school));
  }

  function ensureLoginForAdmin() {
    // 如果全局存在用户端的 ensureLoginModal 和 openLoginModal，优先调用
    if (window.ensureLoginModal && window.openLoginModal) {
      ensureLoginModal(openLoginModal);
      return;
    }
    // 否则跳转到管理员登录页面
    window.location.href = '../注册及登录/管理员登录界面.html';
  }

  function showMessages() {
    // 简单示例：弹窗或未来可替换为消息下拉
    alert('消息中心：暂无新消息（示例）');
  }

  function logoutUser() {
    if (confirm('确定要退出登录吗？')) {
      try { localStorage.removeItem('userRole'); localStorage.removeItem('token'); } catch(e) {}
      // 跳转到管理员登录页
      window.location.href = '../注册及登录/管理员登录界面.html';
    }
  }

  // DOMContentLoaded 后自动注入（提供二次保险）
  document.addEventListener('DOMContentLoaded', ensureExitWorkbench);
  document.addEventListener('DOMContentLoaded', ensureAdminTopControls);
})();