from pydantic import BaseModel
from typing import Optional

from pydantic import BaseModel
from typing import Optional

class ExplainRequest(BaseModel):
    question: str        # thay word → question
    #story_id: Optional[str] = None   # optional, sau cần thì dùng


class WordExplainResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None

class TTSRequest(BaseModel):
    text: str