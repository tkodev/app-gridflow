import { expect, test } from '@playwright/test'

test.describe('Collections page', () => {
  test('collect route is protected', async ({ page }) => {
    await page.goto('/collect')
    await expect(page).toHaveURL(/sign-in/)
  })
})
