from rest_framework.throttling import SimpleRateThrottle


class IdentRateThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        if not ident:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class CredentialRateThrottle(SimpleRateThrottle):
    credential_field = 'username'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        if not ident:
            return None

        credential = (request.data.get(self.credential_field) or '').strip().lower()
        cache_ident = f'{ident}:{credential or "anonymous"}'
        return self.cache_format % {'scope': self.scope, 'ident': cache_ident}


class LoginRateThrottle(CredentialRateThrottle):
    scope = 'login'


class RegisterRateThrottle(IdentRateThrottle):
    scope = 'register'


class AdminLoginRateThrottle(CredentialRateThrottle):
    scope = 'admin_login'


class CreateAdminRateThrottle(IdentRateThrottle):
    scope = 'create_admin'


class CaseSubmitRateThrottle(IdentRateThrottle):
    scope = 'case_submit'


class CommentCreateRateThrottle(IdentRateThrottle):
    scope = 'comment_create'


class FeedbackCreateRateThrottle(IdentRateThrottle):
    scope = 'feedback_create'


class VoteCreateRateThrottle(IdentRateThrottle):
    scope = 'vote_create'


class AIGenerationRateThrottle(IdentRateThrottle):
    scope = 'ai_generate'
