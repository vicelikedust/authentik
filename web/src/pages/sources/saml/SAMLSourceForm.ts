import { SAMLSource, SourcesApi, SAMLSourceBindingTypeEnum, SAMLSourceNameIdPolicyEnum, CryptoApi, SAMLSourceDigestAlgorithmEnum, SAMLSourceSignatureAlgorithmEnum, FlowsApi, FlowDesignationEnum } from "authentik-api";
import { t } from "@lingui/macro";
import { customElement, property } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { DEFAULT_CONFIG } from "../../../api/Config";
import { Form } from "../../../elements/forms/Form";
import "../../../elements/forms/FormGroup";
import "../../../elements/forms/HorizontalFormElement";
import { ifDefined } from "lit-html/directives/if-defined";
import { until } from "lit-html/directives/until";
import { first } from "../../../utils";

@customElement("ak-source-saml-form")
export class SAMLSourceForm extends Form<SAMLSource> {

    set sourceSlug(value: string) {
        new SourcesApi(DEFAULT_CONFIG).sourcesSamlRead({
            slug: value,
        }).then(source => {
            this.source = source;
        });
    }

    @property({attribute: false})
    source?: SAMLSource;

    getSuccessMessage(): string {
        if (this.source) {
            return t`Successfully updated source.`;
        } else {
            return t`Successfully created source.`;
        }
    }

