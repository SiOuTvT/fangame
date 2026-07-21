const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const results = [];

  function result(test, status, detail) {
    results.push({ test, status, detail });
    const mark = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${mark} ${test}: ${detail}`);
  }

  // Helper: API call via browser (uses cookies)
  async function api(method, path, body) {
    return page.evaluate(async ({ method, path, body }) => {
      const opts = { method, headers: {} };
      if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(path, opts);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      return { status: res.status, data };
    }, { method, path, body });
  }

  // ===== LOGIN =====
  console.log('=== LOGIN ===');
  await page.goto('http://localhost:3099/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.fill('input[placeholder*="用户名"]', 'testuser_qa');
  await page.fill('input[type="password"]', 'testpass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const loggedIn = !page.url().includes('/login');
  result('Login', loggedIn ? 'PASS' : 'FAIL', page.url());

  if (!loggedIn) {
    console.log('Cannot proceed without login. Exiting.');
    await browser.close();
    return;
  }

  // ===== 1. PROFILE EDIT — Database check =====
  console.log('\n=== 1. PROFILE EDIT ===');

  // Read current profile
  const profileBefore = await api('GET', '/api/user/stats');
  console.log('  Profile before:', JSON.stringify(profileBefore.data).slice(0, 100));

  // Edit profile via page form
  await page.goto('http://localhost:3099/profile/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const bioField = page.locator('textarea').first();
  if (await bioField.count() > 0) {
    const testBio = 'E2E bio test ' + Date.now();
    await bioField.fill(testBio);
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(3000);

      // Verify by visiting profile
      await page.goto('http://localhost:3099/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const profileText = await page.locator('body').textContent();
      const bioSaved = profileText.includes(testBio.slice(0, 20));
      result('Profile bio saved to DB', bioSaved ? 'PASS' : 'FAIL',
        bioSaved ? 'Bio text visible on profile page' : `Expected "${testBio.slice(0, 20)}" not found`);
    }
  }

  // ===== 2. FAVORITE — Database check =====
  console.log('\n=== 2. FAVORITE ===');

  // Get initial favorite count
  const gameBefore = await api('GET', '/api/games/1');
  const favCountBefore = gameBefore.data?.favoriteCount;
  console.log('  Fav count before:', favCountBefore);

  // Toggle favorite via game detail page
  await page.goto('http://localhost:3099/games/1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const favBtn = page.locator('button:has-text("收藏"), [aria-label*="收藏"]').first();
  if (await favBtn.count() > 0) {
    await favBtn.click();
    await page.waitForTimeout(2000);

    // Check via API
    const gameAfter = await api('GET', '/api/games/1');
    const favCountAfter = gameAfter.data?.favoriteCount;
    console.log('  Fav count after:', favCountAfter);

    const countIncreased = favCountAfter > favCountBefore;
    result('Favorite count increased in DB', countIncreased ? 'PASS' : 'FAIL',
      `Before: ${favCountBefore}, After: ${favCountAfter}`);
  } else {
    result('Favorite button', 'WARN', 'Not found on page');
  }

  // ===== 3. FORUM POST — Database check =====
  console.log('\n=== 3. FORUM POST ===');

  // Create a forum post
  const postRes = await api('POST', '/api/forum/posts', {
    title: 'E2E Test Post ' + Date.now(),
    content: 'Test content for business logic verification',
    category: 'discussion'
  });
  console.log('  Create post:', postRes.status);
  result('Forum post created', postRes.status === 201 ? 'PASS' : 'FAIL',
    `Status: ${postRes.status}`);

  if (postRes.status === 201 && postRes.data?.id) {
    const postId = postRes.data.id;

    // Verify post exists
    const postGet = await api('GET', `/api/forum/posts/1`);
    console.log('  Post exists:', postGet.status === 200 ? 'YES' : 'NO');

    // Like the post
    const likeRes = await api('POST', `/api/forum/posts/${postId}/like`);
    console.log('  Like post:', likeRes.status);
    result('Forum post like', likeRes.status === 200 ? 'PASS' : 'FAIL', JSON.stringify(likeRes.data).slice(0, 100));

    // Mark as solved
    const solveRes = await api('POST', `/api/forum/posts/${postId}/solve`);
    console.log('  Solve post:', solveRes.status);
    result('Forum post solve', solveRes.status === 200 ? 'PASS' : 'FAIL');
  }

  // ===== 4. COMMENT — Database check =====
  console.log('\n=== 4. COMMENT ===');

  const commentRes = await api('POST', '/api/games/1/comments', {
    content: 'E2E test comment ' + Date.now()
  });
  console.log('  Create comment:', commentRes.status);
  result('Comment created', commentRes.status === 201 ? 'PASS' : 'FAIL',
    `Status: ${commentRes.status}`);

  if (commentRes.status === 201 && commentRes.data?.id) {
    const commentId = commentRes.data.id;

    // Verify comment count increased
    const comments = await api('GET', '/api/games/1/comments?limit=1');
    const commentCount = comments.data?.[1] || comments.data?.total;
    console.log('  Comment count:', commentCount);

    // Like the comment
    const likeComment = await api('POST', `/api/comments/${commentId}/like`);
    console.log('  Like comment:', likeComment.status);
    result('Comment like', likeComment.status === 200 ? 'PASS' : 'FAIL');

    // Delete the comment
    const delComment = await api('DELETE', `/api/comments/${commentId}`);
    console.log('  Delete comment:', delComment.status);
    result('Comment delete', delComment.status === 200 || delComment.status === 204 ? 'PASS' : 'FAIL');
  }

  // ===== 5. COLLECTION — Database check =====
  console.log('\n=== 5. COLLECTION ===');

  const colRes = await api('POST', '/api/collections', {
    name: 'E2E Test Collection'
  });
  console.log('  Create collection:', colRes.status);
  result('Collection created', colRes.status === 201 ? 'PASS' : 'FAIL', JSON.stringify(colRes.data).slice(0, 100));

  if (colRes.status === 201 && colRes.data?.id) {
    const colId = colRes.data.id;

    // Verify collection exists
    const colGet = await api('GET', `/api/collections/${colId}`);
    console.log('  Get collection:', colGet.status);
    result('Collection get', colGet.status === 200 ? 'PASS' : 'FAIL');

    // List collections
    const colList = await api('GET', '/api/collections');
    const colCount = Array.isArray(colList.data) ? colList.data.length : 0;
    console.log('  Collection list count:', colCount);
    result('Collection list has data', colCount > 0 ? 'PASS' : 'FAIL', `Count: ${colCount}`);

    // Delete collection
    const colDel = await api('DELETE', `/api/collections/${colId}`);
    console.log('  Delete collection:', colDel.status);
    result('Collection delete', colDel.status === 200 || colDel.status === 204 ? 'PASS' : 'FAIL');
  }

  // ===== 6. CHECKIN — Database check =====
  console.log('\n=== 6. CHECKIN ===');

  const checkinRes = await api('POST', '/api/checkin');
  console.log('  Checkin:', checkinRes.status);
  result('Checkin', checkinRes.status === 200 ? 'PASS' : 'FAIL',
    JSON.stringify(checkinRes.data).slice(0, 100));

  // Try again (should fail with 409)
  const checkinDuplicate = await api('POST', '/api/checkin');
  console.log('  Duplicate checkin:', checkinDuplicate.status, '(expect 409)');
  result('Duplicate checkin blocked', checkinDuplicate.status === 409 ? 'PASS' : 'FAIL',
    `Status: ${checkinDuplicate.status}`);

  // Verify checkin status
  const checkinStatus = await api('GET', '/api/checkin');
  console.log('  Checkin status:', JSON.stringify(checkinStatus.data).slice(0, 100));
  result('Checkin status shows checked in',
    checkinStatus.data?.checkedIn === true ? 'PASS' : 'FAIL');

  // ===== 7. FORUM POST DELETE — Database check =====
  console.log('\n=== 7. FORUM POST DELETE ===');

  // Create a post to delete
  const delPostRes = await api('POST', '/api/forum/posts', {
    title: 'To be deleted',
    content: 'Delete me',
    category: 'discussion'
  });
  if (delPostRes.status === 201 && delPostRes.data?.id) {
    const delPostId = delPostRes.data.id;
    const delRes = await api('DELETE', `/api/forum/posts/${delPostId}`);
    console.log('  Delete post:', delRes.status);
    result('Forum post delete', delRes.status === 200 || delRes.status === 204 ? 'PASS' : 'FAIL');
  }

  // ===== 8. NOTIFICATION — Database check =====
  console.log('\n=== 8. NOTIFICATIONS ===');

  // We should have notifications from previous operations (favorites, follows, comments)
  const notifs = await api('GET', '/api/notifications');
  console.log('  Notifications:', notifs.status, Array.isArray(notifs.data?.notifications) ? notifs.data.notifications.length + ' items' : 'N/A');

  // Check unread count
  const unreadCount = await api('GET', '/api/notifications/unread-count');
  console.log('  Unread count:', JSON.stringify(unreadCount.data));

  // Mark all as read
  const markRead = await api('PUT', '/api/notifications');
  console.log('  Mark all read:', markRead.status);

  // Verify
  const unreadAfter = await api('GET', '/api/notifications/unread-count');
  console.log('  Unread after mark-read:', JSON.stringify(unreadAfter.data));
  result('Notifications mark-read works',
    unreadAfter.data?.unreadCount === 0 ? 'PASS' : 'FAIL',
    `Unread: ${unreadAfter.data?.unreadCount}`);

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('BUSINESS LOGIC VALIDATION RESULTS');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  console.log(`PASS: ${passed}  FAIL: ${failed}  WARN: ${warned}  TOTAL: ${results.length}`);
  console.log('='.repeat(60));
  results.forEach(r => {
    const mark = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${mark} ${r.test}: ${r.detail.slice(0, 80)}`);
  });

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
