import React from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';



const COLORS = ['#CDCCAB', '#F08758', '#988792', '#988792'];
                 
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index,label }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {label}:{`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Chart = (props) => {
    const {emotions}=props;
    const data = [
        { name: 'Positive', value: emotions.pos },
        { name: 'Negative', value: emotions.neg },
        { name: 'Neutral', value: emotions.neu },
      ];
  return (
    <ResponsiveContainer width="100%" height="100%">
    <div>
    
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} label={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      </div>
    </ResponsiveContainer>
  );
}

export default Chart;
