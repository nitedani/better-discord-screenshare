/**
* @name plugin
*/
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2720:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports =
{
  parallel      : __webpack_require__(1286),
  serial        : __webpack_require__(4694),
  serialOrdered : __webpack_require__(7458)
};


/***/ }),

/***/ 4653:
/***/ ((module) => {

// API
module.exports = abort;

/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */
function abort(state)
{
  Object.keys(state.jobs).forEach(clean.bind(state));

  // reset leftover jobs
  state.jobs = {};
}

/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */
function clean(key)
{
  if (typeof this.jobs[key] == 'function')
  {
    this.jobs[key]();
  }
}


/***/ }),

/***/ 5209:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defer = __webpack_require__(5623);

// API
module.exports = async;

/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */
function async(callback)
{
  var isAsync = false;

  // check if async happened
  defer(function() { isAsync = true; });

  return function async_callback(err, result)
  {
    if (isAsync)
    {
      callback(err, result);
    }
    else
    {
      defer(function nextTick_callback()
      {
        callback(err, result);
      });
    }
  };
}


/***/ }),

/***/ 5623:
/***/ ((module) => {

module.exports = defer;

/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */
function defer(fn)
{
  var nextTick = typeof setImmediate == 'function'
    ? setImmediate
    : (
      typeof process == 'object' && typeof process.nextTick == 'function'
      ? process.nextTick
      : null
    );

  if (nextTick)
  {
    nextTick(fn);
  }
  else
  {
    setTimeout(fn, 0);
  }
}


/***/ }),

/***/ 8773:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var async = __webpack_require__(5209)
  , abort = __webpack_require__(4653)
  ;

// API
module.exports = iterate;

/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */
function iterate(list, iterator, state, callback)
{
  // store current index
  var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;

  state.jobs[key] = runJob(iterator, key, list[key], function(error, output)
  {
    // don't repeat yourself
    // skip secondary callbacks
    if (!(key in state.jobs))
    {
      return;
    }

    // clean up jobs
    delete state.jobs[key];

    if (error)
    {
      // don't process rest of the results
      // stop still active jobs
      // and reset the list
      abort(state);
    }
    else
    {
      state.results[key] = output;
    }

    // return salvaged results
    callback(error, state.results);
  });
}

/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */
function runJob(iterator, key, item, callback)
{
  var aborter;

  // allow shortcut if iterator expects only two arguments
  if (iterator.length == 2)
  {
    aborter = iterator(item, async(callback));
  }
  // otherwise go with full three arguments
  else
  {
    aborter = iterator(item, key, async(callback));
  }

  return aborter;
}


/***/ }),

/***/ 7630:
/***/ ((module) => {

// API
module.exports = state;

/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */
function state(list, sortMethod)
{
  var isNamedList = !Array.isArray(list)
    , initState =
    {
      index    : 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs     : {},
      results  : isNamedList ? {} : [],
      size     : isNamedList ? Object.keys(list).length : list.length
    }
    ;

  if (sortMethod)
  {
    // sort array keys based on it's values
    // sort object's keys just on own merit
    initState.keyedList.sort(isNamedList ? sortMethod : function(a, b)
    {
      return sortMethod(list[a], list[b]);
    });
  }

  return initState;
}


/***/ }),

/***/ 5067:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var abort = __webpack_require__(4653)
  , async = __webpack_require__(5209)
  ;

// API
module.exports = terminator;

/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */
function terminator(callback)
{
  if (!Object.keys(this.jobs).length)
  {
    return;
  }

  // fast forward iteration index
  this.index = this.size;

  // abort jobs
  abort(this);

  // send back results we have so far
  async(callback)(null, this.results);
}


/***/ }),

/***/ 1286:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iterate    = __webpack_require__(8773)
  , initState  = __webpack_require__(7630)
  , terminator = __webpack_require__(5067)
  ;

// Public API
module.exports = parallel;

/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function parallel(list, iterator, callback)
{
  var state = initState(list);

  while (state.index < (state['keyedList'] || list).length)
  {
    iterate(list, iterator, state, function(error, result)
    {
      if (error)
      {
        callback(error, result);
        return;
      }

      // looks like it's the last one
      if (Object.keys(state.jobs).length === 0)
      {
        callback(null, state.results);
        return;
      }
    });

    state.index++;
  }

  return terminator.bind(state, callback);
}


/***/ }),

/***/ 4694:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var serialOrdered = __webpack_require__(7458);

// Public API
module.exports = serial;

/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serial(list, iterator, callback)
{
  return serialOrdered(list, iterator, null, callback);
}


/***/ }),

/***/ 7458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iterate    = __webpack_require__(8773)
  , initState  = __webpack_require__(7630)
  , terminator = __webpack_require__(5067)
  ;

// Public API
module.exports = serialOrdered;
// sorting helpers
module.exports.ascending  = ascending;
module.exports.descending = descending;

/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serialOrdered(list, iterator, sortMethod, callback)
{
  var state = initState(list, sortMethod);

  iterate(list, iterator, state, function iteratorHandler(error, result)
  {
    if (error)
    {
      callback(error, result);
      return;
    }

    state.index++;

    // are we there yet?
    if (state.index < (state['keyedList'] || list).length)
    {
      iterate(list, iterator, state, iteratorHandler);
      return;
    }

    // done here
    callback(null, state.results);
  });

  return terminator.bind(state, callback);
}

/*
 * -- Sort methods
 */

/**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function ascending(a, b)
{
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function descending(a, b)
{
  return -1 * ascending(a, b);
}


/***/ }),

/***/ 811:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(5287);

/***/ }),

/***/ 2691:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var settle = __webpack_require__(5132);
var buildFullPath = __webpack_require__(4938);
var buildURL = __webpack_require__(8244);
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var httpFollow = (__webpack_require__(2682).http);
var httpsFollow = (__webpack_require__(2682).https);
var url = __webpack_require__(7310);
var zlib = __webpack_require__(9796);
var VERSION = (__webpack_require__(3424).version);
var transitionalDefaults = __webpack_require__(872);
var AxiosError = __webpack_require__(4936);
var CanceledError = __webpack_require__(6528);

var isHttps = /https:?/;

var supportedProtocols = [ 'http:', 'https:', 'file:' ];

/**
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} proxy
 * @param {string} location
 */
function setProxy(options, proxy, location) {
  options.hostname = proxy.host;
  options.host = proxy.host;
  options.port = proxy.port;
  options.path = location;

  // Basic proxy authorization
  if (proxy.auth) {
    var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
  }

  // If a proxy is used, any redirects must also pass through the proxy
  options.beforeRedirect = function beforeRedirect(redirection) {
    redirection.headers.host = redirection.host;
    setProxy(redirection, proxy, redirection.href);
  };
}

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }
    var resolve = function resolve(value) {
      done();
      resolvePromise(value);
    };
    var rejected = false;
    var reject = function reject(value) {
      done();
      rejected = true;
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;
    var headerNames = {};

    Object.keys(headers).forEach(function storeLowerName(name) {
      headerNames[name.toLowerCase()] = name;
    });

    // Set User-Agent (required by some servers)
    // See https://github.com/axios/axios/issues/69
    if ('user-agent' in headerNames) {
      // User-Agent is specified; handle case where no UA header is desired
      if (!headers[headerNames['user-agent']]) {
        delete headers[headerNames['user-agent']];
      }
      // Otherwise, use specified value
    } else {
      // Only set header if it hasn't been set in config
      headers['User-Agent'] = 'axios/' + VERSION;
    }

    // support for https://www.npmjs.com/package/form-data api
    if (utils.isFormData(data) && utils.isFunction(data.getHeaders)) {
      Object.assign(headers, data.getHeaders());
    } else if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(new AxiosError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }

      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError(
          'Request body larger than maxBodyLength limit',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }

      // Add Content-Length header if data exists
      if (!headerNames['content-length']) {
        headers['Content-Length'] = data.length;
      }
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || supportedProtocols[0];

    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError(
        'Unsupported protocol ' + protocol,
        AxiosError.ERR_BAD_REQUEST,
        config
      ));
    }

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth && headerNames.authorization) {
      delete headers[headerNames.authorization];
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    try {
      buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '');
    } catch (err) {
      var customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      reject(customErr);
    }

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }

        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port,
            protocol: parsedProxyUrl.protocol
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirect = config.beforeRedirect;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        var totalResponseBytes = 0;
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            // stream.destoy() emit aborted event before calling reject() on Node.js v16
            rejected = true;
            stream.destroy();
            reject(new AxiosError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              AxiosError.ERR_BAD_RESPONSE, config, lastRequest));
          }
        });

        stream.on('aborted', function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          stream.destroy();
          reject(new AxiosError(
            'maxContentLength size of ' + config.maxContentLength + ' exceeded',
            AxiosError.ERR_BAD_RESPONSE,
            config,
            lastRequest
          ));
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(AxiosError.from(err, null, config, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          try {
            var responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (config.responseType !== 'arraybuffer') {
              responseData = responseData.toString(config.responseEncoding);
              if (!config.responseEncoding || config.responseEncoding === 'utf8') {
                responseData = utils.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            reject(AxiosError.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      // @todo remove
      // if (req.aborted && err.code !== AxiosError.ERR_FR_TOO_MANY_REDIRECTS) return;
      reject(AxiosError.from(err, null, config, req));
    });

    // set tcp keep alive to prevent drop connection by peer
    req.on('socket', function handleRequestSocket(socket) {
      // default interval of sending ack packet is 1 minute
      socket.setKeepAlive(true, 1000 * 60);
    });

    // Handle request timeout
    if (config.timeout) {
      // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
      var timeout = parseInt(config.timeout, 10);

      if (isNaN(timeout)) {
        reject(new AxiosError(
          'error trying to parse `config.timeout` to int',
          AxiosError.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));

        return;
      }

      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(timeout, function handleRequestTimeout() {
        req.abort();
        var transitional = config.transitional || transitionalDefaults;
        reject(new AxiosError(
          'timeout of ' + timeout + 'ms exceeded',
          transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
          config,
          req
        ));
      });
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }


    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(AxiosError.from(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),

/***/ 8019:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var settle = __webpack_require__(5132);
var cookies = __webpack_require__(7401);
var buildURL = __webpack_require__(8244);
var buildFullPath = __webpack_require__(4938);
var parseHeaders = __webpack_require__(9565);
var isURLSameOrigin = __webpack_require__(6934);
var transitionalDefaults = __webpack_require__(872);
var AxiosError = __webpack_require__(4936);
var CanceledError = __webpack_require__(6528);
var parseProtocol = __webpack_require__(7437);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    var protocol = parseProtocol(fullPath);

    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 5287:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var bind = __webpack_require__(2154);
var Axios = __webpack_require__(378);
var mergeConfig = __webpack_require__(8255);
var defaults = __webpack_require__(4636);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = __webpack_require__(6528);
axios.CancelToken = __webpack_require__(9247);
axios.isCancel = __webpack_require__(7813);
axios.VERSION = (__webpack_require__(3424).version);
axios.toFormData = __webpack_require__(792);

// Expose AxiosError class
axios.AxiosError = __webpack_require__(4936);

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(4476);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(1717);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ 9247:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var CanceledError = __webpack_require__(6528);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new CanceledError(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 6528:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(4936);
var utils = __webpack_require__(2774);

/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function CanceledError(message) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});

module.exports = CanceledError;


/***/ }),

/***/ 7813:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 378:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var buildURL = __webpack_require__(8244);
var InterceptorManager = __webpack_require__(5227);
var dispatchRequest = __webpack_require__(6203);
var mergeConfig = __webpack_require__(8255);
var buildFullPath = __webpack_require__(4938);
var validator = __webpack_require__(3215);

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  var fullPath = buildFullPath(config.baseURL, config.url);
  return buildURL(fullPath, config.params, config.paramsSerializer);
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url: url,
        data: data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

module.exports = Axios;


/***/ }),

/***/ 4936:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

var prototype = AxiosError.prototype;
var descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED'
// eslint-disable-next-line func-names
].forEach(function(code) {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = function(error, code, config, request, response, customProps) {
  var axiosError = Object.create(prototype);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

module.exports = AxiosError;


/***/ }),

/***/ 5227:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 4938:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(9227);
var combineURLs = __webpack_require__(9162);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 6203:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var transformData = __webpack_require__(671);
var isCancel = __webpack_require__(7813);
var defaults = __webpack_require__(4636);
var CanceledError = __webpack_require__(6528);

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 8255:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'beforeRedirect': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ 5132:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(4936);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 671:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var defaults = __webpack_require__(4636);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ 7786:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// eslint-disable-next-line strict
module.exports = __webpack_require__(7534);


/***/ }),

/***/ 4636:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);
var normalizeHeaderName = __webpack_require__(2531);
var AxiosError = __webpack_require__(4936);
var transitionalDefaults = __webpack_require__(872);
var toFormData = __webpack_require__(792);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(8019);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(2691);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    var isObjectPayload = utils.isObject(data);
    var contentType = headers && headers['Content-Type'];

    var isFileList;

    if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
      var _FormData = this.env && this.env.FormData;
      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
    } else if (isObjectPayload || contentType === 'application/json') {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: __webpack_require__(7786)
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 872:
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ 3424:
/***/ ((module) => {

module.exports = {
  "version": "0.27.2"
};

/***/ }),

/***/ 2154:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 8244:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 9162:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 7401:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 9227:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 1717:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ 6934:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 2531:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 9565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 7437:
/***/ ((module) => {

"use strict";


module.exports = function parseProtocol(url) {
  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
};


/***/ }),

/***/ 4476:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 792:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(2774);

/**
 * Convert a data object to FormData
 * @param {Object} obj
 * @param {?Object} [formData]
 * @returns {Object}
 **/

function toFormData(obj, formData) {
  // eslint-disable-next-line no-param-reassign
  formData = formData || new FormData();

  var stack = [];

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  function build(data, parentKey) {
    if (utils.isPlainObject(data) || utils.isArray(data)) {
      if (stack.indexOf(data) !== -1) {
        throw Error('Circular reference detected in ' + parentKey);
      }

      stack.push(data);

      utils.forEach(data, function each(value, key) {
        if (utils.isUndefined(value)) return;
        var fullKey = parentKey ? parentKey + '.' + key : key;
        var arr;

        if (value && !parentKey && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
            // eslint-disable-next-line func-names
            arr.forEach(function(el) {
              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
            });
            return;
          }
        }

        build(value, fullKey);
      });

      stack.pop();
    } else {
      formData.append(parentKey, convertValue(data));
    }
  }

  build(obj);

  return formData;
}

module.exports = toFormData;


/***/ }),

/***/ 3215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(3424).version);
var AxiosError = __webpack_require__(4936);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ 2774:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(2154);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

// eslint-disable-next-line func-names
var kindOf = (function(cache) {
  // eslint-disable-next-line func-names
  return function(thing) {
    var str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
})(Object.create(null));

function kindOfTest(type) {
  type = type.toLowerCase();
  return function isKindOf(thing) {
    return kindOf(thing) === type;
  };
}

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
var isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (kindOf(val) !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
var isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
var isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} thing The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(thing) {
  var pattern = '[object FormData]';
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) ||
    toString.call(thing) === pattern ||
    (isFunction(thing.toString) && thing.toString() === pattern)
  );
}

/**
 * Determine if a value is a URLSearchParams object
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
var isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 */

function inherits(constructor, superConstructor, props, descriptors) {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function} [filter]
 * @returns {Object}
 */

function toFlatObject(sourceObj, destObj, filter) {
  var props;
  var i;
  var prop;
  var merged = {};

  destObj = destObj || {};

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if (!merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/*
 * determines whether a string ends with the characters of a specified string
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 * @returns {boolean}
 */
function endsWith(str, searchString, position) {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  var lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object
 * @param {*} [thing]
 * @returns {Array}
 */
function toArray(thing) {
  if (!thing) return null;
  var i = thing.length;
  if (isUndefined(i)) return null;
  var arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

// eslint-disable-next-line func-names
var isTypedArray = (function(TypedArray) {
  // eslint-disable-next-line func-names
  return function(thing) {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM,
  inherits: inherits,
  toFlatObject: toFlatObject,
  kindOf: kindOf,
  kindOfTest: kindOfTest,
  endsWith: endsWith,
  toArray: toArray,
  isTypedArray: isTypedArray,
  isFileList: isFileList
};


/***/ }),

/***/ 4598:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var util = __webpack_require__(3837);
var Stream = (__webpack_require__(2781).Stream);
var DelayedStream = __webpack_require__(5239);

module.exports = CombinedStream;
function CombinedStream() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;

  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);

CombinedStream.create = function(options) {
  var combinedStream = new this();

  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }

  return combinedStream;
};

CombinedStream.isStreamLike = function(stream) {
  return (typeof stream !== 'function')
    && (typeof stream !== 'string')
    && (typeof stream !== 'boolean')
    && (typeof stream !== 'number')
    && (!Buffer.isBuffer(stream));
};

CombinedStream.prototype.append = function(stream) {
  var isStreamLike = CombinedStream.isStreamLike(stream);

  if (isStreamLike) {
    if (!(stream instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams,
      });
      stream.on('data', this._checkDataSize.bind(this));
      stream = newStream;
    }

    this._handleErrors(stream);

    if (this.pauseStreams) {
      stream.pause();
    }
  }

  this._streams.push(stream);
  return this;
};

CombinedStream.prototype.pipe = function(dest, options) {
  Stream.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};

CombinedStream.prototype._getNext = function() {
  this._currentStream = null;

  if (this._insideLoop) {
    this._pendingNext = true;
    return; // defer call
  }

  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};

CombinedStream.prototype._realGetNext = function() {
  var stream = this._streams.shift();


  if (typeof stream == 'undefined') {
    this.end();
    return;
  }

  if (typeof stream !== 'function') {
    this._pipeNext(stream);
    return;
  }

  var getStream = stream;
  getStream(function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on('data', this._checkDataSize.bind(this));
      this._handleErrors(stream);
    }

    this._pipeNext(stream);
  }.bind(this));
};

CombinedStream.prototype._pipeNext = function(stream) {
  this._currentStream = stream;

  var isStreamLike = CombinedStream.isStreamLike(stream);
  if (isStreamLike) {
    stream.on('end', this._getNext.bind(this));
    stream.pipe(this, {end: false});
    return;
  }

  var value = stream;
  this.write(value);
  this._getNext();
};

CombinedStream.prototype._handleErrors = function(stream) {
  var self = this;
  stream.on('error', function(err) {
    self._emitError(err);
  });
};

CombinedStream.prototype.write = function(data) {
  this.emit('data', data);
};

CombinedStream.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
  this.emit('pause');
};

CombinedStream.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
  this.emit('resume');
};

CombinedStream.prototype.end = function() {
  this._reset();
  this.emit('end');
};

CombinedStream.prototype.destroy = function() {
  this._reset();
  this.emit('close');
};

CombinedStream.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};

CombinedStream.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
  this._emitError(new Error(message));
};

CombinedStream.prototype._updateDataSize = function() {
  this.dataSize = 0;

  var self = this;
  this._streams.forEach(function(stream) {
    if (!stream.dataSize) {
      return;
    }

    self.dataSize += stream.dataSize;
  });

  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};

CombinedStream.prototype._emitError = function(err) {
  this._reset();
  this.emit('error', err);
};


/***/ }),

/***/ 5239:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stream = (__webpack_require__(2781).Stream);
var util = __webpack_require__(3837);

module.exports = DelayedStream;
function DelayedStream() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;

  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);

DelayedStream.create = function(source, options) {
  var delayedStream = new this();

  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }

  delayedStream.source = source;

  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };

  source.on('error', function() {});
  if (delayedStream.pauseStream) {
    source.pause();
  }

  return delayedStream;
};

Object.defineProperty(DelayedStream.prototype, 'readable', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});

DelayedStream.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};

DelayedStream.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }

  this.source.resume();
};

DelayedStream.prototype.pause = function() {
  this.source.pause();
};

DelayedStream.prototype.release = function() {
  this._released = true;

  this._bufferedEvents.forEach(function(args) {
    this.emit.apply(this, args);
  }.bind(this));
  this._bufferedEvents = [];
};

DelayedStream.prototype.pipe = function() {
  var r = Stream.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};

DelayedStream.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }

  if (args[0] === 'data') {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }

  this._bufferedEvents.push(args);
};

DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }

  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  this._maxDataSizeExceeded = true;
  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
  this.emit('error', new Error(message));
};


/***/ }),

/***/ 1885:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var debug;

module.exports = function () {
  if (!debug) {
    try {
      /* eslint global-require: off */
      debug = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'debug'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))("follow-redirects");
    }
    catch (error) { /* */ }
    if (typeof debug !== "function") {
      debug = function () { /* */ };
    }
  }
  debug.apply(null, arguments);
};


/***/ }),

/***/ 2682:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var url = __webpack_require__(7310);
var URL = url.URL;
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var Writable = (__webpack_require__(2781).Writable);
var assert = __webpack_require__(9491);
var debug = __webpack_require__(1885);

// Create handlers that pass events from native requests
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = Object.create(null);
events.forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  abortRequest(this._currentRequest);
  this.emit("abort");
};

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  var self = this;

  // Destroys the socket on timeout
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }

  // Sets up a timer to trigger a timeout event
  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(function () {
      self.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  // Stops a timeout from triggering
  function clearTimer() {
    // Clear the timeout
    if (self._timeout) {
      clearTimeout(self._timeout);
      self._timeout = null;
    }

    // Clean up all attached listeners
    self.removeListener("abort", clearTimer);
    self.removeListener("error", clearTimer);
    self.removeListener("response", clearTimer);
    if (callback) {
      self.removeListener("timeout", callback);
    }
    if (!self.socket) {
      self._currentRequest.removeListener("socket", startTimer);
    }
  }

  // Attach callback if passed
  if (callback) {
    this.on("timeout", callback);
  }

  // Start the timer if or when the socket is opened
  if (this.socket) {
    startTimer(this.socket);
  }
  else {
    this._currentRequest.once("socket", startTimer);
  }

  // Clean up on events
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);

  return this;
};

// Proxy all other public ClientRequest methods
[
  "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request and set up its event handlers
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }

  // RFC7230§5.3.1: When making a request directly to an origin server, […]
  // a client MUST send only the absolute path […] as the request-target.
  this._currentUrl = /^\//.test(this._options.path) ?
    url.format(this._options) :
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._currentUrl = this._options.path;

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.

  // If the response is not a redirect; return it as-is
  var location = response.headers.location;
  if (!location || this._options.followRedirects === false ||
      statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
    return;
  }

  // The response is a redirect, so abort the current request
  abortRequest(this._currentRequest);
  // Discard the remainder of the response to avoid waiting for data
  response.destroy();

  // RFC7231§6.4: A client SHOULD detect and intervene
  // in cyclical redirections (i.e., "infinite" redirection loops).
  if (++this._redirectCount > this._options.maxRedirects) {
    this.emit("error", new TooManyRedirectsError());
    return;
  }

  // Store the request headers if applicable
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: response.req.getHeader("host"),
    }, this._options.headers);
  }

  // RFC7231§6.4: Automatic redirection needs to done with
  // care for methods not known to be safe, […]
  // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
  // the request method from POST to GET for the subsequent request.
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
      // RFC7231§6.4.4: The 303 (See Other) status code indicates that
      // the server is redirecting the user agent to a different resource […]
      // A user agent can perform a retrieval request targeting that URI
      // (a GET or HEAD request if using HTTP) […]
      (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    // Drop a possible entity and headers related to it
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }

  // Drop the Host header, as the redirect might lead to a different host
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);

  // If the redirect is relative, carry over the host of the last request
  var currentUrlParts = url.parse(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location) ? this._currentUrl :
    url.format(Object.assign(currentUrlParts, { host: currentHost }));

  // Determine the URL of the redirection
  var redirectUrl;
  try {
    redirectUrl = url.resolve(currentUrl, location);
  }
  catch (cause) {
    this.emit("error", new RedirectionError(cause));
    return;
  }

  // Create the redirected request
  debug("redirecting to", redirectUrl);
  this._isRedirect = true;
  var redirectUrlParts = url.parse(redirectUrl);
  Object.assign(this._options, redirectUrlParts);

  // Drop confidential headers when redirecting to a less secure protocol
  // or to a different domain that is not a superdomain
  if (redirectUrlParts.protocol !== currentUrlParts.protocol &&
     redirectUrlParts.protocol !== "https:" ||
     redirectUrlParts.host !== currentHost &&
     !isSubdomain(redirectUrlParts.host, currentHost)) {
    removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
  }

  // Evaluate the beforeRedirect callback
  if (typeof beforeRedirect === "function") {
    var responseDetails = {
      headers: response.headers,
      statusCode: statusCode,
    };
    var requestDetails = {
      url: currentUrl,
      method: method,
      headers: requestHeaders,
    };
    try {
      beforeRedirect(this._options, responseDetails, requestDetails);
    }
    catch (err) {
      this.emit("error", err);
      return;
    }
    this._sanitizeOptions(this._options);
  }

  // Perform the redirected request
  try {
    this._performRequest();
  }
  catch (cause) {
    this.emit("error", new RedirectionError(cause));
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return (lastValue === null || typeof lastValue === "undefined") ?
    undefined : String(lastValue).trim();
}

function createErrorType(code, defaultMessage) {
  function CustomError(cause) {
    Error.captureStackTrace(this, this.constructor);
    if (!cause) {
      this.message = defaultMessage;
    }
    else {
      this.message = defaultMessage + ": " + cause.message;
      this.cause = cause;
    }
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

function abortRequest(request) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.abort();
}

function isSubdomain(subdomain, domain) {
  const dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),

/***/ 7534:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var CombinedStream = __webpack_require__(4598);
var util = __webpack_require__(3837);
var path = __webpack_require__(1017);
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var parseUrl = (__webpack_require__(7310).parse);
var fs = __webpack_require__(7147);
var Stream = (__webpack_require__(2781).Stream);
var mime = __webpack_require__(9335);
var asynckit = __webpack_require__(2720);
var populate = __webpack_require__(9049);

// Public API
module.exports = FormData;

// make it a Stream
util.inherits(FormData, CombinedStream);

/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
 */
function FormData(options) {
  if (!(this instanceof FormData)) {
    return new FormData(options);
  }

  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];

  CombinedStream.call(this);

  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function(field, value, options) {

  options = options || {};

  // allow filename as single option
  if (typeof options == 'string') {
    options = {filename: options};
  }

  var append = CombinedStream.prototype.append.bind(this);

  // all that streamy business can't handle numbers
  if (typeof value == 'number') {
    value = '' + value;
  }

  // https://github.com/felixge/node-form-data/issues/38
  if (util.isArray(value)) {
    // Please convert your array into string
    // the way web server expects it
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();

  append(header);
  append(value);
  append(footer);

  // pass along options.knownLength
  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;

  // used w/ getLengthSync(), when length is known.
  // e.g. for streaming directly from a remote server,
  // w/ a known file a size, and not wanting to wait for
  // incoming file to finish to get its size.
  if (options.knownLength != null) {
    valueLength += +options.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;

  // @check why add CRLF? does this account for custom/multiple CRLFs?
  this._overheadLength +=
    Buffer.byteLength(header) +
    FormData.LINE_BREAK.length;

  // empty or either doesn't have path or not an http response or not a stream
  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) && !(value instanceof Stream))) {
    return;
  }

  // no need to bother with the length
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function(value, callback) {

  if (value.hasOwnProperty('fd')) {

    // take read range into a account
    // `end` = Infinity –> read file till the end
    //
    // TODO: Looks like there is bug in Node fs.createReadStream
    // it doesn't respect `end` options without `start` options
    // Fix it when node fixes it.
    // https://github.com/joyent/node/issues/7819
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {

      // when end specified
      // no need to calculate range
      // inclusive, starts with 0
      callback(null, value.end + 1 - (value.start ? value.start : 0));

    // not that fast snoopy
    } else {
      // still need to fetch file size from fs
      fs.stat(value.path, function(err, stat) {

        var fileSize;

        if (err) {
          callback(err);
          return;
        }

        // update final size based on the range options
        fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }

  // or http response
  } else if (value.hasOwnProperty('httpVersion')) {
    callback(null, +value.headers['content-length']);

  // or request stream http://github.com/mikeal/request
  } else if (value.hasOwnProperty('httpModule')) {
    // wait till response come back
    value.on('response', function(response) {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();

  // something else
  } else {
    callback('Unknown stream');
  }
};

FormData.prototype._multiPartHeader = function(field, value, options) {
  // custom header specified (as string)?
  // it becomes responsible for boundary
  // (e.g. to handle extra CRLFs on .NET servers)
  if (typeof options.header == 'string') {
    return options.header;
  }

  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);

  var contents = '';
  var headers  = {
    // add custom disposition as third element or keep it two elements if not
    'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    'Content-Type': [].concat(contentType || [])
  };

  // allow custom headers.
  if (typeof options.header == 'object') {
    populate(headers, options.header);
  }

  var header;
  for (var prop in headers) {
    if (!headers.hasOwnProperty(prop)) continue;
    header = headers[prop];

    // skip nullish headers.
    if (header == null) {
      continue;
    }

    // convert all headers to arrays.
    if (!Array.isArray(header)) {
      header = [header];
    }

    // add non-empty headers.
    if (header.length) {
      contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
    }
  }

  return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};

FormData.prototype._getContentDisposition = function(value, options) {

  var filename
    , contentDisposition
    ;

  if (typeof options.filepath === 'string') {
    // custom filepath for relative paths
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    // custom filename take precedence
    // formidable and the browser add a name property
    // fs- and request- streams have path property
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
    // or try http response
    filename = path.basename(value.client._httpMessage.path || '');
  }

  if (filename) {
    contentDisposition = 'filename="' + filename + '"';
  }

  return contentDisposition;
};

FormData.prototype._getContentType = function(value, options) {

  // use custom content-type above all
  var contentType = options.contentType;

  // or try `name` from formidable, browser
  if (!contentType && value.name) {
    contentType = mime.lookup(value.name);
  }

  // or try `path` from fs-, request- streams
  if (!contentType && value.path) {
    contentType = mime.lookup(value.path);
  }

  // or if it's http-reponse
  if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
    contentType = value.headers['content-type'];
  }

  // or guess it from the filepath or filename
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }

  // fallback to the default content type if `value` is not simple value
  if (!contentType && typeof value == 'object') {
    contentType = FormData.DEFAULT_CONTENT_TYPE;
  }

  return contentType;
};

FormData.prototype._multiPartFooter = function() {
  return function(next) {
    var footer = FormData.LINE_BREAK;

    var lastPart = (this._streams.length === 0);
    if (lastPart) {
      footer += this._lastBoundary();
    }

    next(footer);
  }.bind(this);
};

FormData.prototype._lastBoundary = function() {
  return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};

FormData.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
  };

  for (header in userHeaders) {
    if (userHeaders.hasOwnProperty(header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }

  return formHeaders;
};

FormData.prototype.setBoundary = function(boundary) {
  this._boundary = boundary;
};

FormData.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }

  return this._boundary;
};

FormData.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc( 0 );
  var boundary = this.getBoundary();

  // Create the form content. Add Line breaks to the end of data.
  for (var i = 0, len = this._streams.length; i < len; i++) {
    if (typeof this._streams[i] !== 'function') {

      // Add content to the buffer.
      if(Buffer.isBuffer(this._streams[i])) {
        dataBuffer = Buffer.concat( [dataBuffer, this._streams[i]]);
      }else {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(this._streams[i])]);
      }

      // Add break after content.
      if (typeof this._streams[i] !== 'string' || this._streams[i].substring( 2, boundary.length + 2 ) !== boundary) {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(FormData.LINE_BREAK)] );
      }
    }
  }

  // Add the footer and return the Buffer object.
  return Buffer.concat( [dataBuffer, Buffer.from(this._lastBoundary())] );
};

FormData.prototype._generateBoundary = function() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }

  this._boundary = boundary;
};

// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually
// and add it as knownLength option
FormData.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;

  // Don't get confused, there are 3 "internal" streams for each keyval pair
  // so it basically checks if there is any value added to the form
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  // https://github.com/form-data/form-data/issues/40
  if (!this.hasKnownLength()) {
    // Some async length retrievers are present
    // therefore synchronous length calculation is false.
    // Please use getLength(callback) to get proper length
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }

  return knownLength;
};

// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
  var hasKnownLength = true;

  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }

  return hasKnownLength;
};

FormData.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }

    values.forEach(function(length) {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData.prototype.submit = function(params, cb) {
  var request
    , options
    , defaults = {method: 'post'}
    ;

  // parse provided url if it's string
  // or treat it as options object
  if (typeof params == 'string') {

    params = parseUrl(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults);

  // use custom params
  } else {

    options = populate(params, defaults);
    // if no port provided use default one
    if (!options.port) {
      options.port = options.protocol == 'https:' ? 443 : 80;
    }
  }

  // put that good code in getHeaders to some use
  options.headers = this.getHeaders(params.headers);

  // https if specified, fallback to http in any other case
  if (options.protocol == 'https:') {
    request = https.request(options);
  } else {
    request = http.request(options);
  }

  // get content length and fire away
  this.getLength(function(err, length) {
    if (err && err !== 'Unknown stream') {
      this._error(err);
      return;
    }

    // add content length
    if (length) {
      request.setHeader('Content-Length', length);
    }

    this.pipe(request);
    if (cb) {
      var onResponse;

      var callback = function (error, responce) {
        request.removeListener('error', callback);
        request.removeListener('response', onResponse);

        return cb.call(this, error, responce);
      };

      onResponse = callback.bind(this, null);

      request.on('error', callback);
      request.on('response', onResponse);
    }
  }.bind(this));

  return request;
};

FormData.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData.prototype.toString = function () {
  return '[object FormData]';
};


/***/ }),

/***/ 9049:
/***/ ((module) => {

// populates missing values
module.exports = function(dst, src) {

  Object.keys(src).forEach(function(prop)
  {
    dst[prop] = dst[prop] || src[prop];
  });

  return dst;
};


/***/ }),

/***/ 257:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

module.exports = __webpack_require__(6450)


/***/ }),

/***/ 9335:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var db = __webpack_require__(257)
var extname = (__webpack_require__(1017).extname)

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
var TEXT_TYPE_REGEXP = /^text\//i

/**
 * Module exports.
 * @public
 */

exports.charset = charset
exports.charsets = { lookup: charset }
exports.contentType = contentType
exports.extension = extension
exports.extensions = Object.create(null)
exports.lookup = lookup
exports.types = Object.create(null)

// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types)

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)
  var mime = match && db[match[1].toLowerCase()]

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime)
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()]

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1)

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana']

  Object.keys(db).forEach(function forEachMimeType (type) {
    var mime = db[type]
    var exts = mime.extensions

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i]

      if (types[extension]) {
        var from = preference.indexOf(db[types[extension]].source)
        var to = preference.indexOf(mime.source)

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  })
}


/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 7310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 6450:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"application/1d-interleaved-parityfec":{"source":"iana"},"application/3gpdash-qoe-report+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/3gpp-ims+xml":{"source":"iana","compressible":true},"application/3gpphal+json":{"source":"iana","compressible":true},"application/3gpphalforms+json":{"source":"iana","compressible":true},"application/a2l":{"source":"iana"},"application/ace+cbor":{"source":"iana"},"application/activemessage":{"source":"iana"},"application/activity+json":{"source":"iana","compressible":true},"application/alto-costmap+json":{"source":"iana","compressible":true},"application/alto-costmapfilter+json":{"source":"iana","compressible":true},"application/alto-directory+json":{"source":"iana","compressible":true},"application/alto-endpointcost+json":{"source":"iana","compressible":true},"application/alto-endpointcostparams+json":{"source":"iana","compressible":true},"application/alto-endpointprop+json":{"source":"iana","compressible":true},"application/alto-endpointpropparams+json":{"source":"iana","compressible":true},"application/alto-error+json":{"source":"iana","compressible":true},"application/alto-networkmap+json":{"source":"iana","compressible":true},"application/alto-networkmapfilter+json":{"source":"iana","compressible":true},"application/alto-updatestreamcontrol+json":{"source":"iana","compressible":true},"application/alto-updatestreamparams+json":{"source":"iana","compressible":true},"application/aml":{"source":"iana"},"application/andrew-inset":{"source":"iana","extensions":["ez"]},"application/applefile":{"source":"iana"},"application/applixware":{"source":"apache","extensions":["aw"]},"application/at+jwt":{"source":"iana"},"application/atf":{"source":"iana"},"application/atfx":{"source":"iana"},"application/atom+xml":{"source":"iana","compressible":true,"extensions":["atom"]},"application/atomcat+xml":{"source":"iana","compressible":true,"extensions":["atomcat"]},"application/atomdeleted+xml":{"source":"iana","compressible":true,"extensions":["atomdeleted"]},"application/atomicmail":{"source":"iana"},"application/atomsvc+xml":{"source":"iana","compressible":true,"extensions":["atomsvc"]},"application/atsc-dwd+xml":{"source":"iana","compressible":true,"extensions":["dwd"]},"application/atsc-dynamic-event-message":{"source":"iana"},"application/atsc-held+xml":{"source":"iana","compressible":true,"extensions":["held"]},"application/atsc-rdt+json":{"source":"iana","compressible":true},"application/atsc-rsat+xml":{"source":"iana","compressible":true,"extensions":["rsat"]},"application/atxml":{"source":"iana"},"application/auth-policy+xml":{"source":"iana","compressible":true},"application/bacnet-xdd+zip":{"source":"iana","compressible":false},"application/batch-smtp":{"source":"iana"},"application/bdoc":{"compressible":false,"extensions":["bdoc"]},"application/beep+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/calendar+json":{"source":"iana","compressible":true},"application/calendar+xml":{"source":"iana","compressible":true,"extensions":["xcs"]},"application/call-completion":{"source":"iana"},"application/cals-1840":{"source":"iana"},"application/captive+json":{"source":"iana","compressible":true},"application/cbor":{"source":"iana"},"application/cbor-seq":{"source":"iana"},"application/cccex":{"source":"iana"},"application/ccmp+xml":{"source":"iana","compressible":true},"application/ccxml+xml":{"source":"iana","compressible":true,"extensions":["ccxml"]},"application/cdfx+xml":{"source":"iana","compressible":true,"extensions":["cdfx"]},"application/cdmi-capability":{"source":"iana","extensions":["cdmia"]},"application/cdmi-container":{"source":"iana","extensions":["cdmic"]},"application/cdmi-domain":{"source":"iana","extensions":["cdmid"]},"application/cdmi-object":{"source":"iana","extensions":["cdmio"]},"application/cdmi-queue":{"source":"iana","extensions":["cdmiq"]},"application/cdni":{"source":"iana"},"application/cea":{"source":"iana"},"application/cea-2018+xml":{"source":"iana","compressible":true},"application/cellml+xml":{"source":"iana","compressible":true},"application/cfw":{"source":"iana"},"application/city+json":{"source":"iana","compressible":true},"application/clr":{"source":"iana"},"application/clue+xml":{"source":"iana","compressible":true},"application/clue_info+xml":{"source":"iana","compressible":true},"application/cms":{"source":"iana"},"application/cnrp+xml":{"source":"iana","compressible":true},"application/coap-group+json":{"source":"iana","compressible":true},"application/coap-payload":{"source":"iana"},"application/commonground":{"source":"iana"},"application/conference-info+xml":{"source":"iana","compressible":true},"application/cose":{"source":"iana"},"application/cose-key":{"source":"iana"},"application/cose-key-set":{"source":"iana"},"application/cpl+xml":{"source":"iana","compressible":true,"extensions":["cpl"]},"application/csrattrs":{"source":"iana"},"application/csta+xml":{"source":"iana","compressible":true},"application/cstadata+xml":{"source":"iana","compressible":true},"application/csvm+json":{"source":"iana","compressible":true},"application/cu-seeme":{"source":"apache","extensions":["cu"]},"application/cwt":{"source":"iana"},"application/cybercash":{"source":"iana"},"application/dart":{"compressible":true},"application/dash+xml":{"source":"iana","compressible":true,"extensions":["mpd"]},"application/dash-patch+xml":{"source":"iana","compressible":true,"extensions":["mpp"]},"application/dashdelta":{"source":"iana"},"application/davmount+xml":{"source":"iana","compressible":true,"extensions":["davmount"]},"application/dca-rft":{"source":"iana"},"application/dcd":{"source":"iana"},"application/dec-dx":{"source":"iana"},"application/dialog-info+xml":{"source":"iana","compressible":true},"application/dicom":{"source":"iana"},"application/dicom+json":{"source":"iana","compressible":true},"application/dicom+xml":{"source":"iana","compressible":true},"application/dii":{"source":"iana"},"application/dit":{"source":"iana"},"application/dns":{"source":"iana"},"application/dns+json":{"source":"iana","compressible":true},"application/dns-message":{"source":"iana"},"application/docbook+xml":{"source":"apache","compressible":true,"extensions":["dbk"]},"application/dots+cbor":{"source":"iana"},"application/dskpp+xml":{"source":"iana","compressible":true},"application/dssc+der":{"source":"iana","extensions":["dssc"]},"application/dssc+xml":{"source":"iana","compressible":true,"extensions":["xdssc"]},"application/dvcs":{"source":"iana"},"application/ecmascript":{"source":"iana","compressible":true,"extensions":["es","ecma"]},"application/edi-consent":{"source":"iana"},"application/edi-x12":{"source":"iana","compressible":false},"application/edifact":{"source":"iana","compressible":false},"application/efi":{"source":"iana"},"application/elm+json":{"source":"iana","charset":"UTF-8","compressible":true},"application/elm+xml":{"source":"iana","compressible":true},"application/emergencycalldata.cap+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/emergencycalldata.comment+xml":{"source":"iana","compressible":true},"application/emergencycalldata.control+xml":{"source":"iana","compressible":true},"application/emergencycalldata.deviceinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.ecall.msd":{"source":"iana"},"application/emergencycalldata.providerinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.serviceinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.subscriberinfo+xml":{"source":"iana","compressible":true},"application/emergencycalldata.veds+xml":{"source":"iana","compressible":true},"application/emma+xml":{"source":"iana","compressible":true,"extensions":["emma"]},"application/emotionml+xml":{"source":"iana","compressible":true,"extensions":["emotionml"]},"application/encaprtp":{"source":"iana"},"application/epp+xml":{"source":"iana","compressible":true},"application/epub+zip":{"source":"iana","compressible":false,"extensions":["epub"]},"application/eshop":{"source":"iana"},"application/exi":{"source":"iana","extensions":["exi"]},"application/expect-ct-report+json":{"source":"iana","compressible":true},"application/express":{"source":"iana","extensions":["exp"]},"application/fastinfoset":{"source":"iana"},"application/fastsoap":{"source":"iana"},"application/fdt+xml":{"source":"iana","compressible":true,"extensions":["fdt"]},"application/fhir+json":{"source":"iana","charset":"UTF-8","compressible":true},"application/fhir+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/fido.trusted-apps+json":{"compressible":true},"application/fits":{"source":"iana"},"application/flexfec":{"source":"iana"},"application/font-sfnt":{"source":"iana"},"application/font-tdpfr":{"source":"iana","extensions":["pfr"]},"application/font-woff":{"source":"iana","compressible":false},"application/framework-attributes+xml":{"source":"iana","compressible":true},"application/geo+json":{"source":"iana","compressible":true,"extensions":["geojson"]},"application/geo+json-seq":{"source":"iana"},"application/geopackage+sqlite3":{"source":"iana"},"application/geoxacml+xml":{"source":"iana","compressible":true},"application/gltf-buffer":{"source":"iana"},"application/gml+xml":{"source":"iana","compressible":true,"extensions":["gml"]},"application/gpx+xml":{"source":"apache","compressible":true,"extensions":["gpx"]},"application/gxf":{"source":"apache","extensions":["gxf"]},"application/gzip":{"source":"iana","compressible":false,"extensions":["gz"]},"application/h224":{"source":"iana"},"application/held+xml":{"source":"iana","compressible":true},"application/hjson":{"extensions":["hjson"]},"application/http":{"source":"iana"},"application/hyperstudio":{"source":"iana","extensions":["stk"]},"application/ibe-key-request+xml":{"source":"iana","compressible":true},"application/ibe-pkg-reply+xml":{"source":"iana","compressible":true},"application/ibe-pp-data":{"source":"iana"},"application/iges":{"source":"iana"},"application/im-iscomposing+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/index":{"source":"iana"},"application/index.cmd":{"source":"iana"},"application/index.obj":{"source":"iana"},"application/index.response":{"source":"iana"},"application/index.vnd":{"source":"iana"},"application/inkml+xml":{"source":"iana","compressible":true,"extensions":["ink","inkml"]},"application/iotp":{"source":"iana"},"application/ipfix":{"source":"iana","extensions":["ipfix"]},"application/ipp":{"source":"iana"},"application/isup":{"source":"iana"},"application/its+xml":{"source":"iana","compressible":true,"extensions":["its"]},"application/java-archive":{"source":"apache","compressible":false,"extensions":["jar","war","ear"]},"application/java-serialized-object":{"source":"apache","compressible":false,"extensions":["ser"]},"application/java-vm":{"source":"apache","compressible":false,"extensions":["class"]},"application/javascript":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["js","mjs"]},"application/jf2feed+json":{"source":"iana","compressible":true},"application/jose":{"source":"iana"},"application/jose+json":{"source":"iana","compressible":true},"application/jrd+json":{"source":"iana","compressible":true},"application/jscalendar+json":{"source":"iana","compressible":true},"application/json":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["json","map"]},"application/json-patch+json":{"source":"iana","compressible":true},"application/json-seq":{"source":"iana"},"application/json5":{"extensions":["json5"]},"application/jsonml+json":{"source":"apache","compressible":true,"extensions":["jsonml"]},"application/jwk+json":{"source":"iana","compressible":true},"application/jwk-set+json":{"source":"iana","compressible":true},"application/jwt":{"source":"iana"},"application/kpml-request+xml":{"source":"iana","compressible":true},"application/kpml-response+xml":{"source":"iana","compressible":true},"application/ld+json":{"source":"iana","compressible":true,"extensions":["jsonld"]},"application/lgr+xml":{"source":"iana","compressible":true,"extensions":["lgr"]},"application/link-format":{"source":"iana"},"application/load-control+xml":{"source":"iana","compressible":true},"application/lost+xml":{"source":"iana","compressible":true,"extensions":["lostxml"]},"application/lostsync+xml":{"source":"iana","compressible":true},"application/lpf+zip":{"source":"iana","compressible":false},"application/lxf":{"source":"iana"},"application/mac-binhex40":{"source":"iana","extensions":["hqx"]},"application/mac-compactpro":{"source":"apache","extensions":["cpt"]},"application/macwriteii":{"source":"iana"},"application/mads+xml":{"source":"iana","compressible":true,"extensions":["mads"]},"application/manifest+json":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["webmanifest"]},"application/marc":{"source":"iana","extensions":["mrc"]},"application/marcxml+xml":{"source":"iana","compressible":true,"extensions":["mrcx"]},"application/mathematica":{"source":"iana","extensions":["ma","nb","mb"]},"application/mathml+xml":{"source":"iana","compressible":true,"extensions":["mathml"]},"application/mathml-content+xml":{"source":"iana","compressible":true},"application/mathml-presentation+xml":{"source":"iana","compressible":true},"application/mbms-associated-procedure-description+xml":{"source":"iana","compressible":true},"application/mbms-deregister+xml":{"source":"iana","compressible":true},"application/mbms-envelope+xml":{"source":"iana","compressible":true},"application/mbms-msk+xml":{"source":"iana","compressible":true},"application/mbms-msk-response+xml":{"source":"iana","compressible":true},"application/mbms-protection-description+xml":{"source":"iana","compressible":true},"application/mbms-reception-report+xml":{"source":"iana","compressible":true},"application/mbms-register+xml":{"source":"iana","compressible":true},"application/mbms-register-response+xml":{"source":"iana","compressible":true},"application/mbms-schedule+xml":{"source":"iana","compressible":true},"application/mbms-user-service-description+xml":{"source":"iana","compressible":true},"application/mbox":{"source":"iana","extensions":["mbox"]},"application/media-policy-dataset+xml":{"source":"iana","compressible":true,"extensions":["mpf"]},"application/media_control+xml":{"source":"iana","compressible":true},"application/mediaservercontrol+xml":{"source":"iana","compressible":true,"extensions":["mscml"]},"application/merge-patch+json":{"source":"iana","compressible":true},"application/metalink+xml":{"source":"apache","compressible":true,"extensions":["metalink"]},"application/metalink4+xml":{"source":"iana","compressible":true,"extensions":["meta4"]},"application/mets+xml":{"source":"iana","compressible":true,"extensions":["mets"]},"application/mf4":{"source":"iana"},"application/mikey":{"source":"iana"},"application/mipc":{"source":"iana"},"application/missing-blocks+cbor-seq":{"source":"iana"},"application/mmt-aei+xml":{"source":"iana","compressible":true,"extensions":["maei"]},"application/mmt-usd+xml":{"source":"iana","compressible":true,"extensions":["musd"]},"application/mods+xml":{"source":"iana","compressible":true,"extensions":["mods"]},"application/moss-keys":{"source":"iana"},"application/moss-signature":{"source":"iana"},"application/mosskey-data":{"source":"iana"},"application/mosskey-request":{"source":"iana"},"application/mp21":{"source":"iana","extensions":["m21","mp21"]},"application/mp4":{"source":"iana","extensions":["mp4s","m4p"]},"application/mpeg4-generic":{"source":"iana"},"application/mpeg4-iod":{"source":"iana"},"application/mpeg4-iod-xmt":{"source":"iana"},"application/mrb-consumer+xml":{"source":"iana","compressible":true},"application/mrb-publish+xml":{"source":"iana","compressible":true},"application/msc-ivr+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/msc-mixer+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/msword":{"source":"iana","compressible":false,"extensions":["doc","dot"]},"application/mud+json":{"source":"iana","compressible":true},"application/multipart-core":{"source":"iana"},"application/mxf":{"source":"iana","extensions":["mxf"]},"application/n-quads":{"source":"iana","extensions":["nq"]},"application/n-triples":{"source":"iana","extensions":["nt"]},"application/nasdata":{"source":"iana"},"application/news-checkgroups":{"source":"iana","charset":"US-ASCII"},"application/news-groupinfo":{"source":"iana","charset":"US-ASCII"},"application/news-transmission":{"source":"iana"},"application/nlsml+xml":{"source":"iana","compressible":true},"application/node":{"source":"iana","extensions":["cjs"]},"application/nss":{"source":"iana"},"application/oauth-authz-req+jwt":{"source":"iana"},"application/oblivious-dns-message":{"source":"iana"},"application/ocsp-request":{"source":"iana"},"application/ocsp-response":{"source":"iana"},"application/octet-stream":{"source":"iana","compressible":false,"extensions":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"]},"application/oda":{"source":"iana","extensions":["oda"]},"application/odm+xml":{"source":"iana","compressible":true},"application/odx":{"source":"iana"},"application/oebps-package+xml":{"source":"iana","compressible":true,"extensions":["opf"]},"application/ogg":{"source":"iana","compressible":false,"extensions":["ogx"]},"application/omdoc+xml":{"source":"apache","compressible":true,"extensions":["omdoc"]},"application/onenote":{"source":"apache","extensions":["onetoc","onetoc2","onetmp","onepkg"]},"application/opc-nodeset+xml":{"source":"iana","compressible":true},"application/oscore":{"source":"iana"},"application/oxps":{"source":"iana","extensions":["oxps"]},"application/p21":{"source":"iana"},"application/p21+zip":{"source":"iana","compressible":false},"application/p2p-overlay+xml":{"source":"iana","compressible":true,"extensions":["relo"]},"application/parityfec":{"source":"iana"},"application/passport":{"source":"iana"},"application/patch-ops-error+xml":{"source":"iana","compressible":true,"extensions":["xer"]},"application/pdf":{"source":"iana","compressible":false,"extensions":["pdf"]},"application/pdx":{"source":"iana"},"application/pem-certificate-chain":{"source":"iana"},"application/pgp-encrypted":{"source":"iana","compressible":false,"extensions":["pgp"]},"application/pgp-keys":{"source":"iana","extensions":["asc"]},"application/pgp-signature":{"source":"iana","extensions":["asc","sig"]},"application/pics-rules":{"source":"apache","extensions":["prf"]},"application/pidf+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/pidf-diff+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/pkcs10":{"source":"iana","extensions":["p10"]},"application/pkcs12":{"source":"iana"},"application/pkcs7-mime":{"source":"iana","extensions":["p7m","p7c"]},"application/pkcs7-signature":{"source":"iana","extensions":["p7s"]},"application/pkcs8":{"source":"iana","extensions":["p8"]},"application/pkcs8-encrypted":{"source":"iana"},"application/pkix-attr-cert":{"source":"iana","extensions":["ac"]},"application/pkix-cert":{"source":"iana","extensions":["cer"]},"application/pkix-crl":{"source":"iana","extensions":["crl"]},"application/pkix-pkipath":{"source":"iana","extensions":["pkipath"]},"application/pkixcmp":{"source":"iana","extensions":["pki"]},"application/pls+xml":{"source":"iana","compressible":true,"extensions":["pls"]},"application/poc-settings+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/postscript":{"source":"iana","compressible":true,"extensions":["ai","eps","ps"]},"application/ppsp-tracker+json":{"source":"iana","compressible":true},"application/problem+json":{"source":"iana","compressible":true},"application/problem+xml":{"source":"iana","compressible":true},"application/provenance+xml":{"source":"iana","compressible":true,"extensions":["provx"]},"application/prs.alvestrand.titrax-sheet":{"source":"iana"},"application/prs.cww":{"source":"iana","extensions":["cww"]},"application/prs.cyn":{"source":"iana","charset":"7-BIT"},"application/prs.hpub+zip":{"source":"iana","compressible":false},"application/prs.nprend":{"source":"iana"},"application/prs.plucker":{"source":"iana"},"application/prs.rdf-xml-crypt":{"source":"iana"},"application/prs.xsf+xml":{"source":"iana","compressible":true},"application/pskc+xml":{"source":"iana","compressible":true,"extensions":["pskcxml"]},"application/pvd+json":{"source":"iana","compressible":true},"application/qsig":{"source":"iana"},"application/raml+yaml":{"compressible":true,"extensions":["raml"]},"application/raptorfec":{"source":"iana"},"application/rdap+json":{"source":"iana","compressible":true},"application/rdf+xml":{"source":"iana","compressible":true,"extensions":["rdf","owl"]},"application/reginfo+xml":{"source":"iana","compressible":true,"extensions":["rif"]},"application/relax-ng-compact-syntax":{"source":"iana","extensions":["rnc"]},"application/remote-printing":{"source":"iana"},"application/reputon+json":{"source":"iana","compressible":true},"application/resource-lists+xml":{"source":"iana","compressible":true,"extensions":["rl"]},"application/resource-lists-diff+xml":{"source":"iana","compressible":true,"extensions":["rld"]},"application/rfc+xml":{"source":"iana","compressible":true},"application/riscos":{"source":"iana"},"application/rlmi+xml":{"source":"iana","compressible":true},"application/rls-services+xml":{"source":"iana","compressible":true,"extensions":["rs"]},"application/route-apd+xml":{"source":"iana","compressible":true,"extensions":["rapd"]},"application/route-s-tsid+xml":{"source":"iana","compressible":true,"extensions":["sls"]},"application/route-usd+xml":{"source":"iana","compressible":true,"extensions":["rusd"]},"application/rpki-ghostbusters":{"source":"iana","extensions":["gbr"]},"application/rpki-manifest":{"source":"iana","extensions":["mft"]},"application/rpki-publication":{"source":"iana"},"application/rpki-roa":{"source":"iana","extensions":["roa"]},"application/rpki-updown":{"source":"iana"},"application/rsd+xml":{"source":"apache","compressible":true,"extensions":["rsd"]},"application/rss+xml":{"source":"apache","compressible":true,"extensions":["rss"]},"application/rtf":{"source":"iana","compressible":true,"extensions":["rtf"]},"application/rtploopback":{"source":"iana"},"application/rtx":{"source":"iana"},"application/samlassertion+xml":{"source":"iana","compressible":true},"application/samlmetadata+xml":{"source":"iana","compressible":true},"application/sarif+json":{"source":"iana","compressible":true},"application/sarif-external-properties+json":{"source":"iana","compressible":true},"application/sbe":{"source":"iana"},"application/sbml+xml":{"source":"iana","compressible":true,"extensions":["sbml"]},"application/scaip+xml":{"source":"iana","compressible":true},"application/scim+json":{"source":"iana","compressible":true},"application/scvp-cv-request":{"source":"iana","extensions":["scq"]},"application/scvp-cv-response":{"source":"iana","extensions":["scs"]},"application/scvp-vp-request":{"source":"iana","extensions":["spq"]},"application/scvp-vp-response":{"source":"iana","extensions":["spp"]},"application/sdp":{"source":"iana","extensions":["sdp"]},"application/secevent+jwt":{"source":"iana"},"application/senml+cbor":{"source":"iana"},"application/senml+json":{"source":"iana","compressible":true},"application/senml+xml":{"source":"iana","compressible":true,"extensions":["senmlx"]},"application/senml-etch+cbor":{"source":"iana"},"application/senml-etch+json":{"source":"iana","compressible":true},"application/senml-exi":{"source":"iana"},"application/sensml+cbor":{"source":"iana"},"application/sensml+json":{"source":"iana","compressible":true},"application/sensml+xml":{"source":"iana","compressible":true,"extensions":["sensmlx"]},"application/sensml-exi":{"source":"iana"},"application/sep+xml":{"source":"iana","compressible":true},"application/sep-exi":{"source":"iana"},"application/session-info":{"source":"iana"},"application/set-payment":{"source":"iana"},"application/set-payment-initiation":{"source":"iana","extensions":["setpay"]},"application/set-registration":{"source":"iana"},"application/set-registration-initiation":{"source":"iana","extensions":["setreg"]},"application/sgml":{"source":"iana"},"application/sgml-open-catalog":{"source":"iana"},"application/shf+xml":{"source":"iana","compressible":true,"extensions":["shf"]},"application/sieve":{"source":"iana","extensions":["siv","sieve"]},"application/simple-filter+xml":{"source":"iana","compressible":true},"application/simple-message-summary":{"source":"iana"},"application/simplesymbolcontainer":{"source":"iana"},"application/sipc":{"source":"iana"},"application/slate":{"source":"iana"},"application/smil":{"source":"iana"},"application/smil+xml":{"source":"iana","compressible":true,"extensions":["smi","smil"]},"application/smpte336m":{"source":"iana"},"application/soap+fastinfoset":{"source":"iana"},"application/soap+xml":{"source":"iana","compressible":true},"application/sparql-query":{"source":"iana","extensions":["rq"]},"application/sparql-results+xml":{"source":"iana","compressible":true,"extensions":["srx"]},"application/spdx+json":{"source":"iana","compressible":true},"application/spirits-event+xml":{"source":"iana","compressible":true},"application/sql":{"source":"iana"},"application/srgs":{"source":"iana","extensions":["gram"]},"application/srgs+xml":{"source":"iana","compressible":true,"extensions":["grxml"]},"application/sru+xml":{"source":"iana","compressible":true,"extensions":["sru"]},"application/ssdl+xml":{"source":"apache","compressible":true,"extensions":["ssdl"]},"application/ssml+xml":{"source":"iana","compressible":true,"extensions":["ssml"]},"application/stix+json":{"source":"iana","compressible":true},"application/swid+xml":{"source":"iana","compressible":true,"extensions":["swidtag"]},"application/tamp-apex-update":{"source":"iana"},"application/tamp-apex-update-confirm":{"source":"iana"},"application/tamp-community-update":{"source":"iana"},"application/tamp-community-update-confirm":{"source":"iana"},"application/tamp-error":{"source":"iana"},"application/tamp-sequence-adjust":{"source":"iana"},"application/tamp-sequence-adjust-confirm":{"source":"iana"},"application/tamp-status-query":{"source":"iana"},"application/tamp-status-response":{"source":"iana"},"application/tamp-update":{"source":"iana"},"application/tamp-update-confirm":{"source":"iana"},"application/tar":{"compressible":true},"application/taxii+json":{"source":"iana","compressible":true},"application/td+json":{"source":"iana","compressible":true},"application/tei+xml":{"source":"iana","compressible":true,"extensions":["tei","teicorpus"]},"application/tetra_isi":{"source":"iana"},"application/thraud+xml":{"source":"iana","compressible":true,"extensions":["tfi"]},"application/timestamp-query":{"source":"iana"},"application/timestamp-reply":{"source":"iana"},"application/timestamped-data":{"source":"iana","extensions":["tsd"]},"application/tlsrpt+gzip":{"source":"iana"},"application/tlsrpt+json":{"source":"iana","compressible":true},"application/tnauthlist":{"source":"iana"},"application/token-introspection+jwt":{"source":"iana"},"application/toml":{"compressible":true,"extensions":["toml"]},"application/trickle-ice-sdpfrag":{"source":"iana"},"application/trig":{"source":"iana","extensions":["trig"]},"application/ttml+xml":{"source":"iana","compressible":true,"extensions":["ttml"]},"application/tve-trigger":{"source":"iana"},"application/tzif":{"source":"iana"},"application/tzif-leap":{"source":"iana"},"application/ubjson":{"compressible":false,"extensions":["ubj"]},"application/ulpfec":{"source":"iana"},"application/urc-grpsheet+xml":{"source":"iana","compressible":true},"application/urc-ressheet+xml":{"source":"iana","compressible":true,"extensions":["rsheet"]},"application/urc-targetdesc+xml":{"source":"iana","compressible":true,"extensions":["td"]},"application/urc-uisocketdesc+xml":{"source":"iana","compressible":true},"application/vcard+json":{"source":"iana","compressible":true},"application/vcard+xml":{"source":"iana","compressible":true},"application/vemmi":{"source":"iana"},"application/vividence.scriptfile":{"source":"apache"},"application/vnd.1000minds.decision-model+xml":{"source":"iana","compressible":true,"extensions":["1km"]},"application/vnd.3gpp-prose+xml":{"source":"iana","compressible":true},"application/vnd.3gpp-prose-pc3ch+xml":{"source":"iana","compressible":true},"application/vnd.3gpp-v2x-local-service-information":{"source":"iana"},"application/vnd.3gpp.5gnas":{"source":"iana"},"application/vnd.3gpp.access-transfer-events+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.bsf+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.gmop+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.gtpc":{"source":"iana"},"application/vnd.3gpp.interworking-data":{"source":"iana"},"application/vnd.3gpp.lpp":{"source":"iana"},"application/vnd.3gpp.mc-signalling-ear":{"source":"iana"},"application/vnd.3gpp.mcdata-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-payload":{"source":"iana"},"application/vnd.3gpp.mcdata-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-signalling":{"source":"iana"},"application/vnd.3gpp.mcdata-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcdata-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-floor-request+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-location-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-mbms-usage-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-signed+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-ue-init-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcptt-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-affiliation-command+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-affiliation-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-location-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-mbms-usage-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-service-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-transmission-request+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-ue-config+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mcvideo-user-profile+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.mid-call+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.ngap":{"source":"iana"},"application/vnd.3gpp.pfcp":{"source":"iana"},"application/vnd.3gpp.pic-bw-large":{"source":"iana","extensions":["plb"]},"application/vnd.3gpp.pic-bw-small":{"source":"iana","extensions":["psb"]},"application/vnd.3gpp.pic-bw-var":{"source":"iana","extensions":["pvb"]},"application/vnd.3gpp.s1ap":{"source":"iana"},"application/vnd.3gpp.sms":{"source":"iana"},"application/vnd.3gpp.sms+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.srvcc-ext+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.srvcc-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.state-and-event-info+xml":{"source":"iana","compressible":true},"application/vnd.3gpp.ussd+xml":{"source":"iana","compressible":true},"application/vnd.3gpp2.bcmcsinfo+xml":{"source":"iana","compressible":true},"application/vnd.3gpp2.sms":{"source":"iana"},"application/vnd.3gpp2.tcap":{"source":"iana","extensions":["tcap"]},"application/vnd.3lightssoftware.imagescal":{"source":"iana"},"application/vnd.3m.post-it-notes":{"source":"iana","extensions":["pwn"]},"application/vnd.accpac.simply.aso":{"source":"iana","extensions":["aso"]},"application/vnd.accpac.simply.imp":{"source":"iana","extensions":["imp"]},"application/vnd.acucobol":{"source":"iana","extensions":["acu"]},"application/vnd.acucorp":{"source":"iana","extensions":["atc","acutc"]},"application/vnd.adobe.air-application-installer-package+zip":{"source":"apache","compressible":false,"extensions":["air"]},"application/vnd.adobe.flash.movie":{"source":"iana"},"application/vnd.adobe.formscentral.fcdt":{"source":"iana","extensions":["fcdt"]},"application/vnd.adobe.fxp":{"source":"iana","extensions":["fxp","fxpl"]},"application/vnd.adobe.partial-upload":{"source":"iana"},"application/vnd.adobe.xdp+xml":{"source":"iana","compressible":true,"extensions":["xdp"]},"application/vnd.adobe.xfdf":{"source":"iana","extensions":["xfdf"]},"application/vnd.aether.imp":{"source":"iana"},"application/vnd.afpc.afplinedata":{"source":"iana"},"application/vnd.afpc.afplinedata-pagedef":{"source":"iana"},"application/vnd.afpc.cmoca-cmresource":{"source":"iana"},"application/vnd.afpc.foca-charset":{"source":"iana"},"application/vnd.afpc.foca-codedfont":{"source":"iana"},"application/vnd.afpc.foca-codepage":{"source":"iana"},"application/vnd.afpc.modca":{"source":"iana"},"application/vnd.afpc.modca-cmtable":{"source":"iana"},"application/vnd.afpc.modca-formdef":{"source":"iana"},"application/vnd.afpc.modca-mediummap":{"source":"iana"},"application/vnd.afpc.modca-objectcontainer":{"source":"iana"},"application/vnd.afpc.modca-overlay":{"source":"iana"},"application/vnd.afpc.modca-pagesegment":{"source":"iana"},"application/vnd.age":{"source":"iana","extensions":["age"]},"application/vnd.ah-barcode":{"source":"iana"},"application/vnd.ahead.space":{"source":"iana","extensions":["ahead"]},"application/vnd.airzip.filesecure.azf":{"source":"iana","extensions":["azf"]},"application/vnd.airzip.filesecure.azs":{"source":"iana","extensions":["azs"]},"application/vnd.amadeus+json":{"source":"iana","compressible":true},"application/vnd.amazon.ebook":{"source":"apache","extensions":["azw"]},"application/vnd.amazon.mobi8-ebook":{"source":"iana"},"application/vnd.americandynamics.acc":{"source":"iana","extensions":["acc"]},"application/vnd.amiga.ami":{"source":"iana","extensions":["ami"]},"application/vnd.amundsen.maze+xml":{"source":"iana","compressible":true},"application/vnd.android.ota":{"source":"iana"},"application/vnd.android.package-archive":{"source":"apache","compressible":false,"extensions":["apk"]},"application/vnd.anki":{"source":"iana"},"application/vnd.anser-web-certificate-issue-initiation":{"source":"iana","extensions":["cii"]},"application/vnd.anser-web-funds-transfer-initiation":{"source":"apache","extensions":["fti"]},"application/vnd.antix.game-component":{"source":"iana","extensions":["atx"]},"application/vnd.apache.arrow.file":{"source":"iana"},"application/vnd.apache.arrow.stream":{"source":"iana"},"application/vnd.apache.thrift.binary":{"source":"iana"},"application/vnd.apache.thrift.compact":{"source":"iana"},"application/vnd.apache.thrift.json":{"source":"iana"},"application/vnd.api+json":{"source":"iana","compressible":true},"application/vnd.aplextor.warrp+json":{"source":"iana","compressible":true},"application/vnd.apothekende.reservation+json":{"source":"iana","compressible":true},"application/vnd.apple.installer+xml":{"source":"iana","compressible":true,"extensions":["mpkg"]},"application/vnd.apple.keynote":{"source":"iana","extensions":["key"]},"application/vnd.apple.mpegurl":{"source":"iana","extensions":["m3u8"]},"application/vnd.apple.numbers":{"source":"iana","extensions":["numbers"]},"application/vnd.apple.pages":{"source":"iana","extensions":["pages"]},"application/vnd.apple.pkpass":{"compressible":false,"extensions":["pkpass"]},"application/vnd.arastra.swi":{"source":"iana"},"application/vnd.aristanetworks.swi":{"source":"iana","extensions":["swi"]},"application/vnd.artisan+json":{"source":"iana","compressible":true},"application/vnd.artsquare":{"source":"iana"},"application/vnd.astraea-software.iota":{"source":"iana","extensions":["iota"]},"application/vnd.audiograph":{"source":"iana","extensions":["aep"]},"application/vnd.autopackage":{"source":"iana"},"application/vnd.avalon+json":{"source":"iana","compressible":true},"application/vnd.avistar+xml":{"source":"iana","compressible":true},"application/vnd.balsamiq.bmml+xml":{"source":"iana","compressible":true,"extensions":["bmml"]},"application/vnd.balsamiq.bmpr":{"source":"iana"},"application/vnd.banana-accounting":{"source":"iana"},"application/vnd.bbf.usp.error":{"source":"iana"},"application/vnd.bbf.usp.msg":{"source":"iana"},"application/vnd.bbf.usp.msg+json":{"source":"iana","compressible":true},"application/vnd.bekitzur-stech+json":{"source":"iana","compressible":true},"application/vnd.bint.med-content":{"source":"iana"},"application/vnd.biopax.rdf+xml":{"source":"iana","compressible":true},"application/vnd.blink-idb-value-wrapper":{"source":"iana"},"application/vnd.blueice.multipass":{"source":"iana","extensions":["mpm"]},"application/vnd.bluetooth.ep.oob":{"source":"iana"},"application/vnd.bluetooth.le.oob":{"source":"iana"},"application/vnd.bmi":{"source":"iana","extensions":["bmi"]},"application/vnd.bpf":{"source":"iana"},"application/vnd.bpf3":{"source":"iana"},"application/vnd.businessobjects":{"source":"iana","extensions":["rep"]},"application/vnd.byu.uapi+json":{"source":"iana","compressible":true},"application/vnd.cab-jscript":{"source":"iana"},"application/vnd.canon-cpdl":{"source":"iana"},"application/vnd.canon-lips":{"source":"iana"},"application/vnd.capasystems-pg+json":{"source":"iana","compressible":true},"application/vnd.cendio.thinlinc.clientconf":{"source":"iana"},"application/vnd.century-systems.tcp_stream":{"source":"iana"},"application/vnd.chemdraw+xml":{"source":"iana","compressible":true,"extensions":["cdxml"]},"application/vnd.chess-pgn":{"source":"iana"},"application/vnd.chipnuts.karaoke-mmd":{"source":"iana","extensions":["mmd"]},"application/vnd.ciedi":{"source":"iana"},"application/vnd.cinderella":{"source":"iana","extensions":["cdy"]},"application/vnd.cirpack.isdn-ext":{"source":"iana"},"application/vnd.citationstyles.style+xml":{"source":"iana","compressible":true,"extensions":["csl"]},"application/vnd.claymore":{"source":"iana","extensions":["cla"]},"application/vnd.cloanto.rp9":{"source":"iana","extensions":["rp9"]},"application/vnd.clonk.c4group":{"source":"iana","extensions":["c4g","c4d","c4f","c4p","c4u"]},"application/vnd.cluetrust.cartomobile-config":{"source":"iana","extensions":["c11amc"]},"application/vnd.cluetrust.cartomobile-config-pkg":{"source":"iana","extensions":["c11amz"]},"application/vnd.coffeescript":{"source":"iana"},"application/vnd.collabio.xodocuments.document":{"source":"iana"},"application/vnd.collabio.xodocuments.document-template":{"source":"iana"},"application/vnd.collabio.xodocuments.presentation":{"source":"iana"},"application/vnd.collabio.xodocuments.presentation-template":{"source":"iana"},"application/vnd.collabio.xodocuments.spreadsheet":{"source":"iana"},"application/vnd.collabio.xodocuments.spreadsheet-template":{"source":"iana"},"application/vnd.collection+json":{"source":"iana","compressible":true},"application/vnd.collection.doc+json":{"source":"iana","compressible":true},"application/vnd.collection.next+json":{"source":"iana","compressible":true},"application/vnd.comicbook+zip":{"source":"iana","compressible":false},"application/vnd.comicbook-rar":{"source":"iana"},"application/vnd.commerce-battelle":{"source":"iana"},"application/vnd.commonspace":{"source":"iana","extensions":["csp"]},"application/vnd.contact.cmsg":{"source":"iana","extensions":["cdbcmsg"]},"application/vnd.coreos.ignition+json":{"source":"iana","compressible":true},"application/vnd.cosmocaller":{"source":"iana","extensions":["cmc"]},"application/vnd.crick.clicker":{"source":"iana","extensions":["clkx"]},"application/vnd.crick.clicker.keyboard":{"source":"iana","extensions":["clkk"]},"application/vnd.crick.clicker.palette":{"source":"iana","extensions":["clkp"]},"application/vnd.crick.clicker.template":{"source":"iana","extensions":["clkt"]},"application/vnd.crick.clicker.wordbank":{"source":"iana","extensions":["clkw"]},"application/vnd.criticaltools.wbs+xml":{"source":"iana","compressible":true,"extensions":["wbs"]},"application/vnd.cryptii.pipe+json":{"source":"iana","compressible":true},"application/vnd.crypto-shade-file":{"source":"iana"},"application/vnd.cryptomator.encrypted":{"source":"iana"},"application/vnd.cryptomator.vault":{"source":"iana"},"application/vnd.ctc-posml":{"source":"iana","extensions":["pml"]},"application/vnd.ctct.ws+xml":{"source":"iana","compressible":true},"application/vnd.cups-pdf":{"source":"iana"},"application/vnd.cups-postscript":{"source":"iana"},"application/vnd.cups-ppd":{"source":"iana","extensions":["ppd"]},"application/vnd.cups-raster":{"source":"iana"},"application/vnd.cups-raw":{"source":"iana"},"application/vnd.curl":{"source":"iana"},"application/vnd.curl.car":{"source":"apache","extensions":["car"]},"application/vnd.curl.pcurl":{"source":"apache","extensions":["pcurl"]},"application/vnd.cyan.dean.root+xml":{"source":"iana","compressible":true},"application/vnd.cybank":{"source":"iana"},"application/vnd.cyclonedx+json":{"source":"iana","compressible":true},"application/vnd.cyclonedx+xml":{"source":"iana","compressible":true},"application/vnd.d2l.coursepackage1p0+zip":{"source":"iana","compressible":false},"application/vnd.d3m-dataset":{"source":"iana"},"application/vnd.d3m-problem":{"source":"iana"},"application/vnd.dart":{"source":"iana","compressible":true,"extensions":["dart"]},"application/vnd.data-vision.rdz":{"source":"iana","extensions":["rdz"]},"application/vnd.datapackage+json":{"source":"iana","compressible":true},"application/vnd.dataresource+json":{"source":"iana","compressible":true},"application/vnd.dbf":{"source":"iana","extensions":["dbf"]},"application/vnd.debian.binary-package":{"source":"iana"},"application/vnd.dece.data":{"source":"iana","extensions":["uvf","uvvf","uvd","uvvd"]},"application/vnd.dece.ttml+xml":{"source":"iana","compressible":true,"extensions":["uvt","uvvt"]},"application/vnd.dece.unspecified":{"source":"iana","extensions":["uvx","uvvx"]},"application/vnd.dece.zip":{"source":"iana","extensions":["uvz","uvvz"]},"application/vnd.denovo.fcselayout-link":{"source":"iana","extensions":["fe_launch"]},"application/vnd.desmume.movie":{"source":"iana"},"application/vnd.dir-bi.plate-dl-nosuffix":{"source":"iana"},"application/vnd.dm.delegation+xml":{"source":"iana","compressible":true},"application/vnd.dna":{"source":"iana","extensions":["dna"]},"application/vnd.document+json":{"source":"iana","compressible":true},"application/vnd.dolby.mlp":{"source":"apache","extensions":["mlp"]},"application/vnd.dolby.mobile.1":{"source":"iana"},"application/vnd.dolby.mobile.2":{"source":"iana"},"application/vnd.doremir.scorecloud-binary-document":{"source":"iana"},"application/vnd.dpgraph":{"source":"iana","extensions":["dpg"]},"application/vnd.dreamfactory":{"source":"iana","extensions":["dfac"]},"application/vnd.drive+json":{"source":"iana","compressible":true},"application/vnd.ds-keypoint":{"source":"apache","extensions":["kpxx"]},"application/vnd.dtg.local":{"source":"iana"},"application/vnd.dtg.local.flash":{"source":"iana"},"application/vnd.dtg.local.html":{"source":"iana"},"application/vnd.dvb.ait":{"source":"iana","extensions":["ait"]},"application/vnd.dvb.dvbisl+xml":{"source":"iana","compressible":true},"application/vnd.dvb.dvbj":{"source":"iana"},"application/vnd.dvb.esgcontainer":{"source":"iana"},"application/vnd.dvb.ipdcdftnotifaccess":{"source":"iana"},"application/vnd.dvb.ipdcesgaccess":{"source":"iana"},"application/vnd.dvb.ipdcesgaccess2":{"source":"iana"},"application/vnd.dvb.ipdcesgpdd":{"source":"iana"},"application/vnd.dvb.ipdcroaming":{"source":"iana"},"application/vnd.dvb.iptv.alfec-base":{"source":"iana"},"application/vnd.dvb.iptv.alfec-enhancement":{"source":"iana"},"application/vnd.dvb.notif-aggregate-root+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-container+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-generic+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-msglist+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-registration-request+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-ia-registration-response+xml":{"source":"iana","compressible":true},"application/vnd.dvb.notif-init+xml":{"source":"iana","compressible":true},"application/vnd.dvb.pfr":{"source":"iana"},"application/vnd.dvb.service":{"source":"iana","extensions":["svc"]},"application/vnd.dxr":{"source":"iana"},"application/vnd.dynageo":{"source":"iana","extensions":["geo"]},"application/vnd.dzr":{"source":"iana"},"application/vnd.easykaraoke.cdgdownload":{"source":"iana"},"application/vnd.ecdis-update":{"source":"iana"},"application/vnd.ecip.rlp":{"source":"iana"},"application/vnd.eclipse.ditto+json":{"source":"iana","compressible":true},"application/vnd.ecowin.chart":{"source":"iana","extensions":["mag"]},"application/vnd.ecowin.filerequest":{"source":"iana"},"application/vnd.ecowin.fileupdate":{"source":"iana"},"application/vnd.ecowin.series":{"source":"iana"},"application/vnd.ecowin.seriesrequest":{"source":"iana"},"application/vnd.ecowin.seriesupdate":{"source":"iana"},"application/vnd.efi.img":{"source":"iana"},"application/vnd.efi.iso":{"source":"iana"},"application/vnd.emclient.accessrequest+xml":{"source":"iana","compressible":true},"application/vnd.enliven":{"source":"iana","extensions":["nml"]},"application/vnd.enphase.envoy":{"source":"iana"},"application/vnd.eprints.data+xml":{"source":"iana","compressible":true},"application/vnd.epson.esf":{"source":"iana","extensions":["esf"]},"application/vnd.epson.msf":{"source":"iana","extensions":["msf"]},"application/vnd.epson.quickanime":{"source":"iana","extensions":["qam"]},"application/vnd.epson.salt":{"source":"iana","extensions":["slt"]},"application/vnd.epson.ssf":{"source":"iana","extensions":["ssf"]},"application/vnd.ericsson.quickcall":{"source":"iana"},"application/vnd.espass-espass+zip":{"source":"iana","compressible":false},"application/vnd.eszigno3+xml":{"source":"iana","compressible":true,"extensions":["es3","et3"]},"application/vnd.etsi.aoc+xml":{"source":"iana","compressible":true},"application/vnd.etsi.asic-e+zip":{"source":"iana","compressible":false},"application/vnd.etsi.asic-s+zip":{"source":"iana","compressible":false},"application/vnd.etsi.cug+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvcommand+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvdiscovery+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvprofile+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-bc+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-cod+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsad-npvr+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvservice+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvsync+xml":{"source":"iana","compressible":true},"application/vnd.etsi.iptvueprofile+xml":{"source":"iana","compressible":true},"application/vnd.etsi.mcid+xml":{"source":"iana","compressible":true},"application/vnd.etsi.mheg5":{"source":"iana"},"application/vnd.etsi.overload-control-policy-dataset+xml":{"source":"iana","compressible":true},"application/vnd.etsi.pstn+xml":{"source":"iana","compressible":true},"application/vnd.etsi.sci+xml":{"source":"iana","compressible":true},"application/vnd.etsi.simservs+xml":{"source":"iana","compressible":true},"application/vnd.etsi.timestamp-token":{"source":"iana"},"application/vnd.etsi.tsl+xml":{"source":"iana","compressible":true},"application/vnd.etsi.tsl.der":{"source":"iana"},"application/vnd.eu.kasparian.car+json":{"source":"iana","compressible":true},"application/vnd.eudora.data":{"source":"iana"},"application/vnd.evolv.ecig.profile":{"source":"iana"},"application/vnd.evolv.ecig.settings":{"source":"iana"},"application/vnd.evolv.ecig.theme":{"source":"iana"},"application/vnd.exstream-empower+zip":{"source":"iana","compressible":false},"application/vnd.exstream-package":{"source":"iana"},"application/vnd.ezpix-album":{"source":"iana","extensions":["ez2"]},"application/vnd.ezpix-package":{"source":"iana","extensions":["ez3"]},"application/vnd.f-secure.mobile":{"source":"iana"},"application/vnd.familysearch.gedcom+zip":{"source":"iana","compressible":false},"application/vnd.fastcopy-disk-image":{"source":"iana"},"application/vnd.fdf":{"source":"iana","extensions":["fdf"]},"application/vnd.fdsn.mseed":{"source":"iana","extensions":["mseed"]},"application/vnd.fdsn.seed":{"source":"iana","extensions":["seed","dataless"]},"application/vnd.ffsns":{"source":"iana"},"application/vnd.ficlab.flb+zip":{"source":"iana","compressible":false},"application/vnd.filmit.zfc":{"source":"iana"},"application/vnd.fints":{"source":"iana"},"application/vnd.firemonkeys.cloudcell":{"source":"iana"},"application/vnd.flographit":{"source":"iana","extensions":["gph"]},"application/vnd.fluxtime.clip":{"source":"iana","extensions":["ftc"]},"application/vnd.font-fontforge-sfd":{"source":"iana"},"application/vnd.framemaker":{"source":"iana","extensions":["fm","frame","maker","book"]},"application/vnd.frogans.fnc":{"source":"iana","extensions":["fnc"]},"application/vnd.frogans.ltf":{"source":"iana","extensions":["ltf"]},"application/vnd.fsc.weblaunch":{"source":"iana","extensions":["fsc"]},"application/vnd.fujifilm.fb.docuworks":{"source":"iana"},"application/vnd.fujifilm.fb.docuworks.binder":{"source":"iana"},"application/vnd.fujifilm.fb.docuworks.container":{"source":"iana"},"application/vnd.fujifilm.fb.jfi+xml":{"source":"iana","compressible":true},"application/vnd.fujitsu.oasys":{"source":"iana","extensions":["oas"]},"application/vnd.fujitsu.oasys2":{"source":"iana","extensions":["oa2"]},"application/vnd.fujitsu.oasys3":{"source":"iana","extensions":["oa3"]},"application/vnd.fujitsu.oasysgp":{"source":"iana","extensions":["fg5"]},"application/vnd.fujitsu.oasysprs":{"source":"iana","extensions":["bh2"]},"application/vnd.fujixerox.art-ex":{"source":"iana"},"application/vnd.fujixerox.art4":{"source":"iana"},"application/vnd.fujixerox.ddd":{"source":"iana","extensions":["ddd"]},"application/vnd.fujixerox.docuworks":{"source":"iana","extensions":["xdw"]},"application/vnd.fujixerox.docuworks.binder":{"source":"iana","extensions":["xbd"]},"application/vnd.fujixerox.docuworks.container":{"source":"iana"},"application/vnd.fujixerox.hbpl":{"source":"iana"},"application/vnd.fut-misnet":{"source":"iana"},"application/vnd.futoin+cbor":{"source":"iana"},"application/vnd.futoin+json":{"source":"iana","compressible":true},"application/vnd.fuzzysheet":{"source":"iana","extensions":["fzs"]},"application/vnd.genomatix.tuxedo":{"source":"iana","extensions":["txd"]},"application/vnd.gentics.grd+json":{"source":"iana","compressible":true},"application/vnd.geo+json":{"source":"iana","compressible":true},"application/vnd.geocube+xml":{"source":"iana","compressible":true},"application/vnd.geogebra.file":{"source":"iana","extensions":["ggb"]},"application/vnd.geogebra.slides":{"source":"iana"},"application/vnd.geogebra.tool":{"source":"iana","extensions":["ggt"]},"application/vnd.geometry-explorer":{"source":"iana","extensions":["gex","gre"]},"application/vnd.geonext":{"source":"iana","extensions":["gxt"]},"application/vnd.geoplan":{"source":"iana","extensions":["g2w"]},"application/vnd.geospace":{"source":"iana","extensions":["g3w"]},"application/vnd.gerber":{"source":"iana"},"application/vnd.globalplatform.card-content-mgt":{"source":"iana"},"application/vnd.globalplatform.card-content-mgt-response":{"source":"iana"},"application/vnd.gmx":{"source":"iana","extensions":["gmx"]},"application/vnd.google-apps.document":{"compressible":false,"extensions":["gdoc"]},"application/vnd.google-apps.presentation":{"compressible":false,"extensions":["gslides"]},"application/vnd.google-apps.spreadsheet":{"compressible":false,"extensions":["gsheet"]},"application/vnd.google-earth.kml+xml":{"source":"iana","compressible":true,"extensions":["kml"]},"application/vnd.google-earth.kmz":{"source":"iana","compressible":false,"extensions":["kmz"]},"application/vnd.gov.sk.e-form+xml":{"source":"iana","compressible":true},"application/vnd.gov.sk.e-form+zip":{"source":"iana","compressible":false},"application/vnd.gov.sk.xmldatacontainer+xml":{"source":"iana","compressible":true},"application/vnd.grafeq":{"source":"iana","extensions":["gqf","gqs"]},"application/vnd.gridmp":{"source":"iana"},"application/vnd.groove-account":{"source":"iana","extensions":["gac"]},"application/vnd.groove-help":{"source":"iana","extensions":["ghf"]},"application/vnd.groove-identity-message":{"source":"iana","extensions":["gim"]},"application/vnd.groove-injector":{"source":"iana","extensions":["grv"]},"application/vnd.groove-tool-message":{"source":"iana","extensions":["gtm"]},"application/vnd.groove-tool-template":{"source":"iana","extensions":["tpl"]},"application/vnd.groove-vcard":{"source":"iana","extensions":["vcg"]},"application/vnd.hal+json":{"source":"iana","compressible":true},"application/vnd.hal+xml":{"source":"iana","compressible":true,"extensions":["hal"]},"application/vnd.handheld-entertainment+xml":{"source":"iana","compressible":true,"extensions":["zmm"]},"application/vnd.hbci":{"source":"iana","extensions":["hbci"]},"application/vnd.hc+json":{"source":"iana","compressible":true},"application/vnd.hcl-bireports":{"source":"iana"},"application/vnd.hdt":{"source":"iana"},"application/vnd.heroku+json":{"source":"iana","compressible":true},"application/vnd.hhe.lesson-player":{"source":"iana","extensions":["les"]},"application/vnd.hl7cda+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.hl7v2+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.hp-hpgl":{"source":"iana","extensions":["hpgl"]},"application/vnd.hp-hpid":{"source":"iana","extensions":["hpid"]},"application/vnd.hp-hps":{"source":"iana","extensions":["hps"]},"application/vnd.hp-jlyt":{"source":"iana","extensions":["jlt"]},"application/vnd.hp-pcl":{"source":"iana","extensions":["pcl"]},"application/vnd.hp-pclxl":{"source":"iana","extensions":["pclxl"]},"application/vnd.httphone":{"source":"iana"},"application/vnd.hydrostatix.sof-data":{"source":"iana","extensions":["sfd-hdstx"]},"application/vnd.hyper+json":{"source":"iana","compressible":true},"application/vnd.hyper-item+json":{"source":"iana","compressible":true},"application/vnd.hyperdrive+json":{"source":"iana","compressible":true},"application/vnd.hzn-3d-crossword":{"source":"iana"},"application/vnd.ibm.afplinedata":{"source":"iana"},"application/vnd.ibm.electronic-media":{"source":"iana"},"application/vnd.ibm.minipay":{"source":"iana","extensions":["mpy"]},"application/vnd.ibm.modcap":{"source":"iana","extensions":["afp","listafp","list3820"]},"application/vnd.ibm.rights-management":{"source":"iana","extensions":["irm"]},"application/vnd.ibm.secure-container":{"source":"iana","extensions":["sc"]},"application/vnd.iccprofile":{"source":"iana","extensions":["icc","icm"]},"application/vnd.ieee.1905":{"source":"iana"},"application/vnd.igloader":{"source":"iana","extensions":["igl"]},"application/vnd.imagemeter.folder+zip":{"source":"iana","compressible":false},"application/vnd.imagemeter.image+zip":{"source":"iana","compressible":false},"application/vnd.immervision-ivp":{"source":"iana","extensions":["ivp"]},"application/vnd.immervision-ivu":{"source":"iana","extensions":["ivu"]},"application/vnd.ims.imsccv1p1":{"source":"iana"},"application/vnd.ims.imsccv1p2":{"source":"iana"},"application/vnd.ims.imsccv1p3":{"source":"iana"},"application/vnd.ims.lis.v2.result+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolconsumerprofile+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolproxy+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolproxy.id+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolsettings+json":{"source":"iana","compressible":true},"application/vnd.ims.lti.v2.toolsettings.simple+json":{"source":"iana","compressible":true},"application/vnd.informedcontrol.rms+xml":{"source":"iana","compressible":true},"application/vnd.informix-visionary":{"source":"iana"},"application/vnd.infotech.project":{"source":"iana"},"application/vnd.infotech.project+xml":{"source":"iana","compressible":true},"application/vnd.innopath.wamp.notification":{"source":"iana"},"application/vnd.insors.igm":{"source":"iana","extensions":["igm"]},"application/vnd.intercon.formnet":{"source":"iana","extensions":["xpw","xpx"]},"application/vnd.intergeo":{"source":"iana","extensions":["i2g"]},"application/vnd.intertrust.digibox":{"source":"iana"},"application/vnd.intertrust.nncp":{"source":"iana"},"application/vnd.intu.qbo":{"source":"iana","extensions":["qbo"]},"application/vnd.intu.qfx":{"source":"iana","extensions":["qfx"]},"application/vnd.iptc.g2.catalogitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.conceptitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.knowledgeitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.newsitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.newsmessage+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.packageitem+xml":{"source":"iana","compressible":true},"application/vnd.iptc.g2.planningitem+xml":{"source":"iana","compressible":true},"application/vnd.ipunplugged.rcprofile":{"source":"iana","extensions":["rcprofile"]},"application/vnd.irepository.package+xml":{"source":"iana","compressible":true,"extensions":["irp"]},"application/vnd.is-xpr":{"source":"iana","extensions":["xpr"]},"application/vnd.isac.fcs":{"source":"iana","extensions":["fcs"]},"application/vnd.iso11783-10+zip":{"source":"iana","compressible":false},"application/vnd.jam":{"source":"iana","extensions":["jam"]},"application/vnd.japannet-directory-service":{"source":"iana"},"application/vnd.japannet-jpnstore-wakeup":{"source":"iana"},"application/vnd.japannet-payment-wakeup":{"source":"iana"},"application/vnd.japannet-registration":{"source":"iana"},"application/vnd.japannet-registration-wakeup":{"source":"iana"},"application/vnd.japannet-setstore-wakeup":{"source":"iana"},"application/vnd.japannet-verification":{"source":"iana"},"application/vnd.japannet-verification-wakeup":{"source":"iana"},"application/vnd.jcp.javame.midlet-rms":{"source":"iana","extensions":["rms"]},"application/vnd.jisp":{"source":"iana","extensions":["jisp"]},"application/vnd.joost.joda-archive":{"source":"iana","extensions":["joda"]},"application/vnd.jsk.isdn-ngn":{"source":"iana"},"application/vnd.kahootz":{"source":"iana","extensions":["ktz","ktr"]},"application/vnd.kde.karbon":{"source":"iana","extensions":["karbon"]},"application/vnd.kde.kchart":{"source":"iana","extensions":["chrt"]},"application/vnd.kde.kformula":{"source":"iana","extensions":["kfo"]},"application/vnd.kde.kivio":{"source":"iana","extensions":["flw"]},"application/vnd.kde.kontour":{"source":"iana","extensions":["kon"]},"application/vnd.kde.kpresenter":{"source":"iana","extensions":["kpr","kpt"]},"application/vnd.kde.kspread":{"source":"iana","extensions":["ksp"]},"application/vnd.kde.kword":{"source":"iana","extensions":["kwd","kwt"]},"application/vnd.kenameaapp":{"source":"iana","extensions":["htke"]},"application/vnd.kidspiration":{"source":"iana","extensions":["kia"]},"application/vnd.kinar":{"source":"iana","extensions":["kne","knp"]},"application/vnd.koan":{"source":"iana","extensions":["skp","skd","skt","skm"]},"application/vnd.kodak-descriptor":{"source":"iana","extensions":["sse"]},"application/vnd.las":{"source":"iana"},"application/vnd.las.las+json":{"source":"iana","compressible":true},"application/vnd.las.las+xml":{"source":"iana","compressible":true,"extensions":["lasxml"]},"application/vnd.laszip":{"source":"iana"},"application/vnd.leap+json":{"source":"iana","compressible":true},"application/vnd.liberty-request+xml":{"source":"iana","compressible":true},"application/vnd.llamagraphics.life-balance.desktop":{"source":"iana","extensions":["lbd"]},"application/vnd.llamagraphics.life-balance.exchange+xml":{"source":"iana","compressible":true,"extensions":["lbe"]},"application/vnd.logipipe.circuit+zip":{"source":"iana","compressible":false},"application/vnd.loom":{"source":"iana"},"application/vnd.lotus-1-2-3":{"source":"iana","extensions":["123"]},"application/vnd.lotus-approach":{"source":"iana","extensions":["apr"]},"application/vnd.lotus-freelance":{"source":"iana","extensions":["pre"]},"application/vnd.lotus-notes":{"source":"iana","extensions":["nsf"]},"application/vnd.lotus-organizer":{"source":"iana","extensions":["org"]},"application/vnd.lotus-screencam":{"source":"iana","extensions":["scm"]},"application/vnd.lotus-wordpro":{"source":"iana","extensions":["lwp"]},"application/vnd.macports.portpkg":{"source":"iana","extensions":["portpkg"]},"application/vnd.mapbox-vector-tile":{"source":"iana","extensions":["mvt"]},"application/vnd.marlin.drm.actiontoken+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.conftoken+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.license+xml":{"source":"iana","compressible":true},"application/vnd.marlin.drm.mdcf":{"source":"iana"},"application/vnd.mason+json":{"source":"iana","compressible":true},"application/vnd.maxar.archive.3tz+zip":{"source":"iana","compressible":false},"application/vnd.maxmind.maxmind-db":{"source":"iana"},"application/vnd.mcd":{"source":"iana","extensions":["mcd"]},"application/vnd.medcalcdata":{"source":"iana","extensions":["mc1"]},"application/vnd.mediastation.cdkey":{"source":"iana","extensions":["cdkey"]},"application/vnd.meridian-slingshot":{"source":"iana"},"application/vnd.mfer":{"source":"iana","extensions":["mwf"]},"application/vnd.mfmp":{"source":"iana","extensions":["mfm"]},"application/vnd.micro+json":{"source":"iana","compressible":true},"application/vnd.micrografx.flo":{"source":"iana","extensions":["flo"]},"application/vnd.micrografx.igx":{"source":"iana","extensions":["igx"]},"application/vnd.microsoft.portable-executable":{"source":"iana"},"application/vnd.microsoft.windows.thumbnail-cache":{"source":"iana"},"application/vnd.miele+json":{"source":"iana","compressible":true},"application/vnd.mif":{"source":"iana","extensions":["mif"]},"application/vnd.minisoft-hp3000-save":{"source":"iana"},"application/vnd.mitsubishi.misty-guard.trustweb":{"source":"iana"},"application/vnd.mobius.daf":{"source":"iana","extensions":["daf"]},"application/vnd.mobius.dis":{"source":"iana","extensions":["dis"]},"application/vnd.mobius.mbk":{"source":"iana","extensions":["mbk"]},"application/vnd.mobius.mqy":{"source":"iana","extensions":["mqy"]},"application/vnd.mobius.msl":{"source":"iana","extensions":["msl"]},"application/vnd.mobius.plc":{"source":"iana","extensions":["plc"]},"application/vnd.mobius.txf":{"source":"iana","extensions":["txf"]},"application/vnd.mophun.application":{"source":"iana","extensions":["mpn"]},"application/vnd.mophun.certificate":{"source":"iana","extensions":["mpc"]},"application/vnd.motorola.flexsuite":{"source":"iana"},"application/vnd.motorola.flexsuite.adsi":{"source":"iana"},"application/vnd.motorola.flexsuite.fis":{"source":"iana"},"application/vnd.motorola.flexsuite.gotap":{"source":"iana"},"application/vnd.motorola.flexsuite.kmr":{"source":"iana"},"application/vnd.motorola.flexsuite.ttc":{"source":"iana"},"application/vnd.motorola.flexsuite.wem":{"source":"iana"},"application/vnd.motorola.iprm":{"source":"iana"},"application/vnd.mozilla.xul+xml":{"source":"iana","compressible":true,"extensions":["xul"]},"application/vnd.ms-3mfdocument":{"source":"iana"},"application/vnd.ms-artgalry":{"source":"iana","extensions":["cil"]},"application/vnd.ms-asf":{"source":"iana"},"application/vnd.ms-cab-compressed":{"source":"iana","extensions":["cab"]},"application/vnd.ms-color.iccprofile":{"source":"apache"},"application/vnd.ms-excel":{"source":"iana","compressible":false,"extensions":["xls","xlm","xla","xlc","xlt","xlw"]},"application/vnd.ms-excel.addin.macroenabled.12":{"source":"iana","extensions":["xlam"]},"application/vnd.ms-excel.sheet.binary.macroenabled.12":{"source":"iana","extensions":["xlsb"]},"application/vnd.ms-excel.sheet.macroenabled.12":{"source":"iana","extensions":["xlsm"]},"application/vnd.ms-excel.template.macroenabled.12":{"source":"iana","extensions":["xltm"]},"application/vnd.ms-fontobject":{"source":"iana","compressible":true,"extensions":["eot"]},"application/vnd.ms-htmlhelp":{"source":"iana","extensions":["chm"]},"application/vnd.ms-ims":{"source":"iana","extensions":["ims"]},"application/vnd.ms-lrm":{"source":"iana","extensions":["lrm"]},"application/vnd.ms-office.activex+xml":{"source":"iana","compressible":true},"application/vnd.ms-officetheme":{"source":"iana","extensions":["thmx"]},"application/vnd.ms-opentype":{"source":"apache","compressible":true},"application/vnd.ms-outlook":{"compressible":false,"extensions":["msg"]},"application/vnd.ms-package.obfuscated-opentype":{"source":"apache"},"application/vnd.ms-pki.seccat":{"source":"apache","extensions":["cat"]},"application/vnd.ms-pki.stl":{"source":"apache","extensions":["stl"]},"application/vnd.ms-playready.initiator+xml":{"source":"iana","compressible":true},"application/vnd.ms-powerpoint":{"source":"iana","compressible":false,"extensions":["ppt","pps","pot"]},"application/vnd.ms-powerpoint.addin.macroenabled.12":{"source":"iana","extensions":["ppam"]},"application/vnd.ms-powerpoint.presentation.macroenabled.12":{"source":"iana","extensions":["pptm"]},"application/vnd.ms-powerpoint.slide.macroenabled.12":{"source":"iana","extensions":["sldm"]},"application/vnd.ms-powerpoint.slideshow.macroenabled.12":{"source":"iana","extensions":["ppsm"]},"application/vnd.ms-powerpoint.template.macroenabled.12":{"source":"iana","extensions":["potm"]},"application/vnd.ms-printdevicecapabilities+xml":{"source":"iana","compressible":true},"application/vnd.ms-printing.printticket+xml":{"source":"apache","compressible":true},"application/vnd.ms-printschematicket+xml":{"source":"iana","compressible":true},"application/vnd.ms-project":{"source":"iana","extensions":["mpp","mpt"]},"application/vnd.ms-tnef":{"source":"iana"},"application/vnd.ms-windows.devicepairing":{"source":"iana"},"application/vnd.ms-windows.nwprinting.oob":{"source":"iana"},"application/vnd.ms-windows.printerpairing":{"source":"iana"},"application/vnd.ms-windows.wsd.oob":{"source":"iana"},"application/vnd.ms-wmdrm.lic-chlg-req":{"source":"iana"},"application/vnd.ms-wmdrm.lic-resp":{"source":"iana"},"application/vnd.ms-wmdrm.meter-chlg-req":{"source":"iana"},"application/vnd.ms-wmdrm.meter-resp":{"source":"iana"},"application/vnd.ms-word.document.macroenabled.12":{"source":"iana","extensions":["docm"]},"application/vnd.ms-word.template.macroenabled.12":{"source":"iana","extensions":["dotm"]},"application/vnd.ms-works":{"source":"iana","extensions":["wps","wks","wcm","wdb"]},"application/vnd.ms-wpl":{"source":"iana","extensions":["wpl"]},"application/vnd.ms-xpsdocument":{"source":"iana","compressible":false,"extensions":["xps"]},"application/vnd.msa-disk-image":{"source":"iana"},"application/vnd.mseq":{"source":"iana","extensions":["mseq"]},"application/vnd.msign":{"source":"iana"},"application/vnd.multiad.creator":{"source":"iana"},"application/vnd.multiad.creator.cif":{"source":"iana"},"application/vnd.music-niff":{"source":"iana"},"application/vnd.musician":{"source":"iana","extensions":["mus"]},"application/vnd.muvee.style":{"source":"iana","extensions":["msty"]},"application/vnd.mynfc":{"source":"iana","extensions":["taglet"]},"application/vnd.nacamar.ybrid+json":{"source":"iana","compressible":true},"application/vnd.ncd.control":{"source":"iana"},"application/vnd.ncd.reference":{"source":"iana"},"application/vnd.nearst.inv+json":{"source":"iana","compressible":true},"application/vnd.nebumind.line":{"source":"iana"},"application/vnd.nervana":{"source":"iana"},"application/vnd.netfpx":{"source":"iana"},"application/vnd.neurolanguage.nlu":{"source":"iana","extensions":["nlu"]},"application/vnd.nimn":{"source":"iana"},"application/vnd.nintendo.nitro.rom":{"source":"iana"},"application/vnd.nintendo.snes.rom":{"source":"iana"},"application/vnd.nitf":{"source":"iana","extensions":["ntf","nitf"]},"application/vnd.noblenet-directory":{"source":"iana","extensions":["nnd"]},"application/vnd.noblenet-sealer":{"source":"iana","extensions":["nns"]},"application/vnd.noblenet-web":{"source":"iana","extensions":["nnw"]},"application/vnd.nokia.catalogs":{"source":"iana"},"application/vnd.nokia.conml+wbxml":{"source":"iana"},"application/vnd.nokia.conml+xml":{"source":"iana","compressible":true},"application/vnd.nokia.iptv.config+xml":{"source":"iana","compressible":true},"application/vnd.nokia.isds-radio-presets":{"source":"iana"},"application/vnd.nokia.landmark+wbxml":{"source":"iana"},"application/vnd.nokia.landmark+xml":{"source":"iana","compressible":true},"application/vnd.nokia.landmarkcollection+xml":{"source":"iana","compressible":true},"application/vnd.nokia.n-gage.ac+xml":{"source":"iana","compressible":true,"extensions":["ac"]},"application/vnd.nokia.n-gage.data":{"source":"iana","extensions":["ngdat"]},"application/vnd.nokia.n-gage.symbian.install":{"source":"iana","extensions":["n-gage"]},"application/vnd.nokia.ncd":{"source":"iana"},"application/vnd.nokia.pcd+wbxml":{"source":"iana"},"application/vnd.nokia.pcd+xml":{"source":"iana","compressible":true},"application/vnd.nokia.radio-preset":{"source":"iana","extensions":["rpst"]},"application/vnd.nokia.radio-presets":{"source":"iana","extensions":["rpss"]},"application/vnd.novadigm.edm":{"source":"iana","extensions":["edm"]},"application/vnd.novadigm.edx":{"source":"iana","extensions":["edx"]},"application/vnd.novadigm.ext":{"source":"iana","extensions":["ext"]},"application/vnd.ntt-local.content-share":{"source":"iana"},"application/vnd.ntt-local.file-transfer":{"source":"iana"},"application/vnd.ntt-local.ogw_remote-access":{"source":"iana"},"application/vnd.ntt-local.sip-ta_remote":{"source":"iana"},"application/vnd.ntt-local.sip-ta_tcp_stream":{"source":"iana"},"application/vnd.oasis.opendocument.chart":{"source":"iana","extensions":["odc"]},"application/vnd.oasis.opendocument.chart-template":{"source":"iana","extensions":["otc"]},"application/vnd.oasis.opendocument.database":{"source":"iana","extensions":["odb"]},"application/vnd.oasis.opendocument.formula":{"source":"iana","extensions":["odf"]},"application/vnd.oasis.opendocument.formula-template":{"source":"iana","extensions":["odft"]},"application/vnd.oasis.opendocument.graphics":{"source":"iana","compressible":false,"extensions":["odg"]},"application/vnd.oasis.opendocument.graphics-template":{"source":"iana","extensions":["otg"]},"application/vnd.oasis.opendocument.image":{"source":"iana","extensions":["odi"]},"application/vnd.oasis.opendocument.image-template":{"source":"iana","extensions":["oti"]},"application/vnd.oasis.opendocument.presentation":{"source":"iana","compressible":false,"extensions":["odp"]},"application/vnd.oasis.opendocument.presentation-template":{"source":"iana","extensions":["otp"]},"application/vnd.oasis.opendocument.spreadsheet":{"source":"iana","compressible":false,"extensions":["ods"]},"application/vnd.oasis.opendocument.spreadsheet-template":{"source":"iana","extensions":["ots"]},"application/vnd.oasis.opendocument.text":{"source":"iana","compressible":false,"extensions":["odt"]},"application/vnd.oasis.opendocument.text-master":{"source":"iana","extensions":["odm"]},"application/vnd.oasis.opendocument.text-template":{"source":"iana","extensions":["ott"]},"application/vnd.oasis.opendocument.text-web":{"source":"iana","extensions":["oth"]},"application/vnd.obn":{"source":"iana"},"application/vnd.ocf+cbor":{"source":"iana"},"application/vnd.oci.image.manifest.v1+json":{"source":"iana","compressible":true},"application/vnd.oftn.l10n+json":{"source":"iana","compressible":true},"application/vnd.oipf.contentaccessdownload+xml":{"source":"iana","compressible":true},"application/vnd.oipf.contentaccessstreaming+xml":{"source":"iana","compressible":true},"application/vnd.oipf.cspg-hexbinary":{"source":"iana"},"application/vnd.oipf.dae.svg+xml":{"source":"iana","compressible":true},"application/vnd.oipf.dae.xhtml+xml":{"source":"iana","compressible":true},"application/vnd.oipf.mippvcontrolmessage+xml":{"source":"iana","compressible":true},"application/vnd.oipf.pae.gem":{"source":"iana"},"application/vnd.oipf.spdiscovery+xml":{"source":"iana","compressible":true},"application/vnd.oipf.spdlist+xml":{"source":"iana","compressible":true},"application/vnd.oipf.ueprofile+xml":{"source":"iana","compressible":true},"application/vnd.oipf.userprofile+xml":{"source":"iana","compressible":true},"application/vnd.olpc-sugar":{"source":"iana","extensions":["xo"]},"application/vnd.oma-scws-config":{"source":"iana"},"application/vnd.oma-scws-http-request":{"source":"iana"},"application/vnd.oma-scws-http-response":{"source":"iana"},"application/vnd.oma.bcast.associated-procedure-parameter+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.drm-trigger+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.imd+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.ltkm":{"source":"iana"},"application/vnd.oma.bcast.notification+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.provisioningtrigger":{"source":"iana"},"application/vnd.oma.bcast.sgboot":{"source":"iana"},"application/vnd.oma.bcast.sgdd+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.sgdu":{"source":"iana"},"application/vnd.oma.bcast.simple-symbol-container":{"source":"iana"},"application/vnd.oma.bcast.smartcard-trigger+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.sprov+xml":{"source":"iana","compressible":true},"application/vnd.oma.bcast.stkm":{"source":"iana"},"application/vnd.oma.cab-address-book+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-feature-handler+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-pcc+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-subs-invite+xml":{"source":"iana","compressible":true},"application/vnd.oma.cab-user-prefs+xml":{"source":"iana","compressible":true},"application/vnd.oma.dcd":{"source":"iana"},"application/vnd.oma.dcdc":{"source":"iana"},"application/vnd.oma.dd2+xml":{"source":"iana","compressible":true,"extensions":["dd2"]},"application/vnd.oma.drm.risd+xml":{"source":"iana","compressible":true},"application/vnd.oma.group-usage-list+xml":{"source":"iana","compressible":true},"application/vnd.oma.lwm2m+cbor":{"source":"iana"},"application/vnd.oma.lwm2m+json":{"source":"iana","compressible":true},"application/vnd.oma.lwm2m+tlv":{"source":"iana"},"application/vnd.oma.pal+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.detailed-progress-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.final-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.groups+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.invocation-descriptor+xml":{"source":"iana","compressible":true},"application/vnd.oma.poc.optimized-progress-report+xml":{"source":"iana","compressible":true},"application/vnd.oma.push":{"source":"iana"},"application/vnd.oma.scidm.messages+xml":{"source":"iana","compressible":true},"application/vnd.oma.xcap-directory+xml":{"source":"iana","compressible":true},"application/vnd.omads-email+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omads-file+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omads-folder+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.omaloc-supl-init":{"source":"iana"},"application/vnd.onepager":{"source":"iana"},"application/vnd.onepagertamp":{"source":"iana"},"application/vnd.onepagertamx":{"source":"iana"},"application/vnd.onepagertat":{"source":"iana"},"application/vnd.onepagertatp":{"source":"iana"},"application/vnd.onepagertatx":{"source":"iana"},"application/vnd.openblox.game+xml":{"source":"iana","compressible":true,"extensions":["obgx"]},"application/vnd.openblox.game-binary":{"source":"iana"},"application/vnd.openeye.oeb":{"source":"iana"},"application/vnd.openofficeorg.extension":{"source":"apache","extensions":["oxt"]},"application/vnd.openstreetmap.data+xml":{"source":"iana","compressible":true,"extensions":["osm"]},"application/vnd.opentimestamps.ots":{"source":"iana"},"application/vnd.openxmlformats-officedocument.custom-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.customxmlproperties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawing+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.chart+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.extended-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.presentation":{"source":"iana","compressible":false,"extensions":["pptx"]},"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slide":{"source":"iana","extensions":["sldx"]},"application/vnd.openxmlformats-officedocument.presentationml.slide+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slideshow":{"source":"iana","extensions":["ppsx"]},"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.tags+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.template":{"source":"iana","extensions":["potx"]},"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":{"source":"iana","compressible":false,"extensions":["xlsx"]},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.template":{"source":"iana","extensions":["xltx"]},"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.theme+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.themeoverride+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.vmldrawing":{"source":"iana"},"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.document":{"source":"iana","compressible":false,"extensions":["docx"]},"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.template":{"source":"iana","extensions":["dotx"]},"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.core-properties+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml":{"source":"iana","compressible":true},"application/vnd.openxmlformats-package.relationships+xml":{"source":"iana","compressible":true},"application/vnd.oracle.resource+json":{"source":"iana","compressible":true},"application/vnd.orange.indata":{"source":"iana"},"application/vnd.osa.netdeploy":{"source":"iana"},"application/vnd.osgeo.mapguide.package":{"source":"iana","extensions":["mgp"]},"application/vnd.osgi.bundle":{"source":"iana"},"application/vnd.osgi.dp":{"source":"iana","extensions":["dp"]},"application/vnd.osgi.subsystem":{"source":"iana","extensions":["esa"]},"application/vnd.otps.ct-kip+xml":{"source":"iana","compressible":true},"application/vnd.oxli.countgraph":{"source":"iana"},"application/vnd.pagerduty+json":{"source":"iana","compressible":true},"application/vnd.palm":{"source":"iana","extensions":["pdb","pqa","oprc"]},"application/vnd.panoply":{"source":"iana"},"application/vnd.paos.xml":{"source":"iana"},"application/vnd.patentdive":{"source":"iana"},"application/vnd.patientecommsdoc":{"source":"iana"},"application/vnd.pawaafile":{"source":"iana","extensions":["paw"]},"application/vnd.pcos":{"source":"iana"},"application/vnd.pg.format":{"source":"iana","extensions":["str"]},"application/vnd.pg.osasli":{"source":"iana","extensions":["ei6"]},"application/vnd.piaccess.application-licence":{"source":"iana"},"application/vnd.picsel":{"source":"iana","extensions":["efif"]},"application/vnd.pmi.widget":{"source":"iana","extensions":["wg"]},"application/vnd.poc.group-advertisement+xml":{"source":"iana","compressible":true},"application/vnd.pocketlearn":{"source":"iana","extensions":["plf"]},"application/vnd.powerbuilder6":{"source":"iana","extensions":["pbd"]},"application/vnd.powerbuilder6-s":{"source":"iana"},"application/vnd.powerbuilder7":{"source":"iana"},"application/vnd.powerbuilder7-s":{"source":"iana"},"application/vnd.powerbuilder75":{"source":"iana"},"application/vnd.powerbuilder75-s":{"source":"iana"},"application/vnd.preminet":{"source":"iana"},"application/vnd.previewsystems.box":{"source":"iana","extensions":["box"]},"application/vnd.proteus.magazine":{"source":"iana","extensions":["mgz"]},"application/vnd.psfs":{"source":"iana"},"application/vnd.publishare-delta-tree":{"source":"iana","extensions":["qps"]},"application/vnd.pvi.ptid1":{"source":"iana","extensions":["ptid"]},"application/vnd.pwg-multiplexed":{"source":"iana"},"application/vnd.pwg-xhtml-print+xml":{"source":"iana","compressible":true},"application/vnd.qualcomm.brew-app-res":{"source":"iana"},"application/vnd.quarantainenet":{"source":"iana"},"application/vnd.quark.quarkxpress":{"source":"iana","extensions":["qxd","qxt","qwd","qwt","qxl","qxb"]},"application/vnd.quobject-quoxdocument":{"source":"iana"},"application/vnd.radisys.moml+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-conf+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-conn+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-dialog+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-audit-stream+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-conf+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-base+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-fax-detect+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-fax-sendrecv+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-group+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-speech+xml":{"source":"iana","compressible":true},"application/vnd.radisys.msml-dialog-transform+xml":{"source":"iana","compressible":true},"application/vnd.rainstor.data":{"source":"iana"},"application/vnd.rapid":{"source":"iana"},"application/vnd.rar":{"source":"iana","extensions":["rar"]},"application/vnd.realvnc.bed":{"source":"iana","extensions":["bed"]},"application/vnd.recordare.musicxml":{"source":"iana","extensions":["mxl"]},"application/vnd.recordare.musicxml+xml":{"source":"iana","compressible":true,"extensions":["musicxml"]},"application/vnd.renlearn.rlprint":{"source":"iana"},"application/vnd.resilient.logic":{"source":"iana"},"application/vnd.restful+json":{"source":"iana","compressible":true},"application/vnd.rig.cryptonote":{"source":"iana","extensions":["cryptonote"]},"application/vnd.rim.cod":{"source":"apache","extensions":["cod"]},"application/vnd.rn-realmedia":{"source":"apache","extensions":["rm"]},"application/vnd.rn-realmedia-vbr":{"source":"apache","extensions":["rmvb"]},"application/vnd.route66.link66+xml":{"source":"iana","compressible":true,"extensions":["link66"]},"application/vnd.rs-274x":{"source":"iana"},"application/vnd.ruckus.download":{"source":"iana"},"application/vnd.s3sms":{"source":"iana"},"application/vnd.sailingtracker.track":{"source":"iana","extensions":["st"]},"application/vnd.sar":{"source":"iana"},"application/vnd.sbm.cid":{"source":"iana"},"application/vnd.sbm.mid2":{"source":"iana"},"application/vnd.scribus":{"source":"iana"},"application/vnd.sealed.3df":{"source":"iana"},"application/vnd.sealed.csf":{"source":"iana"},"application/vnd.sealed.doc":{"source":"iana"},"application/vnd.sealed.eml":{"source":"iana"},"application/vnd.sealed.mht":{"source":"iana"},"application/vnd.sealed.net":{"source":"iana"},"application/vnd.sealed.ppt":{"source":"iana"},"application/vnd.sealed.tiff":{"source":"iana"},"application/vnd.sealed.xls":{"source":"iana"},"application/vnd.sealedmedia.softseal.html":{"source":"iana"},"application/vnd.sealedmedia.softseal.pdf":{"source":"iana"},"application/vnd.seemail":{"source":"iana","extensions":["see"]},"application/vnd.seis+json":{"source":"iana","compressible":true},"application/vnd.sema":{"source":"iana","extensions":["sema"]},"application/vnd.semd":{"source":"iana","extensions":["semd"]},"application/vnd.semf":{"source":"iana","extensions":["semf"]},"application/vnd.shade-save-file":{"source":"iana"},"application/vnd.shana.informed.formdata":{"source":"iana","extensions":["ifm"]},"application/vnd.shana.informed.formtemplate":{"source":"iana","extensions":["itp"]},"application/vnd.shana.informed.interchange":{"source":"iana","extensions":["iif"]},"application/vnd.shana.informed.package":{"source":"iana","extensions":["ipk"]},"application/vnd.shootproof+json":{"source":"iana","compressible":true},"application/vnd.shopkick+json":{"source":"iana","compressible":true},"application/vnd.shp":{"source":"iana"},"application/vnd.shx":{"source":"iana"},"application/vnd.sigrok.session":{"source":"iana"},"application/vnd.simtech-mindmapper":{"source":"iana","extensions":["twd","twds"]},"application/vnd.siren+json":{"source":"iana","compressible":true},"application/vnd.smaf":{"source":"iana","extensions":["mmf"]},"application/vnd.smart.notebook":{"source":"iana"},"application/vnd.smart.teacher":{"source":"iana","extensions":["teacher"]},"application/vnd.snesdev-page-table":{"source":"iana"},"application/vnd.software602.filler.form+xml":{"source":"iana","compressible":true,"extensions":["fo"]},"application/vnd.software602.filler.form-xml-zip":{"source":"iana"},"application/vnd.solent.sdkm+xml":{"source":"iana","compressible":true,"extensions":["sdkm","sdkd"]},"application/vnd.spotfire.dxp":{"source":"iana","extensions":["dxp"]},"application/vnd.spotfire.sfs":{"source":"iana","extensions":["sfs"]},"application/vnd.sqlite3":{"source":"iana"},"application/vnd.sss-cod":{"source":"iana"},"application/vnd.sss-dtf":{"source":"iana"},"application/vnd.sss-ntf":{"source":"iana"},"application/vnd.stardivision.calc":{"source":"apache","extensions":["sdc"]},"application/vnd.stardivision.draw":{"source":"apache","extensions":["sda"]},"application/vnd.stardivision.impress":{"source":"apache","extensions":["sdd"]},"application/vnd.stardivision.math":{"source":"apache","extensions":["smf"]},"application/vnd.stardivision.writer":{"source":"apache","extensions":["sdw","vor"]},"application/vnd.stardivision.writer-global":{"source":"apache","extensions":["sgl"]},"application/vnd.stepmania.package":{"source":"iana","extensions":["smzip"]},"application/vnd.stepmania.stepchart":{"source":"iana","extensions":["sm"]},"application/vnd.street-stream":{"source":"iana"},"application/vnd.sun.wadl+xml":{"source":"iana","compressible":true,"extensions":["wadl"]},"application/vnd.sun.xml.calc":{"source":"apache","extensions":["sxc"]},"application/vnd.sun.xml.calc.template":{"source":"apache","extensions":["stc"]},"application/vnd.sun.xml.draw":{"source":"apache","extensions":["sxd"]},"application/vnd.sun.xml.draw.template":{"source":"apache","extensions":["std"]},"application/vnd.sun.xml.impress":{"source":"apache","extensions":["sxi"]},"application/vnd.sun.xml.impress.template":{"source":"apache","extensions":["sti"]},"application/vnd.sun.xml.math":{"source":"apache","extensions":["sxm"]},"application/vnd.sun.xml.writer":{"source":"apache","extensions":["sxw"]},"application/vnd.sun.xml.writer.global":{"source":"apache","extensions":["sxg"]},"application/vnd.sun.xml.writer.template":{"source":"apache","extensions":["stw"]},"application/vnd.sus-calendar":{"source":"iana","extensions":["sus","susp"]},"application/vnd.svd":{"source":"iana","extensions":["svd"]},"application/vnd.swiftview-ics":{"source":"iana"},"application/vnd.sycle+xml":{"source":"iana","compressible":true},"application/vnd.syft+json":{"source":"iana","compressible":true},"application/vnd.symbian.install":{"source":"apache","extensions":["sis","sisx"]},"application/vnd.syncml+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["xsm"]},"application/vnd.syncml.dm+wbxml":{"source":"iana","charset":"UTF-8","extensions":["bdm"]},"application/vnd.syncml.dm+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["xdm"]},"application/vnd.syncml.dm.notification":{"source":"iana"},"application/vnd.syncml.dmddf+wbxml":{"source":"iana"},"application/vnd.syncml.dmddf+xml":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["ddf"]},"application/vnd.syncml.dmtnds+wbxml":{"source":"iana"},"application/vnd.syncml.dmtnds+xml":{"source":"iana","charset":"UTF-8","compressible":true},"application/vnd.syncml.ds.notification":{"source":"iana"},"application/vnd.tableschema+json":{"source":"iana","compressible":true},"application/vnd.tao.intent-module-archive":{"source":"iana","extensions":["tao"]},"application/vnd.tcpdump.pcap":{"source":"iana","extensions":["pcap","cap","dmp"]},"application/vnd.think-cell.ppttc+json":{"source":"iana","compressible":true},"application/vnd.tmd.mediaflex.api+xml":{"source":"iana","compressible":true},"application/vnd.tml":{"source":"iana"},"application/vnd.tmobile-livetv":{"source":"iana","extensions":["tmo"]},"application/vnd.tri.onesource":{"source":"iana"},"application/vnd.trid.tpt":{"source":"iana","extensions":["tpt"]},"application/vnd.triscape.mxs":{"source":"iana","extensions":["mxs"]},"application/vnd.trueapp":{"source":"iana","extensions":["tra"]},"application/vnd.truedoc":{"source":"iana"},"application/vnd.ubisoft.webplayer":{"source":"iana"},"application/vnd.ufdl":{"source":"iana","extensions":["ufd","ufdl"]},"application/vnd.uiq.theme":{"source":"iana","extensions":["utz"]},"application/vnd.umajin":{"source":"iana","extensions":["umj"]},"application/vnd.unity":{"source":"iana","extensions":["unityweb"]},"application/vnd.uoml+xml":{"source":"iana","compressible":true,"extensions":["uoml"]},"application/vnd.uplanet.alert":{"source":"iana"},"application/vnd.uplanet.alert-wbxml":{"source":"iana"},"application/vnd.uplanet.bearer-choice":{"source":"iana"},"application/vnd.uplanet.bearer-choice-wbxml":{"source":"iana"},"application/vnd.uplanet.cacheop":{"source":"iana"},"application/vnd.uplanet.cacheop-wbxml":{"source":"iana"},"application/vnd.uplanet.channel":{"source":"iana"},"application/vnd.uplanet.channel-wbxml":{"source":"iana"},"application/vnd.uplanet.list":{"source":"iana"},"application/vnd.uplanet.list-wbxml":{"source":"iana"},"application/vnd.uplanet.listcmd":{"source":"iana"},"application/vnd.uplanet.listcmd-wbxml":{"source":"iana"},"application/vnd.uplanet.signal":{"source":"iana"},"application/vnd.uri-map":{"source":"iana"},"application/vnd.valve.source.material":{"source":"iana"},"application/vnd.vcx":{"source":"iana","extensions":["vcx"]},"application/vnd.vd-study":{"source":"iana"},"application/vnd.vectorworks":{"source":"iana"},"application/vnd.vel+json":{"source":"iana","compressible":true},"application/vnd.verimatrix.vcas":{"source":"iana"},"application/vnd.veritone.aion+json":{"source":"iana","compressible":true},"application/vnd.veryant.thin":{"source":"iana"},"application/vnd.ves.encrypted":{"source":"iana"},"application/vnd.vidsoft.vidconference":{"source":"iana"},"application/vnd.visio":{"source":"iana","extensions":["vsd","vst","vss","vsw"]},"application/vnd.visionary":{"source":"iana","extensions":["vis"]},"application/vnd.vividence.scriptfile":{"source":"iana"},"application/vnd.vsf":{"source":"iana","extensions":["vsf"]},"application/vnd.wap.sic":{"source":"iana"},"application/vnd.wap.slc":{"source":"iana"},"application/vnd.wap.wbxml":{"source":"iana","charset":"UTF-8","extensions":["wbxml"]},"application/vnd.wap.wmlc":{"source":"iana","extensions":["wmlc"]},"application/vnd.wap.wmlscriptc":{"source":"iana","extensions":["wmlsc"]},"application/vnd.webturbo":{"source":"iana","extensions":["wtb"]},"application/vnd.wfa.dpp":{"source":"iana"},"application/vnd.wfa.p2p":{"source":"iana"},"application/vnd.wfa.wsc":{"source":"iana"},"application/vnd.windows.devicepairing":{"source":"iana"},"application/vnd.wmc":{"source":"iana"},"application/vnd.wmf.bootstrap":{"source":"iana"},"application/vnd.wolfram.mathematica":{"source":"iana"},"application/vnd.wolfram.mathematica.package":{"source":"iana"},"application/vnd.wolfram.player":{"source":"iana","extensions":["nbp"]},"application/vnd.wordperfect":{"source":"iana","extensions":["wpd"]},"application/vnd.wqd":{"source":"iana","extensions":["wqd"]},"application/vnd.wrq-hp3000-labelled":{"source":"iana"},"application/vnd.wt.stf":{"source":"iana","extensions":["stf"]},"application/vnd.wv.csp+wbxml":{"source":"iana"},"application/vnd.wv.csp+xml":{"source":"iana","compressible":true},"application/vnd.wv.ssp+xml":{"source":"iana","compressible":true},"application/vnd.xacml+json":{"source":"iana","compressible":true},"application/vnd.xara":{"source":"iana","extensions":["xar"]},"application/vnd.xfdl":{"source":"iana","extensions":["xfdl"]},"application/vnd.xfdl.webform":{"source":"iana"},"application/vnd.xmi+xml":{"source":"iana","compressible":true},"application/vnd.xmpie.cpkg":{"source":"iana"},"application/vnd.xmpie.dpkg":{"source":"iana"},"application/vnd.xmpie.plan":{"source":"iana"},"application/vnd.xmpie.ppkg":{"source":"iana"},"application/vnd.xmpie.xlim":{"source":"iana"},"application/vnd.yamaha.hv-dic":{"source":"iana","extensions":["hvd"]},"application/vnd.yamaha.hv-script":{"source":"iana","extensions":["hvs"]},"application/vnd.yamaha.hv-voice":{"source":"iana","extensions":["hvp"]},"application/vnd.yamaha.openscoreformat":{"source":"iana","extensions":["osf"]},"application/vnd.yamaha.openscoreformat.osfpvg+xml":{"source":"iana","compressible":true,"extensions":["osfpvg"]},"application/vnd.yamaha.remote-setup":{"source":"iana"},"application/vnd.yamaha.smaf-audio":{"source":"iana","extensions":["saf"]},"application/vnd.yamaha.smaf-phrase":{"source":"iana","extensions":["spf"]},"application/vnd.yamaha.through-ngn":{"source":"iana"},"application/vnd.yamaha.tunnel-udpencap":{"source":"iana"},"application/vnd.yaoweme":{"source":"iana"},"application/vnd.yellowriver-custom-menu":{"source":"iana","extensions":["cmp"]},"application/vnd.youtube.yt":{"source":"iana"},"application/vnd.zul":{"source":"iana","extensions":["zir","zirz"]},"application/vnd.zzazz.deck+xml":{"source":"iana","compressible":true,"extensions":["zaz"]},"application/voicexml+xml":{"source":"iana","compressible":true,"extensions":["vxml"]},"application/voucher-cms+json":{"source":"iana","compressible":true},"application/vq-rtcpxr":{"source":"iana"},"application/wasm":{"source":"iana","compressible":true,"extensions":["wasm"]},"application/watcherinfo+xml":{"source":"iana","compressible":true,"extensions":["wif"]},"application/webpush-options+json":{"source":"iana","compressible":true},"application/whoispp-query":{"source":"iana"},"application/whoispp-response":{"source":"iana"},"application/widget":{"source":"iana","extensions":["wgt"]},"application/winhlp":{"source":"apache","extensions":["hlp"]},"application/wita":{"source":"iana"},"application/wordperfect5.1":{"source":"iana"},"application/wsdl+xml":{"source":"iana","compressible":true,"extensions":["wsdl"]},"application/wspolicy+xml":{"source":"iana","compressible":true,"extensions":["wspolicy"]},"application/x-7z-compressed":{"source":"apache","compressible":false,"extensions":["7z"]},"application/x-abiword":{"source":"apache","extensions":["abw"]},"application/x-ace-compressed":{"source":"apache","extensions":["ace"]},"application/x-amf":{"source":"apache"},"application/x-apple-diskimage":{"source":"apache","extensions":["dmg"]},"application/x-arj":{"compressible":false,"extensions":["arj"]},"application/x-authorware-bin":{"source":"apache","extensions":["aab","x32","u32","vox"]},"application/x-authorware-map":{"source":"apache","extensions":["aam"]},"application/x-authorware-seg":{"source":"apache","extensions":["aas"]},"application/x-bcpio":{"source":"apache","extensions":["bcpio"]},"application/x-bdoc":{"compressible":false,"extensions":["bdoc"]},"application/x-bittorrent":{"source":"apache","extensions":["torrent"]},"application/x-blorb":{"source":"apache","extensions":["blb","blorb"]},"application/x-bzip":{"source":"apache","compressible":false,"extensions":["bz"]},"application/x-bzip2":{"source":"apache","compressible":false,"extensions":["bz2","boz"]},"application/x-cbr":{"source":"apache","extensions":["cbr","cba","cbt","cbz","cb7"]},"application/x-cdlink":{"source":"apache","extensions":["vcd"]},"application/x-cfs-compressed":{"source":"apache","extensions":["cfs"]},"application/x-chat":{"source":"apache","extensions":["chat"]},"application/x-chess-pgn":{"source":"apache","extensions":["pgn"]},"application/x-chrome-extension":{"extensions":["crx"]},"application/x-cocoa":{"source":"nginx","extensions":["cco"]},"application/x-compress":{"source":"apache"},"application/x-conference":{"source":"apache","extensions":["nsc"]},"application/x-cpio":{"source":"apache","extensions":["cpio"]},"application/x-csh":{"source":"apache","extensions":["csh"]},"application/x-deb":{"compressible":false},"application/x-debian-package":{"source":"apache","extensions":["deb","udeb"]},"application/x-dgc-compressed":{"source":"apache","extensions":["dgc"]},"application/x-director":{"source":"apache","extensions":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"]},"application/x-doom":{"source":"apache","extensions":["wad"]},"application/x-dtbncx+xml":{"source":"apache","compressible":true,"extensions":["ncx"]},"application/x-dtbook+xml":{"source":"apache","compressible":true,"extensions":["dtb"]},"application/x-dtbresource+xml":{"source":"apache","compressible":true,"extensions":["res"]},"application/x-dvi":{"source":"apache","compressible":false,"extensions":["dvi"]},"application/x-envoy":{"source":"apache","extensions":["evy"]},"application/x-eva":{"source":"apache","extensions":["eva"]},"application/x-font-bdf":{"source":"apache","extensions":["bdf"]},"application/x-font-dos":{"source":"apache"},"application/x-font-framemaker":{"source":"apache"},"application/x-font-ghostscript":{"source":"apache","extensions":["gsf"]},"application/x-font-libgrx":{"source":"apache"},"application/x-font-linux-psf":{"source":"apache","extensions":["psf"]},"application/x-font-pcf":{"source":"apache","extensions":["pcf"]},"application/x-font-snf":{"source":"apache","extensions":["snf"]},"application/x-font-speedo":{"source":"apache"},"application/x-font-sunos-news":{"source":"apache"},"application/x-font-type1":{"source":"apache","extensions":["pfa","pfb","pfm","afm"]},"application/x-font-vfont":{"source":"apache"},"application/x-freearc":{"source":"apache","extensions":["arc"]},"application/x-futuresplash":{"source":"apache","extensions":["spl"]},"application/x-gca-compressed":{"source":"apache","extensions":["gca"]},"application/x-glulx":{"source":"apache","extensions":["ulx"]},"application/x-gnumeric":{"source":"apache","extensions":["gnumeric"]},"application/x-gramps-xml":{"source":"apache","extensions":["gramps"]},"application/x-gtar":{"source":"apache","extensions":["gtar"]},"application/x-gzip":{"source":"apache"},"application/x-hdf":{"source":"apache","extensions":["hdf"]},"application/x-httpd-php":{"compressible":true,"extensions":["php"]},"application/x-install-instructions":{"source":"apache","extensions":["install"]},"application/x-iso9660-image":{"source":"apache","extensions":["iso"]},"application/x-iwork-keynote-sffkey":{"extensions":["key"]},"application/x-iwork-numbers-sffnumbers":{"extensions":["numbers"]},"application/x-iwork-pages-sffpages":{"extensions":["pages"]},"application/x-java-archive-diff":{"source":"nginx","extensions":["jardiff"]},"application/x-java-jnlp-file":{"source":"apache","compressible":false,"extensions":["jnlp"]},"application/x-javascript":{"compressible":true},"application/x-keepass2":{"extensions":["kdbx"]},"application/x-latex":{"source":"apache","compressible":false,"extensions":["latex"]},"application/x-lua-bytecode":{"extensions":["luac"]},"application/x-lzh-compressed":{"source":"apache","extensions":["lzh","lha"]},"application/x-makeself":{"source":"nginx","extensions":["run"]},"application/x-mie":{"source":"apache","extensions":["mie"]},"application/x-mobipocket-ebook":{"source":"apache","extensions":["prc","mobi"]},"application/x-mpegurl":{"compressible":false},"application/x-ms-application":{"source":"apache","extensions":["application"]},"application/x-ms-shortcut":{"source":"apache","extensions":["lnk"]},"application/x-ms-wmd":{"source":"apache","extensions":["wmd"]},"application/x-ms-wmz":{"source":"apache","extensions":["wmz"]},"application/x-ms-xbap":{"source":"apache","extensions":["xbap"]},"application/x-msaccess":{"source":"apache","extensions":["mdb"]},"application/x-msbinder":{"source":"apache","extensions":["obd"]},"application/x-mscardfile":{"source":"apache","extensions":["crd"]},"application/x-msclip":{"source":"apache","extensions":["clp"]},"application/x-msdos-program":{"extensions":["exe"]},"application/x-msdownload":{"source":"apache","extensions":["exe","dll","com","bat","msi"]},"application/x-msmediaview":{"source":"apache","extensions":["mvb","m13","m14"]},"application/x-msmetafile":{"source":"apache","extensions":["wmf","wmz","emf","emz"]},"application/x-msmoney":{"source":"apache","extensions":["mny"]},"application/x-mspublisher":{"source":"apache","extensions":["pub"]},"application/x-msschedule":{"source":"apache","extensions":["scd"]},"application/x-msterminal":{"source":"apache","extensions":["trm"]},"application/x-mswrite":{"source":"apache","extensions":["wri"]},"application/x-netcdf":{"source":"apache","extensions":["nc","cdf"]},"application/x-ns-proxy-autoconfig":{"compressible":true,"extensions":["pac"]},"application/x-nzb":{"source":"apache","extensions":["nzb"]},"application/x-perl":{"source":"nginx","extensions":["pl","pm"]},"application/x-pilot":{"source":"nginx","extensions":["prc","pdb"]},"application/x-pkcs12":{"source":"apache","compressible":false,"extensions":["p12","pfx"]},"application/x-pkcs7-certificates":{"source":"apache","extensions":["p7b","spc"]},"application/x-pkcs7-certreqresp":{"source":"apache","extensions":["p7r"]},"application/x-pki-message":{"source":"iana"},"application/x-rar-compressed":{"source":"apache","compressible":false,"extensions":["rar"]},"application/x-redhat-package-manager":{"source":"nginx","extensions":["rpm"]},"application/x-research-info-systems":{"source":"apache","extensions":["ris"]},"application/x-sea":{"source":"nginx","extensions":["sea"]},"application/x-sh":{"source":"apache","compressible":true,"extensions":["sh"]},"application/x-shar":{"source":"apache","extensions":["shar"]},"application/x-shockwave-flash":{"source":"apache","compressible":false,"extensions":["swf"]},"application/x-silverlight-app":{"source":"apache","extensions":["xap"]},"application/x-sql":{"source":"apache","extensions":["sql"]},"application/x-stuffit":{"source":"apache","compressible":false,"extensions":["sit"]},"application/x-stuffitx":{"source":"apache","extensions":["sitx"]},"application/x-subrip":{"source":"apache","extensions":["srt"]},"application/x-sv4cpio":{"source":"apache","extensions":["sv4cpio"]},"application/x-sv4crc":{"source":"apache","extensions":["sv4crc"]},"application/x-t3vm-image":{"source":"apache","extensions":["t3"]},"application/x-tads":{"source":"apache","extensions":["gam"]},"application/x-tar":{"source":"apache","compressible":true,"extensions":["tar"]},"application/x-tcl":{"source":"apache","extensions":["tcl","tk"]},"application/x-tex":{"source":"apache","extensions":["tex"]},"application/x-tex-tfm":{"source":"apache","extensions":["tfm"]},"application/x-texinfo":{"source":"apache","extensions":["texinfo","texi"]},"application/x-tgif":{"source":"apache","extensions":["obj"]},"application/x-ustar":{"source":"apache","extensions":["ustar"]},"application/x-virtualbox-hdd":{"compressible":true,"extensions":["hdd"]},"application/x-virtualbox-ova":{"compressible":true,"extensions":["ova"]},"application/x-virtualbox-ovf":{"compressible":true,"extensions":["ovf"]},"application/x-virtualbox-vbox":{"compressible":true,"extensions":["vbox"]},"application/x-virtualbox-vbox-extpack":{"compressible":false,"extensions":["vbox-extpack"]},"application/x-virtualbox-vdi":{"compressible":true,"extensions":["vdi"]},"application/x-virtualbox-vhd":{"compressible":true,"extensions":["vhd"]},"application/x-virtualbox-vmdk":{"compressible":true,"extensions":["vmdk"]},"application/x-wais-source":{"source":"apache","extensions":["src"]},"application/x-web-app-manifest+json":{"compressible":true,"extensions":["webapp"]},"application/x-www-form-urlencoded":{"source":"iana","compressible":true},"application/x-x509-ca-cert":{"source":"iana","extensions":["der","crt","pem"]},"application/x-x509-ca-ra-cert":{"source":"iana"},"application/x-x509-next-ca-cert":{"source":"iana"},"application/x-xfig":{"source":"apache","extensions":["fig"]},"application/x-xliff+xml":{"source":"apache","compressible":true,"extensions":["xlf"]},"application/x-xpinstall":{"source":"apache","compressible":false,"extensions":["xpi"]},"application/x-xz":{"source":"apache","extensions":["xz"]},"application/x-zmachine":{"source":"apache","extensions":["z1","z2","z3","z4","z5","z6","z7","z8"]},"application/x400-bp":{"source":"iana"},"application/xacml+xml":{"source":"iana","compressible":true},"application/xaml+xml":{"source":"apache","compressible":true,"extensions":["xaml"]},"application/xcap-att+xml":{"source":"iana","compressible":true,"extensions":["xav"]},"application/xcap-caps+xml":{"source":"iana","compressible":true,"extensions":["xca"]},"application/xcap-diff+xml":{"source":"iana","compressible":true,"extensions":["xdf"]},"application/xcap-el+xml":{"source":"iana","compressible":true,"extensions":["xel"]},"application/xcap-error+xml":{"source":"iana","compressible":true},"application/xcap-ns+xml":{"source":"iana","compressible":true,"extensions":["xns"]},"application/xcon-conference-info+xml":{"source":"iana","compressible":true},"application/xcon-conference-info-diff+xml":{"source":"iana","compressible":true},"application/xenc+xml":{"source":"iana","compressible":true,"extensions":["xenc"]},"application/xhtml+xml":{"source":"iana","compressible":true,"extensions":["xhtml","xht"]},"application/xhtml-voice+xml":{"source":"apache","compressible":true},"application/xliff+xml":{"source":"iana","compressible":true,"extensions":["xlf"]},"application/xml":{"source":"iana","compressible":true,"extensions":["xml","xsl","xsd","rng"]},"application/xml-dtd":{"source":"iana","compressible":true,"extensions":["dtd"]},"application/xml-external-parsed-entity":{"source":"iana"},"application/xml-patch+xml":{"source":"iana","compressible":true},"application/xmpp+xml":{"source":"iana","compressible":true},"application/xop+xml":{"source":"iana","compressible":true,"extensions":["xop"]},"application/xproc+xml":{"source":"apache","compressible":true,"extensions":["xpl"]},"application/xslt+xml":{"source":"iana","compressible":true,"extensions":["xsl","xslt"]},"application/xspf+xml":{"source":"apache","compressible":true,"extensions":["xspf"]},"application/xv+xml":{"source":"iana","compressible":true,"extensions":["mxml","xhvml","xvml","xvm"]},"application/yang":{"source":"iana","extensions":["yang"]},"application/yang-data+json":{"source":"iana","compressible":true},"application/yang-data+xml":{"source":"iana","compressible":true},"application/yang-patch+json":{"source":"iana","compressible":true},"application/yang-patch+xml":{"source":"iana","compressible":true},"application/yin+xml":{"source":"iana","compressible":true,"extensions":["yin"]},"application/zip":{"source":"iana","compressible":false,"extensions":["zip"]},"application/zlib":{"source":"iana"},"application/zstd":{"source":"iana"},"audio/1d-interleaved-parityfec":{"source":"iana"},"audio/32kadpcm":{"source":"iana"},"audio/3gpp":{"source":"iana","compressible":false,"extensions":["3gpp"]},"audio/3gpp2":{"source":"iana"},"audio/aac":{"source":"iana"},"audio/ac3":{"source":"iana"},"audio/adpcm":{"source":"apache","extensions":["adp"]},"audio/amr":{"source":"iana","extensions":["amr"]},"audio/amr-wb":{"source":"iana"},"audio/amr-wb+":{"source":"iana"},"audio/aptx":{"source":"iana"},"audio/asc":{"source":"iana"},"audio/atrac-advanced-lossless":{"source":"iana"},"audio/atrac-x":{"source":"iana"},"audio/atrac3":{"source":"iana"},"audio/basic":{"source":"iana","compressible":false,"extensions":["au","snd"]},"audio/bv16":{"source":"iana"},"audio/bv32":{"source":"iana"},"audio/clearmode":{"source":"iana"},"audio/cn":{"source":"iana"},"audio/dat12":{"source":"iana"},"audio/dls":{"source":"iana"},"audio/dsr-es201108":{"source":"iana"},"audio/dsr-es202050":{"source":"iana"},"audio/dsr-es202211":{"source":"iana"},"audio/dsr-es202212":{"source":"iana"},"audio/dv":{"source":"iana"},"audio/dvi4":{"source":"iana"},"audio/eac3":{"source":"iana"},"audio/encaprtp":{"source":"iana"},"audio/evrc":{"source":"iana"},"audio/evrc-qcp":{"source":"iana"},"audio/evrc0":{"source":"iana"},"audio/evrc1":{"source":"iana"},"audio/evrcb":{"source":"iana"},"audio/evrcb0":{"source":"iana"},"audio/evrcb1":{"source":"iana"},"audio/evrcnw":{"source":"iana"},"audio/evrcnw0":{"source":"iana"},"audio/evrcnw1":{"source":"iana"},"audio/evrcwb":{"source":"iana"},"audio/evrcwb0":{"source":"iana"},"audio/evrcwb1":{"source":"iana"},"audio/evs":{"source":"iana"},"audio/flexfec":{"source":"iana"},"audio/fwdred":{"source":"iana"},"audio/g711-0":{"source":"iana"},"audio/g719":{"source":"iana"},"audio/g722":{"source":"iana"},"audio/g7221":{"source":"iana"},"audio/g723":{"source":"iana"},"audio/g726-16":{"source":"iana"},"audio/g726-24":{"source":"iana"},"audio/g726-32":{"source":"iana"},"audio/g726-40":{"source":"iana"},"audio/g728":{"source":"iana"},"audio/g729":{"source":"iana"},"audio/g7291":{"source":"iana"},"audio/g729d":{"source":"iana"},"audio/g729e":{"source":"iana"},"audio/gsm":{"source":"iana"},"audio/gsm-efr":{"source":"iana"},"audio/gsm-hr-08":{"source":"iana"},"audio/ilbc":{"source":"iana"},"audio/ip-mr_v2.5":{"source":"iana"},"audio/isac":{"source":"apache"},"audio/l16":{"source":"iana"},"audio/l20":{"source":"iana"},"audio/l24":{"source":"iana","compressible":false},"audio/l8":{"source":"iana"},"audio/lpc":{"source":"iana"},"audio/melp":{"source":"iana"},"audio/melp1200":{"source":"iana"},"audio/melp2400":{"source":"iana"},"audio/melp600":{"source":"iana"},"audio/mhas":{"source":"iana"},"audio/midi":{"source":"apache","extensions":["mid","midi","kar","rmi"]},"audio/mobile-xmf":{"source":"iana","extensions":["mxmf"]},"audio/mp3":{"compressible":false,"extensions":["mp3"]},"audio/mp4":{"source":"iana","compressible":false,"extensions":["m4a","mp4a"]},"audio/mp4a-latm":{"source":"iana"},"audio/mpa":{"source":"iana"},"audio/mpa-robust":{"source":"iana"},"audio/mpeg":{"source":"iana","compressible":false,"extensions":["mpga","mp2","mp2a","mp3","m2a","m3a"]},"audio/mpeg4-generic":{"source":"iana"},"audio/musepack":{"source":"apache"},"audio/ogg":{"source":"iana","compressible":false,"extensions":["oga","ogg","spx","opus"]},"audio/opus":{"source":"iana"},"audio/parityfec":{"source":"iana"},"audio/pcma":{"source":"iana"},"audio/pcma-wb":{"source":"iana"},"audio/pcmu":{"source":"iana"},"audio/pcmu-wb":{"source":"iana"},"audio/prs.sid":{"source":"iana"},"audio/qcelp":{"source":"iana"},"audio/raptorfec":{"source":"iana"},"audio/red":{"source":"iana"},"audio/rtp-enc-aescm128":{"source":"iana"},"audio/rtp-midi":{"source":"iana"},"audio/rtploopback":{"source":"iana"},"audio/rtx":{"source":"iana"},"audio/s3m":{"source":"apache","extensions":["s3m"]},"audio/scip":{"source":"iana"},"audio/silk":{"source":"apache","extensions":["sil"]},"audio/smv":{"source":"iana"},"audio/smv-qcp":{"source":"iana"},"audio/smv0":{"source":"iana"},"audio/sofa":{"source":"iana"},"audio/sp-midi":{"source":"iana"},"audio/speex":{"source":"iana"},"audio/t140c":{"source":"iana"},"audio/t38":{"source":"iana"},"audio/telephone-event":{"source":"iana"},"audio/tetra_acelp":{"source":"iana"},"audio/tetra_acelp_bb":{"source":"iana"},"audio/tone":{"source":"iana"},"audio/tsvcis":{"source":"iana"},"audio/uemclip":{"source":"iana"},"audio/ulpfec":{"source":"iana"},"audio/usac":{"source":"iana"},"audio/vdvi":{"source":"iana"},"audio/vmr-wb":{"source":"iana"},"audio/vnd.3gpp.iufp":{"source":"iana"},"audio/vnd.4sb":{"source":"iana"},"audio/vnd.audiokoz":{"source":"iana"},"audio/vnd.celp":{"source":"iana"},"audio/vnd.cisco.nse":{"source":"iana"},"audio/vnd.cmles.radio-events":{"source":"iana"},"audio/vnd.cns.anp1":{"source":"iana"},"audio/vnd.cns.inf1":{"source":"iana"},"audio/vnd.dece.audio":{"source":"iana","extensions":["uva","uvva"]},"audio/vnd.digital-winds":{"source":"iana","extensions":["eol"]},"audio/vnd.dlna.adts":{"source":"iana"},"audio/vnd.dolby.heaac.1":{"source":"iana"},"audio/vnd.dolby.heaac.2":{"source":"iana"},"audio/vnd.dolby.mlp":{"source":"iana"},"audio/vnd.dolby.mps":{"source":"iana"},"audio/vnd.dolby.pl2":{"source":"iana"},"audio/vnd.dolby.pl2x":{"source":"iana"},"audio/vnd.dolby.pl2z":{"source":"iana"},"audio/vnd.dolby.pulse.1":{"source":"iana"},"audio/vnd.dra":{"source":"iana","extensions":["dra"]},"audio/vnd.dts":{"source":"iana","extensions":["dts"]},"audio/vnd.dts.hd":{"source":"iana","extensions":["dtshd"]},"audio/vnd.dts.uhd":{"source":"iana"},"audio/vnd.dvb.file":{"source":"iana"},"audio/vnd.everad.plj":{"source":"iana"},"audio/vnd.hns.audio":{"source":"iana"},"audio/vnd.lucent.voice":{"source":"iana","extensions":["lvp"]},"audio/vnd.ms-playready.media.pya":{"source":"iana","extensions":["pya"]},"audio/vnd.nokia.mobile-xmf":{"source":"iana"},"audio/vnd.nortel.vbk":{"source":"iana"},"audio/vnd.nuera.ecelp4800":{"source":"iana","extensions":["ecelp4800"]},"audio/vnd.nuera.ecelp7470":{"source":"iana","extensions":["ecelp7470"]},"audio/vnd.nuera.ecelp9600":{"source":"iana","extensions":["ecelp9600"]},"audio/vnd.octel.sbc":{"source":"iana"},"audio/vnd.presonus.multitrack":{"source":"iana"},"audio/vnd.qcelp":{"source":"iana"},"audio/vnd.rhetorex.32kadpcm":{"source":"iana"},"audio/vnd.rip":{"source":"iana","extensions":["rip"]},"audio/vnd.rn-realaudio":{"compressible":false},"audio/vnd.sealedmedia.softseal.mpeg":{"source":"iana"},"audio/vnd.vmx.cvsd":{"source":"iana"},"audio/vnd.wave":{"compressible":false},"audio/vorbis":{"source":"iana","compressible":false},"audio/vorbis-config":{"source":"iana"},"audio/wav":{"compressible":false,"extensions":["wav"]},"audio/wave":{"compressible":false,"extensions":["wav"]},"audio/webm":{"source":"apache","compressible":false,"extensions":["weba"]},"audio/x-aac":{"source":"apache","compressible":false,"extensions":["aac"]},"audio/x-aiff":{"source":"apache","extensions":["aif","aiff","aifc"]},"audio/x-caf":{"source":"apache","compressible":false,"extensions":["caf"]},"audio/x-flac":{"source":"apache","extensions":["flac"]},"audio/x-m4a":{"source":"nginx","extensions":["m4a"]},"audio/x-matroska":{"source":"apache","extensions":["mka"]},"audio/x-mpegurl":{"source":"apache","extensions":["m3u"]},"audio/x-ms-wax":{"source":"apache","extensions":["wax"]},"audio/x-ms-wma":{"source":"apache","extensions":["wma"]},"audio/x-pn-realaudio":{"source":"apache","extensions":["ram","ra"]},"audio/x-pn-realaudio-plugin":{"source":"apache","extensions":["rmp"]},"audio/x-realaudio":{"source":"nginx","extensions":["ra"]},"audio/x-tta":{"source":"apache"},"audio/x-wav":{"source":"apache","extensions":["wav"]},"audio/xm":{"source":"apache","extensions":["xm"]},"chemical/x-cdx":{"source":"apache","extensions":["cdx"]},"chemical/x-cif":{"source":"apache","extensions":["cif"]},"chemical/x-cmdf":{"source":"apache","extensions":["cmdf"]},"chemical/x-cml":{"source":"apache","extensions":["cml"]},"chemical/x-csml":{"source":"apache","extensions":["csml"]},"chemical/x-pdb":{"source":"apache"},"chemical/x-xyz":{"source":"apache","extensions":["xyz"]},"font/collection":{"source":"iana","extensions":["ttc"]},"font/otf":{"source":"iana","compressible":true,"extensions":["otf"]},"font/sfnt":{"source":"iana"},"font/ttf":{"source":"iana","compressible":true,"extensions":["ttf"]},"font/woff":{"source":"iana","extensions":["woff"]},"font/woff2":{"source":"iana","extensions":["woff2"]},"image/aces":{"source":"iana","extensions":["exr"]},"image/apng":{"compressible":false,"extensions":["apng"]},"image/avci":{"source":"iana","extensions":["avci"]},"image/avcs":{"source":"iana","extensions":["avcs"]},"image/avif":{"source":"iana","compressible":false,"extensions":["avif"]},"image/bmp":{"source":"iana","compressible":true,"extensions":["bmp"]},"image/cgm":{"source":"iana","extensions":["cgm"]},"image/dicom-rle":{"source":"iana","extensions":["drle"]},"image/emf":{"source":"iana","extensions":["emf"]},"image/fits":{"source":"iana","extensions":["fits"]},"image/g3fax":{"source":"iana","extensions":["g3"]},"image/gif":{"source":"iana","compressible":false,"extensions":["gif"]},"image/heic":{"source":"iana","extensions":["heic"]},"image/heic-sequence":{"source":"iana","extensions":["heics"]},"image/heif":{"source":"iana","extensions":["heif"]},"image/heif-sequence":{"source":"iana","extensions":["heifs"]},"image/hej2k":{"source":"iana","extensions":["hej2"]},"image/hsj2":{"source":"iana","extensions":["hsj2"]},"image/ief":{"source":"iana","extensions":["ief"]},"image/jls":{"source":"iana","extensions":["jls"]},"image/jp2":{"source":"iana","compressible":false,"extensions":["jp2","jpg2"]},"image/jpeg":{"source":"iana","compressible":false,"extensions":["jpeg","jpg","jpe"]},"image/jph":{"source":"iana","extensions":["jph"]},"image/jphc":{"source":"iana","extensions":["jhc"]},"image/jpm":{"source":"iana","compressible":false,"extensions":["jpm"]},"image/jpx":{"source":"iana","compressible":false,"extensions":["jpx","jpf"]},"image/jxr":{"source":"iana","extensions":["jxr"]},"image/jxra":{"source":"iana","extensions":["jxra"]},"image/jxrs":{"source":"iana","extensions":["jxrs"]},"image/jxs":{"source":"iana","extensions":["jxs"]},"image/jxsc":{"source":"iana","extensions":["jxsc"]},"image/jxsi":{"source":"iana","extensions":["jxsi"]},"image/jxss":{"source":"iana","extensions":["jxss"]},"image/ktx":{"source":"iana","extensions":["ktx"]},"image/ktx2":{"source":"iana","extensions":["ktx2"]},"image/naplps":{"source":"iana"},"image/pjpeg":{"compressible":false},"image/png":{"source":"iana","compressible":false,"extensions":["png"]},"image/prs.btif":{"source":"iana","extensions":["btif"]},"image/prs.pti":{"source":"iana","extensions":["pti"]},"image/pwg-raster":{"source":"iana"},"image/sgi":{"source":"apache","extensions":["sgi"]},"image/svg+xml":{"source":"iana","compressible":true,"extensions":["svg","svgz"]},"image/t38":{"source":"iana","extensions":["t38"]},"image/tiff":{"source":"iana","compressible":false,"extensions":["tif","tiff"]},"image/tiff-fx":{"source":"iana","extensions":["tfx"]},"image/vnd.adobe.photoshop":{"source":"iana","compressible":true,"extensions":["psd"]},"image/vnd.airzip.accelerator.azv":{"source":"iana","extensions":["azv"]},"image/vnd.cns.inf2":{"source":"iana"},"image/vnd.dece.graphic":{"source":"iana","extensions":["uvi","uvvi","uvg","uvvg"]},"image/vnd.djvu":{"source":"iana","extensions":["djvu","djv"]},"image/vnd.dvb.subtitle":{"source":"iana","extensions":["sub"]},"image/vnd.dwg":{"source":"iana","extensions":["dwg"]},"image/vnd.dxf":{"source":"iana","extensions":["dxf"]},"image/vnd.fastbidsheet":{"source":"iana","extensions":["fbs"]},"image/vnd.fpx":{"source":"iana","extensions":["fpx"]},"image/vnd.fst":{"source":"iana","extensions":["fst"]},"image/vnd.fujixerox.edmics-mmr":{"source":"iana","extensions":["mmr"]},"image/vnd.fujixerox.edmics-rlc":{"source":"iana","extensions":["rlc"]},"image/vnd.globalgraphics.pgb":{"source":"iana"},"image/vnd.microsoft.icon":{"source":"iana","compressible":true,"extensions":["ico"]},"image/vnd.mix":{"source":"iana"},"image/vnd.mozilla.apng":{"source":"iana"},"image/vnd.ms-dds":{"compressible":true,"extensions":["dds"]},"image/vnd.ms-modi":{"source":"iana","extensions":["mdi"]},"image/vnd.ms-photo":{"source":"apache","extensions":["wdp"]},"image/vnd.net-fpx":{"source":"iana","extensions":["npx"]},"image/vnd.pco.b16":{"source":"iana","extensions":["b16"]},"image/vnd.radiance":{"source":"iana"},"image/vnd.sealed.png":{"source":"iana"},"image/vnd.sealedmedia.softseal.gif":{"source":"iana"},"image/vnd.sealedmedia.softseal.jpg":{"source":"iana"},"image/vnd.svf":{"source":"iana"},"image/vnd.tencent.tap":{"source":"iana","extensions":["tap"]},"image/vnd.valve.source.texture":{"source":"iana","extensions":["vtf"]},"image/vnd.wap.wbmp":{"source":"iana","extensions":["wbmp"]},"image/vnd.xiff":{"source":"iana","extensions":["xif"]},"image/vnd.zbrush.pcx":{"source":"iana","extensions":["pcx"]},"image/webp":{"source":"apache","extensions":["webp"]},"image/wmf":{"source":"iana","extensions":["wmf"]},"image/x-3ds":{"source":"apache","extensions":["3ds"]},"image/x-cmu-raster":{"source":"apache","extensions":["ras"]},"image/x-cmx":{"source":"apache","extensions":["cmx"]},"image/x-freehand":{"source":"apache","extensions":["fh","fhc","fh4","fh5","fh7"]},"image/x-icon":{"source":"apache","compressible":true,"extensions":["ico"]},"image/x-jng":{"source":"nginx","extensions":["jng"]},"image/x-mrsid-image":{"source":"apache","extensions":["sid"]},"image/x-ms-bmp":{"source":"nginx","compressible":true,"extensions":["bmp"]},"image/x-pcx":{"source":"apache","extensions":["pcx"]},"image/x-pict":{"source":"apache","extensions":["pic","pct"]},"image/x-portable-anymap":{"source":"apache","extensions":["pnm"]},"image/x-portable-bitmap":{"source":"apache","extensions":["pbm"]},"image/x-portable-graymap":{"source":"apache","extensions":["pgm"]},"image/x-portable-pixmap":{"source":"apache","extensions":["ppm"]},"image/x-rgb":{"source":"apache","extensions":["rgb"]},"image/x-tga":{"source":"apache","extensions":["tga"]},"image/x-xbitmap":{"source":"apache","extensions":["xbm"]},"image/x-xcf":{"compressible":false},"image/x-xpixmap":{"source":"apache","extensions":["xpm"]},"image/x-xwindowdump":{"source":"apache","extensions":["xwd"]},"message/cpim":{"source":"iana"},"message/delivery-status":{"source":"iana"},"message/disposition-notification":{"source":"iana","extensions":["disposition-notification"]},"message/external-body":{"source":"iana"},"message/feedback-report":{"source":"iana"},"message/global":{"source":"iana","extensions":["u8msg"]},"message/global-delivery-status":{"source":"iana","extensions":["u8dsn"]},"message/global-disposition-notification":{"source":"iana","extensions":["u8mdn"]},"message/global-headers":{"source":"iana","extensions":["u8hdr"]},"message/http":{"source":"iana","compressible":false},"message/imdn+xml":{"source":"iana","compressible":true},"message/news":{"source":"iana"},"message/partial":{"source":"iana","compressible":false},"message/rfc822":{"source":"iana","compressible":true,"extensions":["eml","mime"]},"message/s-http":{"source":"iana"},"message/sip":{"source":"iana"},"message/sipfrag":{"source":"iana"},"message/tracking-status":{"source":"iana"},"message/vnd.si.simp":{"source":"iana"},"message/vnd.wfa.wsc":{"source":"iana","extensions":["wsc"]},"model/3mf":{"source":"iana","extensions":["3mf"]},"model/e57":{"source":"iana"},"model/gltf+json":{"source":"iana","compressible":true,"extensions":["gltf"]},"model/gltf-binary":{"source":"iana","compressible":true,"extensions":["glb"]},"model/iges":{"source":"iana","compressible":false,"extensions":["igs","iges"]},"model/mesh":{"source":"iana","compressible":false,"extensions":["msh","mesh","silo"]},"model/mtl":{"source":"iana","extensions":["mtl"]},"model/obj":{"source":"iana","extensions":["obj"]},"model/step":{"source":"iana"},"model/step+xml":{"source":"iana","compressible":true,"extensions":["stpx"]},"model/step+zip":{"source":"iana","compressible":false,"extensions":["stpz"]},"model/step-xml+zip":{"source":"iana","compressible":false,"extensions":["stpxz"]},"model/stl":{"source":"iana","extensions":["stl"]},"model/vnd.collada+xml":{"source":"iana","compressible":true,"extensions":["dae"]},"model/vnd.dwf":{"source":"iana","extensions":["dwf"]},"model/vnd.flatland.3dml":{"source":"iana"},"model/vnd.gdl":{"source":"iana","extensions":["gdl"]},"model/vnd.gs-gdl":{"source":"apache"},"model/vnd.gs.gdl":{"source":"iana"},"model/vnd.gtw":{"source":"iana","extensions":["gtw"]},"model/vnd.moml+xml":{"source":"iana","compressible":true},"model/vnd.mts":{"source":"iana","extensions":["mts"]},"model/vnd.opengex":{"source":"iana","extensions":["ogex"]},"model/vnd.parasolid.transmit.binary":{"source":"iana","extensions":["x_b"]},"model/vnd.parasolid.transmit.text":{"source":"iana","extensions":["x_t"]},"model/vnd.pytha.pyox":{"source":"iana"},"model/vnd.rosette.annotated-data-model":{"source":"iana"},"model/vnd.sap.vds":{"source":"iana","extensions":["vds"]},"model/vnd.usdz+zip":{"source":"iana","compressible":false,"extensions":["usdz"]},"model/vnd.valve.source.compiled-map":{"source":"iana","extensions":["bsp"]},"model/vnd.vtu":{"source":"iana","extensions":["vtu"]},"model/vrml":{"source":"iana","compressible":false,"extensions":["wrl","vrml"]},"model/x3d+binary":{"source":"apache","compressible":false,"extensions":["x3db","x3dbz"]},"model/x3d+fastinfoset":{"source":"iana","extensions":["x3db"]},"model/x3d+vrml":{"source":"apache","compressible":false,"extensions":["x3dv","x3dvz"]},"model/x3d+xml":{"source":"iana","compressible":true,"extensions":["x3d","x3dz"]},"model/x3d-vrml":{"source":"iana","extensions":["x3dv"]},"multipart/alternative":{"source":"iana","compressible":false},"multipart/appledouble":{"source":"iana"},"multipart/byteranges":{"source":"iana"},"multipart/digest":{"source":"iana"},"multipart/encrypted":{"source":"iana","compressible":false},"multipart/form-data":{"source":"iana","compressible":false},"multipart/header-set":{"source":"iana"},"multipart/mixed":{"source":"iana"},"multipart/multilingual":{"source":"iana"},"multipart/parallel":{"source":"iana"},"multipart/related":{"source":"iana","compressible":false},"multipart/report":{"source":"iana"},"multipart/signed":{"source":"iana","compressible":false},"multipart/vnd.bint.med-plus":{"source":"iana"},"multipart/voice-message":{"source":"iana"},"multipart/x-mixed-replace":{"source":"iana"},"text/1d-interleaved-parityfec":{"source":"iana"},"text/cache-manifest":{"source":"iana","compressible":true,"extensions":["appcache","manifest"]},"text/calendar":{"source":"iana","extensions":["ics","ifb"]},"text/calender":{"compressible":true},"text/cmd":{"compressible":true},"text/coffeescript":{"extensions":["coffee","litcoffee"]},"text/cql":{"source":"iana"},"text/cql-expression":{"source":"iana"},"text/cql-identifier":{"source":"iana"},"text/css":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["css"]},"text/csv":{"source":"iana","compressible":true,"extensions":["csv"]},"text/csv-schema":{"source":"iana"},"text/directory":{"source":"iana"},"text/dns":{"source":"iana"},"text/ecmascript":{"source":"iana"},"text/encaprtp":{"source":"iana"},"text/enriched":{"source":"iana"},"text/fhirpath":{"source":"iana"},"text/flexfec":{"source":"iana"},"text/fwdred":{"source":"iana"},"text/gff3":{"source":"iana"},"text/grammar-ref-list":{"source":"iana"},"text/html":{"source":"iana","compressible":true,"extensions":["html","htm","shtml"]},"text/jade":{"extensions":["jade"]},"text/javascript":{"source":"iana","compressible":true},"text/jcr-cnd":{"source":"iana"},"text/jsx":{"compressible":true,"extensions":["jsx"]},"text/less":{"compressible":true,"extensions":["less"]},"text/markdown":{"source":"iana","compressible":true,"extensions":["markdown","md"]},"text/mathml":{"source":"nginx","extensions":["mml"]},"text/mdx":{"compressible":true,"extensions":["mdx"]},"text/mizar":{"source":"iana"},"text/n3":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["n3"]},"text/parameters":{"source":"iana","charset":"UTF-8"},"text/parityfec":{"source":"iana"},"text/plain":{"source":"iana","compressible":true,"extensions":["txt","text","conf","def","list","log","in","ini"]},"text/provenance-notation":{"source":"iana","charset":"UTF-8"},"text/prs.fallenstein.rst":{"source":"iana"},"text/prs.lines.tag":{"source":"iana","extensions":["dsc"]},"text/prs.prop.logic":{"source":"iana"},"text/raptorfec":{"source":"iana"},"text/red":{"source":"iana"},"text/rfc822-headers":{"source":"iana"},"text/richtext":{"source":"iana","compressible":true,"extensions":["rtx"]},"text/rtf":{"source":"iana","compressible":true,"extensions":["rtf"]},"text/rtp-enc-aescm128":{"source":"iana"},"text/rtploopback":{"source":"iana"},"text/rtx":{"source":"iana"},"text/sgml":{"source":"iana","extensions":["sgml","sgm"]},"text/shaclc":{"source":"iana"},"text/shex":{"source":"iana","extensions":["shex"]},"text/slim":{"extensions":["slim","slm"]},"text/spdx":{"source":"iana","extensions":["spdx"]},"text/strings":{"source":"iana"},"text/stylus":{"extensions":["stylus","styl"]},"text/t140":{"source":"iana"},"text/tab-separated-values":{"source":"iana","compressible":true,"extensions":["tsv"]},"text/troff":{"source":"iana","extensions":["t","tr","roff","man","me","ms"]},"text/turtle":{"source":"iana","charset":"UTF-8","extensions":["ttl"]},"text/ulpfec":{"source":"iana"},"text/uri-list":{"source":"iana","compressible":true,"extensions":["uri","uris","urls"]},"text/vcard":{"source":"iana","compressible":true,"extensions":["vcard"]},"text/vnd.a":{"source":"iana"},"text/vnd.abc":{"source":"iana"},"text/vnd.ascii-art":{"source":"iana"},"text/vnd.curl":{"source":"iana","extensions":["curl"]},"text/vnd.curl.dcurl":{"source":"apache","extensions":["dcurl"]},"text/vnd.curl.mcurl":{"source":"apache","extensions":["mcurl"]},"text/vnd.curl.scurl":{"source":"apache","extensions":["scurl"]},"text/vnd.debian.copyright":{"source":"iana","charset":"UTF-8"},"text/vnd.dmclientscript":{"source":"iana"},"text/vnd.dvb.subtitle":{"source":"iana","extensions":["sub"]},"text/vnd.esmertec.theme-descriptor":{"source":"iana","charset":"UTF-8"},"text/vnd.familysearch.gedcom":{"source":"iana","extensions":["ged"]},"text/vnd.ficlab.flt":{"source":"iana"},"text/vnd.fly":{"source":"iana","extensions":["fly"]},"text/vnd.fmi.flexstor":{"source":"iana","extensions":["flx"]},"text/vnd.gml":{"source":"iana"},"text/vnd.graphviz":{"source":"iana","extensions":["gv"]},"text/vnd.hans":{"source":"iana"},"text/vnd.hgl":{"source":"iana"},"text/vnd.in3d.3dml":{"source":"iana","extensions":["3dml"]},"text/vnd.in3d.spot":{"source":"iana","extensions":["spot"]},"text/vnd.iptc.newsml":{"source":"iana"},"text/vnd.iptc.nitf":{"source":"iana"},"text/vnd.latex-z":{"source":"iana"},"text/vnd.motorola.reflex":{"source":"iana"},"text/vnd.ms-mediapackage":{"source":"iana"},"text/vnd.net2phone.commcenter.command":{"source":"iana"},"text/vnd.radisys.msml-basic-layout":{"source":"iana"},"text/vnd.senx.warpscript":{"source":"iana"},"text/vnd.si.uricatalogue":{"source":"iana"},"text/vnd.sosi":{"source":"iana"},"text/vnd.sun.j2me.app-descriptor":{"source":"iana","charset":"UTF-8","extensions":["jad"]},"text/vnd.trolltech.linguist":{"source":"iana","charset":"UTF-8"},"text/vnd.wap.si":{"source":"iana"},"text/vnd.wap.sl":{"source":"iana"},"text/vnd.wap.wml":{"source":"iana","extensions":["wml"]},"text/vnd.wap.wmlscript":{"source":"iana","extensions":["wmls"]},"text/vtt":{"source":"iana","charset":"UTF-8","compressible":true,"extensions":["vtt"]},"text/x-asm":{"source":"apache","extensions":["s","asm"]},"text/x-c":{"source":"apache","extensions":["c","cc","cxx","cpp","h","hh","dic"]},"text/x-component":{"source":"nginx","extensions":["htc"]},"text/x-fortran":{"source":"apache","extensions":["f","for","f77","f90"]},"text/x-gwt-rpc":{"compressible":true},"text/x-handlebars-template":{"extensions":["hbs"]},"text/x-java-source":{"source":"apache","extensions":["java"]},"text/x-jquery-tmpl":{"compressible":true},"text/x-lua":{"extensions":["lua"]},"text/x-markdown":{"compressible":true,"extensions":["mkd"]},"text/x-nfo":{"source":"apache","extensions":["nfo"]},"text/x-opml":{"source":"apache","extensions":["opml"]},"text/x-org":{"compressible":true,"extensions":["org"]},"text/x-pascal":{"source":"apache","extensions":["p","pas"]},"text/x-processing":{"compressible":true,"extensions":["pde"]},"text/x-sass":{"extensions":["sass"]},"text/x-scss":{"extensions":["scss"]},"text/x-setext":{"source":"apache","extensions":["etx"]},"text/x-sfv":{"source":"apache","extensions":["sfv"]},"text/x-suse-ymp":{"compressible":true,"extensions":["ymp"]},"text/x-uuencode":{"source":"apache","extensions":["uu"]},"text/x-vcalendar":{"source":"apache","extensions":["vcs"]},"text/x-vcard":{"source":"apache","extensions":["vcf"]},"text/xml":{"source":"iana","compressible":true,"extensions":["xml"]},"text/xml-external-parsed-entity":{"source":"iana"},"text/yaml":{"compressible":true,"extensions":["yaml","yml"]},"video/1d-interleaved-parityfec":{"source":"iana"},"video/3gpp":{"source":"iana","extensions":["3gp","3gpp"]},"video/3gpp-tt":{"source":"iana"},"video/3gpp2":{"source":"iana","extensions":["3g2"]},"video/av1":{"source":"iana"},"video/bmpeg":{"source":"iana"},"video/bt656":{"source":"iana"},"video/celb":{"source":"iana"},"video/dv":{"source":"iana"},"video/encaprtp":{"source":"iana"},"video/ffv1":{"source":"iana"},"video/flexfec":{"source":"iana"},"video/h261":{"source":"iana","extensions":["h261"]},"video/h263":{"source":"iana","extensions":["h263"]},"video/h263-1998":{"source":"iana"},"video/h263-2000":{"source":"iana"},"video/h264":{"source":"iana","extensions":["h264"]},"video/h264-rcdo":{"source":"iana"},"video/h264-svc":{"source":"iana"},"video/h265":{"source":"iana"},"video/iso.segment":{"source":"iana","extensions":["m4s"]},"video/jpeg":{"source":"iana","extensions":["jpgv"]},"video/jpeg2000":{"source":"iana"},"video/jpm":{"source":"apache","extensions":["jpm","jpgm"]},"video/jxsv":{"source":"iana"},"video/mj2":{"source":"iana","extensions":["mj2","mjp2"]},"video/mp1s":{"source":"iana"},"video/mp2p":{"source":"iana"},"video/mp2t":{"source":"iana","extensions":["ts"]},"video/mp4":{"source":"iana","compressible":false,"extensions":["mp4","mp4v","mpg4"]},"video/mp4v-es":{"source":"iana"},"video/mpeg":{"source":"iana","compressible":false,"extensions":["mpeg","mpg","mpe","m1v","m2v"]},"video/mpeg4-generic":{"source":"iana"},"video/mpv":{"source":"iana"},"video/nv":{"source":"iana"},"video/ogg":{"source":"iana","compressible":false,"extensions":["ogv"]},"video/parityfec":{"source":"iana"},"video/pointer":{"source":"iana"},"video/quicktime":{"source":"iana","compressible":false,"extensions":["qt","mov"]},"video/raptorfec":{"source":"iana"},"video/raw":{"source":"iana"},"video/rtp-enc-aescm128":{"source":"iana"},"video/rtploopback":{"source":"iana"},"video/rtx":{"source":"iana"},"video/scip":{"source":"iana"},"video/smpte291":{"source":"iana"},"video/smpte292m":{"source":"iana"},"video/ulpfec":{"source":"iana"},"video/vc1":{"source":"iana"},"video/vc2":{"source":"iana"},"video/vnd.cctv":{"source":"iana"},"video/vnd.dece.hd":{"source":"iana","extensions":["uvh","uvvh"]},"video/vnd.dece.mobile":{"source":"iana","extensions":["uvm","uvvm"]},"video/vnd.dece.mp4":{"source":"iana"},"video/vnd.dece.pd":{"source":"iana","extensions":["uvp","uvvp"]},"video/vnd.dece.sd":{"source":"iana","extensions":["uvs","uvvs"]},"video/vnd.dece.video":{"source":"iana","extensions":["uvv","uvvv"]},"video/vnd.directv.mpeg":{"source":"iana"},"video/vnd.directv.mpeg-tts":{"source":"iana"},"video/vnd.dlna.mpeg-tts":{"source":"iana"},"video/vnd.dvb.file":{"source":"iana","extensions":["dvb"]},"video/vnd.fvt":{"source":"iana","extensions":["fvt"]},"video/vnd.hns.video":{"source":"iana"},"video/vnd.iptvforum.1dparityfec-1010":{"source":"iana"},"video/vnd.iptvforum.1dparityfec-2005":{"source":"iana"},"video/vnd.iptvforum.2dparityfec-1010":{"source":"iana"},"video/vnd.iptvforum.2dparityfec-2005":{"source":"iana"},"video/vnd.iptvforum.ttsavc":{"source":"iana"},"video/vnd.iptvforum.ttsmpeg2":{"source":"iana"},"video/vnd.motorola.video":{"source":"iana"},"video/vnd.motorola.videop":{"source":"iana"},"video/vnd.mpegurl":{"source":"iana","extensions":["mxu","m4u"]},"video/vnd.ms-playready.media.pyv":{"source":"iana","extensions":["pyv"]},"video/vnd.nokia.interleaved-multimedia":{"source":"iana"},"video/vnd.nokia.mp4vr":{"source":"iana"},"video/vnd.nokia.videovoip":{"source":"iana"},"video/vnd.objectvideo":{"source":"iana"},"video/vnd.radgamettools.bink":{"source":"iana"},"video/vnd.radgamettools.smacker":{"source":"iana"},"video/vnd.sealed.mpeg1":{"source":"iana"},"video/vnd.sealed.mpeg4":{"source":"iana"},"video/vnd.sealed.swf":{"source":"iana"},"video/vnd.sealedmedia.softseal.mov":{"source":"iana"},"video/vnd.uvvu.mp4":{"source":"iana","extensions":["uvu","uvvu"]},"video/vnd.vivo":{"source":"iana","extensions":["viv"]},"video/vnd.youtube.yt":{"source":"iana"},"video/vp8":{"source":"iana"},"video/vp9":{"source":"iana"},"video/webm":{"source":"apache","compressible":false,"extensions":["webm"]},"video/x-f4v":{"source":"apache","extensions":["f4v"]},"video/x-fli":{"source":"apache","extensions":["fli"]},"video/x-flv":{"source":"apache","compressible":false,"extensions":["flv"]},"video/x-m4v":{"source":"apache","extensions":["m4v"]},"video/x-matroska":{"source":"apache","compressible":false,"extensions":["mkv","mk3d","mks"]},"video/x-mng":{"source":"apache","extensions":["mng"]},"video/x-ms-asf":{"source":"apache","extensions":["asf","asx"]},"video/x-ms-vob":{"source":"apache","extensions":["vob"]},"video/x-ms-wm":{"source":"apache","extensions":["wm"]},"video/x-ms-wmv":{"source":"apache","compressible":false,"extensions":["wmv"]},"video/x-ms-wmx":{"source":"apache","extensions":["wmx"]},"video/x-ms-wvx":{"source":"apache","extensions":["wvx"]},"video/x-msvideo":{"source":"apache","extensions":["avi"]},"video/x-sgi-movie":{"source":"apache","extensions":["movie"]},"video/x-smv":{"source":"apache","extensions":["smv"]},"x-conference/x-cooltalk":{"source":"apache","extensions":["ice"]},"x-shader/x-fragment":{"compressible":true},"x-shader/x-vertex":{"compressible":true}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ ExamplePlugin)
});

// NAMESPACE OBJECT: ../../packages/bdlib/src/ui/settings/index.ts
var ui_settings_namespaceObject = {};
__webpack_require__.r(ui_settings_namespaceObject);
__webpack_require__.d(ui_settings_namespaceObject, {
  "CSS": () => (settings_namespaceObject),
  "ColorPicker": () => (color),
  "Dropdown": () => (dropdown),
  "FilePicker": () => (file),
  "Keybind": () => (keybind),
  "RadioGroup": () => (radiogroup),
  "ReactSetting": () => (ReactSetting),
  "SettingField": () => (settingfield),
  "SettingGroup": () => (settinggroup),
  "SettingPanel": () => (settingpanel),
  "Slider": () => (slider),
  "Switch": () => (types_switch),
  "Textbox": () => (textbox)
});

// NAMESPACE OBJECT: ../../packages/bdlib/src/structs/index.ts
var structs_namespaceObject = {};
__webpack_require__.r(structs_namespaceObject);
__webpack_require__.d(structs_namespaceObject, {
  "ClassName": () => (classname),
  "DOMObserver": () => (observer),
  "Listenable": () => (listenable),
  "Plugin": () => (structs_plugin),
  "Screen": () => (screen),
  "Selector": () => (selector)
});

// NAMESPACE OBJECT: ../../packages/bdlib/src/modules/index.ts
var modules_namespaceObject = {};
__webpack_require__.r(modules_namespaceObject);
__webpack_require__.d(modules_namespaceObject, {
  "ColorConverter": () => (ColorConverter),
  "DOMTools": () => (DOMTools),
  "DiscordClassModules": () => (discordclassmodules),
  "DiscordClasses": () => (discordclasses),
  "DiscordModules": () => (discordmodules),
  "DiscordSelectors": () => (discordselectors),
  "Filters": () => (Filters),
  "Logger": () => (Logger),
  "Patcher": () => (Patcher),
  "PluginUpdater": () => (PluginUpdater),
  "PluginUtilities": () => (PluginUtilities),
  "ReactComponents": () => (ReactComponents),
  "ReactTools": () => (ReactTools),
  "Structs": () => (structs_namespaceObject),
  "Utilities": () => (Utilities),
  "WebpackModules": () => (WebpackModules)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/axios@0.27.2/node_modules/axios/index.js
var axios = __webpack_require__(811);
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);
;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/logger.ts
/** 
 * Simple logger for the lib and plugins.
 * 
 * @module Logger
 */ /* eslint-disable no-console */ /**
 * List of logging types.
 */ const LogTypes = {
    /** Alias for error */ err: "error",
    error: "error",
    /** Alias for debug */ dbg: "debug",
    debug: "debug",
    log: "log",
    warn: "warn",
    info: "info"
};
class Logger {
    /**
     * Logs an error using a collapsed error group with stacktrace.
     * 
     * @param {string} module - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {Error} error - Error object to log with the message.
     */ static stacktrace(module, message, error) {
        console.error(`%c[${module}]%c ${message}\n\n%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);
    }
    /**
     * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
     * 
     * @param {string} module - Name of the calling module.
     * @param {string} message - Messages to have logged.
     */ static err(module, ...message) {
        Logger._log(module, message, "error");
    }
    /**
     * Logs a warning message.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static warn(module, ...message) {
        Logger._log(module, message, "warn");
    }
    /**
     * Logs an informational message.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static info(module, ...message) {
        Logger._log(module, message, "info");
    }
    /**
     * Logs used for debugging purposes.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static debug(module, ...message) {
        Logger._log(module, message, "debug");
    }
    /**
     * Logs used for basic loggin.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static log(module, ...message) {
        Logger._log(module, message);
    }
    /**
     * Logs strings using different console levels and a module label.
     * 
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */ static _log(module, message, type = "log") {
        type = Logger.parseType(type);
        if (!Array.isArray(message)) message = [
            message
        ];
        console[type](`%c[${module}]%c`, "color: #3a71c1; font-weight: 700;", "", ...message);
    }
    static parseType(type) {
        return LogTypes.hasOwnProperty(type) ? LogTypes[type] : "log";
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/utilities.ts
//@ts-nocheck
/**
 * Random set of utilities that didn't fit elsewhere.
 * @module Utilities
 */ 
class Utilities {
    /**
     * Stably sorts arrays since `.sort()` has issues.
     * @param {Array} list - array to sort
     * @param {function} comparator - comparator to sort by
     */ static stableSort(list, comparator) {
        const entries = Array(list.length);
        // wrap values with initial indices
        for(let index = 0; index < list.length; index++){
            entries[index] = [
                index,
                list[index]
            ];
        }
        // sort with fallback based on initial indices
        entries.sort((function(a, b) {
            const comparison = Number(this(a[1], b[1]));
            return comparison || a[0] - b[0];
        }).bind(comparator));
        // re-map original array to stable sorted values
        for(let index1 = 0; index1 < list.length; index1++){
            list[index1] = entries[index1][1];
        }
    }
    /**
     * Generates an automatically memoizing version of an object.
     * @param {Object} object - object to memoize
     * @returns {Proxy} the proxy to the object that memoizes properties
     */ static memoizeObject(object) {
        const proxy = new Proxy(object, {
            get: function(obj, mod) {
                if (!obj.hasOwnProperty(mod)) return undefined;
                if (Object.getOwnPropertyDescriptor(obj, mod).get) {
                    const value = obj[mod];
                    delete obj[mod];
                    obj[mod] = value;
                }
                return obj[mod];
            },
            set: function(obj, mod, value) {
                if (obj.hasOwnProperty(mod)) return Logger.err("MemoizedObject", "Trying to overwrite existing property");
                obj[mod] = value;
                return obj[mod];
            }
        });
        Object.defineProperty(proxy, "hasOwnProperty", {
            value: function(prop) {
                return this[prop] !== undefined;
            }
        });
        return proxy;
    }
    /**
     * Wraps the method in a `try..catch` block.
     * @param {callable} method - method to wrap
     * @param {string} description - description of method
     * @returns {callable} wrapped version of method
     */ static suppressErrors(method, description) {
        return (...params)=>{
            try {
                return method(...params);
            } catch (e) {
                Logger.err("Suppression", "Error occurred in " + description, e);
            }
        };
    }
    /**
     * This only exists because Samo relied on lodash being there... fuck lodash.
     * @param {*} anything - whatever you want
     */ static isNil(anything) {
        return anything == null;
    }
    /**
     * Format template strings with placeholders (`${placeholder}`) into full strings.
     * Quick example: `Utilities.formatString("Hello, ${user}", {user: "Zerebos"})`
     * would return "Hello, Zerebos".
     * @param {string} string - string to format
     * @param {object} values - object literal of placeholders to replacements
     * @returns {string} the properly formatted string
     */ static formatTString(string, values) {
        for(const val in values){
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof replacement === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`\\$\\{${val}\\}`, "g"), replacement);
        }
        return string;
    }
    /**
     * Format strings with placeholders (`{{placeholder}}`) into full strings.
     * Quick example: `Utilities.formatString("Hello, {{user}}", {user: "Zerebos"})`
     * would return "Hello, Zerebos".
     * @param {string} string - string to format
     * @param {object} values - object literal of placeholders to replacements
     * @returns {string} the properly formatted string
     */ static formatString(string, values) {
        for(const val in values){
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof replacement === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`{{${val}}}`, "g"), replacement);
        }
        return string;
    }
    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
     * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
     * @param {callable} searchFilter Filter function to check subobjects against.
     */ static findInReactTree(tree, searchFilter) {
        return this.findInTree(tree, searchFilter, {
            walkable: [
                "props",
                "children",
                "child",
                "sibling"
            ]
        });
    }
    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter.
     * @param {object} tree Tree that should be walked
     * @param {callable} searchFilter Filter to check against each object and subobject
     * @param {object} options Additional options to customize the search
     * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
     * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
     */ static findInTree(tree, searchFilter, { walkable =null , ignore =[]  } = {}) {
        if (typeof searchFilter === "string") {
            if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
        } else if (searchFilter(tree)) {
            return tree;
        }
        if (typeof tree !== "object" || tree == null) return undefined;
        let tempReturn;
        if (Array.isArray(tree)) {
            for (const value of tree){
                tempReturn = this.findInTree(value, searchFilter, {
                    walkable,
                    ignore
                });
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        } else {
            const toWalk = walkable == null ? Object.keys(tree) : walkable;
            for (const key of toWalk){
                if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
                tempReturn = this.findInTree(tree[key], searchFilter, {
                    walkable,
                    ignore
                });
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        return tempReturn;
    }
    /**
     * Gets a nested property (if it exists) safely. Path should be something like `prop.prop2.prop3`.
     * Numbers can be used for arrays as well like `prop.prop2.array.0.id`.
     * @param {Object} obj - object to get nested property of
     * @param {string} path - representation of the property to obtain
     */ static getNestedProp(obj, path) {
        return path.split(".").reduce(function(ob, prop) {
            return ob && ob[prop];
        }, obj);
    }
    /**
     * Builds a classname string from any number of arguments. This includes arrays and objects.
     * When given an array all values from the array are added to the list.
     * When given an object they keys are added as the classnames if the value is truthy.
     * Copyright (c) 2018 Jed Watson https://github.com/JedWatson/classnames MIT License
     * @param {...Any} argument - anything that should be used to add classnames.
     */ static className() {
        const classes = [];
        const hasOwn = {}.hasOwnProperty;
        for(let i = 0; i < arguments.length; i++){
            const arg = arguments[i];
            if (!arg) continue;
            const argType = typeof arg;
            if (argType === "string" || argType === "number") {
                classes.push(arg);
            } else if (Array.isArray(arg) && arg.length) {
                const inner = this.classNames.apply(null, arg);
                if (inner) {
                    classes.push(inner);
                }
            } else if (argType === "object") {
                for(const key in arg){
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }
        return classes.join(" ");
    }
    /**
     * Safely adds to the prototype of an existing object by checking if the
     * property exists on the prototype.
     * @param {object} object - Object whose prototype to extend
     * @param {string} prop - Name of the prototype property to add
     * @param {callable} func - Function to run
     */ static addToPrototype(object, prop, func) {
        if (!object.prototype) return;
        if (object.prototype[prop]) return;
        return object.prototype[prop] = func;
    }
    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object, 
     * and the keys match, the object is extended. This happens recursively.
     * @param {object} extendee - Object to be extended
     * @param {...object} extenders - Objects to extend with
     * @returns {object} - A reference to `extendee`
     */ static extend(extendee, ...extenders) {
        for(let i = 0; i < extenders.length; i++){
            for(const key in extenders[i]){
                if (extenders[i].hasOwnProperty(key)) {
                    if (Array.isArray(extendee[key]) && Array.isArray(extenders[i][key])) this.extend(extendee[key], extenders[i][key]);
                    else if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") this.extend(extendee[key], extenders[i][key]);
                    else if (Array.isArray(extenders[i][key])) extendee[key] = [], this.extend(extendee[key], extenders[i][key]); // eslint-disable-line no-sequences
                    else if (typeof extenders[i][key] === "object") extendee[key] = {}, this.extend(extendee[key], extenders[i][key]); // eslint-disable-line no-sequences
                    else extendee[key] = extenders[i][key];
                }
            }
        }
        return extendee;
    }
    /* Code below comes from our work on BDv2:
     * https://github.com/JsSucks/BetterDiscordApp/blob/master/common/modules/utils.js
     */ /**
     * Clones an object and all it's properties.
     * @param {Any} value The value to clone
     * @return {Any} The cloned value
     */ static deepclone(value) {
        if (typeof value === "object") {
            if (Array.isArray(value)) return value.map((i)=>this.deepclone(i));
            const clone = Object.assign({}, value);
            for(const key in clone){
                clone[key] = this.deepclone(clone[key]);
            }
            return clone;
        }
        return value;
    }
    /**
     * Freezes an object and all it's properties.
     * @param {Any} object The object to freeze
     * @param {Function} exclude A function to filter object that shouldn't be frozen
     */ static deepfreeze(object, exclude) {
        if (exclude && exclude(object)) return;
        if (typeof object === "object" && object !== null) {
            const properties = Object.getOwnPropertyNames(object);
            for (const property of properties){
                this.deepfreeze(object[property], exclude);
            }
            Object.freeze(object);
        }
        return object;
    }
    /**
     * Removes an item from an array. This differs from Array.prototype.filter as it mutates the original array instead of creating a new one.
     * @param {Array} array The array to filter
     * @param {Any} item The item to remove from the array
     * @return {Array}
     */ static removeFromArray(array, item, filter) {
        let index;
        while((index = filter ? array.findIndex(item) : array.indexOf(item)) > -1)array.splice(index, 1);
        return array;
    }
    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds.
     * 
     * Adapted from the version by David Walsh (https://davidwalsh.name/javascript-debounce-function)
     * 
     * @param {function} executor 
     * @param {number} delay 
     */ static debounce(executor, delay) {
        let timeout;
        return function(...args) {
            const callback = ()=>{
                timeout = null;
                Reflect.apply(executor, null, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(callback, delay);
        };
    }
    /**
     * Loads data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data is saved under
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default data
    */ static loadData(name, key, defaultData) {
        const defaults = this.deepclone(defaultData);
        try {
            return this.extend(defaults ? defaults : {}, BdApi.getData(name, key));
        } catch (err) {
            Logger.err(name, "Unable to load data: ", err);
        }
        return defaults;
    }
    /**
     * Saves data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data should be saved under
     * @param {object} data - data to save
    */ static saveData(name, key, data) {
        try {
            BdApi.setData(name, key, data);
        } catch (err) {
            Logger.err(name, "Unable to save data: ", err);
        }
    }
    /**
     * Loads settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default settings
    */ static loadSettings(name, defaultSettings) {
        return this.loadData(name, "settings", defaultSettings);
    }
    /**
     * Saves settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} data - settings to save
    */ static saveSettings(name, data) {
        this.saveData(name, "settings", data);
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordmodules.ts
//@ts-nocheck
/**
 * A large list of known and useful webpack modules internal to Discord.
 * Click the source link down below to view more info. Otherwise, if you
 * have the library installed or have a plugin using this library,
 * do `Object.keys(ZLibrary.DiscordModules)` in console for a list of modules.
 * @module DiscordModules
 */ 

/* harmony default export */ const discordmodules = (Utilities.memoizeObject({
    get React () {
        return WebpackModules.getByProps("createElement", "cloneElement");
    },
    get ReactDOM () {
        return WebpackModules.getByProps("render", "findDOMNode");
    },
    get Events () {
        return WebpackModules.getByPrototypes("setMaxListeners", "emit");
    },
    /* Guild Info, Stores, and Utilities */ get GuildStore () {
        return WebpackModules.getByProps("getGuild");
    },
    get SortedGuildStore () {
        return WebpackModules.getByProps("getSortedGuilds");
    },
    get SelectedGuildStore () {
        return WebpackModules.getByProps("getLastSelectedGuildId");
    },
    get GuildSync () {
        return WebpackModules.getByProps("getSyncedGuilds");
    },
    get GuildInfo () {
        return WebpackModules.getByProps("getAcronym");
    },
    get GuildChannelsStore () {
        return WebpackModules.getByProps("getChannels", "getDefaultChannel");
    },
    get GuildMemberStore () {
        return WebpackModules.getByProps("getMember");
    },
    get MemberCountStore () {
        return WebpackModules.getByProps("getMemberCounts");
    },
    get GuildEmojiStore () {
        return WebpackModules.getByProps("getEmojis");
    },
    get GuildActions () {
        return WebpackModules.getByProps("requestMembers");
    },
    get GuildPermissions () {
        return WebpackModules.getByProps("getGuildPermissions");
    },
    /* Channel Store & Actions */ get ChannelStore () {
        return WebpackModules.getByProps("getChannel", "getDMFromUserId");
    },
    get SelectedChannelStore () {
        return WebpackModules.getByProps("getLastSelectedChannelId");
    },
    get ChannelActions () {
        return WebpackModules.getByProps("selectChannel");
    },
    get PrivateChannelActions () {
        return WebpackModules.getByProps("openPrivateChannel");
    },
    /* Current User Info, State and Settings */ get UserInfoStore () {
        return WebpackModules.getByProps("getSessionId");
    },
    get UserSettingsStore () {
        return WebpackModules.getByProps("guildPositions");
    },
    get StreamerModeStore () {
        return WebpackModules.getByProps("hidePersonalInformation");
    },
    get UserSettingsUpdater () {
        return WebpackModules.getByProps("updateRemoteSettings");
    },
    get OnlineWatcher () {
        return WebpackModules.getByProps("isOnline");
    },
    get CurrentUserIdle () {
        return WebpackModules.getByProps("isIdle");
    },
    get RelationshipStore () {
        return WebpackModules.getByProps("isBlocked", "getFriendIDs");
    },
    get RelationshipManager () {
        return WebpackModules.getByProps("addRelationship");
    },
    get MentionStore () {
        return WebpackModules.getByProps("getMentions");
    },
    /* User Stores and Utils */ get UserStore () {
        return WebpackModules.getByProps("getCurrentUser", "getUser");
    },
    get UserStatusStore () {
        return WebpackModules.getByProps("getStatus", "getState");
    },
    get UserTypingStore () {
        return WebpackModules.getByProps("isTyping");
    },
    get UserActivityStore () {
        return WebpackModules.getByProps("getActivity");
    },
    get UserNameResolver () {
        return WebpackModules.getByProps("getName");
    },
    get UserNoteStore () {
        return WebpackModules.getByProps("getNote");
    },
    get UserNoteActions () {
        return WebpackModules.getByProps("updateNote");
    },
    /* Emoji Store and Utils */ get EmojiInfo () {
        return WebpackModules.getByProps("isEmojiDisabled");
    },
    get EmojiUtils () {
        return WebpackModules.getByProps("getGuildEmoji");
    },
    get EmojiStore () {
        return WebpackModules.getByProps("getByCategory", "EMOJI_NAME_RE");
    },
    /* Invite Store and Utils */ get InviteStore () {
        return WebpackModules.getByProps("getInvites");
    },
    get InviteResolver () {
        return WebpackModules.getByProps("resolveInvite");
    },
    get InviteActions () {
        return WebpackModules.getByProps("acceptInvite");
    },
    /* Discord Objects & Utils */ get DiscordConstants () {
        return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes");
    },
    get DiscordPermissions () {
        return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;
    },
    get Permissions () {
        return WebpackModules.getByProps("computePermissions");
    },
    get ColorConverter () {
        return WebpackModules.getByProps("hex2int");
    },
    get ColorShader () {
        return WebpackModules.getByProps("darken");
    },
    get TinyColor () {
        return WebpackModules.getByPrototypes("toRgb");
    },
    get ClassResolver () {
        return WebpackModules.getByProps("getClass");
    },
    get ButtonData () {
        return WebpackModules.getByProps("ButtonSizes");
    },
    get NavigationUtils () {
        return WebpackModules.getByProps("transitionTo", "replaceWith", "getHistory");
    },
    /* Discord Messages */ get MessageStore () {
        return WebpackModules.getByProps("getMessage", "getMessages");
    },
    get ReactionsStore () {
        return WebpackModules.getByProps("getReactions", "_dispatcher");
    },
    get MessageActions () {
        return WebpackModules.getByProps("jumpToMessage", "_sendMessage");
    },
    get MessageQueue () {
        return WebpackModules.getByProps("enqueue");
    },
    get MessageParser () {
        return WebpackModules.getModule((m)=>Object.keys(m).length && Object.keys(m).every((k)=>k === "parse" || k === "unparse"));
    },
    /* Experiments */ get ExperimentStore () {
        return WebpackModules.getByProps("getExperimentOverrides");
    },
    get ExperimentsManager () {
        return WebpackModules.getByProps("isDeveloper");
    },
    get CurrentExperiment () {
        return WebpackModules.getByProps("getExperimentId");
    },
    /* Streams */ get StreamStore () {
        return WebpackModules.getByProps("getAllActiveStreams", "getStreamForUser");
    },
    get StreamPreviewStore () {
        return WebpackModules.getByProps("getIsPreviewLoading", "getPreviewURL");
    },
    /* Images, Avatars and Utils */ get ImageResolver () {
        return WebpackModules.getByProps("getUserAvatarURL", "getGuildIconURL");
    },
    get ImageUtils () {
        return WebpackModules.getByProps("getSizedImageSrc");
    },
    get AvatarDefaults () {
        return WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
    },
    /* Drag & Drop */ get DNDSources () {
        return WebpackModules.getByProps("addTarget");
    },
    get DNDObjects () {
        return WebpackModules.getByProps("DragSource");
    },
    /* Electron & Other Internals with Utils*/ get ElectronModule () {
        return WebpackModules.getByProps("setBadge");
    },
    get Flux () {
        return WebpackModules.getByProps("Store", "connectStores");
    },
    get Dispatcher () {
        return WebpackModules.getByProps("dirtyDispatch");
    },
    get PathUtils () {
        return WebpackModules.getByProps("hasBasename");
    },
    get NotificationModule () {
        return WebpackModules.getByProps("showNotification");
    },
    get RouterModule () {
        return WebpackModules.getByProps("Router");
    },
    get APIModule () {
        return WebpackModules.getByProps("getAPIBaseURL");
    },
    get AnalyticEvents () {
        return WebpackModules.getByProps("AnalyticEventConfigs");
    },
    get KeyGenerator () {
        return WebpackModules.getByRegex(/"binary"/);
    },
    get Buffers () {
        return WebpackModules.getByProps("Buffer", "kMaxLength");
    },
    get DeviceStore () {
        return WebpackModules.getByProps("getDevices");
    },
    get SoftwareInfo () {
        return WebpackModules.getByProps("os");
    },
    get i18n () {
        return WebpackModules.getByProps("Messages", "languages");
    },
    /* Media Stuff (Audio/Video) */ get MediaDeviceInfo () {
        return WebpackModules.getByProps("Codecs", "MediaEngineContextTypes");
    },
    get MediaInfo () {
        return WebpackModules.getByProps("getOutputVolume");
    },
    get MediaEngineInfo () {
        return WebpackModules.getByProps("determineMediaEngine");
    },
    get VoiceInfo () {
        return WebpackModules.getByProps("getEchoCancellation");
    },
    get SoundModule () {
        return WebpackModules.getByProps("playSound");
    },
    /* Window, DOM, HTML */ get WindowInfo () {
        return WebpackModules.getByProps("isFocused", "windowSize");
    },
    get DOMInfo () {
        return WebpackModules.getByProps("canUseDOM");
    },
    /* Locale/Location and Time */ get LocaleManager () {
        return WebpackModules.getModule((m)=>m.Messages && Object.keys(m.Messages).length);
    },
    get Moment () {
        return WebpackModules.getByProps("parseZone");
    },
    get LocationManager () {
        return WebpackModules.getByProps("createLocation");
    },
    get Timestamps () {
        return WebpackModules.getByProps("fromTimestamp");
    },
    /* Strings and Utils */ get Strings () {
        return WebpackModules.getModule((m)=>m.Messages && Object.keys(m.Messages).length);
    },
    get StringFormats () {
        return WebpackModules.getByProps("a", "z");
    },
    get StringUtils () {
        return WebpackModules.getByProps("toASCII");
    },
    /* URLs and Utils */ get URLParser () {
        return WebpackModules.getByProps("Url", "parse");
    },
    get ExtraURLs () {
        return WebpackModules.getByProps("getArticleURL");
    },
    /* Text Processing */ get hljs () {
        return WebpackModules.getByProps("highlight", "highlightBlock");
    },
    get SimpleMarkdown () {
        return WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");
    },
    /* DOM/React Components */ /* ==================== */ get LayerManager () {
        return WebpackModules.getByProps("popLayer", "pushLayer");
    },
    get UserSettingsWindow () {
        return WebpackModules.getByProps("open", "updateAccount");
    },
    get ChannelSettingsWindow () {
        return WebpackModules.getByProps("open", "updateChannel");
    },
    get GuildSettingsWindow () {
        return WebpackModules.getByProps("open", "updateGuild");
    },
    /* Modals */ get ModalActions () {
        return WebpackModules.getByProps("openModal", "updateModal");
    },
    get ModalStack () {
        return WebpackModules.getByProps("push", "update", "pop", "popWithKey");
    },
    get UserProfileModals () {
        return WebpackModules.getByProps("fetchMutualFriends", "setSection");
    },
    get AlertModal () {
        return WebpackModules.getByPrototypes("handleCancel", "handleSubmit");
    },
    get ConfirmationModal () {
        return WebpackModules.findByDisplayName("ConfirmModal");
    },
    get ChangeNicknameModal () {
        return WebpackModules.getByProps("open", "changeNickname");
    },
    get CreateChannelModal () {
        return WebpackModules.getByProps("open", "createChannel");
    },
    get PruneMembersModal () {
        return WebpackModules.getByProps("open", "prune");
    },
    get NotificationSettingsModal () {
        return WebpackModules.getByProps("open", "updateNotificationSettings");
    },
    get PrivacySettingsModal () {
        return WebpackModules.getModule((m)=>m.open && m.open.toString().includes("PRIVACY_SETTINGS_MODAL"));
    },
    get Changelog () {
        return WebpackModules.getModule((m)=>m.defaultProps && m.defaultProps.selectable == false);
    },
    /* Popouts */ get PopoutStack () {
        return WebpackModules.getByProps("open", "close", "closeAll");
    },
    get PopoutOpener () {
        return WebpackModules.getByProps("openPopout");
    },
    get UserPopout () {
        return WebpackModules.getModule((m)=>m.type.displayName === "UserPopoutContainer");
    },
    /* Context Menus */ get ContextMenuActions () {
        return WebpackModules.getByProps("openContextMenu");
    },
    get ContextMenuItemsGroup () {
        return WebpackModules.getByRegex(/itemGroup/);
    },
    get ContextMenuItem () {
        return WebpackModules.getByRegex(/\.label\b.*\.hint\b.*\.action\b/);
    },
    /* Misc */ get ExternalLink () {
        return WebpackModules.getByRegex(/trusted/);
    },
    get TextElement () {
        return WebpackModules.getByDisplayName("LegacyText") || WebpackModules.getByProps("Colors", "Sizes");
    },
    get Anchor () {
        return WebpackModules.getByDisplayName("Anchor");
    },
    get Flex () {
        return WebpackModules.getByDisplayName("Flex");
    },
    get FlexChild () {
        return WebpackModules.getByProps("Child");
    },
    get Clickable () {
        return WebpackModules.getByDisplayName("Clickable");
    },
    get Titles () {
        return WebpackModules.getByProps("Tags", "default");
    },
    get HeaderBar () {
        return WebpackModules.getByDisplayName("HeaderBar");
    },
    get TabBar () {
        return WebpackModules.getByDisplayName("TabBar");
    },
    get Tooltip () {
        return WebpackModules.getByProps("TooltipContainer").TooltipContainer;
    },
    get Spinner () {
        return WebpackModules.getByDisplayName("Spinner");
    },
    /* Forms */ get FormTitle () {
        return WebpackModules.getByDisplayName("FormTitle");
    },
    get FormSection () {
        return WebpackModules.getByDisplayName("FormSection");
    },
    get FormNotice () {
        return WebpackModules.getByDisplayName("FormNotice");
    },
    /* Scrollers */ get ScrollerThin () {
        return WebpackModules.getByProps("ScrollerThin").ScrollerThin;
    },
    get ScrollerAuto () {
        return WebpackModules.getByProps("ScrollerAuto").ScrollerAuto;
    },
    get AdvancedScrollerThin () {
        return WebpackModules.getByProps("AdvancedScrollerThin").AdvancedScrollerThin;
    },
    get AdvancedScrollerAuto () {
        return WebpackModules.getByProps("AdvancedScrollerAuto").AdvancedScrollerAuto;
    },
    get AdvancedScrollerNone () {
        return WebpackModules.getByProps("AdvancedScrollerNone").AdvancedScrollerNone;
    },
    /* Settings */ get SettingsWrapper () {
        return WebpackModules.getByDisplayName("FormItem");
    },
    get SettingsNote () {
        return WebpackModules.getByDisplayName("FormText");
    },
    get SettingsDivider () {
        return WebpackModules.getModule((m)=>!m.defaultProps && m.prototype && m.prototype.render && m.prototype.render.toString().includes("default.divider"));
    },
    get ColorPicker () {
        return WebpackModules.getModule((m)=>m.displayName === "ColorPicker" && m.defaultProps);
    },
    get Dropdown () {
        return WebpackModules.getByProps("SingleSelect").SingleSelect;
    },
    get Keybind () {
        return WebpackModules.getByPrototypes("handleComboChange");
    },
    get RadioGroup () {
        return WebpackModules.getByDisplayName("RadioGroup");
    },
    get Slider () {
        return WebpackModules.getByPrototypes("renderMark");
    },
    get SwitchRow () {
        return WebpackModules.getByDisplayName("SwitchItem");
    },
    get Textbox () {
        return WebpackModules.getModule((m)=>m.defaultProps && m.defaultProps.type == "text");
    }
}));

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/webpackmodules.ts
//@ts-nocheck
/**
 * Random set of utilities that didn't fit elsewhere.
 * @module WebpackModules
 */ 

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */ /**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */ class Filters {
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {Array<string>} props - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byProperties(props, filter = (m)=>m) {
        return (module)=>{
            const component = filter(module);
            if (!component) return false;
            for(let p = 0; p < props.length; p++){
                if (module[props[p]] === undefined) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
   * @param {Array<string>} fields - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
   */ static byPrototypeFields(fields, filter = (m)=>m) {
        return (module)=>{
            const component = filter(module);
            if (!component) return false;
            if (!component.prototype) return false;
            for(let f = 0; f < fields.length; f++){
                if (module.prototype[fields[f]] === undefined) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
   * @param {RegExp} search - A RegExp to check on the module
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byCode(search, filter = (m)=>m) {
        return (module)=>{
            const method = filter(module);
            if (!method) return false;
            let methodString = "";
            try {
                methodString = method.toString([]);
            } catch (err) {
                methodString = method.toString();
            }
            return methodString.search(search) !== -1;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
   * @param {...String} search - A RegExp to check on the module
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
   */ static byString(...strings) {
        return (module)=>{
            let moduleString = "";
            try {
                moduleString = module.toString([]);
            } catch (err) {
                moduleString = module.toString();
            }
            for (const s of strings){
                if (!moduleString.includes(s)) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {string} name - Name the module should have
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byDisplayName(name) {
        return (module)=>{
            return module && module.displayName === name;
        };
    }
    /**
   * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
   * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
   * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
   */ static combine(...filters) {
        return (module)=>{
            return filters.every((filter)=>filter(module));
        };
    }
}
class WebpackModules {
    static find(filter, first = true) {
        return this.getModule(filter, first);
    }
    static findAll(filter) {
        return this.getModule(filter, false);
    }
    static findByUniqueProperties(props, first = true) {
        return first ? this.getByProps(...props) : this.getAllByProps(...props);
    }
    static findByDisplayName(name) {
        return this.getByDisplayName(name);
    }
    /**
   * Finds a module using a filter function.
   * @param {Function} filter A function to use to filter modules
   * @param {Boolean} first Whether to return only the first matching module
   * @return {Any}
   */ static getModule(filter, first = true) {
        const wrappedFilter = (m)=>{
            try {
                return filter(m);
            } catch (err) {
                return false;
            }
        };
        const modules = this.getAllModules();
        const rm = [];
        for(const index in modules){
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const { exports  } = module;
            let foundModule = null;
            if (!exports) continue;
            if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = exports.default;
            if (wrappedFilter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first || rm.length == 0 ? undefined : rm;
    }
    /**
   * Gets the index in the webpack require cache of a specific
   * module using a filter.
   * @param {Function} filter A function to use to filter modules
   * @return {Number|null}
   */ static getIndex(filter) {
        const wrappedFilter = (m)=>{
            try {
                return filter(m);
            } catch (err) {
                return false;
            }
        };
        const modules = this.getAllModules();
        for(const index in modules){
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const exports = module.exports;
            let foundModule = null;
            if (!exports) continue;
            if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = exports.default;
            if (wrappedFilter(exports)) foundModule = exports;
            if (!foundModule) continue;
            return index;
        }
        return null;
    }
    /**
   * Gets the index in the webpack require cache of a specific
   * module that was already found.
   * @param {Any} module An already acquired module
   * @return {Number|null}
   */ static getIndexByModule(module) {
        return this.getIndex((m)=>m == module);
    }
    /**
   * Finds all modules matching a filter function.
   * @param {Function} filter A function to use to filter modules
   */ static getModules(filter) {
        return this.getModule(filter, false);
    }
    /**
   * Finds a module by its name.
   * @param {String} name The name of the module
   * @param {Function} fallback A function to use to filter modules if not finding a known module
   * @return {Any}
   */ static getModuleByName(name, fallback) {
        if (discordmodules.hasOwnProperty(name)) return discordmodules[name];
        if (!fallback) return undefined;
        const module = this.getModule(fallback, true);
        return module ? discordmodules[name] = module : undefined;
    }
    /**
   * Finds a module by its display name.
   * @param {String} name The display name of the module
   * @return {Any}
   */ static getByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }
    /**
   * Finds a module using its code.
   * @param {RegEx} regex A regular expression to use to filter modules
   * @param {Boolean} first Whether to return the only the first matching module
   * @return {Any}
   */ static getByRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }
    /**
   * Finds a single module using properties on its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */ static getByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }
    /**
   * Finds all modules with a set of properties of its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */ static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }
    /**
   * Finds a single module using its own properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */ static getByProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }
    /**
   * Finds all modules with a set of properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */ static getAllByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }
    /**
   * Finds a single module using a set of strings.
   * @param {...String} props Strings to use to filter modules
   * @return {Any}
   */ static getByString(...strings) {
        return this.getModule(Filters.byString(...strings), true);
    }
    /**
   * Finds all modules with a set of strings.
   * @param {...String} strings Strings to use to filter modules
   * @return {Any}
   */ static getAllByString(...strings) {
        return this.getModule(Filters.byString(...strings), false);
    }
    /**
   * Gets a specific module by index of the webpack require cache.
   * Best used in combination with getIndex in order to patch a
   * specific function.
   *
   * Note: this gives the **raw** module, meaning the actual module
   * is in returnValue.exports. This is done in order to be able
   * to patch modules which export a single function directly.
   * @param {Number} index Index into the webpack require cache
   * @return {Any}
   */ static getByIndex(index) {
        return WebpackModules.require.c[index].exports;
    }
    /**
   * Discord's __webpack_require__ function.
   */ static get require() {
        if (this._require) return this._require;
        const id = "zl-webpackmodules";
        const __nested_webpack_require_10784__ = window.webpackJsonp.push([
            [],
            {
                [id]: (module, exports, req)=>module.exports = req
            },
            [
                [
                    id
                ]
            ], 
        ]);
        delete __nested_webpack_require_10784__.m[id];
        delete __nested_webpack_require_10784__.c[id];
        return this._require = __nested_webpack_require_10784__;
    }
    /**
   * Returns all loaded modules.
   * @return {Array}
   */ static getAllModules() {
        return this.require.c;
    }
    // Webpack Chunk Observing
    static get chunkName() {
        return "webpackChunkdiscord_app";
    }
    static initialize() {
        this.handlePush = this.handlePush.bind(this);
        this.listeners = new Set();
        this.__ORIGINAL_PUSH__ = window[this.chunkName].push;
        Object.defineProperty(window[this.chunkName], "push", {
            configurable: true,
            get: ()=>this.handlePush,
            set: (newPush)=>{
                this.__ORIGINAL_PUSH__ = newPush;
                Object.defineProperty(window[this.chunkName], "push", {
                    value: this.handlePush,
                    configurable: true,
                    writable: true
                });
            }
        });
    }
    /**
   * Adds a listener for when discord loaded a chunk. Useful for subscribing to lazy loaded modules.
   * @param {Function} listener - Function to subscribe for chunks
   * @returns {Function} A cancelling function
   */ static addListener(listener) {
        this.listeners.add(listener);
        return this.removeListener.bind(this, listener);
    }
    /**
   * Removes a listener for when discord loaded a chunk.
   * @param {Function} listener
   * @returns {boolean}
   */ static removeListener(listener) {
        return this.listeners.delete(listener);
    }
    static handlePush(chunk) {
        const [, modules] = chunk;
        for(const moduleId in modules){
            const originalModule = modules[moduleId];
            modules[moduleId] = (module, exports, require)=>{
                try {
                    Reflect.apply(originalModule, null, [
                        module,
                        exports,
                        require
                    ]);
                    const listeners = [
                        ...this.listeners
                    ];
                    for(let i = 0; i < listeners.length; i++){
                        try {
                            listeners[i](exports, originalModule, moduleId);
                        } catch (error) {
                            Logger.err("WebpackModules", "Could not fire callback listener:", error);
                        }
                    }
                } catch (error) {
                    Logger.stacktrace("WebpackModules", "Error patching chunked module push", error);
                }
            };
            Object.assign(modules[moduleId], originalModule, {
                toString: ()=>originalModule.toString()
            });
        }
        return Reflect.apply(this.__ORIGINAL_PUSH__, window[this.chunkName], [
            chunk, 
        ]);
    }
};
WebpackModules.initialize();

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/colorconverter.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with colors.
 * @module ColorConverter
 */ 
const DiscordColorUtils = WebpackModules.getByProps("getDarkness", "isValidHex");
class ColorConverter {
    static getDarkness(color) {
        return DiscordColorUtils.getDarkness(color);
    }
    static hex2int(color) {
        return DiscordColorUtils.hex2int(color);
    }
    static hex2rgb(color) {
        return DiscordColorUtils.hex2rgb(color);
    }
    static int2hex(color) {
        return DiscordColorUtils.int2hex(color);
    }
    static int2rgba(color, alpha) {
        return DiscordColorUtils.int2rgba(color, alpha);
    }
    static isValidHex(color) {
        return DiscordColorUtils.isValidHex(color);
    }
    /**
   * Will get the red green and blue values of any color string.
   * @param {string} color - the color to obtain the red, green and blue values of. Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @returns {array} - array containing the red, green, and blue values
   */ static getRGB(color) {
        let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
        if (result) return [
            parseInt(result[1]),
            parseInt(result[2]),
            parseInt(result[3])
        ];
        result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
        if (result) return [
            parseFloat(result[1]) * 2.55,
            parseFloat(result[2]) * 2.55,
            parseFloat(result[3]) * 2.55, 
        ];
        result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
        if (result) return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16), 
        ];
        result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
        if (result) return [
            parseInt(result[1] + result[1], 16),
            parseInt(result[2] + result[2], 16),
            parseInt(result[3] + result[3], 16), 
        ];
    }
    /**
   * Will get the darken the color by a certain percent
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} percent - percent to darken the color by (0-100)
   * @returns {string} - new color in rgb format
   */ static darkenColor(color, percent) {
        const rgb = this.getRGB(color);
        for(let i = 0; i < rgb.length; i++)rgb[i] = Math.round(Math.max(0, rgb[i] - rgb[i] * (percent / 100)));
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    }
    /**
   * Will get the lighten the color by a certain percent
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} percent - percent to lighten the color by (0-100)
   * @returns {string} - new color in rgb format
   */ static lightenColor(color, percent) {
        const rgb = this.getRGB(color);
        for(let i = 0; i < rgb.length; i++)rgb[i] = Math.round(Math.min(255, rgb[i] + rgb[i] * (percent / 100)));
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    }
    /**
   * Converts a color to rgba format string
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} alpha - alpha level for the new color
   * @returns {string} - new color in rgb format
   */ static rgbToAlpha(color, alpha) {
        const rgb = this.getRGB(color);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/screen.ts
//@ts-nocheck
/**
 * Representation of the screen such as width and height.
 * @deprecated 1/21/22 Use DOMTools
 */ class Screen {
    /** Document/window width */ static get width() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    /** Document/window height */ static get height() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
}
/* harmony default export */ const screen = (Screen);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/selector.ts
//@ts-nocheck
/** 
 * Representation of a Selector
 * @memberof module:DOMTools
 **/ class Selector {
    /**
     * 
     * @param {string} classname - class to create selector for
     */ constructor(className){
        this.value = " ." + className.split(" ").join(".");
    }
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */ toString() {
        return this.value;
    }
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */ valueOf() {
        return this.value;
    }
    selector(symbol, other) {
        this.value = `${this.toString()} ${symbol} ${other.toString()}`;
        return this;
    }
    /**
     * Adds another selector as a direct child `>` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as child
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ child(other) {
        return this.selector(">", other);
    }
    /**
     * Adds another selector as a adjacent sibling `+` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as adjacent sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ adjacent(other) {
        return this.selector("+", other);
    }
    /**
     * Adds another selector as a general sibling `~` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ sibling(other) {
        return this.selector("~", other);
    }
    /**
     * Adds another selector as a descendent `(space)` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as descendent
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ descend(other) {
        return this.selector(" ", other);
    }
    /**
     * Adds another selector to this one via `,`.
     * @param {string|DOMTools.Selector} other - Selector to add
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ and(other) {
        return this.selector(",", other);
    }
}
/* harmony default export */ const selector = (Selector);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/classname.ts
//@ts-nocheck

/** 
 * Representation of a Class Name
 * @memberof module:DOMTools
 **/ class ClassName {
    /**
     * 
     * @param {string} name - name of the class to represent
     */ constructor(name){
        this.value = name;
    }
    /**
     * Concatenates new class names to the current one using spaces.
     * @param {string} classNames - list of class names to add to this class name
     * @returns {ClassName} returns self to allow chaining
     */ add(...classNames) {
        for(let i = 0; i < classNames.length; i++)this.value += " " + classNames[i];
        return this;
    }
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */ toString() {
        return this.value;
    }
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */ valueOf() {
        return this.value;
    }
    /**
     * Returns the classname represented as {@link module:DOMTools.Selector}.
     * @returns {Selector} selector representation of this class name.
     */ get selector() {
        return new selector(this.value);
    }
    get single() {
        return this.value.split(" ")[0];
    }
    get first() {
        return this.value.split(" ")[0];
    }
}
/* harmony default export */ const classname = (ClassName);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/observer.ts
//@ts-nocheck
/**
 * BetterDiscord Client DOM Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
/* eslint-disable operator-linebreak */ /**
 * Representation of a MutationObserver but with helpful utilities.
 * @memberof module:DOMTools
 **/ class DOMObserver {
    constructor(root, options){
        this.observe = this.observe.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.observerCallback = this.observerCallback.bind(this);
        this.active = false;
        this.root = root || document.getElementById("app-mount");
        this.options = options || {
            attributes: true,
            childList: true,
            subtree: true
        };
        this.observer = new MutationObserver(this.observerCallback);
        this.observe();
    }
    observerCallback(mutations) {
        for (const sub of Array.from(this.subscriptions)){
            try {
                const filteredMutations = sub.filter ? mutations.filter(sub.filter) : mutations;
                if (sub.group) {
                    if (!filteredMutations.length) continue;
                    sub.callback.call(sub.bind || sub, filteredMutations);
                } else {
                    for (const mutation of filteredMutations)sub.callback.call(sub.bind || sub, mutation);
                }
            } catch (err) {
                Logger.stacktrace("DOMObserver", "Error in observer callback", err);
            }
        }
    }
    /**
   * Starts observing the element. This will be called when attaching a callback.
   * You don't need to call this manually.
   */ observe() {
        if (this.active) return;
        this.observer.observe(this.root, this.options);
        this.active = true;
    }
    /**
   * Disconnects this observer. This stops callbacks being called, but does not unbind them.
   * You probably want to use observer.unsubscribeAll instead.
   */ disconnect() {
        if (!this.active) return;
        this.observer.disconnect();
        this.active = false;
    }
    reconnect() {
        if (this.active) {
            this.disconnect();
            this.observe();
        }
    }
    get root() {
        return this._root;
    }
    set root(root) {
        this._root = root;
        this.reconnect();
    }
    get options() {
        return this._options;
    }
    set options(options) {
        this._options = options;
        this.reconnect();
    }
    get subscriptions() {
        return this._subscriptions || (this._subscriptions = []);
    }
    /**
   * Subscribes to mutations.
   * @param {Function} callback A function to call when on a mutation
   * @param {Function} filter A function to call to filter mutations
   * @param {Any} bind Something to bind the callback to
   * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
   * @return {Object}
   */ subscribe(callback, filter, bind, group) {
        const subscription = {
            callback,
            filter,
            bind,
            group
        };
        this.subscriptions.push(subscription);
        this.observe();
        return subscription;
    }
    /**
   * Removes a subscription and disconnect if there are none left.
   * @param {Object} subscription A subscription object returned by observer.subscribe
   */ unsubscribe(subscription) {
        if (!this.subscriptions.includes(subscription)) subscription = this.subscriptions.find((s)=>s.callback === subscription);
        Utilities.removeFromArray(this.subscriptions, subscription);
        if (!this.subscriptions.length) this.disconnect();
    }
    unsubscribeAll() {
        this.subscriptions.splice(0, this.subscriptions.length);
        this.disconnect();
    }
    /**
   * Subscribes to mutations that affect an element matching a selector.
   * @param {Function} callback A function to call when on a mutation
   * @param {Function} filter A function to call to filter mutations
   * @param {Any} bind Something to bind the callback to
   * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
   * @return {Object}
   */ subscribeToQuerySelector(callback, selector, bind, group) {
        return this.subscribe(callback, (mutation)=>{
            return mutation.target.matches(selector) || Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)) // Or if either an added or removed node
            .find((n)=>n instanceof Element && (n.matches(selector) || n.querySelector(selector))); // match or contain an element matching the selector
        }, bind, group);
    }
}
/* harmony default export */ const observer = (DOMObserver);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/listenable.ts
//@ts-nocheck
/**
 * Acts as an interface for anything that should be listenable.
 */ class Listenable {
    constructor(){
        this.listeners = [];
    }
    /**
   * Adds a listener to the current object.
   * @param {callable} callback - callback for when the event occurs
   * @returns {callable} - a way to cancel the listener without needing to call `removeListener`
   */ addListener(callback) {
        if (typeof callback !== "function") return;
        this.listeners.push(callback);
        return ()=>{
            this.listeners.splice(this.listeners.indexOf(callback), 1);
        };
    }
    /**
   * Removes a listener from the current object.
   * @param {callable} callback - callback that was originally registered
   */ removeListener(callback) {
        if (typeof callback !== "function") return;
        this.listeners.splice(this.listeners.indexOf(callback), 1);
    }
    /**
   * Alerts the listeners that an event occurred. Data passed is optional
   * @param {*} [...data] - Any data desired to be passed to listeners
   */ alertListeners(...data) {
        for(let l = 0; l < this.listeners.length; l++)this.listeners[l](...data);
    }
}
/* harmony default export */ const listenable = (Listenable);

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordclassmodules.ts
//@ts-nocheck


/**
 * A large list of known and labelled classes in discord.
 * Click the source link down below to view more info. Otherwise, if you
 * have the library installed or have a plugin using this library,
 * do `Object.keys(ZLibrary.DiscordClassModules)` in console for a list of modules.
 *
 * You can use this directly, however the preferred way of doing this is to use {@link module:DiscordClasses} or {@link module:DiscordSelectors}
 *
 * @see module:DiscordClasses
 * @see module:DiscordSelectors
 * @module DiscordClassModules
 */ /* harmony default export */ const discordclassmodules = (Utilities.memoizeObject({
    get ContextMenu () {
        return WebpackModules.getByProps("menu", "item");
    },
    get Scrollers () {
        return WebpackModules.getByProps("scrollerWrap", "scrollerThemed", "scrollerTrack");
    },
    get AccountDetails () {
        return WebpackModules.getByProps("container", "avatar", "hasBuildOverride");
    },
    get Typing () {
        return WebpackModules.getByProps("typing", "text");
    },
    get UserPopout () {
        return WebpackModules.getByProps("userPopout");
    },
    get PopoutRoles () {
        return WebpackModules.getByProps("roleCircle");
    },
    get UserModal () {
        return WebpackModules.getByProps("profileBadge");
    },
    get Textarea () {
        return WebpackModules.getByProps("channelTextArea", "textArea");
    },
    get Popouts () {
        return WebpackModules.getByProps("popouts", "popout");
    },
    get App () {
        return WebpackModules.getByProps("app", "mobileApp");
    },
    get Titles () {
        return WebpackModules.getByProps("defaultMarginh5");
    },
    get Notices () {
        return WebpackModules.getByProps("notice", "colorInfo");
    },
    get Backdrop () {
        return WebpackModules.getByProps("backdrop");
    },
    get Modals () {
        return WebpackModules.getModule((m)=>m.modal && m.inner && !m.header);
    },
    get AuditLog () {
        return WebpackModules.getByProps("userHook");
    },
    get ChannelList () {
        return Object.assign({}, WebpackModules.getByProps("containerDefault"), WebpackModules.getByProps("name", "unread"), WebpackModules.getByProps("sidebar", "hasNotice"));
    },
    get MemberList () {
        return Object.assign({}, WebpackModules.getByProps("member", "memberInner"), WebpackModules.getByProps("members", "membersWrap"));
    },
    get TitleWrap () {
        return WebpackModules.getByProps("titleWrapper");
    },
    get Titlebar () {
        return WebpackModules.getByProps("titleBar");
    },
    get Embeds () {
        return WebpackModules.getByProps("embed", "embedAuthor");
    },
    get Layers () {
        return WebpackModules.getByProps("layers", "layer");
    },
    get TooltipLayers () {
        return WebpackModules.getByProps("layerContainer", "layer");
    },
    get Margins () {
        return WebpackModules.getModule((m)=>!m.title && m.marginBottom40 && m.marginTop40);
    },
    get Dividers () {
        return Object.assign({}, WebpackModules.getByProps("dividerDefault"), WebpackModules.getModule((m)=>Object.keys(m).length == 1 && m.divider));
    },
    get Changelog () {
        return Object.assign({}, WebpackModules.getByProps("container", "added"), WebpackModules.getByProps("content", "modal", "size"));
    },
    get BasicInputs () {
        return WebpackModules.getByProps("inputDefault", "copyInput");
    },
    get Messages () {
        return WebpackModules.getByProps("message", "containerCozy");
    },
    get Guilds () {
        return WebpackModules.getByProps("guildsWrapper");
    },
    get EmojiPicker () {
        return WebpackModules.getByProps("emojiPicker", "emojiItem");
    },
    get Reactions () {
        return WebpackModules.getByProps("reaction", "reactionInner");
    },
    get Checkbox () {
        return WebpackModules.getByProps("checkbox", "checkboxInner");
    },
    get Tooltips () {
        return WebpackModules.getByProps("tooltip", "tooltipBlack");
    }
}));

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordclasses.ts
//@ts-nocheck


const getRaw = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop];
};
const getClass = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop].split(" ")[0];
};
/**
 * Proxy for all the class packages, allows us to safely attempt
 * to retrieve nested things without error. Also wraps the class in
 * {@link module:DOMTools.ClassName} which adds features but can still
 * be used in native function.
 *
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 *
 * @see module:DiscordClassModules
 * @module DiscordClasses
 */ const DiscordModules = new Proxy(discordclassmodules, {
    get: function(list, item) {
        if (item == "getRaw" || item == "getClass") return (module, prop)=>DiscordModules[module][item]([
                prop
            ]);
        if (list[item] === undefined) return new Proxy({}, {
            get: function() {
                return "";
            }
        });
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getRaw") return getRaw.bind(obj);
                if (prop == "getClass") return getClass.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new DOMTools.ClassName(obj[prop]);
            }
        });
    }
});
/* harmony default export */ const discordclasses = (DiscordModules);

;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/settings.css
const settings_namespaceObject = ".plugin-input-group {\n    margin-top: 5px;\n}\n\n.plugin-input-group .button-collapse {\n    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSItOTUwIDUzMiAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtOTUwIDUzMiAxOCAxODsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTt9DQoJLnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjEuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTS05MzIsNTMydjE4aC0xOHYtMThILTkzMnoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QxIiBwb2ludHM9Ii05MzYuNiw1MzguOCAtOTQxLDU0My4yIC05NDUuNCw1MzguOCAiLz4NCjwvc3ZnPg0K);\n    height: 16px;\n    width: 16px;\n    display: inline-block;\n    vertical-align: bottom;\n    transition: transform .3s ease;\n    transform: rotate(0);\n}\n\n.plugin-input-group .button-collapse.collapsed {\n    transition: transform .3s ease;\n    transform: rotate(-90deg);\n}\n\n.plugin-input-group h2 {\n    font-size: 14px;\n}\n\n.plugin-input-group .plugin-input-group h2 {\n    margin-left: 16px;\n}\n\n.plugin-inputs {\n    height: auto;\n    overflow: hidden;\n    transition: height 300ms cubic-bezier(0.47, 0, 0.745, 0.715);\n}\n\n.plugin-inputs.collapsed {\n    height: 0px;\n}\n\n.file-input {\n\n}\n\n.file-input::-webkit-file-upload-button {\n    color: white;\n    background: #7289DA;\n    outline: 0;\n    border: 0;\n    padding: 10px;\n    vertical-align: top;\n    margin-top: -10px;\n    margin-left: -10px;\n    border-radius: 3px 0 0 3px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;\n    cursor: pointer;\n}\n\n.color-input {\n    background: none;\n    padding: 0;\n    border: none;\n}\n\n.color-input:hover {\n    opacity: 0.8;\n}\n";
;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settingfield.ts
//@ts-nocheck


const AccessibilityProvider = WebpackModules.getByProps("AccessibilityPreferencesContext").AccessibilityPreferencesContext.Provider;
const LayerProvider = WebpackModules.getByProps("AppReferencePositionLayer").AppLayerProvider().props.layerContext.Provider; // eslint-disable-line new-cap
/**
 * Setting field to extend to create new settings
 * @memberof module:Settings
 */ class SettingField extends listenable {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {callable} onChange - callback to perform on setting change
   * @param {(ReactComponent|HTMLElement)} settingtype - actual setting to render
   * @param {object} [props] - object of props to give to the setting and the settingtype
   * @param {boolean} [props.noteOnTop=false] - determines if the note should be shown above the element or not.
   */ constructor(name, note, onChange, settingtype, props = {}){
        super();
        this.name = name;
        this.note = note;
        if (typeof onChange == "function") this.addListener(onChange);
        this.inputWrapper = DOMTools.parseHTML(`<div class="plugin-input-container"></div>`);
        this.type = typeof settingtype == "function" ? settingtype : ReactTools.wrapElement(settingtype);
        this.props = props;
        DOMTools.onAdded(this.getElement(), ()=>{
            this.onAdded();
        });
        DOMTools.onRemoved(this.getElement(), ()=>{
            this.onRemoved();
        });
    }
    /** @returns {HTMLElement} - root element for setting */ getElement() {
        return this.inputWrapper;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
    /** Fired when root node added to DOM */ onAdded() {
        const reactElement = discordmodules.ReactDOM.render(discordmodules.React.createElement(ReactSetting, Object.assign({
            title: this.name,
            type: this.type,
            note: this.note
        }, this.props)), this.getElement());
        if (this.props.onChange) reactElement.props.onChange = this.props.onChange(reactElement);
        reactElement.forceUpdate();
    }
    /** Fired when root node removed from DOM */ onRemoved() {
        discordmodules.ReactDOM.unmountComponentAtNode(this.getElement());
    }
}
/* harmony default export */ const settingfield = (SettingField);
class ReactSetting extends discordmodules.React.Component {
    get noteElement() {
        const className = this.props.noteOnTop ? discordclasses.Margins.marginBottom8 : discordclasses.Margins.marginTop8;
        return discordmodules.React.createElement(discordmodules.SettingsNote, {
            children: this.props.note,
            type: "description",
            className: className.toString()
        });
    }
    get dividerElement() {
        return discordmodules.React.createElement("div", {
            className: discordclasses.Dividers.divider.add(discordclasses.Dividers.dividerDefault).toString()
        });
    }
    render() {
        const ce = discordmodules.React.createElement;
        const SettingElement = ce(this.props.type, this.props);
        const Context = ce(AccessibilityProvider, {
            value: {
                reducedMotion: {
                    enabled: false,
                    rawValue: "no-preference"
                }
            }
        }, ce(LayerProvider, {
            value: [
                document.querySelector("#app-mount > .layerContainer-2v_Sit"), 
            ]
        }, SettingElement));
        if (this.props.inline) {
            const Flex = discordmodules.FlexChild;
            const titleDefault = WebpackModules.getByProps("titleDefault") ? WebpackModules.getByProps("titleDefault").title : "titleDefault-a8-ZSr title-31JmR4 da-titleDefault da-title";
            return ce(Flex, {
                direction: Flex.Direction.VERTICAL
            }, ce(Flex, {
                align: Flex.Align.START
            }, ce(Flex.Child, {
                wrap: !0
            }, ce("div", {
                className: titleDefault
            }, this.props.title)), ce(Flex.Child, {
                grow: 0,
                shrink: 0
            }, Context)), this.noteElement, this.dividerElement);
        }
        return ce(discordmodules.SettingsWrapper, {
            className: discordclasses.Margins.marginBottom20.toString(),
            title: this.props.title,
            children: [
                this.props.noteOnTop ? this.noteElement : Context,
                this.props.noteOnTop ? Context : this.noteElement,
                this.dividerElement, 
            ]
        });
    }
}


;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settinggroup.ts
//@ts-nocheck



/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */ class SettingGroup extends listenable {
    /**
   * @param {string} groupName - title for the group of settings
   * @param {object} [options] - additional options for the group
   * @param {callback} [options.callback] - callback called on settings changed
   * @param {boolean} [options.collapsible=true] - determines if the group should be collapsible
   * @param {boolean} [options.shown=false] - determines if the group should be expanded by default
   */ constructor(groupName, options = {}){
        super();
        const { collapsible =true , shown =false , callback =()=>{}  } = options;
        this.addListener(callback);
        this.onChange = this.onChange.bind(this);
        const collapsed = shown || !collapsible ? "" : "collapsed";
        const group = DOMTools.parseHTML(`<div class="plugin-input-group">
                                            <h2 class="${discordclasses.Titles.h5} ${discordclasses.Titles.defaultMarginh5} ${discordclasses.Titles.defaultColor}">
                                            <span class="button-collapse ${collapsed}"></span> ${groupName}
                                            </h2>
                                            <div class="plugin-inputs collapsible ${collapsed}"></div>
                                            </div>`);
        const label = group.querySelector("h2");
        const controls = group.querySelector(".plugin-inputs");
        this.group = group;
        this.label = label;
        this.controls = controls;
        if (!collapsible) return;
        label.addEventListener("click", async ()=>{
            const button = label.querySelector(".button-collapse");
            const wasCollapsed = button.classList.contains("collapsed");
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > .collapsible:not(.collapsed)").forEach((element)=>{
                element.style.setProperty("height", element.scrollHeight + "px");
                element.classList.add("collapsed");
                setImmediate(()=>{
                    element.style.setProperty("height", "");
                });
            });
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > h2 > .button-collapse").forEach((e)=>e.classList.add("collapsed"));
            if (!wasCollapsed) return;
            controls.style.setProperty("height", controls.scrollHeight + "px");
            controls.classList.remove("collapsed");
            button.classList.remove("collapsed");
            await new Promise((resolve)=>setTimeout(resolve, 300));
            controls.style.setProperty("height", "");
        });
    }
    /** @returns {HTMLElement} - root node for the group. */ getElement() {
        return this.group;
    }
    /**
   * Adds multiple nodes to this group.
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes - list of nodes to add to the group container
   * @returns {module:Settings.SettingGroup} - returns self for chaining
   */ append(...nodes) {
        for(let i = 0; i < nodes.length; i++){
            if (DOMTools.resolveElement(nodes[i]) instanceof Element) this.controls.append(nodes[i]);
            else if (nodes[i] instanceof settingfield || nodes[i] instanceof SettingGroup) this.controls.append(nodes[i].getElement());
            if (nodes[i] instanceof settingfield) {
                nodes[i].addListener(((node)=>(value)=>{
                        this.onChange(node.id || node.name, value);
                    })(nodes[i]));
            } else if (nodes[i] instanceof SettingGroup) {
                nodes[i].addListener(((node)=>(settingId, value)=>{
                        this.onChange(node.id || node.name, settingId, value);
                    })(nodes[i]));
            }
        }
        return this;
    }
    /**
   * Appends this node to another
   * @param {HTMLElement} node - node to attach the group to.
   * @returns {module:Settings.SettingGroup} - returns self for chaining
   */ appendTo(node) {
        node.append(this.group);
        return this;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
}
/* harmony default export */ const settinggroup = (SettingGroup);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settingpanel.ts
//@ts-nocheck




/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */ class SettingPanel extends listenable {
    /**
   * Creates a new settings panel
   * @param {callable} onChange - callback to fire when settings change
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
   */ constructor(onChange, ...nodes){
        super();
        this.element = DOMTools.parseHTML(`<div class="plugin-form-container"></div>`);
        if (typeof onChange == "function") this.addListener(onChange);
        this.onChange = this.onChange.bind(this);
        this.append(...nodes);
    }
    /**
   * Creates a new settings panel
   * @param {callable} onChange - callback to fire when settings change
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
   * @returns {HTMLElement} - root node for the panel.
   */ static build(onChange, ...nodes) {
        return new SettingPanel(onChange, ...nodes).getElement();
    }
    /** @returns {HTMLElement} - root node for the panel. */ getElement() {
        return this.element;
    }
    /**
   * Adds multiple nodes to this panel.
   * @param {(...HTMLElement|...jQuery|...SettingField|...SettingGroup)} nodes - list of nodes to add to the panel container
   * @returns {module:Settings.SettingPanel} - returns self for chaining
   */ append(...nodes) {
        for(let i = 0; i < nodes.length; i++){
            if (DOMTools.resolveElement(nodes[i]) instanceof Element) this.element.append(nodes[i]);
            else if (nodes[i] instanceof settingfield || nodes[i] instanceof settinggroup) this.element.append(nodes[i].getElement());
            if (nodes[i] instanceof settingfield) {
                nodes[i].addListener(((node)=>(value)=>{
                        this.onChange(node.id || node.name, value);
                    })(nodes[i]));
            } else if (nodes[i] instanceof settinggroup) {
                nodes[i].addListener(((node)=>(settingId, value)=>{
                        this.onChange(node.id || node.name, settingId, value);
                    })(nodes[i]));
            }
        }
        return this;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
}
/* harmony default export */ const settingpanel = (SettingPanel);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/textbox.ts
//@ts-nocheck


/**
 * Creates a textbox using discord's built in textbox.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Textbox extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {string} value - current text in box
   * @param {callable} onChange - callback to perform on setting change, callback receives text
   * @param {object} [options] - object of options to give to the setting
   * @param {string} [options.placeholder=""] - placeholder for when textbox is empty
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, value, onChange, options = {}){
        const { placeholder ="" , disabled =false  } = options;
        super(name, note, onChange, discordmodules.Textbox, {
            onChange: (textbox)=>(val)=>{
                    textbox.props.value = val;
                    textbox.forceUpdate();
                    this.onChange(val);
                },
            value: value,
            disabled: disabled,
            placeholder: placeholder || ""
        });
    }
}
/* harmony default export */ const textbox = (Textbox);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/colorpicker.ts
//@ts-nocheck

const React = discordmodules.React;
const Popout = WebpackModules.getByDisplayName("Popout");
const ColorPickerComponents = WebpackModules.getByProps("CustomColorPicker");
const Swatch = ColorPickerComponents?.CustomColorButton.prototype.render.call({
    props: {}
}).type;
const { default: Tooltip , TooltipPositions  } = WebpackModules.getByProps("TooltipContainer");
const LocaleManager = discordmodules.LocaleManager;
class colorpicker_ColorPicker extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value: props.value || 0
        };
        this.onChange = this.onChange.bind(this);
        this.swatchRef = React.createRef();
    }
    get canCustom() {
        return this.props.acceptsCustom || true;
    }
    onChange(value) {
        this.setState({
            value: value
        }, ()=>{
            if (typeof this.props.onChange === "function") this.props.onChange(this.state.value);
        });
    }
    render() {
        const renderPopout = ()=>{
            return React.createElement(ColorPickerComponents.CustomColorPicker, {
                value: this.state.value,
                onChange: this.onChange
            });
        };
        return React.createElement(ColorPickerComponents.default, {
            value: this.state.value,
            onChange: this.onChange,
            colors: this.props.colors,
            renderDefaultButton: (props)=>React.createElement(Tooltip, {
                    position: TooltipPositions.BOTTOM,
                    text: LocaleManager.Messages.DEFAULT
                }, (tooltipProps)=>React.createElement("div", Object.assign(tooltipProps, {
                        className: "defaultButtonWrapper"
                    }), React.createElement(ColorPickerComponents.DefaultColorButton, Object.assign(props, {
                        color: this.props.defaultColor
                    })))),
            renderCustomButton: ()=>React.createElement(Popout, {
                    renderPopout: renderPopout,
                    animation: Popout.Animation.TRANSLATE,
                    align: Popout.Align.CENTER,
                    position: Popout.Positions.BOTTOM
                }, (props)=>React.createElement(Tooltip, {
                        position: TooltipPositions.BOTTOM,
                        text: LocaleManager.Messages.PICK_A_COLOR
                    }, (tooltipProps)=>React.createElement("div", Object.assign({}, tooltipProps, props, {
                            className: "colorPickerButtonWrapper"
                        }), React.createElement(Swatch, {
                            isCustom: true,
                            color: this.state.value,
                            isSelected: !this.props.colors.includes(this.state.value) && this.props.defaultColor !== this.state.value,
                            disabled: !this.canCustom
                        }))))
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/color.ts
//@ts-nocheck



const presetColors = [
    1752220,
    3066993,
    3447003,
    10181046,
    15277667,
    15844367,
    15105570,
    15158332,
    9807270,
    6323595,
    1146986,
    2067276,
    2123412,
    7419530,
    11342935,
    12745742,
    11027200,
    10038562,
    9936031,
    5533306, 
];
/**
 * Creates a color picker using Discord's built in color picker
 * as a base. Input and output using hex strings.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class ColorPicker extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {string} value - current hex color
   * @param {callable} onChange - callback to perform on setting change, callback receives hex string
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {string} [options.defaultColor] - default color to show as large option
   * @param {Array<number>} [options.colors] - preset colors to show in swatch
   */ constructor(name, note, value, onChange, options = {}){
        const ColorPickerComponents = WebpackModules.getByProps("CustomColorPicker");
        if (ColorPickerComponents) {
            const defaultColor = options.defaultColor;
            super(name, note, onChange, colorpicker_ColorPicker, {
                disabled: !!options.disabled,
                onChange: (reactElement)=>(color)=>{
                        reactElement.props.value = color;
                        reactElement.forceUpdate();
                        this.onChange(ColorConverter.int2hex(color));
                    },
                colors: Array.isArray(options.colors) ? options.colors : presetColors,
                defaultColor: defaultColor && typeof defaultColor !== "number" ? ColorConverter.hex2int(defaultColor) : defaultColor,
                value: typeof value == "number" ? value : ColorConverter.hex2int(value),
                customPickerPosition: "right"
            });
        } else {
            const classes = [
                "color-input"
            ];
            if (options.disabled) classes.push(discordclasses.BasicInputs.disabled);
            const ReactColorPicker = DOMTools.parseHTML(`<input type="color" class="${classes.join(" ")}">`);
            if (options.disabled) ReactColorPicker.setAttribute("disabled", "");
            if (value) ReactColorPicker.setAttribute("value", value);
            ReactColorPicker.addEventListener("change", (event)=>{
                this.onChange(event.target.value);
            });
            super(name, note, onChange, ReactColorPicker, {
                inline: true
            });
        }
    }
    /** Default colors for ColorPicker */ static get presetColors() {
        return presetColors;
    }
}
/* harmony default export */ const color = (ColorPicker);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/file.ts
//@ts-nocheck


/**
 * Creates a file picker using chromium's default.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class FilePicker extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {callable} onChange - callback to perform on setting change, callback receives File object
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {Array<string>|string} [options.accept] - what file types should be accepted
   * @param {boolean} [options.multiple=false] - should multiple files be accepted
   */ constructor(name, note, onChange, options = {}){
        const classes = discordclasses.BasicInputs.inputDefault.add("file-input");
        if (options.disabled) classes.add(discordclasses.BasicInputs.disabled);
        const ReactFilePicker = DOMTools.parseHTML(`<input type="file" class="${classes}">`);
        if (options.disabled) ReactFilePicker.setAttribute("disabled", "");
        if (options.multiple) ReactFilePicker.setAttribute("multiple", "");
        if (options.accept) ReactFilePicker.setAttribute("accept", Array.isArray(options.accept) ? options.accept.join(",") : options.accept);
        ReactFilePicker.addEventListener("change", (event)=>{
            this.onChange(event.target.files[0]);
        });
        super(name, note, onChange, ReactFilePicker);
    }
}
/* harmony default export */ const file = (FilePicker);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/slider.ts
//@ts-nocheck


/**
 * Used to render the marker.
 * @param {Number} value - The value to render
 * @returns {string} the text to show in the marker
 * @callback module:Settings~SliderMarkerValue
 */ /**
 * Used to render the grabber tooltip.
 * @param {Number} value - The value to render
 * @returns {string} the text to show in the tooltip
 * @callback module:Settings~SliderRenderValue
 */ /**
 * Creates a slider/range using discord's built in slider.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Slider extends settingfield {
    /**
   *
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {number} min - minimum value allowed
   * @param {number} max - maximum value allowed
   * @param {number} value - currently selected value
   * @param {callable} onChange - callback to fire when setting is changed, callback receives number
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {object} [options.fillStyles] - object of css styles to add to active slider
   * @param {number} [options.defaultValue] - value highlighted as default
   * @param {number} [options.keyboardStep] - step moved when using arrow keys
   * @param {Array<number>} [options.markers] - array of vertical markers to show on the slider
   * @param {boolean} [options.stickToMarkers] - should the slider be forced to use markers
   * @param {boolean} [options.equidistant] - should the markers be scaled to be equidistant
   * @param {module:Settings~SliderMarkerValue} [options.onMarkerRender] - function to call to render the value in the marker
   * @param {module:Settings~SliderMarkerValue} [options.renderMarker] - alias of `onMarkerRender`
   * @param {module:Settings~SliderRenderValue} [options.onValueRender] - function to call to render the value in the tooltip
   * @param {module:Settings~SliderRenderValue} [options.renderValue] - alias of `onValueRender`
   * @param {string} [options.units] - can be used in place of `onValueRender` will use this string and render Math.round(value) + units
   */ constructor(name, note, min, max, value, onChange, options = {}){
        const props = {
            onChange: (_)=>_,
            initialValue: value,
            disabled: !!options.disabled,
            minValue: min,
            maxValue: max,
            handleSize: 10
        };
        if (options.fillStyles) props.fillStyles = options.fillStyles;
        if (typeof options.defaultValue !== "undefined") props.defaultValue = options.defaultValue;
        if (options.keyboardStep) props.keyboardStep = options.keyboardStep;
        if (options.markers) props.markers = options.markers;
        if (options.stickToMarkers) props.stickToMarkers = options.stickToMarkers;
        if (typeof options.equidistant != "undefined") props.equidistant = options.equidistant;
        if (options.units) {
            const renderValueLabel = (val)=>`${Math.round(val)}${options.units}`;
            props.onMarkerRender = renderValueLabel;
            props.onValueRender = renderValueLabel;
        }
        if (options.onMarkerRender || options.renderMarker) props.onMarkerRender = options.onMarkerRender || options.renderMarker;
        if (options.onValueRender || options.renderValue) props.onValueRender = options.onValueRender || options.renderValue;
        super(name, note, onChange, discordmodules.Slider, Object.assign(props, {
            onValueChange: (v)=>this.onChange(v)
        }));
    }
}
/* harmony default export */ const slider = (Slider);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/switch.ts
//@ts-nocheck


class SwitchWrapper extends discordmodules.React.Component {
    constructor(props){
        super(props);
        this.state = {
            enabled: this.props.value
        };
    }
    render() {
        return discordmodules.React.createElement(discordmodules.SwitchRow, Object.assign({}, this.props, {
            value: this.state.enabled,
            onChange: (e)=>{
                this.props.onChange(e);
                this.setState({
                    enabled: e
                });
            }
        }));
    }
}
/**
 * Creates a switch using discord's built in switch.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Switch extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {boolean} isChecked - should switch be checked
   * @param {callable} onChange - callback to perform on setting change, callback receives boolean
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, isChecked, onChange, options = {}){
        super(name, note, onChange);
        this.disabled = !!options.disabled;
        this.value = !!isChecked;
    }
    onAdded() {
        discordmodules.ReactDOM.render(discordmodules.React.createElement(SwitchWrapper, {
            children: this.name,
            note: this.note,
            disabled: this.disabled,
            hideBorder: false,
            value: this.value,
            onChange: (e)=>{
                this.onChange(e);
            }
        }), this.getElement());
    }
}
/* harmony default export */ const types_switch = (Switch);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/dropdown.ts
//@ts-nocheck


/**
 * @interface
 * @name module:Settings~DropdownItem
 * @property {string} label - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 */ /**
 * Creates a dropdown using discord's built in dropdown.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Dropdown extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {*} defaultValue - currently selected value
   * @param {Array<module:Settings~DropdownItem>} values - array of all options available
   * @param {callable} onChange - callback to perform on setting change, callback item value
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.clearable=false] - should be able to empty the field value
   * @param {boolean} [options.searchable=false] - should user be able to search the dropdown
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, defaultValue, values, onChange, options = {}){
        const { clearable =false , searchable =false , disabled =false  } = options;
        super(name, note, onChange, discordmodules.Dropdown, {
            clearable: clearable,
            searchable: searchable,
            disabled: disabled,
            options: values,
            onChange: (dropdown)=>(value)=>{
                    dropdown.props.value = value;
                    dropdown.forceUpdate();
                    this.onChange(value);
                },
            value: defaultValue
        });
    }
}
/* harmony default export */ const dropdown = (Dropdown);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/keybind.ts
//@ts-nocheck


/**
 * Creates a keybind setting using discord's built in keybind recorder.
 * @memberof module:Settings=
 * @extends module:Settings.SettingField
 */ class Keybind extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {Array<number>} value - array of keycodes
   * @param {callable} onChange - callback to perform on setting change, callback receives array of keycodes
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(label, help, value, onChange, options = {}){
        const { disabled =false  } = options;
        super(label, help, onChange, discordmodules.Keybind, {
            disabled: disabled,
            defaultValue: value.map((a)=>[
                    0,
                    a || 0,
                    1
                ]),
            onChange: (element)=>(val)=>{
                    if (!Array.isArray(val)) return;
                    element.props.value = val;
                    this.onChange(val.map((a)=>a[1]));
                }
        });
    }
}
/* harmony default export */ const keybind = (Keybind);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/radiogroup.ts
//@ts-nocheck


/**
 * @interface
 * @name module:Settings~RadioItem
 * @property {string} name - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 * @property {string} desc - description/help text to show below name
 * @property {string} color - hex string to color the item
 */ /**
 * Creates a radio group using discord's built in radios.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class RadioGroup extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {*} defaultValue - currently selected value
   * @param {Array<module:Settings~RadioItem>} values - array of all options available
   * @param {callable} onChange - callback to perform on setting change, callback item value
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, defaultValue, values, onChange, options = {}){
        super(name, note, onChange, discordmodules.RadioGroup, {
            noteOnTop: true,
            disabled: !!options.disabled,
            options: values,
            onChange: (reactElement)=>(option)=>{
                    reactElement.props.value = option.value;
                    reactElement.forceUpdate();
                    this.onChange(option.value);
                },
            value: defaultValue
        });
    }
}
/* harmony default export */ const radiogroup = (RadioGroup);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/index.ts
/**
 * An object that makes generating settings panel 10x easier.
 * @module Settings
 */ 













;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/error.ts
/**
 * Error Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function error(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/info.ts
/**
 * Info Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function info(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/success.ts
/**
 * Success Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function success(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/warning.ts
/**
 * Warning Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function warning(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons.ts





;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/tooltip.ts
//@ts-nocheck
/**
 * Tooltip that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a MutationObserver.
 *
 * Note this is not using Discord's internals but normal DOM manipulation and emulates
 * Discord's own tooltips as closely as possible.
 *
 * @module Tooltip
 */ 
const tooltip_getClass = function(sideOrColor) {
    const upperCase = sideOrColor[0].toUpperCase() + sideOrColor.slice(1);
    const tooltipClass = discordclasses.Tooltips[`tooltip${upperCase}`];
    if (tooltipClass) return tooltipClass.value;
    return null;
};
const classExists = function(sideOrColor) {
    return !!tooltip_getClass(sideOrColor);
};
const toPx = function(value) {
    return `${value}px`;
};
/* <div class="layer-v9HyYc da-layer" style="left: 234.5px; bottom: 51px;">
    <div class="tooltip-2QfLtc da-tooltip tooltipTop-XDDSxx tooltipBlack-PPG47z">
        <div class="tooltipPointer-3ZfirK da-tooltipPointer"></div>
        User Settings
    </div>
</div> */ class tooltip_Tooltip {
    /**
   *
   * @constructor
   * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
   * @param {string} tip - string to show in the tooltip
   * @param {object} options - additional options for the tooltip
   * @param {string} [options.style=black] - correlates to the discord styling/colors (black, brand, green, grey, red, yellow)
   * @param {string} [options.side=top] - can be any of top, right, bottom, left
   * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
   * @param {boolean} [options.isTimestamp=false] - adds the timestampTooltip class (disables text wrapping)
   * @param {boolean} [options.disablePointerEvents=false] - disables pointer events
   * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
   */ constructor(node, text, options = {}){
        const { style ="black" , side ="top" , preventFlip =false , isTimestamp =false , disablePointerEvents =false , disabled =false ,  } = options;
        this.node = DOMTools.resolveElement(node);
        this.label = text;
        this.style = style.toLowerCase();
        this.side = side.toLowerCase();
        this.preventFlip = preventFlip;
        this.isTimestamp = isTimestamp;
        this.disablePointerEvents = disablePointerEvents;
        this.disabled = disabled;
        this.active = false;
        if (!classExists(this.side)) return Logger.err("Tooltip", `Side ${this.side} does not exist.`);
        if (!classExists(this.style)) return Logger.err("Tooltip", `Style ${this.style} does not exist.`);
        this.element = DOMTools.createElement(`<div class="${discordclasses.TooltipLayers.layer}">`);
        this.tooltipElement = DOMTools.createElement(`<div class="${discordclasses.Tooltips.tooltip} ${tooltip_getClass(this.style)}"><div class="${discordclasses.Tooltips.tooltipPointer}"></div><div class="${discordclasses.Tooltips.tooltipContent}">${this.label}</div></div>`);
        this.labelElement = this.tooltipElement.childNodes[1];
        this.element.append(this.tooltipElement);
        if (this.disablePointerEvents) {
            this.element.classList.add(discordclasses.TooltipLayers.disabledPointerEvents);
            this.tooltipElement.classList.add(discordclasses.Tooltips.tooltipDisablePointerEvents);
        }
        if (this.isTimestamp) this.tooltipElement.classList.add(WebpackModules.getByProps("timestampTooltip").timestampTooltip);
        this.node.addEventListener("mouseenter", ()=>{
            if (this.disabled) return;
            this.show();
        });
        this.node.addEventListener("mouseleave", ()=>{
            this.hide();
        });
    }
    /** Alias for the constructor */ static create(node, text, options = {}) {
        return new tooltip_Tooltip(node, text, options);
    }
    /** Container where the tooltip will be appended. */ get container() {
        return document.querySelector(discordselectors.App.app.sibling(discordselectors.TooltipLayers.layerContainer));
    }
    /** Boolean representing if the tooltip will fit on screen above the element */ get canShowAbove() {
        return this.node.getBoundingClientRect().top - this.element.offsetHeight >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen below the element */ get canShowBelow() {
        return this.node.getBoundingClientRect().top + this.node.offsetHeight + this.element.offsetHeight <= DOMTools.screenHeight;
    }
    /** Boolean representing if the tooltip will fit on screen to the left of the element */ get canShowLeft() {
        return this.node.getBoundingClientRect().left - this.element.offsetWidth >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen to the right of the element */ get canShowRight() {
        return this.node.getBoundingClientRect().left + this.node.offsetWidth + this.element.offsetWidth <= DOMTools.screenWidth;
    }
    /** Hides the tooltip. Automatically called on mouseleave. */ hide() {
        /** Don't rehide if already inactive */ if (!this.active) return;
        this.active = false;
        this.element.remove();
        this.tooltipElement.className = this._className;
    }
    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */ show() {
        /** Don't reshow if already active */ if (this.active) return;
        this.active = true;
        this.tooltipElement.className = `${discordclasses.Tooltips.tooltip} ${tooltip_getClass(this.style)}`;
        if (this.disablePointerEvents) this.tooltipElement.classList.add(discordclasses.Tooltips.tooltipDisablePointerEvents);
        if (this.isTimestamp) this.tooltipElement.classList.add(WebpackModules.getByProps("timestampTooltip").timestampTooltip);
        this.labelElement.textContent = this.label;
        this.container.append(this.element);
        if (this.side == "top") {
            if (this.canShowAbove || !this.canShowAbove && this.preventFlip) this.showAbove();
            else this.showBelow();
        }
        if (this.side == "bottom") {
            if (this.canShowBelow || !this.canShowBelow && this.preventFlip) this.showBelow();
            else this.showAbove();
        }
        if (this.side == "left") {
            if (this.canShowLeft || !this.canShowLeft && this.preventFlip) this.showLeft();
            else this.showRight();
        }
        if (this.side == "right") {
            if (this.canShowRight || !this.canShowRight && this.preventFlip) this.showRight();
            else this.showLeft();
        }
        /** Do not create a new observer each time if one already exists! */ if (this.observer) return;
        /** Use an observer in show otherwise you'll cause unclosable tooltips */ this.observer = new MutationObserver((mutations)=>{
            mutations.forEach((mutation)=>{
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(this.node) > -1;
                const parentMatch = nodes.some((parent)=>parent.contains(this.node));
                if (directMatch || parentMatch) {
                    this.hide();
                    this.observer.disconnect();
                }
            });
        });
        this.observer.observe(document.body, {
            subtree: true,
            childList: true
        });
    }
    /** Force showing the tooltip above the node. */ showAbove() {
        this.tooltipElement.classList.add(tooltip_getClass("top"));
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top - this.element.offsetHeight - 10));
        this.centerHorizontally();
    }
    /** Force showing the tooltip below the node. */ showBelow() {
        this.tooltipElement.classList.add(tooltip_getClass("bottom"));
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top + this.node.offsetHeight + 10));
        this.centerHorizontally();
    }
    /** Force showing the tooltip to the left of the node. */ showLeft() {
        this.tooltipElement.classList.add(tooltip_getClass("left"));
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left - this.element.offsetWidth - 10));
        this.centerVertically();
    }
    /** Force showing the tooltip to the right of the node. */ showRight() {
        this.tooltipElement.classList.add(tooltip_getClass("right"));
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left + this.node.offsetWidth + 10));
        this.centerVertically();
    }
    centerHorizontally() {
        const nodecenter = this.node.getBoundingClientRect().left + this.node.offsetWidth / 2;
        this.element.style.setProperty("left", toPx(nodecenter - this.element.offsetWidth / 2));
    }
    centerVertically() {
        const nodecenter = this.node.getBoundingClientRect().top + this.node.offsetHeight / 2;
        this.element.style.setProperty("top", toPx(nodecenter - this.element.offsetHeight / 2));
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/toasts.css
const toasts_namespaceObject = ".toasts {\n    position: fixed;\n    display: flex;\n    top: 0;\n    flex-direction: column;\n    align-items: center;\n    justify-content: flex-end;\n    pointer-events: none;\n    z-index: 4000;\n}\n\n@keyframes toast-up {\n    from {\n        transform: translateY(0);\n        opacity: 0;\n    }\n}\n\n.toast {\n    animation: toast-up 300ms ease;\n    transform: translateY(-10px);\n    background: #36393F;\n    padding: 10px;\n    border-radius: 5px;\n    box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2);\n    font-weight: 500;\n    color: #fff;\n    user-select: text;\n    font-size: 14px;\n    opacity: 1;\n    margin-top: 10px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n@keyframes toast-down {\n    to {\n        transform: translateY(0px);\n        opacity: 0;\n    }\n}\n\n.toast.closing {\n    animation: toast-down 200ms ease;\n    animation-fill-mode: forwards;\n    opacity: 1;\n    transform: translateY(-10px);\n}\n\n.toast.toast-info {\n    background-color: #4a90e2;\n}\n\n.toast.toast-success {\n    background-color: #43b581;\n}\n\n.toast.toast-danger,\n.toast.toast-error {\n    background-color: #f04747;\n}\n\n.toast.toast-warning,\n.toast.toast-warn {\n    background-color: #FFA600;\n}\n\n.toast-icon {\n    margin-right: 5px;\n    fill: white;\n    border-radius: 50%;\n    overflow: hidden;\n    height: 20px;\n    width: 20px;\n}\n\n.toast-text {\n    line-height: 20px;\n}";
;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/toasts.ts
//@ts-nocheck
/**
 * Toast maker similar to Android.
 *
 * @module Toasts
 */ 


class Toast {
    /** Shorthand for `type = "success"` for {@link module:Toasts.show} */ static async success(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "success"
        }));
    }
    /** Shorthand for `type = "info"` for {@link module:Toasts.show} */ static async info(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "info"
        }));
    }
    /** Shorthand for `type = "warning"` for {@link module:Toasts.show} */ static async warning(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "warning"
        }));
    }
    /** Shorthand for `type = "error"` for {@link module:Toasts.show} */ static async error(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "error"
        }));
    }
    /** Shorthand for `type = "default"` for {@link module:Toasts.show} */ static async default(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "default"
        }));
    }
    /**
   * Shows a simple toast, similar to Android, centered over
   * the textarea if it exists, and center screen otherwise.
   * Vertically it shows towards the bottom like in Android.
   * @param {string} content - The string to show in the toast.
   * @param {object} options - additional options for the toast
   * @param {string} [options.type] - Changes the type of the toast stylistically and semantically. {@link module:Toasts.ToastTypes}
   * @param {string} [options.icon] - URL to an optional icon
   * @param {number} [options.timeout=3000] - Adjusts the time (in ms) the toast should be shown for before disappearing automatically
   * @returns {Promise} - Promise that resolves when the toast is removed from the DOM
   */ static async show(content, options = {}) {
        const { type ="" , icon ="" , timeout =3000  } = options;
        this.ensureContainer();
        const toast = DOMTools.parseHTML(this.buildToast(content, this.parseType(type), icon));
        document.querySelector(".toasts").appendChild(toast);
        await new Promise((resolve)=>setTimeout(resolve, timeout));
        toast.classList.add("closing");
        await new Promise((resolve)=>setTimeout(resolve, 300));
        toast.remove();
        if (!document.querySelectorAll(".toasts .toast").length) document.querySelector(".toasts").remove();
    }
    static buildToast(message, type, icon) {
        const hasIcon = type || icon;
        const className = `toast ${hasIcon ? "toast-has-icon" : ""} ${type && type != "default" ? `toast-${type}` : ""}`;
        if (!icon && type) icon = type;
        return Utilities.formatString(`<div class="{{className}}">{{icon}}<div class="toast-text">{{message}}</div></div>`, {
            className: className,
            icon: hasIcon ? this.getIcon(icon) : "",
            message: message
        });
    }
    static getIcon(icon) {
        let iconInner = `<img src="${icon}" width="20" height="20" />`;
        switch(icon){
            case "success":
                iconInner = success(20);
                break; // eslint-disable-line new-cap
            case "warning":
                iconInner = warning(20);
                break; // eslint-disable-line new-cap
            case "info":
                iconInner = info(20);
                break; // eslint-disable-line new-cap
            case "error":
                iconInner = error(20); // eslint-disable-line new-cap
        }
        return Utilities.formatString(`<div class="toast-icon">{{icon}}</div>`, {
            icon: iconInner
        });
    }
    static ensureContainer() {
        if (document.querySelector(".toasts")) return;
        const channelClass = discordselectors.ChannelList.sidebar;
        const container = channelClass ? document.querySelector(`${channelClass} ~ div:not([style])`) : null;
        const memberlist = container ? container.querySelector(discordselectors.MemberList.membersWrap) : null;
        const form = container ? container.querySelector("form") : null;
        const left = container ? container.getBoundingClientRect().left : 310;
        const right = memberlist ? memberlist.getBoundingClientRect().left : 0;
        const width = right ? right - container.getBoundingClientRect().left : container.offsetWidth;
        const bottom = form ? form.offsetHeight : 80;
        const toastWrapper = document.createElement("div");
        toastWrapper.classList.add("toasts");
        toastWrapper.style.setProperty("left", left + "px");
        toastWrapper.style.setProperty("width", width + "px");
        toastWrapper.style.setProperty("bottom", bottom + "px");
        document.querySelector("#app-mount").appendChild(toastWrapper);
    }
    static parseType(type) {
        return this.ToastTypes.hasOwnProperty(type) ? this.ToastTypes[type] : "";
    }
    /**
   * Enumeration of accepted types.
   */ static get ToastTypes() {
        return {
            default: "",
            error: "error",
            success: "success",
            warning: "warning",
            info: "info"
        };
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/popouts.ts
//@ts-nocheck
/**
 * Allows an easy way to create and show popouts.
 * @module Popouts
 */ 
const { React: popouts_React , ReactDOM  } = discordmodules;
const { useReducer , useEffect , useRef  } = popouts_React;
const popouts_AccessibilityProvider = WebpackModules.getByProps("AccessibilityPreferencesContext").AccessibilityPreferencesContext.Provider;
const Layers = WebpackModules.getByProps("AppReferencePositionLayer");
const PopoutCSSAnimator = WebpackModules.getByDisplayName("PopoutCSSAnimator");
const popouts_LayerProvider = Layers.AppLayerProvider().props.layerContext.Provider; // eslint-disable-line new-cap
const LayerModule = WebpackModules.getByProps("LayerClassName");
const { ComponentDispatch  } = WebpackModules.getByProps("ComponentDispatch");
const { ComponentActions  } = WebpackModules.getByProps("ComponentActions");
const AnalyticsTrackContext = WebpackModules.find((m)=>m._currentValue && m._currentValue.toString && m._currentValue.toString().includes("AnalyticsTrackImpressionContext function unimplemented"));
const AnalyticsTracker = WebpackModules.find((m)=>m.toString && m.toString().includes("setDebugTrackedData"));
const popouts_Popout = WebpackModules.getByDisplayName("Popout");
const createStore = (state)=>{
    const listeners = new Set();
    const setState = function(getter = (_)=>_) {
        const partial = getter(state);
        if (partial === state) return;
        state = partial;
        [
            ...listeners
        ].forEach((e)=>e());
    };
    setState.getState = ()=>state;
    function storeListener(getter = (_)=>_) {
        const [, forceUpdate] = useReducer((n)=>!n, true);
        useEffect(()=>{
            const dispatch = ()=>{
                forceUpdate();
            };
            listeners.add(dispatch);
            return ()=>{
                listeners.delete(dispatch);
            };
        });
        return getter(state);
    }
    return [
        setState,
        storeListener
    ];
};
const [setPopouts, usePopouts] = createStore([]);
const AnimationTypes = {
    FADE: 3,
    SCALE: 2,
    TRANSLATE: 1
};
class Popouts {
    static get AnimationTypes() {
        return AnimationTypes;
    }
    static initialize() {
        this.dispose();
        this.popouts = 0;
        this.container = Object.assign(document.createElement("div"), {
            className: "ZeresPluginLibraryPopoutsRenderer",
            style: "display: none;"
        });
        this.layerContainer = Object.assign(document.createElement("div"), {
            id: "ZeresPluginLibraryPopouts",
            className: LayerModule.LayerClassName
        });
        document.body.append(this.container, this.layerContainer);
        ReactDOM.render(popouts_React.createElement(PopoutsContainer), this.container);
        Patcher.before("Popouts", LayerModule, "getParentLayerContainer", (_, [element])=>{
            if (element.parentElement === this.layerContainer) return this.layerContainer;
        });
    }
    /**
   * Shows the user popout for a user relative to a target element
   * @param {HTMLElement} target - Element to show the popout in relation to
   * @param {object} user - Discord User object for the user to show
   * @param {object} [options] - Options to modify the request
   * @param {string} [options.guild="currentGuildId"] - Id of the guild  (uses current if not specified)
   * @param {string} [options.channel="currentChannelId"] - Id of the channel (uses current if not specified)
   * @param {string} [options.position="right"] - Positioning relative to element
   * @param {string} [options.align="top"] - Positioning relative to element
   */ static showUserPopout(target, user, options = {}) {
        const { position ="right" , align ="top" , guild =discordmodules.SelectedGuildStore.getGuildId() , channel =discordmodules.SelectedChannelStore.getChannelId() ,  } = options;
        target = DOMTools.resolveElement(target);
        // if (target.getBoundingClientRect().right + 250 >= DOMTools.screenWidth && options.autoInvert) position = "left";
        // if (target.getBoundingClientRect().bottom + 400 >= DOMTools.screenHeight && options.autoInvert) align = "bottom";
        // if (target.getBoundingClientRect().top - 400 >= DOMTools.screenHeight && options.autoInvert) align = "top";
        this.openPopout(target, {
            position: position,
            align: align,
            animation: options.animation || Popouts.AnimationTypes.TRANSLATE,
            autoInvert: options.autoInvert,
            nudgeAlignIntoViewport: options.nudgeAlignIntoViewport,
            spacing: options.spacing,
            render: (props)=>{
                return discordmodules.React.createElement(discordmodules.UserPopout, Object.assign({}, props, {
                    userId: user.id,
                    guildId: guild,
                    channelId: channel
                }));
            }
        });
    }
    /**
   * Shows a react popout relative to a target element
   * @param {HTMLElement} target - Element to show the popout in relation to
   * @param {object} [options] - Options to modify the request
   * @param {string} [options.position="right"] - General position relative to element
   * @param {string} [options.align="top"] - Alignment relative to element
   * @param {Popouts.AnimationTypes} [options.animation=Popouts.AnimationTypes.TRANSLATE] - Animation type to use
   * @param {boolean} [options.autoInvert=true] - Try to automatically adjust the position if it overflows the screen
   * @param {boolean} [options.nudgeAlignIntoViewport=true] - Try to automatically adjust the alignment if it overflows the screen
   * @param {number} [options.spacing=8] - Spacing between target and popout
   */ static openPopout(target, options) {
        const id = this.popouts++;
        setPopouts((popouts)=>popouts.concat({
                id: id,
                element: popouts_React.createElement(PopoutWrapper, Object.assign({}, popouts_Popout.defaultProps, {
                    reference: {
                        current: target
                    },
                    popoutId: id,
                    key: "popout_" + id,
                    spacing: 50
                }, options))
            }));
        return id;
    }
    static closePopout(id) {
        const popout = setPopouts.getState().find((e)=>e.id === id);
        if (!popout) return null;
        setPopouts((popouts)=>{
            const clone = [
                ...popouts
            ];
            clone.splice(clone.indexOf(popout), 1);
            return clone;
        });
    }
    static dispose() {
        Patcher.unpatchAll("Popouts");
        const container = document.querySelector(".ZeresPluginLibraryPopoutsRenderer");
        const layerContainer = document.querySelector("#ZeresPluginLibraryPopouts");
        if (container) ReactDOM.unmountComponentAtNode(container);
        if (container) container.remove();
        if (layerContainer) layerContainer.remove();
    }
};
function DiscordProviders({ children , container  }) {
    return popouts_React.createElement(popouts_AccessibilityProvider, {
        value: {
            reducedMotion: {
                enabled: false,
                rawValue: "auto"
            }
        }
    }, popouts_React.createElement(popouts_LayerProvider, {
        value: [
            container
        ]
    }, popouts_React.createElement(AnalyticsTrackContext.Provider, {
        value: AnalyticsTracker
    }, children)));
}
function PopoutsContainer() {
    const popouts = usePopouts();
    return popouts_React.createElement(DiscordProviders, {
        container: Popouts.layerContainer
    }, popouts.map((popout)=>popout.element));
}
function PopoutWrapper({ render , animation , popoutId , ...props }) {
    const popoutRef = useRef();
    useEffect(()=>{
        if (!popoutRef.current) return;
        const node = ReactDOM.findDOMNode(popoutRef.current);
        const handleClick = ({ target  })=>{
            if (target === node || node.contains(target)) return;
            Popouts.closePopout(popoutId);
        };
        document.addEventListener("click", handleClick);
        return ()=>{
            document.removeEventListener("click", handleClick);
        };
    }, [
        popoutRef
    ]);
    switch(animation){
        case PopoutCSSAnimator.Types.FADE:
        case PopoutCSSAnimator.Types.SCALE:
        case PopoutCSSAnimator.Types.TRANSLATE:
            {
                const renderPopout = render;
                render = (renderProps)=>{
                    return popouts_React.createElement(PopoutCSSAnimator, {
                        position: renderProps.position,
                        type: animation
                    }, renderPopout(renderProps));
                };
            }
    }
    return popouts_React.createElement(Layers.AppReferencePositionLayer, Object.assign(props, {
        ref: popoutRef,
        positionKey: "0",
        autoInvert: true,
        id: "popout_" + popoutId,
        onMount () {
            ComponentDispatch.dispatch(ComponentActions.POPOUT_SHOW);
        },
        onUnmount () {
            ComponentDispatch.dispatch(ComponentActions.POPOUT_HIDE);
        },
        children: render
    }));
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/modals.ts
//@ts-nocheck
/**
 * Allows an easy way to create and show modals.
 * @module Modals
 */ 
const modals_React = discordmodules.React;
const ce = modals_React.createElement;
const Markdown = WebpackModules.getModule((m)=>m.displayName == "Markdown" && m.rules);
class Modals {
    /** Sizes of modals. */ static get ModalSizes() {
        return {};
    }
    /**
   * Shows the user profile modal for a given user.
   * @param {string} userId - id of the user to show profile for
   */ static showUserProfile(userId) {
        return discordmodules.UserProfileModal.open(userId);
    }
    /**
   * Acts as a wrapper for {@link module:Modals.showModal} where the `children` is a text element.
   * @param {string} title - title of the modal
   * @param {string} content - text to show inside the modal. Can be markdown.
   * @param {object} [options] - see {@link module:Modals.showModal}
   * @see module:Modals.showModal
   */ static showConfirmationModal(title, content, options = {}) {
        this.showModal(title, ce(Markdown, null, content), options);
    }
    /**
   * Shows a very simple alert modal that has title, content and an okay button.
   * @param {string} title - title of the modal
   * @param {string} body - text to show inside the modal
   */ static showAlertModal(title, body) {
        this.showConfirmationModal(title, body, {
            cancelText: null
        });
    }
    /**
   * Shows a generic but very customizable modal.
   * @param {string} title - title of the modal
   * @param {(ReactElement|Array<ReactElement>)} children - a single or array of rendered react elements to act as children
   * @param {object} [options] - options to modify the modal
   * @param {boolean} [options.danger=false] - whether the main button should be red or not
   * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
   * @param {string} [options.cancelText=Cancel] - text for the cancel button
   * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
   * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
   */ static showModal(title, children, options = {}) {
        const { danger =false , confirmText ="Okay" , cancelText ="Cancel" , onConfirm =()=>{} , onCancel =()=>{} ,  } = options;
        return discordmodules.ModalActions.openModal((props)=>{
            return modals_React.createElement(discordmodules.ConfirmationModal, Object.assign({
                header: title,
                confirmButtonColor: danger ? discordmodules.ButtonData.ButtonColors.RED : discordmodules.ButtonData.ButtonColors.BRAND,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel
            }, props), children);
        });
    }
    /**
   * @interface
   * @name module:Modals~Changelog
   * @property {string} title - title of the changelog section
   * @property {string} [type=added] - type information of the section. Options: added, improved, fixed, progress.
   * @property {Array<string>} items - itemized list of items to show in that section. Can use markdown.
   */ /**
   * Shows a changelog modal based on changelog data.
   * @param {string} title - title of the modal
   * @param {string} version - subtitle (usually version or date) of the modal
   * @param {module:Modals~Changelog} changelog - changelog to show inside the modal
   * @param {string} footer - either an html element or text to show in the footer of the modal. Can use markdown.
   */ static showChangelogModal(title, version, changelog, footer) {
        const TextElement = discordmodules.TextElement;
        if (!TextElement) return Logger.warn("Modals", "Unable to show changelog modal--TextElement not found.");
        const changelogItems = [];
        for(let c = 0; c < changelog.length; c++){
            const entry = changelog[c];
            const type = discordclasses.Changelog[entry.type] ? discordclasses.Changelog[entry.type] : discordclasses.Changelog.added;
            const margin = c == 0 ? discordclasses.Changelog.marginTop : "";
            changelogItems.push(ce("h1", {
                className: `${type} ${margin}`
            }, entry.title));
            const list = ce("ul", null, entry.items.map((i)=>ce("li", null, ce(Markdown, null, i))));
            changelogItems.push(list);
        }
        const renderHeader = function() {
            return ce(discordmodules.FlexChild.Child, {
                grow: 1,
                shrink: 1
            }, ce(discordmodules.Titles["default"], {
                tag: discordmodules.Titles.Tags.H4
            }, title), ce(TextElement, {
                size: TextElement.Sizes.SMALL,
                color: TextElement.Colors.PRIMARY,
                className: discordclasses.Changelog.date.toString()
            }, "Version " + version));
        };
        const renderFooter = footer ? function() {
            return ce(Markdown, null, footer);
        } : null;
        return discordmodules.ModalActions.openModal((props)=>{
            return ce(discordmodules.Changelog, Object.assign({
                className: discordclasses.Changelog.container.toString(),
                selectable: true,
                onScroll: (_)=>_,
                onClose: (_)=>_,
                renderHeader: renderHeader,
                renderFooter: renderFooter
            }, props), changelogItems);
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/reacttools.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with getting react information from DOM objects.
 * @module ReactTools
 */ 


class ReactTools {
    static get rootInstance() {
        return document.getElementById("app-mount")._reactRootContainer._internalRoot.current;
    }
    /**
     * Grabs the react internal instance of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @return {object} the internal react instance
     */ static getReactInstance(node) {
        const domNode = DOMTools.resolveElement(node);
        if (!(domNode instanceof Element)) return undefined;
        return domNode[Object.keys(domNode).find((key)=>key.startsWith("__reactInternalInstance") || key.startsWith("__reactFiber"))];
    }
    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {string} path - path to the requested value
     * @return {(*|undefined)} the value requested or undefined if not found.
     */ static getReactProperty(node, path) {
        return Utilities.getNestedProp(this.getReactInstance(node), path);
    }
    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {object} options - options for the search
     * @param {array} [options.include] - list of items to include from the search
     * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] - list of items to exclude from the search
     * @param {callable} [options.filter=_=>_] - filter to check the current instance with (should return a boolean)
     * @return {(*|null)} the owner instance or undefined if not found.
     */ static getOwnerInstance(node, { include , exclude =[
        "Popout",
        "Tooltip",
        "Scroller",
        "BackgroundFlash"
    ] , filter =(_)=>_  } = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return name !== null && !!(nameFilter.includes(name) ^ excluding);
        }
        let curr = this.getReactInstance(node);
        for(curr = curr && curr.return; !Utilities.isNil(curr); curr = curr.return){
            if (Utilities.isNil(curr)) continue;
            const owner = curr.stateNode;
            if (!Utilities.isNil(owner) && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }
        return null;
    }
    /**
     * Grabs the react internal state node trees of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain state nodes of
     * @return {Array<Function>} list of found state nodes
     */ static getStateNodes(node) {
        const instance = this.getReactInstance(node);
        const stateNodes = [];
        let lastInstance = instance;
        while(lastInstance && lastInstance.return){
            if (lastInstance.return.stateNode instanceof HTMLElement) break;
            if (lastInstance.return.stateNode) stateNodes.push(lastInstance.return.stateNode);
            lastInstance = lastInstance.return;
        }
        return stateNodes;
    }
    /**
     * Grabs the react internal component tree of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain react components of
     * @return {Array<Function>} list of found react components
     */ static getComponents(node) {
        const instance = this.getReactInstance(node);
        const components = [];
        let lastInstance = instance;
        while(lastInstance && lastInstance.return){
            if (typeof lastInstance.return.type === "string") break;
            if (lastInstance.return.type) components.push(lastInstance.return.type);
            lastInstance = lastInstance.return;
        }
        return components;
    }
    /**
     * Creates and renders a react element that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react element
     * @returns {object} - rendered react element
     */ static createWrappedElement(element) {
        if (Array.isArray(element)) element = DOMTools.wrap(element);
        return discordmodules.React.createElement(this.wrapElement(element));
    }
    /**
     * Creates an unrendered react component that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react component
     * @returns {object} - unrendered react component
     */ static wrapElement(element) {
        if (Array.isArray(element)) element = DOMTools.wrap(element);
        return class ReactWrapper extends discordmodules.React.Component {
            constructor(props){
                super(props);
                this.element = element;
            }
            componentDidMount() {
                this.refs.element.appendChild(this.element);
            }
            render() {
                return discordmodules.React.createElement("div", {
                    className: "react-wrapper",
                    ref: "element"
                });
            }
        };
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/patcher.ts
//@ts-nocheck
/**
 * Patcher that can patch other functions allowing you to run code before, after or
 * instead of the original function. Can also alter arguments and return values.
 *
 * This is a modified version of what we have been working on in BDv2. {@link https://github.com/JsSucks/BetterDiscordApp/blob/master/client/src/modules/patcher.js}
 *
 * @module Patcher
 */ 


class Patcher {
    // Use window._patches instead of local variables in case something tries to whack the lib
    static get patches() {
        return window._patches || (window._patches = []);
    }
    /**
     * Returns all the patches done by a specific caller
     * @param {string} name - Name of the patch caller
     * @method
     */ static getPatchesByCaller(name) {
        if (!name) return [];
        const patches = [];
        for (const patch of this.patches){
            for (const childPatch of patch.children){
                if (childPatch.caller === name) patches.push(childPatch);
            }
        }
        return patches;
    }
    /**
     * Unpatches all patches passed, or when a string is passed unpatches all
     * patches done by that specific caller.
     * @param {Array|string} patches - Either an array of patches to unpatch or a caller name
     */ static unpatchAll(patches) {
        if (typeof patches === "string") patches = this.getPatchesByCaller(patches);
        for (const patch of patches){
            patch.unpatch();
        }
    }
    static resolveModule(module) {
        if (!module || typeof module === "function" || typeof module === "object" && !Array.isArray(module)) return module;
        if (typeof module === "string") return discordmodules[module];
        if (Array.isArray(module)) return WebpackModules.findByUniqueProperties(module);
        return null;
    }
    static makeOverride(patch) {
        return function() {
            let returnValue;
            if (!patch.children || !patch.children.length) return patch.originalFunction.apply(this, arguments);
            for (const superPatch of patch.children.filter((c)=>c.type === "before")){
                try {
                    superPatch.callback(this, arguments);
                } catch (err) {
                    Logger.err("Patcher", `Could not fire before callback of ${patch.functionName} for ${superPatch.caller}`, err);
                }
            }
            const insteads = patch.children.filter((c)=>c.type === "instead");
            if (!insteads.length) {
                returnValue = patch.originalFunction.apply(this, arguments);
            } else {
                for (const insteadPatch of insteads){
                    try {
                        const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
                        if (typeof tempReturn !== "undefined") returnValue = tempReturn;
                    } catch (err) {
                        Logger.err("Patcher", `Could not fire instead callback of ${patch.functionName} for ${insteadPatch.caller}`, err);
                    }
                }
            }
            for (const slavePatch of patch.children.filter((c)=>c.type === "after")){
                try {
                    const tempReturn = slavePatch.callback(this, arguments, returnValue);
                    if (typeof tempReturn !== "undefined") returnValue = tempReturn;
                } catch (err) {
                    Logger.err("Patcher", `Could not fire after callback of ${patch.functionName} for ${slavePatch.caller}`, err);
                }
            }
            return returnValue;
        };
    }
    static rePatch(patch) {
        patch.proxyFunction = patch.module[patch.functionName] = this.makeOverride(patch);
    }
    static makePatch(module, functionName, name) {
        const patch = {
            name,
            module,
            functionName,
            originalFunction: module[functionName],
            proxyFunction: null,
            revert: ()=>{
                patch.module[patch.functionName] = patch.originalFunction;
                patch.proxyFunction = null;
                patch.children = [];
            },
            counter: 0,
            children: []
        };
        patch.proxyFunction = module[functionName] = this.makeOverride(patch);
        Object.assign(module[functionName], patch.originalFunction);
        module[functionName].__originalFunction = patch.originalFunction;
        module[functionName].toString = ()=>patch.originalFunction.toString();
        this.patches.push(patch);
        return patch;
    }
    /**
     * Function with no arguments and no return value that may be called to revert changes made by {@link module:Patcher}, restoring (unpatching) original method.
     * @callback module:Patcher~unpatch
     */ /**
     * A callback that modifies method logic. This callback is called on each call of the original method and is provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
     *
     * The third argument for the callback will be `undefined` for `before` patches. `originalFunction` for `instead` patches and `returnValue` for `after` patches.
     *
     * @callback module:Patcher~patchCallback
     * @param {object} thisObject - `this` in the context of the original function.
     * @param {arguments} arguments - The original arguments of the original function.
     * @param {(function|*)} extraValue - For `instead` patches, this is the original function from the module. For `after` patches, this is the return value of the function.
     * @return {*} Makes sense only when using an `instead` or `after` patch. If something other than `undefined` is returned, the returned value replaces the value of `returnValue`. If used for `before` the return value is ignored.
     */ /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run before the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static before(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "before"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run after.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run instead of the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static after(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "after"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static instead(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "instead"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run before, instead or after the original function.
     * Using this you are able to modify the incoming arguments before the original function is run as well as the return
     * value before the original function actually returns.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.type=after] - Determines whether to run the function `before`, `instead`, or `after` the original.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static pushChildPatch(caller, moduleToPatch, functionName, callback, options = {}) {
        const { type ="after" , forcePatch =true  } = options;
        const module = this.resolveModule(moduleToPatch);
        if (!module) return null;
        if (!module[functionName] && forcePatch) module[functionName] = function() {};
        if (!(module[functionName] instanceof Function)) return null;
        if (typeof moduleToPatch === "string") options.displayName = moduleToPatch;
        const displayName = options.displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}.${functionName}`;
        const patch = this.patches.find((p)=>p.module == module && p.functionName == functionName) || this.makePatch(module, functionName, patchId);
        if (!patch.proxyFunction) this.rePatch(patch);
        const child = {
            caller,
            type,
            id: patch.counter,
            callback,
            unpatch: ()=>{
                patch.children.splice(patch.children.findIndex((cpatch)=>cpatch.id === child.id && cpatch.type === type), 1);
                if (patch.children.length <= 0) {
                    const patchNum = this.patches.findIndex((p)=>p.module == module && p.functionName == functionName);
                    if (patchNum < 0) return;
                    this.patches[patchNum].revert();
                    this.patches.splice(patchNum, 1);
                }
            }
        };
        patch.children.push(child);
        patch.counter++;
        return child.unpatch;
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/discordcontextmenu.ts
//@ts-nocheck







// d = e.label,
// f = e.icon,
// h = e.imageUrl,
// v = e.hint,
// m = e.subtext,
// g = e.hasSubmenu,
// y = e.disabled,
// E = e.isFocused,
// S = e.menuItemProps,
// T = e.action,
// b = e.onClose,
const discordcontextmenu_React = discordmodules.React;
const ContextMenuActions = discordmodules.ContextMenuActions;
const discordcontextmenu_ce = discordcontextmenu_React.createElement;
const ContextMenu = WebpackModules.getByProps("MenuRadioItem", "MenuItem");
/**
 * Fires when the item is clicked.
 * @param {MouseEvent} event - The event generated on click
 * @callback module:DiscordContextMenu~MenuItemOnClick
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuItem
 * @description
 * This is the generic context menu item component. It is very extensible and will adapt
 * it's type depending on the props.
 *
 * Note: The item ID should be unique to this item across the entire menu. If no `id` is
 * provided, the system will use the `label`. Plugins should ensure there are no `label`
 * conflicts if they do not wish to provide `id`. `label` conflicts (when not using
 * unique `id`s) can cause multiple items to be hovered at once.
 *
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.id] - specific id used for this item
 * @param {string} [props.hint] - hint to show on the right hand side (usually keyboard combo)
 * @param {string} [props.subtext] - description to show underneath
 * @param {string} [props.image] - link to image to show on the side
 * @param {function} [props.icon] - react component to render on the side
 * @param {function} [props.render] - render function for custom rendering the menu item
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {function} [props.onClose] - function to run when this is closed
 * @param {boolean} [props.danger=false] - should the item show as danger (red)
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 *
 * @param {object} [props.style] - allows you to add custom styles
 * @param {boolean} [props.closeOnClick] - allows you to prevent closing on click
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuToggleItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating checkboxes in menus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 *
 * @param {boolean} [props.checked=false] - should the checkbox be checked
 * @param {boolean} [props.active=false] - alias of `checked`
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuRadioItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating radio selections in menus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * Note: for the `forceUpdate` option... Without this enabled, you will manually need to
 * manage the state for the functional component. If you do not the toggle will appear
 * to not update. @see {@link https://reactjs.org/docs/hooks-reference.html#usestate}
 *
 * @param {boolean} [props.checked=false] - should the checkbox be checked
 * @param {boolean} [props.active=false] - alias of `checked`
 * @param {boolean} [props.forceUpdate=true] - should the menu be force-updated after click
 */ /**
 * @interface
 * @name module:DiscordContextMenu~SubMenuItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating nested submenus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * @param {Array<object>} [props.render] - array of items to render in the submenu
 * @param {Array<object>} [props.items] - alias of `render`
 * @param {Array<object>} [props.children] - Already rendered elements
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuControlItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for adding custom controls like sliders to the context menu.
 * Properties shown here are additional to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * @param {function} [props.control] - control function that renders the component
 */ /**
 * A utility for building and rendering Discord's own menus.
 * @module DiscordContextMenu
 */ class DiscordContextMenu {
    /**
   * Builds a single menu item. The only prop shown here is the type, the rest should
   * match the actual component being built. View those to see what options exist
   * for each, they often have less in common than you might think. See {@link module:DiscordContextMenu.MenuItem}
   * for the majority of props commonly available. Check the documentation for the
   * rest of the components.
   *
   * @param {object} props - props used to build the item
   * @param {string} [props.type="text"] - type of the item, options: text, submenu, toggle, radio, custom, separator
   * @returns {object} the created component
   *
   * @see {@link module:DiscordContextMenu~MenuItem}
   * @see {@link module:DiscordContextMenu~MenuToggleItem}
   * @see {@link module:DiscordContextMenu~MenuRadioItem}
   * @see {@link module:DiscordContextMenu~SubMenuItem}
   * @see {@link module:DiscordContextMenu~MenuControlItem}
   *
   * @example
   * // Creates a single menu item that prints "MENU ITEM" on click
   * DiscordContextMenu.buildMenuItem({
   *      label: "Menu Item",
   *      action: () => {console.log("MENU ITEM");}
   * });
   *
   * @example
   * // Creates a single toggle item that starts unchecked
   * // and print the new value on every toggle
   * DiscordContextMenu.buildMenuItem({
   *      type: "toggle",
   *      label: "Item Toggle",
   *      checked: false,
   *      action: (newValue) => {console.log(newValue);}
   * });
   */ static buildMenuItem(props) {
        const { type  } = props;
        if (type === "separator") return discordcontextmenu_ce(ContextMenu.MenuSeparator);
        let Component = ContextMenu.MenuItem;
        if (type === "submenu") {
            if (!props.children) props.children = this.buildMenuChildren(props.render || props.items);
        } else if (type === "toggle" || type === "radio") {
            Component = type === "toggle" ? ContextMenu.MenuCheckboxItem : ContextMenu.MenuRadioItem;
            if (props.active) props.checked = props.active;
        } else if (type === "control") {
            Component = ContextMenu.MenuControlItem;
        }
        if (!props.id) props.id = `${DOMTools.escapeID(props.label)}`;
        if (props.danger) props.color = "colorDanger";
        if (props.onClick && !props.action) props.action = props.onClick;
        props.extended = true;
        return discordcontextmenu_ce(Component, props);
    }
    /**
   * Creates the all the items **and groups** of a context menu recursively.
   * There is no hard limit to the number of groups within groups or number
   * of items in a menu.
   * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuItem}
   * @returns {Array<object>} array of the created component
   *
   * @example
   * // Creates a single item group item with a toggle item
   * DiscordContextMenu.buildMenuChildren([{
   *      type: "group",
   *      items: [{
   *          type: "toggle",
   *          label: "Item Toggle",
   *          active: false,
   *          action: (newValue) => {console.log(newValue);}
   *      }]
   * }]);
   *
   * @example
   * // Creates two item groups with a single toggle item each
   * DiscordContextMenu.buildMenuChildren([{
   *     type: "group",
   *     items: [{
   *         type: "toggle",
   *         label: "Item Toggle",
   *         active: false,
   *         action: (newValue) => {
   *             console.log(newValue);
   *         }
   *     }]
   * }, {
   *     type: "group",
   *     items: [{
   *         type: "toggle",
   *         label: "Item Toggle",
   *         active: false,
   *         action: (newValue) => {
   *             console.log(newValue);
   *         }
   *     }]
   * }]);
   */ static buildMenuChildren(setup) {
        const mapper = (s)=>{
            if (s.type === "group") return buildGroup(s);
            return this.buildMenuItem(s);
        };
        const buildGroup = function(group) {
            const items = group.items.map(mapper).filter((i)=>i);
            return discordcontextmenu_ce(ContextMenu.MenuGroup, null, items);
        };
        return setup.map(mapper).filter((i)=>i);
    }
    /**
   * Creates the menu *component* including the wrapping `ContextMenu`.
   * Calls {@link module:DiscordContextMenu.buildMenuChildren} under the covers.
   * Used to call in combination with {@link module:DiscordContextMenu.openContextMenu}.
   * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuChildren}
   * @returns {function} the unique context menu component
   */ static buildMenu(setup) {
        return (props)=>{
            return discordcontextmenu_ce(ContextMenu.default, props, this.buildMenuChildren(setup));
        };
    }
    /**
   *
   * @param {MouseEvent} event - The context menu event. This can be emulated, requires target, and all X, Y locations.
   * @param {function} menuComponent - Component to render. This can be any react component or output of {@link module:DiscordContextMenu.buildMenu}
   * @param {object} config - configuration/props for the context menu
   * @param {string} [config.position="right"] - default position for the menu, options: "left", "right"
   * @param {string} [config.align="top"] - default alignment for the menu, options: "bottom", "top"
   * @param {function} [config.onClose] - function to run when the menu is closed
   * @param {boolean} [config.noBlurEvent=false] - No clue
   */ static openContextMenu(event, menuComponent, config) {
        return ContextMenuActions.openContextMenu(event, function(e) {
            return discordcontextmenu_ce(menuComponent, Object.assign({}, e, {
                onClose: ContextMenuActions.closeContextMenu
            }));
        }, config);
    }
    /**
   * Attempts to find and return a specific context menu type's module. Useful
   * when patching the render of these menus.
   * @param {string | Function} nameOrFilter - name of the context menu type
   * @returns {Promise<object>} the webpack module the menu was found in
   */ static getDiscordMenu(nameOrFilter) {
        if (typeof nameOrFilter !== "function") {
            const displayName = nameOrFilter;
            nameOrFilter = (m)=>m && m.displayName === displayName;
        }
        const directMatch = WebpackModules.getModule((m)=>m.default && nameOrFilter(m.default));
        if (directMatch) return Promise.resolve(directMatch);
        return new Promise((resolve)=>{
            const cancel = WebpackModules.addListener((module)=>{
                if (!module.default || !nameOrFilter(module.default)) return;
                resolve(module);
                cancel();
            });
        });
    }
    /**
   * Calls `forceUpdate()` on all context menus it can find. Useful for
   * after patching a menu.
   */ static forceUpdateMenus() {
        const menus = document.querySelectorAll(`.${discordclasses.ContextMenu.menu.first}`);
        for (const menu of menus){
            const stateNode = Utilities.findInTree(ReactTools.getReactInstance(menu), (m)=>m && m.forceUpdate && m.updatePosition, {
                walkable: [
                    "return",
                    "stateNode"
                ]
            });
            if (!stateNode) continue;
            stateNode.forceUpdate();
            stateNode.updatePosition();
        }
    }
    static initialize() {
        Patcher.unpatchAll("DCM");
        this.patchMenuItem();
        this.patchToggleItem();
    }
    static patchMenuItem() {
        const MenuItem = WebpackModules.getModule((m)=>m.default && m.default.displayName == "MenuItem");
        if (!MenuItem || !MenuItem.default) return;
        Patcher.after("DCM", MenuItem, "default", (_, args, ret)=>{
            if (!args || !args[0] || !args[0].extended) return;
            const [props] = args;
            if (props.style) ret.props.style = props.style;
            if (props.closeOnClick !== false || !props.action) return;
            ret.props.onClick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                return props.action(...arguments);
            };
        });
    }
    static patchToggleItem() {
        const MenuToggleItem = WebpackModules.getModule((m)=>m.default && m.default.displayName == "MenuCheckboxItem");
        if (!MenuToggleItem || !MenuToggleItem.default) return;
        Patcher.before("DCM", MenuToggleItem, "default", (_, args)=>{
            if (!args || !args[0] || !args[0].extended) return;
            const [props] = args;
            const [active, doToggle] = discordcontextmenu_React.useState(props.checked || false);
            props.checked = active;
            const originalAction = props.action;
            props.action = function(ev) {
                originalAction(ev);
                doToggle(!active);
            };
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/errorboundary.ts

const errorboundary_React = discordmodules.React;
const errorboundary_ce = errorboundary_React.createElement;
class ErrorBoundary extends errorboundary_React.Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false
        };
    }
    componentDidCatch() {
        this.setState({
            hasError: true
        });
    }
    render() {
        if (this.state.hasError) return this.props.errorChildren ? this.props.errorChildren : errorboundary_ce("div", {
            className: "error"
        }, "Component Error");
        return this.props.children;
    }
};
function WrapBoundary(Original) {
    return class ErrorBoundaryWrapper extends errorboundary_React.Component {
        render() {
            return errorboundary_ce(ErrorBoundary, null, errorboundary_ce(Original, this.props));
        }
    };
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/index.ts











;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/updates.css
const updates_namespaceObject = "#pluginNotice {\n    -webkit-app-region: drag;\n    border-radius: 0;\n    overflow: hidden;\n    height: 36px;\n    animation: open-updates 400ms ease;\n}\n\n@keyframes open-updates {\n    from { height: 0; }\n}\n\n#pluginNotice.closing {\n    transition: height 400ms ease;\n    height: 0;\n}\n\n#outdatedPlugins {\n    font-weight: 700;\n}\n\n#outdatedPlugins>span {\n    -webkit-app-region: no-drag;\n    color: #fff;\n    cursor: pointer;\n}\n\n#outdatedPlugins>span:hover {\n    text-decoration: underline;\n}";
;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/pluginupdater.ts
//@ts-nocheck
/**
 * Functions that check for and update existing plugins.
 * @module PluginUpdater
 */ 




/**
 * Function that gets the remote version from the file contents.
 * @param {string} fileContent - the content of the remote file
 * @returns {string} - remote version
 * @callback module:PluginUpdater~versioner
 */ /**
 * Comparator that takes the current version and the remote version,
 * then compares them returning `true` if there is an update and `false` otherwise.
 * @param {string} currentVersion - the current version of the plugin
 * @param {string} remoteVersion - the remote version of the plugin
 * @returns {boolean} - whether the plugin has an update or not
 * @callback module:PluginUpdater~comparator
 */ class PluginUpdater {
    static get CSS() {
        return updates_namespaceObject;
    }
    /**
   * Checks for updates for the specified plugin at the specified link. The final
   * parameter should link to the raw text of the plugin and will compare semantic
   * versions.
   * @param {string} pluginName - name of the plugin
   * @param {string} currentVersion - current version (semantic versioning only)
   * @param {string} updateURL - url to check for update
   * @param {module:PluginUpdater~versioner} [versioner] - versioner that finds the remote version. If not provided uses {@link module:PluginUpdater.defaultVersioner}.
   * @param {module:PluginUpdater~comparator} [comparator] - comparator that determines if there is an update. If not provided uses {@link module:PluginUpdater.defaultComparator}.
   */ static checkForUpdate(pluginName, currentVersion, updateURL, versioner, comparator) {
        let updateLink = "https://raw.githubusercontent.com/rauenzi/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
        if (updateURL) updateLink = updateURL;
        if (typeof versioner != "function") versioner = this.defaultVersioner;
        if (typeof comparator != "function") comparator = this.defaultComparator;
        if (typeof window.PluginUpdates === "undefined") {
            window.PluginUpdates = {
                plugins: {},
                checkAll: async function() {
                    for(const key in this.plugins){
                        const plugin = this.plugins[key];
                        if (!plugin.versioner) plugin.versioner = PluginUpdater.defaultVersioner;
                        if (!plugin.comparator) plugin.comparator = PluginUpdater.defaultComparator;
                        await PluginUpdater.processUpdateCheck(plugin.name, plugin.raw);
                    }
                },
                interval: setInterval(()=>{
                    window.PluginUpdates.checkAll();
                }, 7200000)
            };
            this.patchPluginList();
        }
        window.PluginUpdates.plugins[updateLink] = {
            name: pluginName,
            raw: updateLink,
            version: currentVersion,
            versioner: versioner,
            comparator: comparator
        };
        PluginUpdater.processUpdateCheck(pluginName, updateLink);
    }
    /**
   * Will check for updates and automatically show or remove the update notice
   * bar based on the internal result. Better not to call this directly and to
   * instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin to check
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static async processUpdateCheck(pluginName, updateLink) {
        return new Promise((resolve)=>{
            const request = require("request");
            request(updateLink, (error, response, result)=>{
                if (error || response.statusCode !== 200) return resolve();
                const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(result);
                const hasUpdate = window.PluginUpdates.plugins[updateLink].comparator(window.PluginUpdates.plugins[updateLink].version, remoteVersion);
                if (hasUpdate) resolve(this.showUpdateNotice(pluginName, updateLink));
                else resolve(this.removeUpdateNotice(pluginName));
            });
        });
    }
    /**
   * The default versioner used as {@link module:PluginUpdater~versioner} for {@link module:PluginUpdater.checkForUpdate}.
   * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a versioner if your plugin adheres
   * to this style as this will be used as default.
   * @param {string} currentVersion
   * @param {string} content
   */ static defaultVersioner(content) {
        const remoteVersion = content.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
        if (!remoteVersion) return "0.0.0";
        return remoteVersion.toString().replace(/['"]/g, "");
    }
    /**
   * The default comparator used as {@link module:PluginUpdater~comparator} for {@link module:PluginUpdater.checkForUpdate}.
   * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a comparator if your plugin adheres
   * to this style as this will be used as default.
   * @param {string} currentVersion
   * @param {string} content
   */ static defaultComparator(currentVersion, remoteVersion) {
        currentVersion = currentVersion.split(".").map((e)=>{
            return parseInt(e);
        });
        remoteVersion = remoteVersion.split(".").map((e)=>{
            return parseInt(e);
        });
        if (remoteVersion[0] > currentVersion[0]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] > currentVersion[1]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] == currentVersion[1] && remoteVersion[2] > currentVersion[2]) return true;
        return false;
    }
    static patchPluginList() {
        DOMTools.observer.subscribeToQuerySelector((mutation)=>{
            if (!mutation.addedNodes || !mutation.addedNodes.length) return;
            const button = document.getElementsByClassName("bd-pfbtn")[0];
            if (!button || !button.textContent.toLowerCase().includes("plugin") || button.nextElementSibling.classList.contains("bd-updatebtn")) return;
            button.after(PluginUpdater.createUpdateButton());
        }, "#bd-settingspane-container");
    }
    /**
   * Creates the update button found in the plugins page of BetterDiscord
   * settings. Returned button will already have listeners to create the tooltip.
   * @returns {HTMLElement} check for update button
   */ static createUpdateButton() {
        const updateButton = DOMTools.parseHTML(`<button class="bd-pfbtn bd-updatebtn" style="left: 220px;">Check for Updates</button>`);
        updateButton.onclick = function() {
            Toast.info("Plugin update check in progress.");
            window.PluginUpdates.checkAll().then(()=>{
                Toast.success("Plugin update check complete.");
            });
        };
        const tooltip = new tooltip_Tooltip(updateButton, "Checks for updates of plugins that support this feature. Right-click for a list.");
        updateButton.oncontextmenu = function() {
            if (!window.PluginUpdates || !window.PluginUpdates.plugins) return;
            tooltip.label = Object.values(window.PluginUpdates.plugins).map((p)=>p.name).join(", ");
            tooltip.side = "bottom";
            tooltip.show();
            updateButton.onmouseout = function() {
                tooltip.label = "Checks for updates of plugins that support this feature. Right-click for a list.";
                tooltip.side = "top";
            };
        };
        return updateButton;
    }
    /**
   * Will download the latest version and replace the the old plugin version.
   * Will also update the button in the update bar depending on if the user
   * is using RestartNoMore plugin by square {@link https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/restartNoMore.plugin.js}
   * @param {string} pluginName - name of the plugin to download
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static downloadPlugin(pluginName, updateLink) {
        const request = require("request");
        const fileSystem = require("fs");
        const path = require("path");
        request(updateLink, async (error, response, body)=>{
            if (error) return Logger.warn("PluginUpdates", "Unable to get update for " + pluginName);
            const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(body);
            let filename = updateLink.split("/");
            filename = filename[filename.length - 1];
            const file = path.join(BdApi.Plugins.folder, filename);
            await new Promise((r)=>fileSystem.writeFile(file, body, r));
            Toast.success(`${pluginName} ${window.PluginUpdates.plugins[updateLink].version} has been replaced by ${pluginName} ${remoteVersion}`);
            this.removeUpdateNotice(pluginName);
            if (BdApi.isSettingEnabled("fork-ps-5")) return;
            if (!window.PluginUpdates.downloaded) {
                window.PluginUpdates.downloaded = [];
                const button = DOMTools.parseHTML(`<button class="btn btn-reload ${discordclasses.Notices.buttonMinor} ${discordclasses.Notices.button}">Reload</button>`);
                const tooltip = new tooltip_Tooltip(button, window.PluginUpdates.downloaded.join(", "), {
                    side: "top"
                });
                button.addEventListener("click", (e)=>{
                    e.preventDefault();
                    window.location.reload(false);
                });
                button.addEventListener("mouseenter", ()=>{
                    tooltip.label = window.PluginUpdates.downloaded.join(", ");
                });
                document.getElementById("pluginNotice").append(button);
            }
            window.PluginUpdates.plugins[updateLink].version = remoteVersion;
            window.PluginUpdates.downloaded.push(pluginName);
        });
    }
    /**
   * Will show the update notice top bar seen in Discord. Better not to call
   * this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static showUpdateNotice(pluginName, updateLink) {
        if (!document.getElementById("pluginNotice")) {
            const noticeElement = DOMTools.parseHTML(`<div class="${discordclasses.Notices.notice} ${discordclasses.Notices.colorInfo}" id="pluginNotice">
                                                        <div class="${discordclasses.Notices.closeButton}" id="pluginNoticeDismiss"></div>
                                                        <span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>
                                                    </div>`);
            DOMTools.query("[class*='app-'] > [class*='app-']").prepend(noticeElement);
            noticeElement.querySelector("#pluginNoticeDismiss").addEventListener("click", async ()=>{
                noticeElement.classList.add("closing");
                await new Promise((resolve)=>setTimeout(resolve, 400));
                noticeElement.remove();
            });
        }
        const pluginNoticeID = pluginName + "-notice";
        if (document.getElementById(pluginNoticeID)) return;
        const pluginNoticeElement = DOMTools.parseHTML(`<span id="${pluginNoticeID}">${pluginName}</span>`);
        pluginNoticeElement.addEventListener("click", ()=>{
            this.downloadPlugin(pluginName, updateLink);
        });
        if (document.getElementById("outdatedPlugins").querySelectorAll("span").length) document.getElementById("outdatedPlugins").append(DOMTools.createElement("<span class='separator'>, </span>"));
        document.getElementById("outdatedPlugins").append(pluginNoticeElement);
        const tooltip = new tooltip_Tooltip(pluginNoticeElement, "Click To Update!", {
            side: "bottom"
        });
        // If this is the first one added, show the tooltip immediately.
        if (document.getElementById("outdatedPlugins").querySelectorAll("span").length === 1) tooltip.show();
    }
    /**
   * Will remove the plugin from the update notice top bar seen in Discord.
   * Better not to call this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin
   */ static removeUpdateNotice(pluginName) {
        if (!document.getElementById("outdatedPlugins")) return;
        const notice = document.getElementById(pluginName + "-notice");
        if (notice) {
            if (notice.nextElementSibling && notice.nextElementSibling.matches(".separator")) notice.nextElementSibling.remove();
            else if (notice.previousElementSibling && notice.previousElementSibling.matches(".separator")) notice.previousElementSibling.remove();
            notice.remove();
        }
        if (!document.getElementById("outdatedPlugins").querySelectorAll("span").length) {
            if (document.querySelector("#pluginNotice .btn-reload")) document.querySelector("#pluginNotice .notice-message").textContent = "To finish updating you need to reload.";
            else document.getElementById("pluginNoticeDismiss").click();
        }
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/plugin.ts
//@ts-nocheck







/* harmony default export */ function structs_plugin(meta) {
    return class Plugin {
        constructor(){
            this._config = meta;
            this._enabled = false;
            if (typeof meta.defaultConfig != "undefined") {
                this.defaultSettings = {};
                for(let s = 0; s < meta.defaultConfig.length; s++){
                    const current = meta.defaultConfig[s];
                    if (current.type != "category") {
                        this.defaultSettings[current.id] = current.value;
                    } else {
                        this.defaultSettings[current.id] = {};
                        for(let si = 0; si < current.settings.length; si++){
                            const subCurrent = current.settings[si];
                            this.defaultSettings[current.id][subCurrent.id] = subCurrent.value;
                        }
                    }
                }
                this._hasConfig = true;
                this.settings = Utilities.deepclone(this.defaultSettings);
            }
        }
        getName() {
            return this._config.info.name.replace(" ", "");
        }
        getDescription() {
            return this._config.info.description;
        }
        getVersion() {
            return this._config.info.version;
        }
        getAuthor() {
            return this._config.info.authors.map((a)=>a.name).join(", ");
        }
        load() {
            const currentVersionInfo = Utilities.loadData(this.getName(), "currentVersionInfo", {
                version: this.getVersion(),
                hasShownChangelog: false
            });
            if (currentVersionInfo.version != this.getVersion() || !currentVersionInfo.hasShownChangelog) {
                this.showChangelog();
                Utilities.saveData(this.getName(), "currentVersionInfo", {
                    version: this.getVersion(),
                    hasShownChangelog: true
                });
            }
            PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this._config.info.github_raw);
        }
        async start() {
            Logger.info(this.getName(), `version ${this.getVersion()} has started.`);
            if (this.defaultSettings) this.settings = this.loadSettings();
            this._enabled = true;
            if (typeof this.onStart == "function") this.onStart();
        }
        stop() {
            Logger.info(this.getName(), `version ${this.getVersion()} has stopped.`);
            this._enabled = false;
            if (typeof this.onStop == "function") this.onStop();
        }
        get isEnabled() {
            return this._enabled;
        }
        get strings() {
            if (!this._config.strings) return {};
            const locale = discordmodules.UserSettingsStore.locale.split("-")[0];
            if (this._config.strings.hasOwnProperty(locale)) return this._config.strings[locale];
            if (this._config.strings.hasOwnProperty("en")) return this._config.strings.en;
            return this._config.strings;
        }
        set strings(strings) {
            this._config.strings = strings;
        }
        showSettingsModal() {
            if (typeof this.getSettingsPanel != "function") return;
            Modals.showModal(this.getName() + " Settings", ReactTools.createWrappedElement(this.getSettingsPanel()), {
                cancelText: "",
                confirmText: "Done",
                size: Modals.ModalSizes.MEDIUM
            });
        }
        showChangelog(footer) {
            if (typeof this._config.changelog == "undefined") return;
            Modals.showChangelogModal(this.getName() + " Changelog", this.getVersion(), this._config.changelog, footer);
        }
        saveSettings(settings) {
            Utilities.saveSettings(this.getName(), this.settings ? this.settings : settings);
        }
        loadSettings(defaultSettings) {
            // loadSettings -> loadData -> defaultSettings gets deep cloned
            return Utilities.loadSettings(this.getName(), this.defaultSettings ? this.defaultSettings : defaultSettings);
        }
        buildSetting(data) {
            const { name , note , type , value , onChange , id  } = data;
            let setting = null;
            if (type == "color") setting = new color(name, note, value, onChange, {
                disabled: data.disabled,
                presetColors: data.presetColors
            });
            else if (type == "dropdown") setting = new dropdown(name, note, value, data.options, onChange);
            else if (type == "file") setting = new file(name, note, onChange);
            else if (type == "keybind") setting = new keybind(name, note, value, onChange);
            else if (type == "radio") setting = new radiogroup(name, note, value, data.options, onChange, {
                disabled: data.disabled
            });
            else if (type == "slider") setting = new slider(name, note, data.min, data.max, value, onChange, data);
            else if (type == "switch") setting = new types_switch(name, note, value, onChange, {
                disabled: data.disabled
            });
            else if (type == "textbox") setting = new textbox(name, note, value, onChange, {
                placeholder: data.placeholder || ""
            });
            if (id) setting.id = id;
            return setting;
        }
        buildSettingsPanel() {
            const config = this._config.defaultConfig;
            const buildGroup = (group)=>{
                const { name , id , collapsible , shown , settings  } = group;
                // this.settings[id] = {};
                const list = [];
                for(let s = 0; s < settings.length; s++){
                    const current = Object.assign({}, settings[s]);
                    current.value = this.settings[id][current.id];
                    current.onChange = (value)=>{
                        this.settings[id][current.id] = value;
                    };
                    if (Object.keys(this.strings).length && this.strings.settings && this.strings.settings[id] && this.strings.settings[id][current.id]) {
                        const { settingName =name , note  } = this.strings.settings[id][current.id];
                        current.name = settingName;
                        current.note = note;
                    }
                    list.push(this.buildSetting(current));
                }
                const settingGroup = new settinggroup(name, {
                    shown,
                    collapsible
                }).append(...list);
                settingGroup.id = id;
                return settingGroup;
            };
            const list1 = [];
            for(let s1 = 0; s1 < config.length; s1++){
                const current = Object.assign({}, config[s1]);
                if (current.type != "category") {
                    current.value = this.settings[current.id];
                    current.onChange = (value)=>{
                        this.settings[current.id] = value;
                    };
                    if (Object.keys(this.strings).length && this.strings.settings && this.strings.settings[current.id]) {
                        const { name , note  } = this.strings.settings[current.id];
                        current.name = name;
                        current.note = note;
                    }
                    list1.push(this.buildSetting(current));
                } else {
                    list1.push(buildGroup(current));
                }
            }
            return new settingpanel(this.saveSettings.bind(this), ...list1);
        }
    };
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/index.ts







;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/domtools.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with DOM operations.
 *
 * This module also extends `HTMLElement` to add a set of utility functions,
 * the same as the ones available in the module itself, but with the `element`
 * parameter bound to `this`.
 * @module DOMTools
 */ 
/**
 * @interface
 * @name Offset
 * @property {number} top - Top offset of the target element.
 * @property {number} right - Right offset of the target element.
 * @property {number} bottom - Bottom offset of the target element.
 * @property {number} left - Left offset of the target element.
 * @property {number} height - Outer height of the target element.
 * @property {number} width - Outer width of the target element.
 */ /**
 * Function that automatically removes added listener.
 * @callback module:DOMTools~CancelListener
 */ class DOMTools {
    static get Selector() {
        return selector;
    }
    static get ClassName() {
        return classname;
    }
    static get DOMObserver() {
        return observer;
    }
    /**
   * Default DOMObserver for global usage.
   *
   * @see DOMObserver
   */ static get observer() {
        return this._observer || (this._observer = new observer());
    }
    /** Document/window width */ static get screenWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    /** Document/window height */ static get screenHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    static animate({ timing =(_)=>_ , update , duration  }) {
        // https://javascript.info/js-animation
        const start = performance.now();
        requestAnimationFrame(function renderFrame(time) {
            // timeFraction goes from 0 to 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;
            // calculate the current animation state
            const progress = timing(timeFraction);
            update(progress); // draw it
            if (timeFraction < 1) requestAnimationFrame(renderFrame);
        });
    }
    /**
   * Adds a style to the document.
   * @param {string} id - identifier to use as the element id
   * @param {string} css - css to add to the document
   */ static addStyle(id, css) {
        document.head.append(DOMTools.createElement(`<style id="${id}">${css}</style>`));
    }
    /**
   * Removes a style from the document.
   * @param {string} id - original identifier used
   */ static removeStyle(id) {
        const element = document.getElementById(id);
        if (element && element.tagName === "STYLE") element.remove();
    }
    /**
   * Adds/requires a remote script to be loaded
   * @param {string} id - identifier to use for this script
   * @param {string} url - url from which to load the script
   * @returns {Promise} promise that resolves when the script is loaded
   */ static addScript(id, url) {
        return new Promise((resolve)=>{
            const script = document.createElement("script");
            script.id = id;
            script.src = url;
            script.type = "text/javascript";
            script.onload = resolve;
            document.head.append(script);
        });
    }
    /**
   * Removes a remote script from the document.
   * @param {string} id - original identifier used
   */ static removeScript(id) {
        const element = document.getElementById(id);
        if (element && element.tagName === "SCRIPT") element.remove();
    }
    /**
   * This is my shit version of not having to use `$` from jQuery. Meaning
   * that you can pass a selector and it will automatically run {@link module:DOMTools.query}.
   * It also means that you can pass a string of html and it will perform and return `parseHTML`.
   * @see module:DOMTools.parseHTML
   * @see module:DOMTools.query
   * @param {string} selector - Selector to query or HTML to parse
   * @returns {(DocumentFragment|NodeList|HTMLElement)} - Either the result of `parseHTML` or `query`
   */ static Q(selector) {
        const element = this.parseHTML(selector);
        const isHTML = element instanceof NodeList ? Array.from(element).some((n)=>n.nodeType === 1) : element.nodeType === 1;
        if (isHTML) return element;
        return this.query(selector);
    }
    /**
   * Essentially a shorthand for `document.querySelector`. If the `baseElement` is not provided
   * `document` is used by default.
   * @param {string} selector - Selector to query
   * @param {Element} [baseElement] - Element to base the query from
   * @returns {(Element|null)} - The found element or null if not found
   */ static query(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelector(selector);
    }
    /**
   * Essentially a shorthand for `document.querySelectorAll`. If the `baseElement` is not provided
   * `document` is used by default.
   * @param {string} selector - Selector to query
   * @param {Element} [baseElement] - Element to base the query from
   * @returns {Array<Element>} - Array of all found elements
   */ static queryAll(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelectorAll(selector);
    }
    /**
   * Parses a string of HTML and returns the results. If the second parameter is true,
   * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
   * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
   *
   * If the second parameter is false, then the return value will be the list of parsed
   * nodes and there were multiple top level nodes, otherwise the single node is returned.
   * @param {string} html - HTML to be parsed
   * @param {boolean} [fragment=false] - Whether or not the return should be the raw `DocumentFragment`
   * @returns {(DocumentFragment|NodeList|HTMLElement)} - The result of HTML parsing
   */ static parseHTML(html, fragment = false) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const node = template.content.cloneNode(true);
        if (fragment) return node;
        return node.childNodes.length > 1 ? node.childNodes : node.childNodes[0];
    }
    /** Alternate name for {@link module:DOMTools.parseHTML} */ static createElement(html, fragment = false) {
        return this.parseHTML(html, fragment);
    }
    /**
   * Takes a string of html and escapes it using the brower's own escaping mechanism.
   * @param {String} html - html to be escaped
   */ static escapeHTML(html) {
        const textNode = document.createTextNode("");
        const spanElement = document.createElement("span");
        spanElement.append(textNode);
        textNode.nodeValue = html;
        return spanElement.innerHTML;
    }
    /**
   * Takes a string and escapes it for use as a DOM id.
   * @param {String} id - string to be escaped
   */ static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }
    /**
   * Adds a list of classes from the target element.
   * @param {Element} element - Element to edit classes of
   * @param {...string} classes - Names of classes to add
   * @returns {Element} - `element` to allow for chaining
   */ static addClass(element, ...classes) {
        classes = classes.flat().filter((c)=>c);
        for(let c1 = 0; c1 < classes.length; c1++)classes[c1] = classes[c1].toString().split(" ");
        classes = classes.flat().filter((c)=>c);
        element.classList.add(...classes);
        return element;
    }
    /**
   * Removes a list of classes from the target element.
   * @param {Element} element - Element to edit classes of
   * @param {...string} classes - Names of classes to remove
   * @returns {Element} - `element` to allow for chaining
   */ static removeClass(element, ...classes) {
        for(let c2 = 0; c2 < classes.length; c2++)classes[c2] = classes[c2].toString().split(" ");
        classes = classes.flat().filter((c)=>c);
        element.classList.remove(...classes);
        return element;
    }
    /**
   * When only one argument is present: Toggle class value;
   * i.e., if class exists then remove it and return false, if not, then add it and return true.
   * When a second argument is present:
   * If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
   * @param {Element} element - Element to edit classes of
   * @param {string} classname - Name of class to toggle
   * @param {boolean} [indicator] - Optional indicator for if the class should be toggled
   * @returns {Element} - `element` to allow for chaining
   */ static toggleClass(element, classname, indicator) {
        classname = classname.toString().split(" ").filter((c)=>c);
        if (typeof indicator !== "undefined") classname.forEach((c)=>element.classList.toggle(c, indicator));
        else classname.forEach((c)=>element.classList.toggle(c));
        return element;
    }
    /**
   * Checks if an element has a specific class
   * @param {Element} element - Element to edit classes of
   * @param {string} classname - Name of class to check
   * @returns {boolean} - `true` if the element has the class, `false` otherwise.
   */ static hasClass(element, classname) {
        return classname.toString().split(" ").filter((c)=>c).every((c)=>element.classList.contains(c));
    }
    /**
   * Replaces one class with another
   * @param {Element} element - Element to edit classes of
   * @param {string} oldName - Name of class to replace
   * @param {string} newName - New name for the class
   * @returns {Element} - `element` to allow for chaining
   */ static replaceClass(element, oldName, newName) {
        element.classList.replace(oldName, newName);
        return element;
    }
    /**
   * Appends `thisNode` to `thatNode`
   * @param {Node} thisNode - Node to be appended to another node
   * @param {Node} thatNode - Node for `thisNode` to be appended to
   * @returns {Node} - `thisNode` to allow for chaining
   */ static appendTo(thisNode, thatNode) {
        if (typeof thatNode == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.append(thisNode);
        return thisNode;
    }
    /**
   * Prepends `thisNode` to `thatNode`
   * @param {Node} thisNode - Node to be prepended to another node
   * @param {Node} thatNode - Node for `thisNode` to be prepended to
   * @returns {Node} - `thisNode` to allow for chaining
   */ static prependTo(thisNode, thatNode) {
        if (typeof thatNode == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.prepend(thisNode);
        return thisNode;
    }
    /**
   * Insert after a specific element, similar to jQuery's `thisElement.insertAfter(otherElement)`.
   * @param {Node} thisNode - The node to insert
   * @param {Node} targetNode - Node to insert after in the tree
   * @returns {Node} - `thisNode` to allow for chaining
   */ static insertAfter(thisNode, targetNode) {
        targetNode.parentNode.insertBefore(thisNode, targetNode.nextSibling);
        return thisNode;
    }
    /**
   * Insert after a specific element, similar to jQuery's `thisElement.after(newElement)`.
   * @param {Node} thisNode - The node to insert
   * @param {Node} newNode - Node to insert after in the tree
   * @returns {Node} - `thisNode` to allow for chaining
   */ static after(thisNode, newNode) {
        thisNode.parentNode.insertBefore(newNode, thisNode.nextSibling);
        return thisNode;
    }
    /**
   * Gets the next sibling element that matches the selector.
   * @param {Element} element - Element to get the next sibling of
   * @param {string} [selector=""] - Optional selector
   * @returns {Element} - The sibling element
   */ static next(element, selector = "") {
        return selector ? element.querySelector("+ " + selector) : element.nextElementSibling;
    }
    /**
   * Gets all subsequent siblings.
   * @param {Element} element - Element to get next siblings of
   * @returns {NodeList} - The list of siblings
   */ static nextAll(element) {
        return element.querySelectorAll("~ *");
    }
    /**
   * Gets the subsequent siblings until an element matches the selector.
   * @param {Element} element - Element to get the following siblings of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of siblings
   */ static nextUntil(element, selector) {
        const next = [];
        while(element.nextElementSibling && !element.nextElementSibling.matches(selector))next.push(element = element.nextElementSibling);
        return next;
    }
    /**
   * Gets the previous sibling element that matches the selector.
   * @param {Element} element - Element to get the previous sibling of
   * @param {string} [selector=""] - Optional selector
   * @returns {Element} - The sibling element
   */ static previous(element, selector = "") {
        const previous = element.previousElementSibling;
        if (selector) return previous && previous.matches(selector) ? previous : null;
        return previous;
    }
    /**
   * Gets all preceeding siblings.
   * @param {Element} element - Element to get preceeding siblings of
   * @returns {NodeList} - The list of siblings
   */ static previousAll(element) {
        const previous = [];
        while(element.previousElementSibling)previous.push(element = element.previousElementSibling);
        return previous;
    }
    /**
   * Gets the preceeding siblings until an element matches the selector.
   * @param {Element} element - Element to get the preceeding siblings of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of siblings
   */ static previousUntil(element, selector) {
        const previous = [];
        while(element.previousElementSibling && !element.previousElementSibling.matches(selector))previous.push(element = element.previousElementSibling);
        return previous;
    }
    /**
   * Find which index in children a certain node is. Similar to jQuery's `$.index()`
   * @param {HTMLElement} node - The node to find its index in parent
   * @returns {number} Index of the node
   */ static indexInParent(node) {
        const children = node.parentNode.childNodes;
        let num = 0;
        for(let i = 0; i < children.length; i++){
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }
    /** Shorthand for {@link module:DOMTools.indexInParent} */ static index(node) {
        return this.indexInParent(node);
    }
    /**
   * Gets the parent of the element if it matches the selector,
   * otherwise returns null.
   * @param {Element} element - Element to get parent of
   * @param {string} [selector=""] - Selector to match parent
   * @returns {(Element|null)} - The sibling element or null
   */ static parent(element, selector = "") {
        return !selector || element.parentElement.matches(selector) ? element.parentElement : null;
    }
    /**
   * Gets all children of Element that match the selector if provided.
   * @param {Element} element - Element to get all children of
   * @param {string} selector - Selector to match the children to
   * @returns {Array<Element>} - The list of children
   */ static findChild(element, selector) {
        return element.querySelector(":scope > " + selector);
    }
    /**
   * Gets all children of Element that match the selector if provided.
   * @param {Element} element - Element to get all children of
   * @param {string} selector - Selector to match the children to
   * @returns {Array<Element>} - The list of children
   */ static findChildren(element, selector) {
        return element.querySelectorAll(":scope > " + selector);
    }
    /**
   * Gets all ancestors of Element that match the selector if provided.
   * @param {Element} element - Element to get all parents of
   * @param {string} [selector=""] - Selector to match the parents to
   * @returns {Array<Element>} - The list of parents
   */ static parents(element, selector = "") {
        const parents = [];
        if (selector) while(element.parentElement && element.parentElement.closest(selector))parents.push(element = element.parentElement.closest(selector));
        else while(element.parentElement)parents.push(element = element.parentElement);
        return parents;
    }
    /**
   * Gets the ancestors until an element matches the selector.
   * @param {Element} element - Element to get the ancestors of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of parents
   */ static parentsUntil(element, selector) {
        const parents = [];
        while(element.parentElement && !element.parentElement.matches(selector))parents.push(element = element.parentElement);
        return parents;
    }
    /**
   * Gets all siblings of the element that match the selector.
   * @param {Element} element - Element to get all siblings of
   * @param {string} [selector="*"] - Selector to match the siblings to
   * @returns {Array<Element>} - The list of siblings
   */ static siblings(element, selector = "*") {
        return Array.from(element.parentElement.children).filter((e)=>e != element && e.matches(selector));
    }
    /**
   * Sets or gets css styles for a specific element. If `value` is provided
   * then it sets the style and returns the element to allow for chaining,
   * otherwise returns the style.
   * @param {Element} element - Element to set the CSS of
   * @param {string} attribute - Attribute to get or set
   * @param {string} [value] - Value to set for attribute
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static css(element, attribute, value) {
        if (typeof value == "undefined") return global.getComputedStyle(element)[attribute];
        element.style[attribute] = value;
        return element;
    }
    /**
   * Sets or gets the width for a specific element. If `value` is provided
   * then it sets the width and returns the element to allow for chaining,
   * otherwise returns the width.
   * @param {Element} element - Element to set the CSS of
   * @param {string} [value] - Width to set
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static width(element, value) {
        if (typeof value == "undefined") return parseInt(getComputedStyle(element).width);
        element.style.width = value;
        return element;
    }
    /**
   * Sets or gets the height for a specific element. If `value` is provided
   * then it sets the height and returns the element to allow for chaining,
   * otherwise returns the height.
   * @param {Element} element - Element to set the CSS of
   * @param {string} [value] - Height to set
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static height(element, value) {
        if (typeof value == "undefined") return parseInt(getComputedStyle(element).height);
        element.style.height = value;
        return element;
    }
    /**
   * Sets the inner text of an element if given a value, otherwise returns it.
   * @param {Element} element - Element to set the text of
   * @param {string} [text] - Content to set
   * @returns {string} - Either the string set by this call or the current text content of the node.
   */ static text(element, text) {
        if (typeof text == "undefined") return element.textContent;
        return element.textContent = text;
    }
    /**
   * Returns the innerWidth of the element.
   * @param {Element} element - Element to retrieve inner width of
   * @return {number} - The inner width of the element.
   */ static innerWidth(element) {
        return element.clientWidth;
    }
    /**
   * Returns the innerHeight of the element.
   * @param {Element} element - Element to retrieve inner height of
   * @return {number} - The inner height of the element.
   */ static innerHeight(element) {
        return element.clientHeight;
    }
    /**
   * Returns the outerWidth of the element.
   * @param {Element} element - Element to retrieve outer width of
   * @return {number} - The outer width of the element.
   */ static outerWidth(element) {
        return element.offsetWidth;
    }
    /**
   * Returns the outerHeight of the element.
   * @param {Element} element - Element to retrieve outer height of
   * @return {number} - The outer height of the element.
   */ static outerHeight(element) {
        return element.offsetHeight;
    }
    /**
   * Gets the offset of the element in the page.
   * @param {Element} element - Element to get offset of
   * @return {Offset} - The offset of the element
   */ static offset(element) {
        return element.getBoundingClientRect();
    }
    static get listeners() {
        return this._listeners || (this._listeners = {});
    }
    /**
   * This is similar to jQuery's `on` function and can *hopefully* be used in the same way.
   *
   * Rather than attempt to explain, I'll show some example usages.
   *
   * The following will add a click listener (in the `myPlugin` namespace) to `element`.
   * `DOMTools.on(element, "click.myPlugin", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (in the `myPlugin` namespace) to `element` that only fires when the target is a `.block` element.
   * `DOMTools.on(element, "click.myPlugin", ".block", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (without namespace) to `element`.
   * `DOMTools.on(element, "click", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (without namespace) to `element` that only fires once.
   * `const cancel = DOMTools.on(element, "click", () => {console.log("fired!"); cancel();});`
   *
   * @param {Element} element - Element to add listener to
   * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} delegate - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
   */ static on(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };
        element.addEventListener(type, eventFunc);
        const cancel = ()=>{
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = ()=>{
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex((l)=>l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }
    /**
   * Functionality for this method matches {@link module:DOMTools.on} but automatically cancels itself
   * and removes the listener upon the first firing of the desired event.
   *
   * @param {Element} element - Element to add listener to
   * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} delegate - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
   */ static once(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? function(ev) {
            callback(ev);
            element.removeEventListener(type, eventFunc);
        } : function(ev) {
            if (!ev.target.matches(delegate)) return;
            callback(ev);
            element.removeEventListener(type, eventFunc);
        };
        element.addEventListener(type, eventFunc);
        const cancel = ()=>{
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = ()=>{
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex((l)=>l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }
    static __offAll(event, element) {
        const [type, namespace] = event.split(".");
        let matchFilter = (listener)=>listener.event == type, defaultFilter = (_)=>_;
        if (element) {
            matchFilter = (l)=>l.event == type && l.element == element;
            defaultFilter = (l)=>l.element == element;
        }
        const listeners = this.listeners[namespace] || [];
        const list = type ? listeners.filter(matchFilter) : listeners.filter(defaultFilter);
        for(let c = 0; c < list.length; c++)list[c].cancel();
    }
    /**
   * This is similar to jQuery's `off` function and can *hopefully* be used in the same way.
   *
   * Rather than attempt to explain, I'll show some example usages.
   *
   * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element`.
   * `DOMTools.off(element, "click.myPlugin", onClick);`
   *
   * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element` that only fired when the target is a `.block` element.
   * `DOMTools.off(element, "click.myPlugin", ".block", onClick);`
   *
   * The following will remove a click listener (without namespace) from `element`.
   * `DOMTools.off(element, "click", onClick);`
   *
   * The following will remove all listeners in namespace `myPlugin` from `element`.
   * `DOMTools.off(element, ".myPlugin");`
   *
   * The following will remove all click listeners in namespace `myPlugin` from *all elements*.
   * `DOMTools.off("click.myPlugin");`
   *
   * The following will remove all listeners in namespace `myPlugin` from *all elements*.
   * `DOMTools.off(".myPlugin");`
   *
   * @param {(Element|string)} element - Element to remove listener from
   * @param {string} [event] - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} [delegate] - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {Element} - The original element to allow for chaining
   */ static off(element, event, delegate, callback) {
        if (typeof element == "string") return this.__offAll(element);
        const [type, namespace] = event.split(".");
        if (namespace) return this.__offAll(event, element);
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };
        element.removeEventListener(type, eventFunc);
        return element;
    }
    /**
   * Adds a listener for when the node is added/removed from the document body.
   * The listener is automatically removed upon firing.
   * @param {HTMLElement} node - node to wait for
   * @param {callable} callback - function to be performed on event
   * @param {boolean} onMount - determines if it should fire on Mount or on Unmount
   */ static onMountChange(node, callback, onMount = true) {
        const wrappedCallback = ()=>{
            this.observer.unsubscribe(wrappedCallback);
            callback();
        };
        this.observer.subscribe(wrappedCallback, (mutation)=>{
            const nodes = Array.from(onMount ? mutation.addedNodes : mutation.removedNodes);
            const directMatch = nodes.indexOf(node) > -1;
            const parentMatch = nodes.some((parent)=>parent.contains(node));
            return directMatch || parentMatch;
        });
        return node;
    }
    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `true` */ static onMount(node, callback) {
        return this.onMountChange(node, callback);
    }
    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `false` */ static onUnmount(node, callback) {
        return this.onMountChange(node, callback, false);
    }
    /** Alias for {@link module:DOMTools.onMount} */ static onAdded(node, callback) {
        return this.onMount(node, callback);
    }
    /** Alias for {@link module:DOMTools.onUnmount} */ static onRemoved(node, callback) {
        return this.onUnmount(node, callback, false);
    }
    /**
   * Helper function which combines multiple elements into one parent element
   * @param {Array<HTMLElement>} elements - array of elements to put into a single parent
   */ static wrap(elements) {
        const domWrapper = this.parseHTML(`<div class="dom-wrapper"></div>`);
        for(let e = 0; e < elements.length; e++)domWrapper.appendChild(elements[e]);
        return domWrapper;
    }
    /**
   * Resolves the node to an HTMLElement. This is mainly used by library modules.
   * @param {(jQuery|Element)} node - node to resolve
   */ static resolveElement(node) {
        try {
            if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
            return node instanceof window.jQuery ? node[0] : node;
        } catch  {
            return node;
        }
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordselectors.ts
//@ts-nocheck


const getSelectorAll = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ").join(".")}`;
};
const getSelector = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ")[0]}`;
};
/**
 * Gives us a way to retrieve the internal classes as selectors without
 * needing to concatenate strings or use string templates. Wraps the
 * selector in {@link module:DOMTools.Selector} which adds features but can
 * still be used in native function.
 *
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 *
 * @see module:DiscordClassModules
 * @module DiscordSelectors
 */ const DiscordSelectors = new Proxy(discordclassmodules, {
    get: function(list, item) {
        if (item == "getSelectorAll" || item == "getSelector") return (module, prop)=>DiscordSelectors[module][item]([
                prop
            ]);
        if (list[item] === undefined) return new Proxy({}, {
            get: function() {
                return "";
            }
        });
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getSelectorAll") return getSelectorAll.bind(obj);
                if (prop == "getSelector") return getSelector.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new DOMTools.Selector(obj[prop]);
            }
        });
    }
});
/* harmony default export */ const discordselectors = (DiscordSelectors);

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/reactcomponents.ts
//@ts-nocheck
/**
 * BetterDiscord React Component Manipulations
 * Original concept and some code by samogot - https://github.com/samogot / https://github.com/samogot/betterdiscord-plugins/tree/master/v2/1Lib%20Discord%20Internals
 *
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 




class ReactComponent {
    constructor(id, component, selector, filter){
        this.id = id;
        this.component = component;
        this.selector = selector;
        this.filter = filter;
    }
    forceUpdateAll() {
        if (!this.selector) return;
        for (const e of document.querySelectorAll(this.selector)){
            const stateNode = Utilities.findInTree(ReactTools.getReactInstance(e), (m)=>m && m.forceUpdate, {
                walkable: [
                    "return",
                    "stateNode"
                ]
            });
            if (!stateNode) continue;
            stateNode.forceUpdate();
        }
    }
}
/**
 * Methods for obtaining and interacting with react components.
 * @module ReactComponents
 */ class ReactComponents {
    static get components() {
        return this._components || (this._components = new Map());
    }
    static get unknownComponents() {
        return this._unknownComponents || (this._unknownComponents = new Set());
    }
    static get listeners() {
        return this._listeners || (this._listeners = new Map());
    }
    static get nameSetters() {
        return this._nameSetters || (this._nameSetters = new Set());
    }
    static get ReactComponent() {
        return ReactComponent;
    }
    static initialize() {
        ReactAutoPatcher.autoUnpatch();
        ReactAutoPatcher.autoPatch();
        ReactAutoPatcher.processAll();
    }
    static push(component, selector, filter) {
        if (typeof component !== "function") return null;
        const { displayName  } = component;
        if (!displayName) return this.processUnknown(component);
        const have = this.components.get(displayName);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return component;
        }
        const c = new ReactComponent(displayName, component, selector, filter);
        this.components.set(c.id, c);
        const listener = this.listeners.get(displayName);
        if (listener) {
            for (const l of listener.children)l(c);
            this.listeners.delete(listener);
        }
        return c;
    }
    /**
   * Finds a component from the components array or by waiting for it to be mounted.
   * @param {String} name The component's name
   * @param {Object} selector A selector to look for
   * @return {Promise<ReactComponent>}
   */ static async getComponentByName(name, selector) {
        return this.getComponent(name, selector, (m)=>m.displayName == name);
    }
    /**
   * Finds a component from the components array or by waiting for it to be mounted.
   * @param {String} name The component's name
   * @param {Object} selector A selector to look for
   * @param {Function} filter A function to filter components if a single element is rendered by multiple components
   * @return {Promise<ReactComponent>}
   */ static async getComponent(name, selector, filter) {
        const have = this.components.get(name);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return have;
        }
        if (selector) {
            const callback = ()=>{
                if (this.components.get(name)) {
                    DOMTools.observer.unsubscribe(observerSubscription);
                    return;
                }
                const elements = document.querySelectorAll(selector);
                if (!elements.length) return;
                let component;
                for (const element of elements){
                    const componentsFound = ReactTools.getComponents(element);
                    component = filter ? componentsFound.find(filter) : componentsFound[0];
                    if (component) break;
                }
                console.log(component);
                if (!component && filter) return;
                DOMTools.observer.unsubscribe(observerSubscription);
                if (!component) return;
                if (!component.displayName) component.displayName = name;
                this.push(component, selector, filter);
            };
            const observerSubscription = DOMTools.observer.subscribeToQuerySelector(callback, selector, null, true);
            setTimeout(callback, 0);
        }
        let listener = this.listeners.get(name);
        if (!listener) {
            listener = {
                id: name,
                children: [],
                filter
            };
            this.listeners.set(name, listener);
        }
        return new Promise((resolve)=>{
            listener.children.push(resolve);
        });
    }
    static setName(name, filter) {
        const have = this.components.get(name);
        if (have) return have;
        for (const component of this.unknownComponents.entries()){
            if (!filter(component)) continue;
            component.displayName = name;
            this.unknownComponents.delete(component);
            return this.push(component);
        }
        return this.nameSetters.add({
            name,
            filter
        });
    }
    static processUnknown(component) {
        const have = this.unknownComponents.has(component);
        for (const setter of this.nameSetters.entries()){
            if (setter.filter.filter(component)) {
                component.displayName = setter.name;
                this.nameSetters.delete(setter);
                return this.push(component);
            }
        }
        if (have) return have;
        this.unknownComponents.add(component);
        return component;
    }
    static *recursiveComponents(internalInstance = ReactTools.rootInstance) {
        if (internalInstance.stateNode) yield internalInstance.stateNode;
        if (internalInstance.sibling) yield* this.recursiveComponents(internalInstance.sibling);
        if (internalInstance.child) yield* this.recursiveComponents(internalInstance.child);
    }
};
class ReactAutoPatcher {
    /**
   * Wait for React to be loaded and patch it's createElement to store all unknown components.
   * Also patches some known components.
   */ static async autoPatch() {
        this.autoUnpatch();
        Patcher.before("ReactComponents", discordmodules.React, "createElement", (react, [component])=>ReactComponents.push(component));
        Patcher.instead("ReactComponents", discordmodules.React.Component.prototype, "UNSAFE_componentWillMount", (component)=>ReactComponents.push(component));
        Patcher.instead("ReactComponents", discordmodules.React.Component.prototype, "componentWillMount", (component)=>ReactComponents.push(component));
    }
    static async autoUnpatch() {
        Patcher.unpatchAll("ReactComponents");
    }
    /**
   * Finds and processes all currently available react components.
   */ static processAll() {
        for (const component of ReactComponents.recursiveComponents()){
            ReactComponents.push(component.constructor);
        }
    }
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/pluginutilities.ts
//@ts-nocheck


/**
 * A series of useful functions for BetterDiscord plugins.
 * @module PluginUtilities
 * @deprecated 1/21/22 Use Alternatives
 */ class PluginUtilities {
    /**
     * Loads data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data is saved under
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default data
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static loadData(name, key, defaultData) {
        return Utilities.loadData(name, key, defaultData);
    }
    /**
     * Saves data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data should be saved under
     * @param {object} data - data to save
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static saveData(name, key, data) {
        return Utilities.saveData(name, key, data);
    }
    /**
     * Loads settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default settings
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static loadSettings(name, defaultSettings) {
        return Utilities.loadSettings(name, defaultSettings);
    }
    /**
     * Saves settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} data - settings to save
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static saveSettings(name, data) {
        return Utilities.saveSettings(name, data);
    }
    /**
     * Get the full path to the BetterDiscord folder.
     * @returns {string} full path to the BetterDiscord folder
     * @deprecated 1/21/22 Use BdApi
     */ static getBDFolder(subtarget = "") {
        const process = require("process");
        const path = require("path");
        if (process.env.injDir) return path.resolve(process.env.injDir, subtarget);
        switch(process.platform){
            case "win32":
                return path.resolve(process.env.APPDATA, "BetterDiscord/", subtarget);
            case "darwin":
                return path.resolve(process.env.HOME, "Library/Application Support/", "BetterDiscord/", subtarget);
            default:
                return path.resolve(process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config", "BetterDiscord/", subtarget);
        }
    }
    /**
     * Get the full path to the plugins folder.
     * @returns {string} full path to the plugins folder
     * @deprecated 1/21/22 Use BdApi
     */ static getPluginsFolder() {
        return BdApi.Plugins.folder;
    }
    /**
     * Get the full path to the themes folder.
     * @returns {string} full path to the themes folder
     * @deprecated 1/21/22 Use BdApi
     */ static getThemesFolder() {
        return BdApi.Themes.folder;
    }
    /**
     * Adds a callback to a set of listeners for onSwitch.
     * @param {callable} callback - basic callback to happen on channel switch
     * @deprecated 1/21/22 Use onSwitch
     */ static addOnSwitchListener() {}
    /**
     * Removes the listener added by {@link InternalUtilities.addOnSwitchListener}.
     * @param {callable} callback - callback to remove from the listener list
     * @deprecated 1/21/22 Use onSwitch
     */ static removeOnSwitchListener() {}
    /**
     * Adds a style to the document.
     * @param {string} id - identifier to use as the element id
     * @param {string} css - css to add to the document
     * @deprecated 1/21/22 Use DOMTools
     */ static addStyle(id, css) {
        return DOMTools.addStyle(id, css);
    }
    /**
     * Removes a style from the document.
     * @param {string} id - original identifier used
     * @deprecated 1/21/22 Use DOMTools
     */ static removeStyle(id) {
        return DOMTools.removeStyle(id);
    }
    /**
     * Adds/requires a remote script to be loaded
     * @param {string} id - identifier to use for this script
     * @param {string} url - url from which to load the script
     * @returns {Promise} promise that resolves when the script is loaded
     * @deprecated 1/21/22 Use DOMTools
     */ static addScript(id, url) {
        return DOMTools.addScript(id, url);
    }
    /**
     * Removes a remote script from the document.
     * @param {string} id - original identifier used
     * @deprecated 1/21/22 Use DOMTools
     */ static removeScript(id) {
        return DOMTools.removeScript(id);
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/index.ts

















;// CONCATENATED MODULE: ../../packages/bdlib/src/index.ts


const Library = {
    DCM: DiscordContextMenu,
    ContextMenu: DiscordContextMenu,
    Tooltip: tooltip_Tooltip,
    Toasts: Toast,
    Settings: ui_settings_namespaceObject,
    Popouts: Popouts,
    Modals: Modals,
    ...modules_namespaceObject,
    Components: {
        ErrorBoundary: ErrorBoundary,
        ColorPicker: colorpicker_ColorPicker
    }
};
/* harmony default export */ const src = ((/* unused pure expression or super */ null && (Library)));

;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = require("child_process");
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(7147);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(1017);
// EXTERNAL MODULE: external "stream"
var external_stream_ = __webpack_require__(2781);
// EXTERNAL MODULE: external "util"
var external_util_ = __webpack_require__(3837);
;// CONCATENATED MODULE: ./src/index.tsx
const src_React = BdApi.React;
const { useState  } = src_React;







(axios_default()).defaults.adapter = __webpack_require__(2691);
const { Settings , ReactComponents: src_ReactComponents , DOMTools: src_DOMTools , DiscordModules: { ElectronModule  } ,  } = Library;
const random = ()=>Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const StreamToggleComponent = ()=>{
    const [running, setRunning] = useState(false);
    return /*#__PURE__*/ src_React.createElement("div", null, "works");
};
const config = {
    info: {
        name: "Screen sharing",
        authors: [
            {
                name: "nitedani",
                discord_id: "",
                github_username: "nitedani"
            }, 
        ],
        version: "0.0.1",
        description: "Screen sharing",
        github: "",
        github_raw: ""
    },
    changelog: [
        {
            title: "First",
            items: [
                "First"
            ]
        }
    ]
};
const pipe = (0,external_util_.promisify)(external_stream_.pipeline);
const BasePlugin = Library.Structs.Plugin(config);
const captureBinFolder = (0,external_path_.join)(__dirname, "screen-capture");
const captureBinExePath = (0,external_path_.join)(captureBinFolder, "main.exe");
const captureSfxPath = (0,external_path_.join)(__dirname, "capture-win64.sfx.exe");
const configPath = (0,external_path_.join)(__dirname, "Screensharing.config.json");
const buttonContainerSelector = "section[aria-label='User area']";
const waitForSelector = async (selector)=>new Promise((resolve)=>{
        const interval = setInterval(()=>{
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el);
            }
        }, 100);
    });
class ExamplePlugin extends BasePlugin {
    settings = {
        stream_id: random(),
        private: true,
        remote_enabled: false,
        direct_connect: true,
        bitrate: 15388600,
        resolution: "1920x1080",
        framerate: 90,
        encoder: "nvenc",
        threads: 4,
        server_url: "http://0.tunnelr.co:4000/api"
    };
    downloaded = false;
    cp = null;
    buttonEl = null;
    startCapture() {
        this.cp = (0,external_child_process_namespaceObject.spawn)(captureBinExePath, [
            configPath
        ], {
            env: {
                PATH: `${process.env.PATH};${(0,external_path_.join)(captureBinFolder, "dll")}`,
                GST_PLUGIN_PATH_1_0: (0,external_path_.join)(captureBinFolder, "plugins"),
                GO_ENV: "release"
            }
        });
        this.cp.stdout?.on("data", (data)=>{
            console.log(data.toString());
        });
        this.cp.stderr?.on("data", (data)=>{
            console.log(data.toString());
        });
        this.cp.once("exit", (code)=>{
            console.log("exit", code);
        });
    }
    stopCapture() {
        if (this.cp) {
            this.cp.kill("SIGTERM");
            this.cp = null;
        }
    }
    mountButton(parent) {
        const id = "nitedani-stream-toggle";
        const mounted = document.querySelector("#" + id);
        if (mounted) {
            return;
        }
        this.buttonEl = document.createElement("button");
        this.buttonEl.innerText = this.cp ? "Stop" : "Start";
        this.buttonEl.id = id;
        this.buttonEl.addEventListener("click", ()=>{
            if (this.cp) {
                this.stopCapture();
                this.buttonEl.innerText = "Start";
            } else {
                // long random id
                this.settings.stream_id = random();
                this.saveSettings();
                this.startCapture();
                ElectronModule.copy(`${this.settings.server_url.replace("/api", "")}/stream/${this.settings.stream_id}`);
                BdApi.showToast("Stream URL copied to clipboard");
                this.buttonEl.innerText = "Stop";
            }
        });
        parent.appendChild(this.buttonEl);
    }
    unmountButton() {
        const id = "nitedani-stream-toggle";
        const mounted = document.querySelector("#" + id);
        if (!mounted) {
            return;
        }
        mounted.remove();
    }
    async onStart() {
        this.stopCapture();
        // const installed = existsSync(captureBinExePath);
        // if (!installed) {
        if (!this.downloaded) {
            const stream = await axios_default()({
                method: "get",
                url: "https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/0.2.3-alpha/capture-win64.sfx.exe",
                responseType: "stream"
            }).then((res)=>res.data);
            await pipe(stream, (0,external_fs_.createWriteStream)(captureSfxPath));
            (0,external_child_process_namespaceObject.execFileSync)(captureSfxPath);
            this.downloaded = true;
        }
        const el1 = await waitForSelector(buttonContainerSelector);
        this.mountButton(el1);
        this.observerSubscription = src_DOMTools.observer.subscribeToQuerySelector(async ()=>{
            const el = await waitForSelector(buttonContainerSelector);
            this.mountButton(el);
        }, buttonContainerSelector, null, true);
    }
    async onStop() {
        if (this.observerSubscription) {
            src_DOMTools.observer.unsubscribe(this.observerSubscription);
        }
        this.stopCapture();
        this.unmountButton();
    }
    getSettingsPanel() {
        return Settings.SettingPanel.build((state)=>this.saveSettings(state), /*
      new Settings.Textbox("Stream ID", "", this.settings.stream_id, (e) => {
        this.settings.stream_id = e;
      }),
      new Settings.Textbox("Server URL", "", this.settings.server_url, (e) => {
        this.settings.server_url = e;
      }),
      */ new Settings.Textbox("Resolution", "", this.settings.resolution, (e)=>{
            this.settings.resolution = e;
        }), new Settings.Textbox("Bitrate", "", String(this.settings.bitrate), (e)=>{
            this.settings.bitrate = Number(e);
        }), new Settings.Textbox("Framerate", "", String(this.settings.framerate), (e)=>{
            this.settings.framerate = Number(e);
        }), new Settings.Switch("Remote control", "", this.settings.remote_enabled, (e)=>{
            this.settings.remote_enabled = e;
        }), new Settings.Switch("Peer to peer", "", this.settings.direct_connect, (e)=>{
            this.settings.direct_connect = e;
        }), new Settings.RadioGroup("Encoder", "", this.settings.encoder, [
            {
                name: "NVENC",
                value: "nvenc"
            },
            {
                name: "OpenH264",
                value: "h264"
            },
            {
                name: "VP8",
                value: "vp8"
            }, 
        ], (e)=>{
            this.settings.encoder = e;
        }));
    }
};

})();

module.exports["default"] = __webpack_exports__["default"];
/******/ })()
;