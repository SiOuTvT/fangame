from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 667})
    page = context.new_page()

    # Login
    print("=== Login ===")
    page.goto('http://localhost:3000/login')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    # Find inputs
    all_inputs = page.query_selector_all('input')
    identifier_input = None
    password_input = None
    for inp in all_inputs:
        t = inp.get_attribute('type') or 'text'
        if t == 'password':
            password_input = inp
        elif t in ('text', 'email') and not identifier_input:
            identifier_input = inp

    if not identifier_input:
        # Fallback: get first text input
        all_inputs = page.query_selector_all('input')
        for inp in all_inputs:
            t = inp.get_attribute('type') or 'text'
            if t in ('text', 'email', 'tel'):
                identifier_input = inp
                break

    if identifier_input and password_input:
        identifier_input.fill('test_qa_user')
        password_input.fill('TestPass123!')

        submit = page.query_selector('button[type="submit"]')
        if submit:
            submit.click()
            page.wait_for_timeout(3000)
            try:
                page.wait_for_load_state('networkidle', timeout=5000)
            except:
                pass

            url = page.url
            print(f"After login: {url}")

            if '/login' not in url:
                print("[OK] Login successful!")
            else:
                # Check for error
                err = page.evaluate('() => document.querySelector("[class*=destructive], [class*=error], [role=alert]")?.textContent || "unknown"')
                print(f"[FAIL] Login failed: {err}")
                browser.close()
                exit(1)
        else:
            print("No submit button")
            browser.close()
            exit(1)
    else:
        print(f"Inputs not found: id={identifier_input}, pw={password_input}")
        browser.close()
        exit(1)

    # Navigate to forum post
    print("\n=== Forum Post ===")
    page.goto('http://localhost:3000/forum/cmr5h5h5d0001tlhcx8ayxc3i')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/forum-post-logged.png', full_page=True)

    # Find comment form
    contenteditable = page.query_selector('[contenteditable="true"]')
    form = page.query_selector('form')
    print(f"contenteditable: {contenteditable is not None}")
    print(f"form: {form is not None}")

    if not contenteditable:
        # Try to find reply/comment area
        reply_area = page.evaluate('''() => {
            const divs = document.querySelectorAll('div');
            const results = [];
            for (const d of divs) {
                const ce = d.getAttribute('contenteditable');
                const ph = d.getAttribute('data-placeholder');
                if (ce || ph) results.push({ ce, ph, text: d.textContent.slice(0, 50) });
            }
            return results;
        }''')
        print(f"contenteditable divs: {reply_area}")

        # Check page text for comment hints
        body = page.evaluate('() => document.body.innerText')
        if '登录' in body and '评论' in body:
            print("Still showing login prompt - auth may have failed")
            # Check cookies
            cookies = context.cookies()
            session_cookies = [c for c in cookies if 'session' in c['name'].lower() or 'next-auth' in c['name'].lower()]
            print(f"Session cookies: {[c['name'] for c in session_cookies]}")

    if contenteditable:
        print("\n=== Submit Comment ===")
        # Listen for network requests
        api_responses = []
        def on_response(response):
            if 'comment' in response.url or 'forum' in response.url:
                api_responses.append({
                    'url': response.url,
                    'status': response.status,
                    'status_text': response.status_text
                })
        page.on('response', on_response)

        contenteditable.click()
        page.wait_for_timeout(300)
        page.keyboard.type("这是 Playwright 自动化测试评论", delay=30)
        page.wait_for_timeout(500)

        # Screenshot after typing
        page.screenshot(path='/tmp/comment-typed.png')

        # Find and click submit
        submit_btn = page.query_selector('button[type="submit"]')
        if submit_btn:
            btn_text = submit_btn.text_content()
            btn_disabled = submit_btn.get_attribute('disabled')
            print(f"Submit button: '{btn_text}' disabled={btn_disabled}")

            submit_btn.click()
            print("Clicked submit, waiting...")
            page.wait_for_timeout(5000)

            # Report API responses
            print(f"\nAPI responses ({len(api_responses)}):")
            for r in api_responses:
                print(f"  [{r['status']}] {r['url'][:100]}")

            # Check result
            page.screenshot(path='/tmp/comment-result.png')

            # Check if comment appeared
            comment_visible = page.evaluate('() => document.body.innerText.includes("Playwright 自动化测试")')
            print(f"\nComment visible: {comment_visible}")

            # Check for toast
            toast_text = page.evaluate('''() => {
                const toasts = document.querySelectorAll('[data-sonner-toast], [role=status], [data-sonner-toaster]');
                return Array.from(toasts).map(t => t.textContent).join(' | ') || null;
            }''')
            print(f"Toast: {toast_text}")

            # Check submit button state after
            btn_after = page.query_selector('button[type="submit"]')
            if btn_after:
                after_text = btn_after.text_content()
                after_disabled = btn_after.get_attribute('disabled')
                print(f"Button after: '{after_text}' disabled={after_disabled}")
        else:
            print("No submit button found")

    browser.close()
    print("\nDone.")
