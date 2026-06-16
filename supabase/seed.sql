insert into public.grammar_topics (name, level, description)
values
  ('Present Perfect', 'B1', 'Experiences, changes, and results connected to the present.'),
  ('Polite Requests', 'A2', 'Could you, would it be possible, and softening phrases.'),
  ('STAR Answers', 'B1', 'Situation, task, action, result structure for interviews.')
on conflict do nothing;
