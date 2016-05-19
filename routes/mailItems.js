/**
 * Created by floriangoeteyn on 09-Mar-16.
 */
var express = require('express');
var router = express.Router();

var ews = require('ews-javascript-api');

var mails;



/*
//create AutodiscoverService object
var autod = new ews.AutodiscoverService(new ews.Uri("https://webmail.gent.be/autodiscover/autodiscover.xml"), ews.ExchangeVersion.Exchange2010);
//you can omit url and it will autodiscover the url, version helps throw error on client side for unsupported operations.example - //var autod = new ews.AutodiscoverService(ews.ExchangeVersion.Exchange2010);
//set credential for service
autod.Credentials = new ews.ExchangeCredentials("verkeer", "Koningauto1");
//create array to include list of desired settings
var settings = [
  ews.UserSettingName.InternalEwsUrl,
  ews.UserSettingName.ExternalEwsUrl,
  ews.UserSettingName.UserDisplayName,
  ews.UserSettingName.UserDN,
  ews.UserSettingName.EwsPartnerUrl,
  ews.UserSettingName.DocumentSharingLocations,
  ews.UserSettingName.MailboxDN,
  ews.UserSettingName.ActiveDirectoryServer,
  ews.UserSettingName.CasVersion,
  ews.UserSettingName.ExternalWebClientUrls,
  ews.UserSettingName.ExternalImap4Connections,
  ews.UserSettingName.AlternateMailboxes
];
//get the setting
autod.GetUserSettings("verkeer@stad.gent", settings)
  .then(function (response) {
    //do what you want with user settings
    var tabcount = 0;
    var tabs = function () { return ews.StringHelper.Repeat("\t", tabcount); };
    console.log(autod.Url.ToString());
    //uncoment next line to see full response from autodiscover, you will need to add var util = require('util');
    //console.log(util.inspect(response, { showHidden: false, depth: null, colors: true }));
    for (var _i = 0, _a = response.Responses; _i < _a.length; _i++) {
      var resp = _a[_i];
      console.log(ews.StringHelper.Format("{0}settings for username: {1}", tabs(), resp.SmtpAddress));
      tabcount++;
      for (var setting in resp.Settings) {
        console.log(ews.StringHelper.Format("{0}{1} = {2}", tabs(), ews.UserSettingName[setting], resp.Settings[setting]));
      }
      tabcount--;
    }
  }, function (e) {
    //log errors or do something with errors
    console.log(e);
  });*/
/*
var ews = require('ews-javascript-api');

var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2010);
exch.Credentials = new ews.ExchangeCredentials("verkeer", "Koningauto1", "webmail.gent.be");
exch.Url = new ews.Uri("https://webmail.gent.be/Ews/Exchange.asmx");

var attendee =new ews.AttendeeInfo("verkeer@stad.gent");
var timeWindow = new ews.TimeWindow(ews.DateTime.Now, new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(48).asMilliseconds()));

exch.GetUserAvailability(attendee, timeWindow, ews.AvailabilityData.FreeBusyAndSuggestions).then(function (availabilityResponse) {
    console.log("succes");
  }, function (errors) {
    console.log(errors);
  });


*/
/*
var https = require('https');

var username = 'verkeer';
var password = 'Koningauto1';
var auth = 'NTLM ' + new Buffer(username + ":" + password).toString('base64');

var options = {
  host : 'webmail.gent.be',
  port : 443,
  method : 'post',
  path : '/Ews/Exchange.asmx',
  headers : { Authorization : auth }
};

var request = https.request(options, function(response) {
  console.log('Status: ' + response.statusCode);
});

request.write('<soapenv:Envelope  ...></soapenv:Envelope>');
request.end();

router.get('/', function(req, res, next) {
  res.send(mails);
});

var httpntlm = require('httpntlm');


httpntlm.get({
  url: "https://webmail.gent.be/ews/exchange.asmx",
  username: 'verkeer',
  password: 'Koningauto1',
  workstation: '',
  domain: ''
}, function (err, response){
  if(err) return err;

  console.log(response.headers);
  console.log(response.body);
});

*/


module.exports = router;
