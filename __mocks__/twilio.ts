
export class Twilio {
    constructor(protected account: string, protected authentication_token: string) {

    }

    messages = {
        create: async (options: any) => {
            const currentTime = new Date(Date.now());
            return {
                account_sid: '',
                api_version: '',
                body: options.body,
                date_created: currentTime,
                date_sent: currentTime,
                date_updated: currentTime,
                direction: 'outbound-api',
                error_code: null,
                error_message: null,
                from: options.from,
                messaging_service_sid: '',
                num_media: '0',
                num_segments: '1',
                price: null,
                price_unit: null,
                sid: '',
                status: 'sent',
                subresource_uris: {
                    media: ''
                },
                to: options.to,
                uri: ''
            }
        }
    }
}

class MessagingResponse {
    private responseMessage: string;

    constructor() {
        this.responseMessage = '';
    }

    message(responseMessage: string) {
        this.responseMessage = responseMessage;
    }
}

module.exports = {
    Twilio,
    twiml: {
        MessagingResponse
    }
}