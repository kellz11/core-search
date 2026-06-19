(() => {
  function installGraphTab() {
    const nav = document.querySelector('.nav-group');
    if (!nav || nav.querySelector('[data-graph-tab]')) return;
    const graphics = [...nav.querySelectorAll('[data-view]')].find((item) => item.dataset.view === 'graphics');
    if (!graphics) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.graphTab = 'true';
    button.className = `nav-subitem${new URL(location.href).searchParams.get('view') === 'graph' ? ' is-active' : ''}`;
    button.textContent = '↳ Core Graph';
    button.addEventListener('click', () => {
      const url = new URL(location.href);
      url.search = '';
      url.searchParams.set('view', 'graph');
      location.href = url.toString();
    });
    graphics.insertAdjacentElement('afterend', button);
  }

  new MutationObserver(installGraphTab).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', installGraphTab);
  installGraphTab();
})();
