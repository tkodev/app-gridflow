import { expect, test } from '@playwright/test'

test.describe('Auth flows', () => {
  test('sign in page loads', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('sign up page loads', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await expect(page.getByRole('button', { name: /sign up|get started/i })).toBeVisible()
  })

  test('redirect to sign-in when accessing protected route', async ({ page }) => {
    await page.goto('/plan')
    await expect(page).toHaveURL(/sign-in/)
  })
})
