#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import logging
import queue
import threading
from types import TracebackType
from typing import Generator, Optional, Iterable, Type

import pyaudio
from google.cloud import speech

logger = logging.getLogger(__name__)


class SpeechRecognitionManager:
    """
    常時音声認識をバックグラウンドスレッドで実行し、
    ContextManager (with文) で管理するクラス。
    """

    # オーディオ設定
    FORMAT: int = pyaudio.paInt16
    CHANNELS: int = 1
    RATE: int = 16000
    CHUNK: int = 1024
    LANGUAGE_CODE: str = "ja-JP"

    def __init__(self) -> None:
        try:
            self._stt_client: speech.SpeechClient = speech.SpeechClient()
            self._audio_interface: pyaudio.PyAudio = pyaudio.PyAudio()
        except Exception as e:
            logger.error("エラー: Google STT 認証または PyAudio 初期化に失敗しました。")
            logger.error("環境変数 GOOGLE_APPLICATION_CREDENTIALS を確認してください。")
            raise e

        self._transcript_queue: queue.Queue[str] = queue.Queue()
        self._stop_event: threading.Event = threading.Event()
        self._stt_thread: Optional[threading.Thread] = None

    def _stt_thread_func(self) -> None:
        """
        [バックグラウンドスレッド]
        PyAudioストリームから音声を読み、STT APIに送信し、
        確定したテキストをキューに入れる。
        """
        logger.info("[STTスレッド] 開始")

        stream: pyaudio.Stream = self._audio_interface.open(
            format=self.FORMAT, channels=self.CHANNELS, rate=self.RATE, input=True, frames_per_buffer=self.CHUNK
        )

        def audio_generator() -> Generator[speech.StreamingRecognizeRequest, None, None]:
            while not self._stop_event.is_set():
                try:
                    data: bytes = stream.read(self.CHUNK, exception_on_overflow=False)
                    # logger.debug("[STTスレッド] オーディオチャンクを読み込み、STTに送信")
                    yield speech.StreamingRecognizeRequest(audio_content=data)
                except IOError:
                    break
            logger.info("[STTスレッド] ジェネレータ停止")

        config: speech.RecognitionConfig = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=self.RATE,
            language_code=self.LANGUAGE_CODE,
        )
        streaming_config: speech.StreamingRecognitionConfig = speech.StreamingRecognitionConfig(
            config=config, single_utterance=False  # 常時認識
        )

        requests: Generator[speech.StreamingRecognizeRequest, None, None] = audio_generator()

        try:
            # streaming_recognize は Iterable[StreamingRecognizeResponse] を返します
            responses: Iterable[speech.StreamingRecognizeResponse] = self._stt_client.streaming_recognize(
                config=streaming_config, requests=requests
            )  # type: ignore[call-arg]

            for response in responses:
                logger.debug(f"[STTスレッド] STTレスポンス受信: {response}")
                if self._stop_event.is_set():
                    break

                if response.results and response.results[0].is_final:
                    transcript: str = response.results[0].alternatives[0].transcript
                    if transcript.strip():
                        logger.info(f"[STTスレッド] 音声認識 (確定): {transcript}")
                        self._transcript_queue.put(transcript.strip())

        except Exception as e:
            if not self._stop_event.is_set():
                logger.error(f"[STTスレッド] エラー: {e}")
        finally:
            stream.stop_stream()
            stream.close()
            logger.info("[STTスレッド] 停止")

    def __enter__(self) -> queue.Queue[str]:
        """ContextManager の開始: スレッドを開始し、キューを返す"""
        logger.info("[Manager] __enter__: STTスレッドを開始します。")
        self._stop_event.clear()
        self._stt_thread = threading.Thread(target=self._stt_thread_func)
        self._stt_thread.start()

        return self._transcript_queue

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_value: Optional[BaseException],
        traceback: Optional[TracebackType],
    ) -> bool:
        """ContextManager の終了: スレッドを停止し、リソースを解放する"""
        logger.info("[Manager] __exit__: 停止シグナルを送信し、クリーンアップします...")

        self._stop_event.set()

        if self._stt_thread:
            self._stt_thread.join()

        self._audio_interface.terminate()

        logger.info("[Manager] 正常に終了しました。")
        # exc_type が None でない場合 (例外発生時)、False を返して例外を再送出
        return exc_type is None
