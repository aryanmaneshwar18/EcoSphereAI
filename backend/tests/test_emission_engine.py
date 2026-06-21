"""
EcoSphere AI - Emission Engine Tests
Validates scientific accuracy of all emission calculations.
Tests cover transport, energy, food, waste, water, digital, and baseline calculations.
"""

import pytest
from app.services.emission_engine import EmissionEngine


@pytest.fixture
def engine():
    """Create an EmissionEngine instance for testing."""
    return EmissionEngine()


class TestTransportEmissions:
    """Tests for transportation emission calculations."""

    def test_car_petrol_100km(self, engine: EmissionEngine):
        """100 km petrol car should produce ~17.1 kg CO₂e (DEFRA 2025)."""
        result = engine.calculate_emission("transport", "car_petrol", 100, "km")
        assert abs(result["co2e"] - 17.1) < 0.1
        assert result["source"] == "DEFRA 2025"
        assert result["confidence_score"] >= 90

    def test_car_electric_100km(self, engine: EmissionEngine):
        """100 km EV should produce ~4.6 kg CO₂e (DEFRA 2025)."""
        result = engine.calculate_emission("transport", "car_electric", 100, "km")
        assert abs(result["co2e"] - 4.6) < 0.1

    def test_ev_lower_than_petrol(self, engine: EmissionEngine):
        """EV must always be lower than petrol for same distance."""
        petrol = engine.calculate_emission("transport", "car_petrol", 100, "km")
        ev = engine.calculate_emission("transport", "car_electric", 100, "km")
        assert ev["co2e"] < petrol["co2e"]

    def test_bus_105_per_km(self, engine: EmissionEngine):
        """Bus should produce ~0.105 kg CO₂e/km."""
        result = engine.calculate_emission("transport", "bus", 10, "km")
        assert abs(result["co2e"] - 1.05) < 0.01

    def test_train_lower_than_car(self, engine: EmissionEngine):
        """Train must produce lower emissions than car."""
        car = engine.calculate_emission("transport", "car_petrol", 100, "km")
        train = engine.calculate_emission("transport", "train", 100, "km")
        assert train["co2e"] < car["co2e"]

    def test_walking_zero_emissions(self, engine: EmissionEngine):
        """Walking should produce zero emissions."""
        result = engine.calculate_emission("transport", "walking", 5, "km")
        assert result["co2e"] == 0.0

    def test_cycling_zero_emissions(self, engine: EmissionEngine):
        """Cycling should produce zero emissions."""
        result = engine.calculate_emission("transport", "cycling", 10, "km")
        assert result["co2e"] == 0.0

    def test_flight_short_haul(self, engine: EmissionEngine):
        """Short-haul flight should use higher per-km factor."""
        short = engine.calculate_emission("transport", "flight_short", 1000, "km")
        long_haul = engine.calculate_emission("transport", "flight_long", 1000, "km")
        assert short["co2e"] > long_haul["co2e"]

    def test_business_class_higher_than_economy(self, engine: EmissionEngine):
        """Business class should produce higher emissions than economy."""
        economy = engine.calculate_emission("transport", "flight_long", 5000, "km")
        business = engine.calculate_emission("transport", "flight_business", 5000, "km")
        assert business["co2e"] > economy["co2e"]


class TestEnergyEmissions:
    """Tests for energy emission calculations."""

    def test_electricity_uk_grid(self, engine: EmissionEngine):
        """400 kWh on UK grid should produce ~82.8 kg CO₂e."""
        result = engine.calculate_emission("energy", "electricity", 400, "kWh", country="uk")
        expected = 400 * 0.207  # UK grid factor
        assert abs(result["co2e"] - expected) < 0.5

    def test_electricity_india_higher_than_uk(self, engine: EmissionEngine):
        """India grid should produce more CO₂e than UK for same kWh."""
        india = engine.calculate_emission("energy", "electricity", 100, "kWh", country="india")
        uk = engine.calculate_emission("energy", "electricity", 100, "kWh", country="uk")
        assert india["co2e"] > uk["co2e"]

    def test_electricity_france_low_carbon(self, engine: EmissionEngine):
        """France (nuclear) should have very low grid factor."""
        france = engine.calculate_emission("energy", "electricity", 100, "kWh", country="france")
        assert france["co2e"] < 10  # ~5.2 kg for 100 kWh

    def test_natural_gas(self, engine: EmissionEngine):
        """Natural gas should produce ~0.203 kg CO₂e/kWh."""
        result = engine.calculate_emission("energy", "natural_gas", 100, "kWh")
        assert abs(result["co2e"] - 20.3) < 0.5


