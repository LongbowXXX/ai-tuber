#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php

import asyncio
import logging

from stage_director.stage_director_server import run_stage_director_server


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # 非同期メイン関数を実行
    asyncio.run(run_stage_director_server())
