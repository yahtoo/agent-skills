---
name: security-and-hardening
description: 加固代码以抵御漏洞。Use when handling user input, authentication, data storage, or external integrations. 用于构建任何接收不可信数据、管理用户会话或与第三方服务交互的功能。
---

# Security and Hardening（安全与加固）

## Overview（概览）

面向 Web 应用的安全优先开发实践。把每个外部输入都视为恶意，把每个 secret 都视为敏感，把每个授权检查都视为强制要求。安全不是一个阶段，而是约束每一行触及用户数据、认证或外部系统代码的条件。

## When to Use（何时使用）

- 构建任何接收用户输入的功能
- 实现认证或授权
- 存储或传输敏感数据
- 集成外部 API 或服务
- 添加文件上传、webhook 或 callback
- 处理支付或 PII 数据

## The Three-Tier Boundary System（三层边界系统）

### Always Do (No Exceptions)（始终执行，无例外）

- **在系统边界验证所有外部输入**（API routes、form handlers）
- **参数化所有数据库查询**，绝不要把用户输入拼接进 SQL
- **编码输出** 以防止 XSS（使用框架自动转义，不要绕过它）
- **所有外部通信使用 HTTPS**
- **使用 bcrypt/scrypt/argon2 哈希密码**（绝不存储明文）
- **设置安全 header**（CSP、HSTS、X-Frame-Options、X-Content-Type-Options）
- **会话使用 httpOnly、secure、sameSite cookies**
- **每次发布前运行 `npm audit`**（或等价工具）

### Ask First (Requires Human Approval)（先询问，需要人类批准）

- 添加新的认证流程或修改认证逻辑
- 存储新的敏感数据类别（PII、支付信息）
- 添加新的外部服务集成
- 修改 CORS 配置
- 添加文件上传处理器
- 修改 rate limiting 或 throttling
- 授予更高权限或角色

### Never Do（绝不执行）

- **绝不将 secret 提交到版本控制**（API keys、passwords、tokens）
- **绝不记录敏感数据到日志**（passwords、tokens、完整信用卡号）
- **绝不把客户端验证当成安全边界**
- **绝不为了方便禁用安全 header**
- **绝不对用户提供的数据使用 `eval()` 或 `innerHTML`**
- **绝不把会话存储在客户端可访问的存储中**（localStorage 中的 auth tokens）
- **绝不向用户暴露 stack trace 或内部错误详情**

## OWASP Top 10 Prevention（OWASP Top 10 防护）

### 1. Injection (SQL, NoSQL, OS Command)（注入）

```typescript
// BAD: SQL injection via string concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// GOOD: Parameterized query
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// GOOD: ORM with parameterized input
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### 2. Broken Authentication（认证失效）

```typescript
// Password hashing
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await hash(plaintext, SALT_ROUNDS);
const isValid = await compare(plaintext, hashedPassword);

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,  // From environment, not code
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,     // Not accessible via JavaScript
    secure: true,       // HTTPS only
    sameSite: 'lax',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  },
}));
```

### 3. Cross-Site Scripting (XSS)（跨站脚本）

```typescript
// BAD: Rendering user input as HTML
element.innerHTML = userInput;

// GOOD: Use framework auto-escaping (React does this by default)
return <div>{userInput}</div>;

// If you MUST render HTML, sanitize first
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### 4. Broken Access Control（访问控制失效）

```typescript
// Always check authorization, not just authentication
app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await taskService.findById(req.params.id);

  // Check that the authenticated user owns this resource
  if (task.ownerId !== req.user.id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Not authorized to modify this task' }
    });
  }

  // Proceed with update
  const updated = await taskService.update(req.params.id, req.body);
  return res.json(updated);
});
```

### 5. Security Misconfiguration（安全配置错误）

```typescript
// Security headers (use helmet for Express)
import helmet from 'helmet';
app.use(helmet());

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Tighten if possible
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
  },
}));

// CORS — restrict to known origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}));
```

### 6. Sensitive Data Exposure（敏感数据暴露）

```typescript
// Never return sensitive fields in API responses
function sanitizeUser(user: UserRecord): PublicUser {
  const { passwordHash, resetToken, ...publicFields } = user;
  return publicFields;
}

// Use environment variables for secrets
const API_KEY = process.env.STRIPE_API_KEY;
if (!API_KEY) throw new Error('STRIPE_API_KEY not configured');
```

## Input Validation Patterns（输入验证模式）

### Schema Validation at Boundaries（边界处的 Schema 验证）

