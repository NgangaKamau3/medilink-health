# MediLink Health

A comprehensive healthcare management system with patient records, audit trails, and secure authentication.

## Features

- Patient record management
- Secure authentication with JWT
- Audit trail logging
- QR code scanning
- Offline capability
- Multi-language support

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: FastAPI, Python
- **Database**: MySQL
- **Deployment**: Docker, DigitalOcean

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` in backend directory
3. Update database credentials in `.env`
4. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Deployment

This project is configured for automatic deployment to DigitalOcean via GitHub Actions.

### Required GitHub Secrets:
- `DO_HOST`: Your DigitalOcean server IP
- `DO_USERNAME`: SSH username
- `DO_SSH_KEY`: Private SSH key

## License

MIT License