---
name: iautopy-install
description: |
  Single-file setup skill for iAutoPay. Creates EVM wallet, saves credentials to OpenClaw config, and installs SKILL to OpenClaw.
---

# iAutoPay Setup

Run this setup to create wallet and install skill:

```bash
python3 -c "
import os
import json
from eth_account import Account
from pathlib import Path

# Save to OpenClaw config (env section)
print('Saving to OpenClaw config...')
openclaw_config = Path.home() / '.openclaw' / 'openclaw.json'
openclaw_config.parent.mkdir(parents=True, exist_ok=True)

config = {}
if openclaw_config.exists():
    with open(openclaw_config) as f:
        config = json.load(f)

# Only create new wallet if AUTOPAY_PKEY doesn't exist
if 'AUTOPAY_PKEY' in config.get('env', {}):
    private_key = config['env']['AUTOPAY_PKEY']
    acc = Account.from_key(private_key)
    address = acc.address
    print(f'  ✓ Using existing wallet: {address}')
else:
    print('  ✓ Creating new wallet...')
    acc = Account.create()
    private_key = acc.key.hex()
    address = acc.address
    print(f'  ✓ Wallet created: {address}')
    config.setdefault('env', {})['AUTOPAY_PKEY'] = private_key

with open(openclaw_config, 'w') as f:
    json.dump(config, f, indent=2)
print(f'  ✓ Saved to {openclaw_config}')

# Save address
address_file = Path.home() / '.openclaw' / 'autopay_address.txt'
address_file.write_text(f'{address}\n')
print(f'  ✓ Saved address to {address_file}')

# Install SKILL to OpenClaw
print('Installing SKILL to OpenClaw...')
skill_dir = Path.home() / '.openclaw' / 'skills' / 'iautopay'
skill_dir.mkdir(parents=True, exist_ok=True)

# Download SKILL.md from GitHub
import urllib.request
import urllib.error
skill_url = 'https://raw.githubusercontent.com/newblock/iautopay/main/doc/SKILL.md'
try:
    urllib.request.urlretrieve(skill_url, skill_dir / 'SKILL.md')
    print(f'  ✓ Installed SKILL.md to {skill_dir}')
except urllib.error.URLError as e:
    print(f'  ! Failed to download SKILL.md: {e}')

print('\n✓ Setup complete!')
print(f'Your address: {address}')
print(f'Config file: {openclaw_config}')
print(f'Address file: {address_file}')
print('\nSkill will use AUTOPAY_PKEY from OpenClaw config automatically.')
"
```

## What This Does

1. **Creates EVM wallet** using `eth_account`
2. **Saves private key** to OpenClaw config (`~/.openclaw/openclaw.json`) in the `env` section
3. **Saves wallet address** to `~/.openclaw/autopay_address.txt`
4. **Installs SKILL.md** to `~/.openclaw/skills/iautopay/`

## How SKILL Uses the Private Key

The SKILL reads `AUTOPAY_PKEY` from the environment:
```python
private_key = os.environ.get('AUTOPAY_PKEY')
```

OpenClaw automatically injects all `env` variables from `~/.openclaw/openclaw.json` into the agent's environment when running.

## Fund Your Wallet

Visit these faucets to get testnet USDC:
- ETH: https://sepoliafaucet.com
- USDC: https://faucet.quicknode.com/ethereum/sepolia

Your address: `cat ~/.openclaw/autopay_address.txt`

## Verify Setup

```bash
# Check config
cat ~/.openclaw/openclaw.json

# Check address
cat ~/.openclaw/autopay_address.txt

# Check API info
curl https://apipaymcp.okart.fun/info
```

## Security Best Practices

1. **Never share your private key** - It's stored in OpenClaw config environment variables
2. **Keep your wallet address** - You'll need it for receiving funds
3. **If you lose your wallet address**, run `python scripts/get_address.py` to retrieve it from your private key

