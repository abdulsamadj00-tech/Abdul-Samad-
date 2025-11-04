
import React from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen } from '../../hooks/useMemoryMaster';

const StatsCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <Card className="text-center">
        <h3 className="text-lg font-semibold text-subtle-light dark:text-subtle-dark">{title}</h3>
        <p className="text-4xl font-bold text-primary-light dark:text-primary-dark my-2">{value}</p>
        <p className="text-sm text-subtle-light dark:text-subtle-dark">{description}</p>
    </Card>
);

const AnalyticsScreen: React.FC = () => {
    const { stats, flashcards, setCurrentScreen } = useMemoryMasterContext();
    const { theme } = useTheme();
    const chartColor = theme === 'dark' ? '#6366f1' : '#4f46e5';
    
    const weakCards = flashcards.filter(c => c.performance === 'hard');

    if (flashcards.length === 0) {
        return <div className="text-center">No analytics to show. Complete a recall session to see your progress.</div>;
    }

    const chartData = stats.progressHistory.map(record => ({
        name: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Correct: record.correct,
        Incorrect: record.incorrect
    }));

    const badges = [
        { name: 'Quick Learner', earned: stats.progressHistory.length > 0 && stats.progressHistory[0].correct >= 5, description: "Answer 5 cards correctly in one session." },
        { name: 'Persistent', earned: stats.streak >= 10, description: "Get a streak of 10 correct answers." },
        { name: 'Master', earned: (stats.topicsMastered === flashcards.length) && flashcards.length > 0, description: "Master all cards in the deck." },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">Your Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Recall Strength" value={`${stats.recallStrength}%`} description="Overall correct answer rate." />
                <StatsCard title="Topics Mastered" value={`${stats.topicsMastered}/${flashcards.length}`} description="Cards marked 'Good' or 'Easy'." />
                <StatsCard title="Current Streak" value={stats.streak} description="Consecutive correct answers." />
            </div>

            <Card>
                <h2 className="text-2xl font-semibold mb-4">Retention Curve</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} />
                        <XAxis dataKey="name" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                        <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Correct" stroke={chartColor} strokeWidth={2} />
                        <Line type="monotone" dataKey="Incorrect" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            
            {weakCards.length > 0 && (
                <Card>
                    <h2 className="text-2xl font-semibold mb-4">Weak Areas</h2>
                    <p className="text-subtle-light dark:text-subtle-dark mb-4">Focus on these topics. Click a card to start a targeted recall session.</p>
                    <div className="space-y-2">
                        {weakCards.map(card => (
                            <div key={card.id} className="p-3 bg-background-light dark:bg-background-dark rounded-md">
                                <p className="font-semibold">{card.question}</p>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => setCurrentScreen(Screen.Recall)} className="w-full mt-4 py-2 bg-secondary-light dark:bg-secondary-dark text-white font-semibold rounded-lg">
                        Review Weak Cards Now
                    </button>
                </Card>
            )}

            <Card>
                 <h2 className="text-2xl font-semibold mb-4">Badges</h2>
                 <div className="flex space-x-4 overflow-x-auto pb-2">
                    {badges.map(badge => (
                        <div key={badge.name} className={`flex-shrink-0 w-32 flex flex-col items-center p-4 rounded-lg border-2 ${badge.earned ? 'border-secondary-light dark:border-secondary-dark' : 'border-gray-200 dark:border-gray-600'} ${!badge.earned && 'opacity-50'}`}>
                           <span className="text-4xl">{badge.earned ? '🏆' : '🔒'}</span>
                           <h4 className="font-semibold mt-2 text-center">{badge.name}</h4>
                           <p className="text-xs text-center text-subtle-light dark:text-subtle-dark">{badge.description}</p>
                        </div>
                    ))}
                 </div>
            </Card>

        </div>
    );
};

export default AnalyticsScreen;
