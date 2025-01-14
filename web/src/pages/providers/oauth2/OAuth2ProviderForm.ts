import { CryptoApi, FlowDesignationEnum, FlowsApi, OAuth2Provider, OAuth2ProviderClientTypeEnum, OAuth2ProviderIssuerModeEnum, OAuth2ProviderJwtAlgEnum, OAuth2ProviderSubModeEnum, PropertymappingsApi, ProvidersApi } from "authentik-api";
import { t } from "@lingui/macro";
import { customElement, property } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { DEFAULT_CONFIG } from "../../../api/Config";
import { Form } from "../../../elements/forms/Form";
import { until } from "lit-html/directives/until";
import { ifDefined } from "lit-html/directives/if-defined";
import "../../../elements/forms/HorizontalFormElement";
import "../../../elements/forms/FormGroup";
import { first, randomString } from "../../../utils";

@customElement("ak-provider-oauth2-form")
export class OAuth2ProviderFormPage extends Form<OAuth2Provider> {

    set providerUUID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG).providersOauth2Read({
            id: value,
        }).then(provider => {
            this.provider = provider;
            this.showClientSecret = provider.clientType === OAuth2ProviderClientTypeEnum.Confidential;
        });
    }

    @property({attribute: false})
    provider?: OAuth2Provider;

    @property({type: Boolean})
    showClientSecret = true;

    getSuccessMessage(): string {
        if (this.provider) {
            return t`Successfully updated provider.`;
        } else {
            return t`Successfully created provider.`;
        }
    }

    send = (data: OAuth2Provider): Promise<OAuth2Provider> => {
        if (this.provider) {
            return new ProvidersApi(DEFAULT_CONFIG).providersOauth2Update({
                id: this.provider.pk || 0,
                data: data
            });
        } else {
            return new ProvidersApi(DEFAULT_CONFIG).providersOauth2Create({
                data: data
            });
        }
    };

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <ak-form-element-horizontal
                label=${t`Name`}
                ?required=${true}
                name="name">
                <input type="text" value="${ifDefined(this.provider?.name)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${t`Authorization flow`}
                ?required=${true}
                name="authorizationFlow">
                <select class="pf-c-form-control">
                    ${until(new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                        ordering: "pk",
                        designation: FlowDesignationEnum.Authorization,
                    }).then(flows => {
                        return flows.results.map(flow => {
                            return html`<option value=${ifDefined(flow.pk)} ?selected=${this.provider?.authorizationFlow === flow.pk}>${flow.name} (${flow.slug})</option>`;
                        });
                    }), html`<option>${t`Loading...`}</option>`)}
                </select>
                <p class="pf-c-form__helper-text">${t`Flow used when authorizing this provider.`}</p>
            </ak-form-element-horizontal>

            <ak-form-group .expanded=${true}>
                <span slot="header">
                    ${t`Protocol settings`}
                </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${t`Client type`}
                        ?required=${true}
                        name="clientType">
                        <select class="pf-c-form-control" @change=${(ev: Event) => {
                            const target = ev.target as HTMLSelectElement;
                            if (target.selectedOptions[0].value === OAuth2ProviderClientTypeEnum.Public) {
                                this.showClientSecret = false;
                            } else {
                                this.showClientSecret = true;
                            }
                        }}>
                            <option value=${OAuth2ProviderClientTypeEnum.Confidential} ?selected=${this.provider?.clientType === OAuth2ProviderClientTypeEnum.Confidential}>
                                ${t`Confidential`}
                            </option>
                            <option value=${OAuth2ProviderClientTypeEnum.Public} ?selected=${this.provider?.clientType === OAuth2ProviderClientTypeEnum.Public}>
                                ${t`Public`}
                            </option>
                        </select>
                        <p class="pf-c-form__helper-text">${t`Confidential clients are capable of maintaining the confidentiality of their credentials. Public clients are incapable.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Client ID`}
                        ?required=${true}
                        name="clientId">
                        <input type="text" value="${first(this.provider?.clientId, randomString(40))}" class="pf-c-form-control" required>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        ?hidden=${!this.showClientSecret}
                        label=${t`Client Secret`}
                        name="clientSecret">
                        <input type="text" value="${first(this.provider?.clientSecret, randomString(128))}" class="pf-c-form-control">
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Redirect URIs/Origins`}
                        name="redirectUris">
                        <textarea class="pf-c-form-control">${this.provider?.redirectUris}</textarea>
                        <p class="pf-c-form__helper-text">
                            ${t`Valid redirect URLs after a successful authorization flow. Also specify any origins here for Implicit flows.`}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>

            <ak-form-group>
                <span slot="header">
                    ${t`Advanced protocol settings`}
                </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${t`Token validity`}
                        ?required=${true}
                        name="tokenValidity">
                        <input type="text" value="${this.provider?.tokenValidity || "minutes=10"}" class="pf-c-form-control" required>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`JWT Algorithm`}
                        ?required=${true}
                        name="jwtAlg">
                        <select class="pf-c-form-control">
                            <option value=${OAuth2ProviderJwtAlgEnum.Rs256} ?selected=${this.provider?.jwtAlg === OAuth2ProviderJwtAlgEnum.Rs256}>
                                ${t`RS256 (Asymmetric Encryption)`}
                            </option>
                            <option value=${OAuth2ProviderJwtAlgEnum.Hs256} ?selected=${this.provider?.jwtAlg === OAuth2ProviderJwtAlgEnum.Hs256}>
                                ${t`HS256 (Symmetric Encryption)`}
                            </option>
                        </select>
                        <p class="pf-c-form__helper-text">${t`Algorithm used to sign the JWT Tokens.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Scopes`}
                        ?required=${true}
                        name="propertyMappings">
                        <select class="pf-c-form-control" multiple>
                            ${until(new PropertymappingsApi(DEFAULT_CONFIG).propertymappingsScopeList({
                                ordering: "scope_name"
                            }).then(scopes => {
                                return scopes.results.map(scope => {
                                    let selected = false;
                                    if (!this.provider?.propertyMappings) {
                                        selected = scope.managed?.startsWith("goauthentik.io/providers/oauth2/scope-") || false;
                                    } else {
                                        selected = Array.from(this.provider?.propertyMappings).some(su => {
                                            return su == scope.pk;
                                        });
                                    }
                                    return html`<option value=${ifDefined(scope.pk)} ?selected=${selected}>${scope.name}</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Select which scopes can be used by the client. The client stil has to specify the scope to access the data.`}</p>
                        <p class="pf-c-form__helper-text">${t`Hold control/command to select multiple items.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`RSA Key`}
                        ?required=${true}
                        name="rsaKey">
                        <select class="pf-c-form-control">
                            <option value="" ?selected=${this.provider?.rsaKey === undefined}>---------</option>
                            ${until(new CryptoApi(DEFAULT_CONFIG).cryptoCertificatekeypairsList({
                                ordering: "pk",
                                hasKey: "true",
                            }).then(keys => {
                                return keys.results.map(key => {
                                    return html`<option value=${ifDefined(key.pk)} ?selected=${this.provider?.rsaKey === key.pk}>${key.name}</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Key used to sign the tokens. Only required when JWT Algorithm is set to RS256.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Subject mode`}
                        ?required=${true}
                        name="subMode">
                        <select class="pf-c-form-control">
                            <option value="${OAuth2ProviderSubModeEnum.HashedUserId}" ?selected=${this.provider?.subMode === OAuth2ProviderSubModeEnum.HashedUserId}>
                                ${t`Based on the Hashed User ID`}
                            </option>
                            <option value="${OAuth2ProviderSubModeEnum.UserUsername}" ?selected=${this.provider?.subMode === OAuth2ProviderSubModeEnum.UserUsername}>
                                ${t`Based on the username`}
                            </option>
                            <option value="${OAuth2ProviderSubModeEnum.UserEmail}" ?selected=${this.provider?.subMode === OAuth2ProviderSubModeEnum.UserEmail}>
                                ${t`Based on the User's Email. This is recommended over the UPN method.`}
                            </option>
                            <option value="${OAuth2ProviderSubModeEnum.UserUpn}" ?selected=${this.provider?.subMode === OAuth2ProviderSubModeEnum.UserUpn}>
                                ${t`Based on the User's UPN, only works if user has a 'upn' attribute set. Use this method only if you have different UPN and Mail domains.`}
                            </option>
                        </select>
                        <p class="pf-c-form__helper-text">
                            ${t`Configure what data should be used as unique User Identifier. For most cases, the default should be fine.`}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal name="includeClaimsInIdToken">
                        <div class="pf-c-check">
                            <input type="checkbox" class="pf-c-check__input" ?checked=${first(this.provider?.includeClaimsInIdToken, true)}>
                            <label class="pf-c-check__label">
                                ${t`Include claims in id_token`}
                            </label>
                        </div>
                        <p class="pf-c-form__helper-text">${t`Include User claims from scopes in the id_token, for applications that don't access the userinfo endpoint.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Issuer mode`}
                        ?required=${true}
                        name="issuerMode">
                        <select class="pf-c-form-control">
                            <option value="${OAuth2ProviderIssuerModeEnum.PerProvider}" ?selected=${this.provider?.issuerMode === OAuth2ProviderIssuerModeEnum.PerProvider}>
                                ${t`Each provider has a different issuer, based on the application slug.`}
                            </option>
                            <option value="${OAuth2ProviderIssuerModeEnum.Global}" ?selected=${this.provider?.issuerMode === OAuth2ProviderIssuerModeEnum.Global}>
                                ${t`Same identifier is used for all providers`}
                            </option>
                        </select>
                        <p class="pf-c-form__helper-text">
                            ${t`Configure how the issuer field of the ID Token should be filled.`}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
        </form>`;
    }

}
