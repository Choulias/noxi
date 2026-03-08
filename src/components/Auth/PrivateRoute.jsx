import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from './useUser';

export const PrivateRoute = () => {
    const user = useUser(); // determine if authorized, from context or however you're doing it

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return user ? <Outlet /> : <Navigate to="/login" />;
}