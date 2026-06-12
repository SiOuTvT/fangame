from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    page.goto("http://localhost:3000/login", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.get_by_placeholder("用户名或邮箱").fill("SiOuTvT")
    page.get_by_placeholder("密码").fill("siyu5098582")
    page.locator('button:has-text("登 录")').click()
    page.wait_for_timeout(5000)

    # Ultra-minimal user page
    page.goto("http://localhost:3000/user/1", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)

    # Click button 0 (first button in LayoutWrapper - nav toggle)
    btn = page.locator('button').first
    box = btn.bounding_box()
    if box:
        page.mouse.click(box['x'] + box['width']/2, box['y'] + box['height']/2)
        try:
            page.wait_for_timeout(3000)
            print("OK: Nav toggle works on ultra-minimal user page!")
        except:
            print("FROZEN: Even nav toggle frozen on ultra-minimal page!")

    browser.close()