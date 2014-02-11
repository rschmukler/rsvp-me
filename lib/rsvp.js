var request = require('superagent'),
    noop = function() { };

function Event(apiKey, event) {
  this.apiKey = apiKey;
  this.id = event;
}

Event.prototype.checkEvent = function(done) {
  done = done || noop;
  var self = this;
  request.get('api.meetup.com/2/event/' + this.id)
  .query({key: this.apiKey})
  .end(function(res) {
    if(!res.ok) return done(new Error("Error getting event " + self.id + " from meetup"), res);
    if(res.body.yes_rsvp_count == res.body.rsvp_limit) return done(new Error("Event already full, with " + res.body.waitlist_count + " on the waitlist"), res);
    self.rsvpsOpenAt = new Date(res.body.rsvp_rules.open_time);
    done();
  });
};

Event.prototype.scheduleRsvp = function(done) {
  var self = this;
  this.checkEvent(function(err) {
    if(err) return done(err);

    var now = new Date();
    if(now > self.rsvpsOpenAt) return self.rsvp(done);
    else setTimeout(function() {
      self.rsvp();
    }, self.rsvpsOpenAt.valueOf() - now.valueOf() + 1000);
    done();
  });
};

Event.prototype.rsvp = function(done) {
  done = done || noop;
  var url = 'api.meetup.com/2/rsvp';
  request.post(url).send({
    event_id: this.id,
    key: this.apiKey,
    rsvp: 'yes'
  }).end(function(res) {
    if(res.status != 202) return done(new Error("Error from meetup API: " + res.body), res);
    done(null, res);
  });
};

module.exports = Event;
