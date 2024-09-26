//https://community.grafana.com/t/click-an-element-on-the-page-after-clicking-an-element-within-an-iframe/106528/22

import { check } from 'k6';
import { browser } from 'k6/browser';

/*
export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
}; */

export const options = {
    scenarios: {
        ui: {
            // mandatory fields; executor, options-->browser-->type
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
    thresholds: {
        checks: ['rate==1.0'],
    },
}

export default async function () {
    const page = await browser.newPage();


    try {
        await page.goto("https://www.directline.com/my-dashboard#/sign-in", {
            waitUntil: "networkidle",
        });

        await Promise.all([
                page.locator(button[id="onetrust-accept-btn-handler"]).click(),
        ]);

        let frames = await page.frames();

        for (const frame of frames) {
            console.log("----> " + frame.title() + " - " + frame.name());
            if (frame.title() === "reCAPTCHA" && frame.name().startsWith("a")) {
                console.log("====> Frame: " + frame.title() + " - " + frame.name());
                const spanElement = frame.locator("#recaptcha-anchor");
                spanElement.focus();
                spanElement.dispatchEvent("click");
            }
        }

        check(page, {
            header: (p) => p.locator("h1").textContent() == "My Account",
        });
    } finally {
        await page.close();
    }
}