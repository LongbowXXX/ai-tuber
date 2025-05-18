#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import os
from pathlib import Path

APPLICATION_DATA_DIR = Path(f"{os.getenv('APPDATA')}/vtuber-behavior-engine").resolve()
APPLICATION_DB_DIR = Path(APPLICATION_DATA_DIR, "db").resolve()
