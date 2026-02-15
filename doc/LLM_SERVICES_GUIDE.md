# LLM Services Guide

通过 iAutoPay 服务购买的 API Key 可访问以下模型：

## Supported Models

通过本服务购买的 API Key 可访问以下模型：

- `z-ai/glm4.7` - GLM-4.7 with thinking chain support (128k context, 16384 output)
- `z-ai/glm5` - GLM-5 with thinking chain support (128k context, 16384 output)
- `moonshotai/kimi-k2.5` - Kimi K2.5 with long context support (200k context, 16384 output)

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
  "provider": {
    "autopay": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Autopay API",
      "options": {
        "baseURL": "https://ipaynapi.gpuart.cn/v1",
        "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "models": {
        "GLM-4.7": {
          "id": "z-ai/glm4.7",
          "name": "GLM-4.7",
          "description": "由智谱AI训练的大型语言模型，支持思维链推理",
          "tool_call": true,
          "temperature": true,
          "reasoning": true
        },
        "GLM-5": {
          "id": "z-ai/glm5",
          "name": "GLM-5",
          "description": "由智谱AI训练的大型语言模型，支持思维链推理",
          "tool_call": true,
          "temperature": true,
          "reasoning": true
        },
        "Kimi-K2.5": {
          "id": "moonshotai/kimi-k2.5",
          "name": "Kimi K2.5",
          "description": "由 Moonshot AI 开发的先进语言模型，支持长上下文和思维链",
          "tool_call": true,
          "temperature": true,
          "reasoning": true
        }
      }
    }
  }
}
```

### Using with Other Tools

您也可以在其他支持 OpenAI 兼容 API 的工具中使用：

```bash
# 使用 curl
curl -X POST https://ipaynapi.gpuart.cn/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "z-ai/glm4.7",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Model Features

### GLM-4.7 (z-ai/glm4.7)
- 支持思维链推理
- 128k 上下文长度
- 16384 输出长度
- 强大的推理能力，适合复杂任务

### GLM-5 (z-ai/glm5)
- 支持思维链推理
- 128k 上下文长度
- 16384 输出长度
- 最新版本，提升的多模态能力

### Kimi K2.5 (moonshotai/kimi-k2.5)
- 支持思维链推理
- 200k 超长上下文长度
- 16384 输出长度
- 由 Moonshot AI 开发，适合长文档分析和复杂任务

## Support

如有问题和疑问，请使用 [GitHub Issues](https://github.com/newblock/iautopay/issues)。
