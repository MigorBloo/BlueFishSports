# BlueFish Sports Platform (bluefishsports.com)
   
A comprehensive sports prediction and competition platform currently featuring an NBA Mock Draft, NFL Mock Draft, Tennis and Golf prediction game(the last one to be released soon). The plan is to add other sports such as Football and NFL games to the platform. The platform will be a one stop shop for fantasy sports player where they can have access to multiple sports games via one login. 

Workflow:

### 🔐 Authentication System
- User registration and login
- Email verification
- Password reset functionality

1)	Login Page (Starting Page):

The user logs in with his email address and password (which he created during the registration process).

Below that there is a link to the registration page as well as to reset the password.

The two outcomes are

i)	User logs in successfully and gets to the Main Landing Page
ii)	Error logging in due to incorrect credentials

2)	Registration Page:

The registration page has the following fields

-	First Name

-	Last Name

-	Username

-	Email Address

-	Password

-	Country of Residence (Dropdown Menu)

           Below there is a link to get to the login page

The two outcomes are:

i)	An authentication email will be sent to your email address for you to verify
ii)	Error registering user (due to invalid entries and/or the user already being registered)

The user should receive an authentication email and once he confirms it by clicking on a confirmation button he will be directed to the login page where he can login with his Email and password.

3)	Resetting Password/Forgot Password

By clicking on Forgot Password you enter your email address to which your password reset link will be sent. Once the email is received and the link is clicked on, the user will be prompted to enter a new password and confirm it before he will be redirected again to the Login page.

###  📋 App Features:

1) Landing Page (Main Page):

Once the user logs in successfully, he will be directed to the Landing Page/Main Page where the links to all the individual games will be (the game containers).

Navigation Bar: Located at the top of the page with the Game Logo on the top left, the Username with Welcome message in the middle and then the Logout Button on the right. The user can click on the Username to get to the User Profile page where he can see his Email Address and Username and change his Username.

The Game Containers: All the Game containers are displayed here including an short introductory headline story about the game and then below the characteristics of the game (Sport, Type, Start Date, End Date, Duration and Time till Lock as well as the Status). At the bottom of each container the user can click on the Play Now button to access the individual game.

Filter: In order to make the view neater and customizable, a user can filter by sport, type and status to see only the game containers that are of interest to him. 

### The Games:

2)  🏀 NBA Mock Draft

Type: Single Event (covering Round 1 only)

Overview:
-Users will try to predict what teams will do in the NBA Draft (whether they will trade their picks and which player/players they will draft)
- Pick positions are predetermined but users can change team positions (by clicking the trade toggle), if they think a team will trade their pick, and select the player they think will be drafted by that team.
-Each round will be scored based on how accurate the predictions are(comparing them to the actual Draft result). The user that has the highest point total accumulated over 30 rounds wins

Key to Success: The key to winning is not for you to make the most rational decision for a team but rather anticipate what a team will do.

App Layout:

Navigation Bar at the top which includes the app logo on the top left (if clicked the user gets back to the Main Landing Page), the Welcome page, Scoring page, Expert Picks, Your Picks, Results, Leaderboard, Logout and then the user logo. 

Pages:

i)	Welcome

Gives an overview of the game

ii)	Scoring

Describes in detail the Scoring and Rules of the game

iii)	Expert Picks

Shows the Top 70 prospects as well as the Expert Picks for the draft. The user can search by name or Filter by Position in the Prospects table and select an expert in the Expert Picks table.

iv)	Your Picks 

The main page of the NBA Draft App. It is where all the magic happens. The users make their draft selections here. The top of the page shows the event info (Location, Date, Start Time and Time till Lock) and below that the users can make their selections. The Picks are predetermined. The teams are also prepopulated but can be changed if a user thinks a team will trade their pick (by clicking on the trade toggle button). The user then selects the player who they think will be drafted (from a dropdown). The position will automatically be populated based on which player a user selects. At the far right of the table, the user than clicks on confirm to confirm his selections. Selections can be made and changed as long as the Time till Lock is greater than 0. Once it passes 0, it will change status to locked and no more selections can be made. The users won’t be able to click in the table anymore.

v)	Results

There will be a placeholder displayed before the Draft results are out.

