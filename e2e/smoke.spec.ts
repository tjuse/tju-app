import { expect, test } from "@playwright/test";

test.describe("核心页面冒烟测试", () => {
  test("概览首页加载并显示问候与卡片", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("概览")).toBeVisible();
    await expect(page.getByText("今日课程")).toBeVisible();
  });

  test("校历页显示当前周", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: "校历" })).toBeVisible();
  });

  test("常用链接页显示分类入口", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByText("统一身份认证")).toBeVisible();
  });

  test("课程表页显示空态", async ({ page }) => {
    await page.goto("/schedule");
    await expect(page.getByText("还没有课表")).toBeVisible();
  });
});
