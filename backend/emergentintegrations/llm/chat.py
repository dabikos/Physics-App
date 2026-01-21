# Mock LLM Chat for development without AI key
from dataclasses import dataclass
from typing import Optional

@dataclass
class UserMessage:
    text: str

class LlmChat:
    def __init__(self, api_key: str = "", session_id: str = "", system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
    
    def with_model(self, provider: str, model: str):
        return self
    
    async def send_message(self, message: UserMessage) -> str:
        # Mock response when no API key is configured
        if not self.api_key:
            return "AI функция временно недоступна. Для активации настройте EMERGENT_LLM_KEY в .env файле."
        return "AI response placeholder"

