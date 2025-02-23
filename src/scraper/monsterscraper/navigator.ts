// Navigator.ts

import { Page } from 'puppeteer';
import { retry } from './Utils';
import Logger from './Logger';

class Navigator {
    public async setUserAgent(page: Page): Promise<void> {
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        await page.setUserAgent(userAgent);
    }

    public async searchJobs(page: Page, jobTitle: string, location: string): Promise<void> {
        try {
            await retry(async () => {
                await page.goto('https://www.monster.com');
                await page.waitForSelector('[data-testid="combobox"][name="q"]');
                await page.type('[data-testid="combobox"][name="q"]', jobTitle);
                await page.type('[data-testid="combobox"][name="where"]', location);
                await page.keyboard.press('Enter');
                await page.waitForSelector('.cCDXOr');
            });
        } catch (error) {
            Logger.error('Error in navigating and searching jobs', error);
            throw error;
        }
    }
}

export default Navigator;
