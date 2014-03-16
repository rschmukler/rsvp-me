var request = require('superagent'),
    chalk = require('chalk'),
    noop = function() { };

function Event(apiKey, event) {
  this.apiKey = apiKey;
  if(/^\d+$/.test(event)) this.id = event;
  else {
    this.id = event.match(/(\d+)\/?$/)[1];
  }
  if(!this.id) throw new Error("Could not parse event ID");
}

Event.prototype.checkEvent = function(done) {
  done = done || noop;
  var self = this;
  console.log('[' + chalk.blue('info') + '] checking event ' + chalk.cyan(this.id));
  request.get('api.meetup.com/2/event/' + this.id)
  .query({
    key: this.apiKey,
    fields: 'rsvp_rules'
  })
  .end(function(res) {
    if(!res.ok) return done(new Error("Error getting event " + self.id + " from meetup"), res);
    if(res.body.yes_rsvp_count == res.body.rsvp_limit) return done(new Error("Event already full, with " + res.body.waitlist_count + " on the waitlist"), res);
    if(res.body.rsvp_rules && res.body.rsvp_rules.open_time)
      self.rsvpsOpenAt = new Date(res.body.rsvp_rules.open_time);
    else
      self.rsvpsOpenAt = new Date();
    done();
  });
};

Event.prototype.scheduleRsvp = function(done) {
  var self = this;
  this.checkEvent(function(err) {
    if(err) return done(err);

    var now = new Date();
    var msg = '[' + chalk.blue('info') + '] rsvps are currently ';
    if(now >= self.rsvpsOpenAt) {
      msg += chalk.green('open') + ', rsvping...';
      console.log(msg);
      return self.rsvp(done);
    }
    else {
      msg += chalk.yellow('not open') + ', rsvping in ' + chalk.cyan(timeDiff(now, self.rsvpsOpenAt));
      console.log(msg);
      setTimeout(function() {
        self.rsvp.call(self, done);
      }, self.rsvpsOpenAt.valueOf() - now.valueOf() + 1000);
    }
  });
};

Event.prototype.rsvp = function(done) {
  done = done || noop;
  var url = 'api.meetup.com/2/rsvp';
  request
  .post(url)
  .query({
    event_id: this.id,
    key: this.apiKey,
    agree_to_refund: true,
    rsvp: 'yes'
  }).end(function(res) {
    if(res.status != 201) return done(new Error("Error from meetup API: "), res);
    done(null, res);
  });
};

module.exports = Event;

function timeDiff(a, b) {
  var diff = Math.abs(a - b);
  
  var oneSecond = 1000,
      oneMinute = oneSecond * 60,
      oneHour = oneMinute * 60,
      oneDay = oneHour * 24;

  if(diff > oneDay) return '' + ((diff % oneDay) / oneDay < 0.5 ? Math.floor(diff / oneDay) : Math.ceil(diff / oneDay)) + ' days';
  if(diff > oneHour) return '' + ((diff % oneHour) / oneHour < 0.5 ? Math.floor(diff / oneHour) : Math.ceil(diff / oneHour)) + ' hours';
  if(diff > oneMinute) return '' + ((diff % oneMinute) / oneMinute < 0.5 ? Math.floor(diff / oneMinute) : Math.ceil(diff / oneMinute)) + ' minutes';
  else return '' + ((diff % oneSecond) / oneSecond < 0.5 ? Math.floor(diff / oneSecond) : Math.ceil(diff / oneSecond)) + ' seconds';
}
