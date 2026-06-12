from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", lambda msg: print(f"CONSOLE [{msg.type}] {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    # Login
    page.goto("http://localhost:3000/login", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.get_by_placeholder("用户名或邮箱").fill("SiOuTvT")
    page.get_by_placeholder("密码").fill("siyu5098582")
    page.click('button:has-text("登 录")')
    page.wait_for_timeout(5000)

    # User page
    page.goto("http://localhost:3000/user/1", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(5000)

    # Simulate real user click with dispatchEvent (mousedown+mouseup+click)
    page.evaluate("""
        (() => {
            const buttons = document.querySelectorAll('button');
            let btn = null;
            for (const b of buttons) {
                if (b.textContent.includes('生成名片')) {
                    btn = b;
                    break;
                }
            }
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
            btn.dispatchEvent(new MouseEvent('mousedown', opts));
            btn.dispatchEvent(new MouseEvent('mouseup', opts));
            btn.dispatchEvent(new MouseEvent('click', opts));
        })()
    """)

    page.wait_for_timeout(8000)

    print("\n=== Checking result ===")
    state = page.evaluate("""
        (() => {
            const buttons = document.querySelectorAll('button');
            for (const b of buttons) {
                const t = b.textContent || '';
                if (t.includes('生成名片') || t.includes('生成中')) {
                    return { text: t.trim(), disabled: b.disabled };
                }
            }
            return { text: 'not found' };
        })()
    """)
    print(f"Button state: {state}")

    page.wait_for_timeout(3000)
    browser.close()