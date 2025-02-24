---
title: NextCloud
---

## What is NextCloud

From https://en.wikipedia.org/wiki/Nextcloud

:::note
Nextcloud is a suite of client-server software for creating and using file hosting services. Nextcloud is free and open-source, which means that anyone is allowed to install and operate it on their own private server devices.
:::

:::warning
This setup only works, when NextCloud is running with HTTPS enabled.
:::

:::warning
In case something goes wrong with the configuration, you can use the URL `http://nextcloud.company/login?direct=1` to log in using the built-in authentication.
:::

## Preparation

The following placeholders will be used:

- `nextcloud.company` is the FQDN of the NextCloud install.
- `authentik.company` is the FQDN of the authentik install.

Create an application in authentik and note the slug, as this will be used later. Create a SAML provider with the following parameters:

- ACS URL: `https://nextcloud.company/apps/user_saml/saml/acs`
- Issuer: `https://authentik.company`
- Service Provider Binding: `Post`
- Audience: `https://nextcloud.company/apps/user_saml/saml/metadata`
- Signing Keypair: Select any certificate you have.
- Property mappings: Select all Managed mappings.

You can of course use a custom signing certificate, and adjust durations.

## NextCloud

In NextCloud, navigate to `Settings`, then `SSO & SAML Authentication`.

Set the following values:

- Attribute to map the UID to.: `http://schemas.goauthentik.io/2021/02/saml/username`
- Optional display name of the identity provider (default: "SSO & SAML log in"): `authentik`
- Identifier of the IdP entity (must be a URI): `https://authentik.company`
- URL Target of the IdP where the SP will send the Authentication Request Message: `https://authentik.company/application/saml/<application-slug>/sso/binding/redirect/`
- Public X.509 certificate of the IdP: Copy the PEM of the Selected Signing Certificate

Under Attribute mapping, set these values:

- Attribute to map the displayname to.: `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`
- Attribute to map the email address to.: `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`
- Attribute to map the users groups to.: `http://schemas.xmlsoap.org/claims/Group`

## Group Quotas

Create a group for each different level of quota you want users to have. Set a custom attribute, for example called `nextcloud_quota`, to the quota you want, for example `15 GB`.

Afterwards, create a custom SAML Property Mapping with the name `SAML NextCloud Quota`.
Set the *SAML Name* to `nextcloud_quota`.
Set the *Expression* to `return user.group_attributes.get("nextcloud_quota", "1 GB")`, where `1 GB` is the default value for users that don't belong to another group (or have another value set).

## Admin Group

To give authentik users admin access to your NextCloud instance, you need to create a custom Property Mapping that maps an authentik group to "admin". It has to be mapped to "admin" as this is static in NextCloud and cannot be changed.

Create a SAML Property mapping with the SAML Name "http://schemas.xmlsoap.org/claims/Group" and this expression:

```python
for group in user.ak_groups.all():
    yield group.name
if ak_is_group_member(request.user, name="<authentik nextcloud admin group's name>"):
    yield "admin"
```

Then, edit the NextCloud SAML Provider, and replace the default Groups mapping with the one you've created above.