```typescript
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
});

// Validate at the route handler
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: result.error.flatten(),
      },
    });
  }
  // result.data is now typed and validated
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

### File Upload Safety（文件上传安全）

```typescript
// Restrict file types and sizes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateUpload(file: UploadedFile) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ValidationError('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large (max 5MB)');
  }
  // Don't trust the file extension — check magic bytes if critical
}
```

## Triaging npm audit Results（分诊 npm audit 结果）

并非所有 audit 发现都需要立即处理。使用这个决策树：

```
npm audit reports a vulnerability
├── Severity: critical or high
│   ├── Is the vulnerable code reachable in your app?
│   │   ├── YES --> Fix immediately (update, patch, or replace the dependency)
│   │   └── NO (dev-only dep, unused code path) --> Fix soon, but not a blocker
│   └── Is a fix available?
│       ├── YES --> Update to the patched version
│       └── NO --> Check for workarounds, consider replacing the dependency, or add to allowlist with a review date
├── Severity: moderate
│   ├── Reachable in production? --> Fix in the next release cycle
│   └── Dev-only? --> Fix when convenient, track in backlog
└── Severity: low
    └── Track and fix during regular dependency updates
```

**关键问题：**
- 脆弱函数是否真的在你的代码路径中被调用？
- 该依赖是运行时依赖，还是仅开发期依赖？
- 在你的部署上下文中，这个漏洞是否可被利用（例如客户端-only 应用中的服务端漏洞）？

延期修复时，记录原因并设置复审日期。

## Rate Limiting（速率限制）

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter limit for auth endpoints
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // 10 attempts per 15 minutes
}));
```

## Secrets Management（Secret 管理）

```
.env files:
  ├── .env.example  → Committed (template with placeholder values)
  ├── .env          → NOT committed (contains real secrets)
  └── .env.local    → NOT committed (local overrides)

.gitignore must include:
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
```

**提交前始终检查：**
```bash
# Check for accidentally staged secrets
git diff --cached | grep -i "password\|secret\|api_key\|token"
```

## Security Review Checklist（安全评审清单）

```markdown
### Authentication
- [ ] Passwords hashed with bcrypt/scrypt/argon2 (salt rounds ≥ 12)
- [ ] Session tokens are httpOnly, secure, sameSite
- [ ] Login has rate limiting
- [ ] Password reset tokens expire

### Authorization
- [ ] Every endpoint checks user permissions
- [ ] Users can only access their own resources
- [ ] Admin actions require admin role verification

### Input
- [ ] All user input validated at the boundary
- [ ] SQL queries are parameterized
- [ ] HTML output is encoded/escaped

### Data
- [ ] No secrets in code or version control
- [ ] Sensitive fields excluded from API responses
- [ ] PII encrypted at rest (if applicable)

### Infrastructure
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS restricted to known origins
- [ ] Dependencies audited for vulnerabilities
- [ ] Error messages don't expose internals
```
## See Also（另请参阅）

详细安全清单和 pre-commit 验证步骤见 `references/security-checklist.md`。

## Common Rationalizations（常见合理化）

| 常见合理化 | 现实 |
|---|---|
| “这是内部工具，安全不重要” | 内部工具也会被攻陷。攻击者会瞄准最薄弱环节。 |
| “我们之后再加安全” | 事后补安全比一开始内建难 10 倍。现在就加。 |
| “没人会试图利用这个” | 自动扫描器会找到它。靠隐藏获得安全不是真安全。 |
| “框架会处理安全” | 框架提供工具，不提供保证。你仍然必须正确使用它们。 |
| “这只是原型” | 原型会变成生产。安全习惯从第一天开始。 |

## Red Flags（危险信号）

- 用户输入直接传给数据库查询、shell 命令或 HTML 渲染
- secret 出现在源代码或提交历史中
- API 端点缺少认证或授权检查
- 缺少 CORS 配置或使用通配符（`*`）origin
- 认证端点没有 rate limiting
- stack trace 或内部错误暴露给用户
- 依赖存在已知 critical 漏洞

## Verification（验证）

实现安全相关代码后：

- [ ] `npm audit` 没有 critical 或 high 漏洞
- [ ] 源代码或 git 历史中没有 secret
- [ ] 所有用户输入都在系统边界验证
- [ ] 每个受保护端点都检查认证和授权
- [ ] 响应中存在安全 header（用浏览器 DevTools 检查）
- [ ] 错误响应不暴露内部详情
- [ ] 认证端点启用了 rate limiting
