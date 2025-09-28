import json
import sys

if __name__ != "__main__":
    sys.exit(1)

obj = json.load(sys.stdin)
print("users:")
for user in obj["users"]:
    print("  - id:", user["uuid"])
sys.exit(0)
