from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Step 1: Go to forum page and find a post
    print("=== Step 1: Load forum page ===")
    page.goto('http://localhost:3000/forum')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/forum-list.png', full_page=False)
    print(f"URL: {page.url}")

    # Find a post link
    post_links = page.evaluate('''() => {
        const links = document.querySelectorAll('a[href*="/forum/"]');
        const results = [];
        for (const link of links) {
            const href = link.getAttribute('href');
            if (href && href.includes('/forum/') && href !== '/forum' && href !== '/forum/') {
                results.push(href);
            }
        }
        return results.slice(0, 5);
    }''')
    print(f"Post links found: {post_links}")

    if post_links:
        post_url = post_links[0]
        print(f"\n=== Step 2: Navigate to {post_url} ===")
        page.goto(f'http://localhost:3000{post_url}')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='/tmp/forum-post.png', full_page=True)

        # Check what's on the page
        page_text = page.evaluate('() => document.body.innerText.slice(0, 2000)')
        print(f"Page text (first 2000 chars):\n{page_text}")

        # Look for comment form elements
        has_textarea = page.query_selector('textarea')
        has_contenteditable = page.query_selector('[contenteditable="true"]')
        has_login_hint = page.evaluate('() => document.body.innerText.includes("请登录") || document.body.innerText.includes("登录")')
        has_comment_form = page.query_selector('form')
        submit_btn = page.query_selector('button[type="submit"]')

        print(f"\n=== DOM Analysis ===")
        print(f"textarea: {has_textarea is not None}")
        print(f"contenteditable: {has_contenteditable is not None}")
        print(f"form: {has_comment_form is not None}")
        print(f"submit button: {submit_btn is not None}")
        print(f"login hint: {has_login_hint}")

        # Check for any comment-related buttons
        all_buttons = page.evaluate('''() => {
            const btns = document.querySelectorAll('button');
            return Array.from(btns).map(b => ({
                text: b.textContent.trim().slice(0, 50),
                type: b.type,
                disabled: b.disabled
            })).filter(b => b.text.length > 0);
        }''')
        print(f"\nAll buttons on page:")
        for btn in all_buttons:
            print(f"  [{btn['type']}] '{btn['text']}' disabled={btn['disabled']}")

        # Check for the specific comment area - look for reply input area
        comment_area = page.evaluate('''() => {
            // Look for comment-related divs
            const all = document.querySelectorAll('div, section');
            const results = [];
            for (const el of all) {
                const text = el.textContent || '';
                const cls = el.className || '';
                if (cls.toString().includes('comment') || text.slice(0, 50).includes('评论')) {
                    results.push({
                        tag: el.tagName,
                        cls: cls.toString().slice(0, 100),
                        text: text.slice(0, 100)
                    });
                }
            }
            return results.slice(0, 5);
        }''')
        print(f"\nComment-related elements:")
        for el in comment_area:
            print(f"  <{el['tag']}> class='{el['cls']}' text='{el['text'][:80]}'")

    browser.close()
    print("\nDone.")
