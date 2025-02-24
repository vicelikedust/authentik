import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import ClientOnly from "@docusaurus/core/lib/client/exports/ClientOnly.js";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import BeforeAfterSlider from 'react-before-after-slider'
import Comparison from "../comparison";

const features = [
    {
        title: "Easy to Use",
        description: (
            <>
                Identity made easy. authentik makes single-sign on (SSO), user
                enrollment, and access control simple.
            </>
        ),
    },
    {
        title: "Realise your workflow",
        description: (
            <>
                authentik lets you build your workflow as you need it, no
                limitations.
            </>
        ),
    },
    {
        title: "Powered by Python",
        description: (
            <>
                Implement custom verification or access control logic using
                Python code.
            </>
        ),
    },
];

function Feature({ imageUrl, title, description }) {
    const imgUrl = useBaseUrl(imageUrl);
    return (
        <div className={clsx("col col--4", styles.feature)}>
            {imgUrl && (
                <div className="text--center">
                    <img
                        className={styles.featureImage}
                        src={imgUrl}
                        alt={title}
                    />
                </div>
            )}
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;
    return (
        <Layout title="Welcome" description={siteConfig.tagline}>
            <header className={clsx("hero hero--primary", styles.heroBanner)}>
                <div className="container">
                    <div className="row">
                        <div className="col padding-top--lg">
                            <h1 className="hero__title">
                                {siteConfig.tagline}
                            </h1>
                            <p className="hero__subtitle">
                                authentik is an open-source Identity Provider
                                focused on flexibility and versatility
                            </p>
                            <div className={styles.buttons}>
                                <Link
                                    className={clsx(
                                        "button button--outline button--secondary button--lg",
                                        styles.getStarted
                                    )}
                                    to={useBaseUrl("docs/installation/index")}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                        <div className="col text--center hero_image">
                            <img alt="authentik logo" src={useBaseUrl("img/icon_top_brand.svg")} />
                        </div>
                    </div>
                </div>
            </header>
            <main>
                <section className={styles.features}>
                    <div className="container">
                        <div className={clsx("row", styles.rowFeatures)}>
                            {features.map((props, idx) => (
                                <Feature key={idx} {...props} />
                            ))}
                        </div>
                        <div className="row">
                            <div className="col col--5">
                                <div>
                                    <ClientOnly>
                                        <BeforeAfterSlider
                                            className={styles.featureImage}
                                            before={useBaseUrl("img/screen_apps_light.jpg")}
                                            after={useBaseUrl("img/screen_apps_dark.jpg")}
                                            width={640}
                                            height={480}
                                        />
                                    </ClientOnly>
                                </div>
                            </div>
                            <div className="col col--5 col--offset-2 padding-vert--xl">
                                <h2>What is authentik?</h2>
                                <p>
                                    authentik is an open-source Identity Provider
                                    focused on flexibility and versatility. You
                                    can use authentik in an existing environment
                                    to add support for new protocols, implement
                                    sign-up/recovery/etc. in your application so
                                    you don't have to deal with it, and many other
                                    things.
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col col--5 col--offset-2 padding-vert--xl">
                                <h2>Utmost flexibility</h2>
                                <p>
                                    You can adopt authentik to your environment,
                                    regardless of your requirements. Need an Active-Directory
                                    integrated SSO Provider? Do you want
                                    to implement a custom enrollment process for your
                                    customers? Are you developing an application and
                                    don't want to deal with User verification and recovery?
                                    authentik can do all of that, and more!
                                </p>
                            </div>
                            <div className="col col--5">
                                <div>
                                    <ClientOnly>
                                        <BeforeAfterSlider
                                            className={styles.featureImage}
                                            before={useBaseUrl("img/screen_admin_light.jpg")}
                                            after={useBaseUrl("img/screen_admin_dark.jpg")}
                                            width={640}
                                            height={480}
                                        />
                                    </ClientOnly>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <Comparison></Comparison>
                </section>
            </main>
        </Layout>
    );
}

export default Home;
