import pytest
import uuid
from datetime import datetime, UTC
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CarbonActivity, Streak, UserXP
from httpx import AsyncClient, ASGITransport
from app.main import create_application

app = create_application()

@pytest.mark.asyncio
async def test_dashboard_api_returns_success(db_session: AsyncSession):
    """
    Test the /api/v1/dashboard endpoint.
    Verifies that the N+1 optimized weekly_trend query runs successfully.
    """
    test_user_id = str(uuid.uuid4())
    
    # Insert mock user data
    activity = CarbonActivity(
        user_id=uuid.UUID(test_user_id),
        activity_type="transit",
        category="transport",
        co2e=10.5,
        activity_date=datetime.now(UTC)
    )
    streak = Streak(user_id=uuid.UUID(test_user_id), current_streak=5, max_streak=5)
    xp = UserXP(user_id=uuid.UUID(test_user_id), xp_total=500, current_level=3)
    
    db_session.add_all([activity, streak, xp])
    await db_session.commit()
    
    transport = ASGITransport(app=app)
    # Note: we bypass the real auth middleware in tests by assuming the router uses a dependency override
    # or by testing the raw logic. Since this is an integration test, we'll pass a valid looking header
    # and use the test app overrides if configured, else assume success if the auth mock exists.
    
    # We override the dependency for get_current_user_id
    from app.core.security import get_current_user_id
    app.dependency_overrides[get_current_user_id] = lambda: test_user_id
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/dashboard")
        
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    dashboard = data["data"]
    assert dashboard["total_co2e_month"] >= 10.5
    assert dashboard["streak"] == 5
    assert dashboard["level"] == 3
    # The new weekly trend logic should return exactly 12 weeks of data
    assert len(dashboard["weekly_trend"]) == 12
