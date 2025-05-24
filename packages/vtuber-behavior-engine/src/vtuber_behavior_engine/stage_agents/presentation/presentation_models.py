#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
from pydantic import BaseModel, Field


class MoreInfoForPresenters(BaseModel):
    what_to_explains: list[str] = Field(description="What will the presenter explain on this slide?")


class PresentationSlide(BaseModel):
    content_markdown: str = Field(description="content of the slide in markdown")
    more_info: MoreInfoForPresenters = Field(description="more info for presenters")


class PresentationAll(BaseModel):
    title: str = Field(description="title of the presentation")
    table_of_contents: list[str] = Field(description="table of contents of the presentation")
    slides: list[PresentationSlide] = Field(description="slides of the presentation")


class PresentationContext(BaseModel):
    slide_progression_decision_reason: str = Field(
        description="Step by step explanation of why the presentation's slide progress controller "
        "decides to advance or not advance the current slide. "
        "Make sure that the AI talent has spoken for each item in `what_to_explains`."
    )
    table_of_contents: list[str] = Field(description="table of contents of the presentation")
    current_slide: PresentationSlide = Field(description="current slide of the presentation")
    all_slides_completed: bool = Field(default=False, description="Flag to indicate if all slides have been presented.")
