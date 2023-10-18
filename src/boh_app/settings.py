import os

DEBUG = os.environ.get("DEBUG", "").lower() not in {"", "0", "false"}
