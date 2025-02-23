// Converter.ts

class Converter {
    public convertRelativeDate(relativeDate: string): string | null {
        const now = new Date();
        const matches = relativeDate.match(/(\\d+)\\s+(day|days|month|months|hour|hours|minute|minutes|week|weeks)\\s+ago/);

        if (!matches) {
            if (relativeDate.toLowerCase() === 'today') {
                return now.toISOString().split('T')[0];
            }
            if (relativeDate.toLowerCase() === 'yesterday') {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString().split('T')[0];
            }
            return null;
        }

        const [, number, unit] = matches;
        const date = new Date(now);
        const numValue = parseInt(number);

        switch (unit) {
            case 'minute':
            case 'minutes':
                date.setMinutes(date.getMinutes() - numValue);
                break;
            case 'hour':
            case 'hours':
                date.setHours(date.getHours() - numValue);
                break;
            case 'day':
            case 'days':
                date.setDate(date.getDate() - numValue);
                break;
            case 'week':
            case 'weeks':
                date.setDate(date.getDate() - (numValue * 7));
                break;
            case 'month':
            case 'months':
                date.setMonth(date.getMonth() - numValue);
                break;
        }

        return date.toISOString().split('T')[0];
    }
}

export default Converter;