The results page will show the results once the outcome of the NBA Draft is known (usually the day after Round 1 of the draft completes). There will be a summary table at the top that shows the Total Points Scored, the Correct Selections as well as the %Score.

Below that will be the main table that will show each pick (the team, the player position and trade) and then colour in green if the outcome was correctly predicted and red if it wasn’t. It will also show the total score for each pick and then total score for all 30 rounds at the bottom (including total points scored, correct selections and %Score).

vi)	Leaderboard 

Shows the ranking of all the users including the Correct Selections, Total Points and %Score. The default ranking is by Total Points. The current users position will be highlighted in blue and will also be displayed at the bottom of the table. If a user clicks on a username (other than his/hers) he can see the results for that specific user and the overview of his points scored.

vii)	Logout 

When clicked, a user will get back to the Login page.

User Profile (top right)

When clicked, a user can see his Email and Username and can change his username.


3) 🏈 NFL Mock Draft

Type: Single Event (covering Round 1 only)
-Users will try to predict what teams will do (whether they will trade their picks and which player/players they will draft)
- Pick positions are predetermined but users can change team positions (by clicking the trade toggle), if they think a team will trade their pick, and select the player they think will be drafted by that team.
-Each round will be scored based on how accurate the predictions are(comparing them to the actual Draft result). The user that has the highest point total accumulated over 32 rounds wins

Key to Success: The key to winning is not for you to make the most rational decision for a team but rather anticipate what a team will do.

App Layout:

Navigation Bar at the top which includes the app logo on the top left (if clicked the user gets back to the Main Landing Page), the Welcome page, Scoring page, Expert Picks, Your Picks, Results, Leaderboard, Logout and then the user logo. 

Pages:

i)	Welcome

Gives an overview of the game

ii)	Scoring

Describes in detail the Scoring and Rules of the game

iii)	Expert Picks

Shows the Top 200 prospects as well as the Expert Picks for the draft. The user can search by name or Filter by Position in the Prospects table and select an expert in the Expert Picks table.

iv)	Your Picks 

The main page of the NFL Draft App. It is where all the magic happens. The users make their draft selections here. The top of the page shows the event info (Location, Date, Start Time and Time till Lock) and below that the users can make their selections. The Picks are predetermined. The teams are also prepopulated but can be changed if a user thinks a team will trade their pick (by clicking on the trade toggle button). The user then selects the player who they think will be drafted (from a dropdown). The position will automatically be populated based on which player a user selects. At the far right of the table, the user than clicks on confirm to confirm his selections. Selections can be made and changed as long as the Time till Lock is greater than 0. Once it passes 0, it will change status to locked and no more selections can be made. The users won’t be able to click in the table anymore.

v)	Results

There will be a placeholder displayed before the Draft results are out.

The results page will show the results once the outcome of the NBA Draft is known (usually the day after Round 1 of the draft completes). There will be a summary table at the top that shows the Total Points Scored, the Correct Selections as well as the %Score.

Below that will be the main table that will show each pick (the team, the player position and trade) and then colour in green if the outcome was correctly predicted and red if it wasn’t. It will also show the total score for each pick and then total score for all 32 rounds at the bottom (including total points scored, correct selections and %Score).

vi)	Leaderboard 

Shows the ranking of all the users including the Correct Selections, Total Points and %Score. The default ranking is by Total Points. The current users position will be highlighted in blue and will also be displayed at the bottom of the table. If a user clicks on a username (other than his/hers) he can see the results for that specific user and the overview of his points scored.

vii)	Logout 

When clicked, a user will get back to the Login page.

User Profile (top right)

When clicked, a user can see his Email and Username and can change his username.


4) 🎾 Tennis 3&Done

Type: Season Long 
- Each week a user chooses 3 tennis players who they think will perform well at that tournament (one from each bucket)
- Players are placed in 3 buckets (Gold, Silver and Bronze) based on their current ATP rankings (these rankings and buckets are set at the beginning of the competition and do not change)
- Each week the user will collect points based on the real life performances of their 3 selections (based on their actual ATP points scored)
- The caveat is that a player can only be selected once 
- The user with the highest number of points at the end of the season wins

Key to Success: The key to winning is to time your selections carefully as some tournaments (Grand Slams) carry more points than others and as mentioned before you can only choose a player once. 

App Layout:

