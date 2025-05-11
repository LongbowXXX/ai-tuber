#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import datetime
from zoneinfo import ZoneInfo


def get_current_time() -> str:
    """
    A function that retrieves the current time in a specific format.
    Returns:
        str: The current time formatted as "YYYY-MM-DDTHH:MM:SS.mmm+HH:MM".
    """
    tokyo_tz = ZoneInfo("Asia/Tokyo")
    return datetime.datetime.now(tokyo_tz).isoformat(timespec="milliseconds")
