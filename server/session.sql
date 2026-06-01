-- Table: session
-- Purpose: Stores session data for user authentication or other temporary server-side session handling.


CREATE TABLE IF NOT EXISTS "session" (

  -- Column: sid
  -- Purpose: Unique identifier for the session.
  "sid" varchar NOT NULL COLLATE "default",
  
  -- Column: sess
  -- Purpose: JSON object containing session data. Session data stored as JSON, can include user info, auth tokens, etc.
  "sess" json NOT NULL,
  
  -- Column: expire
  -- Purpose: Timestamp when the session expires.
  "expire" timestamp(6) NOT NULL,

  -- Constraint: session_pkey
  -- Purpose: Primary key constraint for the session table.
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
