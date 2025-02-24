"""Google OAuth Views"""
from typing import Any

from authentik.sources.oauth.models import OAuthSource, UserOAuthSourceConnection
from authentik.sources.oauth.types.manager import MANAGER, SourceType
from authentik.sources.oauth.views.callback import OAuthCallback
from authentik.sources.oauth.views.redirect import OAuthRedirect


class GoogleOAuthRedirect(OAuthRedirect):
    """Google OAuth2 Redirect"""

    def get_additional_parameters(self, source):  # pragma: no cover
        return {
            "scope": "email profile",
        }


class GoogleOAuth2Callback(OAuthCallback):
    """Google OAuth2 Callback"""

    def get_user_enroll_context(
        self,
        source: OAuthSource,
        access: UserOAuthSourceConnection,
        info: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "username": info.get("email"),
            "email": info.get("email"),
            "name": info.get("name"),
        }


@MANAGER.type()
class GoogleType(SourceType):
    """Google Type definition"""

    callback_view = GoogleOAuth2Callback
    redirect_view = GoogleOAuthRedirect
    name = "Google"
    slug = "google"

    authorization_url = "https://accounts.google.com/o/oauth2/auth"
    access_token_url = "https://accounts.google.com/o/oauth2/token"  # nosec
    profile_url = "https://www.googleapis.com/oauth2/v1/userinfo"
