#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import datetime
import logging
import sys
import types
from logging import StreamHandler, LogRecord, FileHandler
from os.path import basename
from pathlib import Path
from typing import Type, TextIO


class ColorfulHandler(StreamHandler[TextIO]):
    mapping = {
        "TRACE": "[trace]",
        "DEBUG": "[\x1b[0;36mdebug\x1b[0m]",
        "INFO": "[\x1b[0;32minfo\x1b[0m]",
        "WARNING": "[\x1b[0;33mwarn\x1b[0m]",
        "WARN": "[\x1b[0;33mwarn\x1b[0m]",
        "ERROR": "\x1b[0;31m[error]\x1b[0m",
        "ALERT": "\x1b[0;37;41m[alert]\x1b[0m",
        "CRITICAL": "\x1b[0;37;41m[alert]\x1b[0m",
    }

    def emit(self, record: LogRecord) -> None:
        original_levelname = record.levelname
        try:
            if record.levelname in self.mapping:
                record.levelname = self.mapping[record.levelname]
            super().emit(record)
        finally:
            record.levelname = original_levelname


def setup_logger() -> None:
    """
    Sets up the logger for the application.

    This function creates a directory for logs if it does not exist,
    sets up a file handler to write logs to 'logs/app.log', and configures
    the logging format and level. It also sets a custom exception hook
    to handle unhandled exceptions.
    """
    Path("logs").mkdir(exist_ok=True, parents=True)
    current_date = datetime.datetime.now().strftime("%Y%m%d")
    file_handler = FileHandler(f"logs/app_{current_date}.log", encoding="utf-8")

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(thread)d - %(message)s",
        handlers=[ColorfulHandler(), file_handler],
    )
    sys.excepthook = _handle_unhandled_exception


def _handle_unhandled_exception(
    exc_type: Type[BaseException], exc_value: BaseException, exc_traceback: types.TracebackType | None
) -> None:
    """
    Handles unhandled exceptions by logging them.

    This function is set as the custom exception hook to log unhandled
    exceptions. If the exception is a KeyboardInterrupt, it calls the
    default excepthook.

    Args:
        exc_type: The type of the exception.
        exc_value: The exception instance.
        exc_traceback: The traceback object.
    """
    if issubclass(exc_type, KeyboardInterrupt):
        # Call the default excepthook saved at __excepthook__
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return

    logger = logging.getLogger(basename(__name__))
    logger.critical("Unhandled exception", exc_info=(exc_type, exc_value, exc_traceback))
