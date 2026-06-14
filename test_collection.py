from playwright.sync_api import sync_playwright
import sys

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    errors = []
    page.on('console', lambda msg: errors.append(f'[{msg.type}] {msg.text}') if msg.type == 'error' else None)

    # Track network
    network_log = []
    def log_response(response):
        network_log.append(f'{response.status} {response.request.method} {response.url}')
    page.on('response', log_response)

    # Login first to be able to create collections
    print("Step 1: Go to login page")
    page.goto('http://localhost:3000/login', wait_until='networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_login.png', full_page=True)

    print("Page content sample:")
    inputs = page.locator('input').all()
    for inp in inputs:
        name = inp.get_attribute('name') or inp.get_attribute('placeholder') or ''
        type_ = inp.get_attribute('type') or 'text'
        print(f'  Input: name={name}, type={type_}')

    # Try to log in
    username_input = page.locator('input[name="identifier"]')
    password_input = page.locator('input[name="password"]')

    if username_input.count() > 0 and password_input.count() > 0:
        print("\nLogging in...")
        username_input.fill('testuser')
        password_input.fill('testpass123')

        submit_btn = page.locator('button[type="submit"]')
        if submit_btn.count() > 0:
            submit_btn.click()
            page.wait_for_timeout(3000)
            page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_after_login.png', full_page=True)
            print(f"After login URL: {page.url}")
    else:
        print("Login form not found - may already be logged in or page is different")
        print(f"Current URL: {page.url}")

    # Now navigate to user profile
    print("\nStep 2: Go to user profile")
    page.goto('http://localhost:3000/user/1', wait_until='networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_profile_tab.png', full_page=True)

    # Click the 收藏 tab (find and click)
    print("Looking for buttons:")
    buttons = page.locator('button').all()
    for b in buttons:
        try:
            text = b.inner_text().strip()
            if text:
                print(f"  Button: '{text}'")
        except:
            pass

    # Click the create collection button
    print("\nStep 3: Click '创建新收藏夹'")
    create_btn = page.locator('button:has-text("创建新收藏夹")')
    if create_btn.count() > 0:
        create_btn.first.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_create_form.png', full_page=True)
        print("Clicked create button - form should appear")

        # Check if input appeared
        inputs = page.locator('input').all()
        print(f"  Input fields visible: {len(inputs)}")
        for inp in inputs:
            val = inp.get_attribute('placeholder') or ''
            print(f"  Input: {val}")

        # Fill in the name - use the text input that appears
        text_inputs = page.locator('input[type="text"]')
        if text_inputs.count() > 0:
            name_input = text_inputs.first
            print("\nStep 4: Fill in collection name")
            name_input.fill('TestCollection')
            page.wait_for_timeout(500)
            page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_before_create.png', full_page=True)

            # Click create button - find by exact text
            all_buttons = page.locator('button').all()
            for btn in all_buttons:
                try:
                    if btn.inner_text().strip() == '创建':
                        print("Found create submit button, clicking...")
                        btn.click()
                        break
                except:
                    pass
            page.wait_for_timeout(3000)
            page.screenshot(path='C:/Users/Dell/AppData/Local/Temp/test_after_create.png', full_page=True)
            print(f"After create - URL: {page.url}")
            print(f"Page title: {page.title()}")
        else:
            print("Collection name input not found")
    else:
        print("'创建新收藏夹' button not found")

    print("\n=== CONSOLE ERRORS ===")
    for e in errors:
        print(e)

    print("\n=== NETWORK LOG (collections-related) ===")
    for entry in network_log:
        if 'collection' in entry.lower():
            print(entry)

    browser.close()
    print("\nDone!")