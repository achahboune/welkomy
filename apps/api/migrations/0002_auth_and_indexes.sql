CREATE TABLE auth_users (id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,emailVerified INTEGER NOT NULL DEFAULT 0,image TEXT,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
CREATE TABLE auth_sessions (id TEXT PRIMARY KEY NOT NULL,expiresAt TEXT NOT NULL,token TEXT NOT NULL UNIQUE,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,ipAddress TEXT,userAgent TEXT,userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE);
CREATE INDEX auth_sessions_userId_idx ON auth_sessions(userId);
CREATE TABLE auth_accounts (id TEXT PRIMARY KEY NOT NULL,accountId TEXT NOT NULL,providerId TEXT NOT NULL,userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,accessToken TEXT,refreshToken TEXT,idToken TEXT,accessTokenExpiresAt TEXT,refreshTokenExpiresAt TEXT,scope TEXT,password TEXT,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
CREATE INDEX auth_accounts_userId_idx ON auth_accounts(userId);
CREATE TABLE auth_verifications (id TEXT PRIMARY KEY NOT NULL,identifier TEXT NOT NULL,value TEXT NOT NULL,expiresAt TEXT NOT NULL,createdAt TEXT,updatedAt TEXT);
CREATE INDEX auth_verifications_identifier_idx ON auth_verifications(identifier);
