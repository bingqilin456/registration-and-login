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
    autoDetect();
  });
})();