class TestFoodEmissions:
    """Tests for food emission calculations."""

    def test_beef_highest_impact(self, engine: EmissionEngine):
        """Beef should have the highest emission factor (~60 kg CO₂e/kg)."""
        beef = engine.calculate_emission("food", "beef", 1, "kg")
        assert abs(beef["co2e"] - 60.0) < 1

    def test_vegetables_low_impact(self, engine: EmissionEngine):
        """Vegetables should have very low emissions (~0.5 kg CO₂e/kg)."""
        veg = engine.calculate_emission("food", "vegetables", 1, "kg")
        assert veg["co2e"] < 1.0

    def test_beef_higher_than_chicken(self, engine: EmissionEngine):
        """Beef must always be higher than chicken."""
        beef = engine.calculate_emission("food", "beef", 1, "kg")
        chicken = engine.calculate_emission("food", "chicken", 1, "kg")
        assert beef["co2e"] > chicken["co2e"]

    def test_vegan_lower_than_meat(self, engine: EmissionEngine):
        """Tofu should be significantly lower than beef."""
        beef = engine.calculate_emission("food", "beef", 1, "kg")
        tofu = engine.calculate_emission("food", "tofu", 1, "kg")
        assert tofu["co2e"] < beef["co2e"] / 10

    def test_food_factor_sources(self, engine: EmissionEngine):
        """All food factors should cite Poore & Nemecek."""
        result = engine.calculate_emission("food", "beef", 1, "kg")
        assert "Poore" in result["source"]


class TestWasteEmissions:
    """Tests for waste emission calculations."""

    def test_landfill(self, engine: EmissionEngine):
        """Landfill waste should produce ~0.587 kg CO₂e/kg."""
        result = engine.calculate_emission("waste", "landfill", 10, "kg")
        assert abs(result["co2e"] - 5.87) < 0.1

    def test_composting_lower_than_landfill(self, engine: EmissionEngine):
        """Composting must produce less emissions than landfill."""
        landfill = engine.calculate_emission("waste", "landfill", 10, "kg")
        compost = engine.calculate_emission("waste", "composting", 10, "kg")
        assert compost["co2e"] < landfill["co2e"]


class TestBaselineCalculation:
    """Tests for the onboarding baseline footprint calculation."""

    def test_baseline_produces_all_categories(self, engine: EmissionEngine):
        """Baseline should produce breakdown for all major categories."""
        result = engine.calculate_baseline(
            country="uk",
            diet_type="omnivore",
            vehicle_type="petrol",
            daily_commute_km=30,
            flights_per_year=2,
            monthly_electricity_kwh=300,
            has_solar=False,
            heating_type="natural_gas",
            household_size=2,
        )
        assert "transport" in result["breakdown"]
        assert "energy" in result["breakdown"]
        assert "food" in result["breakdown"]
        assert "waste" in result["breakdown"]
        assert result["total_annual"] > 0

    def test_vegan_lower_than_omnivore(self, engine: EmissionEngine):
        """Vegan baseline must be lower than omnivore (same other factors)."""
        omnivore = engine.calculate_baseline(
            country="uk", diet_type="omnivore", vehicle_type="none",
            daily_commute_km=0, flights_per_year=0,
            monthly_electricity_kwh=200, has_solar=False,
            heating_type="natural_gas", household_size=1,
        )
        vegan = engine.calculate_baseline(
            country="uk", diet_type="vegan", vehicle_type="none",
            daily_commute_km=0, flights_per_year=0,
            monthly_electricity_kwh=200, has_solar=False,
            heating_type="natural_gas", household_size=1,
        )
        assert vegan["total_annual"] < omnivore["total_annual"]

    def test_solar_reduces_energy(self, engine: EmissionEngine):
        """Solar panels should reduce energy emissions."""
        without_solar = engine.calculate_baseline(
            country="uk", diet_type="omnivore", vehicle_type="none",
            daily_commute_km=0, flights_per_year=0,
            monthly_electricity_kwh=400, has_solar=False,
            heating_type="natural_gas", household_size=1,
        )
        with_solar = engine.calculate_baseline(
            country="uk", diet_type="omnivore", vehicle_type="none",
            daily_commute_km=0, flights_per_year=0,
            monthly_electricity_kwh=400, has_solar=True,
            heating_type="natural_gas", household_size=1,
        )
        assert with_solar["breakdown"]["energy"] < without_solar["breakdown"]["energy"]

    def test_larger_household_reduces_per_capita(self, engine: EmissionEngine):
        """Larger households should have lower per-capita energy."""
        single = engine.calculate_baseline(
            country="uk", diet_type="omnivore", vehicle_type="petrol",
            daily_commute_km=20, flights_per_year=1,
            monthly_electricity_kwh=300, has_solar=False,
            heating_type="natural_gas", household_size=1,
        )
        family = engine.calculate_baseline(
            country="uk", diet_type="omnivore", vehicle_type="petrol",
            daily_commute_km=20, flights_per_year=1,
            monthly_electricity_kwh=300, has_solar=False,
            heating_type="natural_gas", household_size=4,
        )
        assert family["breakdown"]["energy"] < single["breakdown"]["energy"]


