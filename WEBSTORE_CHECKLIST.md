# Chrome Web Store 上架清单

## 合规检查 ✅

### Manifest V3 合规
- [x] manifest_version: 3
- [x] Service Worker (background.js)
- [x] 权限最小化原则
- [x] 无 remotely hosted code

### 权限说明
| 权限 | 用途 | 必要性 |
|------|------|--------|
| `activeTab` | 访问当前标签页进行搜索高亮 | 必需 |
| `scripting` | 注入 content script | 必需 |
| `storage` | 本地保存用户预设 | 必需 |
| `tabs` | 自动搜索时监听标签切换 | 必需 |

---

## 一、准备工作

### 1. 开发者账号
- [ ] 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] 使用 Google 账号登录
- [ ] 支付 $5 一次性注册费
- [ ] 验证账号（可能需要身份验证）

### 2. 图标资源
- [x] icon16.png (16x16) - 工具栏图标
- [x] icon48.png (48x48) - 扩展管理页面
- [x] icon128.png (128x128) - Web Store 展示

### 3. 截图（必需）
- [ ] 至少 1 张，最多 5 张
- [ ] 尺寸：1280x800 或 640x400
- [ ] 建议截图内容：
  - 主界面（Keywords 模式）
  - 高亮效果展示
  - Top 3 密度区域
  - Auto-search 开关
  - Preset 编辑界面

### 4. 宣传图（可选但推荐）
- [ ] 小磁贴：440x280
- [ ] 大磁贴：920x680（推荐）
- [ ] Marquee：1400x560

---

## 二、打包扩展

### 方法 1：使用脚本
```bash
npm run package
```

### 方法 2：手动打包
```bash
zip -r rsearch-2.0.0.zip manifest.json popup.html popup.js content.js background.js styles.css icon16.png icon48.png icon128.png
```

### 必须包含的文件
- [x] manifest.json
- [x] popup.html
- [x] popup.js
- [x] content.js
- [x] background.js
- [x] styles.css
- [x] icon16.png
- [x] icon48.png
- [x] icon128.png

### 不要包含
- README.md
- PRIVACY.md (作为 URL 链接提供)
- CHANGELOG.md
- CONTRIBUTING.md
- .git 目录
- scripts 目录
- node_modules
- package.json
- package-lock.json

---

## 三、Store Listing 信息

### 基本信息

**扩展名称：**
```
RSearch - Error Log Search & Highlighter
```

**简短描述（132字符以内）：**
```
Advanced search with regex, 363+ error keywords, auto-highlight, and Top 3 density areas. Perfect for developers debugging logs.
```

**详细描述：**
```
RSearch - Advanced Text Search & Error Log Analysis

🔍 FEATURES:

✅ Keywords Mode
• 363+ pre-configured error keywords
• CSV-based preset system (3 slots, 500 keywords each)
• Severity-based color coding (8 colors: magenta → green)
• Auto-highlights errors, warnings, exceptions

✅ Regex Mode  
• Full regular expression support
• Case-sensitive/insensitive options
• Advanced pattern matching

✅ Top 3 Density Areas
• Sliding window algorithm detects error hotspots
• Click to navigate directly to high-density areas
• Temporary highlight on target element

✅ Auto-Search
• Toggle switch for automatic searching
• Auto-executes on new page loads
• Auto-executes when switching tabs
• State persists across sessions

✅ Preset Management
• 3 customizable preset slots
• Import/export via CSV editor
• Default preset covers common errors:
  - System signals (SIGSEGV, SIGABRT)
  - Python errors (RuntimeError, ValueError)
  - CUDA/GPU errors
  - Compiler errors
  - And 350+ more patterns

🎯 PERFECT FOR:
• Developers debugging logs
• QA engineers analyzing reports
• DevOps monitoring systems
• Anyone searching text patterns

🔒 PRIVACY:
• No data collection
• No external requests
• Fully local processing
• Open source on GitHub

📝 HOW TO USE:
1. Click RSearch icon
2. Turn ON the switch (green) for auto-search
3. Or click "Search" for manual search
4. Click Top 3 areas to navigate
5. Click "Clear" to remove highlights

💡 TIP: Edit presets to add your own keywords!

---
Open source: https://github.com/clemente0731/rsearch
```

### 分类
- **主分类：** Developer Tools
- **语言：** English

### 隐私政策 URL
```
https://github.com/clemente0731/rsearch/blob/main/PRIVACY.md
```

---

## 四、权限声明（审核必填）

在 Developer Dashboard 的 "Privacy" 标签页需要声明：

### Single Purpose Description
```
This extension helps users search and highlight text patterns (regex or keywords) on web pages, with special focus on error log analysis for developers.
```

### Permission Justification

**activeTab:**
```
Required to access the current tab's DOM content for searching and highlighting matched text patterns.
```

**scripting:**
```
Required to inject the content script that performs text searching and highlighting on the current page.
```

**storage:**
```
Required to save user's custom keyword presets and settings locally. No data is synced or transmitted.
```

**tabs:**
```
Required for the auto-search feature to detect when users switch tabs or load new pages, enabling automatic keyword highlighting.
```

### Data Use Disclosure
- [ ] 选择 "I do not sell data to third parties"
- [ ] 所有数据收集问题选择 "No"

---

## 五、提交审核

### 审核前检查清单
- [ ] 所有功能正常工作
- [ ] 无 console 错误
- [ ] 在多个网站测试
- [ ] 隐私政策 URL 可访问
- [ ] 截图清晰展示功能
- [ ] 描述准确无夸大

### 提交步骤
1. 登录 [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击 "New Item"
3. 上传 ZIP 文件
4. 填写 Store Listing（名称、描述、分类）
5. 上传截图（至少 1 张）
6. 填写 Privacy 标签页
7. 提交审核

### 审核时间
- 新扩展：3-7 个工作日
- 更新：1-3 个工作日
- 节假日可能延迟

---

## 六、常见拒绝原因及解决

| 拒绝原因 | 解决方案 |
|----------|----------|
| Missing privacy policy | 添加有效的隐私政策 URL |
| Excessive permissions | 移除不必要的权限或提供详细说明 |
| Misleading description | 确保描述准确反映功能 |
| Low quality screenshots | 使用清晰、专业的截图 |
| Broken functionality | 修复 bug 后重新提交 |

---

## 七、发布后维护

### 监控
- 查看下载统计
- 回复用户评论
- 监控崩溃报告

### 更新流程
1. 修改代码并测试
2. 更新 manifest.json 版本号
3. 运行 `npm run package`
4. 上传新 ZIP 到 Dashboard
5. 提交更新审核

---

## 八、有用链接

- [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Publishing Documentation](https://developer.chrome.com/docs/webstore/publish/)
- [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best_practices/)

---

**准备好了就去上架吧！🚀**
