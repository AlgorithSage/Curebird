import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const RecordsChart = ({ data }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-8 rounded-3xl relative overflow-hidden group"
    >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-400/15 transition-colors duration-500"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
            <h3 className="text-2xl font-black text-white tracking-tight text-center drop-shadow-lg">
                Records Overview
            </h3>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mt-3 rounded-full"></div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis
                    allowDecimals={false}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(10, 10, 10, 0.9)',
                        borderColor: 'rgba(234, 179, 8, 0.3)',
                        color: '#fff',
                        borderRadius: '1rem',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                    }}
                    cursor={{ fill: 'rgba(234, 179, 8, 0.1)', radius: 4 }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-slate-300 font-bold ml-1 text-sm">{value}</span>}
                />
                <Bar
                    dataKey="count"
                    fill="#f59e0b"
                    name="Total Records"
                    barSize={40}
                    radius={[8, 8, 8, 8]}
                />
            </BarChart>
        </ResponsiveContainer>
    </motion.div>
);

export default RecordsChart;
