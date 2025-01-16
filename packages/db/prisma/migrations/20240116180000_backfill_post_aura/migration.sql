-- Calculate and update user aura based only on their posts' aura
WITH user_post_aura AS (
  SELECT 
    u.id,
    COALESCE(SUM(p.aura), 0) as total_post_aura
  FROM users u
  LEFT JOIN posts p ON p.userId = u.id
  GROUP BY u.id
)
UPDATE users u
SET aura = upa.total_post_aura
FROM user_post_aura upa
WHERE u.id = upa.id;

-- Insert historical aura logs for posts
INSERT INTO aura_logs (id, userId, issuerId, amount, type, postId, created_at)
SELECT 
  gen_random_uuid(), -- Generate UUID for id
  p.userId,
  p.userId, -- Self-issued for historical data
  p.aura,
  'POST_VOTE',
  p.id,
  p.created_at -- Use post creation date for historical accuracy
FROM posts p
WHERE p.aura != 0;
