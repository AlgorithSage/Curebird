import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Download, ShieldCheck, Hash, Clock, ArrowRight } from '../Icons';
import { API_BASE_URL } from '../../config';

export default function ModelRepository() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/v1/models`)
            .then(res => res.json())
            .then(data => {
                setModels(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2">Model Repository</h1>
                    <p className="text-slate-400">Access pre-trained medical AI models for research.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model, i) => (
                    <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 backdrop-blur-xl animated-border rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all group relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
                                <Layers size={24} weight="duotone" />
                            </div>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono font-bold text-slate-400 border border-white/5">
                                v{model.version}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">{model.name}</h3>
                        <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">{model.description}</p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            <Badge icon={ShieldCheck} color="emerald">{model.accuracy} Acc</Badge>
                            <Badge icon={Hash} color="zinc">{model.framework}</Badge>
                            <Badge icon={Clock} color="amber">Real-time</Badge>
                        </div>

                        <button className="w-full py-3 bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 hover:border-amber-500/50 text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn">
                            Download Weights <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {models.length === 0 && !loading && (
                <div className="text-center py-20 text-slate-500">
                    No models found.
                </div>
            )}
        </div>
    );
}

const Badge = ({ icon: Icon, color, children }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        zinc: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${colors[color]}`}>
            <Icon size={12} weight="fill" /> {children}
        </span>
    );
};
