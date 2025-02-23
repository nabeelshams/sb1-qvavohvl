// Extractor.ts

import { Page, ElementHandle } from 'puppeteer';
import { JobDetails } from './Validator';
import { retry } from './Utils';
import Logger from './Logger';

class Extractor {
    public async getUnprocessedVisibleJobCards(page: Page, processedJobIds: Set<string>): Promise<ElementHandle<Element>[]> {
        const jobCards = await page.$$('[data-testid="JobCardButton"]');
        const unprocessedCards: ElementHandle<Element>[] = [];

        for (const card of jobCards) {
            const jobId = await card.evaluate(el => el.getAttribute('data-job-id'));
            if (jobId && !processedJobIds.has(jobId)) {
                unprocessedCards.push(card);
            }
        }

        return unprocessedCards;
    }

    public async extractJobDetails(page: Page, jobCard: ElementHandle<Element>): Promise<JobDetails | null> {
        try {
            const jobId = await jobCard.evaluate(el => el.getAttribute('data-job-id'));
            if (!jobId) return null;

            await jobCard.click();
            await page.waitForSelector('[data-testid="jobTitle"]');

            const jobDetails: JobDetails = {
                jobId,
                jobTitle: (await this.getTextContent(page, '[data-testid="jobTitle"]')) || '',
                companyName: (await this.getTextContent(page, '[data-testid="company"]')) || '',
                location: (await this.getTextContent(page, '[data-testid="jobDetailLocation"]')) || '',
                salary: await this.getTextContent(page, '.cUdlIV'),
                jobDescription: await this.getTextContent(page, '.bYEtmI'),
                postingDate: (await this.getTextContent(page, '[data-testid="jobDetailDateRecency"]')) || ''
            };

            return jobDetails;
        } catch (error) {
            Logger.error('Error extracting job details', error);
            return null;
        }
    }

    private async getTextContent(page: Page, selector: string): Promise<string | null> {
        try {
            const element = await page.$(selector);
            if (element) {
                return await page.evaluate(el => el.textContent, element);
            }
            return null;
        } catch (error) {
            Logger.error('Error getting text content', error);
            return null;
        }
    }
}

export default Extractor;
