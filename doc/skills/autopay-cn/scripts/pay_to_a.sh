#!/bin/bash
# Pay to Account A - no confirmation required

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG=$($SCRIPT_DIR/read_config.py A)

if [ $? -ne 0 ]; then
    echo "Failed to read config"
    exit 1
fi

ADDRESS=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin)['address'])")
AMOUNT=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin)['amountInUnits'])")

echo "Paying to Account A: $ADDRESS"
echo "Amount: $AMOUNT units"

npx -y @newblock/iautopay-mcp pay_stablecoin --to $ADDRESS --amount $AMOUNT
