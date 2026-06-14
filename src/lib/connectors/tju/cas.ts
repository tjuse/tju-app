/**
 * TJU CAS 统一身份认证 connector — Phase 2 占位
 *
 * Phase 1 不使用此模块，但接口已预定义，使上层 API 可依赖类型而不阻塞开发。
 *
 * ⚠️  安全红线：
 *   - 凭据永不以明文写入日志或存储。
 *   - 仅抓取用户本人授权的数据。
 *   - 低频请求，带缓存，尊重学校系统。
 *
 * Phase 2 实现参考：
 *   - TJU CAS 端点：https://sso.tju.edu.cn/cas/login
 *   - 北洋维基：https://wiki.tjubot.cn/category/websites/
 */

export interface TjuCredentials {
  studentId: string;
  password: string; // 仅在内存中传递，绝不持久化明文
}

export interface CasSession {
  cookies: string; // 认证后的 Cookie 字符串
  expiresAt: Date;
}

/**
 * 模拟 CAS 登录，返回认证会话 Cookie。
 * Phase 1：抛出未实现错误。
 * Phase 2：实现真实 CAS 流程。
 */
export async function casLogin(_credentials: TjuCredentials): Promise<CasSession> {
  throw new Error(
    "CAS login is not implemented yet — this is a Phase 2 feature. " +
      "See docs/CONNECTORS.md for the implementation plan.",
  );
}

/**
 * 验证 CAS 会话是否仍有效。
 */
export async function validateCasSession(_session: CasSession): Promise<boolean> {
  throw new Error("Phase 2 not implemented");
}
