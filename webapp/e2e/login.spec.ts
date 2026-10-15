import { expect, test } from '@playwright/test';

for (const source of ['sdk', 'webapp']) {
  test(`${source} sign-in supports StrictMode and reopening`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/e2e/fixtures/login.html?source=${source}`);

    for (let attempt = 0; attempt < 2; attempt++) {
      await page.getByRole('button', { name: 'Open sign-in' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Sign in with Google', exact: true })
      ).toBeVisible();
      if (source === 'webapp') {
        await expect(
          page.getByRole('link', { name: /terms of service/i })
        ).toHaveAttribute('href', 'http://127.0.0.1:3000/terms');
        await expect(
          page.getByRole('link', { name: /privacy policy/i })
        ).toHaveAttribute('href', 'http://127.0.0.1:3000/privacy');
      } else {
        await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(0);
      }
      await page.getByRole('button', { name: 'Close dialog' }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });
}

test('standalone SDK sign-in accepts host policy links', async ({ page }) => {
  await page.goto('/e2e/fixtures/login.html?source=sdk&policies');
  await page.getByRole('button', { name: 'Open sign-in' }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('link', { name: /terms of service/i })
  ).toHaveAttribute('href', 'https://example.com/community-terms');
  await expect(
    dialog.getByRole('link', { name: /privacy policy/i })
  ).toHaveAttribute('href', 'https://example.com/community-privacy');
});

test('Google sign-in retries, returns to the same URL, and shares compat auth', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const userId = 'local-google-user';
  const email = 'neighbor@example.test';
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  // Unsigned emulator token. All Auth HTTP calls are fulfilled locally below.
  const idToken = `${encode({ alg: 'none' })}.${encode({
    sub: userId,
    user_id: userId,
    aud: 'demo-community-map',
    iss: 'https://securetoken.google.com/demo-community-map',
    iat: now,
    exp: now + 3600,
    auth_time: now,
    email,
    firebase: { sign_in_provider: 'google.com', identities: {} },
  })}.`;
  const account = {
    localId: userId,
    email,
    emailVerified: true,
    providerUserInfo: [{ providerId: 'google.com', rawId: userId, email }],
  };
  let credentialExchanges = 0;
  await page.route('http://127.0.0.1:9099/**', async (route) => {
    const request = route.request();
    const isSignIn = request.url().includes('/accounts:signInWithIdp?');
    const isLookup = request.url().includes('/accounts:lookup?');
    expect(isSignIn || isLookup).toBe(true);
    if (isSignIn) {
      credentialExchanges++;
      expect(request.url()).toContain('key=local-e2e-key');
      expect(request.postDataJSON().postBody).toContain('providerId=google.com');
    }
    await route.fulfill({
      headers: { 'Access-Control-Allow-Origin': '*' },
      json: isSignIn
        ? { ...account, idToken, refreshToken: 'local-refresh', expiresIn: '3600' }
        : { users: [account] },
    });
  });

  await page.goto('/e2e/fixtures/login.html?source=sdk&localAuth#return-here');
  const originalUrl = page.url();
  await expect(page.getByLabel('Auth user')).toHaveText('signed out');
  await page.getByRole('button', { name: 'Open sign-in' }).click();
  const google = page.getByRole('button', { name: 'Sign in with Google' });
  await google.click();
  await expect(page.getByText('Popup closed', { exact: true })).toBeVisible();
  await expect(google).toBeEnabled();

  await Promise.all([
    page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
    google.click(),
  ]);
  await expect(page).toHaveURL(originalUrl);
  await expect(page.getByLabel('Auth user')).toHaveText(userId);
  await expect(page.getByLabel('Firebase apps')).toHaveText(
    '__open_community_map__'
  );
  expect(credentialExchanges).toBe(1);
  await page.getByRole('button', { name: 'Sign out through compat' }).click();
  await expect(page.getByLabel('Auth user')).toHaveText('signed out');
  expect(errors).toEqual([]);
});

test('sign-in remains usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/e2e/fixtures/login.html?source=webapp');
  await page.getByRole('button', { name: 'Open sign-in' }).click();
  const google = page.getByRole('button', { name: 'Sign in with Google' });
  await expect(google).toBeVisible();
  const button = await google.boundingBox();
  expect(button!.width).toBeGreaterThan(150);
  expect(button!.x).toBeGreaterThanOrEqual(0);
  expect(button!.x + button!.width).toBeLessThanOrEqual(320);
  await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
