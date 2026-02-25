#!/bin/bash

#
# Claude CLI Auto-Setup Script for iAutoPay MCP
#
# This script:
# 1. Runs claude mcp add autopay with npx command
# 2. Configures BUYER_PRIVATE_KEY environment variable
# 3. Verifies MCP connection
#

set -e

MCP_SERVER="autopay"
MCP_COMMAND="npx"
MCP_ARGS=("-y" "@newblock/iautopay-mcp")

echo "=== iAutoPay MCP - Claude CLI Setup ==="
echo ""

# Check if claude CLI is installed
if ! command -v claude &> /dev/null; then
    echo "✗ Claude CLI is not installed"
    echo "  Please install it first: https://claude.ai/download"
    exit 1
fi

echo "✓ Claude CLI found"
echo ""

# Prompt for private key
echo -n "Enter your EVM wallet private key (input hidden): "
read -s PRIVATE_KEY
echo ""

# Validate private key
if [[ -z "$PRIVATE_KEY" ]]; then
    echo "✗ Private key cannot be empty"
    exit 1
fi

if [[ ! "$PRIVATE_KEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo "✗ Invalid private key format"
    echo "  Must be 66 characters starting with 0x"
    exit 1
fi

echo "✓ Private key format valid"
echo ""

# Remove existing autopay server if it exists
if claude mcp list 2>/dev/null | grep -q "$MCP_SERVER"; then
    echo "Removing existing $MCP_SERVER server..."
    claude mcp remove "$MCP_SERVER" -s local || true
    echo ""
fi

# Add MCP server
echo "Adding $MCP_SERVER server to Claude CLI..."
claude mcp add "$MCP_SERVER" \
    -e "BUYER_PRIVATE_KEY=$PRIVATE_KEY" \
    -- "${MCP_COMMAND}" "${MCP_ARGS[@]}"

echo ""

# Verify connection
echo "Verifying MCP connection..."
if claude mcp list | grep -q "$MCP_SERVER"; then
    echo "✓ $MCP_SERVER server added successfully"
else
    echo "✗ Failed to verify connection"
    exit 1
fi

echo ""

# Show server details
echo "=== Setup Complete ==="
echo ""
echo "MCP server: $MCP_SERVER"
echo "Command: ${MCP_COMMAND} ${MCP_ARGS[*]}"
echo ""

echo "Verification steps:"
echo "1. Run: claude mcp list"
echo "   Should show: $MCP_SERVER: connected"
echo ""
echo "2. Run: claude mcp get $MCP_SERVER"
echo "   Should show server details"
echo ""
echo "3. Start Claude CLI:"
echo "   claude"
echo ""
echo "4. Test available tools by asking:"
echo "   'Use the info tool to get iAutoPay server information'"

echo ""
echo "Security reminder:"
echo "  ✓ Test on testnet before mainnet"
echo "  ✓ Use a dedicated wallet"
echo "  ✓ Never share or commit your private key"
