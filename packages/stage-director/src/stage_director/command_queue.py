#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio

from stage_director.models import StageCommand

# アプリケーション全体で共有するコマンドキュー
# StageCommand 型のオブジェクトを格納する
command_queue: asyncio.Queue[StageCommand] = asyncio.Queue()


# Add a dictionary to track events for specific commands
command_events: dict[str, asyncio.Event] = {}


async def enqueue_command(command: StageCommand) -> None:
    """MCPツールなどからコマンドをキューに入れる関数"""
    await command_queue.put(command)


async def dequeue_command() -> StageCommand:
    """WebSocketハンドラなどがコマンドをキューから取り出す関数"""
    return await command_queue.get()


def mark_command_done() -> None:
    """キュー内のタスク完了をマークする"""
    command_queue.task_done()


async def wait_for_command(command_id: str) -> None:
    """Wait for a specific command to be marked as done."""
    if command_id not in command_events:
        command_events[command_id] = asyncio.Event()
    await command_events[command_id].wait()


def notify_command_done(command_id: str) -> None:
    """Notify that a specific command is done."""
    if command_id in command_events:
        command_events[command_id].set()
        del command_events[command_id]
