import { expect, test } from '@playwright/test'

test.describe('Settings page', () => {
  test('settings route is protected', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/sign-in/)
  })
})
