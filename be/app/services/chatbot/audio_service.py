import base64
import json
import logging
import hashlib
from pathlib import Path
from typing import Optional

import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)

# Cache directory for TTS audio
CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache" / "tts"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


async def tts_generate(
    text: str,
    model: Optional[str] = None,
    voice: Optional[str] = None,
) -> Optional[bytes]:
    """
    Call the Pinkyne OpenAI proxy TTS endpoint and return raw audio bytes.

    The logic for handling the response format (direct audio bytes vs Base64
    JSON payloads with potentially nested structures) closely follows the
    provided reference implementation.
    """
    base_url = settings.pinkyne_base_url.rstrip("/")
    url = f"{base_url}/audio/speech"

    api_key = settings.pinkyne_api_key
    if not api_key:
        logger.error("Pinkyne API key is not configured (PINKYNE_API_KEY missing).")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model or settings.tts_model,
        "voice": voice or settings.tts_voice,
        "input": text,
    }

    # Cache key based on text + voice + model
    hash_key = hashlib.md5(f"{payload['model']}|{payload['voice']}|{text}".encode("utf-8")).hexdigest()  # nosec B324
    cache_path = CACHE_DIR / f"{hash_key}.mp3"

    # Serve from cache if exists
    if cache_path.exists():
        try:
            cached_bytes = cache_path.read_bytes()
            if cached_bytes:
                logger.info("Serving TTS from cache: %s", cache_path.name)
                return cached_bytes
        except Exception:
            logger.warning("Failed to read TTS cache, regenerating: %s", cache_path)

    logger.info(
        "Calling Pinkyne TTS: url=%s, model=%s, voice=%s, text_len=%d",
        url,
        payload["model"],
        payload["voice"],
        len(text),
    )

    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout) as client:
            # Reference uses: requests.post(..., data=json.dumps(payload))
            # We mirror that behaviour here.
            response = await client.post(
                url,
                headers=headers,
                data=json.dumps(payload),
            )
    except httpx.RequestError as exc:
        logger.exception("Error while calling Pinkyne TTS: %s", exc)
        return None

    logger.info(
        "Pinkyne TTS response: status=%s, content_type=%s, content_length=%s",
        response.status_code,
        response.headers.get("Content-Type"),
        response.headers.get("Content-Length"),
    )

    # Check for non-200 status codes
    if response.status_code != 200:
        error_body = response.text[:1000]  # First 1000 chars of error
        logger.error(
            "Pinkyne TTS returned error status %s. Response body: %s",
            response.status_code,
            error_body,
        )
        return None

    content_type = (response.headers.get("Content-Type") or "").lower()

    # 1) If the proxy directly returns audio bytes
    if "audio" in content_type:
        audio_bytes = response.content or b""
        if len(audio_bytes) == 0:
            logger.error("Pinkyne TTS returned empty audio bytes despite audio content-type")
            return None
        logger.info("Received raw audio bytes from Pinkyne: len=%d", len(audio_bytes))
        # Save to cache
        try:
            cache_path.write_bytes(audio_bytes)
        except Exception:
            logger.warning("Failed to write TTS cache: %s", cache_path)
        return audio_bytes

    # 2) Otherwise, expect JSON and try to extract Base64-encoded audio
    try:
        data = response.json()
    except ValueError:
        body_preview = response.text[:500]
        logger.error(
            "Pinkyne TTS response is not valid JSON. Content-Type: %s. Body preview: %r",
            response.headers.get("Content-Type"),
            body_preview,
        )
        return None

    # Log full JSON response for debugging (at INFO level so it shows up)
    logger.info("Pinkyne TTS JSON response: %s", json.dumps(data, indent=2)[:2000])

    # b64 = data.get("b64") or data.get("data") \
    #       or (data.get("audio", {}).get("data", [{}])[0].get("b64")
    #           if isinstance(data.get("audio", {}).get("data"), list) else None)

    b64 = data.get("b64") or data.get("data")

    if not b64:
        audio_field = data.get("audio") or {}
        audio_data = audio_field.get("data")
        nested_b64 = None
        if isinstance(audio_data, list) and audio_data:
            first = audio_data[0] or {}
            nested_b64 = first.get("b64")
        b64 = nested_b64

    if b64:
        try:
            audio_bytes = base64.b64decode(b64)
            logger.info("Decoded Base64 audio from Pinkyne: len=%d", len(audio_bytes))
            try:
                cache_path.write_bytes(audio_bytes)
            except Exception:
                logger.warning("Failed to write TTS cache: %s", cache_path)
            return audio_bytes
        except Exception:
            logger.exception("Failed to decode Base64 audio from Pinkyne response.")
            return None

    # Log the full structure to help debug
    logger.error(
        "No audio bytes or Base64 data found in Pinkyne TTS response. "
        "Response structure keys: %s. Full response: %s",
        list(data.keys()) if isinstance(data, dict) else "not a dict",
        json.dumps(data, indent=2)[:1000],
    )
    return None


