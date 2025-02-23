// MonsterScraper.ts

import puppeteer, { Browser, Page } from 'puppeteer';
import Navigator from './Navigator';
import Extractor from './Extractor';
import { JobDetails, ScrapedJobs } from './Validator';
import Logger from './Logger';
import { getNextProxy, setProxyList } from './Utils';

class MonsterScraper {
    private browser: Browser | null;
    private page: Page | null;
    private readonly baseUrl: string;
    private processedJobIds: Set<string>;
    private navigator: Navigator;
    private extractor: Extractor;

    constructor(proxies: string[] = []) {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://www.monster.com';
        this.processedJobIds = new Set<string>();
        this.navigator = new Navigator();
        this.extractor = new Extractor();

        if (proxies.length > 0) {
            setProxyList(proxies);
        }
    }

    private async initialize(): Promise<void> {
        const proxy = getNextProxy();
        const launchOptions = {
            headless: 'new',
            args: ['--no-sandbox']
        };

        if (proxy) {
            launchOptions.args.push(`--proxy-server=${proxy}`);
            Logger.info(`Using proxy: ${proxy}`);
        }

        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();
        await this.navigator.setUserAgent(this.page);
    }

    private async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }

    public async scrapeJobs(jobTitle: string, location: string, maxJobs: number = 100): Promise<ScrapedJobs> {
        try {
            await this.initialize();
            if (!this.page) throw new Error('Page not initialized');
            await this.navigator.searchJobs(this.page, jobTitle, location);

            const jobs = await this.extractor.scrapeJobsProgressively(this.page, maxJobs, this.processedJobIds);

            await this.close();

            return { jobs };
        } catch (error) {
            Logger.error('Error in scraping jobs', error);
            await this.close();
            throw error;
        }
    }
}

export default MonsterScraper;
