"""authentik sentry integration"""
from typing import Optional

from aioredis.errors import ConnectionClosedError, ReplyError
from billiard.exceptions import WorkerLostError
from botocore.client import ClientError
from celery.exceptions import CeleryError
from channels_redis.core import ChannelFull
from django.core.exceptions import DisallowedHost, ValidationError
from django.db import InternalError, OperationalError, ProgrammingError
from django_redis.exceptions import ConnectionInterrupted
from docker.errors import DockerException
from ldap3.core.exceptions import LDAPException
from redis.exceptions import ConnectionError as RedisConnectionError
from redis.exceptions import RedisError, ResponseError
from rest_framework.exceptions import APIException
from structlog.stdlib import get_logger
from websockets.exceptions import WebSocketException

LOGGER = get_logger()


class SentryIgnoredException(Exception):
    """Base Class for all errors that are suppressed, and not sent to sentry."""


def before_send(event: dict, hint: dict) -> Optional[dict]:
    """Check if error is database error, and ignore if so"""
    ignored_classes = (
        # Inbuilt types
        KeyboardInterrupt,
        ConnectionResetError,
        OSError,
        PermissionError,
        # Django DB Errors
        OperationalError,
        InternalError,
        ProgrammingError,
        DisallowedHost,
        ValidationError,
        # Redis errors
        RedisConnectionError,
        ConnectionInterrupted,
        RedisError,
        ResponseError,
        ReplyError,
        ConnectionClosedError,
        # websocket errors
        ChannelFull,
        WebSocketException,
        # rest_framework error
        APIException,
        # celery errors
        WorkerLostError,
        CeleryError,
        # S3 errors
        ClientError,
        # custom baseclass
        SentryIgnoredException,
        # ldap errors
        LDAPException,
        # Docker errors
        DockerException,
    )
    if "exc_info" in hint:
        _, exc_value, _ = hint["exc_info"]
        if isinstance(exc_value, ignored_classes):
            return None
    if "logger" in event:
        if event["logger"] in ["dbbackup"]:
            return None
    return event
