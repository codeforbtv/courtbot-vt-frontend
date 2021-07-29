
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