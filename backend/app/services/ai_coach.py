"""
EcoSphere AI - AI Coaching Service
Integrates with OpenAI GPT-4o to provide personalized environmental coaching,
actionable insights, and scientific explanations.
"""

from typing import List, Dict, Any, Optional
import json
import logging
from openai import AsyncOpenAI
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize OpenAI client if API key is present
# Note: In a production setup, we'd gracefully handle missing keys.
try:
    openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize OpenAI client: {e}")
    openai_client = None

class AICoachService:
    def __init__(self):
        self.client = openai_client

    async def generate_weekly_insight(self, user_profile: Dict[str, Any], weekly_data: Dict[str, Any]) -> str:
        """
        Generates a personalized, encouraging insight based on the user's weekly footprint.
        """
        if not self.client:
            return "Keep up the great work! Try taking public transit this week to lower your transport emissions."

        system_prompt = """
        You are EcoSphere AI, an elite environmental coach developed by a team of leading software engineers.
        Your goal is to help users reduce their carbon footprint through actionable, scientifically accurate advice.
        Tone: Encouraging, data-driven, practical, and empathetic. Do NOT be preachy.
        Use Markdown formatting. Limit your response to 3 concise paragraphs.
        """

        user_prompt = f"""
        User Profile:
        - Country: {user_profile.get('country', 'Unknown')}
        - Diet: {user_profile.get('diet_type', 'Unknown')}
        
        Weekly Data:
        - Total CO2e: {weekly_data.get('total_co2e', 0)} kg
        - Transport: {weekly_data.get('transport', 0)} kg
        - Energy: {weekly_data.get('energy', 0)} kg
        - Food: {weekly_data.get('food', 0)} kg
        
        Provide a brief weekly insight, highlight their biggest emission source this week, and suggest one high-impact, easy-to-implement behavioral change.
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating AI insight: {e}")
            return "Focus on reducing your highest emission category this week. Small changes add up!"

    async def evaluate_user_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Answers a user's specific environmental question using context about their footprint.
        """
        if not self.client:
            return "I am currently offline and cannot answer specific questions."

        system_prompt = """
        You are an expert environmental consultant. Answer the user's question directly and accurately.
        Use the provided context about their footprint if relevant to personalize the answer.
        Reference scientific sources (IPCC, EPA, DEFRA) if providing emission factors.
        """

        context_str = json.dumps(context, indent=2)

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"User Context:\n{context_str}\n\nQuestion: {query}"}
                ],
                temperature=0.5,
                max_tokens=400
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error evaluating user query: {e}")
            return "I encountered an error while analyzing your query. Please try again later."
