create table if not exists liked_posts_summaries (
  id bigint generated always as identity primary key,
  url text not null,
  summary text not null,
  created_at timestamptz not null default now()
);
