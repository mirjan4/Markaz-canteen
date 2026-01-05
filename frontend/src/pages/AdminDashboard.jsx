import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const formatDateDisplay = (dateStr) => {
    // Parse the date string (YYYY-MM-DD) manually to avoid timezone issues
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];

    // Format: dd/mm/yy
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yy = String(dateObj.getFullYear()).slice(-2);

    return `${dayName} (${dd}/${mm}/${yy})`;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('reports');

    // Reports State
    const [reportData, setReportData] = useState(null);
    const [modal, setModal] = useState(null);

    // Create User State
    const [newUser, setNewUser] = useState({ name: '', phone: '', password: '' });
    const [msg, setMsg] = useState('');

    const openMealModal = (day, meal, data) => {
        const users = data.details.filter(u => u[meal] == 1);
        setModal({
            title: `${day.charAt(0).toUpperCase() + day.slice(1)}'s ${meal.charAt(0).toUpperCase() + meal.slice(1)} (${users.length})`,
            users: users
        });
    };

    const closeModal = () => setModal(null);

    const printReport = (dayKey, dayData) => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Canteen Report - ${dayKey}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { margin-bottom: 20px; }
                    .counts { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${formatDateDisplay(dayData.date)}</h2>
                </div>
                <div class="counts">
                    <strong>Summary:</strong><br>
                    Breakfast: ${dayData.counts.breakfast_count}<br>
                    Lunch: ${dayData.counts.lunch_count}<br>
                    Dinner: ${dayData.counts.dinner_count}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th style="text-align:center">Breakfast</th>
                            <th style="text-align:center">Lunch</th>
                            <th style="text-align:center">Dinner</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dayData.details.map(row => `
                            <tr>
                                <td>${row.name}</td>
                                <td>${row.phone}</td>
                                <td style="text-align:center">${row.breakfast == 1 ? 'Yes' : '-'}</td>
                                <td style="text-align:center">${row.lunch == 1 ? 'Yes' : '-'}</td>
                                <td style="text-align:center">${row.dinner == 1 ? 'Yes' : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/login'); return; }
        if (activeTab === 'reports') fetchReport();
    }, [activeTab]);

    // ... (keep fetchReport, handleCreateUser, logout as is - no changes needed, just matching context) 
    const fetchReport = async () => {
        try {
            const res = await api.get('reports.php');
            setReportData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await api.post('admin_users.php', newUser);
            if (res.data.success) {
                setMsg('User created successfully!');
                setNewUser({ name: '', phone: '', password: '' });
            } else {
                setMsg(res.data.message || 'Error creating user');
            }
        } catch (err) {
            setMsg('Failed to create user');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div>
            {/* ... Navbar and Container ... */}
            <nav className="navbar">
                <div className="nav-brand">Canteen Admin</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="nav-user">{user?.name}</span>
                    <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
                </div>
            </nav>

            <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
                <div className="tabs">
                    <div
                        className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Meal Reports
                    </div>
                    <div
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Manage Teachers
                    </div>
                </div>

                {activeTab === 'reports' && reportData && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {['today', 'tomorrow'].map(dayKey => {
                            const dayData = reportData[dayKey];
                            if (!dayData) return null;
                            return (
                                <div className="card" key={dayKey}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 className="title" style={{ textTransform: 'capitalize', margin: 0 }}>
                                            {formatDateDisplay(dayData.date)}
                                        </h2>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => printReport(dayKey, dayData)}
                                        >
                                            Print
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', marginTop: '1rem' }}>
                                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                                            <div
                                                key={meal}
                                                className="badge"
                                                style={{
                                                    background: meal === 'breakfast' ? '#e0e7ff' : meal === 'lunch' ? '#fce7f3' : '#dcfce7',
                                                    color: meal === 'breakfast' ? '#4f46e5' : meal === 'lunch' ? '#db2777' : '#16a34a',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}
                                                onClick={() => openMealModal(dayKey, meal, dayData)}
                                                title={`Click to view who is having ${meal}`}
                                            >
                                                {meal.charAt(0).toUpperCase() + meal.slice(1)}: {dayData.counts[`${meal}_count`] || 0}
                                            </div>
                                        ))}
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                                <th style={{ padding: '0.5rem' }}>Name</th>
                                                <th style={{ padding: '0.5rem' }}>Phone</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>B</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>L</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>D</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayData.details.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '0.5rem' }}>{row.name}</td>
                                                    <td style={{ padding: '0.5rem', color: '#666' }}>{row.phone}</td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        {row.breakfast == 1 ? '✅' : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        {row.lunch == 1 ? '✅' : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        {row.dinner == 1 ? '✅' : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {dayData.details.length === 0 && (
                                                <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>No submissions yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="card">
                        <h2 className="title">Add New Teacher</h2>
                        {msg && <div style={{ marginBottom: '1rem', color: msg.includes('succ') ? 'green' : 'red' }}>{msg}</div>}
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label className="label">Full Name</label>
                                <input
                                    className="input"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Phone Number (Login ID)</label>
                                <input
                                    className="input"
                                    value={newUser.phone}
                                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Enter custom password"
                                    required
                                />
                            </div>
                            <button className="btn btn-primary" type="submit">Create Account</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={closeModal}>
                    <div
                        className="card"
                        style={{ width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto', margin: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>{modal.title}</h3>
                            <button className="btn btn-outline btn-sm" onClick={closeModal}>Close</button>
                        </div>

                        {modal.users.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {modal.users.map((u, i) => (
                                    <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.phone}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>
                                No one selected this meal.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
