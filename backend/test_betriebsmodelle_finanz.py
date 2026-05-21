# test_betriebsmodelle_finanz.py
import requests
import json
import numpy_financial as npf  # ✅ Para NPV e IRR

BASE_URL = "http://localhost:5001"

# ------------------ INPUTS DE PRUEBA ------------------
tests = [
    {
        "name": "Volleinspeisung",
        "data": {
            "anlagengroesse": 30,
            "spezifischer_ertrag": 760,
            "restlaufzeit": 25,
            "betriebsmodell": "Volleinspeisung",
            "strompreis": 0.0,
            "eigenverbrauch_anteil": 0.0,
            "einspeiseverguetung": 0.08,
            "performance_ratio": 80,
            "degradacion_anual": 0.5,
            "opex_anual": 500,
        }
    },
    {
        "name": "Eigenverbrauch",
        "data": {
            "anlagengroesse": 20,
            "spezifischer_ertrag": 760,
            "restlaufzeit": 25,
            "betriebsmodell": "Eigenverbrauch",
            "strompreis": 0.3,
            "eigenverbrauch_anteil": 0.7,
            "einspeiseverguetung": 0.08,
            "performance_ratio": 80,
            "degradacion_anual": 0.5,
            "opex_anual": 500,
        }
    },
    {
        "name": "Mieterstrom",
        "data": {
            "anlagengroesse": 30,
            "spezifischer_ertrag": 760,
            "restlaufzeit": 25,
            "betriebsmodell": "Mieterstrom",
            "strompreis": 0.25,
            "eigenverbrauch_anteil": 0.5,
            "einspeiseverguetung": 0.195,
            "performance_ratio": 80,
            "degradacion_anual": 0.5,
            "opex_anual": 500,
        }
    },
    {
        "name": "Direktvermarktung",
        "data": {
            "anlagengroesse": 50,
            "spezifischer_ertrag": 760,
            "restlaufzeit": 25,
            "betriebsmodell": "Direktvermarktung",
            "strompreis": 0.3,
            "eigenverbrauch_anteil": 0.0,
            "einspeiseverguetung": 0.05,
            "performance_ratio": 80,
            "degradacion_anual": 0.5,
            "opex_anual": 1000,
        }
    },
    {
        "name": "Eigenverbrauch + Batterie",
        "data": {
            "anlagengroesse": 15,
            "spezifischer_ertrag": 760,
            "restlaufzeit": 25,
            "betriebsmodell": "Eigenverbrauch",
            "strompreis": 0.3,
            "eigenverbrauch_anteil": 0.8,
            "einspeiseverguetung": 0.08,
            "performance_ratio": 80,
            "degradacion_anual": 0.5,
            "opex_anual": 500,
        }
    },
]

# ------------------ FUNCIÓN DE PRUEBA ------------------
def test_model(test):
    name = test["name"]
    data = test["data"]

    # Llamada a ertragswert
    r = requests.post(f"{BASE_URL}/ertragswert", json=data)
    if r.status_code != 200:
        print(f"=== Test: {name} ===")
        print("Error en backend:", r.text)
        return

    result = r.json()
    jahresproduktion = result["jahresproduktion_kwh"]
    ertragswert_total = result["ertragswert"]
    ertragswert_pro_jahr = result["ertragswert_pro_jahr"]
    opex = result["opex_anual"]

    # Crear flujos de caja (asumiendo inversión inicial negativa)
    initial_invest = -50000  # ejemplo
    cashflows = [initial_invest] + [ertragswert_pro_jahr] * int(data["restlaufzeit"])

    # NPV e IRR con numpy_financial
    try:
        npv = npf.npv(0.05, cashflows)
        npv = round(npv, 2)
    except:
        npv = "error"

    try:
        irr = npf.irr(cashflows)
        irr = round(irr * 100, 2) if irr is not None else "error"
    except:
        irr = "error"

    print(f"\n=== Test: {name} ===")
    print(f"Ertragswert total: {round(ertragswert_total,2)} €")
    print(f"Ertragswert/Jahr: {round(ertragswert_pro_jahr,2)} €")
    print(f"Cashflow Año 1: {round(cashflows[1],2)} €")
    print(f"NPV: {npv} €")
    print(f"IRR: {irr} %")


# ------------------ EJECUCIÓN ------------------
if __name__ == "__main__":
    for test in tests:
        test_model(test)


