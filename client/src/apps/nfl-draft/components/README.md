# NFL Draft Components

This directory contains all reusable UI components specific to the NFL Draft application.

## Component Structure

```
components/
├── NavigationBar/           # Navigation component
│   ├── NavigationBar.tsx
│   └── NavigationBar.css
├── ExpertPicks/            # Expert picks display component
│   ├── ExpertPicks.tsx
│   └── ExpertPicks.css
├── Top200Prospects/        # Prospects list component
│   ├── Top200Prospects.tsx
│   └── Top200Prospects.css
├── EventInfo/              # Event information display
│   ├── EventInfo.tsx
│   └── EventInfo.css
├── Leaderboard/            # Leaderboard display
│   ├── Leaderboard.tsx
│   └── Leaderboard.css
├── ActualResult/           # Actual draft results display
│   ├── ActualResult.tsx
│   └── ActualResult.css
├── UserSelections/         # User draft selections interface
│   ├── UserSelections.tsx
│   └── UserSelections.css
├── UserProfile/            # User profile display
│   ├── UserProfile.tsx
│   └── UserProfile.css
└── NflDraftLayout/         # Main layout component
    ├── NflDraftLayout.tsx
    └── NflDraftLayout.css
```

## Component Descriptions

### NavigationBar (on every page)
- Handles navigation between different sections of the NFL Draft app
- Includes links to the different pages which are the Welcome page, the Scoring page, the ExpertPicks/Prospects page, YourPicks/Selections page, ActualPicks/Results page, Leaderboard page, The Logout button as well as the link to the UserProfile.
- Styled with responsive design

### Welcome (on the Welcome page)

-gives a warm welcome and introduction to the game (with a link to the Scoring/Rules page for further information)
-displays the BlueFish NFL Game logo in the middle of the page

### Scoring/Rules (on the Scoring Page)

-Details how the game is scored(see below):
Team Selection (100 points)
Score 100 points if you correctly match a team's draft position. The teams are prepopulated based on their current draft positions but these can be changed by clicking on the Trade toggle button.

Player Selection (200 points)
• 100 points for predicting the draft position at which a player will go (even if the team is incorrect)

• 100 points for predicting the team that will select the player (even if the draft position is incorrect)


Position Selection (100 points) - these will be autopopulated once a player is selected
• 50 points for correctly matching the player's position with the draft position(even if the player and the team are incorrect)

• 50 points for correctly matching the player's position with the team (even if the player and the draft position are incorrect)


Trade Status Prediction (100 points)
Score 100 points if you correctly predict whether a trade will happen or not (even if the team selected as the trade partner is incorrect)

Perfect Match Bonus (100 points)
Score an additional 100 points if you correctly predict all elements of a pick (team, player, position, and trade status).

The maximum score per pick is 600 points (100 + 200 + 100 + 100 + 100) and the minimum score is 0 points. Your total score will be the sum of points earned across all 32 picks.

### Top200Prospects (on the Expert Picks page)
- Displays the top 200 NFL draft prospects
- Includes search and filter functionality
- Data sourced from CBS Top 200 Prospects
- Data extracted from the CBSTop200Prospects.xlsx file

### ExpertPicks (on the Expert Picks page)
- Displays expert predictions for draft picks
- Includes filtering and search capabilities
- Shows consensus picks from various experts
- Data extracted from the ExpertPicks.xlsx file 

### EventInfo (on the YourPicks/Selections Page)
- Shows NFL Draft event details:
  - Title: "NFL DRAFT 2025"
  - Location: GreenBay, Wisconsin
  - Date: 26th April, 2025
  - Start Time: 8PM ET
  - Countdown timer to event start
  - Draft Date and Draft Time are entered manually in the draftConfig.ts file 

### UserSelections (on the YourPicks/Selections Page)
- Interface for users to make their draft predictions
- Includes team selection, player selection, the position (which automatically matches the player selection) and trade prediction (yes or no)
- Features autocomplete for team and player names
- The data is taken from the UserSelection.xlsx file


### ActualResult (on the ActualPicks/Results page)
- Shows actual draft results
- Compares user predictions with actual picks
- Displays Total Points scored, Correct Selections and %Score
- The criteria for scoring points is determined based on Team, Player, Position and Trade (yes or no). See further details in the Scoring page.
- The data is updated via the ActualResult.xlsx file 

### Leaderboard (on the Leaderboard page)
- Displays User Rankings, UserName, Correct Selections, Total Points and %Score
- The values are all taken from the Actual Results component for each specific user 


### UserProfile (Profile page)
- Displays user information (Email, Username and the ability to add a UserProfile Image)
- Users can edit their Username and select either a prepopulated Image or upload their own image.

### NflDraftLayout
- Main layout component for the NFL Draft app
- Handles overall page structure
- Manages component positioning

## Development Guidelines

1. **Component Organization**:
   - Each component should have its own directory
   - Include both .tsx and .css files in the same directory
   - Keep components focused and single-responsibility

2. **Styling**:
   - Use component-specific CSS files
   - Follow Material-UI theming
   - Maintain consistent styling across components

3. **TypeScript**:
   - Use proper type definitions
   - Document component props
   - Include error handling

4. **Performance**:
   - Implement proper memoization where needed
   - Optimize re-renders
   - Handle loading states

5. **Testing**:
   - Write unit tests for components
   - Test user interactions
   - Verify component integration 