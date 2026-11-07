import React from 'react';
import { createRoot } from 'react-dom/client';
import StaffApp from './staff/StaffApp';
import './index.css';

createRoot(document.getElementById('staff-root')!).render(<StaffApp />);
