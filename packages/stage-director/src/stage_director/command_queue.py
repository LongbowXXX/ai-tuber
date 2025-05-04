#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio

from stage_director.models import StageCommand

# アプリケーション全体で共有するコマンドキュー
# StageCommand 型のオブジェクトを格納する
command_queue: asyncio.Queue[StageCommand] = asyncio.Queue()


async def enqueue_command(command: StageCommand) -> None:
    """MCPツールなどからコマンドをキューに入れる関数"""
    await command_queue.put(command)


async def dequeue_command() -> StageCommand:
    """WebSocketハンドラなどがコマンドをキューから取り出す関数"""
    return await command_queue.get()


def mark_command_done() -> None:
    """キュー内のタスク完了をマークする"""
    command_queue.task_done()
