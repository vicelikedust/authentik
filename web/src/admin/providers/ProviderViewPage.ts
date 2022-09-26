import "@goauthentik/admin/providers/ldap/LDAPProviderViewPage";
import "@goauthentik/admin/providers/oauth2/OAuth2ProviderViewPage";
import "@goauthentik/admin/providers/proxy/ProxyProviderViewPage";
import "@goauthentik/admin/providers/saml/SAMLProviderViewPage";
import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { AKElement } from "@goauthentik/elements/Base";
import "@goauthentik/elements/EmptyState";
import "@goauthentik/elements/PageHeader";
import "@goauthentik/elements/buttons/SpinnerButton";

import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import AKGlobal from "@goauthentik/common/styles/authentik.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";

import { Provider, ProvidersApi } from "@goauthentik/api";

@customElement("ak-provider-view")
export class ProviderViewPage extends AKElement {
    @property({ type: Number })
    set providerID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG)
            .providersAllRetrieve({
                id: value,
            })
            .then((prov) => (this.provider = prov));
    }

    @property({ attribute: false })
    provider?: Provider;

    static get styles(): CSSResult[] {
        return [PFPage, AKGlobal];
    }

    renderProvider(): TemplateResult {
        if (!this.provider) {
            return html`<ak-empty-state ?loading=${true} ?fullHeight=${true}></ak-empty-state>`;
        }
        switch (this.provider?.component) {
            case "ak-provider-saml-form":
                return html`<ak-provider-saml-view
                    providerID=${ifDefined(this.provider.pk)}
                ></ak-provider-saml-view>`;
            case "ak-provider-oauth2-form":
                return html`<ak-provider-oauth2-view
                    providerID=${ifDefined(this.provider.pk)}
                ></ak-provider-oauth2-view>`;
            case "ak-provider-proxy-form":
                return html`<ak-provider-proxy-view
                    providerID=${ifDefined(this.provider.pk)}
                ></ak-provider-proxy-view>`;
            case "ak-provider-ldap-form":
                return html`<ak-provider-ldap-view
                    providerID=${ifDefined(this.provider.pk)}
                ></ak-provider-ldap-view>`;
            default:
                return html`<p>Invalid provider type ${this.provider?.component}</p>`;
        }
    }

    render(): TemplateResult {
        return html`<ak-page-header
                icon="pf-icon pf-icon-integration"
                header=${ifDefined(this.provider?.name)}
                description=${ifDefined(this.provider?.verboseName)}
            >
            </ak-page-header>
            <ak-tabs>
                <section slot="page-overview" data-tab-title="${t`Overview`}">
                    ${this.renderProvider()}
                </section>
                <section
                    slot="page-changelog"
                    data-tab-title="${t`Changelog`}"
                    class="pf-c-page__main-section pf-m-no-padding-mobile"
                >
                    <div class="pf-c-card">
                        <div class="pf-c-card__body">
                            <ak-object-changelog
                                targetModelPk=${this.provider?.pk || ""}
                                targetModelName=${this.provider?.metaModelName || ""}
                            >
                            </ak-object-changelog>
                        </div>
                    </div>
                </section>
            </ak-tabs>`;
    }
}