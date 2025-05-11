#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from xml.etree import ElementTree

import requests

logger = logging.getLogger(__name__)


def get_news() -> dict[str, str]:
    """
    A function that retrieves the latest news from a Google News RSS feed.
    Returns:
        str: A string containing the latest news headlines and links for the specified topic.
    """
    # https://news.google.com/news/rss/headlines/section/topic/WORLD?hl=ja&gl=JP&ceid=JP:ja
    topics = ["WORLD", "NATION", "BUSINESS", "TECHNOLOGY", "ENTERTAINMENT", "SPORTS", "SCIENCE", "HEALTH"]
    base_url = "https://news.google.com/news/rss/headlines/section/topic/{topic}?hl=ja&gl=JP&ceid=JP:ja"
    news_results: list[str] = []

    try:
        for topic in topics:
            url = base_url.format(topic=topic)
            response = requests.get(url)
            response.raise_for_status()
            root = ElementTree.fromstring(response.content)
            topic_news: list[str] = []
            for item in root.findall(".//item"):
                title_element = item.find("title")
                if title_element is not None and title_element.text:
                    topic_news.append("- " + title_element.text)
            if topic_news:
                news_results.append(f"### {topic}\n" + "\n".join(topic_news[:3]))

        result = "\n\n".join(news_results)
        logger.info(f"get_news(): Latest news {result}")
        return {"status": "success", "news": result}
    except Exception as e:
        logger.error(f"get_news(): {e}", exc_info=e)
        return {"status": "failed", "error_message": f"Get news failed.: {e}"}
