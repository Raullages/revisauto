-- Allow one push subscription per endpoint while supporting multiple devices per user.

with ranked_subscriptions as (
  select
    ctid,
    row_number() over (
      partition by endpoint
      order by created_at desc, id desc
    ) as row_num
  from public.push_subscriptions
)
delete from public.push_subscriptions
where ctid in (
  select ctid
  from ranked_subscriptions
  where row_num > 1
);

create unique index if not exists idx_push_subscriptions_endpoint_unique
  on public.push_subscriptions(endpoint);
