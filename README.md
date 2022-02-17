
# local development startup

## requirements

- node v14
- npm

```
# install dependencies
npm install

# run development
npm run dev
```

## required environmental variables

can be stored in a file called `.env.local`

```
TWILIO_ACCOUNT_SID=Your-Account-SID
TWILIO_AUTH_TOKEN=Your-Twilio-Auth-Token
TWILIO_PHONE_NUMBER=Your-Twilio-Number
NEXT_PUBLIC_PHONE_NUMBER=Twilio-Number-Used-For-Display
MONGODB_URI=Your-MongoDB-URI
LOG_LEVEL=Log-Level
BASIC_AUTH_USERNAME=username-for-basic-auth
BASIC_AUTH_PASSWORD=password-for-basic-auth
BASIC_AUTH_METRICS_USERNAME=username-for-metrics-page
BASIC_AUTH_METRICS_PASSWORD=password-for-metrics-page

```

## util scripts

```
# load test data
npm run loadtestdata

# delete test data
npm run deletetestdata
```

## expose local server so twilio can send messages

```
# install twilio cli
npm install -g twilio-cli

# set env variable from .env.local
set -a
source .env.local
set +a

# set twilio webhook to local server
twilio phone-numbers:update "$TWILIO_PHONE_NUMBER" --sms-url="http://localhost:3000/api/sms"
```

## heroku setup

```
# install heroku if not already
# linux
curl https://cli-assets.heroku.com/install.sh | sh

# log into heroku
heroku login

# add project to heroku
heroku git:remote -a courtbotvt

# add config vars
# heroku config:set VARIABLE_NAME=value
```

## heroku deployment

```
# deploy latest site
git push heroku main
```

## heroku scheduler

```
# add scheduler for sending reminders
# install scheduler
heroku addons:create scheduler:standard
```

go to (heroku dashboard)[https://dashboard.heroku.com/] and create a job with the following command
`npx ts-node --project scripts/tsconfig.json -T scripts/send-reminders.ts`
Set it to run at 10PM UTC which is 6PM EDT or 5PM EST.
