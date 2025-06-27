import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../NavigationBar/NavigationBar';
import EventInfo from '../EventInfo/EventInfo';
import './NflDraftLayout.css';

interface NflDraftLayoutProps {
  children: React.ReactNode;
}

const NflDraftLayout: React.FC<NflDraftLayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <NavigationBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default NflDraftLayout; 