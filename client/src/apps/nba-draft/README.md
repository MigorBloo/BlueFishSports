# NFL Draft Application

This directory contains the NFL Draft application module of the BlueFish Sports Platform.

## Directory Structure

```
nfl-draft/
├── components/     # Reusable UI components specific to NFL Draft
├── config/        # Configuration files and constants
├── contexts/      # React context providers for state management
├── Data/          # Data models and interfaces
├── layouts/       # Page layout components
├── mockData/      # Mock data for development and testing
├── pages/         # Main page components
├── services/      # API services and data fetching logic
├── styles/        # CSS and styling files
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and helpers
├── theme.ts       # Material-UI theme configuration
└── types.ts       # Main type definitions
```

## Purpose of Each Directory

### Components
Reusable UI components specific to the NFL Draft application. These components should be:
- Modular and reusable
- Well-documented
- Type-safe with TypeScript
- Styled consistently with the application theme

### Config
Configuration files and constants used throughout the application:
- API endpoints
- Feature flags
- Game settings
- Other configuration constants

### Contexts
React context providers for state management:
- Authentication state
- Draft state
- User preferences
- Other global state

### Data
Data models and interfaces:
- Player data structures
- Team data structures
- Draft data structures
- Other data models

### Layouts
Page layout components that define the structure of different pages:
- Main layout
- Draft room layout
- Profile layout
- Other page layouts

### MockData
Mock data used for development and testing:
- Sample player data
- Sample draft data
- Test scenarios
- Other mock data

### Pages
Main page components that represent different routes in the application:
- Draft room
- Player profiles
- Team management
- Other pages

### Services
API services and data fetching logic:
- API clients
- Data fetching functions
- Error handling
- Other service-related code

### Styles
CSS and styling files:
- Component-specific styles
- Theme overrides
- Global styles
- Other styling files

### Types
TypeScript type definitions:
- Interface definitions
- Type aliases
- Enums
- Other type-related code

### Utils
Utility functions and helpers:
- Formatting functions
- Validation functions
- Helper functions
- Other utility code

## Development Guidelines

1. **Component Organization**:
   - Keep components small and focused
   - Use TypeScript for type safety
   - Follow the established naming conventions
   - Document complex components

2. **State Management**:
   - Use React Context for global state
   - Keep component state local when possible
   - Document state management patterns

3. **Styling**:
   - Use Material-UI components when possible
   - Follow the established theme
   - Keep styles modular and reusable

4. **Testing**:
   - Write tests for critical functionality
   - Use mock data for testing
   - Document test scenarios

5. **Documentation**:
   - Keep README files up to date
   - Document complex logic
   - Include usage examples

# NFL Draft App

NFL DRAFT GAME:
## Overview

The NFL Draft Game is a simple game that will last for only about 6 hours (from the start of the draft on the 26th April 2025 at 8pm ET (when the selections will lock) until the end of the First Day/Round of the draft(after Pick 32 has been completed). For each of the 32 picks a User has to select a player who they think a team will pick. A user will receive points for guessing the right team, player, position and if a trade has been made or not. The user that has the highest score after all 32 picks have been made wins.

 ## Scoring: 
 Correct Team: 50 points, Correct Player: 100 points, Correct Position: 50 points and Trade: 100 points

 ## Pages

There would be only 2 pages, the "DraftSelection" page and the "Spectacle" Page.

-Draft Selection Page:

4 components:

User Profile(top):
Will display the text" Welcome {UserName} and dispay the {UserProfileLogo} (will be unique for each user)

EventInfo (below that):
Will show the Title: "NFL DRAFT 2025"
Location: GreenBay, Wisconsin
Date: 26th April, 2025
StartTime: 8PM ET
Time Till Lock: the time left between now and the Date and Start Time
This will be the same for each user.

Top200Prospects(bottom left):
This will show the Top200 Prospects as ranked by CBS. The data will be extracted from the CBSTop200Prospects.xlsx file. I would also like to add a Search by: Name box as well as a FilterBy box above the table. The table will be the same for each user.

User Selections(bottom centre):
Same columns as in the consensus picks but there will be an additional column at the end called Confirm which will show a tick box in each row with which by clicking on it a selection gets confirmed. The data should be taken from the UserSelection.xlsx file. Unlike in the Expert Picks table the user can change the Team (which will be prepopulated based on the current pick order) and enter the Player he thinks will get selected (this will be empty initially). The user can select Trade Yes or No and if they select Yes they can then change the team. When they change a team, the team that was originally in that spot will be replaced by the new team a user selects. At the same time the team that was replaced will appear instead of the other team. So for example Tenessee has the first pick and the user selects Trade yes and for example selects New England which has the fourth pick as the new team. New England will then appear as the team with the first pick. Tennessee will then replace New England as the team with the fourth pick. I would like both the Team and the Player input box to have an autocomplete option so users dont have to type out the full name. The Team data should be taken from the UserSelection.xlsx file while the Player Name data should be taken from the CBSTop200Prospects.xlsx file under the column Player. The starting screen will be the same for each user, but once the user makes the selections, each selection will be saved and unique for each user.

Expert Picks (bottom right):
Showing all the consensus picks showing the following columns (Pick No,TeamLogo, Team, Player and Position). This will be the same for all users. I would like to add a Dropdown/Scroll down box where users can chose which Expert Picks they want to see from. The data will be extracted from the ExpertPicks.xlsx file.


-The Spectacle Page:

5 components:

Latest Leaderboard(Top left):

Shows the latest leaderboard. It has 3 columns namely the Rank, the User and the Total Points. The Rank is determined based on total points. The bottom row will be fixed/frozen pane to show the current ranking of the user. The Latest Leaderboard will be updated after every pick selection. It will be the same for every user except the bottom row which will highlight only the current users row.

RankingsHistory(Bottom left):

This will show the rankings history of the current user (updated after each pick). It will have two three columns (Pick No., Rank and Points).

UserSelectionConfirmation(Middle):

Will be very similar to the User Selections component but will include two additional columns namely Actual Selection(which will populate with the actual player selected with that specific pick) and Points (which will show the points scored in that round). If a player got a specific data point correct e.g. Team and Player, the font for these will change to green. If not, they will change to red. The Actual Selection will be the same for every user, the rest will be different for each user.

Top3Scores(top right):

Will show the top3 Scorers for the latest pick. E.g. User 1 - 200 points, User 2 - 150 points and User3 - 100 points. The data shown will reset after each pick. This view will be the same for every user.

Top3Selections(bottom right): 

This will show the 3 Most popular Selections for that Pick e.g. 1. Team: Dallas Cowboys, Player: Ashton Jeanty, Position:RB, Trade:no (80%), 2. Team: Dallas Cowboys, Player: Omarion Hampton, Position:RB, Trade:no (60%), Team: Denver Broncos, Player: Ashton Jeanty, Position:RB, Trade:yes (55%). This view will be the same for every user.


