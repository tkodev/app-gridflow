import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('hero section renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Design your Instagram/)).toBeVisible()
  })

  test('pricing section renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Simple, transparent pricing/)).toBeVisible()
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Creator Pro')).toBeVisible()
  })

  test('CTA links to sign-up', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /Start Planning Your Aesthetic/i }).first()
    await expect(cta).toHaveAttribute('href', '/auth/sign-up')
  })

  test('navigation links exist', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  })
})