Navigation Bar at the top which includes the app logo on the top left (if clicked the user gets back to the Main Landing Page), the Welcome page, Your Picks, Results, Leaderboard, Tournaments, Player Pool, Scoring, Logout and then the user logo. 

Pages:

i)	Welcome

Gives an overview of the game

ii)	Your Picks 

The main page of the 3&Done Tennis Game. It is where all the magic happens. The left of the page shows the upcoming Tournament info including the Event (e.g. Wimbledon, the Surface, the Designation, the Points awarded to the Winner, the Date, the Start Time and the Time till Lock. 

The right of the page shows 3 containers (Gold, Silver and Bronze) and one player can be selected from each of the 3 containers. If a player has already been selected previously by the user, his name will be greyed out and a user won’t be able to select that player. Selections can be changed for as long as the tournament is not locked. Once locked, no more selections can be made.

iii)	Leaderboard 

Shows the ranking of all the users including the Correct Selections, Total Points and %Score. The default ranking is by Total Points. The current user’s position will be highlighted in blue and will also be displayed at the bottom of the table. If a user clicks on a username (other than his/hers) he can see the results for that specific user and the overview of his points scored.

iv)	Results

Shows the results and selections made by tournament. There is a summary table at the top that shows all the Gold Points, Silver Points, Bronze Points and Total Points accumulated over all the tournaments so far.

Below that is the main table which shows the Tournament, the Gold Selection, Gold Result and Gold Points, the Silver Selection, Silver Result and Silver Points, the Bronze Selections, Bronze Result and Bronze Points, and then the Total Points collected for the specific tournament. 

The entries for the upcoming tournament will be updated automatically based on the current selections, but the points will only be known/calculated once the tournament is completed.

v)	Leaderboard 

Shows the Leaderboard of the game and is updated weekly. It shows the Rank, Username, Total Points, Points Behind Leader, Movement Points (how many points a user has earned compared to the previous week) and Movement Rank (whether a user has moved up or down the ranks compared to the previous week).

vi)	Tournaments 

Shows a table of the tournament schedule for the game including Date, Tournament, Designation, Surface and then the breakdown of points based on the result (e.g. Winner, Runner Up, Semi-Finals, Quarterfinals, etc.). At the top of the table a user can Filter by Designation, Surface and Sort by Date or Winner.

vii)	Player Pool

Shows the Player Pool in the 3 categories (Gold, Silver and Bronze Category)
viii)	Scoring

Describes in detail the Scoring and Rules of the game

ix)	Logout 

When clicked, a user will get back to the Login page.

User Profile (top right)

When clicked, a user can see his Email and Username and can change his username.


### 🛠️ Tech Stack

## Frontend
- **React** with TypeScript
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls

## Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **AWS SES** for email services
- **AWS S3** for file storage

## Infrastructure

- **AWS Lightsail (backend server)
- **AWS EC2** for hosting
- **AWS RDS** for database
- **AWS S3** for static files
- **CloudFront** for CDN
- **Route 53** for DNS

## 📧 Email Configuration

The platform will use AWS SES for email services:
- Email verification for new users
- Password reset functionality
- Welcome emails
- Admin notifications

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Secure password reset flow
- CORS configuration
- Input validation and sanitization


## 📊 Database Schema

PostGreSQL/pgAdmin4 via AWS RDS

The server is called BlueFishSports and is run using PostgreSQL/pgadmin4.

Host name/address: nfldraft-db.cj0amasyek81.eu-west-2.rds.amazonaws.com
Port: 5432

The individual databases inside this server are:

- nbadraft:  serving the NBA Draft App
- nfldraft: serving the NFL Draft App
- tennis: serving the Tennis App
- golfapp: serving the Golf App
- user credentials: serving information on the users

nbadraft:

8 tables:

nba_users
nba_teams
nba_prospects
nba_expert_picks
nba_draft_settings
nba_user_selections
nba_actual_results
nba_leaderboard

1 View: nba_selections_with_usernames

nfldraft:

8 tables:

users
user_selections
teams
prospects
expert_picks
draft_settings
actual_results
leaderboard
tennis:

5 tables: 

leaderboard
results
tennis_users
user_selections
weekly_results

1 view: tennis_selections_with_usernames

user_credentials:

1 table:

users





