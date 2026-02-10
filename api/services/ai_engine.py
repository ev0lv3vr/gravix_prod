"""
AI Engine service for calling Claude API and parsing structured responses.
"""
import httpx
import json
from typing import Dict, Any
from config import settings
from prompts.failure_analysis import SYSTEM_PROMPT as FAILURE_SYSTEM_PROMPT, build_user_prompt as build_failure_prompt
from prompts.spec_engine import SYSTEM_PROMPT as SPEC_SYSTEM_PROMPT, build_user_prompt as build_spec_prompt
import asyncio


class AIEngine:
    """Service for interacting with Claude API."""
    
    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.model = settings.anthropic_model
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.max_retries = settings.max_retries_ai
        self.timeout = settings.ai_timeout_seconds
    
    async def analyze_failure(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate failure analysis using Claude API.
        
        Args:
            analysis_data: Dictionary containing failure analysis input fields
            
        Returns:
            Parsed JSON response from Claude
            
        Raises:
            Exception: If API call fails or response cannot be parsed
        """
        system_prompt = FAILURE_SYSTEM_PROMPT
        user_prompt = build_failure_prompt(analysis_data)
        
        return await self._call_claude_api(system_prompt, user_prompt)
    
    async def generate_spec(self, spec_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate material specification using Claude API.
        
        Args:
            spec_data: Dictionary containing spec request input fields
            
        Returns:
            Parsed JSON response from Claude
            
        Raises:
            Exception: If API call fails or response cannot be parsed
        """
        system_prompt = SPEC_SYSTEM_PROMPT
        user_prompt = build_spec_prompt(spec_data)
        
        return await self._call_claude_api(system_prompt, user_prompt)
    
    async def _call_claude_api(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Make API call to Claude with retry logic.
        
        Args:
            system_prompt: System-level instructions
            user_prompt: User-specific query
            
        Returns:
            Parsed JSON response
            
        Raises:
            Exception: If all retries fail or response is invalid
        """
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "max_tokens": 4096,
            "temperature": 0.3,  # Lower temperature for more consistent structured output
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        }
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        self.base_url,
                        headers=headers,
                        json=payload
                    )
                    
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    # Extract text content from response
                    if 'content' in data and len(data['content']) > 0:
                        text_content = data['content'][0].get('text', '')
                        
                        # Parse JSON from response
                        # Claude sometimes wraps JSON in markdown code blocks
                        text_content = text_content.strip()
                        if text_content.startswith('```json'):
                            text_content = text_content[7:]  # Remove ```json
                        if text_content.startswith('```'):
                            text_content = text_content[3:]  # Remove ```
                        if text_content.endswith('```'):
                            text_content = text_content[:-3]  # Remove trailing ```
                        
                        text_content = text_content.strip()
                        
                        try:
                            parsed_json = json.loads(text_content)
                            return parsed_json
                        except json.JSONDecodeError as e:
                            raise Exception(f"Failed to parse Claude response as JSON: {e}\nResponse: {text_content}")
                    else:
                        raise Exception(f"Unexpected response format from Claude API: {data}")
            
            except httpx.HTTPStatusError as e:
                last_error = f"HTTP error: {e.response.status_code} - {e.response.text}"
                if e.response.status_code == 429:  # Rate limit
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise Exception(last_error)
            
            except httpx.TimeoutException:
                last_error = "Request timed out"
                await asyncio.sleep(1 * attempt)  # Brief retry delay
            
            except Exception as e:
                last_error = str(e)
                if attempt == self.max_retries - 1:
                    raise
                await asyncio.sleep(1 * attempt)
        
        raise Exception(f"Failed to get response from Claude API after {self.max_retries} attempts. Last error: {last_error}")


# Global instance
ai_engine = AIEngine()
