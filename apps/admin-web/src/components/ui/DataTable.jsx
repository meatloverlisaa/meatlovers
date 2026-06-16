import React from 'react'

export default function DataTable({ columns, rows }) {
  if (!rows || rows.length === 0) {
    return <div className="no-data">No data available</div>
  }
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {columns.map(col => (
                <td key={col.key}>{row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}