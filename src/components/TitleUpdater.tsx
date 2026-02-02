import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let pageName = '';

        if (path === '/') {
            pageName = 'Home';
        } else if (path === '/login') {
            pageName = 'Login';
        } else if (path === '/signup') {
            pageName = 'Sign Up';
        } else if (path === '/forgot-password') {
            pageName = 'Forgot Password';
        } else if (path === '/reset-password') {
            pageName = 'Reset Password';
        } else if (path === '/onboarding') {
            pageName = 'Onboarding';
        } else if (path.startsWith('/dashboard')) {
            if (path === '/dashboard') pageName = 'Dashboard';
            else if (path.includes('courses')) pageName = 'Courses';
            else if (path.includes('assignments')) pageName = 'Assignments';
            else if (path.includes('questionnaires')) pageName = 'Questionnaires';
            else if (path.includes('premium')) pageName = 'Premium';
            else if (path.includes('profile')) pageName = 'Profile';
            else pageName = 'Dashboard';
        } else if (path.startsWith('/admin')) {
            if (path === '/admin/dashboard') pageName = 'Admin Dashboard';
            else if (path.includes('courses')) pageName = 'Admin Courses';
            else if (path.includes('assignments')) pageName = 'Admin Assignments';
            else if (path.includes('questionnaires')) pageName = 'Admin Questionnaires';
            else if (path.includes('premium')) pageName = 'Admin Premium';
            else pageName = 'Admin';
        } else {
            const segments = path.split('/').filter(Boolean);
            if (segments.length > 0) {
                pageName = segments[segments.length - 1]
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        }

        document.title = `Kaze For Developer ${pageName ? `| ${pageName}` : ''}`;
    }, [location]);

    return null;
};

export default TitleUpdater;
