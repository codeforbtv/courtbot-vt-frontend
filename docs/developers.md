# Developer Documentation

## [SMS Test Page](http://localhost:3000/dev/sms)

**This page is only available in a dev environment aka `NODE_ENV=development`**

Useful test page for sending messages to our endpoint and interacting with it. If the site prompts for a username & password, then use the basic auth credentials defined in your local environment. `BASIC_AUTH_USERNAME` & `BASIC_AUTH_PASSWORD`.


## Useful Tips

### Find input to get multiple cases

The lookup uses a regex to find cases, so just input something like `22-CR-0` so it will match more than 1 case.