"""
EcoSphere AI - Community Service
Handles social features including friends, leaderboards, and community feeds.
"""

from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.gamification import Leaderboard
from app.models.user import User

class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_global_leaderboard(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieves the global leaderboard ranked by XP and impact.
        """
        stmt = (
            select(Leaderboard, User)
            .join(User, Leaderboard.user_id == User.id)
            .order_by(desc(Leaderboard.score))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        entries = result.all()

        return [
            {
                "rank": idx + 1,
                "user_id": user.id,
                "username": user.username or "EcoExplorer",
                "score": board.score,
                "level": board.level
            }
            for idx, (board, user) in enumerate(entries)
        ]

    async def get_friends_leaderboard(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves the leaderboard scoped to the user's friends.
        """
        # Placeholder for friends mapping logic
        return []

    async def get_community_feed(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Retrieves public milestones and achievements for the community feed.
        """
        # Placeholder for feed events table query
        return [
            {
                "event_type": "badge_earned",
                "username": "Sarah",
                "content": "earned the 'Zero Waste Week' badge!",
                "timestamp": "2 hours ago"
            },
            {
                "event_type": "milestone",
                "username": "David",
                "content": "reached Level 10 (Eco Warrior)!",
                "timestamp": "5 hours ago"
            }
        ]
