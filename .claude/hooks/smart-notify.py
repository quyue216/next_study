#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能通知脚本 - 使用 Windows Toast 通知
"""
import json
import sys
import subprocess
from pathlib import Path

def main():
    input_data = sys.stdin.read()

    debug_file = Path.home() / ".claude" / "hook_debug.txt"
    debug_file.parent.mkdir(exist_ok=True)

    try:
        data = json.loads(input_data) if input_data else {}
    except:
        data = {}

    # 安全写入调试信息（处理编码问题）
    try:
        safe_input = input_data.encode('utf-8', errors='replace').decode('utf-8')
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(f"Received: {safe_input}\n")
    except:
        pass

    if input_data.strip():
        message = data.get("message", "Claude Code")
        send_toast_notification(message)

def send_toast_notification(message: str):
    """发送 Windows Toast 通知"""
    # 清理消息中的特殊字符
    safe_message = message.encode('utf-8', errors='replace').decode('utf-8')

    ps_script = f'''
Add-Type -AssemblyName System.Windows.Forms

$balloon = New-Object System.Windows.Forms.NotifyIcon
$balloon.Icon = [System.Drawing.SystemIcons]::Information
$balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$balloon.BalloonTipTitle = "Claude Code"
$balloon.BalloonTipText = "{safe_message}"
$balloon.Visible = $true
$balloon.ShowBalloonTip(5000)
'''

    try:
        subprocess.run(
            ["powershell", "-Command", ps_script],
            capture_output=True,
            timeout=15
        )
    except:
        pass

if __name__ == "__main__":
    main()
