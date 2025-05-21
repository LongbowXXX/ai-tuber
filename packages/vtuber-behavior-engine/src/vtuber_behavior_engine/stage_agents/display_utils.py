#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from google.genai.types import GroundingMetadata


def to_grounding_markdown_text(grounding: GroundingMetadata) -> str | None:
    """Convert grounding metadata to a grounding Markdown text."""
    if not grounding.grounding_chunks:
        return None
    all_str_list: list[str] = ["### Grounding Web Sites"]
    if grounding.grounding_chunks:
        for chunk in grounding.grounding_chunks:
            if chunk.web:
                all_str_list.append(f"- [{chunk.web.title}]({chunk.web.uri})")
    all_str_list.append("\n### Grounding Web Search Queries")
    if grounding.web_search_queries:
        query_list = [f"- {query}" for query in grounding.web_search_queries]
        all_str_list += query_list

    return "\n".join(all_str_list)
