import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../NavigationBar/NavigationBar';
import './NBADraftLayout.css';

interface NBADraftLayoutProps {
  children: React.ReactNode;
}

const NBADraftLayout: React.FC<NBADraftLayoutProps> = ({ children }) => {
  return (
    <div className="nba-draft-layout">
      <NavigationBar />
      <main>{children}</main>
    </div>
  );
};

export default NBADraftLayout; 