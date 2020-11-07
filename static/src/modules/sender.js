var SendHeight = (function(){

  // this is the event identifier for the messaging between
  // parent and iframe
  var EVENT_ID = 'component-iframed.elections-viz-map';

  // listen for event from parent to send the height information
  function listener()  {
    var message = event.data,
        receiverId = EVENT_ID + '.receiver';

    var type = (message && message.type) ? message.type : false,
        data = (message && message.data) ? message.data : false;

    if (type === receiverId && data) {
      sender();
    }
  }

  // when there is a resize change (window resize or orientation change)
  onResize(sender);

  // sends the height of this iframe to the parent
  function sender() {
    var height = (document.getElementsByTagName('html') || document.getElementsByTagName('body'))[0].offsetHeight;

    var info = {
      type: getQs()['uid'] || EVENT_ID,
      data: {
        event: 'resize',
        data: height
      }
    };

    // console.log('sending ifr height >>>', info);
    try {
      window.parent.postMessage(info, "*");
    } catch(err) {
      console.log("error:", err);
    }
  }

  try {
    window.addEventListener("message", listener, false);
  } catch (error) {
    window.attachEvent("onmessage", listener);
  }

  // when this iframe resizes or changes orientation
  // send the height to the parent
  function onResize(callback) {
    var threshold = 25,
      hasOrientation = ('onorientationchange' in window) ? true : false,
      onEvent = (hasOrientation) ? 'orientationchange' : 'resize',
      timeout;

      window.addEventListener(onEvent, function(){
        trigger();
        if (onEvent === 'orientationchange') {
          setTimeout(function () {
            trigger();
          }, 800);
        }
      }, false);

      function trigger() {
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            callback();
        }, threshold);
      }
  }

  // get query val
  function getQs() {
    var ret = {},
      query = window.location.search.substr(1) || "",
      vals = query.split("&");

    for (var x = 0; x < vals.length; x++) {
      var sp = vals[x].split("="),
        name = sp[0] || false,
        value = sp[1] || false;

      if (name && value) {
        ret[name] = (cleanQs(value)).toString();
      }
    }

    return ret;
  }

  function cleanQs(val) {
    val = val.replace(/^\s+|\s$/g, '');
    val = decodeURIComponent(val);
    val = val.replace(/\+/g," "); // + --> spaces
    val = val.replace(/\s+/g," "); // excess spaces in between
    val = val.replace(/</g, "&lt;"); // tags
    val = val.replace(/\>/g, "&gt;"); // tags
    return val;
  }

  // return function to execute sender
  return function() {
    sender();
  };

})();

export default SendHeight;
