import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from './useUser';

export const AdminRoute = () => {
    const user = useUser(); // Determine si autorisations nécessaire, avec l'appel UseUser()

    // Si autorisation (Role utilisateur = Admin), mène vers les composants enfants ( Page Administration )
    // Sinon, return qui va mener versla page 404
    return  user && user.role === "admin" ? <Outlet /> : <Navigate to="/404" />;
}