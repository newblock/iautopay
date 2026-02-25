#!/bin/bash
# Pay to Account B - requires confirmation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG=$($SCRIPT_DIR/read_config.py B)

if [ $? -ne 0 ]; then
    echo "Failed to read config"
    exit 1
fi

ADDRESS=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin)['address'])")
AMOUNT=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin)['amountInUnits'])")
AMOUNT_USDC=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin)['amount'])")

echo "Account B: $ADDRESS"
echo "Amount: $AMOUNT_USDC USDC ($AMOUNT units)"
read -p "Confirm payment? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Payment cancelled"
    exit 0
fi

npx -y @newblock/iautopay-mcp pay_stablecoin --to $ADDRESS --amount $AMOUNT
