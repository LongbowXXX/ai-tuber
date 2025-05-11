#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
import random
from concurrent.futures import ThreadPoolExecutor
from xml.etree import ElementTree

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://news.google.com/news/rss/headlines/section/topic/{topic}?hl=ja&gl=JP&ceid=JP:ja"
TOPICS = ["WORLD", "NATION", "BUSINESS", "TECHNOLOGY", "ENTERTAINMENT", "SPORTS", "SCIENCE", "HEALTH"]


def select_random_news(news_list: list[str], count: int = 3) -> list[str]:
    """
    Select a random subset of news from the provided list.
    Args:
        news_list (list[str]): The list of news items.
        count (int): The number of news items to select.
    Returns:
        list[str]: A randomly selected subset of news items.
    """
    return random.sample(news_list, min(len(news_list), count))


def fetch_topic_news(topic: str) -> str | None:
    """
    Fetch news for a specific topic from Google News RSS feed.
    Args:
        topic (str): The topic to fetch news for.
    Returns:
        str | None: A formatted string containing news headlines for the topic or None.
    """
    try:
        url = BASE_URL.format(topic=topic)
        response = requests.get(url)
        response.raise_for_status()
        root = ElementTree.fromstring(response.content)
        topic_news = []
        for item in root.findall(".//item"):
            title_element = item.find("title")
            if title_element is not None and title_element.text:
                topic_news.append("- " + title_element.text)
        if topic_news:
            selected_news = select_random_news(topic_news)
            return f"### {topic}\n" + "\n".join(selected_news)
        else:
            logger.error(f"fetch_topic_news({topic}): No news found")
            return None
    except Exception as e:
        logger.error(f"fetch_topic_news({topic}): {e}", exc_info=e)
        return None


def get_news() -> dict[str, str]:
    """
    Retrieve the latest news for all topics in parallel.
    Returns:
        dict[str, str]: A dictionary containing the status and news or error message.
    """
    try:
        with ThreadPoolExecutor() as executor:
            results = list(executor.map(fetch_topic_news, TOPICS))
            non_null_results = [result for result in results if result is not None]
        news_results = "\n\n".join(non_null_results)
        logger.info(f"get_news(): Latest news {news_results}")
        return {"status": "success", "news": news_results}
    except Exception as e:
        logger.error(f"get_news(): {e}", exc_info=e)
        return {"status": "failed", "error_message": f"Get news failed.: {e}"}
