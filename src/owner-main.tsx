import React from 'react';
import { createRoot } from 'react-dom/client';
import OwnerApp from './owner/OwnerApp';
import './index.css';

createRoot(document.getElementById('owner-root')!).render(<OwnerApp />);
