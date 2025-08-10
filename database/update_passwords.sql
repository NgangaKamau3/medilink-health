-- Update user passwords with secure hash
-- New password: MediLink2024!

USE hospital;

UPDATE users SET password_hash = '$2b$12$5MF.hxy88Zce/vG3oeEOVuzdHlxjVrl0GjMAYdl1Sx..0ykeWZ2h2' 
WHERE user_id IN (1, 2, 3, 4, 5);

-- Verify the update
SELECT user_id, username, first_name, last_name FROM users WHERE user_id IN (1, 2, 3, 4, 5);