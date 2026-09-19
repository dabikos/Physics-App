import asyncio
import os
import subprocess
import sys
from types import SimpleNamespace

import server


def test_ai_client_targets_openrouter_api():
    assert server.OPENROUTER_API_URL == "https://openrouter.ai/api/v1"
    assert str(server.openrouter_client.base_url).rstrip("/") == server.OPENROUTER_API_URL
    assert server.OPENROUTER_MODEL.startswith("openai/")


def test_call_ai_uses_server_selected_openrouter_model(monkeypatch):
    captured = {}

    class FakeCompletions:
        async def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content="answer"))]
            )

    fake_client = SimpleNamespace(
        chat=SimpleNamespace(completions=FakeCompletions())
    )
    monkeypatch.setattr(server, "openrouter_client", fake_client)
    monkeypatch.setattr(server, "OPENROUTER_API_KEY", "test-key")

    result = asyncio.run(
        server.call_ai("question", system_message="system", max_tokens=321, temperature=0.25)
    )

    assert result == "answer"
    assert captured["model"] == server.OPENROUTER_MODEL
    assert captured["max_tokens"] == 321
    assert captured["temperature"] == 0.25
    assert captured["messages"] == [
        {"role": "system", "content": "system"},
        {"role": "user", "content": "question"},
    ]


def test_production_refuses_to_start_without_openrouter_key():
    env = {
        **os.environ,
        "APP_ENV": "production",
        "SECRET_KEY": "test-secret",
        "CRON_SECRET": "test-cron-secret",
        "OPENROUTER_API_KEY": "",
    }
    result = subprocess.run(
        [sys.executable, "-c", "import server"],
        cwd=os.path.dirname(server.__file__),
        env=env,
        capture_output=True,
        text=True,
        timeout=15,
    )

    assert result.returncode != 0
    assert "OPENROUTER_API_KEY must be set" in result.stderr
