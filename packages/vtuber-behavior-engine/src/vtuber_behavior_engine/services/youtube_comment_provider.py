#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
import os

from googleapiclient import discovery, errors
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class YoutubeComment(BaseModel):
    pass


async def get_youtube_comments(video_id: str) -> list[YoutubeComment]:
    """
    A function that retrieves YouTube comments.
    Returns:
        list[YoutubeComment]: A list of YouTube comments.
    """
    youtube_key = os.getenv("GOOGLE_API_KEY")
    youtube = discovery.build("youtube", "v3", developerKey=youtube_key)

    try:
        video_request = youtube.videos().list(part="liveStreamingDetails", id=video_id)
        video_response = video_request.execute()

        if not video_response.get("items"):
            logger.error(f"Video {video_id} not found")
            return []

        live_streaming_details = video_response["items"][0].get("liveStreamingDetails")
        if not live_streaming_details or "activeLiveChatId" not in live_streaming_details:
            logger.error(f"Video {video_id} does not have an active live chat")
            return []

        live_chat_id = live_streaming_details["activeLiveChatId"]
        logger.info(f"Live chat ID for video {video_id}: {live_chat_id}")

    except errors.HttpError as e:
        logger.error(f"Error fetching video {video_id}: {e}", exc_info=e)
        return []
    # TODO: Implement the logic to fetch comments using the live_chat_id
    return []
