import { CoreApi, PoliciesApi, Policy, PolicyBinding } from "authentik-api";
import { t } from "@lingui/macro";
import { css, CSSResult, customElement, property } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { DEFAULT_CONFIG } from "../../api/Config";
import { Form } from "../../elements/forms/Form";
import { until } from "lit-html/directives/until";
import { ifDefined } from "lit-html/directives/if-defined";
import { first, groupBy } from "../../utils";
import "../../elements/forms/HorizontalFormElement";
import PFToggleGroup from "@patternfly/patternfly/components/ToggleGroup/toggle-group.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";

enum target {
    policy, group, user
}

@customElement("ak-policy-binding-form")
export class PolicyBindingForm extends Form<PolicyBinding> {

    @property({attribute: false})
    set binding(value: PolicyBinding | undefined) {
        this._binding = value;
        if (value?.policyObj) {
            this.policyGroupUser = target.policy;
        }
        if (value?.groupObj) {
            this.policyGroupUser = target.group;
        }
        if (value?.userObj) {
            this.policyGroupUser = target.user;
        }
    }

    get binding(): PolicyBinding | undefined {
        return this._binding;
    }

    _binding?: PolicyBinding;

    @property()
    targetPk?: string;

    @property({type: Number})
    policyGroupUser: target = target.policy;

    getSuccessMessage(): string {
        if (this.binding) {
            return t`Successfully updated binding.`;
        } else {
            return t`Successfully created binding.`;
        }
    }

    static get styles(): CSSResult[] {
        return super.styles.concat(PFToggleGroup, PFContent, css`
            .pf-c-toggle-group {
                justify-content: center;
            }
        `);
    }

    async customValidate(form: PolicyBinding): Promise<PolicyBinding> {
        return form;
    }

    send = (data: PolicyBinding): Promise<PolicyBinding> => {
        if (this.binding) {
            return new PoliciesApi(DEFAULT_CONFIG).policiesBindingsUpdate({
                policyBindingUuid: this.binding.pk || "",
                data: data
            });
        } else {
            return new PoliciesApi(DEFAULT_CONFIG).policiesBindingsCreate({
                data: data
            });
        }
    };

    groupPolicies(policies: Policy[]): TemplateResult {
        return html`
            ${groupBy<Policy>(policies, (p => p.verboseName || "")).map(([group, policies]) => {
                return html`<optgroup label=${group}>
                    ${policies.map(p => {
                        const selected = (this.binding?.policy === p.pk);
                        return html`<option ?selected=${selected} value=${ifDefined(p.pk)}>${p.name}</option>`;
                    })}
                </optgroup>`;
            })}
        `;
    }

    getOrder(): Promise<number> {
        if (this.binding) {
            return Promise.resolve(this.binding.order);
        }
        return new PoliciesApi(DEFAULT_CONFIG).policiesBindingsList({
            target: this.targetPk || "",
        }).then(bindings => {
            const orders = bindings.results.map(binding => binding.order);
            if (orders.length < 1) {
                return 0;
            }
            return Math.max(...orders) + 1;
        });
    }

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <div class="pf-c-card pf-m-selectable pf-m-selected">
                <div class="pf-c-card__body">
                    <div class="pf-c-toggle-group">
                        <div class="pf-c-toggle-group__item">
                            <button class="pf-c-toggle-group__button ${this.policyGroupUser === target.policy ? "pf-m-selected": ""}" type="button" @click=${() => {
                                this.policyGroupUser = target.policy;
                            }}>
                                <span class="pf-c-toggle-group__text">${t`Policy`}</span>
                            </button>
                        </div>
                        <div class="pf-c-divider pf-m-vertical" role="separator"></div>
                        <div class="pf-c-toggle-group__item">
                            <button class="pf-c-toggle-group__button ${this.policyGroupUser === target.group ? "pf-m-selected" : ""}" type="button" @click=${() => {
                                this.policyGroupUser = target.group;
                            }}>
                                <span class="pf-c-toggle-group__text">${t`Group`}</span>
                            </button>
                        </div>
                        <div class="pf-c-divider pf-m-vertical" role="separator"></div>
                        <div class="pf-c-toggle-group__item">
                            <button class="pf-c-toggle-group__button ${this.policyGroupUser === target.user ? "pf-m-selected" : ""}" type="button" @click=${() => {
                                this.policyGroupUser = target.user;
                            }}>
                                <span class="pf-c-toggle-group__text">${t`User`}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pf-c-card__footer">
                    <ak-form-element-horizontal
                        label=${t`Policy`}
                        name="policy"
                        ?hidden=${this.policyGroupUser !== target.policy}>
                        <select class="pf-c-form-control">
                            <option value="" ?selected=${this.binding?.policy === undefined}>---------</option>
                            ${until(new PoliciesApi(DEFAULT_CONFIG).policiesAllList({
                                ordering: "pk"
                            }).then(policies => {
                                return this.groupPolicies(policies.results);
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Group`}
                        name="group"
                        ?hidden=${this.policyGroupUser !== target.group}>
                        <select class="pf-c-form-control">
                            <option value="" ?selected=${this.binding?.group === undefined}>---------</option>
                            ${until(new CoreApi(DEFAULT_CONFIG).coreGroupsList({
                                ordering: "pk"
                            }).then(groups => {
                                return groups.results.map(group => {
                                    return html`<option value=${ifDefined(group.pk)} ?selected=${group.pk === this.binding?.group}>${group.name}</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`User`}
                        name="user"
                        ?hidden=${this.policyGroupUser !== target.user}>
                        <select class="pf-c-form-control">
                            <option value="" ?selected=${this.binding?.user === undefined}>---------</option>
                            ${until(new CoreApi(DEFAULT_CONFIG).coreUsersList({
                                ordering: "pk"
                            }).then(users => {
                                return users.results.map(user => {
                                    return html`<option value=${ifDefined(user.pk)} ?selected=${user.pk === this.binding?.user}>${user.name}</option>`;
                                });
                            }), html`<option>${t`Loading...`}</option>`)}
                        </select>
                    </ak-form-element-horizontal>
                </div>
            </div>
            <input required name="target" type="hidden" value=${ifDefined(this.binding?.target || this.targetPk)}>
            <ak-form-element-horizontal name="enabled">
                <div class="pf-c-check">
                    <input type="checkbox" class="pf-c-check__input" ?checked=${first(this.binding?.enabled, true)}>
                    <label class="pf-c-check__label">
                        ${t`Enabled`}
                    </label>
                </div>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${t`Order`}
                ?required=${true}
                name="order">
                <input type="number" value="${until(this.getOrder())}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${t`Timeout`}
                ?required=${true}
                name="timeout">
                <input type="number" value="${first(this.binding?.timeout, 30)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
        </form>`;
    }

}
