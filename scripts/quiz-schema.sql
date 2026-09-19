-- Run once on the PostgreSQL database selected for this application.
-- Keep this schema out of public/Data API schemas. Connect from the server only.
CREATE SCHEMA IF NOT EXISTS quiz_private;
REVOKE ALL ON SCHEMA quiz_private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS quiz_private.sessions (
  code text PRIMARY KEY,
  revision integer NOT NULL DEFAULT 0,
  data text NOT NULL,
  expires_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS quiz_sessions_expiry ON quiz_private.sessions (expires_at);
CREATE TABLE IF NOT EXISTS quiz_private.rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS quiz_rate_expiry ON quiz_private.rate_limits (expires_at);
REVOKE ALL ON ALL TABLES IN SCHEMA quiz_private FROM PUBLIC;
ALTER TABLE quiz_private.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_private.rate_limits ENABLE ROW LEVEL SECURITY;
