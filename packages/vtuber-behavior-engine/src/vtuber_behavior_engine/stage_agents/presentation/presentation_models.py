#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from pydantic import BaseModel, Field


class MoreInfoForPresenters(BaseModel):
    what_to_explains: list[str] = Field(description="what to explain in this slide")


class PresentationSlide(BaseModel):
    content_markdown: str = Field(description="content of the slide in markdown")
    more_info: MoreInfoForPresenters = Field(description="more info for presenters")


class PresentationAll(BaseModel):
    title: str = Field(description="title of the presentation")
    table_of_contents: list[str] = Field(description="table of contents of the presentation")
    slides: list[PresentationSlide] = Field(description="slides of the presentation")


class PresentationContext(BaseModel):
    table_of_contents: list[str] = Field(description="table of contents of the presentation")
    current_slide: PresentationSlide = Field(description="current slide of the presentation")
