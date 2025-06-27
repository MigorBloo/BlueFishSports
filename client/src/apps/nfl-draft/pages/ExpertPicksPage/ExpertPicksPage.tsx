import React from 'react';
import ExpertPicks from '../../components/ExpertPicks/ExpertPicks';
import Top200Prospects from '../../components/Prospects/Top200Prospects';
import NflDraftLayout from '../../components/NflDraftLayout/NflDraftLayout';
import './ExpertPicksPage.css';

const ExpertPicksPage: React.FC = () => {
  return (
    <NflDraftLayout>
      <div className="expert-picks-page">
        <h1 className="page-header">
          Top Prospects & Expert Picks
        </h1>
        
        <div className="content-grid">
          <div className="prospects-section">
            <h2 className="section-title">
              Top 200 Prospects
            </h2>
            <div className="section-content">
              <Top200Prospects />
            </div>
          </div>
          
          <div className="expert-picks-section">
            <h2 className="section-title">
              Expert Picks
            </h2>
            <div className="section-content">
              <ExpertPicks />
            </div>
          </div>
        </div>
      </div>
    </NflDraftLayout>
  );
};

export default ExpertPicksPage; 