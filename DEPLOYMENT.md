# Deployment Guide for @newblock/iautopay-mcp

## Prerequisites

1. npm account (register at https://www.npmjs.com/signup)
2. Node.js >= 18.0.0
3. Git access to this repository

## Quick Start for Users

### Option 1: npx (Recommended - No Installation Required)

```bash
npx @newblock/iautopay-mcp
```

### Option 2: Install as Dependency

```bash
npm install @newblock/iautopay-mcp
```

### Option 3: Global Install

```bash
npm install -g @newblock/iautopay-mcp
@newblock/iautopay-mcp
```

## Configuration

### Required Environment Variable

```bash
export BUYER_PRIVATE_KEY="0x..."
```

### OpenCode Integration

Add to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "iauto-pay": {
      "type": "local",
      "command": ["npx", "-y", "@newblock/iautopay-mcp"],
      "enabled": true,
      "environment": {
        "BUYER_PRIVATE_KEY": "{env:BUYER_PRIVATE_KEY}"
      }
    }
  }
}
```

### Claude Code Integration

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "iauto-pay": {
      "command": "npx",
      "args": ["@newblock/iautopay-mcp"],
      "env": {
        "BUYER_PRIVATE_KEY": "{env:BUYER_PRIVATE_KEY}"
      }
    }
  }
}
```

## Publishing to npm (For Maintainers)

### 1. Install Dependencies and Build

```bash
cd iautopay_newblock
npm install
npm run build
```

### 2. Login to npm

```bash
npm login
# Enter username, password, and email
```

### 3. Verify Package Name Availability

```bash
npm view @newblock/iautopay-mcp
# Should return "404 Not Found" if name is available
```

### 4. Test Publishing (Dry Run)

```bash
npm publish --dry-run
```

### 5. Publish to npm

```bash
npm publish --access public
```

## Version Management

### Update Version

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major

# Pre-release (0.1.0 -> 0.1.1-dev.0)
npm version prerelease --preid dev
```

### Publish New Version

```bash
# After version bump
npm run build
npm publish
git push
```

## GitHub Actions for Automated Publishing

### Create `.github/workflows/publish.yml`

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Setup GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Add `NPM_TOKEN` with your npm access token

### Create Release and Publish

```bash
# Create and push tag
git tag v0.1.0
git push origin v0.1.0

# GitHub Actions will automatically publish to npm
```

## Troubleshooting

### Issue: 403 Forbidden when publishing

**Solution:** Check if you're logged in:
```bash
npm whoami
npm login
```

### Issue: Package name already exists

**Solution:** Update package.json with a unique name:
```json
{
  "name": "@newblock/iautopay-mcp-unique"
}
```

### Issue: Scoped package requires public access

**Solution:** Always use `--access public` flag:
```bash
npm publish --access public
```

### Issue: Dist files not included

**Solution:** Check `.npmignore` and ensure `dist/` is not ignored:
```bash
# In .npmignore, dist/ should NOT be listed
```

## File Structure

```
iautopay_newblock/
├── src/                  # TypeScript source code
│   ├── server.ts        # Main MCP server
│   └── check_balance.ts  # Balance checker utility
├── dist/                # Compiled JavaScript (generated)
│   ├── server.js
│   └── check_balance.js
├── package.json         # npm package configuration
├── tsconfig.json       # TypeScript configuration
├── .npmignore         # Files to exclude from npm
├── .gitignore        # Files to exclude from git
├── README.md         # Package documentation
└── LICENSE          # MIT License
```

## MCP Tools Reference

### pay_stablecoin
Send stablecoin payment using EIP-3009 transferWithAuthorization.

```json
{
  "to": "0x123...",
  "amount": "1000000"
}
```

### pay_test_stablecoin
Force payment on Base Sepolia testnet.

```json
{
  "to": "0x123...",
  "amount": "1000000"
}
```

### buy_apikey
Purchase an API key for 0.2 USDC.

```json
{}
```

## Environment Switching

To switch between dev and prod environments, modify `src/server.ts`:

```typescript
// For production (Base Mainnet)
const CUR_ENV: 'dev' | 'prod' = 'prod';

// For development (Base Sepolia)
const CUR_ENV: 'dev' | 'prod' = 'dev';
```

Then rebuild and republish:

```bash
npm run build
npm version patch
npm publish
```

## Support

- GitHub Issues: https://github.com/newblock/iautopay/issues
- Documentation: https://github.com/newblock/iautopay#readme
- npm Package: https://www.npmjs.com/package/@newblock/iautopay-mcp

## License

MIT License - see LICENSE file for details.
