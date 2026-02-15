# LLM Services Guide

通过 iAutoPay 服务购买的 API Key 可访问以下模型：

## Supported Models

通过本服务购买的 API Key 可访问以下模型：

- `z-ai/glm4.7` - GLM4.7 with thinking chain support
- `minimaxai/minimax-m2.1` - MiniMax general LLM
- `deepseek-ai/deepseek-v3.2` - DeepSeek with thinking chain
- `kimi2.5` - Kimi AI model
- `glm5.0` - GLM 5.0 model

## API Key Pricing

通过 iAutoPay 购买 API Key 的价格：

- 1 天: 0.09 USDC
- 7 天: 0.49 USDC

## How to Purchase API Key

### Using iAutoPay MCP Tools

1. 使用 `info` 工具查看当前服务器信息和价格

```bash
# 在 OpenCode 或 Claude CLI 中
/info
```

2. 使用 `buy_apikey` 工具购买 API Key

```bash
# 购买 1 天 API Key
/buy_apikey duration=1

# 购买 7 天 API Key
/buy_apikey duration=7
```

### Using Quick Commands

如果已配置快捷命令：

```bash
# 购买 1 天 API Key
/autopay_buy_apikey_1day

# 购买 7 天 API Key
/autopay_buy_apikey_7days
```

## API Key Usage

购买成功后，您将获得一个 API Key，格式如下：

```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Using with OpenCode

在您的 `opencode.json` 中配置 API Key：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "api": {
    "custom": {
      "baseURL": "https://your-api-endpoint.com/v1",
      "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "z-ai/glm4.7",
        "minimaxai/minimax-m2.1",
        "deepseek-ai/deepseek-v3.2",
        "kimi2.5",
        "glm5.0"
      ]
    }
  }
}
```

### Using with Other Tools

您也可以在其他支持 OpenAI 兼容 API 的工具中使用：

```bash
# 使用 curl
curl -X POST https://your-api-endpoint.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "z-ai/glm4.7",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Model Features

### z-ai/glm4.7
- 支持思维链
- 强大的推理能力
- 适合复杂任务

### minimaxai/minimax-m2.1
- 通用大模型
- 平衡的性能
- 适合日常使用

### deepseek-ai/deepseek-v3.2
- 支持思维链
- 优秀的代码理解能力
- 适合编程任务

### kimi2.5
- 中文优化
- 长上下文支持
- 适合文档分析

### glm5.0
- 最新版本
- 多模态能力
- 适合综合任务

## Support

如有问题和疑问，请使用 [GitHub Issues](https://github.com/newblock/iautopay/issues)。
