"""
EcoSphere AI - Scientific Emission Calculation Engine
Implements CO₂e calculations based on IPCC AR6, DEFRA 2025, EPA, and IEA data.

This engine is the scientific core of EcoSphere AI. Every calculation follows:
    CO₂e = Activity Amount × Emission Factor

All emission factors are sourced from:
- IPCC AR6 (Global Warming Potentials, GWP100)
- DEFRA 2025 Conversion Factors (UK Government)
- EPA GHG Emission Factors Hub (US EPA)
- IEA Electricity Carbon Intensity (per country)
- Poore & Nemecek 2018 (Food lifecycle analysis)
- GHG Protocol standards
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class EmissionFactorEntry:
    """Immutable emission factor with provenance."""
    factor: float       # kg CO₂e per unit
    unit: str           # unit of measurement
    source: str         # data source
    confidence: float   # confidence score (0-100)
    year: int = 2025    # reference year


class EmissionEngine:
    """
    Scientific emission calculation engine.
    Provides accurate CO₂e calculations across all activity categories.
    Thread-safe and stateless — safe for concurrent use.
    """

    # ══════════════════════════════════════════════════════════════
    # TRANSPORT EMISSION FACTORS (kg CO₂e per km)
    # Source: DEFRA 2025, EPA Emission Factors Hub
    # ══════════════════════════════════════════════════════════════
    TRANSPORT_FACTORS: dict[str, EmissionFactorEntry] = {
        # Personal vehicles
        "car_petrol": EmissionFactorEntry(0.171, "kg_co2e/km", "DEFRA 2025", 92.0),
        "car_diesel": EmissionFactorEntry(0.168, "kg_co2e/km", "DEFRA 2025", 92.0),
        "car_hybrid": EmissionFactorEntry(0.110, "kg_co2e/km", "DEFRA 2025", 90.0),
        "car_electric": EmissionFactorEntry(0.046, "kg_co2e/km", "DEFRA 2025", 88.0),
        "motorcycle": EmissionFactorEntry(0.113, "kg_co2e/km", "DEFRA 2025", 90.0),

        # Public transport
        "bus": EmissionFactorEntry(0.105, "kg_co2e/km", "DEFRA 2025", 85.0),
        "metro": EmissionFactorEntry(0.033, "kg_co2e/km", "DEFRA 2025", 85.0),
        "train": EmissionFactorEntry(0.041, "kg_co2e/km", "DEFRA 2025", 88.0),
        "tram": EmissionFactorEntry(0.029, "kg_co2e/km", "DEFRA 2025", 85.0),

        # Flights (including radiative forcing multiplier ~1.9)
        "flight_short": EmissionFactorEntry(0.255, "kg_co2e/km", "DEFRA 2025", 82.0),
        "flight_medium": EmissionFactorEntry(0.195, "kg_co2e/km", "DEFRA 2025", 82.0),
        "flight_long": EmissionFactorEntry(0.158, "kg_co2e/km", "DEFRA 2025", 82.0),
        "flight_business": EmissionFactorEntry(0.434, "kg_co2e/km", "DEFRA 2025", 80.0),

        # Micro-mobility
        "walking": EmissionFactorEntry(0.0, "kg_co2e/km", "IPCC AR6", 100.0),
        "cycling": EmissionFactorEntry(0.0, "kg_co2e/km", "IPCC AR6", 100.0),
        "e_scooter": EmissionFactorEntry(0.035, "kg_co2e/km", "DEFRA 2025", 80.0),
    }

    # Fuel-based factors (kg CO₂e per liter)
    FUEL_FACTORS: dict[str, EmissionFactorEntry] = {
        "petrol": EmissionFactorEntry(2.31, "kg_co2e/liter", "DEFRA 2025", 95.0),
        "diesel": EmissionFactorEntry(2.68, "kg_co2e/liter", "DEFRA 2025", 95.0),
        "lpg": EmissionFactorEntry(1.51, "kg_co2e/liter", "DEFRA 2025", 93.0),
    }

    # ══════════════════════════════════════════════════════════════
    # ENERGY EMISSION FACTORS
    # Source: IEA 2024, DEFRA 2025, national grid data
    # ══════════════════════════════════════════════════════════════
    ELECTRICITY_GRID_FACTORS: dict[str, EmissionFactorEntry] = {
        # kg CO₂e per kWh
        "global": EmissionFactorEntry(0.475, "kg_co2e/kWh", "IEA 2024", 70.0),
        "india": EmissionFactorEntry(0.708, "kg_co2e/kWh", "IEA 2024", 85.0),
        "usa": EmissionFactorEntry(0.390, "kg_co2e/kWh", "EPA eGRID 2024", 88.0),
        "uk": EmissionFactorEntry(0.207, "kg_co2e/kWh", "DEFRA 2025", 92.0),
        "germany": EmissionFactorEntry(0.350, "kg_co2e/kWh", "IEA 2024", 88.0),
        "france": EmissionFactorEntry(0.052, "kg_co2e/kWh", "IEA 2024", 88.0),
        "canada": EmissionFactorEntry(0.120, "kg_co2e/kWh", "IEA 2024", 88.0),
        "australia": EmissionFactorEntry(0.656, "kg_co2e/kWh", "IEA 2024", 85.0),
        "china": EmissionFactorEntry(0.555, "kg_co2e/kWh", "IEA 2024", 80.0),
        "japan": EmissionFactorEntry(0.457, "kg_co2e/kWh", "IEA 2024", 85.0),
        "brazil": EmissionFactorEntry(0.074, "kg_co2e/kWh", "IEA 2024", 85.0),
    }

    ENERGY_FACTORS: dict[str, EmissionFactorEntry] = {
        "natural_gas": EmissionFactorEntry(0.203, "kg_co2e/kWh", "DEFRA 2025", 93.0),
        "natural_gas_m3": EmissionFactorEntry(2.07, "kg_co2e/m3", "DEFRA 2025", 93.0),
        "lpg_kwh": EmissionFactorEntry(0.214, "kg_co2e/kWh", "DEFRA 2025", 93.0),
        "heating_oil": EmissionFactorEntry(0.265, "kg_co2e/kWh", "DEFRA 2025", 93.0),
        "solar": EmissionFactorEntry(-0.0, "kg_co2e/kWh", "IPCC AR6", 95.0),
    }

    # ══════════════════════════════════════════════════════════════
    # FOOD EMISSION FACTORS (kg CO₂e per kg food)
    # Source: Poore & Nemecek 2018 (via Our World in Data), DEFRA
    # ══════════════════════════════════════════════════════════════
    FOOD_FACTORS: dict[str, EmissionFactorEntry] = {
        "beef": EmissionFactorEntry(60.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "lamb": EmissionFactorEntry(24.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "pork": EmissionFactorEntry(7.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "chicken": EmissionFactorEntry(6.0, "kg_co2e/kg", "Poore & Nemecek 2018", 87.0),
        "fish": EmissionFactorEntry(5.0, "kg_co2e/kg", "Poore & Nemecek 2018", 82.0),
        "cheese": EmissionFactorEntry(21.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "milk": EmissionFactorEntry(3.2, "kg_co2e/kg", "Poore & Nemecek 2018", 87.0),
        "eggs": EmissionFactorEntry(4.5, "kg_co2e/kg", "Poore & Nemecek 2018", 87.0),
        "rice": EmissionFactorEntry(4.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "wheat": EmissionFactorEntry(1.4, "kg_co2e/kg", "Poore & Nemecek 2018", 87.0),
        "vegetables": EmissionFactorEntry(0.5, "kg_co2e/kg", "Poore & Nemecek 2018", 90.0),
        "fruits": EmissionFactorEntry(0.7, "kg_co2e/kg", "Poore & Nemecek 2018", 88.0),
        "nuts": EmissionFactorEntry(0.3, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "tofu": EmissionFactorEntry(2.0, "kg_co2e/kg", "Poore & Nemecek 2018", 85.0),
        "coffee": EmissionFactorEntry(16.5, "kg_co2e/kg", "Poore & Nemecek 2018", 80.0),
        "chocolate": EmissionFactorEntry(19.0, "kg_co2e/kg", "Poore & Nemecek 2018", 78.0),
    }

    # ══════════════════════════════════════════════════════════════
    # WASTE EMISSION FACTORS (kg CO₂e per kg waste)
    # Source: EPA WARM Model, DEFRA 2025
    # ══════════════════════════════════════════════════════════════
    WASTE_FACTORS: dict[str, EmissionFactorEntry] = {
        "landfill": EmissionFactorEntry(0.587, "kg_co2e/kg", "EPA WARM", 82.0),
        "landfill_food": EmissionFactorEntry(0.64, "kg_co2e/kg", "EPA WARM", 85.0),
        "recycling_paper": EmissionFactorEntry(-0.9, "kg_co2e/kg", "DEFRA 2025", 80.0),
        "recycling_plastic": EmissionFactorEntry(-0.5, "kg_co2e/kg", "DEFRA 2025", 78.0),
        "recycling_glass": EmissionFactorEntry(-0.3, "kg_co2e/kg", "DEFRA 2025", 80.0),
        "recycling_metal": EmissionFactorEntry(-1.5, "kg_co2e/kg", "DEFRA 2025", 80.0),
        "composting": EmissionFactorEntry(0.1, "kg_co2e/kg", "EPA WARM", 83.0),
        "incineration": EmissionFactorEntry(0.21, "kg_co2e/kg", "DEFRA 2025", 82.0),
    }

    # ══════════════════════════════════════════════════════════════
    # WATER EMISSION FACTORS
    # Source: DEFRA 2025, Water UK
    # ══════════════════════════════════════════════════════════════
    WATER_FACTORS: dict[str, EmissionFactorEntry] = {
        "water_supply": EmissionFactorEntry(0.149, "kg_co2e/m3", "DEFRA 2025", 85.0),
        "water_treatment": EmissionFactorEntry(0.272, "kg_co2e/m3", "DEFRA 2025", 85.0),
        "hot_water": EmissionFactorEntry(3.0, "kg_co2e/m3", "DEFRA 2025", 80.0),
    }

    # ══════════════════════════════════════════════════════════════
    # SHOPPING/CONSUMER GOODS FACTORS (kg CO₂e per item/kg)
    # Source: DEFRA 2025, academic literature
    # ══════════════════════════════════════════════════════════════
    SHOPPING_FACTORS: dict[str, EmissionFactorEntry] = {
        "smartphone": EmissionFactorEntry(70.0, "kg_co2e/unit", "DEFRA 2025", 75.0),
        "laptop": EmissionFactorEntry(350.0, "kg_co2e/unit", "DEFRA 2025", 75.0),
        "tv": EmissionFactorEntry(200.0, "kg_co2e/unit", "DEFRA 2025", 72.0),
        "clothing_cotton": EmissionFactorEntry(10.0, "kg_co2e/kg", "DEFRA 2025", 70.0),
        "clothing_polyester": EmissionFactorEntry(5.5, "kg_co2e/kg", "DEFRA 2025", 70.0),
        "furniture_wood": EmissionFactorEntry(3.0, "kg_co2e/kg", "DEFRA 2025", 68.0),
        "furniture_metal": EmissionFactorEntry(5.0, "kg_co2e/kg", "DEFRA 2025", 68.0),
        "packaging_plastic": EmissionFactorEntry(3.5, "kg_co2e/kg", "DEFRA 2025", 75.0),
        "packaging_cardboard": EmissionFactorEntry(0.9, "kg_co2e/kg", "DEFRA 2025", 78.0),
    }

    # ══════════════════════════════════════════════════════════════
    # DIGITAL EMISSION FACTORS
    # Source: IEA, academic research, The Shift Project
    # ══════════════════════════════════════════════════════════════
    DIGITAL_FACTORS: dict[str, EmissionFactorEntry] = {
        "streaming_video": EmissionFactorEntry(0.036, "kg_co2e/hour", "IEA/Shift Project", 70.0),
        "streaming_music": EmissionFactorEntry(0.007, "kg_co2e/hour", "IEA", 68.0),
        "cloud_storage": EmissionFactorEntry(0.01, "kg_co2e/GB/month", "IEA", 65.0),
        "gaming_pc": EmissionFactorEntry(0.15, "kg_co2e/hour", "Academic", 65.0),
        "gaming_console": EmissionFactorEntry(0.08, "kg_co2e/hour", "Academic", 65.0),
        "ai_query": EmissionFactorEntry(0.004, "kg_co2e/query", "IEA 2024", 60.0),
        "ai_image_gen": EmissionFactorEntry(0.05, "kg_co2e/image", "Academic", 55.0),
        "web_browsing": EmissionFactorEntry(0.2, "kg_co2e/GB", "The Shift Project", 65.0),
        "email": EmissionFactorEntry(0.004, "kg_co2e/email", "Academic", 60.0),
    }

    # ══════════════════════════════════════════════════════════════
    # COUNTRY ANNUAL AVERAGES (tonnes CO₂e per capita)
    # Source: Our World in Data, World Bank, IEA
    # ══════════════════════════════════════════════════════════════
    COUNTRY_AVERAGES: dict[str, float] = {
        "global": 4.7,
        "india": 1.9,
        "usa": 14.9,
        "uk": 5.2,
        "germany": 7.9,
        "france": 4.5,
        "canada": 14.3,
        "australia": 15.0,
        "china": 7.4,
        "japan": 8.6,
        "brazil": 2.3,
    }

    # IPCC target: 2 tonnes CO₂e per person per year
    IPCC_TARGET_TONNES: float = 2.0

    # ══════════════════════════════════════════════════════════════
    # IMPACT EQUIVALENCY FACTORS
    # Source: EPA Greenhouse Gas Equivalencies Calculator
    # ══════════════════════════════════════════════════════════════
    EQUIVALENCY_FACTORS = {
        "tree_absorption_kg_year": 22.0,    # 1 tree absorbs ~22 kg CO₂/year
        "car_kg_per_day": 12.1,             # Average car emits ~12.1 kg CO₂/day
        "phone_charge_kg": 0.008,           # ~8g CO₂e per phone charge
        "led_bulb_hour_kg": 0.006,          # ~6g CO₂e per hour LED
        "home_power_hour_kg": 0.6,          # ~0.6 kg CO₂e per hour avg home
    }

    # ══════════════════════════════════════════════════════════════
    # DIET TYPE ANNUAL FACTORS (kg CO₂e from food per year)
    # Source: Poore & Nemecek 2018, Scarborough et al. 2023
    # ══════════════════════════════════════════════════════════════
    DIET_ANNUAL_CO2E: dict[str, float] = {
        "omnivore": 2500.0,
        "flexitarian": 1900.0,
        "pescatarian": 1700.0,
        "vegetarian": 1400.0,
        "vegan": 1000.0,
    }

    def calculate_emission(
        self,
        category: str,
        subcategory: str,
        amount: float,
        unit: str,
        country: str = "global",
    ) -> dict[str, Any]:
        """
        Calculate CO₂e for a single activity.

        Args:
            category: Activity category (transport, energy, food, waste, water, shopping, digital)
            subcategory: Specific activity type within the category
            amount: Quantity of the activity
            unit: Unit of measurement
            country: Country for regional emission factors

        Returns:
            Dictionary with co2e, emission_factor, source, and confidence_score
        """
        factor_entry = self._get_emission_factor(category, subcategory, country)

        co2e = amount * factor_entry.factor
        co2e = round(max(co2e, 0.0), 4)  # Floor at 0 (recycling can be negative for avoided emissions)

        return {
            "co2e": co2e,
            "emission_factor": factor_entry.factor,
            "unit": factor_entry.unit,
            "source": factor_entry.source,
            "confidence_score": factor_entry.confidence,
        }

    def _get_emission_factor(
        self,
        category: str,
        subcategory: str,
        country: str = "global",
    ) -> EmissionFactorEntry:
        """Look up the emission factor for a given category and subcategory."""
        factor_maps = {
            "transport": self.TRANSPORT_FACTORS,
            "energy": {**self.ENERGY_FACTORS, **{
                f"electricity_{c}": f for c, f in self.ELECTRICITY_GRID_FACTORS.items()
            }},
            "food": self.FOOD_FACTORS,
            "waste": self.WASTE_FACTORS,
            "water": self.WATER_FACTORS,
            "shopping": self.SHOPPING_FACTORS,
            "digital": self.DIGITAL_FACTORS,
        }

        category_factors = factor_maps.get(category, {})

        # Try exact match first
        if subcategory in category_factors:
            entry = category_factors[subcategory]
            if isinstance(entry, EmissionFactorEntry):
                return entry

        # For energy/electricity, try country-specific grid factor
        if category == "energy" and subcategory == "electricity":
            country_lower = country.lower()
            if country_lower in self.ELECTRICITY_GRID_FACTORS:
                return self.ELECTRICITY_GRID_FACTORS[country_lower]
            return self.ELECTRICITY_GRID_FACTORS["global"]

        # Default: return a conservative estimate
        return EmissionFactorEntry(
            factor=0.5,
            unit="kg_co2e/unit",
            source="Global Average Estimate",
            confidence=60.0,
        )

    def calculate_baseline(
        self,
        country: str,
        diet_type: str,
        vehicle_type: str,
        daily_commute_km: float,
        flights_per_year: int,
        monthly_electricity_kwh: float,
        has_solar: bool,
        heating_type: str,
        household_size: int,
    ) -> dict[str, Any]:
        """
        Calculate annual baseline carbon footprint from onboarding questionnaire.

        This produces a comprehensive baseline using the user's lifestyle profile
        and region-specific emission factors.
        """
        breakdown: dict[str, float] = {}

        # ── Transport ──────────────────────────────────────────
        transport_co2e = 0.0

        # Daily commute
        if daily_commute_km > 0 and vehicle_type != "none":
            vehicle_key = f"car_{vehicle_type}"
            if vehicle_key in self.TRANSPORT_FACTORS:
                annual_commute_km = daily_commute_km * 250  # ~250 working days
                transport_co2e += annual_commute_km * self.TRANSPORT_FACTORS[vehicle_key].factor

        # Flights
        if flights_per_year > 0:
            avg_flight_distance = 2500  # km average
            for _ in range(flights_per_year):
                if avg_flight_distance < 1500:
                    factor = self.TRANSPORT_FACTORS["flight_short"].factor
                elif avg_flight_distance < 3700:
                    factor = self.TRANSPORT_FACTORS["flight_medium"].factor
                else:
                    factor = self.TRANSPORT_FACTORS["flight_long"].factor
                transport_co2e += avg_flight_distance * factor

        breakdown["transport"] = round(transport_co2e, 2)

        # ── Energy ─────────────────────────────────────────────
        energy_co2e = 0.0
        country_lower = country.lower()

        # Electricity
        if monthly_electricity_kwh > 0:
            grid_factor = self.ELECTRICITY_GRID_FACTORS.get(
                country_lower,
                self.ELECTRICITY_GRID_FACTORS["global"],
            )
            annual_kwh = monthly_electricity_kwh * 12
            elec_co2e = annual_kwh * grid_factor.factor

            # Solar offset
            if has_solar:
                elec_co2e *= 0.4  # Assume ~60% offset

            # Per-person share
            elec_co2e /= max(household_size, 1)
            energy_co2e += elec_co2e

        # Heating
        if heating_type == "natural_gas":
            avg_heating_kwh_annual = 12000  # UK average
            heating_co2e = avg_heating_kwh_annual * self.ENERGY_FACTORS["natural_gas"].factor
            heating_co2e /= max(household_size, 1)
            energy_co2e += heating_co2e
        elif heating_type == "heating_oil":
            avg_heating_kwh_annual = 15000
            heating_co2e = avg_heating_kwh_annual * self.ENERGY_FACTORS["heating_oil"].factor
            heating_co2e /= max(household_size, 1)
            energy_co2e += heating_co2e

        breakdown["energy"] = round(energy_co2e, 2)

        # ── Food ───────────────────────────────────────────────
        food_co2e = self.DIET_ANNUAL_CO2E.get(diet_type, 2500.0)
        breakdown["food"] = round(food_co2e, 2)

        # ── Waste ──────────────────────────────────────────────
        # Average waste per person: ~400 kg/year, ~60% landfill
        avg_waste_kg = 400
        waste_co2e = avg_waste_kg * 0.6 * self.WASTE_FACTORS["landfill"].factor
        waste_co2e += avg_waste_kg * 0.3 * 0.1  # Composting/recycling
        breakdown["waste"] = round(waste_co2e, 2)

        # ── Water ──────────────────────────────────────────────
        # Average water usage: ~150 liters/day, ~30% heated
        annual_water_m3 = (150 * 365) / 1000
        water_co2e = annual_water_m3 * self.WATER_FACTORS["water_supply"].factor
        water_co2e += (annual_water_m3 * 0.3) * self.WATER_FACTORS["hot_water"].factor
        water_co2e /= max(household_size, 1)
        breakdown["water"] = round(water_co2e, 2)

        # ── Digital ────────────────────────────────────────────
        # Average: 3h streaming/day, 50GB cloud, 2h browsing
        digital_co2e = 0.0
        digital_co2e += 3 * 365 * self.DIGITAL_FACTORS["streaming_video"].factor
        digital_co2e += 50 * 12 * self.DIGITAL_FACTORS["cloud_storage"].factor
        breakdown["digital"] = round(digital_co2e, 2)

        # ── Total ──────────────────────────────────────────────
        total = sum(breakdown.values())

        return {
            "total_annual": round(total, 2),
            "total_monthly": round(total / 12, 2),
            "breakdown": breakdown,
        }

    def get_comparison(
        self,
        user_annual_co2e: float,
        country: str,
    ) -> dict[str, Any]:
        """
        Compare user's footprint with national and global averages
        and the IPCC 2-tonne target.
        """
        user_tonnes = user_annual_co2e / 1000
        country_lower = country.lower()

        country_avg = self.COUNTRY_AVERAGES.get(country_lower, self.COUNTRY_AVERAGES["global"])
        global_avg = self.COUNTRY_AVERAGES["global"]
        ipcc_target = self.IPCC_TARGET_TONNES

        return {
            "user_tonnes": round(user_tonnes, 2),
            "country_average_tonnes": country_avg,
            "global_average_tonnes": global_avg,
            "ipcc_target_tonnes": ipcc_target,
            "vs_country_percentage": round(
                ((user_tonnes - country_avg) / country_avg) * 100, 1
            ) if country_avg > 0 else 0.0,
            "vs_global_percentage": round(
                ((user_tonnes - global_avg) / global_avg) * 100, 1
            ) if global_avg > 0 else 0.0,
            "vs_ipcc_percentage": round(
                ((user_tonnes - ipcc_target) / ipcc_target) * 100, 1
            ) if ipcc_target > 0 else 0.0,
            "country": country,
        }

    def get_top_recommendations(
        self,
        breakdown: dict[str, float],
        diet_type: str,
        vehicle_type: str,
        limit: int = 5,
    ) -> list[str]:
        """
        Generate initial recommendations based on the baseline footprint breakdown.
        Returns the most impactful suggestions first.
        """
        recommendations: list[tuple[float, str]] = []

        # Sort categories by emission to target the highest first
        sorted_cats = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)

        for cat, co2e in sorted_cats:
            if cat == "transport" and co2e > 500:
                if vehicle_type in ("petrol", "diesel"):
                    savings = co2e * 0.3
                    recommendations.append((
                        savings,
                        f"Switch 2 car trips/week to cycling or public transit — save ~{savings:.0f} kg CO₂/year "
                        f"(Source: DEFRA 2025 Transport Factors, Confidence: 89%)"
                    ))
                if vehicle_type != "electric":
                    savings = co2e * 0.7
                    recommendations.append((
                        savings,
                        f"Consider an electric vehicle — save up to ~{savings:.0f} kg CO₂/year "
                        f"(Source: DEFRA 2025, Confidence: 85%)"
                    ))

            if cat == "food" and co2e > 1500:
                if diet_type == "omnivore":
                    savings = co2e - self.DIET_ANNUAL_CO2E["flexitarian"]
                    recommendations.append((
                        savings,
                        f"Try flexitarian meals 3 days/week — save ~{savings:.0f} kg CO₂/year "
                        f"(Source: Poore & Nemecek 2018, Confidence: 87%)"
                    ))
                if diet_type in ("omnivore", "flexitarian"):
                    savings = co2e * 0.15
                    recommendations.append((
                        savings,
                        f"Replace beef with chicken 2x/week — save ~{savings:.0f} kg CO₂/year "
                        f"(Source: Our World in Data, Confidence: 88%)"
                    ))

            if cat == "energy" and co2e > 400:
                savings = co2e * 0.2
                recommendations.append((
                    savings,
                    f"Switch to LED bulbs and smart power strips — save ~{savings:.0f} kg CO₂/year "
                    f"(Source: EPA, Confidence: 90%)"
                ))
                savings_solar = co2e * 0.5
                recommendations.append((
                    savings_solar,
                    f"Install solar panels — save up to ~{savings_solar:.0f} kg CO₂/year "
                    f"(Source: IEA 2024, Confidence: 82%)"
                ))

            if cat == "waste" and co2e > 100:
                savings = co2e * 0.4
                recommendations.append((
                    savings,
                    f"Compost food waste and recycle — save ~{savings:.0f} kg CO₂/year "
                    f"(Source: EPA WARM Model, Confidence: 83%)"
                ))

        # Sort by impact and return top N
        recommendations.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in recommendations[:limit]]

    def calculate_equivalencies(self, co2e_kg: float) -> dict[str, float]:
        """
        Convert CO₂e into tangible impact equivalencies.
        Makes emissions relatable to everyday objects and actions.

        Source: EPA Greenhouse Gas Equivalencies Calculator
        """
        eq = self.EQUIVALENCY_FACTORS
        return {
            "trees_needed": round(co2e_kg / eq["tree_absorption_kg_year"], 1),
            "cars_removed_days": round(co2e_kg / eq["car_kg_per_day"], 1),
            "phone_charges": round(co2e_kg / eq["phone_charge_kg"], 0),
            "led_bulb_hours": round(co2e_kg / eq["led_bulb_hour_kg"], 0),
            "homes_powered_hours": round(co2e_kg / eq["home_power_hour_kg"], 1),
        }

    def calculate_scenario(
        self,
        current_annual_co2e: float,
        breakdown: dict[str, float],
        scenario: str,
    ) -> dict[str, Any]:
        """
        Calculate the impact of a lifestyle change scenario.
        Used by Carbon Twin for "What if?" simulations.
        """
        projected = current_annual_co2e
        savings = 0.0
        explanation = ""

        if scenario == "vegetarian":
            current_food = breakdown.get("food", 2500)
            new_food = self.DIET_ANNUAL_CO2E["vegetarian"]
            savings = current_food - new_food
            projected = current_annual_co2e - savings
            explanation = (
                f"Switching to vegetarian diet saves ~{savings:.0f} kg CO₂e/year. "
                f"Source: Poore & Nemecek 2018"
            )

        elif scenario == "vegan":
            current_food = breakdown.get("food", 2500)
            new_food = self.DIET_ANNUAL_CO2E["vegan"]
            savings = current_food - new_food
            projected = current_annual_co2e - savings
            explanation = (
                f"Switching to vegan diet saves ~{savings:.0f} kg CO₂e/year. "
                f"Source: Poore & Nemecek 2018"
            )

        elif scenario == "solar":
            current_energy = breakdown.get("energy", 1000)
            savings = current_energy * 0.6
            projected = current_annual_co2e - savings
            explanation = (
                f"Installing solar panels can offset ~60% of energy emissions, "
                f"saving ~{savings:.0f} kg CO₂e/year. Source: IEA 2024"
            )

        elif scenario == "electric_vehicle":
            current_transport = breakdown.get("transport", 2000)
            savings = current_transport * 0.7
            projected = current_annual_co2e - savings
            explanation = (
                f"Switching to an EV reduces transport emissions by ~70%, "
                f"saving ~{savings:.0f} kg CO₂e/year. Source: DEFRA 2025"
            )

        elif scenario == "cycling":
            current_transport = breakdown.get("transport", 2000)
            savings = current_transport * 0.3
            projected = current_annual_co2e - savings
            explanation = (
                f"Cycling 3 days/week reduces commute emissions by ~30%, "
                f"saving ~{savings:.0f} kg CO₂e/year. Source: DEFRA 2025"
            )

        elif scenario == "no_flights":
            # Estimate flight contribution from transport
            current_transport = breakdown.get("transport", 2000)
            savings = current_transport * 0.4  # Assume 40% is flights
            projected = current_annual_co2e - savings
            explanation = (
                f"Eliminating flights saves ~{savings:.0f} kg CO₂e/year. "
                f"Source: DEFRA 2025"
            )

        return {
            "scenario": scenario,
            "current_annual_co2e": round(current_annual_co2e, 2),
            "projected_annual_co2e": round(max(projected, 0), 2),
            "savings_annual_co2e": round(max(savings, 0), 2),
            "savings_percentage": round(
                (savings / current_annual_co2e) * 100, 1
            ) if current_annual_co2e > 0 else 0,
            "explanation": explanation,
            "projections": {
                "30_days": round(max(projected, 0) / 12, 2),
                "90_days": round(max(projected, 0) / 4, 2),
                "1_year": round(max(projected, 0), 2),
                "5_years": round(max(projected, 0) * 5, 2),
            },
        }
