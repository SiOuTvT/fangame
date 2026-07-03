from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 667})
    page = context.new_page()

    # Step 1: Go to login page
    print("=== Step 1: Login page ===")
    page.goto('http://localhost:3000/login')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/login.png')

    # Get the page content to understand login form structure
    inputs = page.evaluate('''() => {
        const els = document.querySelectorAll('input');
        return Array.from(els).map(el => ({
            name: el.name, id: el.id, type: el.type, placeholder: el.placeholder
        }));
    }''')
    print(f"Input fields: {inputs}")

    # Check for password test account - try to find or use default
    # First check if we can see the register link
    body_text = page.evaluate('() => document.body.innerText.slice(0, 500)')
    print(f"Page text: {body_text[:300]}")

    # Try registering a test account first
    print("\n=== Step 2: Try register ===")
    register_link = page.query_selector('a[href*="register"], button:has-text("注册")')
    if register_link:
        register_link.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        print(f"After register click URL: {page.url}")
        page.screenshot(path='/tmp/register.png')

    # Try login with common test credentials
    print("\n=== Step 3: Attempt login ===")
    page.goto('http://localhost:3000/login')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    # Fill login form
    identifier_input = page.query_selector('input[name="identifier"], input[id="identifier"], input[type="text"]')
    password_input = page.query_selector('input[type="password"]')

    if identifier_input and password_input:
        # Try common test credentials
        test_accounts = [
            ("admin", "admin123"),
            ("test", "test123"),
            ("admin", "password"),
            ("admin", "123456"),
        ]

        for username, password in test_accounts:
            print(f"  Trying: {username}/{password}")
            identifier_input.fill(username)
            password_input.fill(password)

            # Find and click submit
            submit_btn = page.query_selector('button[type="submit"]')
            if submit_btn:
                submit_btn.click()
                page.wait_for_timeout(2000)
                page.wait_for_load_state('networkidle')

                current_url = page.url
                print(f"  After login URL: {current_url}")

                if '/login' not in current_url:
                    print(f"  ✓ Login successful with {username}/{password}!")
                    page.screenshot(path='/tmp/after-login.png')
                    break
                else:
                    # Check for error message
                    error = page.evaluate('() => document.querySelector("[role=alert], .text-red, .text-destructive")?.textContent || "no error shown"')
                    print(f"  ✗ Login failed: {error}")
            else:
                print("  No submit button found")
    else:
        print(f"  Inputs not found: identifier={identifier_input}, password={password_input}")

    browser.close()
    print("\nDone.")