    send = (data: SAMLSource): Promise<SAMLSource> => {
        if (this.source) {
            return new SourcesApi(DEFAULT_CONFIG).sourcesSamlUpdate({
                slug: this.source.slug,
                data: data
            });
        } else {
            return new SourcesApi(DEFAULT_CONFIG).sourcesSamlCreate({
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
                <input type="text" value="${ifDefined(this.source?.name)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${t`Slug`}
                ?required=${true}
                name="slug">
                <input type="text" value="${ifDefined(this.source?.slug)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal name="enabled">
                <div class="pf-c-check">
                    <input type="checkbox" class="pf-c-check__input" ?checked=${first(this.source?.enabled, true)}>
                    <label class="pf-c-check__label">
                        ${t`Enabled`}
                    </label>
                </div>
            </ak-form-element-horizontal>

            <ak-form-group .expanded=${true}>
                <span slot="header">
                    ${t`Protocol settings`}
                </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${t`SSO URL`}
                        ?required=${true}
                        name="ssoUrl">
                        <input type="text" value="${ifDefined(this.source?.ssoUrl)}" class="pf-c-form-control" required>
                        <p class="pf-c-form__helper-text">${t`URL that the initial Login request is sent to.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`SLO URL`}
                        name="sloUrl">
                        <input type="text" value="${ifDefined(this.source?.sloUrl || "")}" class="pf-c-form-control">
                        <p class="pf-c-form__helper-text">${t`Optional URL if the IDP supports Single-Logout.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Issuer`}
                        name="issuer">
                        <input type="text" value="${ifDefined(this.source?.issuer)}" class="pf-c-form-control">
                        <p class="pf-c-form__helper-text">${t`Also known as Entity ID. Defaults the Metadata URL.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Binding Type`}
                        ?required=${true}
                        name="bindingType">
                        <select class="pf-c-form-control">
                            <option value=${SAMLSourceBindingTypeEnum.Redirect} ?selected=${this.source?.bindingType === SAMLSourceBindingTypeEnum.Redirect}>
                                ${t`Redirect binding`}
                            </option>
                            <option value=${SAMLSourceBindingTypeEnum.PostAuto} ?selected=${this.source?.bindingType === SAMLSourceBindingTypeEnum.PostAuto}>
                                ${t`Post binding (auto-submit)`}
                            </option>
                            <option value=${SAMLSourceBindingTypeEnum.Post} ?selected=${this.source?.bindingType === SAMLSourceBindingTypeEnum.Post}>
                                ${t`Post binding`}
                            </option>
                        </select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Signing keypair`}
                        name="signingKp">
                        <select class="pf-c-form-control">
                            <option value="" ?selected=${this.source?.signingKp === undefined}>---------</option>
                            ${until(new CryptoApi(DEFAULT_CONFIG).cryptoCertificatekeypairsList({
                                ordering: "pk",
                            }).then(keys => {
                                return keys.results.map(key => {
                                    return html`<option value=${ifDefined(key.pk)} ?selected=${this.source?.signingKp === key.pk}>${key.name}</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Keypair which is used to sign outgoing requests. Leave empty to disable signing.`}</p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            <ak-form-group>
                <span slot="header">
                    ${t`Advanced protocol settings`}
                </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal name="allowIdpInitiated">
                        <div class="pf-c-check">
                            <input type="checkbox" class="pf-c-check__input" ?checked=${first(this.source?.allowIdpInitiated, false)}>
                            <label class="pf-c-check__label">
                                ${t` Allow IDP-initiated logins`}
                            </label>
                        </div>
                        <p class="pf-c-form__helper-text">${t`Allows authentication flows initiated by the IdP. This can be a security risk, as no validation of the request ID is done.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`NameID Policy`}
                        ?required=${true}
                        name="nameIdPolicy">
                        <select class="pf-c-form-control">
                            <option value=${SAMLSourceNameIdPolicyEnum._20nameidFormatpersistent} ?selected=${this.source?.nameIdPolicy === SAMLSourceNameIdPolicyEnum._20nameidFormatpersistent}>
                                ${t`Persistent`}
                            </option>
                            <option value=${SAMLSourceNameIdPolicyEnum._11nameidFormatemailAddress} ?selected=${this.source?.nameIdPolicy === SAMLSourceNameIdPolicyEnum._11nameidFormatemailAddress}>
                                ${t`Email address`}
                            </option>
                            <option value=${SAMLSourceNameIdPolicyEnum._20nameidFormatWindowsDomainQualifiedName} ?selected=${this.source?.nameIdPolicy === SAMLSourceNameIdPolicyEnum._20nameidFormatWindowsDomainQualifiedName}>
                                ${t`Windows`}
                            </option>
                            <option value=${SAMLSourceNameIdPolicyEnum._20nameidFormatX509SubjectName} ?selected=${this.source?.nameIdPolicy === SAMLSourceNameIdPolicyEnum._20nameidFormatX509SubjectName}>
                                ${t`X509 Subject`}
                            </option>
                            <option value=${SAMLSourceNameIdPolicyEnum._20nameidFormattransient} ?selected=${this.source?.nameIdPolicy === SAMLSourceNameIdPolicyEnum._20nameidFormattransient}>
                                ${t`Transient`}
                            </option>
                        </select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Delete temporary users after`}
                        ?required=${true}
                        name="temporaryUserDeleteAfter">
                        <input type="text" value="${this.source?.temporaryUserDeleteAfter || "days=1"}" class="pf-c-form-control" required>
                        <p class="pf-c-form__helper-text">${t`Time offset when temporary users should be deleted. This only applies if your IDP uses the NameID Format 'transient', and the user doesn't log out manually. (Format: hours=1;minutes=2;seconds=3).`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Digest algorithm`}
                        ?required=${true}
                        name="digestAlgorithm">
                        <select class="pf-c-form-control">
                            <option value=${SAMLSourceDigestAlgorithmEnum._200009Xmldsigsha1} ?selected=${this.source?.digestAlgorithm === SAMLSourceDigestAlgorithmEnum._200009Xmldsigsha1}>
                                ${t`SHA1`}
                            </option>
                            <option value=${SAMLSourceDigestAlgorithmEnum._200104Xmlencsha256} ?selected=${this.source?.digestAlgorithm === SAMLSourceDigestAlgorithmEnum._200104Xmlencsha256 || this.source?.digestAlgorithm === undefined}>
                                ${t`SHA256`}
                            </option>
                            <option value=${SAMLSourceDigestAlgorithmEnum._200104XmldsigMoresha384} ?selected=${this.source?.digestAlgorithm === SAMLSourceDigestAlgorithmEnum._200104XmldsigMoresha384}>
                                ${t`SHA384`}
                            </option>
                            <option value=${SAMLSourceDigestAlgorithmEnum._200104Xmlencsha512} ?selected=${this.source?.digestAlgorithm === SAMLSourceDigestAlgorithmEnum._200104Xmlencsha512}>
                                ${t`SHA512`}
                            </option>
                        </select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Signature algorithm`}
                        ?required=${true}
                        name="signatureAlgorithm">
                        <select class="pf-c-form-control">
                            <option value=${SAMLSourceSignatureAlgorithmEnum._200009XmldsigrsaSha1} ?selected=${this.source?.signatureAlgorithm === SAMLSourceSignatureAlgorithmEnum._200009XmldsigrsaSha1}>
                                ${t`RSA-SHA1`}
                            </option>
                            <option value=${SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha256} ?selected=${this.source?.signatureAlgorithm === SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha256 || this.source?.signatureAlgorithm === undefined}>
                                ${t`RSA-SHA256`}
                            </option>
                            <option value=${SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha384} ?selected=${this.source?.signatureAlgorithm === SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha384}>
                                ${t`RSA-SHA384`}
                            </option>
                            <option value=${SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha512} ?selected=${this.source?.signatureAlgorithm === SAMLSourceSignatureAlgorithmEnum._200104XmldsigMorersaSha512}>
                                ${t`RSA-SHA512`}
                            </option>
                            <option value=${SAMLSourceSignatureAlgorithmEnum._200009XmldsigdsaSha1} ?selected=${this.source?.signatureAlgorithm === SAMLSourceSignatureAlgorithmEnum._200009XmldsigdsaSha1}>
                                ${t`DSA-SHA1`}
                            </option>
                        </select>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            <ak-form-group>
                <span slot="header">
                    ${t`Flow settings`}
                </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${t`Pre-authentication flow`}
                        ?required=${true}
                        name="preAuthenticationFlow">
                        <select class="pf-c-form-control">
                            ${until(new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                                ordering: "pk",
                                designation: FlowDesignationEnum.StageConfiguration,
                            }).then(flows => {
                                return flows.results.map(flow => {
                                    let selected = this.source?.preAuthenticationFlow === flow.pk;
                                    if (!this.source?.preAuthenticationFlow && flow.slug === "default-source-pre-authentication") {
                                        selected = true;
                                    }
                                    return html`<option value=${ifDefined(flow.pk)} ?selected=${selected}>${flow.name} (${flow.slug})</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Flow used before authentication.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Authentication flow`}
                        ?required=${true}
                        name="authenticationFlow">
                        <select class="pf-c-form-control">
                            ${until(new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                                ordering: "pk",
                                designation: FlowDesignationEnum.Authentication,
                            }).then(flows => {
                                return flows.results.map(flow => {
                                    let selected = this.source?.authenticationFlow === flow.pk;
                                    if (!this.source?.authenticationFlow && flow.slug === "default-source-authentication") {
                                        selected = true;
                                    }
                                    return html`<option value=${ifDefined(flow.pk)} ?selected=${selected}>${flow.name} (${flow.slug})</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Flow to use when authenticating existing users.`}</p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Enrollment flow`}
                        ?required=${true}
                        name="enrollmentFlow">
                        <select class="pf-c-form-control">
                            ${until(new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                                ordering: "pk",
                                designation: FlowDesignationEnum.Enrollment,
                            }).then(flows => {
                                return flows.results.map(flow => {
                                    let selected = this.source?.enrollmentFlow === flow.pk;
                                    if (!this.source?.enrollmentFlow && flow.slug === "default-source-enrollment") {
                                        selected = true;
                                    }
                                    return html`<option value=${ifDefined(flow.pk)} ?selected=${selected}>${flow.name} (${flow.slug})</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                        <p class="pf-c-form__helper-text">${t`Flow to use when enrolling new users.`}</p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
        </form>`;
    }

}
