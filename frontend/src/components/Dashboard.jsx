import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

function Dashboard({ data }) {
  if (!data) return null;

  const formatEuro = (valor) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);

  const formatAxis = (valor) => new Intl.NumberFormat("de-DE").format(valor);

  const cashflows = Array.isArray(data.cashflows) ? data.cashflows : [];

  const cashflowData = cashflows.map((value, index) => ({
    year: index,
    value,
  }));

  const cumulative = [];
  cashflows.reduce((acc, val, i) => {
    acc += val;
    cumulative.push({ year: i, value: acc });
    return acc;
  }, 0);

  const years = cashflowData.map((d) => d.year);
  const maxYear = years.length ? Math.max(...years) : 0;
  const xTicks = Array.from({ length: maxYear + 1 }, (_, i) => i);

  return (
    <div className="card p-4 mt-4 w-100 overflow-hidden">
      <h4>📊 Finanzübersicht</h4>

      <div className="row text-center mb-4">
        <div className="col">
          <h6>NPV</h6>
          <h4 className="text-success">{formatEuro(data.npv)} €</h4>
        </div>
        <div className="col">
          <h6>IRR</h6>
          <h4 className="text-primary">
            {typeof data.irr === "string" ? data.irr.replace(".", ",") : data.irr} %
          </h4>
        </div>
      </div>

      <h6>Cashflow pro Jahr</h6>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cashflowData}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, maxYear]}
              ticks={xTicks}
              tickMargin={10}
              allowDuplicatedCategory={false}
            />
            <YAxis tickFormatter={formatAxis} width={70} />
            <Tooltip formatter={(value) => [formatEuro(value) + " €", "Value"]} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h6 className="mt-4">Cashflow kumuliert</h6>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cumulative}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, maxYear]}
              ticks={xTicks}
              tickMargin={10}
              allowDuplicatedCategory={false}
            />
            <YAxis tickFormatter={formatAxis} width={70} />
            <Tooltip formatter={(value) => [formatEuro(value) + " €", "Cumulative"]} />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={{ r: 3 }} />

            {data.payback !== undefined && data.payback !== null && (
              <ReferenceLine
                x={Number(data.payback)}
                stroke="red"
                label={{ position: "top", value: "Payback", fill: "red", fontSize: 12 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;