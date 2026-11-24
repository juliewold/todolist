-- Table privileges for signed-in users. Row level security still limits each user to their own rows.
-- Anonymous visitors keep having no privileges (see the initial migration).
grant select, insert, update, delete on public.task_lists to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.habit_entries to authenticated;
