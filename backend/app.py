from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from fpdf import FPDF
import os
import uuid

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)
FONT_DIR = BASE_DIR

@app.route("/", methods=["GET"])
def index():
    return "PV Wertgutachten Backend läuft!"

@app.route("/test", methods=["GET"])
def test():
    return jsonify({"status": "ok", "message": "Backend läuft"})

@app.route("/buchwert", methods=["POST"])
def buchwert():
    data = request.json
    anschaffung = float(data["anschaffungskosten"])
    alter = float(data["alter"])
    abschreibung = anschaffung / 20 * alter
    bw = anschaffung - abschreibung
    return jsonify({
        "abschreibung": round(abschreibung, 2),
        "buchwert": round(bw, 2)
    })

@app.route("/ertragswert", methods=["POST"])
def ertragswert():
    data = request.json
    kwp = float(data["anlagengroesse"])
    se = float(data["spezifischer_ertrag"])
    v = float(data["einspeiseverguetung"])
    rl = float(data["restlaufzeit"])
    
    betriebsmodell = data.get('betriebsmodell', 'volleinspeisung')
    
    jahresertrag = kwp * se * v / 100
    ertragswert = jahresertrag * rl
    return jsonify({
        "jahresertrag": round(jahresertrag, 2),
        "ertragswert": round(ertragswert, 2),
        "betriebsmodell": betriebsmodell  # ✅ RECIBE DEL FRONTEND
    })

@app.route("/restwert", methods=["POST"])
def restwert():
    data = request.json
    ew = float(data["ertragswert"])
    kostenabschlag = float(data["kostenabschlag"])
    verkaufsabschlag = float(data["verkaufsabschlag"])
    zukuenftige_gewinne = ew * (1 - kostenabschlag / 100)
    restwert = zukuenftige_gewinne * (verkaufsabschlag / 100)
    return jsonify({
        "zukuenftige_gewinne": round(zukuenftige_gewinne, 2),
        "restwert": round(restwert, 2)
    })

@app.route("/pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.json

        name = data.get("name", "Unbekannt")
        results = data.get("results", [])

        # 👉 Render: SOLO /tmp es escribible
        filename = f"Wertgutachten_PV_{uuid.uuid4().hex}.pdf"
        pdf_path = f"/tmp/{filename}"

        pdf = FPDF()
        pdf.add_page()

        # Fuentes Unicode
        pdf.add_font("DejaVu", "", os.path.join(FONT_DIR, "DejaVuSans.ttf"), uni=True)
        pdf.add_font("DejaVu", "B", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"), uni=True)

        # Título
        pdf.set_font("DejaVu", "B", 16)
        pdf.cell(0, 10, "Wertgutachten einer PV-Anlage", ln=True, align="C")
        pdf.ln(10)

        # Nombre
        pdf.set_font("DejaVu", "", 12)
        pdf.cell(0, 10, f"Name: {name}", ln=True)
        pdf.ln(5)

        # Resultados
        for section in results:
            pdf.set_font("DejaVu", "B", 12)
            pdf.cell(0, 8, section["title"], ln=True)
            pdf.set_font("DejaVu", "", 11)

            for line in section["values"]:
                pdf.multi_cell(0, 7, line)

            pdf.ln(4)

        pdf.output(pdf_path)

        return send_file(
            pdf_path,
            as_attachment=True,
            download_name="pv_wertgutachten.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        print("PDF ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)









