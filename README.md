# BlueFish Sports Platform

BlueFish Sports is a comprehensive sports platform that serves as a central hub for sports enthusiasts, providing access to various sports applications and games. The platform currently supports two main applications: One&Done Golf Game and NFL Draft Game.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js
- **Database**: PostgreSQL 17
- **Infrastructure**:
  - AWS Lightsail (Application Server)
  - AWS RDS (Database)
  - AWS EC2 (Additional Services)
  - Route53 (Domain Management: bluefishsports.com)

## Project Structure

```
bluefishsports/
├── client/                 # React frontend application
├── server/                 # Node.js backend application
├── docs/                   # Documentation
└── scripts/                # Deployment and utility scripts
```



### Core Platform
- User Authentication (Registration & Login)
- User Profile Management
- Centralized Dashboard
- Application Access Control


## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL 17
- npm or yarn
- AWS CLI (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bluefishsports.git
   cd bluefishsports
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Configure database connection, AWS credentials, and other necessary variables

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend development server
   cd ../client
   npm start
   ```

## Deployment

The platform is deployed on AWS infrastructure:
- Main application: AWS Lightsail
- Database: AWS RDS
- Additional services: AWS EC2
- Domain: bluefishsports.com (Route53)

For detailed deployment instructions, refer to the `docs/deployment.md` file.


## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

For any questions or support, please contact the development team at support@bluefishsports.com 

## Getting Started
(To be filled with installation and setup instructions)

## Project Structure
(To be filled with directory structure and component organization)

## API Documentation
(To be filled with API endpoints and usage)

## Contributing
(To be filled with contribution guidelines)

## License
(To be filled with licensing information) 
