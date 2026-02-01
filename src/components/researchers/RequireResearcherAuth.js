import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingScreen from '../LoadingScreen';

const RequireResearcherAuth = ({ user }) => {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, true = auth, false = denied

    useEffect(() => {
        const checkRole = async () => {
            if (!user) {
                setIsAuthorized(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    // Check if role includes researcher or admin
                    if (data.role === 'researcher' || data.role === 'admin') {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Role Check Error:", error);
                setIsAuthorized(false);
            }
        };

        checkRole();
    }, [user]);

    if (isAuthorized === null) {
        return <LoadingScreen />;
    }

    if (!isAuthorized) {
        return <Navigate to="/research/login" replace />;
    }

    return <Outlet />; // Render child routes (Layout, DataExplorer, etc.)
};

export default RequireResearcherAuth;
