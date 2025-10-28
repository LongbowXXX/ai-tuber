#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
from typing import Callable

import chromadb
from chromadb import QueryResult
from chromadb.utils import embedding_functions
from google.adk.events import Event
from google.adk.memory import BaseMemoryService
from google.adk.memory.base_memory_service import SearchMemoryResponse
from google.adk.memory.memory_entry import MemoryEntry
from google.adk.sessions import Session
from google.genai import types

from vtuber_behavior_engine.path import APPLICATION_DB_DIR

logger = logging.getLogger(__name__)


class ChromaMemoryService(BaseMemoryService):
    """Chroma Memory Service for Vtuber Behavior Engine.

    This class is a placeholder for the Chroma memory service.
    It inherits from BaseMemoryService and implements the required methods.
    """

    def __init__(self, event_filter: Callable[[Event], bool] | None = None) -> None:
        super().__init__()
        self._db_path = APPLICATION_DB_DIR / "chroma-memory-service"
        self._client = chromadb.PersistentClient(
            str(self._db_path),
        )
        embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key_env_var="GOOGLE_API_KEY")
        self._collection = self._client.get_or_create_collection(
            name="vtuber_sessions",
        )
        self._event_filter = event_filter

    async def add_session_to_memory(self, session: Session) -> None:
        """Adds a session to the memory service.

        A session may be added multiple times during its lifetime.

        Args:
            session: The session to add.
        """
        for event in session.events:
            if self._event_filter:
                if not self._event_filter(event):
                    continue
            if event.content and event.content.parts:
                text = " ".join(part.text for part in event.content.parts if part.text)
                logger.info(f"Adding {text} to memory")
                self._collection.add(
                    documents=[text],
                    metadatas=[
                        {
                            "session_id": session.id,
                            "app_name": session.app_name,
                            "user_id": session.user_id,
                            "timestamp": event.timestamp,
                            "author": event.author,
                        }
                    ],
                    ids=[f"{session.id}-{event.timestamp}"],
                )

    async def search_memory(self, *, app_name: str, user_id: str, query: str) -> SearchMemoryResponse:
        """Searches for sessions that match the query.

        Args:
            app_name: The name of the application.
            user_id: The id of the user.
            query: The query to search for.

        Returns:
            A SearchMemoryResponse containing the matching memories.
        """
        logger.info(f"search_memory(): Searching for {query} in memory")
        results: QueryResult = self._collection.query(
            query_texts=[query],
            n_results=10,
            where={"user_id": user_id},
        )
        documents_list = results["documents"]
        metadatas_list = results["metadatas"]
        if not documents_list or not metadatas_list:
            return SearchMemoryResponse(memories=[])

        memory_results = []
        for documents, metadatas in zip(documents_list, metadatas_list):
            if not documents or not metadatas:
                continue
            for document, metadata in zip(documents, metadatas):
                memory_results.append(
                    MemoryEntry(
                        content=types.Content(parts=[types.Part(text=document)]),
                        author=str(metadata["author"]),
                        timestamp=str(metadata["timestamp"]),
                    )
                )
        logger.info(f"search_memory(): Found memories: {memory_results}")
        return SearchMemoryResponse(memories=memory_results)
