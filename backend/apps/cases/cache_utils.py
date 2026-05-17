from django.core.cache import cache


PUBLIC_CASE_FEED_VERSION_KEY = 'cases:public_feed_version:v1'


def get_public_case_feed_version():
    version = cache.get(PUBLIC_CASE_FEED_VERSION_KEY)
    return version or 1


def bump_public_case_feed_version():
    version = cache.get(PUBLIC_CASE_FEED_VERSION_KEY)
    if version is None:
        cache.set(PUBLIC_CASE_FEED_VERSION_KEY, 2, None)
        return 2

    try:
        return cache.incr(PUBLIC_CASE_FEED_VERSION_KEY)
    except ValueError:
        next_version = version + 1
        cache.set(PUBLIC_CASE_FEED_VERSION_KEY, next_version, None)
        return next_version


def build_public_case_feed_cache_key(*, feed, category_id, category, status):
    version = get_public_case_feed_version()
    return (
        f'cases:public_feed:v{version}:'
        f'feed={feed or "all"}:'
        f'category_id={category_id or "none"}:'
        f'category={category or "none"}:'
        f'status={status or "none"}'
    )
