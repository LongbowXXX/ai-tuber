#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
import os
from typing import Optional

from google import genai
from google.genai.types import GenerateImagesConfig, GeneratedImage


async def create_image(prompt: str) -> Optional[GeneratedImage]:
    gemini_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=gemini_key)
    image_response = await client.aio.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=prompt,
        config=GenerateImagesConfig(number_of_images=1),
    )
    return image_response.generated_images[0] if image_response.generated_images else None
