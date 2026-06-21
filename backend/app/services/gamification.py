"""
EcoSphere AI - Gamification Service
Handles XP calculations, level progressions, streaks, and badge unlocking.
"""

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, UTC, timedelta

from app.models.gamification import Streak, Badge, UserBadge, Challenge, ChallengeParticipation
from app.models.user import User

# Level requirements (XP needed for each level)
# Level 1: 0 XP
# Level 2: 500 XP
# Level N: (N-1) * 500 + (N-1)^2 * 50
def calculate_level(xp: int) -> int:
    """Calculate user level based on total XP."""
    level = 1
    required_xp = 0
    while True:
        next_tier_xp = (level * 500) + (level ** 2 * 50)
        if xp >= next_tier_xp:
            level += 1
        else:
            break
    return level

class GamificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def award_xp(self, user_id: str, amount: int, reason: str) -> Tuple[int, bool]:
        """
        Awards XP to a user, recalculates their level, and returns the new XP 
        and a boolean indicating if they leveled up.
        """
        # Fetch user
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User {user_id} not found")

        old_level = calculate_level(user.xp)
        user.xp += amount
        new_level = calculate_level(user.xp)
        
        leveled_up = new_level > old_level
        
        # We don't commit here to allow the caller to manage the transaction
        return user.xp, leveled_up

    async def update_streak(self, user_id: str) -> Streak:
        """
        Updates a user's daily streak. Call this when a user logs an activity.
        """
        stmt = select(Streak).where(Streak.user_id == user_id)
        result = await self.db.execute(stmt)
        streak = result.scalar_one_or_none()
        
        today = datetime.now(UTC).date()
        
        if not streak:
            streak = Streak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_activity_date=datetime.now(UTC)
            )
            self.db.add(streak)
            return streak

        last_date = streak.last_activity_date.date() if streak.last_activity_date else None
        
        if last_date == today:
            # Already logged today
            pass
        elif last_date == today - timedelta(days=1):
            # Logged yesterday, increment streak
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak.last_activity_date = datetime.now(UTC)
        else:
            # Streak broken
            streak.current_streak = 1
            streak.last_activity_date = datetime.now(UTC)

        return streak

    async def check_and_award_badges(self, user_id: str) -> List[Badge]:
        """
        Evaluates criteria and awards new badges to the user.
        """
        # For a full implementation, we'd have a rules engine.
        # This is a stub for the architecture demonstrating the pattern.
        new_badges = []
        
        # Example: check if they should get the "First Activity" badge
        # In a real system, we'd query activity counts and evaluate criteria JSON
        
        return new_badges

    async def get_user_gamification_state(self, user_id: str) -> dict:
        """
        Returns a complete summary of the user's gamification state.
        """
        stmt = select(User).where(User.id == user_id)
        user = (await self.db.execute(stmt)).scalar_one()
        
        streak_stmt = select(Streak).where(Streak.user_id == user_id)
        streak = (await self.db.execute(streak_stmt)).scalar_one_or_none()
        
        badge_stmt = select(UserBadge).where(UserBadge.user_id == user_id)
        badges = (await self.db.execute(badge_stmt)).scalars().all()
        
        level = calculate_level(user.xp)
        next_level_xp = (level * 500) + (level ** 2 * 50)
        
        return {
            "level": level,
            "xp": user.xp,
            "next_level_xp": next_level_xp,
            "progress_to_next_level": user.xp / next_level_xp if next_level_xp > 0 else 0,
            "streak": streak.current_streak if streak else 0,
            "longest_streak": streak.longest_streak if streak else 0,
            "badges_earned": len(badges)
        }
