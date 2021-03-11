var user = pm.environment.get("username");
var pwd = pm.environment.get("password");
var protocol = pm.environment.get("protocol");
var resthost = pm.environment.get("rest-host");
var context = pm.environment.get("context");

var url = protocol + "://" + resthost + "/" + context + "/api/authn/login";
console.log(url);
// Example with a full fledged SDK Request
const echoPostRequest = {
  url: url,
  method: 'POST',
  //header: 'Content-Type:application/x-www-form-urlencoded',
 /* body: {
     mode: 'raw',
     raw: JSON.stringify( { user: 'dspacedemo+submit@gmail.com', password: 'dspace'  })
  }*/
  body: {
    mode: 'formdata',
    formdata: [
         {key: 'user', value: user},
         {key: 'password', value: pwd}
    ]
  }
};

// 1. First login attept (fails, to obtain an up to date csrf token)
pm.sendRequest(echoPostRequest, function (err, res) {
  
    var csrf = res.headers.get("DSPACE-XSRF-TOKEN");
    console.log('CSRF token: ', csrf);

    // add csrf header globally (so that every request will contain the X-XSRF-TOKEN)
    pm.request.headers.add( { key: 'X-XSRF-TOKEN', value: csrf });

    // 2. Second login attempt with a valid csrf token
    echoPostRequest.header = 'X-XSRF-TOKEN: ' + csrf
    pm.sendRequest(echoPostRequest, function (err2, res2) {

        var token = res2.headers.get("Authorization");
        var defaultToken = pm.environment.get("token");
        console.log(token);
        if (token !== undefined && token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length).trimLeft();
        } else {
            token = defaultToken;
        }
        console.log('JWT token:', token);
        
        pm.globals.set("token", token);

    });

});