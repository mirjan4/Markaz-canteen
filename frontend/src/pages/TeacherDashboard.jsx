import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const getYYYYMMDD = (d) => {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
}

const formatDateDisplay = (dateObj) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];

    // Format: dd/mm/yy
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yy = String(dateObj.getFullYear()).slice(-2);

    return `${dayName} (${dd}/${mm}/${yy})`;
}

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('today');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);

    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const todayStr = getYYYYMMDD(todayDate);
    const tomorrowStr = getYYYYMMDD(tomorrowDate);

    const todayDisplay = formatDateDisplay(todayDate);
    const tomorrowDisplay = formatDateDisplay(tomorrowDate);

    const [meals, setMeals] = useState({
        [todayStr]: { breakfast: false, lunch: false, dinner: false },
        [tomorrowStr]: { breakfast: false, lunch: false, dinner: false }
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadMeals();
    }, []);

    const loadMeals = async () => {
        try {
            const res = await api.get(`meal_entry.php?user_id=${user.id}`);
            if (Array.isArray(res.data)) {
                const newMeals = { ...meals };
                res.data.forEach(m => {
                    if (newMeals[m.date]) {
                        newMeals[m.date] = {
                            breakfast: m.breakfast == 1,
                            lunch: m.lunch == 1,
                            dinner: m.dinner == 1
                        };
                    }
                });
                setMeals(newMeals);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`user_history.php?user_id=${user.id}`);
            setHistoryData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const currentKey = activeTab === 'today' ? todayStr : tomorrowStr;
    const currentMeal = meals[currentKey] || { breakfast: false, lunch: false, dinner: false };

    const toggle = (type) => {
        setMeals(prev => ({
            ...prev,
            [currentKey]: {
                ...prev[currentKey],
                [type]: !prev[currentKey][type]
            }
        }));
    };

    const save = async () => {
        setLoading(true);
        setMsg('');
        try {
            const payload = {
                user_id: user.id,
                date: currentKey,
                ...currentMeal
            };
            const res = await api.post('meal_entry.php', payload);
            if (res.data.success) {
                setMsg('Saved successfully!');
                setTimeout(() => setMsg(''), 2000);
            } else {
                setMsg(res.data.message || 'Failed to save');
            }
        } catch (err) {
            setMsg('Error saving');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div>
            <nav className="navbar" style={{ position: 'relative', zIndex: 500 }}>
                <div className="nav-brand">Canteen App</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                    <div
                        className="nav-user"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, userSelect: 'none' }}
                    >
                        Hi, {user?.name} ▾
                    </div>
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={() => { setActiveTab('history'); setDropdownOpen(false); }}>
                                History
                            </div>
                            <div className="dropdown-item" onClick={() => { setActiveTab('today'); setDropdownOpen(false); }}>
                                Select Meals
                            </div>
                            <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                            <div className="dropdown-item danger" onClick={logout}>
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            <div className="container" style={{ marginTop: '2rem' }}>
                <h1 className="title">Select Meals</h1>
                <p className="subtitle">Let us know when you'll be eating.</p>

                <div className="tabs">
                    <div
                        className={`tab ${activeTab === 'today' ? 'active' : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        {todayDisplay}
                    </div>
                    <div
                        className={`tab ${activeTab === 'tomorrow' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tomorrow')}
                    >
                        {tomorrowDisplay}
                    </div>
                </div>

                {activeTab === 'history' ? (
                    <div className="card">
                        <h2 className="title">My Meal History (7 Days)</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Break.</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Lunch</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Dinner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((day, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '0.5rem' }}>{formatDateDisplay(new Date(day.date))}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{day.meals.breakfast == 1 ? '✅' : '-'}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{day.meals.lunch == 1 ? '✅' : '-'}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{day.meals.dinner == 1 ? '✅' : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setActiveTab('today')}>Back to Selection</button>
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        {msg && <div style={{ color: msg.includes('Fail') ? 'red' : 'green', marginBottom: '1rem' }}>{msg}</div>}

                        {['Breakfast', 'Lunch', 'Dinner'].map(type => {
                            const key = type.toLowerCase();
                            const isActive = currentMeal[key];
                            return (
                                <div key={type} className="meal-selector">
                                    <span style={{ fontWeight: 500 }}>{type}</span>
                                    <div className="toggle-group">
                                        <button
                                            className={`toggle-btn no ${!isActive ? 'active' : ''}`}
                                            onClick={() => isActive && toggle(key)}
                                        >
                                            No
                                        </button>
                                        <button
                                            className={`toggle-btn yes ${isActive ? 'active' : ''}`}
                                            onClick={() => !isActive && toggle(key)}
                                        >
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div style={{ marginTop: '2rem' }}>
                            <button className="btn btn-primary" onClick={save} disabled={loading}>
                                {loading ? 'Saving...' : 'Submit Selection'}
                            </button>
                            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', textAlign: 'center' }}>
                                Make sure to submit for both days if needed.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
