# CureStat: Data Sources & API Handling

This document audits the data sources, API integrations, and research methodologies used in the CureStat dashboard.

## 1. Live API Integrations

| Component | Functionality | API Provider | Endpoint/Details | Data Used | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EnvironmentalHealth.js** | Air Quality | WAQI (World Air Quality Index) | `api.waqi.info/feed` | Real-time PM2.5, PM10, AQI | Active |
| **CureStat.js** (HeatmapModal) | Disease Heatmap | Google Maps JS API | `google.maps.visualization` | Geolocation coordinates | Active |

## 2. Static Data Sources (Research - Based)

| Component | Primary Data File | Source / Authority | Key Metrics/Insights |
| :--- | :--- | :--- | :--- |
| **Main Dashboard** (CureStat.js) | `india_epidemiology_data.json` | **IDSP**, **NTEP**, **NCVBDC**, **ICMR-INDIAB**, **GBD Study**, **NMHS Survey** | Disease trends, prevalence rates, cardiac metrics, mental health indices. |
| **Occupational Health** | Internal `PROFESSION_DATABASE` | **OSH Guidelines** (Standard Occupational Safety & Health) | 100+ professions mapped to clinical occupational hazards. |
| **Social Determinants** | `SocialDeterminants.js` (constants) | **NFHS-5** (National Family Health Survey 2019-21), **NHA** | Housing/fuel correlations, nutrition data, pharmaceutical market share. |
| **Rare Diseases** | `RareDisease.js` (constants) | **ORDI**, **ICMR** | "The Data Gap" (Estimated vs. Registered cases). |
| **State Health Profile** | `state_disease_burden.js` | **India State-Level Disease Burden Initiative** (ICMR, PHFI) | State-specific disease prevalence and risk factors. |

## 3. Methodologies & Calculations

| Metric Name | Component | Source | Logic / Formula |
| :--- | :--- | :--- | :--- |
| **Cigarette Equivalent** | Environmental Health | Berkeley Earth | 22 µg/m³ PM2.5 ≈ 1 Cigarette/day |
| **Actuarial Life Loss** | Environmental Health | AQLI | Estimates life expectancy reduction based on PM2.5 exposure. |
| **Surveillance-Weighted Distribution** | CureStat Regional | Simulation Algorithm | Distributes national totals to states based on infrastructure "Reporting Weights". |
