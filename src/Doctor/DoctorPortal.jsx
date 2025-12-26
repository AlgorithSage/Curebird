import React, { useState } from 'react';
import DoctorAuth from './DoctorAuth';
import DoctorDashboard from './DoctorDashboard';

export default function DoctorPortal({ user }) {
    const [view, setView] = useState('login'); // 'login' | 'signup'

    // If user is logged in as doctor, show dashboard
    if (user) {
        return <DoctorDashboard user={user} />;
    }

    return (
        <DoctorAuth />
    );
}
