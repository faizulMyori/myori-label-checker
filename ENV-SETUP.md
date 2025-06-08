# Environment Variables Setup

This document explains how environment variables are configured and used in the MyORI Label Checker application, both in development and production environments.

## Environment Configuration

The application uses environment variables for configuration, particularly for sensitive information like the license secret key. These variables are loaded from `.env` files using the `dotenv` package.

## Development Environment

In development mode, the application loads environment variables from a `.env` file in the project root directory.

1. Create a `.env` file in the project root with the following content:

```
# Development environment variables
LICENSE_SECRET_KEY=your-development-secret-key
# Add other development variables as needed
```

2. This file is automatically loaded when running the application in development mode.

## Production Environment

For production builds, the application uses a different approach to ensure environment variables are available in the packaged application:

1. Create a `.env.production` file in the project root with your production configuration:

```
# Production environment variables
LICENSE_SECRET_KEY=your-production-secret-key
# Add other production variables as needed
```

2. During the build process, this file is included in the application package as an extra resource and renamed to `.env`.

3. When the application runs in production mode, it looks for the `.env` file in the resources directory.

## Configuration in package.json

The `package.json` file includes configuration to include the `.env.production` file in the build:

```json
"extraResources": [
  {
    "from": ".env.production",
    "to": ".env"
  }
]
```

## Security Considerations

- **Never commit** `.env` or `.env.production` files to version control
- Both files are listed in `.gitignore` to prevent accidental commits
- For production deployments, ensure the `.env.production` file contains appropriate values before building
- Consider using a secure method to generate and distribute the production `.env.production` file

## License Key Generation

The `generate-license.js` script also uses these environment variables to generate license keys. It follows the same pattern of loading from the appropriate `.env` file based on the environment.

This document explains how environment variables are handled in the MyORI Label Checker application, particularly for the license key functionality.

## Development Environment

During development, environment variables are loaded from the `.env` file in the project root directory using the `dotenv` package.

1. Create a `.env` file in the project root with your development variables:

```
# Development environment variables
LICENSE_SECRET_KEY=your-development-key
```

2. The application will automatically load these variables when running in development mode.

## Production Environment

For production builds, environment variables are handled differently to ensure they are properly packaged with the application:

1. Environment variables for production are stored in a `.env.production` file in the project root.

2. During the build process, this file is included in the application package as an extra resource.

3. When the application runs in production mode, it looks for the `.env` file in the resources directory.

## Building for Production

To build the application for production with the correct environment variables:

```bash
npm run dist
```

This command sets `NODE_ENV=production` and builds the application using electron-builder, which includes the `.env.production` file as specified in the `package.json` configuration.

## Modifying Environment Variables

### For Development

Simply edit the `.env` file in the project root.

### For Production

1. Edit the `.env.production` file in the project root.
2. Rebuild the application using `npm run dist`.

## Important Notes

- Never commit sensitive keys to version control. Add `.env` and `.env.production` to your `.gitignore` file.
- The application includes a fallback key for development, but always use a secure key for production builds.
- If no environment variable is found, the application will log a warning and use a default key (not recommended for production).