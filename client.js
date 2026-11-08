/* Client half of the conversation-width lock.
 *
 * Target (verified in @deepseek-ai/dsh-client-ui-conversation, WidthHandle):
 *   <div class="an3WzG_widthHandle" data-width-handle="left|right" data-side="left|right">
 *   — the two subtle drag strips that flank the conversation transcript and
 *     change only the transcript width (localStorage "dsh.conversation.contentWidth").
 *
 * The shipped handle is 10px wide, z-index:0, and draws its ::after edge line at
 * opacity:0 except on hover/drag — which is why it is nearly invisible and easy
 * to catch while dragging to select text.
 *
 * This patch:
 *  1. Draws that edge line permanently (a 2px token-colored rule) and lifts the
 *     handle above the content so the boundary is obvious and reliably hittable.
 *  2. Adds "Lock transcript width handles" to Settings ▸ General. While locked,
 *     a capture-phase pointerdown listener stops the handle's resize drag from
 *     starting, so drag-to-select across the gutter never changes the width.
 *     Text selection itself is not blocked.
 *  3. Persists the lock flag in localStorage (default ON).
 *
 * Side effects run directly in apply(); only their disposal goes through
 * ctx.effect, so a client-context effect quirk cannot leave styles uninstalled.
 */
window.__ModuleLoader__.load({
  id: 'dsh-transcript-width-lock',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STORAGE_KEY = 'dsh.conv-width-lock';
    const NS = 'layout-lock';
    const HTML_ATTR = 'data-conv-width-lock';
    /* Stable hook: the shipped WidthHandle always carries data-width-handle. */
    const HANDLE_SEL = '[data-width-handle]';

    /* ---- persistent lock flag (module state + localStorage); default ON ---- */
    let __locked = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw === null ? true : raw === '1';
      } catch { return true; }
    })();
    const listeners = new Set();
    function readLocked() { return __locked; }
    function reflectAttr() {
      try { document.documentElement.setAttribute(HTML_ATTR, __locked ? 'on' : 'off'); } catch { /* ignore */ }
    }
    function writeLocked(v) {
      __locked = !!v;
      try { localStorage.setItem(STORAGE_KEY, __locked ? '1' : '0'); } catch { /* ignore */ }
      reflectAttr();
      for (const fn of listeners) fn(__locked);
    }
    function subscribeLock(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    function isWidthHandle(node) {
      return !!(node && node.nodeType === 1 && node.closest && node.closest(HANDLE_SEL));
    }

    /* ---- block the resize drag while locked (capture phase, before React) ----
     * stopPropagation keeps WidthHandle.onPointerDown from running, so no drag
     * starts. No preventDefault, so nothing else the user does is affected. */
    function installLockInterceptor() {
      const onPointerDown = (e) => {
        if (!readLocked() || !isWidthHandle(e.target)) return;
        e.stopPropagation();
      };
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }

    /* ---- always-visible transcript edge + settings row styling ---- */
    function installStyles() {
      if (document.getElementById('transcript-width-lock-styles')) return () => {};
      const css = [
        '[data-width-handle]{z-index:6!important;width:10px!important;min-width:10px!important;',
        '  cursor:col-resize!important}',
        /* Permanent edge line (shipped hides its line until hover). */
        '[data-width-handle]::after{content:""!important;position:absolute!important;top:0!important;bottom:0!important;',
        '  width:2px!important;border-radius:2px!important;background:var(--dsw-alias-border-l2)!important;',
        '  opacity:.8!important;pointer-events:none!important}',
        '[data-width-handle][data-side="left"]::after{right:5px!important;left:auto!important}',
        '[data-width-handle][data-side="right"]::after{left:5px!important;right:auto!important}',
        /* Highlight on hover / drag only while unlocking is allowed. */
        'html[data-conv-width-lock="off"] [data-width-handle]:hover::after,',
        'html[data-conv-width-lock="off"] [data-width-handle][data-dragging]::after{',
        '  background:var(--dsw-alias-brand-primary)!important;opacity:1!important;width:3px!important}',
        /* Locked: default cursor, dim line. */
        'html[data-conv-width-lock="on"] [data-width-handle]{cursor:default!important}',
        'html[data-conv-width-lock="on"] [data-width-handle]::after{opacity:.25!important}',
        /* Settings row. */
        '.ll-row{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l2);',
        '  padding:16px 0;gap:12px;align-items:flex-start;display:flex;justify-content:space-between}',
        '.ll-row-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
        '.ll-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}',
        '.ll-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
        '.ll-switch{all:unset;box-sizing:border-box;flex:38px 0 0;width:38px;height:22px;border-radius:11px;',
        '  position:relative;cursor:pointer;transition:background .15s ease;margin-top:2px}',
        '.ll-switch[data-on]{background:var(--dsw-alias-brand-primary)}',
        '.ll-switch[data-off]{background:var(--dsw-alias-border-l2)}',
        '.ll-switch:after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;',
        '  background:#fff;transition:transform .15s ease}',
        '.ll-switch[data-on]:after{transform:translateX(16px)}'
      ].join('');
      const tag = document.createElement('style');
      tag.id = 'transcript-width-lock-styles';
      tag.textContent = css;
      document.head.appendChild(tag);
      return () => tag.remove();
    }

    function LockRow({ t }) {
      const tr = (k, fallback) => {
        try { const v = t(k); return v && v !== k ? v : fallback; } catch { return fallback; }
      };
      const [locked, setLocked] = React.useState(readLocked());
      React.useEffect(() => subscribeLock(setLocked), []);
      const onToggle = React.useCallback(() => writeLocked(!readLocked()), []);
      return h('div', { className: 'll-row' },
        h('div', { className: 'll-row-text' },
          h('div', { className: 'll-title' }, tr('settings.lock.title', 'Lock transcript width handles')),
          h('div', { className: 'll-desc' }, tr('settings.lock.description',
            'While on, the two width handles beside the transcript cannot be dragged, so selecting text never changes the reading width.'))
        ),
        h('button', {
          type: 'button',
          role: 'switch',
          'aria-checked': locked,
          className: 'll-switch',
          'data-on': locked || undefined,
          'data-off': locked ? undefined : '',
          onClick: onToggle,
          'aria-label': tr(locked ? 'settings.lock.on' : 'settings.lock.off', locked ? 'On' : 'Off')
        })
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        /* Critical side effects first, each guarded so one failure cannot block
         * the others (or the Settings row registration below). */
        try { reflectAttr(); } catch { /* ignore */ }
        let offStyles = () => {};
        let offLock = () => {};
        try { offStyles = installStyles(); } catch { /* ignore */ }
        try { offLock = installLockInterceptor(); } catch { /* ignore */ }
        let offZh = () => {};
        let offEn = () => {};
        try {
          const a = ctx.locale.register(NS, 'zh', {
            'settings.lock.title': '锁定正文宽度手柄',
            'settings.lock.description': '开启后，对话区正文两侧的宽度拖条无法拖动，拖选文字不会误改正文宽度。',
            'settings.lock.on': '已开启',
            'settings.lock.off': '已关闭'
          });
          if (typeof a === 'function') offZh = a;
        } catch { /* locale is optional; English fallback renders */ }
        try {
          const b = ctx.locale.register(NS, 'en', {
            'settings.lock.title': 'Lock transcript width handles',
            'settings.lock.description': 'While on, the two width handles beside the transcript cannot be dragged, so selecting text never changes the reading width.',
            'settings.lock.on': 'On',
            'settings.lock.off': 'Off'
          });
          if (typeof b === 'function') offEn = b;
        } catch { /* ignore */ }
        try {
          ctx.effect(() => () => { offZh(); offEn(); offStyles(); offLock(); }, 'layout-lock: dispose');
        } catch { /* cleanup is best-effort */ }
        ctx.slots.inject('settings.general.item', () => ctx.slots.register({
          name: 'settings.general.item',
          id: 'transcript-width-lock',
          order: 18,
          locale: NS
        }, LockRow));
      }
    };
  }
});