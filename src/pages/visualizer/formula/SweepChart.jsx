import { evaluate } from 'mathjs'
import OptimizedChart from '../../../components/OptimizedChart'

const POINTS = 80

export default function SweepChart({ formula, vars, sweepVar, onSweepVarChange }) {
  const varNames = Object.keys(vars)

  if (
    !formula ||
    varNames.length === 0 ||
    !vars[sweepVar] ||
    typeof vars[sweepVar].min !== 'number' ||
    typeof vars[sweepVar].max !== 'number'
  ) return null

  const { min, max } = vars[sweepVar]

  let data = []
  let sweepError = null

  try {
    const range = max - min
    for (let i = 0; i <= POINTS; i++) {
      const x = min + (range * i) / POINTS
      const scope = {}
      for (const [k, cfg] of Object.entries(vars)) scope[k] = k === sweepVar ? x : cfg.value
      const y = evaluate(formula, scope)
      if (typeof y === 'number' && isFinite(y)) {
        data.push([parseFloat(x.toFixed(4)), parseFloat(y.toFixed(6))])
      }
    }
  } catch (e) {
    sweepError = e.message
  }

  const option = {
    grid: { top: 8, right: 16, bottom: 36, left: 56 },
    xAxis: {
      type: 'value',
      name: sweepVar,
      nameLocation: 'end',
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderRadius: 6,
      textStyle: { fontSize: 12, color: '#e5e7eb' },
      formatter: params => {
        const p = params[0]
        return `${sweepVar} = ${p.data[0]}<br/>result = ${p.data[1]}`
      },
    },
    series: [{
      type: 'line',
      data,
      smooth: false,
      lineStyle: { color: '#6366f1', width: 2 },
      symbol: 'none',
    }],
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-400">Sweep variable</span>
        <select
          value={sweepVar}
          onChange={e => onSweepVarChange(e.target.value)}
          className="text-sm bg-gray-800 text-gray-300 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500"
        >
          {varNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {sweepError ? (
        <p className="text-xs text-red-400">{sweepError}</p>
      ) : data.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No plottable data.</p>
      ) : (
        <OptimizedChart option={option} style={{ height: 220 }} />
      )}
    </div>
  )
}
