import React, { useState } from 'react';
import DoctorAuth from './DoctorAuth';
import DoctorDashboard from './DoctorDashboard';

export default function DoctorPortal({ user, isNewDoctor }) {


    // If user is logged in as doctor and verified, show dashboard
    if (user && !isNewDoctor) {
        return <DoctorDashboard user={user} />;
    }

    // Otherwise show Auth (Login or Profile Setup if isNewDoctor)
    return (
        <DoctorAuth initialUser={isNewDoctor ? user : null} />
    );
}
