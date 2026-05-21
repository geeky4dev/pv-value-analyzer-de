import requests
import json

URL = "http://localhost:5001/ertragswert"

test_inputs = [
    # 1. Volleinspeisung
    {
        "betriebsmodell": "Volleinspeisung",
        "anlagengroesse": 30,
        "spezifischer_ertrag": 950,
        "restlaufzeit": 25,
        "strompreis": 0.3,
        "eigenverbrauch_anteil": 0.0,
        "einspeiseverguetung": 0.08,
        "performance_ratio": 80,
        "degradacion_anual": 0.5,
        "opex_anual": 500
    },
    # 2. Eigenverbrauch
    {
        "betriebsmodell": "Eigenverbrauch",
        "anlagengroesse": 20,
        "spezifischer_ertrag": 950,
        "restlaufzeit": 25,
        "strompreis": 0.3,
        "eigenverbrauch_anteil": 0.6,
        "einspeiseverguetung": 0.08,
        "performance_ratio": 80,
        "degradacion_anual": 0.5,
        "opex_anual": 500
    },
    # 3. Mieterstrom
    {
        "betriebsmodell": "Mieterstrom",
        "anlagengroesse": 30,
        "spezifischer_ertrag": 950,
        "restlaufzeit": 25,
        "strompreis": 0.25,  # se ignorará en favor de Auto-Vergütung
        "eigenverbrauch_anteil": 0.5,
        "einspeiseverguetung": 0.08,  # se ignorará
        "performance_ratio": 80,
        "degradacion_anual": 0.5,
        "opex_anual": 500
    },
    # 4. Direktvermarktung
    {
        "betriebsmodell": "Direktvermarktung",
        "anlagengroesse": 50,
        "spezifischer_ertrag": 950,
        "restlaufzeit": 25,
        "strompreis": 0.3,  # se ignorará
        "eigenverbrauch_anteil": 0.0,
        "einspeiseverguetung": 0.08,  # se ignorará
        "performance_ratio": 80,
        "degradacion_anual": 0.5,
        "opex_anual": 1000
    },
    # 5. Voll Eigenverbrauch con Batería (simulado)
    {
        "betriebsmodell": "Eigenverbrauch",
        "anlagengroesse": 15,
        "spezifischer_ertrag": 950,
        "restlaufzeit": 25,
        "strompreis": 0.3,
        "eigenverbrauch_anteil": 0.8,
        "einspeiseverguetung": 0.08,
        "performance_ratio": 80,
        "degradacion_anual": 0.5,
        "opex_anual": 500
    }
]

for i, input_data in enumerate(test_inputs, 1):
    print(f"\n=== Test {i}: {input_data['betriebsmodell']} ===")
    try:
        response = requests.post(URL, json=input_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=4))
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")
