#!/usr/bin/env python3
"""Read autopay configuration and output account information."""

import json
import os
import sys
from pathlib import Path


def get_config_path():
    """Get the path to autopay.config.json in the skill directory."""
    script_dir = Path(__file__).parent
    config_path = script_dir.parent / "autopay.config.json"
    return config_path


def load_config():
    """Load the autopay configuration file."""
    config_path = get_config_path()
    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    
    with open(config_path, "r") as f:
        return json.load(f)


def get_account(account_name):
    """Get account information by name (A or B)."""
    config = load_config()
    
    account_key = f"account{account_name.upper()}"
    if account_key not in config.get("defaultPayments", {}):
        print(f"Error: Account {account_name} not found in config", file=sys.stderr)
        sys.exit(1)
    
    account = config["defaultPayments"][account_key]
    return {
        "address": account["address"],
        "amount": account["amount"],
        "amountInUnits": account["amountInUnits"],
        "requireConfirmation": account.get("requireConfirmation", False)
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: read_config.py <account|all>")
        print("  account: A or B")
        print("  all: output full config")
        sys.exit(1)
    
    arg = sys.argv[1].upper()
    
    if arg == "ALL":
        config = load_config()
        print(json.dumps(config))
    elif arg in ("A", "B"):
        account = get_account(arg)
        print(json.dumps(account))
    else:
        print(f"Error: Unknown argument: {arg}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
