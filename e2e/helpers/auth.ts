import type { Page } from '@playwright/test'

/** Sign in with email and password via the sign-in form. */
async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/plan/)
}

/** Sign up with a new account. */
async function signUp(page: Page, email: string, password: string, username: string) {
  await page.goto('/auth/sign-up')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByLabel('Username').fill(username)
  await page.getByRole('button', { name: /sign up|get started/i }).click()
}

export { signIn, signUp }
