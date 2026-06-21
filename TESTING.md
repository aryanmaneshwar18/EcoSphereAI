# Testing Strategy

EcoSphere AI maintains a strict testing regime to ensure code quality and reliability, targeting 90%+ code coverage across the stack.

## Frontend Testing (Jest & React Testing Library)
- **Unit Tests:** All utility functions (e.g., CO2e calculations) and Zustand store logic are unit-tested using Jest.
- **Component Tests:** React components are tested using `@testing-library/react`. We verify DOM rendering, user interactions (clicks, form inputs), and accessibility attributes.
- **E2E Testing:** Playwright is used to simulate critical user flows like Onboarding, Logging an Activity, and the Carbon Twin simulation across different browsers.

## Backend Testing (Pytest)
- **Unit Tests:** FastAPI endpoint logic, dependency overrides, and Pydantic schema validations are tested via `pytest` and `httpx.AsyncClient`.
- **Database Tests:** We use a separate testing database (or an SQLite in-memory DB via SQLAlchemy) to test Repository methods without affecting production data.
- **Mocks:** External APIs and complex services (like the AI Coach) are mocked using `pytest-mock` to ensure fast, deterministic tests.

## Continuous Integration (CI)
- Tests run automatically on every Pull Request via GitHub Actions.
- Linters (`eslint`, `flake8`, `mypy`) run before the test suite.
- Coverage reports are generated and uploaded to Codecov.

## Running Tests Locally
**Frontend:**
```bash
cd frontend
npm run test
```

**Backend:**
```bash
cd backend
pytest
```
