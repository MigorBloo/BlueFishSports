import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import ActualResult from '../../components/ActualResult/ActualResult';
import './ActualResultsPage.css';
import { TotalPointsProvider } from '../../contexts/TotalPointsContext';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const ActualResultsPage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const { user } = useAuth();
  
  // Only show username in title if viewing another user's results
  const pageTitle = username && username !== user?.username ? `${username} Actual Results` : 'Actual Results';
  
  return (
    <TotalPointsProvider>
      <div className="actual-results-page">
        <NavigationBar />
        <div className="actual-results-content">
          <h1 className="page-header">{pageTitle}</h1>
          <ActualResult username={username} />
        </div>
      </div>
    </TotalPointsProvider>
  );
};

export default ActualResultsPage;