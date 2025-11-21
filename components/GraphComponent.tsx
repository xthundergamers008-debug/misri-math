import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GraphComponentProps {
  expression: string; // JavaScript syntax expected, e.g. "x*x"
}

const GraphComponent: React.FC<GraphComponentProps> = ({ expression }) => {
  const data = useMemo(() => {
    if (!expression) return [];

    const points = [];
    // Generate points from -10 to 10
    for (let x = -10; x <= 10; x += 0.5) {
      try {
        // Safe evaluation of a math expression with 'x' variable
        // Note: In a real production app, use a math parser library like mathjs to avoid `new Function`
        // For this demo, we assume the AI outputs safe simple JS Math expressions (e.g. Math.sin(x))
        // eslint-disable-next-line no-new-func
        const func = new Function('x', `return ${expression}`);
        const y = func(x);
        if (!isNaN(y) && isFinite(y)) {
            points.push({ x, y });
        }
      } catch (e) {
        console.error("Failed to evaluate graph expression", e);
        return [];
      }
    }
    return points;
  }, [expression]);

  if (data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-white rounded-lg p-2 mt-4">
      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Graph Visualization</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['auto', 'auto']} 
            allowDataOverflow={false}
            tick={{fontSize: 12}}
          />
          <YAxis 
            allowDataOverflow={false}
            tick={{fontSize: 12}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1A1A', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#999' }}
          />
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#6200EE" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphComponent;