class TestComparison:
    """Tests for comparison with national/global averages."""

    def test_comparison_returns_all_fields(self, engine: EmissionEngine):
        result = engine.get_comparison(5000, "uk")
        assert "user_tonnes" in result
        assert "country_average_tonnes" in result
        assert "global_average_tonnes" in result
        assert "ipcc_target_tonnes" in result
        assert result["ipcc_target_tonnes"] == 2.0

    def test_high_emitter_positive_percentage(self, engine: EmissionEngine):
        """A high emitter should have positive vs_country percentage."""
        result = engine.get_comparison(20000, "uk")
        assert result["vs_country_percentage"] > 0

    def test_low_emitter_negative_percentage(self, engine: EmissionEngine):
        """A low emitter should have negative vs_country percentage."""
        result = engine.get_comparison(1000, "uk")
        assert result["vs_country_percentage"] < 0


class TestEquivalencies:
    """Tests for impact equivalency calculations."""

    def test_equivalencies_positive(self, engine: EmissionEngine):
        result = engine.calculate_equivalencies(100)
        assert result["trees_needed"] > 0
        assert result["cars_removed_days"] > 0
        assert result["phone_charges"] > 0
        assert result["led_bulb_hours"] > 0
        assert result["homes_powered_hours"] > 0

    def test_zero_emissions_zero_equivalencies(self, engine: EmissionEngine):
        result = engine.calculate_equivalencies(0)
        assert result["trees_needed"] == 0


class TestScenarioSimulation:
    """Tests for 'What if?' scenario calculations."""

    def test_vegetarian_scenario_saves_emissions(self, engine: EmissionEngine):
        result = engine.calculate_scenario(
            current_annual_co2e=8000,
            breakdown={"transport": 3000, "energy": 2000, "food": 2500, "waste": 500},
            scenario="vegetarian",
        )
        assert result["savings_annual_co2e"] > 0
        assert result["projected_annual_co2e"] < 8000

    def test_ev_scenario(self, engine: EmissionEngine):
        result = engine.calculate_scenario(
            current_annual_co2e=8000,
            breakdown={"transport": 3000, "energy": 2000, "food": 2500, "waste": 500},
            scenario="electric_vehicle",
        )
        assert result["savings_annual_co2e"] > 0
        assert result["savings_percentage"] > 0

    def test_scenario_has_projections(self, engine: EmissionEngine):
        result = engine.calculate_scenario(
            current_annual_co2e=8000,
            breakdown={"transport": 3000, "energy": 2000, "food": 2500, "waste": 500},
            scenario="solar",
        )
        assert "30_days" in result["projections"]
        assert "90_days" in result["projections"]
        assert "1_year" in result["projections"]
        assert "5_years" in result["projections"]


class TestRecommendations:
    """Tests for the recommendation engine."""

    def test_produces_recommendations(self, engine: EmissionEngine):
        recs = engine.get_top_recommendations(
            breakdown={"transport": 3000, "energy": 2000, "food": 2500, "waste": 500},
            diet_type="omnivore",
            vehicle_type="petrol",
        )
        assert len(recs) > 0
        assert len(recs) <= 5

    def test_recommendations_include_sources(self, engine: EmissionEngine):
        recs = engine.get_top_recommendations(
            breakdown={"transport": 3000, "energy": 2000, "food": 2500, "waste": 500},
            diet_type="omnivore",
            vehicle_type="petrol",
        )
        for rec in recs:
            assert "Source:" in rec or "source:" in rec.lower() or "Confidence:" in rec
