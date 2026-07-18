"""
タイムスタンプ書き込みスクリプト

Claude Code の Stop フックから呼び出され、現在時刻をプロジェクトルートの
timestamp.txt に書き込む。
"""

import sys
import json
from datetime import datetime
from pathlib import Path


def main() -> None:
    """stdin から Stop イベント JSON を読み取り、cwd に timestamp.txt を書き込む。"""
    try:
        data: dict = json.load(sys.stdin)
        cwd: str = data["cwd"]
        timestamp: str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        (Path(cwd) / "timestamp.txt").write_text(timestamp, encoding="utf-8")
    except Exception:
        pass  # エラーはサイレント。VSCode 側の表示が更新されないことで気付く


if __name__ == "__main__":
    main()
