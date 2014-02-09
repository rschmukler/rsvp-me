var request = require('superagent'),
    noop = function() { };

function Event(apiKey, event, done) {
  this.apiKey = apiKey;
  this.id = event;
  this.checkEvent(done);
}

Event.prototype.checkEvent = function(done) {
  done = done || noop;
  var self = this;
  request.get('api.meetup.com/2/event/' + this.id)
  .query({key: this.apiKey})
  .end(function(res) {
    if(!res.ok) return done(new Error("Error getting event " + self.id + " from meetup"), res);
    if(res.body.yes_rsvp_count == res.body.rsvp_limit) return done(new Error("Event already full, with " + res.body.waitlist_count + " on the waitlist"), res);
    done();
  });
};

module.exports = Event;
