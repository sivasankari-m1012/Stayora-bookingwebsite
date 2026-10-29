import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus management for modal dialogs / overlays.
 *  - on open: remembers the trigger, moves focus into the dialog
 *  - while open: Tab / Shift+Tab are trapped inside the dialog
 *  - on close: focus returns to the element that opened it
 * The dialog root needs tabIndex={-1} so it can receive focus when it has no focusable child.
 */
export default function useDialog(ref, { initialFocus } = {}) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const trigger = document.activeElement;

    const target = (initialFocus && root.querySelector(initialFocus)) || root;
    target.focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const items = [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) { e.preventDefault(); root.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      else if (!root.contains(active)) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeEventListener("keydown", onKeyDown);
      if (trigger instanceof HTMLElement && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };
  }, [ref, initialFocus]);
}
