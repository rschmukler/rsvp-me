# rsvp-me

RSVP Sniper for Meetup.com

## Why?

Meetups are awesome. In bigger cities some of the more popular meetups can fill
up in a matter of minutes. You can't always be available when RSVPs open up...

## Installation

Install with npm

```
npm install -g rsvp-me
```

## Usage


#### Configuring API Key
First you will need to generate a config file for `rsvp-me`. This will save your
api key to `~/.rsvpmerc`. You may re-run this command as needed to save a new
API key.

```
rsvp-me -a <YOUR MEETUP API KEY> --save
```

#### Scheduling a RSVP

To RSVP to an event, simply run `rsvp-me` with the URL to that event. If
RSVPing is open, it will try and grab you a spot. Otherwise it will wait
until registrations open and then try to snipe.

```
rsvp-me <URL TO EVENT>
```
