from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    logs = []
    errors = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda exc: errors.append(str(exc)))

    # Check network for JS loading
    failed_requests = []
    page.on("requestfailed", lambda req: failed_requests.append(f"{req.url} - {req.failure}"))

    print("Loading /user/1 ...")
    page.goto("http://localhost:3000/user/1", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(5000)

    print(f"\nFailed requests: {len(failed_requests)}")
    for r in failed_requests[:5]:
        print(f"  {r}")

    print(f"\nConsole logs: {len(logs)}")
    for l in logs[:10]:
        print(f"  {l}")

    print(f"\nPage errors: {len(errors)}")
    for e in errors[:10]:
        print(f"  {e}")

    # Check if React is working
    react_works = page.evaluate("() => typeof window.__NEXT_DATA__ !== 'undefined' || typeof window.__next_f !== 'undefined'")
    print(f"\nReact/Next.js detected: {react_works}")

    # Check for any script errors
    scripts = page.locator("script[src]").all()
    print(f"\nScript tags: {len(scripts)}")

    # Check body content
    body_text = page.locator("body").text_content()
    has_card = "生成名片" in (body_text or "")
    has_edit = "编辑资料" in (body_text or "")
    print(f"\nBody has '生成名片': {has_card}")
    print(f"Body has '编辑资料': {has_edit}")

    browser.close()
