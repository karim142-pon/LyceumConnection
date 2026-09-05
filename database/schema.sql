-- =====================================================
-- LyceumConnection
-- PostgreSQL Database Schema
-- =====================================================

-- На случай повторного запуска
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS friend_requests CASCADE;
-- DROP TABLE IF EXISTS likes CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (

    id BIGSERIAL PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    bio TEXT,
    avatar_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- POSTS
-- =====================================================

CREATE TABLE posts (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- COMMENTS
-- =====================================================

CREATE TABLE comments (

    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL
        REFERENCES posts(id)
        ON DELETE CASCADE,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- LIKES
-- =====================================================

CREATE TABLE likes (

    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL
        REFERENCES posts(id)
        ON DELETE CASCADE,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(post_id, user_id)

);

-- =====================================================
-- FRIEND REQUESTS
-- =====================================================

CREATE TABLE friend_requests (

    id BIGSERIAL PRIMARY KEY,

    sender_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    receiver_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status VARCHAR(20)
        DEFAULT 'pending'
        CHECK(status IN ('pending','accepted','rejected')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- MESSAGES
-- =====================================================

CREATE TABLE messages (

    id BIGSERIAL PRIMARY KEY,

    sender_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    receiver_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(30) NOT NULL,

    reference_id BIGINT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_posts_user
ON posts(user_id);

CREATE INDEX idx_comments_post
ON comments(post_id);

CREATE INDEX idx_comments_user
ON comments(user_id);

CREATE INDEX idx_messages_sender
ON messages(sender_id);

CREATE INDEX idx_messages_receiver
ON messages(receiver_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);