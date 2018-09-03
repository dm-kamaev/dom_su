/*!
 * Platform.js v1.3.1 <http://mths.be/platform>
 * Copyright 2014-2016 Benjamin Tan <https://d10.github.io/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object` */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object */
  var oldRoot = root;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Opera regexp */
  var reOpera = /\bOpera/;

  /** Possible global object */
  var thisBinding = this;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // platform tokens defined at
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '6.4':  '10',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // detect Windows version from platform tokens
    if (pattern && label && /^Win/i.test(os) &&
        (data = data[0/*Opera 9.25 fix*/, /[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // correct character case and cleanup
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object */
    var context = root;

    /** Used to flag when a custom context is provided */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // juggle arguments
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object */
    var nav = context.navigator || {};

    /** Browser user agent string */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope] */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environment */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based)
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]` */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime */
    var data;

    /** The CPU architecture */
    var arch = ua;

    /** Platform description array */
    var description = [];

    /** Platform alpha/beta indicator */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform */
    var useFeatures = ua == userAgent;

    /** The browser/environment version */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important) */
    var layout = getLayout([
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important) */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Nook Browser',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important) */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nook',
      'PlayBook',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation Vita',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable OSes (order is important) */
    var os = getOS([
      'Windows Phone ',
      'Android',
      'CentOS',
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // lookup the manufacturer by product or scan the UA for the manufacturer
        return result || (
          value[product] ||
          value[0/*Opera 9.25 fix*/, /^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // split by forward slash and append product version if needed
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // correct character case and cleanup
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array so we can add extra details
    layout && (layout = [layout]);

    // detect product names that contain their manufacturer's name
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // clean up Google TV
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // detect simulators
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // detect iOS
    if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // detect Kubuntu
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // detect Android browsers
    else if (manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // detect false positives for Firefox/Safari
    else if (!name || (data = !/\bMinefield\b|\(Android;/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // escape the `/` for Firefox 1
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // clear name of false positives
        name = null;
      }
      // reassign a generic name
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // detect Firefox OS
    if ((data = /\((Mobile|Tablet).*?Firefox\b/i.exec(ua)) && data[1]) {
      os = 'Firefox OS';
      if (!product) {
        product = data[1];
      }
    }
    // detect non-Opera versions (order is important)
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // detect stubborn layout engines
    if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    } else if (
        layout != 'Trident' &&
        (data =
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')
        )
    ) {
      layout = [data];
    }
    // detect NetFront on PlayStation
    else if (/\bPlayStation\b(?! Vita\b)/i.test(name) && layout == 'WebKit') {
      layout = ['NetFront'];
    }
    // detect Windows Phone 7 desktop mode
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // detect Windows Phone 8+ desktop mode
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8+';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // detect IE 11 and above
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (!/\bWPDesktop\b/i.test(ua)) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
      }
      version = data[1];
    }
    // detect Microsoft Edge
    else if ((name == 'Chrome' || name != 'IE') && (data = /\bEdge\/([\d.]+)/.exec(ua))) {
      name = 'Microsoft Edge';
      version = data[1];
      layout = ['Trident'];
    }
    // leverage environment features
    if (useFeatures) {
      // detect server-side environments
      // Rhino has a global function while others have a global object
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (typeof context.process == 'object' && (data = context.process)) {
          name = 'Node.js';
          arch = data.arch;
          os = data.platform;
          version = /[\d.]+/.exec(data.version)[0];
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // detect Adobe AIR
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // detect PhantomJS
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // detect IE compatibility modes
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // we're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      os = os && format(os);
    }
    // detect prerelease phases
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // detect Firefox Mobile
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // obscure Maxthon's unreliable version
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // detect Silk desktop/accelerated modes
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // detect Xbox 360 and Xbox One
    else if (/\bXbox\b/i.test(product)) {
      os = null;
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // add mobile postfix
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && useFeatures && context.external === null) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // detect Opera identifying/masking itself as another browser
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && (
          product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          )
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {

      // when "indentifying", the UA contains both Opera and the other browser's name
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // when "masking", the UA contains only the other browser's name
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // detect WebKit Nightly and approximate Chrome/Safari versions
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // correct build for numeric comparison
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // nightly builds are postfixed with a `+`
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // clear incorrect browser versions
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // use the full Chrome version when available
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // detect Blink layout engine
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && name != 'IE' && name != 'Microsoft Edge') {
        layout = ['Blink'];
      }
      // detect JavaScriptCore
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // add the postfix of ".x" or "+" for approximate versions
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // obscure version for some Safari 1-2 releases
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // detect Opera desktop modes
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // detect Chrome desktop mode
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // strip incorrect OS versions
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // add layout engine
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
      // don't add layout details to description if they are falsey
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((/^on /.test(description[description.length -1]) ? '' : 'on ') + product);
    }
    // parse OS into an object
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // add browser/OS architecture
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // export platform
  // some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return parse();
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Narwhal, Node.js, Rhino -require, or RingoJS
    forOwn(parse(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // in a browser or Rhino
  else {
    root.platform = parse();
  }
}.call(this));

/* perfect-scrollbar v0.6.13 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ps = require('../main');

if (typeof define === 'function' && define.amd) {
  // AMD
  define(ps);
} else {
  // Add to a global object.
  window.PerfectScrollbar = ps;
  if (typeof window.Ps === 'undefined') {
    window.Ps = ps;
  }
}

},{"../main":7}],2:[function(require,module,exports){
'use strict';

function oldAdd(element, className) {
  var classes = element.className.split(' ');
  if (classes.indexOf(className) < 0) {
    classes.push(className);
  }
  element.className = classes.join(' ');
}

function oldRemove(element, className) {
  var classes = element.className.split(' ');
  var idx = classes.indexOf(className);
  if (idx >= 0) {
    classes.splice(idx, 1);
  }
  element.className = classes.join(' ');
}

exports.add = function (element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    oldAdd(element, className);
  }
};

exports.remove = function (element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    oldRemove(element, className);
  }
};

exports.list = function (element) {
  if (element.classList) {
    return Array.prototype.slice.apply(element.classList);
  } else {
    return element.className.split(' ');
  }
};

},{}],3:[function(require,module,exports){
'use strict';

var DOM = {};

DOM.e = function (tagName, className) {
  var element = document.createElement(tagName);
  element.className = className;
  return element;
};

DOM.appendTo = function (child, parent) {
  parent.appendChild(child);
  return child;
};

function cssGet(element, styleName) {
  return window.getComputedStyle(element)[styleName];
}

function cssSet(element, styleName, styleValue) {
  if (typeof styleValue === 'number') {
    styleValue = styleValue.toString() + 'px';
  }
  element.style[styleName] = styleValue;
  return element;
}

function cssMultiSet(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val.toString() + 'px';
    }
    element.style[key] = val;
  }
  return element;
}

DOM.css = function (element, styleNameOrObject, styleValue) {
  if (typeof styleNameOrObject === 'object') {
    // multiple set with object
    return cssMultiSet(element, styleNameOrObject);
  } else {
    if (typeof styleValue === 'undefined') {
      return cssGet(element, styleNameOrObject);
    } else {
      return cssSet(element, styleNameOrObject, styleValue);
    }
  }
};

DOM.matches = function (element, query) {
  if (typeof element.matches !== 'undefined') {
    return element.matches(query);
  } else {
    if (typeof element.matchesSelector !== 'undefined') {
      return element.matchesSelector(query);
    } else if (typeof element.webkitMatchesSelector !== 'undefined') {
      return element.webkitMatchesSelector(query);
    } else if (typeof element.mozMatchesSelector !== 'undefined') {
      return element.mozMatchesSelector(query);
    } else if (typeof element.msMatchesSelector !== 'undefined') {
      return element.msMatchesSelector(query);
    }
  }
};

DOM.remove = function (element) {
  if (typeof element.remove !== 'undefined') {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
};

DOM.queryChildren = function (element, selector) {
  return Array.prototype.filter.call(element.childNodes, function (child) {
    return DOM.matches(child, selector);
  });
};

module.exports = DOM;

},{}],4:[function(require,module,exports){
'use strict';

var EventElement = function (element) {
  this.element = element;
  this.events = {};
};

EventElement.prototype.bind = function (eventName, handler) {
  if (typeof this.events[eventName] === 'undefined') {
    this.events[eventName] = [];
  }
  this.events[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function (eventName, handler) {
  var isHandlerProvided = (typeof handler !== 'undefined');
  this.events[eventName] = this.events[eventName].filter(function (hdlr) {
    if (isHandlerProvided && hdlr !== handler) {
      return true;
    }
    this.element.removeEventListener(eventName, hdlr, false);
    return false;
  }, this);
};

EventElement.prototype.unbindAll = function () {
  for (var name in this.events) {
    this.unbind(name);
  }
};

var EventManager = function () {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function (element) {
  var ee = this.eventElements.filter(function (eventElement) {
    return eventElement.element === element;
  })[0];
  if (typeof ee === 'undefined') {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function (element, eventName, handler) {
  this.eventElement(element).unbind(eventName, handler);
};

EventManager.prototype.unbindAll = function () {
  for (var i = 0; i < this.eventElements.length; i++) {
    this.eventElements[i].unbindAll();
  }
};

EventManager.prototype.once = function (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (e) {
    ee.unbind(eventName, onceHandler);
    handler(e);
  };
  ee.bind(eventName, onceHandler);
};

module.exports = EventManager;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

},{}],6:[function(require,module,exports){
'use strict';

var cls = require('./class');
var dom = require('./dom');

var toInt = exports.toInt = function (x) {
  return parseInt(x, 10) || 0;
};

var clone = exports.clone = function (obj) {
  if (!obj) {
    return null;
  } else if (obj.constructor === Array) {
    return obj.map(clone);
  } else if (typeof obj === 'object') {
    var result = {};
    for (var key in obj) {
      result[key] = clone(obj[key]);
    }
    return result;
  } else {
    return obj;
  }
};

exports.extend = function (original, source) {
  var result = clone(original);
  for (var key in source) {
    result[key] = clone(source[key]);
  }
  return result;
};

exports.isEditable = function (el) {
  return dom.matches(el, "input,[contenteditable]") ||
         dom.matches(el, "select,[contenteditable]") ||
         dom.matches(el, "textarea,[contenteditable]") ||
         dom.matches(el, "button,[contenteditable]");
};

exports.removePsClasses = function (element) {
  var clsList = cls.list(element);
  for (var i = 0; i < clsList.length; i++) {
    var className = clsList[i];
    if (className.indexOf('ps-') === 0) {
      cls.remove(element, className);
    }
  }
};

exports.outerWidth = function (element) {
  return toInt(dom.css(element, 'width')) +
         toInt(dom.css(element, 'paddingLeft')) +
         toInt(dom.css(element, 'paddingRight')) +
         toInt(dom.css(element, 'borderLeftWidth')) +
         toInt(dom.css(element, 'borderRightWidth'));
};

exports.startScrolling = function (element, axis) {
  cls.add(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.add(element, 'ps-' + axis);
  } else {
    cls.add(element, 'ps-x');
    cls.add(element, 'ps-y');
  }
};

exports.stopScrolling = function (element, axis) {
  cls.remove(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.remove(element, 'ps-' + axis);
  } else {
    cls.remove(element, 'ps-x');
    cls.remove(element, 'ps-y');
  }
};

exports.env = {
  isWebKit: 'WebkitAppearance' in document.documentElement.style,
  supportsTouch: (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
  supportsIePointer: window.navigator.msMaxTouchPoints !== null
};

},{"./class":2,"./dom":3}],7:[function(require,module,exports){
'use strict';

var destroy = require('./plugin/destroy');
var initialize = require('./plugin/initialize');
var update = require('./plugin/update');

module.exports = {
  initialize: initialize,
  update: update,
  destroy: destroy
};

},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(require,module,exports){
'use strict';

module.exports = {
  handlers: ['click-rail', 'drag-scrollbar', 'keyboard', 'wheel', 'touch'],
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  suppressScrollX: false,
  suppressScrollY: false,
  swipePropagation: true,
  useBothWheelAxes: false,
  wheelPropagation: false,
  wheelSpeed: 1,
  theme: 'default'
};

},{}],9:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var dom = require('../lib/dom');
var instances = require('./instances');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  i.event.unbindAll();
  dom.remove(i.scrollbarX);
  dom.remove(i.scrollbarY);
  dom.remove(i.scrollbarXRail);
  dom.remove(i.scrollbarYRail);
  _.removePsClasses(element);

  instances.remove(element);
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindClickRailHandler(element, i) {
  function pageOffset(el) {
    return el.getBoundingClientRect();
  }
  var stopPropagation = function (e) { e.stopPropagation(); };

  i.event.bind(i.scrollbarY, 'click', stopPropagation);
  i.event.bind(i.scrollbarYRail, 'click', function (e) {
    var positionTop = e.pageY - window.pageYOffset - pageOffset(i.scrollbarYRail).top;
    var direction = positionTop > i.scrollbarYTop ? 1 : -1;

    updateScroll(element, 'top', element.scrollTop + direction * i.containerHeight);
    updateGeometry(element);

    e.stopPropagation();
  });

  i.event.bind(i.scrollbarX, 'click', stopPropagation);
  i.event.bind(i.scrollbarXRail, 'click', function (e) {
    var positionLeft = e.pageX - window.pageXOffset - pageOffset(i.scrollbarXRail).left;
    var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;

    updateScroll(element, 'left', element.scrollLeft + direction * i.containerWidth);
    updateGeometry(element);

    e.stopPropagation();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindClickRailHandler(element, i);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var dom = require('../../lib/dom');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindMouseScrollXHandler(element, i) {
  var currentLeft = null;
  var currentPageX = null;

  function updateScrollLeft(deltaX) {
    var newLeft = currentLeft + (deltaX * i.railXRatio);
    var maxLeft = Math.max(0, i.scrollbarXRail.getBoundingClientRect().left) + (i.railXRatio * (i.railXWidth - i.scrollbarXWidth));

    if (newLeft < 0) {
      i.scrollbarXLeft = 0;
    } else if (newLeft > maxLeft) {
      i.scrollbarXLeft = maxLeft;
    } else {
      i.scrollbarXLeft = newLeft;
    }

    var scrollLeft = _.toInt(i.scrollbarXLeft * (i.contentWidth - i.containerWidth) / (i.containerWidth - (i.railXRatio * i.scrollbarXWidth))) - i.negativeScrollAdjustment;
    updateScroll(element, 'left', scrollLeft);
  }

  var mouseMoveHandler = function (e) {
    updateScrollLeft(e.pageX - currentPageX);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    _.stopScrolling(element, 'x');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarX, 'mousedown', function (e) {
    currentPageX = e.pageX;
    currentLeft = _.toInt(dom.css(i.scrollbarX, 'left')) * i.railXRatio;
    _.startScrolling(element, 'x');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

function bindMouseScrollYHandler(element, i) {
  var currentTop = null;
  var currentPageY = null;

  function updateScrollTop(deltaY) {
    var newTop = currentTop + (deltaY * i.railYRatio);
    var maxTop = Math.max(0, i.scrollbarYRail.getBoundingClientRect().top) + (i.railYRatio * (i.railYHeight - i.scrollbarYHeight));

    if (newTop < 0) {
      i.scrollbarYTop = 0;
    } else if (newTop > maxTop) {
      i.scrollbarYTop = maxTop;
    } else {
      i.scrollbarYTop = newTop;
    }

    var scrollTop = _.toInt(i.scrollbarYTop * (i.contentHeight - i.containerHeight) / (i.containerHeight - (i.railYRatio * i.scrollbarYHeight)));
    updateScroll(element, 'top', scrollTop);
  }

  var mouseMoveHandler = function (e) {
    updateScrollTop(e.pageY - currentPageY);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    _.stopScrolling(element, 'y');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarY, 'mousedown', function (e) {
    currentPageY = e.pageY;
    currentTop = _.toInt(dom.css(i.scrollbarY, 'top')) * i.railYRatio;
    _.startScrolling(element, 'y');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseScrollXHandler(element, i);
  bindMouseScrollYHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var dom = require('../../lib/dom');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindKeyboardHandler(element, i) {
  var hovered = false;
  i.event.bind(element, 'mouseenter', function () {
    hovered = true;
  });
  i.event.bind(element, 'mouseleave', function () {
    hovered = false;
  });

  var shouldPrevent = false;
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if ((e.isDefaultPrevented && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    var focused = dom.matches(i.scrollbarX, ':focus') ||
                  dom.matches(i.scrollbarY, ':focus');

    if (!hovered && !focused) {
      return;
    }

    var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
    if (activeElement) {
      if (activeElement.tagName === 'IFRAME') {
        activeElement = activeElement.contentDocument.activeElement;
      } else {
        // go deeper if element is a webcomponent
        while (activeElement.shadowRoot) {
          activeElement = activeElement.shadowRoot.activeElement;
        }
      }
      if (_.isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
    case 37: // left
      if (e.metaKey) {
        deltaX = -i.contentWidth;
      } else if (e.altKey) {
        deltaX = -i.containerWidth;
      } else {
        deltaX = -30;
      }
      break;
    case 38: // up
      if (e.metaKey) {
        deltaY = i.contentHeight;
      } else if (e.altKey) {
        deltaY = i.containerHeight;
      } else {
        deltaY = 30;
      }
      break;
    case 39: // right
      if (e.metaKey) {
        deltaX = i.contentWidth;
      } else if (e.altKey) {
        deltaX = i.containerWidth;
      } else {
        deltaX = 30;
      }
      break;
    case 40: // down
      if (e.metaKey) {
        deltaY = -i.contentHeight;
      } else if (e.altKey) {
        deltaY = -i.containerHeight;
      } else {
        deltaY = -30;
      }
      break;
    case 33: // page up
      deltaY = 90;
      break;
    case 32: // space bar
      if (e.shiftKey) {
        deltaY = 90;
      } else {
        deltaY = -90;
      }
      break;
    case 34: // page down
      deltaY = -90;
      break;
    case 35: // end
      if (e.ctrlKey) {
        deltaY = -i.contentHeight;
      } else {
        deltaY = -i.containerHeight;
      }
      break;
    case 36: // home
      if (e.ctrlKey) {
        deltaY = element.scrollTop;
      } else {
        deltaY = i.containerHeight;
      }
      break;
    default:
      return;
    }

    updateScroll(element, 'top', element.scrollTop - deltaY);
    updateScroll(element, 'left', element.scrollLeft + deltaX);
    updateGeometry(element);

    shouldPrevent = shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent) {
      e.preventDefault();
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindKeyboardHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindMouseWheelHandler(element, i) {
  var shouldPrevent = false;

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
      // OS X Safari
      deltaX = -1 * e.wheelDeltaX / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY/* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    if (e.shiftKey) {
      // reverse axis with shift key
      return [-deltaY, -deltaX];
    }
    return [deltaX, deltaY];
  }

  function shouldBeConsumedByChild(deltaX, deltaY) {
    var child = element.querySelector('textarea:hover, select[multiple]:hover, .ps-child:hover');
    if (child) {
      if (!window.getComputedStyle(child).overflow.match(/(scroll|auto)/)) {
        // if not scrollable
        return false;
      }

      var maxScrollTop = child.scrollHeight - child.clientHeight;
      if (maxScrollTop > 0) {
        if (!(child.scrollTop === 0 && deltaY > 0) && !(child.scrollTop === maxScrollTop && deltaY < 0)) {
          return true;
        }
      }
      var maxScrollLeft = child.scrollLeft - child.clientWidth;
      if (maxScrollLeft > 0) {
        if (!(child.scrollLeft === 0 && deltaX < 0) && !(child.scrollLeft === maxScrollLeft && deltaX > 0)) {
          return true;
        }
      }
    }
    return false;
  }

  function mousewheelHandler(e) {
    var delta = getDeltaFromEvent(e);

    var deltaX = delta[0];
    var deltaY = delta[1];

    if (shouldBeConsumedByChild(deltaX, deltaY)) {
      return;
    }

    shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'top', element.scrollTop + (deltaX * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'left', element.scrollLeft - (deltaY * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    }

    updateGeometry(element);

    shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
    if (shouldPrevent) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== "undefined") {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== "undefined") {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseWheelHandler(element, i);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');

function bindNativeScrollHandler(element, i) {
  i.event.bind(element, 'scroll', function () {
    updateGeometry(element);
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindNativeScrollHandler(element, i);
};

},{"../instances":18,"../update-geometry":19}],15:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindSelectionHandler(element, i) {
  function getRangeNode() {
    var selection = window.getSelection ? window.getSelection() :
                    document.getSelection ? document.getSelection() : '';
    if (selection.toString().length === 0) {
      return null;
    } else {
      return selection.getRangeAt(0).commonAncestorContainer;
    }
  }

  var scrollingLoop = null;
  var scrollDiff = {top: 0, left: 0};
  function startScrolling() {
    if (!scrollingLoop) {
      scrollingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(scrollingLoop);
          return;
        }

        updateScroll(element, 'top', element.scrollTop + scrollDiff.top);
        updateScroll(element, 'left', element.scrollLeft + scrollDiff.left);
        updateGeometry(element);
      }, 50); // every .1 sec
    }
  }
  function stopScrolling() {
    if (scrollingLoop) {
      clearInterval(scrollingLoop);
      scrollingLoop = null;
    }
    _.stopScrolling(element);
  }

  var isSelected = false;
  i.event.bind(i.ownerDocument, 'selectionchange', function () {
    if (element.contains(getRangeNode())) {
      isSelected = true;
    } else {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'mouseup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'keyup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });

  i.event.bind(window, 'mousemove', function (e) {
    if (isSelected) {
      var mousePosition = {x: e.pageX, y: e.pageY};
      var containerGeometry = {
        left: element.offsetLeft,
        right: element.offsetLeft + element.offsetWidth,
        top: element.offsetTop,
        bottom: element.offsetTop + element.offsetHeight
      };

      if (mousePosition.x < containerGeometry.left + 3) {
        scrollDiff.left = -5;
        _.startScrolling(element, 'x');
      } else if (mousePosition.x > containerGeometry.right - 3) {
        scrollDiff.left = 5;
        _.startScrolling(element, 'x');
      } else {
        scrollDiff.left = 0;
      }

      if (mousePosition.y < containerGeometry.top + 3) {
        if (containerGeometry.top + 3 - mousePosition.y < 5) {
          scrollDiff.top = -5;
        } else {
          scrollDiff.top = -20;
        }
        _.startScrolling(element, 'y');
      } else if (mousePosition.y > containerGeometry.bottom - 3) {
        if (mousePosition.y - containerGeometry.bottom + 3 < 5) {
          scrollDiff.top = 5;
        } else {
          scrollDiff.top = 20;
        }
        _.startScrolling(element, 'y');
      } else {
        scrollDiff.top = 0;
      }

      if (scrollDiff.top === 0 && scrollDiff.left === 0) {
        stopScrolling();
      } else {
        startScrolling();
      }
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindSelectionHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindTouchHandler(element, i, supportsTouch, supportsIePointer) {
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (((deltaY < 0) && (scrollTop === i.contentHeight - i.containerHeight)) ||
          ((deltaY > 0) && (scrollTop === 0))) {
        return !i.settings.swipePropagation;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (((deltaX < 0) && (scrollLeft === i.contentWidth - i.containerWidth)) ||
          ((deltaX > 0) && (scrollLeft === 0))) {
        return !i.settings.swipePropagation;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    updateScroll(element, 'top', element.scrollTop - differenceY);
    updateScroll(element, 'left', element.scrollLeft - differenceX);

    updateGeometry(element);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;
  var inGlobalTouch = false;
  var inLocalTouch = false;

  function globalTouchStart() {
    inGlobalTouch = true;
  }
  function globalTouchEnd() {
    inGlobalTouch = false;
  }

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }
  function shouldHandle(e) {
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
      return true;
    }
    return false;
  }
  function touchStart(e) {
    if (shouldHandle(e)) {
      inLocalTouch = true;

      var touch = getTouch(e);

      startOffset.pageX = touch.pageX;
      startOffset.pageY = touch.pageY;

      startTime = (new Date()).getTime();

      if (easingLoop !== null) {
        clearInterval(easingLoop);
      }

      e.stopPropagation();
    }
  }
  function touchMove(e) {
    if (!inLocalTouch && i.settings.swipePropagation) {
      touchStart(e);
    }
    if (!inGlobalTouch && inLocalTouch && shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = {pageX: touch.pageX, pageY: touch.pageY};

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = (new Date()).getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPreventDefault(differenceX, differenceY)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (!inGlobalTouch && inLocalTouch) {
      inLocalTouch = false;

      clearInterval(easingLoop);
      easingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(easingLoop);
          return;
        }

        if (!speed.x && !speed.y) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (supportsTouch) {
    i.event.bind(window, 'touchstart', globalTouchStart);
    i.event.bind(window, 'touchend', globalTouchEnd);
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  }

  if (supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(window, 'pointerdown', globalTouchStart);
      i.event.bind(window, 'pointerup', globalTouchEnd);
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(window, 'MSPointerDown', globalTouchStart);
      i.event.bind(window, 'MSPointerUp', globalTouchEnd);
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
}

module.exports = function (element) {
  if (!_.env.supportsTouch && !_.env.supportsIePointer) {
    return;
  }

  var i = instances.get(element);
  bindTouchHandler(element, i, _.env.supportsTouch, _.env.supportsIePointer);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var instances = require('./instances');
var updateGeometry = require('./update-geometry');

// Handlers
var handlers = {
  'click-rail': require('./handler/click-rail'),
  'drag-scrollbar': require('./handler/drag-scrollbar'),
  'keyboard': require('./handler/keyboard'),
  'wheel': require('./handler/mouse-wheel'),
  'touch': require('./handler/touch'),
  'selection': require('./handler/selection')
};
var nativeScrollHandler = require('./handler/native-scroll');

module.exports = function (element, userSettings) {
  userSettings = typeof userSettings === 'object' ? userSettings : {};

  cls.add(element, 'ps-container');

  // Create a plugin instance.
  var i = instances.add(element);

  i.settings = _.extend(i.settings, userSettings);
  cls.add(element, 'ps-theme-' + i.settings.theme);

  i.settings.handlers.forEach(function (handlerName) {
    handlers[handlerName](element);
  });

  nativeScrollHandler(element);

  updateGeometry(element);
};

},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var defaultSettings = require('./default-setting');
var dom = require('../lib/dom');
var EventManager = require('../lib/event-manager');
var guid = require('../lib/guid');

var instances = {};

function Instance(element) {
  var i = this;

  i.settings = _.clone(defaultSettings);
  i.containerWidth = null;
  i.containerHeight = null;
  i.contentWidth = null;
  i.contentHeight = null;

  i.isRtl = dom.css(element, 'direction') === "rtl";
  i.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
  i.event = new EventManager();
  i.ownerDocument = element.ownerDocument || document;

  function focus() {
    cls.add(element, 'ps-focus');
  }

  function blur() {
    cls.remove(element, 'ps-focus');
  }

  i.scrollbarXRail = dom.appendTo(dom.e('div', 'ps-scrollbar-x-rail'), element);
  i.scrollbarX = dom.appendTo(dom.e('div', 'ps-scrollbar-x'), i.scrollbarXRail);
  i.scrollbarX.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarX, 'focus', focus);
  i.event.bind(i.scrollbarX, 'blur', blur);
  i.scrollbarXActive = null;
  i.scrollbarXWidth = null;
  i.scrollbarXLeft = null;
  i.scrollbarXBottom = _.toInt(dom.css(i.scrollbarXRail, 'bottom'));
  i.isScrollbarXUsingBottom = i.scrollbarXBottom === i.scrollbarXBottom; // !isNaN
  i.scrollbarXTop = i.isScrollbarXUsingBottom ? null : _.toInt(dom.css(i.scrollbarXRail, 'top'));
  i.railBorderXWidth = _.toInt(dom.css(i.scrollbarXRail, 'borderLeftWidth')) + _.toInt(dom.css(i.scrollbarXRail, 'borderRightWidth'));
  // Set rail to display:block to calculate margins
  dom.css(i.scrollbarXRail, 'display', 'block');
  i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, 'marginLeft')) + _.toInt(dom.css(i.scrollbarXRail, 'marginRight'));
  dom.css(i.scrollbarXRail, 'display', '');
  i.railXWidth = null;
  i.railXRatio = null;

  i.scrollbarYRail = dom.appendTo(dom.e('div', 'ps-scrollbar-y-rail'), element);
  i.scrollbarY = dom.appendTo(dom.e('div', 'ps-scrollbar-y'), i.scrollbarYRail);
  i.scrollbarY.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarY, 'focus', focus);
  i.event.bind(i.scrollbarY, 'blur', blur);
  i.scrollbarYActive = null;
  i.scrollbarYHeight = null;
  i.scrollbarYTop = null;
  i.scrollbarYRight = _.toInt(dom.css(i.scrollbarYRail, 'right'));
  i.isScrollbarYUsingRight = i.scrollbarYRight === i.scrollbarYRight; // !isNaN
  i.scrollbarYLeft = i.isScrollbarYUsingRight ? null : _.toInt(dom.css(i.scrollbarYRail, 'left'));
  i.scrollbarYOuterWidth = i.isRtl ? _.outerWidth(i.scrollbarY) : null;
  i.railBorderYWidth = _.toInt(dom.css(i.scrollbarYRail, 'borderTopWidth')) + _.toInt(dom.css(i.scrollbarYRail, 'borderBottomWidth'));
  dom.css(i.scrollbarYRail, 'display', 'block');
  i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, 'marginTop')) + _.toInt(dom.css(i.scrollbarYRail, 'marginBottom'));
  dom.css(i.scrollbarYRail, 'display', '');
  i.railYHeight = null;
  i.railYRatio = null;
}

function getId(element) {
  return element.getAttribute('data-ps-id');
}

function setId(element, id) {
  element.setAttribute('data-ps-id', id);
}

function removeId(element) {
  element.removeAttribute('data-ps-id');
}

exports.add = function (element) {
  var newId = guid();
  setId(element, newId);
  instances[newId] = new Instance(element);
  return instances[newId];
};

exports.remove = function (element) {
  delete instances[getId(element)];
  removeId(element);
};

exports.get = function (element) {
  return instances[getId(element)];
};

},{"../lib/class":2,"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var dom = require('../lib/dom');
var instances = require('./instances');
var updateScroll = require('./update-scroll');

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = {width: i.railXWidth};
  if (i.isRtl) {
    xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + element.scrollTop;
  }
  dom.css(i.scrollbarXRail, xRailOffset);

  var yRailOffset = {top: element.scrollTop, height: i.railYHeight};
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  dom.css(i.scrollbarYRail, yRailOffset);

  dom.css(i.scrollbarX, {left: i.scrollbarXLeft, width: i.scrollbarXWidth - i.railBorderXWidth});
  dom.css(i.scrollbarY, {top: i.scrollbarYTop, height: i.scrollbarYHeight - i.railBorderYWidth});
}

module.exports = function (element) {
  var i = instances.get(element);

  i.containerWidth = element.clientWidth;
  i.containerHeight = element.clientHeight;
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  var existingRails;
  if (!element.contains(i.scrollbarXRail)) {
    existingRails = dom.queryChildren(element, '.ps-scrollbar-x-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        dom.remove(rail);
      });
    }
    dom.appendTo(i.scrollbarXRail, element);
  }
  if (!element.contains(i.scrollbarYRail)) {
    existingRails = dom.queryChildren(element, '.ps-scrollbar-y-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        dom.remove(rail);
      });
    }
    dom.appendTo(i.scrollbarYRail, element);
  }

  if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(i, _.toInt(i.railXWidth * i.containerWidth / i.contentWidth));
    i.scrollbarXLeft = _.toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
  } else {
    i.scrollbarXActive = false;
  }

  if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(i, _.toInt(i.railYHeight * i.containerHeight / i.contentHeight));
    i.scrollbarYTop = _.toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  if (i.scrollbarXActive) {
    cls.add(element, 'ps-active-x');
  } else {
    cls.remove(element, 'ps-active-x');
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    updateScroll(element, 'left', 0);
  }
  if (i.scrollbarYActive) {
    cls.add(element, 'ps-active-y');
  } else {
    cls.remove(element, 'ps-active-y');
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    updateScroll(element, 'top', 0);
  }
};

},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(require,module,exports){
'use strict';

var instances = require('./instances');

var lastTop;
var lastLeft;

var createDOMEvent = function (name) {
  var event = document.createEvent("Event");
  event.initEvent(name, true, true);
  return event;
};

module.exports = function (element, axis, value) {
  if (typeof element === 'undefined') {
    throw 'You must provide an element to the update-scroll function';
  }

  if (typeof axis === 'undefined') {
    throw 'You must provide an axis to the update-scroll function';
  }

  if (typeof value === 'undefined') {
    throw 'You must provide a value to the update-scroll function';
  }

  if (axis === 'top' && value <= 0) {
    element.scrollTop = value = 0; // don't allow negative scroll
    element.dispatchEvent(createDOMEvent('ps-y-reach-start'));
  }

  if (axis === 'left' && value <= 0) {
    element.scrollLeft = value = 0; // don't allow negative scroll
    element.dispatchEvent(createDOMEvent('ps-x-reach-start'));
  }

  var i = instances.get(element);

  if (axis === 'top' && value >= i.contentHeight - i.containerHeight) {
    // don't allow scroll past container
    value = i.contentHeight - i.containerHeight;
    if (value - element.scrollTop <= 1) {
      // mitigates rounding errors on non-subpixel scroll values
      value = element.scrollTop;
    } else {
      element.scrollTop = value;
    }
    element.dispatchEvent(createDOMEvent('ps-y-reach-end'));
  }

  if (axis === 'left' && value >= i.contentWidth - i.containerWidth) {
    // don't allow scroll past container
    value = i.contentWidth - i.containerWidth;
    if (value - element.scrollLeft <= 1) {
      // mitigates rounding errors on non-subpixel scroll values
      value = element.scrollLeft;
    } else {
      element.scrollLeft = value;
    }
    element.dispatchEvent(createDOMEvent('ps-x-reach-end'));
  }

  if (!lastTop) {
    lastTop = element.scrollTop;
  }

  if (!lastLeft) {
    lastLeft = element.scrollLeft;
  }

  if (axis === 'top' && value < lastTop) {
    element.dispatchEvent(createDOMEvent('ps-scroll-up'));
  }

  if (axis === 'top' && value > lastTop) {
    element.dispatchEvent(createDOMEvent('ps-scroll-down'));
  }

  if (axis === 'left' && value < lastLeft) {
    element.dispatchEvent(createDOMEvent('ps-scroll-left'));
  }

  if (axis === 'left' && value > lastLeft) {
    element.dispatchEvent(createDOMEvent('ps-scroll-right'));
  }

  if (axis === 'top') {
    element.scrollTop = lastTop = value;
    element.dispatchEvent(createDOMEvent('ps-scroll-y'));
  }

  if (axis === 'left') {
    element.scrollLeft = lastLeft = value;
    element.dispatchEvent(createDOMEvent('ps-scroll-x'));
  }

};

},{"./instances":18}],21:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var dom = require('../lib/dom');
var instances = require('./instances');
var updateGeometry = require('./update-geometry');
var updateScroll = require('./update-scroll');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  // Recalcuate negative scrollLeft adjustment
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;

  // Recalculate rail margins
  dom.css(i.scrollbarXRail, 'display', 'block');
  dom.css(i.scrollbarYRail, 'display', 'block');
  i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, 'marginLeft')) + _.toInt(dom.css(i.scrollbarXRail, 'marginRight'));
  i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, 'marginTop')) + _.toInt(dom.css(i.scrollbarYRail, 'marginBottom'));

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  dom.css(i.scrollbarXRail, 'display', 'none');
  dom.css(i.scrollbarYRail, 'display', 'none');

  updateGeometry(element);

  // Update top/left scroll to trigger events
  updateScroll(element, 'top', element.scrollTop);
  updateScroll(element, 'left', element.scrollLeft);

  dom.css(i.scrollbarXRail, 'display', '');
  dom.css(i.scrollbarYRail, 'display', '');
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]);

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/

(function defineMustache (global, factory) {
  if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    global.Mustache = {};
    factory(global.Mustache); // script, wsh, asp
  }
}(this, function mustacheFactory (mustache) {

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(value, names[index]);

            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.2.1';
  mustache.tags = [ '{{', '}}' ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render (template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */ // eslint wants camel cased function name
  mustache.to_html = function to_html (template, view, partials, send) {
    /*eslint-enable*/

    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));

//! moment.js
//! version : 2.15.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            // even if its not own property I'd still call it non-empty
            return false;
        }
        return true;
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (utils_hooks__hooks.deprecationHandler != null) {
                utils_hooks__hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (utils_hooks__hooks.deprecationHandler != null) {
            utils_hooks__hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;
    utils_hooks__hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return this._months;
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return this._monthsShort;
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function units_month__handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = create_utc__createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return units_month__handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        if (!m) {
            return this._weekdays;
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function day_of_week__handleStrictParse(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = create_utc__createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = create_utc__createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        ordinalParse: defaultOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    // treat as if there is no base config
                    deprecateSimple('parentLocaleUndefined',
                            'specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/');
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            // MERGE
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (isDate(input)) {
            config._d = input;
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);

            if (tZone === 0) {
                this.utcOffset(0, true);
            } else {
                this.utcOffset(offsetFromString(matchOffset, this._i));
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = utils_hooks__hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIOROITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = stringGet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = stringSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    momentPrototype__proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var prototype__proto = Locale.prototype;

    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto.ordinal         = ordinal;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    prototype__proto.weekdaysRegex       =        weekdaysRegex;
    prototype__proto.weekdaysShortRegex  =        weekdaysShortRegex;
    prototype__proto.weekdaysMinRegex    =        weekdaysMinRegex;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = lists__get(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = locale_locales__getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return lists__get(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function lists__listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function lists__listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function lists__listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function lists__listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function duration_humanize__getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.15.1';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.updateLocale          = updateLocale;
    utils_hooks__hooks.locales               = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeRounding = duration_humanize__getSetRelativeTimeRounding;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.calendarFormat        = getCalendarFormat;
    utils_hooks__hooks.prototype             = momentPrototype;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
// (function () {
//   var contact = document.querySelector('.page-header__contact');
//   var wrap = document.querySelector('.contact__wrap');
//   var link = contact.querySelector('.contact__callback');
//   var button = contact.querySelector('.contact__btn');
//   var mainMenu = document.querySelector('.page-header__main-menu');
//   var buttonMenu = document.querySelector('.main-menu__icon-close');
//
//
//   var apiPath = 'm/api/';
//   var requestApiUrl = generalPath.buildUrl(apiPath);
//
//   function sendInformation(httpAddress, formSend, getAnswer) {
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", httpAddress);
//     xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//     xhr.onload = function(event) {
//       var data = JSON.parse(event.target.response);
//       if(data) {
//         getAnswer(data);
//       }
//     };
//     xhr.send(formSend);
//   }
//
//   function openContact(e) {
//     e.preventDefault();
//     var target = e.target;
//     while (target != this) {
//       target = target.parentNode;
//     }
//
//     if (target.classList.contains('contact__wrap')) {
//       var form = document.querySelector('.contact__form');
//       console.log(window.innerWidth);
//       if (window.innerWidth < 1280) {
//
//         console.log("не декстоп");
//         mainMenu.classList.toggle('page-header__main-menu--hide');
//         buttonMenu.classList.toggle('main-menu__icon-close--hide');
//         contact.classList.toggle('contact--open');
//
//         button.addEventListener('click', closeContact);
//       } else {
//         console.log("декстоп");
//         contact.classList.toggle('contact--open');
//       }
//
//       form.addEventListener('submit', function(event){
//         event.preventDefault();
//         var buttonSubmit = form.querySelector('.contact__button');
//         var name = form.querySelector('.contact__input--name');
//         var tel = form.querySelector('.contact__input--tel');
//
//         var formData = {
//           "Method" : "Client.PostCallBack",
//           "Param": {
//             name : name.value,
//             phone : tel.value
//           }
//         };
//
//         console.log(name.value, tel.value);
//
//         var json = JSON.stringify(formData);
//
//
//         // var form = document.querySelector('.contact__form');
//         // var input2 = document.querySelector('.contact__input');
//         //
//         // var input = form.querySelectorAll('input');
//         // console.log(input2);
//         // console.log(input2.value);
//         // console.log(input);
//         // console.log(input[0]);
//         // console.log(input[0].value);
//         // console.log(input[1].value);
//         // var formSend = new FormData(form);
//
//         function getAnswer(data) {
//           console.log(data);
//           if (data.Success == false) {
//             buttonSubmit.disabled = false;
//           } else {
//             console.log("уже отправила запрос");
//             if (window.innerWidth < 1280) {
//               console.log("не декстоп");
//               mainMenu.classList.toggle('page-header__main-menu--hide');
//               buttonMenu.classList.toggle('main-menu__icon-close--hide');
//               contact.classList.toggle('contact--open');
//
//               button.removeEventListener('click', closeContact);
//             } else {
//               contact.classList.toggle('contact--open');
//             }
//           }
//
//         }
//
//
//         var httpAddress = requestApiUrl;
//         buttonSubmit.disabled = true;
//
//         sendInformation(httpAddress, json, getAnswer);
//
//       });
//     }
//   }
//
//   function closeContact(e) {
//     e.preventDefault();
//     var target = e.target;
//     while (target != this) {
//       target = target.parentNode;
//     }
//
//     mainMenu.classList.toggle('page-header__main-menu--hide');
//     buttonMenu.classList.toggle('main-menu__icon-close--hide');
//     contact.classList.toggle('contact--open');
//
//     button.removeEventListener('click', closeContact);
//   }
//
//   wrap.addEventListener("click", openContact);
//
// })();

/**
 * Created by Lobova.A on 29.11.2016.
 */
"use strict";
var PopUp = require('./../pop-up/pop-up');
var Selection = require('./../../../components/selection/selection');
var SelectionMenu = require('./../../../components/selection/selection-menu');
var Orders = require('./../orders/orders');
var Order = require('./../order/order');
var client = require('./../client-data/client-data');
var page = document.querySelector('.page');
var ordersElement = document.querySelector('orders');
var popUpElement = page.querySelector('.pop-up');
var mainContant = page.querySelector('.main-content');
var selectionList = mainContant.querySelectorAll('.selection');
var selectionMenu = mainContant.querySelector('.selection-menu');
var orderList = document.querySelectorAll('.right-side__wrap');
function init() {
    var pageInit = {
        orders: new Orders()
    };
    if (selectionList.length) {
        selectionList.forEach(function (item) {
            var selection = new Selection(item);
        });
    }
    if (selectionMenu) {
        var selection = new SelectionMenu(selectionMenu);
    }
    if (popUpElement) {
        var popup = new PopUp(popUpElement);
    }
    // if (ordersElement) {
    //   console.log('orders')
    //   pageInit.orders = new Orders();
    //   console.log(pageinit.orders, "-------------------------------------------");
    // }
    //
    // if (!client.isMobile()) {
    //   console.log(pageInit.tabs.init, "hhhhhhhhh")
    //   pageInit.tabs.init();
    //   console.log(pageInit.tabs.length());
    // }
    if (orderList.length) {
        orderList.forEach(function (item) {
            var order = new Order(item);
        });
    }
    return pageInit;
}
;
module.exports = init();

// (function () {
//   var filter = document.querySelector('.orders__filter');
//   var side = document.querySelector('.page');
//   var buttonTop = document.querySelector(".btn-top");
//
//    window.addEventListener("scroll", function() {
//       if (window.pageYOffset > 100) {
//        buttonTop.classList.remove('icon-close-top--hide');
//       }
//       if (window.pageYOffset < 100) {
//         buttonTop.classList.add('icon-close-top--hide');
//       }
//    });
//
//   var getTop = function() {
//     side.scrollTop = 0;
//   };
//
//   buttonTop.addEventListener('click', getTop);
//
//    var select = document.querySelector('.selection-icon-close');
//    var button = select.querySelector('.selection-btn__button');
//   
//    openSelect = function(e) {
//      console.log("367898");
//      e.preventDefault();
//      select.classList.toggle("selection-icon-close--open");
//    }
//   
//   
//    if(select != undefined) {
//      button.addEventListener("click", openSelect);
//    }
// })();


/**
 * Created by Lobova.A on 24.11.2016.
 */
"use strict";
var request = require('./../ajax-request/ajax-request');
var url = require('./../state-address/state-address');
var tabs = require('./../tabs/tabs');
var path = require('./../path/path');
var status = document.querySelector('.orders__option--active').getAttribute('data-status');
var requestItemUrl = generalPath.buildUrl(path.item);
var rightSide = document.querySelector('.right-side');
var leftSide = document.querySelector('.left-side');
var Filter = (function () {
    function Filter(orders, element) {
        this.orders = orders;
        this.element = element;
        this.options = this.element.querySelectorAll('.orders__option');
        this.activeFilter = this.getActiveFilter();
        this.status = this.element.querySelector('.orders__option--active').getAttribute('data-status');
        this.switchOption = this.switchOption.bind(this);
    }
    Filter.prototype.addEvent = function () {
        this.element.addEventListener('click', this.switchOption);
    };
    Filter.prototype.removeEvent = function () {
        this.element.removeEventListener('click', this.switchOption);
    };
    Filter.prototype.switchOption = function (e) {
        e.preventDefault();
        var target = e.target;
        while (target != this) {
            if (target.classList.contains('orders__option')) {
                this.orders.removeEvent();
                this.status = target.getAttribute('data-status');
                this.orders.scrollEnd = false;
                this.orders.scrollBegin = false;
                this.orders.scrollDirection = -1;
                var requestUrl = "" + requestItemUrl + url.address.url + "?status=" + this.status;
                if (tabs.length()) {
                    if (tabs.currentItem().type === url.type.order && this.status === tabs.currentItem().status) {
                        requestUrl += '&direction=0&departureID=' + tabs.currentItem().id;
                    }
                }
                function render(data) {
                    if (data.Success == true) {
                        this.orders.listElement.innerHTML = '';
                        this.orders.render(data);
                        this.orders.setActiveOrder();
                        this.orders.scrollCoordinate(this.orders.activeElement());
                        setTimeout(function () {
                            this.orders.addEvent();
                        }.bind(this), 0);
                    }
                    else {
                        setTimeout(function () {
                            this.orders.addEvent();
                        }.bind(this), 0);
                    }
                }
                request.get(requestUrl, render.bind(this));
                this.setActiveFilter(target);
                return;
            }
            target = target.parentNode;
        }
    };
    Filter.prototype.getActiveFilter = function () {
        this.element.querySelector('orders__option--active');
        return '';
    };
    Filter.prototype.setActiveFilter = function (option) {
        this.activeFilter = '';
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.classList.contains('orders__option--active')) {
                item.classList.remove('orders__option--active');
            }
        }
        // if (cancelOrder == true) {
        //   this.options[2].classList.add('orders__option--active');
        // } else {
        //   //this.options[0].classList.add('orders__option--active');
        // }
        option.classList.add('orders__option--active');
    };
    return Filter;
}());
module.exports = Filter;

(function() {
  var pageOrders = document.querySelector('.page--orders');
  var pageAuth = document.querySelector('.page--authorization');
  var invitePage = document.querySelector('.invite-friend');
  var header = document.querySelector('.page-header');


  var clientIsMobile = function () {
    return window.innerWidth < 768
  };



  //Подсказки
  var needTips = null;
  var tipsIsAnswer = null;
  try {
    tipsIsAnswer = popupIsAnswer;
    needTips = popupAnswerResult;
  } catch (e) {
    tipsIsAnswer = true;
    needTips = false;
  }

  var eventHelper = {
    need: function (action, timeout) {
      if (needTips) {
        if (action == 'open') {
          if (timeout) {
            setTimeout(function () {
              this.open();
            }.bind(this), 0);
          } else {
            this.open();
          }
        } else if (action == 'close'){
          this.close();
        }
      }
    },
    open: function() {
      var event = document.createEvent('Event');
      event.initEvent('helper', true, true);
      event.detail = {
        event: "render"

      };

      document.dispatchEvent(event);
    },
    close: function() {
      var event = document.createEvent('Event');
      event.initEvent('helperClose', true, true);
      event.detail = {
        event: "render"

      };

      document.dispatchEvent(event);
    }
  };

  var mobile = 'mobile';
  var tablet = 'tablet';
  var desktop = 'desktop';


  var defineClient = function() {
    var clientWidth = window.innerWidth;
    if (clientWidth < 768) {
      return mobile;
    } else if (clientWidth < 1280) {
      return tablet;
    } else {
      return desktop;
    }
  };

  if (defineClient() === mobile) {
    window.scrollTo(0, 0);
  }

  var defineHeight = function() {
    return window.innerHeight;
  };
  var oldHeight = defineHeight();
  var oldWidth = defineClient();

  var itemPath = 'm/';
  var apiPath = 'm/api/';
  var requestItemUrl = generalPath.buildUrl(itemPath);
  var requestApiUrl = generalPath.buildUrl(apiPath);

  if (pageOrders || invitePage) {
    var socialBlock = document.getElementById('my-share');
    try {
      var share = Ya.share2(socialBlock, {
        hooks: {
          onshare: function (name) {
            sendAnaliticSocial(name);
          }
        }
      });
    } catch (e) {
    }
  }

  var headerAction = {
    init: function(element) {
      if (defineClient() !== desktop) {
        var page = document.querySelector('.page');
        var buttonCloseMenu = element.querySelector('.main-menu__icon-close');
        var buttonOpenMenu = element.querySelector('.main-menu__btn--open');

        if (buttonCloseMenu) {
          buttonCloseMenu.addEventListener('click', closeMenu);
        }

        if (buttonOpenMenu) {
          if (window.innerWidth <= 1280) {
            buttonOpenMenu.addEventListener('click', openMenu);
          }
        }
      } else {
        this.menuInit(element);
      }
    },
    deleteInteractive: function(element) {
      var page = document.querySelector('.page');
      var buttonCloseMenu = element.querySelector('.main-menu__icon-close');
      var buttonOpenMenu = element.querySelector('.main-menu__btn--open');

      if (buttonCloseMenu) {
        buttonCloseMenu.removeEventListener('click', closeMenu);
      }

      if (buttonOpenMenu) {
        buttonOpenMenu.removeEventListener('click', closeMenu);
      }

      if (!page.classList.contains('page--main-menu-open')) {
        document.removeEventListener('touchmove', preventDefault);
      }

      this.menuRemove(element);

    },
    menuInit: function(element) {
      var itemList = element.querySelectorAll('.main-menu__item');
      var contactButton = element.querySelector('.contact__callback');
      var application = element.querySelector('.main-menu__link-sub--application');
      var orderDefine = document.getElementById('openOrderDefine');

      if (orderDefine) {
        orderDefine.addEventListener('click', openOrderDefinePage);
      }

      if (application) {
        application.addEventListener('click', openApplication);
      }

      if (itemList.length) {
        for (var i = 0; i < itemList.length; i++) {
          itemList[i].addEventListener('click', setMenuItemActive);
        }
      }

      if (contactButton) {
        contactButton.addEventListener('click', contactMe);
      }
    },
    menuRemove: function(element) {
      var itemList = element.querySelectorAll('.main-menu__item');
      var contactButton = element.querySelector('.contact__callback');
      var application = element.querySelector('.main-menu__link-sub--application');
      var orderDefine = document.getElementById('openOrderDefine');

      if (orderDefine) {
        orderDefine.removeEventListener('click', openOrderDefinePage);
      }


      if (application) {
        application.removeEventListener('click', openApplication);
      }

      if (itemList.length) {
        for (var i = 0; i < itemList.length; i++) {
          itemList[i].removeEventListener('click', setMenuItemActive);
        }
      }

      if (contactButton) {
        contactButton.removeEventListener('click', contactMe);
      }
    }
  };
  headerAction.init(header);
  initContainerOrder();
  initContainerOther();
  window.addEventListener('resize', resizePage);
  window.onload = function() {
    var afterGA = function() {
      setTimeout(function() {
        try{
         sendAnaliticId();
        } catch (e) {
          afterGA()
        }
      }, 200)
    };
    afterGA();
  };

  //Страница заказы
  // Переменные
  if (pageOrders) {
    var leftSide = document.querySelector('.left-side');
    var rightSide = document.querySelector('.right-side');
    var listContainer = document.querySelector('.orders__list');
    var ordersWrap = document.querySelector('.orders');
    var rating = null;

    if (platform.name === 'Safari' && (platform.product === 'iPad') && platform.version >= 8) {
      var appleBlock = document.createElement('div');
      var rightSideWrap = rightSide.querySelectorAll('.right-side__wrap');
      appleBlock.classList.add('apple-block');
      ordersWrap.appendChild(appleBlock);
      for (var i = 0; i < rightSideWrap.length; i++) {
        rightSideWrap[i].appendChild(appleBlock.cloneNode(true));
      }
    }

    // Флаги
    var lastScrollTop = null;
    var listScrollEnd = departureList.end;
    var listScrollBegin = departureList.begin;
    var scrollDirection = -1;
    var filterStatus = document.querySelector('.orders__option--active').getAttribute('data-status');
    var orderType = 'ord';
    var scheduleType = 'shd';
    var addressType = 'adr';
    var requestPaymentUrl = 'https://www.domovenok.su/private/take/';
    var paymentType = {
      card: {
        title: 'Картой',
        type: 'ОплатаКартой'
      },
      cash: {
        title: 'Наличные',
        type: 'НаличныйРасчет'
      },
      receipt: {
        title: 'Квитанция',
        type: 'ОплатаКвитанцией'
      },
      cashOffice: {
        title: 'Оплатить в офисе',
        type: 'НаличныйВОфис'
      }
    };
    var scrollContainer = function () {
      if (clientIsMobile()) {
        return window;
      } else {
        return document.querySelector('.orders__wrap');
      }
    };

    function getActiveOrder() {
      var list = rightSide.querySelectorAll('.right-side__wrap');
      var activeOrder = null;

      for (var i = 0; i < list.length; i++) {
        if (!list[i].classList.contains('right-side__wrap--hide')) {
          activeOrder = list[i];
        }
      }

      if (activeOrder !== null) {
        return activeOrder;
      } else {
        return rightSide;
      }
    }

    var helpUtils = {
      defineExist : function(item) {
        var cssClass = ".";
        var cssHide = '--hide';
        var element = item.parent.querySelector(cssClass + item.item());
        if (element) {
          var hideElement = element.classList.contains(item.item() + cssHide);
        }

        if (defineClient() === desktop) {

          return element !== null && !hideElement && !item.finish;

        } else if (defineClient() === tablet) {
          if (!pageOrders.classList.contains('page--main-menu-open')) {
            return element !== null && !hideElement && !item.finish && item.group !== this.group.menu;
          } else {
            return element !== null && !hideElement && !item.finish && item.group === this.group.menu;
          }
        } else if (defineClient() === mobile) {

          if (!pageOrders.classList.contains('page--main-menu-open')) {
            if (element !== null && !hideElement && !item.finish && item.group !== this.group.menu) {
              if (leftSide.classList.contains('left-side--hide') || leftSide.classList.contains('left-side--mobile')) {
                return item.group === this.group.right;
              } else {
                return item.group === this.group.left || item.group === this.group.menuClose;
              }
            }
          } else {
            return element !== null && !hideElement && !item.finish && item.group === this.group.menu;
          }
        }


      },
      group: {
        left: 'left',
        right: 'right',
        menuClose: 'menu-close',
        menu: 'menu'
      }
    };

    var helpObject = [
      {
        id: 'change-address',
        item: function() {
          return 'left-side__selection';
        },
        text: function() {
          return 'Здесь Вы можете изменить адрес.'
        },
        group: 'left',
        priority: function () {
          return 1;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item);
          },
          details: {}
        }
      },
      {
        id: 'filter',
        item: function() {
          return 'orders__filter';
        },
        text: function() {
          return 'Здесь Вы можете просматривать свои актуальные, выполненные или отмененные заказы.'
        },
        group: 'left',
        priority: function () {
          return 2;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item)
          },
          details: {}
        }
      },
      {
        id: 'filter-active',
        item: function() {
          return 'orders__option--actived';
        },
        text: function() {
          return 'Здесь будут показаны все Ваши будущие заказы. Нажмите.'
        },
        group: 'left',
        priority: function () {
          return 10;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item)
          },
          details: {}
        }
      },
      {
        id: 'orders-active',
        item: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          if (ordersWrap.classList.contains('orders-wrap--list')) {
            return 'orders__wrap';
          } else {
            return 'orders__note';
          }
        },
        text: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          if (ordersWrap.classList.contains('orders-wrap--list')) {
            return 'Нажмите на заказ.';
          } else {
            return 'Актуальные заказы отсутствуют.';
          }
        },
        group: 'left',
        priority: function () {
          return 11;
        },
        finish: false,
        isClick: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          return ordersWrap.classList.contains('orders-wrap--list');
        },
        buttonNext: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          if (ordersWrap.classList.contains('orders-wrap--list')) {
            return {
              active: true,
              action: function (element) {
                element.querySelector('.orders__list').firstChild.click();
              }
            };
          } else {
            return { active: false };
          }
        },
        state: {
          isExist: function(item) {
            var activeFilter = document.querySelector('.orders__option--active');
            return helpUtils.defineExist(item) && activeFilter.classList.contains('orders__option--actived');
          },
          details: {}
        }
      },
      {
        id: 'filter-complete',
        item: function() {
          return 'orders__option--completed';
        },
        text: function() {
          return 'Здесь будут показаны все Ваши выполненные заказы. Нажмите.'
        },
        group: 'left',
        priority: function () {
          return 20;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item)
          },
          details: {}
        }
      },
      {
        id: 'orders-complete',
        item: function() {
          return 'orders__wrap';
        },
        text: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          if (ordersWrap.classList.contains('orders-wrap--list')) {
            return 'Нажмите на заказ.';
          } else {
            return 'Выполненные заказы отсутствуют.';
          }
        },
        group: 'left',
        priority: function () {
          return 21;
        },
        finish: false,
        isClick: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          return ordersWrap.classList.contains('orders-wrap--list');
        },
        buttonNext: function() {
          var ordersWrap = document.querySelector('.orders__wrap');

          if (ordersWrap.classList.contains('orders-wrap--list')) {
            return {
              active: true,
              action: function (element) {
                element.querySelector('.orders__list').firstChild.click();
              }
            };
          } else {
            return { active: false };
          }
        },
        state: {
          isExist: function(item) {
            var activeFilter = document.querySelector('.orders__option--active');
            return helpUtils.defineExist(item) && activeFilter.classList.contains('orders__option--completed');
          },
          details: {}
        }
      },
      {
        id: 'filter-canceled',
        item: function() {
          return 'orders__option--canceled';
        },
        text: function() {
          return 'Здесь будут показаны все Ваши отменненые заказы.'
        },
        group: 'left',
        priority: function () {
          return 30;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item);
          },
          details: {}
        }
      },
      // {
      //   id: 'orders-canceled',
      //   item: function () {
      //     return 'orders-wrap--list';
      //   },
      //   text: function() {
      //     return 'Нажмите на заказ.'
      //   },
      //   group: 'left',
      //   priority: function () {
      //     return 31;
      //   },
      //   finish: false,
      //   isClick: function() {
      //     var ordersWrap = document.querySelector('.orders__wrap');
      //
      //     return ordersWrap.classList.contains('orders-wrap--list');
      //   },
      //   buttonNext: function() {
      //     var ordersWrap = document.querySelector('.orders__wrap');
      //
      //     if (ordersWrap.classList.contains('orders-wrap--list')) {
      //       return {
      //         active: true,
      //         action: function (element) {
      //           element.querySelector('.orders__list').firstChild.click();
      //         }
      //       };
      //     } else {
      //       return { active: false };
      //     }
      //   },
      //   state: {
      //     isExist: function (item) {
      //       var activeFilter = document.querySelector('.orders__option--active');
      //       return helpUtils.defineExist(item) && activeFilter.classList.contains('orders__option--canceled');
      //     },
      //     details: {}
      //   }
      // },
      {
        id: 'schedule',
        item: function() {
          return 'orders__schedule';
        },
        text: function() {
          return 'Нажмите на график уборки.'
        },
        group: 'left',
        priority: function () {
          return 40;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item)
          },
          details: {}
        }
      },
      {
        id: 'delete-order',
        item: function() {
          return 'right-side__selection-btn';
        },
        text: function() {
          return 'Здесь находятся действия над заказом. Сейчас доступна функция отменить заказ.'
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  12;
              break;
            case 'Completed' :
              prior =  22;
              break;
            case 'Cancelled' :
              prior =  32;
            break;
            case 'Schedule' :
              prior =  42;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'service',
        item: function() {
          return defineClient() !== mobile ? 'service' : 'service__item';
        },
        text: function() {
          return 'Здесь Вы можете просматривать детали по заказанной услуге.'
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  13;
              break;
            case 'Completed' :
              prior =  23;
              break;
            case 'Cancelled' :
              prior =  33;
              break;
            case 'Schedule' :
              prior =  43;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return false;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'worker',
        item: function() {
          return defineClient() !== mobile ? 'worker' : 'worker__row';
        },
        text: function() {
          var row = getActiveOrder().querySelectorAll('.worker__row');

          if (row.length > 1 && defineClient() !== mobile) {
            return 'Вот домовята, которые придут к Вам на уборку.'
          } else {
            return 'Вот домовенок, который придет к Вам на уборку.'
          }
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  14;
              break;
            case 'Completed' :
              prior =  24;
              break;
            case 'Cancelled' :
              prior =  34;
              break;
            case 'Schedule' :
              prior =  44;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return false;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'rate-button',
        item: function() {
          return 'rating__button';
        },
        text: function() {
          return 'Здесь Вы можете оценить заказ.'
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  15;
              break;
            case 'Completed' :
              prior =  25;
              break;
            case 'Cancelled' :
              prior =  35;
              break;
            case 'Schedule' :
              prior =  45;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'rate',
        item: function() {
          return 'rating__stars';
        },
        text: function() {
          return 'Здесь показывается Ваша оценка заказа.'
        },
        group: 'right',
        priority: function() {
          return 25;
        },
        finish: false,
        isClick: function() {
          return false;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'change-payment',
        item: function() {
          return 'payment__btn--change';
        },
        text: function() {
          return 'Вы можeте изменить способ оплаты.'
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  16;
              break;
            case 'Completed' :
              prior =  26;
              break;
            case 'Cancelled' :
              prior =  36;
              break;
            case 'Schedule' :
              prior =  46;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'pay',
        item: function() {
          return 'payment__button';
        },
        text: function() {
          return 'Здесь Вы можете оплатить заказ.'
        },
        group: 'right',
        priority: function() {
          var prior = null;

          switch (getActiveOrder().getAttribute('data-status')) {
            case 'Active' :
              prior =  17;
              break;
            case 'Completed' :
              prior =  27;
              break;
            case 'Cancelled' :
              prior =  37;
              break;
            case 'Schedule' :
              prior =  47;
              break;
          }

          return prior;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'schedule-day',
        item: function() {
          return 'calendar__item--notactive';
        },
        text: function() {
          return 'Здесь Вы можете переключить день, чтобы просматривать информацию по уборке'
        },
        group: 'right',
        priority: function() {
          return 47;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var ordersWrap = document.querySelector('.orders__wrap');
            return helpUtils.defineExist(item) && (defineClient() !== mobile ? ordersWrap.classList.contains('orders-wrap--list') : true);
          },
          details: {}
        }
      },
      {
        id: 'order-close-active',
        item: function() {
          return 'right-side__btn--close';
        },
        text: function() {
          return 'Здесь Вы можете закрыть активный заказ, нажмите.'
        },
        group: 'right',
        priority: function () {
          return 18;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          }
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item) && getActiveOrder().getAttribute('data-status') === "Active";
          },
          details: {}
        }
      },
      {
        id: 'order-close-completed',
        item: function() {
          return 'right-side__btn--close';
        },
        text: function() {
          return 'Здесь Вы можете закрыть выполненный заказ, нажмите.'
        },
        group: 'right',
        priority: function () {
          return 28;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          }
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item) && getActiveOrder().getAttribute('data-status') === "Completed";
          },
          details: {}
        }
      },
      // {
      //   id: 'order-close-cancelled',
      //   item: function() {
      //     return 'right-side__btn--close';
      //   },
      //   text: function() {
      //     return 'Здесь Вы можете закрыть заказ, нажмите.';
      //   },
      //   group: 'right',
      //   priority: function () {
      //     return 38;
      //   },
      //   finish: false,
      //   isClick: function() {
      //     return true;
      //   },
      //   buttonNext: function() {
      //     return {
      //       active: true,
      //       action: function (element) {
      //         element.click();
      //       }
      //     }
      //   },
      //   state: {
      //     isExist: function(item) {
      //       return helpUtils.defineExist(item) && getActiveOrder().getAttribute('data-status') === "Cancelled";
      //     },
      //     details: {}
      //   }
      // },
      {
        id: 'order-close-schedule',
        item: function() {
          return 'right-side__btn--close';
        },
        text: function() {
          return 'Здесь Вы можете закрыть график, нажмите.'
        },
        group: 'right',
        priority: function () {
          return 48;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function (element) {
              element.click();
            }
          }
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item) && getActiveOrder().classList.contains('right-side__wrap--schedule');
          },
          details: {}
        }
      },
      {
        id: 'application',
        item: function() {
          return 'main-menu__link-sub--application';
        },
        text: function() {
          return 'Если Вы хотите заказать дополнительную услугу, Вы можете оставить нам заявку, нажав здесь.'
        },
        group: 'menu',
        priority: function () {
          return 51;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var parent = document.querySelector("." + item.item()).parentNode.parentNode.parentNode;
            return helpUtils.defineExist(item) && parent.classList.contains('main-menu__item--active');
          },
          details: {}
        }
      },
      {
        id: 'invite-friend',
        item: function() {
          return 'main-menu__link-sub--invite';
        },
        text: function() {
          return 'Вы можете пригласить друга.'
        },
        group: 'menu',
        priority: function () {
          return 52;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            var parent = document.querySelector("." + item.item()).parentNode.parentNode.parentNode;
            return helpUtils.defineExist(item) && parent.classList.contains('main-menu__item--active');
          },
          details: {}
        }
      },
      {
        id: 'contact',
        item: function() {
          return 'page-header__contact';
        },
        text: function() {
          return 'Если Вам нужна будет дополнительная информация по нашим услугам, жмите сюда.'
        },
        group: 'menu',
        priority: function () {
          return 53;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: false
          };
        },
        state: {
          isExist: function(item) {
            return helpUtils.defineExist(item)
          },
          details: {}
        }
      },
      {
        id: 'main-menu__btn',
        item: function() {
          return 'main-menu__btn';
        },
        text: function() {
          return 'Нажмите, чтобы открылось меню.'
        },
        group: 'menu-close',
        priority: function () {
          return 50;
        },
        finish: false,
        isClick: function() {
          return true;
        },
        buttonNext: function() {
          return {
            active: true,
            action: function(element) {
              element.click();
            }
          };
        },
        state: {
          isExist: function(item) {
            return defineClient() !== desktop ? helpUtils.defineExist(item) : false;
          },
          details: {}
        }
      }
    ];
    var helpRemainder = helpObject.filter(function(item) {
      return helpList[item.id] === undefined;
    });



    // Рабочие переменные
    var tabsAction = {
      tabs: [],

      currentItemUrl: function () {
        var tabsLength = this.tabs.length;
        if (tabsLength) {
          return this.tabs[tabsLength - 1].url
        } else {
          return ""
        }
      },

      init: function () {
        var allTabs = document.querySelectorAll('.right-side__wrap');

        if (allTabs.length) {
          for (var i = 0; allTabs.length > i; i++) {
            itemId = allTabs[i].getAttribute('data-departureid');

            this.tabs.push({
              item: allTabs[i],
              id: itemId,
              url: (allTabs[i].classList.contains('right-side__wrap--schedule') ? 'shd' : 'ord') + itemId.replace(/-/g, '')
            });
          }
        }
      },

      clear: function () {

        this.tabs.forEach(function (tab) {
          tab.item.parentNode.removeChild(tab.item);
        });
        this.tabs = [];
      },

      add: function (item, itemId, typeItem) {
        if (this.tabs.length) {
          this.tabs[this.tabs.length - 1].item.classList.add('right-side__wrap--hide');
        }

        this.tabs.push({
          'item': item,
          id: itemId,
          url: typeItem + itemId.replace(/-/g, '')
        });
      },

      delete: function () {
        if (this.tabs.length) {
          var lastItem = this.tabs.pop().item;
          lastItem.parentNode.removeChild(lastItem);
          if (this.tabs.length) {
            this.tabs[this.tabs.length - 1].item.classList.remove('right-side__wrap--hide');
          }
          utils.address._setActiveOrder(state.item);
        }
      },
      canDelete: function (itemId) {
        if ((this.tabs.length > 1) && this.tabs[this.tabs.length - 2].id == itemId) {
          return true
        } else {
          return false
        }
      }
    };

    var utils = {
      address: {
        change: function (addressUuid, cancelOrder) {
          this._changeSelectTitle(addressUuid);
          this._setActivefilter(cancelOrder);
          this._hideScheduleButton();
        },

        _changeSelectTitle: function (addressUuid) {
          var button = document.querySelector('.selection__btn');
          var links = document.querySelectorAll('.selection__link');

          for (var i = 0; links.length > i; i++) {
            if (links[i].getAttribute('data-address') == addressUuid) {
              button.innerHTML = links[i].innerHTML;
            }
          }
        },

        _setActivefilter: function (cancelOrder) {
          var options = document.querySelectorAll('.orders__option');
          for (var i = 0; options.length > i; i++) {
            if (options[i].classList.contains('orders__option--active')) {
              options[i].classList.remove('orders__option--active');
            }
          }
          if (cancelOrder == true) {
            options[2].classList.add('orders__option--active');
          } else {
            options[0].classList.add('orders__option--active');
          }
        },

        _setActiveOrder: function (item) {
          if (clientIsMobile()) {
            return
          }
          var orderItems = document.querySelectorAll('.orders-item');

          if (orderItems) {
            for (var i = 0; orderItems.length > i; i++) {
              if (orderItems[i].classList.contains('orders-item--active')) {
                orderItems[i].classList.remove('orders-item--active');
              }

              if (item && item.uuid) {
                if (orderItems[i].getAttribute('data-departureid') == item.uuid) {
                  orderItems[i].classList.add('orders-item--active');
                }
              }
            }
          }
        },

        _hideScheduleButton: function () {
          var addressAll = document.querySelectorAll('.selection__link');

          for (var i = 0; addressAll.length > i; i++) {
            if (addressAll[i].getAttribute('data-address') == state.address.uuid) {
              var buttonSchedule = document.querySelector('.orders__schedule');

              if (addressAll[i].getAttribute('data-schedule') == 'true') {

                if (buttonSchedule.classList.contains('orders__schedule--hide')) {
                  buttonSchedule.classList.remove('orders__schedule--hide');
                }
              } else {
                if (!buttonSchedule.classList.contains('orders__schedule--hide')) {
                  buttonSchedule.classList.add('orders__schedule--hide');
                }
              }
            }
          }
        }
      }
    };

    var CreateState = function() {
      var self = this;

      this.closeLeftShowRight = function () {
        leftSide.classList.add('left-side--hide');
        rightSide.classList.remove('right-side--hide');
        scrollContainer().scrollTop = 0;
      };

      this.clearRightMobile = function () {
        if (clientIsMobile()) {
          var orders = rightSide.querySelectorAll('.right-side__wrap');

          if (orders.length > 0) {
            for (var i = 0; orders.length > i; i++) {
              rightSide.removeChild(orders[i]);
            }
          }
        }
      };

      this._parseArg = function(value, type) {
        var newItem = {}
        if (!value) {
          newItem.url = null;
          newItem.id = null;
          newItem.uuid = null;
          newItem.type = null;
          return newItem;
        }
        switch (value.length) {
          case 35:
            newItem.url = value;
            newItem.id = value.substring(3);
            break;
          case 32:
            if (!type) console.error('Not Type', arguments);
            newItem.url = type + value;
            newItem.id = value;
            break;
          case 36:
            if (!type) console.error('Not Type', arguments);
            newItem.id = value.replace(/-/g, '');
            newItem.url = type + props.id;
            break;
          default:
            console.error('Error', arguments);
            break;
        }

        newItem.uuid = newItem.id.slice(0, 8) + '-' +
            newItem.id.slice(8, 12) + '-' +
            newItem.id.slice(12, 16) + '-' +
            newItem.id.slice(16, 20) + '-' +
            newItem.id.slice(20);
        newItem.type = type;
        return newItem
      };

      this.setNewState = function (props, value, type) {
        var newProps = this._parseArg(value, type);
        props.id = newProps.id;
        props.uuid = newProps.uuid;
        props.type = newProps.type;
        props.url = newProps.url;
      };

      this.address = {};

      this.setNewState(this.address, window.location.pathname.split('/')[2], addressType);

      this.item = {};

      var itemValue = window.location.pathname.split('/')[3];

      var itemType = null;

      if (itemValue) {
        if (itemValue.substring(0, 3) == orderType) {
          itemType = orderType;
        } else if (itemValue.substring(0, 3) == scheduleType) {
          itemType = scheduleType;
        }
      }

      this.setNewState(this.item, itemValue, itemType);

      if (this.item.type == orderType) {
        var activeOrder = leftSide.querySelector('[data-departureid="' + this.item.uuid + '"]');
        scrollCoordinate(activeOrder);
      }

      this.getRequestUrl = function () {
        return requestItemUrl + self.currentUrl()
      };

      this.getItemUrl = function () {
        return requestItemUrl + self.item.type + self.item.id
      };

      this.tabs = tabsAction;

      this.currentUrl = function () {
        var url = self.address.url;

        if (self.item.url) {
          url += '/' + self.item.url
        }
        return url
      };

      this.setAddress = function(ctx) {
        if ((ctx.path != ('/' + self.currentUrl())) || ctx.state.rerender) {

          tabsAction.clear();
          self.setNewState(self.item, null);
          if ((ctx.params.adrid != self.address.id) || ctx.state.rerender) {
            listContainer.innerHTML = '';
            self.setNewState(self.address, ctx.params.adrid, addressType);
            utils.address.change(self.address.uuid);
            function render(data) {
              renderOrders(data);
              utils.address._setActiveOrder(self.item);
              eventHelper.need('open', false);
            }

            getData(self.getRequestUrl(), render);
          } else {
            utils.address._setActiveOrder(self.item);
            if (clientIsMobile() && (ctx.state.delete == true)) {
              var order = rightSide.querySelector('.right-side__wrap');
              rightSide.removeChild(order);
              leftSide.classList.remove('left-side--hide');
              leftSide.classList.remove('left-side--mobile');
              rightSide.classList.add('right-side--hide');
              rightSide.classList.remove('right-side--mobile');
            }

            eventHelper.need('open', true);
          }
        } else {
          if (ctx.state.addressActive === true) {
            eventHelper.need('open', true);
          }
          ctx.handled = false;
        }
      };

      this.setAddressOrder = function (ctx) {
        if ((ctx.path != ('/' + self.currentUrl()) || ctx.state.cancelOrder == true) || ctx.state.rerender) {

          if ((ctx.params.adrid != self.address.id || (ctx.state.cancelOrder == true && !clientIsMobile())) || ctx.state.rerender) {
            listContainer.innerHTML = '';
            if (clientIsMobile() && !ctx.state.rerender) {
              page.redirect('/adr' + ctx.params.adrid);
              return
            }
            tabsAction.clear();
            self.setNewState(self.address, ctx.params.adrid, addressType);
            self.setNewState(self.item, ctx.params.ordid, orderType);
            utils.address.change(self.address.uuid, ctx.state.cancelOrder);
            function render1(data) {
              renderOrders(data);
              renderSchedule(data);
              renderOrder(data);
              utils.address._setActiveOrder(self.item);
              eventHelper.need('open', false);

              if (rightSide) {
                if (!rightSide.classList.contains('scroll-container')) {
                  rightSide.classList.add('scroll-container');
                  Ps.initialize(rightSide);
                }
              }

            }

            getData(self.getRequestUrl(), render1);
          } else if (ctx.params.ordid != self.item.id || (clientIsMobile() && ctx.state.cancelOrder == true)) {
            self.setNewState(self.item, ctx.params.ordid, orderType);
            if (ctx.state.delete == true && self.tabs.canDelete(self.item.uuid)) {
              self.tabs.delete();
              eventHelper.need('open', true);
            } else {
              function render2(data) {
                renderOrder(data);
                utils.address._setActiveOrder(self.item);

                eventHelper.need('open', false);
              }

              getData(self.getItemUrl(), render2)
            }
          }
        } else {
          if (ctx.state.orderActive === true || ctx.state.addressActive === true) {
            eventHelper.need('open', true);
          }
          ctx.handled = false;
        }
      };

      this.setAddressSchedule = function(ctx) {
        if ((ctx.path != ('/' + self.currentUrl())) || ctx.state.rerender) {
          if ((ctx.params.adrid != self.address.id) || ctx.state.rerender) {
            listContainer.innerHTML = '';
            if (clientIsMobile() && !ctx.state.rerender) {
              page.redirect('/adr' + ctx.params.adrid);
              return
            }
            tabsAction.clear();
            self.setNewState(self.address, ctx.params.adrid, addressType);
            self.setNewState(self.item, ctx.params.shdid, scheduleType)
            utils.address.change(self.address.uuid);
            function render1(data) {
              renderOrders(data);
              renderSchedule(data);
              utils.address._setActiveOrder(self.item);
              eventHelper.need('open', false);
            }

            getData(self.getRequestUrl(), render1);
          } else if (ctx.params.shdid != self.item.id) {
            self.setNewState(self.item, ctx.params.shdid, scheduleType);
            if (ctx.state.delete == true && self.tabs.canDelete(self.item.uuid)) {
              self.tabs.delete();
              eventHelper.need('open', true);
            } else {
              function render2(data) {
                renderSchedule(data);
                utils.address._setActiveOrder(self.item);
                eventHelper.need('open', true);
              }

              getData(self.getItemUrl(), render2)
            }
          }
        } else {
          if ((ctx.state.addressActive === true) || (ctx.state.scheduleBtn === true)) {
            eventHelper.need('open', true);
          }
          ctx.handled = false
        }
      };
    };
    var state = new CreateState();
    var orderAction = {

      init: function (order) {
        var selectList = order.querySelector('.selection-btn__list');
        var selectButton = order.querySelector('.selection-btn__button');
        var serviceItemAll = order.querySelectorAll('.service__item');
        var buttonClose = order.querySelector('.right-side__btn--close');
        var buttonRating = order.querySelector('.rating__button');
        var buttonPayment = order.querySelector('.payment__button');
        var buttonChangePayment = order.querySelector('.payment__btn--change');
        var paymentOptions = order.querySelectorAll('.payment__option');


        if (buttonChangePayment) {
          buttonChangePayment.addEventListener('click', changePaymentOrder);

          for (var i = 0; paymentOptions.length > i; i++) {
            paymentOptions[i].addEventListener("click", sendMethodPayment);
          }
        }

        if (selectButton) {
          selectButton.addEventListener('click', toggleSelect);
          selectList.addEventListener('click', actionOrder);
        }

        if (buttonPayment) {
          buttonPayment.addEventListener('click', paymentOrder);
          buttonPayment.addEventListener('click', sendAnalitic);
        }

        if (serviceItemAll.length) {
          for (var i = 0; serviceItemAll.length > i; i++) {
            serviceItemAll[i].addEventListener('click', toggleService);
          }
        }

        if (buttonClose) {
          buttonClose.addEventListener('click', closeOrder);
        }

        if (buttonRating) {
          buttonRating.addEventListener('click', openRating);
        }
      },

      deleteInteractive: function (order) {
        var selectList = order.querySelector('.selection-btn__list');
        var selectButton = order.querySelector('.selection-btn__button');
        var serviceItemAll = order.querySelectorAll('.service__item');
        var buttonClose = order.querySelector('.right-side__btn--close');
        var buttonRating = order.querySelector('.rating__button');
        var buttonPayment = order.querySelector('.payment__button');
        var buttonChangePayment = order.querySelector('.payment__btn--change');
        var paymentOptions = order.querySelectorAll('.payment__option');

        if (buttonChangePayment) {
          buttonChangePayment.removeEventListener('click', changePaymentOrder);

          for (var i = 0; paymentOptions.length > i; i++) {
            paymentOptions[i].removeEventListener("click", sendMethodPayment);
          }
        }

        if (selectButton) {
          selectButton.removeEventListener('click', toggleSelect);
          selectList.removeEventListener('click', actionOrder);
        }

        if (buttonPayment) {
          buttonPayment.removeEventListener('click', paymentOrder);
          buttonPayment.removeEventListener('click', sendAnalitic);
        }

        if (serviceItemAll.length) {
          for (var i = 0; serviceItemAll.length > i; i++) {
            serviceItemAll[i].removeEventListener('click', toggleService);
          }
        }

        if (buttonClose) {
          buttonClose.removeEventListener('click', closeOrder);
        }

        if (buttonRating) {
          buttonRating.removeEventListener('click', openRating);
        }
      }
    };
    var scheduleAction = {

      init: function (schedule) {
        var buttonClose = schedule.querySelector('.right-side__btn--close');
        var calendar = schedule.querySelector('.calendar__list--days');
        var serviceItemAll = schedule.querySelectorAll('.service__wrap');

        if (buttonClose) {
          buttonClose.addEventListener('click', closeOrder);
        }

        if (calendar) {
          calendar.addEventListener('click', toggleDays);
        }

        if (serviceItemAll.length) {
          for (var i = 0; serviceItemAll.length > i; i++) {
            serviceItemAll[i].addEventListener('click', toggleService);
          }
        }
      },

      deleteInteractive: function (schedule) {
        var buttonClose = schedule.querySelector('.right-side__btn--close');
        var calendar = schedule.querySelector('.calendar__list--days');
        var serviceItemAll = schedule.querySelectorAll('.service__wrap');

        if (buttonClose) {
          buttonClose.removeEventListener('click', closeOrder);
        }
        if (calendar) {
          calendar.removeEventListener('click', toggleDays);
        }
        if (serviceItemAll.length) {
          for (var i = 0; serviceItemAll.length > i; i++) {
            serviceItemAll[i].removeEventListener('click', toggleService);
          }
        }
      }

    };
    var pageAction = {

      init: function (page) {
        var scheduleButton = page.querySelector('.orders__schedule');
        var filter = page.querySelector('.orders__filter');
        var scheduleOrder = page.querySelector('.right-side__wrap--schedule');
        var selectAll = page.querySelectorAll('.selection');
        var firstOrderAll = page.querySelectorAll('.right-side__wrap');
        var menuButton = page.querySelector('.main-menu__btn--open');
        var contactButton = page.querySelector('.contact__callback');

        // if (contactButton) {
        //     contactButton.addEventListener('click', contactMe);
        // }

        // if (menuButton) {
        //   if (window.innerWidth <= 1280) {
        //     menuButton.addEventListener('click', openMenu);
        //   }
        // }

        for (var i = 0; i < selectAll.length; i++) {
          getSelect(selectAll[i]);
        }

        for (var i = 0; firstOrderAll.length > i; i++) {
          if (!firstOrderAll[i].classList.contains('right-side__wrap--schedule')) {
            orderAction.init(firstOrderAll[i]);
          }
        }

        if (scheduleOrder) {
          scheduleAction.init(scheduleOrder);
        }

        if (scheduleButton) {
          scheduleButton.addEventListener('click', openSchedule);
        }

        if (listContainer) {
          listContainer.addEventListener('click', openOrder);
        }

        if (filter) {
          filter.addEventListener('click', filterSwitch);
        }
        // setTimeout(function () {
        //   scrollContainer().addEventListener('scroll', addListScroll);
        // }, 0);
      },

      deleteInteractive: function (page) {
      }
    };

    var Rating = function() {
      this.order = null;
      this.orderRating = null;
      this.orderStars = null;
      this.orderButtonRating = null;
      this.orderNumber = null;
      this.ratingForm = document.querySelector('.rating-form');
      this.title = document.querySelector('.rating-form__title');
      this.popUp = document.querySelector('.pop-up');
      this.mainContent = document.querySelector('.main-content');
      this.stars = document.querySelectorAll('.stars');
      this.orders = document.querySelectorAll('.right-side__wrap');
      this.buttonClose = document.querySelector('.rating-form__btn--close');
      this.form = document.querySelector(".rating-form__wrap");
      this.postRating = document.querySelector('.post-rating');
      this.popUp = document.querySelector('.pop-up');
      this.mainContent = document.querySelector('.main-content');
      this.buttonClosePost = document.querySelector('.post-rating__btn-close');
      this.buttonPost = document.querySelector('.post-rating__button');
      this.button = this.form.querySelector('button[type="submit"]');
      this.textarea = this.form.querySelector('.rating-form__textarea');
      this.inputs = this.form.querySelectorAll('.stars__input');
      this.inputValue = null;
      this.textareaValue = null;
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.submit = this.submit.bind(this);
    };
    Rating.prototype.rememberInputValue = function () {
      for (var i = 0; i < this.inputs.length; i++) {
        var element = this.inputs[i];
        if (this.inputs[i].checked) {
          var name = element.name;
          var value = element.value;
          return this.inputValue = {
            "Param": name,
            "Value": Number(value)
          };
        }
      }
    };
    Rating.prototype.rememberTextareaValue = function () {
      return this.textareaValue = this.textarea.value;
    };
    Rating.prototype.open = function (target) {
      this.order = target.parentNode.parentNode;
      this.orderRating = this.order.querySelector('.rating');
      this.orderStars = this.order.querySelector('.rating__stars');
      this.orderButtonRating = this.order.querySelector('.rating__button');

      for (var i = 0; this.orders.length > i; i++) {
        if (!this.orders[i].classList.contains('right-side__wrap--hide')) {
          this.orderNumber = this.orders[i].getAttribute('data-ordernumber');
        }
      }

      this.title.innerHTML = 'Оценка за заказ №' + this.orderNumber;
      this.mainContent.classList.add('main-content--hide');
      this.popUp.classList.remove('pop-up--hide');
      this.ratingForm.classList.remove('rating-form--hide');

      if (clientIsMobile()) {
        scrollContainer().scrollTop = 0;
      }

      this.form.addEventListener('submit', this.submit);
      this.form.addEventListener('submit', sendAnalitic);
      this.buttonClose.addEventListener('click', this.close);
    };
    Rating.prototype.close = function(e) {
      if (e) {
        e.preventDefault();
      }

      this.mainContent.classList.remove('main-content--hide');
      this.popUp.classList.add('pop-up--hide');
      this.ratingForm.classList.add('rating-form--hide');

      this.buttonClose.removeEventListener('click', this.close);
      this.form.removeEventListener('submit', this.submit);
      this.form.removeEventListener('submit', sendAnalitic);
      for (var i = 0; i < this.inputs.length; i++) {
        if (this.inputs[i].checked) {
          this.inputs[i].checked = false;
        }
      }

      rating = null;
      eventHelper.need('open', false);
    };
    Rating.prototype.submit = function(e) {
      e.preventDefault();
      this.rememberTextareaValue();
      this.rememberInputValue();
      var self = this;

      if (this.inputValue) {

        var formData = {
          Method: 'Client.SetOrderReview',
          Param: {
            "DepartureID": state.item.uuid,
            "Note": this.textareaValue,
            "Scores": [this.inputValue]
          }
        };

        function response(data) {
          if (data.Success === true) {
            self.button.disabled = false;
            self.ratingForm.classList.add('rating-form--hide');
            self.buttonClose.removeEventListener('click', this.close);
            for (var i = 0; i < self.inputs.length; i++) {
              if (self.inputs[i].checked) {
                self.inputs[i].checked = false;
              }
            }
            self.orderRating.removeChild(self.orderButtonRating);
            if (self.orderStars.classList.contains('rating__stars--hide')) {
              self.orderStars.classList.remove('rating__stars--hide');
            }
            var star = self.orderStars.querySelectorAll('.rating__label');
            star[star.length - self.inputValue.Value].classList.add('rating__label--active');

            if (self.inputValue.Value >= 4) {
              self.openPost(self.inputValue, self.textareaValue);

            } else {
              self.close();
            }
          } else {
            self.button.disabled = false;
          }
        }

        function error() {
          self.button.disabled = false;
        }

        var json = JSON.stringify(formData);
        this.button.disabled = true;

        sendData(requestApiUrl, json, response, error);
      }
    };
    Rating.prototype.openPost = function() {
      this.otzovic = this.postRating.querySelector('.social-link--otzovic');
      this.yell = this.postRating.querySelector('.social-link--yell');
      this.postRating.classList.remove('post-rating--hide');
      this.buttonClosePost.addEventListener('click', this.closePostRating.bind(this));
      this.buttonPost.addEventListener('click', sendAnalitic);
      this.buttonPost.addEventListener('click', this.postReviewSite.bind(this));
      this.otzovic.addEventListener('click', sendAnalitic);
      this.yell.addEventListener('click', sendAnalitic);
    };
    Rating.prototype.postReviewSite = function() {
      var postData = {
        "name": domovenokClient.name,
        "score": this.inputValue,
        "departureId": state.item.uuid,
        "content": this.textareaValue,
        "orderNumber": this.orderNumber
      };

      var json = JSON.stringify(postData);
      var requestUrl = requestItemUrl + 'internal/review';

      function response(data) {
        if (data.Success === true) {
          //window.open(data.Data.redirect, "Domovenok");
          window.location.replace(data.Data.redirect);
        }
      }

      sendData(requestUrl, json, response);
    };
    Rating.prototype.closePostRating = function() {
      this.postRating.classList.add('post-rating--hide');
      this.close();
      this.buttonClosePost.removeEventListener('click', this.close);
      this.buttonPost.removeEventListener('click', this.postReviewSite);
      this.buttonPost.removeEventListener('click', sendAnalitic);
      this.otzovic.removeEventListener('click', sendAnalitic);
      this.yell.removeEventListener('click', sendAnalitic);
    };

    var listScrollAction = {
      init: function (container) {
        container.addEventListener('scroll', addListScroll);
      },

      deleteInteractive: function (container) {
        container.removeEventListener('scroll', addListScroll);
      }

    };

    page.base('/private');
    page('/adr:adrid/ord:ordid', state.setAddressOrder);
    page('/adr:adrid/shd:shdid', state.setAddressSchedule);
    page('/adr:adrid', state.setAddress);
    page('', function (ctx) {
      window.location.replace(ctx.state.redirect);
    });
    page();

    pageAction.init(document);

    if (!clientIsMobile()) {
      tabsAction.init();
    }
    }


    if (invitePage) {
      if (invitePage) {
        inviteFriend();
      }
    }

    if (pageAuth) {
      var codePath = 'm/getcode';
      var authPath = 'auth';

      var requestCodeUrl = generalPath.buildUrl(codePath);
      //var requestAuthUrl = generalPath.buildUrl(authPath);
      var requestAuthUrl = '';

      var formTel = document.querySelector('.authorization__form--tel');
      var formCode = document.querySelector('.authorization__form--code');
      var tel = document.querySelector('.authorization__input--tel');
      var password = document.querySelector('.authorization__input--password');
      var mobileInput = document.querySelector('input[name="isMobile"]');

      tel.value = '+7';
      tel.focus();
      tel.selectionStart = tel.value.length;

      if (clientIsMobile()) {
        mobileInput.value = "true";
      }

      formTel.addEventListener('submit', passAuth);
    }


    function addListScroll(e) {
      if (!document.querySelector('.help')) {
        var newScrollTop = scrollContainer().scrollTop;
        var directionUP = newScrollTop < lastScrollTop;
        lastScrollTop = newScrollTop;
        var filter = document.querySelector('.orders__filter');
        scrollContainer().removeEventListener('scroll', addListScroll);

        if (filter) {
          filter.removeEventListener('click', filterSwitch);
        }

        var page = document.querySelector('html');
        var page2 = document.querySelector('.page');

        if (clientIsMobile()) {
          var getBottomScroll = page.scrollHeight - (window.innerHeight + window.pageYOffset);
        } else {
          var getBottomScroll = scrollContainer().scrollHeight - (scrollContainer().offsetHeight + scrollContainer().scrollTop);
        }


        if (!listScrollBegin && directionUP) {
          if ((clientIsMobile() && window.pageYOffset < 100) || (!clientIsMobile() && scrollContainer().scrollTop < 100)) {

            var listItems = document.querySelectorAll('.orders-item');
            if (listItems.length) {
              var firstItemId = listItems[0].getAttribute('data-departureid');
            }

            function render(data) {
              renderOrders(data);
              setTimeout(function () {
                scrollContainer().addEventListener('scroll', addListScroll);
                if (filter) {
                  filter.addEventListener('click', filterSwitch);
                }
              }, 0);
            }

            scrollDirection = 1;
            var url = requestItemUrl + addressType + state.address.id + '?direction=' + scrollDirection + '&status=' + filterStatus + '&departureID=' + firstItemId;

            getData(url, render);
            return;
          } else {
            setTimeout(function () {
              scrollContainer().addEventListener('scroll', addListScroll);
              if (filter) {
                filter.addEventListener('click', filterSwitch);
              }
            }, 0);
          }
        } else if (!listScrollEnd && !directionUP) {
          if (getBottomScroll < 150) {
            var listItems = document.querySelectorAll('.orders-item');
            var lastItemId = listItems[listItems.length - 1].getAttribute('data-departureid');
            scrollDirection = -1;
            var url = requestItemUrl + addressType + state.address.id + '?direction=' + scrollDirection + '&status=' + filterStatus + '&departureID=' + lastItemId;

            function render(data) {
              renderOrders(data);
              setTimeout(function () {
                scrollContainer().addEventListener('scroll', addListScroll);
                if (filter) {
                  filter.addEventListener('click', filterSwitch);
                }
              }, 0);
            }

            getData(url, render);
          } else {
            setTimeout(function () {
              scrollContainer().addEventListener('scroll', addListScroll);
              if (filter) {
                filter.addEventListener('click', filterSwitch);
              }
            }, 0);
          }
        } else {
          setTimeout(function () {
            scrollContainer().addEventListener('scroll', addListScroll);
            if (filter) {
              filter.addEventListener('click', filterSwitch);
            }
          }, 0);
        }

      }

    }

    function filterSwitch(e) {
      e.preventDefault();

      var target = e.target;
      while (target != this) {
        if (target.classList.contains('orders__option')) {
          var filter = document.querySelector('.orders__filter');
          var optionActiveAll = document.querySelectorAll('.orders__option--active');

          filterStatus = e.target.getAttribute('data-status');
          filter.removeEventListener('click', filterSwitch);
          scrollContainer().removeEventListener('scroll', addListScroll);

          listScrollEnd = false;
          listScrollBegin = false;
          scrollDirection = -1;


          var url = requestItemUrl + state.address.url + '?status=' + filterStatus;

          if (state.item.type == orderType) {
            var elem = rightSide.querySelector('[data-departureid="' + state.item.uuid + '"]');
            if (elem && filterStatus == elem.getAttribute('data-status')) {
              url += '&direction=0&departureID=' + state.item.uuid
            }
          }

          listContainer.innerHTML = '';

          function render(data) {
            if (data.Success == true) {
              renderOrders(data);
              var activeOrder = leftSide.querySelector('[data-departureid="' + state.item.uuid + '"]');
              utils.address._setActiveOrder(state.item);
              scrollCoordinate(activeOrder);
              eventHelper.need('open', false);

              setTimeout(function () {
                filter.addEventListener('click', filterSwitch);
                scrollContainer().addEventListener('scroll', addListScroll);
              }, 0);
            } else {
              setTimeout(function () {
                filter.addEventListener('click', filterSwitch);
                scrollContainer().addEventListener('scroll', addListScroll);
              }, 0);
            }
          }

          getData(url, render);

          for (var i = 0; optionActiveAll.length > i; i++) {
            if (optionActiveAll[i].classList.contains('orders__option--active')) {
              optionActiveAll[i].classList.remove('orders__option--active');
            }
          }

          e.target.classList.add('orders__option--active');

          return;
        }
        target = target.parentNode;
      }
    }

    // <#Connect to server>
    function sendDataForm(url, json, response, error) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.onerror = error;
      xhr.onload = function (event) {
        var data = JSON.parse(event.target.response);
        if (data) {
          response(data);
        }
      };
      xhr.send(json);
    }

    function sendData(url, json, response, error) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.onerror = error;
      xhr.onload = function(event) {
        var data = JSON.parse(event.target.response);
        if (data) {
          response(data);
        }
      };
      xhr.send(json);
    }

    function getData(url, render, error) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onerror = error;
      xhr.onload = function (event) {
        var data = JSON.parse(event.target.response);
        render(data);
      };
      xhr.send();
    }

    // </Connect to server>

    // <#Render>
    function renderOrders(data) {
      var data = data.Data;
      var oldHeight = listContainer.getBoundingClientRect().height;

      if (scrollDirection == 1) {
        data.DepartureList = data.DepartureList.reverse();
      }

      if (data.Begin) {
        listScrollBegin = data.Begin;
      }

      if (data.End) {
        listScrollEnd = data.End;
      }

      if (data.DepartureList.length) {
        data.DepartureList.forEach(function (item) {
          var template = document.getElementById('orders-template').innerHTML;
          var Html = Mustache.render(template, {
            'number': item.OrderNumber,
            'time': moment.parseZone(moment.utc(item.Date).utcOffset(item.TimeZone).format()).format('DD.MM.YYYY HH:mm'),
            'cost': item.TotalAmount.toFixed(2),
            'id': item.DepartureID
          });

          var div = document.createElement('div');
          div.setAttribute('data-departureid', item.DepartureID);
          div.classList.add('orders-item');
          div.innerHTML = Html;

          if (scrollDirection == -1) {
            listContainer.appendChild(div);
          } else if (scrollDirection == 1) {
            listContainer.insertBefore(div, listContainer.firstChild);
          } else {
            listContainer.appendChild(div);
          }
        });
        if (scrollDirection == 1) {
          listContainer.parentElement.scrollTop = listContainer.getBoundingClientRect().height - oldHeight;
          lastScrollTop = listContainer.parentElement.scrollTop
        }

        if (!listContainer.parentNode.classList.contains('orders-wrap--list')) {
          listContainer.parentNode.classList.add('orders-wrap--list');
        }
      } else {
        var orders = listContainer.querySelectorAll('.orders-item');

        if (!orders.length) {
          var text = document.createElement('span');
          text.classList.add('orders__note');
          if (data.StatusCode == '1') {
            text.innerText = "Актуальные заказы отсутствуют";
          } else if (data.StatusCode == '2') {
            text.innerText = "Выполненные заказы отсутствуют";
          } else {
            text.innerText = "Отмененные заказы отсутствуют";
          }

          listContainer.appendChild(text);
          if (listContainer.parentNode.classList.contains('orders-wrap--list')) {
            listContainer.parentNode.classList.remove('orders-wrap--list');
          }
        }
      }
    }

    function renderOrder(data) {
      var data = data.Data.DepartureData;
      var optionActive = null;


      if (clientIsMobile()) {
        var orders = rightSide.querySelectorAll('.right-side__wrap');

        if (orders.length != 0) {
          for (var i = 0; orders.length > i; i++) {
            rightSide.removeChild(orders[i]);
          }
        }

        leftSide.classList.add('left-side--hide');
        rightSide.classList.remove('right-side--hide');
        scrollContainer().scrollTop = 0;
      }

      for (var i = 0; i < data.Services.length; i++) {
        data.Services[i].AmountWithDiscount = data.Services[i].AmountWithDiscount.toFixed(2);
        data.Services[i].Amount = data.Services[i].Amount.toFixed(2);
        for (var j = 0; j < data.Services[i].ObjectClass.length; j++) {
          data.Services[i].ObjectClass[j].Amount = data.Services[i].ObjectClass[j].Amount.toFixed(2);
        }
      }

      var departureid = data.DepartureID;
      var count = (data.AmountWithDiscount - data.PaidAmount > 0) ? data.AmountWithDiscount - data.PaidAmount : 0;
      switch (data.PaymentType) {
        case paymentType.card.type: {
          optionActive = paymentType.card.title;
          break
        }
        case paymentType.cash.type: {
          optionActive = paymentType.cash.title;
          break
        }
        case paymentType.receipt.type: {
          optionActive = paymentType.receipt.title;
          break
        }
        case paymentType.cashOffice.type: {
          optionActive = paymentType.cashOffice.title;
          break
        }
        default:

          optionActive = paymentType.cash.title;
          break
      }

      switch (data.StatusCode) {
        case 1:
          StatusCode = 'Active';
          break;
        case 2:
          StatusCode = 'Completed';
          break;
        case 3:
          StatusCode = 'Cancelled';
          break;
      }

      var timeZone = data.TimeZone;
      var timeOf = moment.parseZone(moment.utc(data.Date).utcOffset(timeZone).format());

      var newtemplate = document.getElementById('order-active').innerHTML;
      var html = Mustache.render(newtemplate, {
        'isActive': data.StatusCode == 1,
        'isCompleted': data.StatusCode == 2,
        'isCanceled': data.StatusCode == 3,
        'OrderNumber': data.OrderNumber,
        'timeDay': timeOf.format('DD.MM.YYYY'),
        'timeHour': timeOf.format('HH:mm'),
        'Services': data.Services,
        'Employees': data.Employees,
        'AmountWithDiscount': data.AmountWithDiscount.toFixed(2),
        'Discount': data.Discount ? data.Discount : null,
        'DiscountAll': data.Discount.toFixed(2),
        'DiscountPercent': Math.round(data.Discount / (data.AmountWithDiscount + data.Discount) * 100),
        'Review': data.Review,
        'isPaid': data.ChangePaymentType == false && (data.AmountWithDiscount - data.PaidAmount) == 0,
        'isCard': data.PaymentType == paymentType.card.type,
        'isChange': data.ChangePaymentType,
        'Count': count,
        'OptionActive': optionActive,
        'PaymentType': data.PaymentType,
        'RatingGorgeous': data.Rating == 5,
        'RatingGood': data.Rating == 4,
        'RatingRegular': data.Rating == 3,
        'RatingPoor': data.Rating == 2,
        'RatingBad': data.Rating == 1
      });

      var div = document.createElement('div');
      div.classList.add('right-side__wrap');
      div.setAttribute('data-departureId', departureid);
      div.setAttribute('data-ordernumber', data.OrderNumber);
      div.setAttribute('data-status', StatusCode);
      div.innerHTML = html;

      if (!clientIsMobile()) {
        tabsAction.add(div, departureid, orderType);
      }

      rightSide.appendChild(div);
      orderAction.init(div);

      if (platform.name === 'Safari' && (platform.product === 'iPad') && platform.version >= 8) {
        var appleBlock = document.createElement('div');
        appleBlock.classList.add('apple-block');
        if (div.classList.contains('right-side__wrap')) {
          div.appendChild(appleBlock);
        }
      }
    }

    function renderSchedule(data) {
      if (data.Data.ScheduleData) {
        var data = data.Data.ScheduleData;
        var Periodicity = 4 * 7;

        if (clientIsMobile()) {
          var orders = rightSide.querySelectorAll('.right-side__wrap');

          if (orders.length > 0) {
            for (var i = 0; orders.length > i; i++) {
              rightSide.removeChild(orders[i]);
            }
          }

          leftSide.classList.add('left-side--hide');
          rightSide.classList.remove('right-side--hide');
          scrollContainer().scrollTop = 0;
        }

        var date = new Date();
        var mondayDay = date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);
        var firstDay = new Date(date.setDate(mondayDay));
        var dayScheduleArray = [];
        var dayArray = [];

        for (var i = 0; i < data.CalculationMapList.length; i++) {
          if (i == 0) {
            data.CalculationMapList[i].Active = true;
          }

          data.CalculationMapList[i].Days.forEach(function(item) {
            dayScheduleArray.push({
              day: moment.parseZone(moment.utc(item).utcOffset(data.CalculationMapList[i].TimeZone).format())._d.getDate(),
              month: moment.parseZone(moment.utc(item).utcOffset(data.CalculationMapList[i].TimeZone).format())._d.getMonth(),
              index: i + 1
            })
          });

          data.CalculationMapList[i].formatTime = moment.parseZone(moment.utc(data.CalculationMapList[i].Time).utcOffset(data.CalculationMapList[i].TimeZone).format()).format("HH:mm");
          data.CalculationMapList[i].DiscountPercent = Math.round(data.CalculationMapList[i].Discount / (data.CalculationMapList[i].AmountWithDiscount + data.CalculationMapList[i].Discount) * 100);
          data.CalculationMapList[i].AmountWithDiscount = data.CalculationMapList[i].AmountWithDiscount.toFixed(2);
          data.CalculationMapList[i].DiscountAll = data.CalculationMapList[i].Discount.toFixed(2);
          data.CalculationMapList[i].index = i + 1;
          for (var j = 0; j < data.CalculationMapList[i].Services.length; j++) {
            data.CalculationMapList[i].Services[j].AmountWithDiscount = data.CalculationMapList[i].Services[j].AmountWithDiscount.toFixed(2);
            data.CalculationMapList[i].Services[j].Amount = data.CalculationMapList[i].Services[j].Amount.toFixed(2);
            for (var g = 0; g < data.CalculationMapList[i].Services[j].ObjectClass.length; g++) {
              data.CalculationMapList[i].Services[j].ObjectClass[g].Amount = data.CalculationMapList[i].Services[j].ObjectClass[g].Amount.toFixed(2);
              data.CalculationMapList[i].Services[j].ObjectClass[g].DiscountPercent = Math.round(data.CalculationMapList.Discount / (data.CalculationMapList.AmountWithDiscount + data.Discount) * 100);
            }
          }
        }

        for (var i = 0; i < Periodicity; i++) {
          var day = firstDay;

          dayArray.push({
            day: day.getDate(),
            month: day.getMonth(),
            isActive: function () {
              var sortday = dayScheduleArray.sort(function(a, b) {
                if (a.month >= b.month) {
                  if (a.day > b.day) {
                    return 1;
                  }
                }
                if (a.month <= b.month) {
                  if (a.day < b.day) {
                    return -1;
                  }
                }
              }, this);

              return sortday[0].day === this.day && sortday[0].month === this.month;

            },
            index: function() {
              var day = dayScheduleArray.filter(function(item) {
                return item.day === this.day && item.month === this.month;
              }, this);

              if (day.length > 0) {
                return day[0].index;
              } else {
                return 0;
              }
            },

            isSchedule: function() {
              var day = dayScheduleArray.filter(function(item) {
                return item.day === this.day && item.month === this.month;
              }, this);

              if (day.length > 0) {
                return true;
              } else {
                return false;
              }
            }
          });
          day.setDate(day.getDate() + 1);
        }

        var departureId = data.ObjectID;

        var newtemplate = document.getElementById('order-schedule').innerHTML;
        var html = Mustache.render(newtemplate, {
          'CalculationMapList': data.CalculationMapList,
          'OrderNumber': data.OrderNumber,
          'timeDay': moment(data.Date).format('DD.MM.YYYY'),
          'timeHour': moment(data.Date).format('HH:mm'),
          'Services': data.CalculationMapList.Services,
          'Employees': data.CalculationMapList.Employees,
          'Days': dayArray,
          'Periodicity': (Periodicity > 7),
          'RemoveValue': true
        });

        var div = document.createElement('div');
        div.classList.add('right-side__wrap--schedule');
        div.classList.add('right-side__wrap');
        div.setAttribute('data-departureId', departureId);
        div.setAttribute('data-status', 'Schedule');
        div.innerHTML = html;


        if (!clientIsMobile()) {
          tabsAction.add(div, departureId, scheduleType);
        }

        rightSide.appendChild(div);
        scheduleAction.init(div);

        if (platform.name === 'Safari' && (platform.product === 'iPad') && platform.version >= 8) {
          var appleBlock = document.createElement('div');
          appleBlock.classList.add('apple-block');
          if (div.classList.contains('right-side__wrap--schedule')) {
            div.appendChild(appleBlock);
          }
        }
      }
    }

    // </Render>

    // <#Open>
    function openOrder(e) {
      e.preventDefault();
      var target = e.target;
      while (target != this) {
        if (target.classList.contains('orders-item')) {

          var departureid = target.getAttribute('data-departureid').replace(/-/g, '');

          if (departureid) {
            href = "/" + state.address.url + "/ord" + departureid;

            if (target.classList.contains('orders-item--active')) {
              page.show(href, {orderActive: true});
            } else {
              page.show(href);
            }
          }
          return;
        }
        target = target.parentNode;
      }
    }

    function openSchedule(e) {
      e.preventDefault();
      var target = e.target;

      var orders = rightSide.querySelectorAll('.right-side__wrap');

      if (clientIsMobile()) {
        if (orders.length > 0) {
          for (var i = 0; orders.length > 1; i++) {
            rightSide.removeChild(orders[i]);
          }
        }
      }

      href = "/" + state.address.url + "/shd" + state.address.id;
      page.show(href, {scheduleBtn : true});
    }

    function openMenu(e) {
      e.preventDefault();
      var page = document.querySelector('.page');

      if (!page.classList.contains('page--main-menu-open')) {
        page.classList.add('page--main-menu-open');
        header.classList.add('page-header--open');
      }

      headerAction.menuInit(header);
      eventHelper.need('open', true);
    }

    function openRating(e) {
      e.preventDefault();
      rating = new Rating();
      rating.open(e.target);
    }

    // </Open>

    // <#Close>
    function closeMenu(e) {
      e.preventDefault();
      var page = document.querySelector('.page');

      header.classList.remove('page-header--open');
      page.classList.remove('page--main-menu-open');

      headerAction.menuRemove(header);
      eventHelper.need('open', true);
    }

    function closeOrder(e) {
      e.preventDefault();
      var target = e.target;
      while (target != this) {
        target = target.parentNode;
      }

      if (target.classList.contains('icon-close')) {
        var itemUrl = (tabsAction.tabs.length > 1) ? ('/' + tabsAction.tabs[tabsAction.tabs.length - 2].url) : '';
        var currentAddressUrl = '/' + state.address.url + itemUrl;

        page.show(currentAddressUrl, {delete: true});

        if (target.parentNode.classList.contains('right-side__wrap--schedule')) {
          scheduleAction.deleteInteractive(target.parentNode);
        } else {
          orderAction.deleteInteractive(target.parentNode);
        }
      }
    }

    // </Close>

    // <#Switch>
    function toggleSelect(e) {
      e.preventDefault();
      var target = e.target;
      if (target.classList.contains('selection-btn__arrow')) {
        target = target.parentNode;
      }

      function touchOutsideCloseSelect(e) {
        e.preventDefault();

        if (!e.target.classList.contains('selection-btn__button') && !e.target.classList.contains('selection-btn__arrow')) {
          target.parentNode.classList.remove('selection-btn--open');
          document.removeEventListener('click', touchOutsideCloseSelect);
        }
      }

      if (target.parentNode.classList.contains('selection-btn--open')) {
        target.parentNode.classList.remove('selection-btn--open');
        document.removeEventListener('click', touchOutsideCloseSelect);
      } else {
        target.parentNode.classList.toggle('selection-btn--open');
        document.addEventListener('click', touchOutsideCloseSelect);
      }
    }

    function toggleService(e) {
      var target = e.target;

      e.preventDefault();
      while (target != this) {
        if (target.classList.contains('service__item-wrap') && target.parentNode.classList.contains('service__item--sub')) {
          target.parentNode.classList.toggle('service__item--open');
          return;
        }
        target = target.parentNode;
      }
    }

    function toggleDays(e) {
      e.preventDefault();
      target = e.target;
      while (target != this) {
        if (target.classList.contains('calendar__item--schedule') && !target.classList.contains('calendar__item--active')) {
          var activeItem = target.parentNode.querySelector('.calendar__item--active');
          var dayNumberActive = target.getAttribute('data-index');
          var containers = target.parentNode.parentNode.parentNode.parentNode.nextElementSibling;
          var containerAll = containers.querySelectorAll('.right-side__container');

          if (activeItem.getAttribute('data-index') !== target.getAttribute('data-index')) {
            for (var i = 0; i < containerAll.length; i++) {
              if (containerAll[i].getAttribute('data-index') == dayNumberActive) {
                var container = containers.querySelector('.right-side__container--active');
                var service = containerAll[i].querySelector('.service__wrap');
                var serviceOld = container.querySelector('.service__wrap');
                container.classList.remove('right-side__container--active');
                containerAll[i].classList.add('right-side__container--active');

                service.addEventListener('click', toggleService);
                serviceOld.removeEventListener('click', toggleService);
              }
            }
          }

          activeItem.classList.remove('calendar__item--active');
          target.classList.add('calendar__item--active');

          eventHelper.need('open', false);

          return;
        }
        target = target.parentNode;
      }
    }

    // </Switch>

    // <#Payment>
    function paymentOrder(e) {
      e.preventDefault();
      var target = e.target;
      var orderNumber = target.parentNode.parentNode.parentNode.getAttribute('data-ordernumber');

      if (target.classList.contains('payment__button')) {
        var form = new FormData();
        form.append('exit', 'true');
        form.append('form_order_id', "ORD-" + orderNumber);
        form.append('form_amount', target.getAttribute('data-count'));
      }


      function response(data) {
        if (data.Success == true) {
          page.show('', {redirect: data.Data.redirect});
        } else {
          target.disabled = false;
        }
      }

      function error() {
        target.disabled = false;
      }

      target.disabled = true;

      sendDataForm(requestPaymentUrl, form, response, error)
    }

    function changePaymentOrder(e) {
      e.preventDefault();

      var container = e.target.parentNode.parentNode.parentNode;
      var DefaultWrap = container.querySelector('.payment__wrap--default');
      var OptionsWrap = container.querySelector('.payment__wrap--options');
      var ActiveOption = DefaultWrap.querySelector('.payment__option');
      var options = OptionsWrap.querySelectorAll('.payment__option');

      DefaultWrap.classList.add('payment__wrap--hide');
      OptionsWrap.classList.remove('payment__wrap--hide');


      if (ActiveOption.innerHTML == paymentType.cash.title) {
        options[0].classList.add('payment__indicator--checked');
      } else if (ActiveOption.innerHTML == paymentType.card.title) {
        options[1].classList.add('payment__indicator--checked');
      }
    }

    function sendMethodPayment(e) {
      e.preventDefault();
      var container = e.target.parentNode.parentNode.parentNode;
      var DefaultWrap = container.querySelector('.payment__wrap--default');
      var OptionsWrap = container.querySelector('.payment__wrap--options');
      var ActiveOption = DefaultWrap.querySelector('.payment__option');
      var target = e.target;
      var options = OptionsWrap.querySelectorAll('.payment__option');
      var paymentButton = DefaultWrap.querySelector('.payment__button');
      var buttonChange = DefaultWrap.querySelector('.payment__btn--change');
      var noteSuccess = DefaultWrap.querySelector('.payment__note--success');
      var value = null;


      if (target.innerHTML == ActiveOption.innerHTML) {
        DefaultWrap.classList.remove('payment__wrap--hide');
        OptionsWrap.classList.add('payment__wrap--hide');
        eventHelper.need('open', true);
      } else {
        if (target.innerHTML == paymentType.card.title) {
          value = paymentType.card.type;
        } else if (target.innerHTML == paymentType.cash.title) {
          value = paymentType.cash.type;
        }

        var json = JSON.stringify({
          Method: "Client.SetOrderPaymentType",
          Param: {
            DepartureID: state.item.uuid,
            PaymentType: value
          }
        });

        function response(data) {
          if (data.Success == true && data.Data.Result == true) {
            if ((data.Data.AmountWithDiscount - data.Data.PaidAmount) !== 0) {
              if (value == paymentType.card.type) {
                if (paymentButton.classList.contains('payment__button--hide')) {
                  paymentButton.classList.remove('payment__button--hide');
                  paymentButton.setAttribute('data-count', (data.Data.AmountWithDiscount - data.Data.PaidAmount));
                }
              } else {
                if (!paymentButton.classList.contains('payment__button--hide')) {
                  paymentButton.classList.add('payment__button--hide');
                }
              }
            } else {
              if (value == paymentType.card.type) {
                if (!paymentButton.classList.contains('payment__button--hide')) {
                  paymentButton.classList.add('payment__button--hide');
                }
                if (!buttonChange.classList.contains('payment__btn--hide')) {
                  buttonChange.classList.add('payment__btn--hide');
                }
                if (noteSuccess.classList.contains('payment__note--hide')) {
                  noteSuccess.classList.remove('payment__note--hide');
                }
              } else {
                if (!paymentButton.classList.contains('payment__button--hide')) {
                  paymentButton.classList.add('payment__button--hide');
                }
                if (buttonChange.classList.contains('payment__btn--hide')) {
                  buttonChange.classList.remove('payment__btn--hide');
                }
                if (!noteSuccess.classList.contains('payment__note--hide')) {
                  noteSuccess.classList.add('payment__note--hide');
                }
              }
            }

            for (var i = 0; options.length > i; i++) {
              if (options[i].classList.contains('payment__indicator--checked')) {
                options[i].classList.remove('payment__indicator--checked');
              }
            }

            target.classList.add('payment__indicator--checked');
            ActiveOption.innerHTML = target.innerHTML;
            DefaultWrap.classList.remove('payment__wrap--hide');
            OptionsWrap.classList.add('payment__wrap--hide');

          } else {
            DefaultWrap.classList.remove('payment__wrap--hide');
            OptionsWrap.classList.add('payment__wrap--hide');
          }

          eventHelper.need('open', true);
        }

        function error() {
          DefaultWrap.classList.remove('payment__wrap--hide');
          OptionsWrap.classList.add('payment__wrap--hide');
        }

        sendData(requestApiUrl, json, response, error);
      }
    }

    // <#Payment>

    function actionOrder(e) {
      e.preventDefault();
      var target = e.target;
      while (target != this) {
        if (target.classList.contains('selection-btn__option--canceled')) {
          var popUp = document.querySelector('.pop-up');
          var select = document.querySelector('.selection-btn');
          var mainContent = document.querySelector('.main-content');
          var alert = document.querySelector('.general-question');
          var alertbuttonOk = document.querySelector('.general-question__button--ok');
          var alertbuttonNo = document.querySelector('.general-question__button--no');
          var alertbuttonClose = document.querySelector('.general-question__btn-close');

          if (alert) {
            alertbuttonOk.addEventListener('click', actionSend);
            alertbuttonOk.addEventListener('click', sendAnalitic);
            alertbuttonNo.addEventListener('click', actionClose);
            alertbuttonClose.addEventListener('click', actionClose);
          }


          if (clientIsMobile()) {
            mainContent.classList.add('main-content--hide');
          }

          alert.classList.remove('general-question--hide');
          popUp.classList.remove('pop-up--hide');
          popUp.classList.add('pop-up--alert');
          select.classList.remove('selection-btn--open');

          function actionSend(e) {
            e.preventDefault();
            var json = JSON.stringify({
              Method: 'Client.CancelOrder',
              Param: {
                "DepartureID": state.item.uuid
              }
            });

            function response(data) {
              if (data.Success == true) {
                var url = '/' + state.address.url + '/' + state.item.url;

                page.show(url, {cancelOrder: true});

                var div = document.createElement('div');
                div.classList.add('right-side__wrap-note');
                div.innerHTML = '<p class="right-side__note">Ваш заказ был отменен</p>';
                rightSide.insertBefore(div, rightSide.firstChild);

                setTimeout(function () {
                  rightSide.removeChild(div);
                }, 4000);

                actionClose();
              } else {

              }

            }

            function error() {

            }

            sendData(requestApiUrl, json, response, error);
          }

          function actionClose(e) {
            mainContent.classList.remove('main-content--hide');
            alert.classList.add('general-question--hide');
            popUp.classList.add('pop-up--hide');
            select.classList.remove('selection-btn--open');

            alertbuttonOk.removeEventListener('click', actionSend);
            alertbuttonOk.removeEventListener('click', sendAnalitic);
            alertbuttonNo.removeEventListener('click', actionClose);
            alertbuttonClose.removeEventListener('click', actionClose);

            if (e.currentTarget.classList.contains("general-question__btn-close")) {
              eventHelper.need('open', true);
            }
          }

          return;
        }
        target = target.parentNode;
      }
    }

    function getSelect(select) {
      var list = select.querySelector('.selection__list');
      var button = select.querySelector('.selection__btn');
      var itemList = select.querySelectorAll('.selection__option');
      var link = select.querySelectorAll('.selection__link');


      button.addEventListener('click', function (e) {
        e.preventDefault();

        var windowHeight = document.documentElement.clientHeight; //высота окна
        var top = this.getBoundingClientRect().top; //координаты кнопки
        var numberOfItems = itemList.length; //количество item в листе
        var widthOfList = numberOfItems * 47; // получаем высоту листа
        var topAll = top + 48 + widthOfList; //к координате кнопки прибавляем высоту кнопки и высоту списка

        list.style.top = 48 + 'px';

        if (select.classList.contains('selection--open-up')) {
          select.classList.remove('selection--open-up');
        }

        if (topAll > windowHeight) {
          list.style.top = -widthOfList + 'px';
          select.classList.add('selection--open-up');
        }


        select.classList.toggle('selection--open');
      });

      for (var i = 0; i < itemList.length; i++) {
        ItemActive(itemList[i]);
      }

      function ItemActive(item) {
        var link = item.querySelector(".selection__link");

        link.onclick = function (e) {
          e.preventDefault();
        };

        item.addEventListener('click', function (e) {
          e.preventDefault();
          var link = item.querySelector('.selection__link');

          select.classList.remove('selection--open');

          href = link.getAttribute('href');

          if (button.innerText === link.innerText) {
            page.show(href, {addressActive: true});
          } else {
            page.show(href);
          }

        });
      }
    }

    function scrollCoordinate(activeElement) {
      var container = document.querySelector('.orders__wrap');
      var coordinateContainer = {
        top: container.getBoundingClientRect().top,
        topScroll: container.scrollTop,
        height: container.clientHeight,
        heightList: container.scrollHeight,
        middle: container.clientHeight / 2
      };
      if (activeElement) {
        var coordinateElement = {
          top: activeElement.getBoundingClientRect().top,
          height: activeElement.clientHeight,
          middle: activeElement.clientHeight / 2
        };
        // if (coordinateContainer.topScroll !== 0  && (coordinateContainer.top - coordinateElement.top) < coordinateContainer.middle) {
        //   container.scrollTop = 0;
        // } else if (coordinateContainer.topScroll == 0 && (coordinateContainer.heightList - (coordinateElement.top - coordinateContainer.top)) < coordinateContainer.middle) {
        //   container.scrollTop = coordinateContainer.heightList - coordinateContainer.height;
        // } else {
        container.scrollTop = coordinateContainer.topScroll + coordinateElement.top - coordinateContainer.middle - coordinateContainer.top + coordinateElement.middle;
        // }

      } else {
        container.scrollTop = 0;
      }
      lastScrollTop = container.scrollTop;
    }

    function contactMe(e) {
      e.preventDefault();
      var target = e.target;
      var formData = {
        "Method": "Client.PostCallBack",
        "Param": {}

      };
      var json = JSON.stringify(formData);

      function response(data) {
        if (data.Success == true) {
          var div = document.createElement('div');
          var note = document.createElement('p');
          var message;
          div.classList.add('contact__wrap-note');
          note.classList.add('contact__note');

          if (data.Data.WorkTime) {
            message = "Спасибо, мы свяжемся с Вами через 10 минут";
          } else {
            message = "Спасибо, мы свяжемся с Вами" + "<br>" + "в начале рабочего дня";
          }

          var container = document.querySelector('.page-header__wrap');
          var contact = document.querySelector('.contact');
          var time;
          div.classList.add('contact__wrap-note');
          note.classList.add('contact__note');

          if (message.length <= 43) {
            time = 4000;
          } else {
            div.classList.add('contact__wrap-note--two-line');
            note.classList.add('contact__note--two-line');
            time = 6000;
          }

          note.innerHTML = message;
          div.innerHTML = '<p class="contact__note">' + message + '</p>';
          if (window.innerWidth <= 1280) {
            container.insertBefore(note, contact);
          } else {
            container.appendChild(div);
          }

          setTimeout(function () {
            if (window.innerWidth <= 1280) {
              var note = document.querySelector('.contact__note');
              container.removeChild(note);
              target.addEventListener('click', contactMe);
            } else {
              container.removeChild(div);
              target.addEventListener('click', contactMe);
            }
          }, time);

        } else {
          target.addEventListener('click', contactMe);
        }

      }

      function error() {
        target.addEventListener('click', contactMe);
      }

      target.removeEventListener('click', contactMe);

      sendData(requestApiUrl, json, response, error);
    }

    function openApplication(e) {
      e.preventDefault();
      var popUp = document.querySelector('.pop-up');
      var mainContent = document.querySelector('.main-content');
      var application = document.querySelector('.application');
      var postRating = document.querySelector('.post-rating');
      var ratingElement = document.querySelector('.rating-form');
      var buttonClose = application.querySelector('.icon-close');
      var selection = application.querySelector('.application__selection');
      var btn = application.querySelector('.application__selection-btn');
      var itemList = application.querySelectorAll('.application__option');
      var form = application.querySelector('.application__form');
      var alert = document.querySelector('.general-question');
      if (postRating) {
        if (!postRating.classList.contains('post-rating--hide')) {
          rating.closePostRating();
        }
      }

      if (ratingElement) {
        if (!ratingElement.classList.contains('rating-form--hide')) {
          rating.close();
        }
      }

      if (alert) {
        if (!alert.classList.contains('general-question--hide')) {
          alert.classList.add('general-question--hide');
        }
      }

      if (window.innerWidth <= 1280) {
        closeMenu(e);
        mainContent.classList.add('main-content--hide');
      }

      popUp.classList.remove('pop-up--hide');
      application.classList.remove('application--hide');

      function openSelect(e) {
        e.preventDefault();
        if (clientIsMobile()) {
          document.addEventListener('touchmove', preventDefault);
        }

        if (selection.classList.contains('application__selection--open')) {
          document.removeEventListener('touchmove', preventDefault);
        }

        selection.classList.toggle('application__selection--open');
      }

      function closeApplication(e) {
        e.preventDefault();
        if (window.innerWidth <= 1280) {
          mainContent.classList.remove('main-content--hide');
        }

        popUp.classList.add('pop-up--hide');
        application.classList.add('application--hide');

        btn.removeEventListener('click', openSelect);
        buttonClose.removeEventListener('click', closeApplication);
        eventHelper.need('open', true);
      }


      btn.addEventListener('click', openSelect);
      buttonClose.addEventListener('click', closeApplication);


      for (var i = 0; i < itemList.length; i++) {
        ItemActive(itemList[i]);
      }

      function ItemActive(item) {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          selection.classList.remove('application__selection--open');
          btn.innerHTML = item.innerHTML;
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var square = form.querySelector('.application__input--square');
        var textarea = form.querySelector('.application__textarea');
        var button = form.querySelector('button[type="submit"]');
        var formData = {
          Method: 'Client.PostCallBackOrder',
          Param: {
            "dop_info": textarea.value,
            "service": btn.innerHTML,
            "square": square.value
          }
        };

        function response(data) {
          if (data.Success == false) {
            button.disabled = false;
          } else {
            button.disabled = false;
            mainContent.classList.remove('main-content--hide');
            popUp.classList.add('pop-up--hide');
            application.classList.add('application--hide');
            textarea.value = '';
            square.value = '';
            btn.innerHTML = itemList[0].innerHTML;

            btn.removeEventListener('click', openSelect);
            buttonClose.removeEventListener('click', closeApplication);
          }
        }

        function error() {
          button.disabled = false;
        }

        var json = JSON.stringify(formData);

        button.disabled = true;

        sendData(requestApiUrl, json, response, error);
      });
    }

    function setMenuItemActive(e) {
      var target = e.target;

      if (target.classList.contains('main-menu__link')) {
        if (target.parentNode.classList.contains('main-menu__item--sub')) {
          e.preventDefault();
        }
        target = target.parentNode;

      }

      if (target.classList.contains('main-menu__item')) {
        if (target.classList.contains('main-menu__item--sub')) {
          var itemList = document.querySelectorAll('.main-menu__item');

          for (var i = 0; i < itemList.length; i++) {
            if (itemList[i].classList.contains('main-menu__item--active')) {
              if (itemList[i] !== target) {
                itemList[i].classList.remove('main-menu__item--active');
              }
            }
          }
        }
        target.classList.toggle('main-menu__item--active');
      }
    }

    function preventDefault(e) {
      e.preventDefault();
    }

    function resizePage() {
      var pageElement = document.querySelector('.page');
      var mainContent = document.querySelector('.main-content');
      var application = document.querySelector('.application');
      var pageHeader = document.querySelector('.page-header');
      var popUp = document.querySelector('.pop-up');
      var right = document.querySelector('.right-side');
      var left = document.querySelector('.orders__wrap');
      var mYurl = null;

      if (defineHeight() !== oldHeight) {

        if (pageOrders) {
          if (!clientIsMobile()) {
            setHeightOrder();
            var containers = [right, left];
            for (var i = 0; i < containers.length; i++) {
              Ps.update(containers[i]);
            }
          }
        }
      }

      switch (defineClient()) {
        case mobile:
          if (oldWidth === desktop) {
            headerAction.deleteInteractive(header);
            headerAction.init(header);
            if (application) {
              if (!application.classList.contains('application--hide')) {
                mainContent.classList.add('main-content--hide');
              }
            }

            if (popUp) {
              if (!popUp.classList.contains('pop-up--hide') && pageHeader.classList.contains('page-header--open')) {
                pageHeader.classList.remove('page-header--open');
                pageElement.classList.remove('page--main-menu-open');

                headerAction.menuRemove(pageHeader);
              }
            }
          }

          if (oldWidth === desktop || oldWidth === tablet) {
            if (pageOrders) {
              eventHelper.need('close', false);
              tabsAction.clear();
              initContainerOrder();
              mYurl = '/' + state.currentUrl();
              page.show(mYurl, {rerender: true});
            }
          }

          break;
        case tablet:
          if (oldWidth === desktop) {
            headerAction.deleteInteractive(header);
            headerAction.init(header);
            if (application) {
              if (!application.classList.contains('application--hide')) {
                mainContent.classList.add('main-content--hide');
              }
            }

            if (popUp) {
              if (!popUp.classList.contains('pop-up--hide') && pageHeader.classList.contains('page-header--open')) {
                pageHeader.classList.remove('page-header--open');
                pageElement.classList.remove('page--main-menu-open');
                headerAction.menuRemove(pageHeader);
              }
            }
          }

          if (oldWidth === mobile) {
            if (pageOrders) {
              eventHelper.need('close', false);
              tabsAction.init();
              initContainerOrder();
              mYurl = '/' + state.currentUrl();
              page.show(mYurl, {rerender: true})
            }
          }
          break;
        case desktop:
          if (oldWidth === tablet || oldWidth === mobile) {
            headerAction.deleteInteractive(header);
            headerAction.init(header);
            if (application) {
              if (!application.classList.contains('application--hide')) {
                mainContent.classList.remove('main-content--hide');
              }
            }

            if (oldWidth === mobile) {
              if (pageOrders) {
                eventHelper.need('close', false);
                tabsAction.init();
                initContainerOrder();
                mYurl = '/' + state.currentUrl();
                page.show(mYurl, {rerender: true})
              }
            }
          }
          break;
        default:
          break;
      }

      if (pageElement.classList.contains('page--main-menu-open')) {
        headerAction.menuInit(header);
      }
      if (pageOrders) {
        scrollContainer();
      }
      oldWidth = defineClient();
    }

    function initContainerOrder() {
      var right = document.querySelector(".right-side");
      var left = document.querySelector(".orders__wrap");
      var inviteFriend = document.querySelector('.invite-friend');
      var invitation = document.querySelector('.invitation');

      if (!clientIsMobile()) {
        if (left) {
          setHeightOrder();
        }

        if (inviteFriend) {
          if (!inviteFriend.classList.contains('scroll-container')) {
            inviteFriend.classList.add('scroll-container');
            Ps.initialize(inviteFriend);
          }
        }

        if (right) {
          if (!right.classList.contains('scroll-container')) {
            right.classList.add('scroll-container');
            Ps.initialize(right);
          }
        }

        if (left) {
          if (!left.classList.contains('scroll-container')) {
            left.classList.add('scroll-container');
            Ps.initialize(left);
          }
        }

        if (invitation) {
          if (!invitation.classList.contains('scroll-container')) {
            invitation.classList.add('scroll-container');
            Ps.initialize(invitation);
          }
        }

      } else {
        if (inviteFriend) {
          if (inviteFriend.classList.contains('scroll-container')) {
            inviteFriend.classList.remove('scroll-container');
            Ps.destroy(inviteFriend);
          }
        }

        if (right) {
          if (right.classList.contains('scroll-container')) {
            Ps.destroy(right);
            right.classList.remove('scroll-container');
          }
        }

        if (left) {
          if (left.classList.contains('scroll-container')) {
            left.classList.remove('scroll-container');
            Ps.destroy(left);
          }
        }

        if (invitation) {
          if (invitation.classList.contains('scroll-container')) {
            invitation.classList.remove('scroll-container');
            Ps.destroy(invitation);
          }
        }
      }
    }

    function initContainerOther() {
      var containers = document.querySelectorAll('.scroll-container-secondary');

      for (var i = 0; i < containers.length; i++) {
        Ps.initialize(containers[i]);
      }
    }

    function inviteFriend() {
      var codePath = '/m/api';
      var requestCodeUrl = generalPath.buildUrl(codePath);
      var formInvite = document.querySelector('.invite-friend__form');
      var inputName = formInvite.querySelector('.invite-friend__input--name');
      var inputTel = formInvite.querySelector('.invite-friend__input--tel');
      var button = formInvite.querySelector('.invite-friend__button');

      formInvite.addEventListener('submit', sendAnalitic);

      formInvite.addEventListener('submit', function (e) {
        e.preventDefault();
        var telValue = inputTel.value;
        var nameValue = inputName.value;
        var json = JSON.stringify({
          Method: "Client.InviteFriend",
          Param: {
            "Contact": telValue,
            "Name": nameValue
          }
        });

        function response(data) {
          if (data.Success == true) {
            inputTel.value = '';
            inputName.value = '';
            var alertOld = formInvite.parentNode.querySelector('.invite-friend__alert');

            if (alertOld) {
              formInvite.parentNode.removeChild(alertOld);
            }
            button.disabled = false;

            var alert = document.createElement('p');
            alert.innerHTML = 'Приглашение отправлено';
            alert.classList.add('invite-friend__alert');
            formInvite.parentNode.insertBefore(alert, formInvite);

            setTimeout(function () {
              formInvite.parentNode.removeChild(alert);
            }, 4000);
          } else {
            var alertOld = formInvite.parentNode.querySelector('.invite-friend__alert');

            if (alertOld) {
              formInvite.parentNode.removeChild(alertOld);
            }

            if (data.ErrorCode == "38" || data.ErrorCode == "39" || data.ErrorCode == "40") {
              var alert = document.createElement('p');

              if (data.ErrorCode == "38") {
                alert.innerHTML = 'Неверный контакт';
              }
              if (data.ErrorCode == "39") {
                alert.innerHTML = 'Человек уже был приглашен';
              }
              if (data.ErrorCode == "40") {
                alert.innerHTML = 'Уже является клиентом';
              }

              alert.classList.add('invite-friend__alert');
              alert.classList.add('invite-friend__alert--error');
              formInvite.parentNode.insertBefore(alert, formInvite);

              setTimeout(function () {
                formInvite.parentNode.removeChild(alert);
              }, 4000);
            }

            button.disabled = false;
          }
        }

        function error() {
          button.disabled = false;
        }


        button.disabled = true;
        sendData(requestCodeUrl, json, response, error);
      });
    }

    function passAuth(e) {
      e.preventDefault();
      var telValue = tel.value;
      var json = JSON.stringify({
        Method: "Auth.GetCode",
        Param: {
          Phone: tel.value
        }
      });

      function response(data) {
        if (data.Success == true) {
          var noteOld = document.querySelector('.authorization__note');
          if (noteOld) {
            formTel.removeChild(noteOld);
          }

          formTel.classList.add('authorization__form--hide');
          formCode.classList.remove('authorization__form--hide');

          password.focus();

          formCode.addEventListener('submit', function (e) {
            e.preventDefault();

            var json = JSON.stringify({
              Method: "Auth.Login",
              Param: {
                Code: password.value,
                Phone: telValue,
                isMobile: mobileInput.value

              }
            });

            function response(data) {
              if (data.Success == true) {
                window.location.replace(data.Data.redirect);
              } else {
                var noteOld = document.querySelector('.authorization__note');
                if (noteOld) {
                  formCode.removeChild(noteOld);
                }
                e.target.disabled = false;
                var note = document.createElement('p');
                note.classList.add('authorization__note');
                note.innerHTML = "Неправильный код";
                var button = formCode.querySelector('button');
                formCode.insertBefore(note, button);
              }
            }

            function error() {
              var noteOld = document.querySelector('.authorization__note');
              if (noteOld) {
                formCode.removeChild(noteOld);
              }
              e.target.disabled = false;
              var note = document.createElement('p');
              note.classList.add('authorization__note');
              note.innerHTML = "Ошибка сервера";
              var button = formCode.querySelector('button');
              formCode.insertBefore(note, button);
            }

            e.target.disabled = true;
            var url = window.location.href;

            sendData(url, json, response, error);
          });
        } else {
          var noteOld = document.querySelector('.authorization__note');
          if (noteOld) {
            formTel.removeChild(noteOld);
          }
          var note = document.createElement('p');
          note.classList.add('authorization__note');
          note.innerHTML = "Неправильный номер телефона";
          var button = formTel.querySelector('button');
          formTel.insertBefore(note, button);
          e.target.disabled = false;
        }
      }

      function error() {
        var noteOld = document.querySelector('.authorization__note');
        if (noteOld) {
          form.removeChild(noteOld);
        }
        e.target.disabled = false;
      }

      e.target.disabled = true;

      sendData(requestCodeUrl, json, response, error);
    }

    function setHeightOrder() {
      var orderX = document.querySelector(".orders");
      var orderY = document.querySelector(".orders__wrap");
      if (!clientIsMobile()) {
        var heightOrder = orderX.offsetHeight;
        orderY.style.height = heightOrder + "px";
      } else {
        orderY.style.height = 'auto';
      }

    }

    function openOrderDefinePage(e) {
      if (clientIsMobile()) {
        e.preventDefault();
        var newHref = e.target.href + '?isMobile=true';
        location.href = newHref;
      }
    }

    function sendAnalitic(e) {
      try {
        if (e.currentTarget.hasAttribute('data-ga')) {
          var ga_param = JSON.parse(e.currentTarget.getAttribute('data-ga'));

          ga('send', ga_param);
        }
      } catch(e) {

      }
    }

    function sendAnaliticSocial(name) {
      try {
        var eventLabel;
        var eventCategory;
        switch (name) {
          case "facebook" :
            if (pageOrders) {
              eventLabel = "facebook";
              eventCategory = "review_order"
            } else if (invitePage) {
              eventLabel = "facebook";
              eventCategory = "invite_friend"
            }

            break;
          case "vkontakte" :
            if (pageOrders) {
              eventLabel = " vk";
              eventCategory = "review_order"
            } else if (invitePage) {
              eventLabel = " vk";
              eventCategory = "invite_friend"
            }

            break;
          case "odnoklassniki" :
            if (pageOrders) {
              eventLabel = "ok";
              eventCategory = "review_order"
            } else if (invitePage) {
              eventLabel = "ok";
              eventCategory = "invite_friend"
            }

            break;
        }

        var ga_param = {
          "hitType": "event",
          "eventCategory": eventCategory,
          "eventAction": "share",
          "eventLabel": eventLabel
        };

        ga('send', ga_param);
      } catch(e) {

      }
    }

    function sendAnaliticId(e) {
      ga('set', '&uid', clientId);
    }

    function showHelpAgreement() {
      var template = document.getElementById('help-form');
      var elementToClone;
      var container = document.querySelector('.page__wrap');

      if ('content' in template) {
        elementToClone = template.content.querySelector('.help--form');
      } else {
        elementToClone = template.querySelector('.help--form');
      }

      var element = elementToClone.cloneNode(true);
      container.appendChild(element);

      var helpWindow = document.querySelector('.help--form');
      var form = helpWindow.querySelector('.help__form');
      var block = helpWindow.querySelector('.help__block--window');
      var buttonClose = helpWindow.querySelector('.help__button--disagree');
      var btnClose = helpWindow.querySelector('.help__btn--close');

      if (form.classList.contains('help__form--hide')) {
        form.classList.remove('help__form--hide');
      }

      helpWindow.classList.remove('help--hide');
      buttonClose.addEventListener('click', refuseHelp);
      form.addEventListener('submit', submitHelp);
      btnClose.addEventListener('click', refuseHelp);
      btnClose.addEventListener('click', sendAnalitic);
      form.addEventListener('click', sendAnalitic);
      buttonClose.addEventListener('click', sendAnalitic);


      function submitHelp(e) {
        e.preventDefault();
        var urlHelp = "m/internal/help_popup_answer";
        var url = generalPath.buildUrl(urlHelp);
        var json = JSON.stringify({
          "answer": true
        });

        function response(data) {
          if (data.Success === true) {
            if (!form.classList.contains('help__form--hide')) {
              form.classList.add('help__form--hide');
            }

            buttonClose.removeEventListener('click', refuseHelp);
            form.removeEventListener('submit', submitHelp);
            btnClose.removeEventListener('click', refuseHelp);

            container.removeChild(element);
            needTips = true;

            eventHelper.need('open', false);
          }
        }

        sendData(url, json, response);
      }

      function refuseHelp(e) {
        e.preventDefault();
        var urlHelp = "m/internal/help_popup_answer";
        var url = generalPath.buildUrl(urlHelp);
        var json = JSON.stringify({
          "answer": false
        });

        function response(data) {
          if (data.Success === true) {
            buttonClose.removeEventListener('click', refuseHelp);
            form.removeEventListener('submit', submitHelp);
            btnClose.removeEventListener('click', refuseHelp);
            container.removeChild(element);
            needTips = false;
          }
        }

        sendData(url, json, response);
      }
    }

    function elementInView(element, group) {
      var container = null;
      var heightContainer = document.documentElement.clientHeight;
      var scrollHeight = document.documentElement.scrollHeight;
      var scrollTop = window.pageYOffset;
      var heightElement = element.clientHeight;
      var topElement = element.getBoundingClientRect().top;
      var bottomElement = element.getBoundingClientRect().bottom;
      var bottomApple = null;

      if (defineClient() === mobile) {
        container = window;
      } else {
        if (group === helpUtils.group.right) {
          container = rightSide;
        }
      }

      if (platform.name === 'Safari' && (platform.product === 'iPad') && platform.version >= 8) {
        bottomApple = 100;
      } else {
        bottomApple = 0;
      }


      if (group === helpUtils.group.left && defineClient() === mobile) {
        window.scrollBy(0, 0);
      } else {
        if (heightContainer > topElement && topElement < 60) {
          if (defineClient() === mobile || group === helpUtils.group.menu) {
            container = window;
              if (scrollTop == 0) {
              } else {
                container.scrollBy(0, (topElement - 60 - 30));
              }
          } else {
            if (group === helpUtils.group.right) {
              container = rightSide;
              container.scrollTop = container.scrollTop + (topElement - 60 - 30);
            }
          }
        } else if (heightContainer - 30 - bottomApple < bottomElement) {
          if (defineClient() === mobile || group === helpUtils.group.menu) {
            container = window;
            container.scrollBy(0, (bottomElement - heightContainer + 30))
          } else {
            if (group === helpUtils.group.right) {
              container = rightSide;
              container.scrollTop = container.scrollTop + (bottomElement  - (heightContainer - bottomApple) + 30);
            }
          }
        }
      }
    }

    var HelperBlock = function (data, index, container) {
      this.data = data;
      this.index = index;
      this.buttonNextInfo = this.updateButtonNext();
      this.isClick = this.updateIsClick();
      this.finish = false;
      this.container = container;
      this.parent = this.data[this.index].parent;
      this.element = document.querySelector('.help__block--window');
      this.child = this.element.querySelector('.help__wrap');
      this.message = document.querySelector('.help__text');
      this.buttonClose = this.element.querySelector('.help__button--close');
      this.buttonNext = this.element.querySelector('.help__button--next');
      this.buttonClose.setAttribute('data-ga', JSON.stringify({"hitType": "event","eventCategory": "tips","eventLabel": 'refuse' + "_" + this.data[this.index].id}));
      this.buttonNext.setAttribute('data-ga', JSON.stringify({"hitType": "event","eventCategory": "tips","eventLabel": 'completed' + "_" + this.data[this.index].id}));
      this.image = this.element.querySelector('.help__image');
      this.height = null;
      this.width = null;
      this.indicatedElement = this.parent.querySelector("." + this.data[this.index].item());
      this.message.innerText = this.data[this.index].text();
      this.indicatedElementIndex = getComputedStyle(this.indicatedElement).zIndex;
      this.indicatedElementPosition = getComputedStyle(this.indicatedElement).position;
      this.setZindex();
      this.setPosition();
      elementInView(this.indicatedElement, this.data[this.index].group);
      this.show();
      this.setCoordinate();
      this.close = this.close.bind(this);
      this.next = this.next.bind(this);
      this.refuse = this.refuse.bind(this);
      this.resize = this.resize.bind(this);
      this.buttonClose.addEventListener('click', this.refuse);
      this.buttonNext.addEventListener('click', this.next);
      this.buttonClose.addEventListener('click', sendAnalitic);
      this.buttonNext.addEventListener('click', sendAnalitic);
      this.addEventElement();
      this.updateCoordinate = this.updateCoordinate.bind(this);
      document.addEventListener('touchmove', preventDefault);
      document.addEventListener('helperClose', this.close);
      window.addEventListener('resize', this.resize);
    };
    HelperBlock.prototype.show = function() {
      if (this.element.parentNode.classList.contains('help--hide')) {
        this.element.parentNode.classList.remove('help--hide');
      }
      this.isFinish();
    };
    HelperBlock.prototype.setZindex = function() {
      this.indicatedElement.style.zIndex = '100';

      if (this.indicatedElement.parentNode.classList.contains('orders__filter') && defineClient() === mobile) {
        this.indicatedElement.parentNode.style.zIndex = "auto";
        this.indicatedElement.parentNode.style.position = 'absolute';
      }

      if (this.indicatedElement.classList.contains('main-menu__btn--open') && defineClient() === mobile) {
        this.indicatedElement.parentNode.style.zIndex = "auto";
        this.indicatedElement.parentNode.style.position = 'static';
        rightSide.style.marginTop = 0;
      }

      if (this.indicatedElement.classList.contains('main-menu__btn--open') && defineClient() === tablet) {
        this.indicatedElement.parentNode.parentNode.style.zIndex = "auto";
        this.indicatedElement.parentNode.parentNode.style.position = 'static';
        rightSide.style.marginTop = 0;
      }
    };
    HelperBlock.prototype.removeZindex = function() {
      this.indicatedElement.style.zIndex = "";

      if (this.indicatedElement.parentNode.classList.contains('orders__filter') && defineClient() === "mobile") {
        this.indicatedElement.parentNode.style.zIndex = "";
        this.indicatedElement.parentNode.style.position = '';
      }


      if (this.indicatedElement.classList.contains('main-menu__btn--open') && defineClient() === mobile) {
        this.indicatedElement.parentNode.style.zIndex = "";
        this.indicatedElement.parentNode.style.position = '';
        rightSide.style.marginTop = '';
      }

      if (this.indicatedElement.classList.contains('main-menu__btn--open') && defineClient() === tablet) {
        this.indicatedElement.parentNode.parentNode.style.zIndex = "";
        this.indicatedElement.parentNode.parentNode.style.position = '';
        rightSide.style.marginTop = '';
      }
    };
    HelperBlock.prototype.isFinish = function () {
      var urlHelp = "m/internal/help_completed";
      var url = generalPath.buildUrl(urlHelp);
      var json = JSON.stringify({
        helpId: this.data[this.index].id
      });

      function response(data) {
        if (data.Success === true) {

        }
      }

      sendData(url, json, response);
      helpRemainder.forEach(function(item) {
        if (item.id === this.data[this.index].id) {
          item.finish = true;
        }
      }, this);

      this.element.parentNode.classList.remove('help__block--hide');
      this.finish = true;
    };
    HelperBlock.prototype.refuse = function () {
      var urlHelp = "m/internal/help_refuse";
      var url = generalPath.buildUrl(urlHelp);
      var json = JSON.stringify({
        "refuse": true
      });

      function response(data) {
        if (data.Success === true) {
          needTips = false;
          this.close();
        }
      }

      sendData(url, json, response.bind(this));
    };
    HelperBlock.prototype.buttonNextAction = function () {
      if (this.buttonNextInfo.active) {
        this.buttonNextInfo.action(this.indicatedElement);
      }
    };
    HelperBlock.prototype.close = function() {
      this.removeZindex();
      //this.indicatedElement.style.position = this.indicatedElementPosition;
      this.indicatedElement.style.position = '';
      this.buttonNext.removeEventListener('click', this.next);
      this.buttonClose.removeEventListener('click', this.close);
      this.buttonClose.removeEventListener('click', sendAnalitic);
      this.buttonNext.removeEventListener('click', sendAnalitic);
      this.removeEventElement();
      this.element.parentNode.classList.add('help--hide');
      this.container.removeChild(this.element.parentNode);
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('helperClose', this.close);
    };
    HelperBlock.prototype.next = function() {
      if (!this.buttonNextInfo.active) {
        this.removeEventElement();
        if (this.data.length > this.index + 1) {
          this.removeZindex();
          this.indicatedElement.style.position = '';
          this.index++;
          this.parent = this.data[this.index].parent;
          if (this.parent.querySelector("." + this.data[this.index].item())) {
            this.buttonNextInfo = this.updateButtonNext();
            this.buttonClose.setAttribute('data-ga', JSON.stringify({"hitType": "event","eventCategory": "tips","eventLabel": 'refuse' + "_" + this.data[this.index].id}));
            this.buttonNext.setAttribute('data-ga', JSON.stringify({"hitType": "event","eventCategory": "tips","eventLabel": 'completed' + "_" + this.data[this.index].id}));
            this.indicatedElement = this.parent.querySelector("." + this.data[this.index].item());
            elementInView(this.indicatedElement, this.data[this.index].group);
            this.isClick = this.updateIsClick();
            this.addEventElement();
            this.indicatedElementIndex = getComputedStyle(this.indicatedElement).zIndex;
            this.indicatedElementPosition = getComputedStyle(this.indicatedElement).position;
            this.setZindex();
            this.message.innerText = this.data[this.index].text();
            this.setPosition();
            this.setCoordinate();
            this.isFinish();
          } else {
            this.next();
          }
        } else {
          this.close();
        }
      } else {
        this.close();
        this.buttonNextAction(this.indicatedElement);
      }

    };
    HelperBlock.prototype.setCoordinate = function() {
      this.height = this.element.clientHeight;
      this.width = this.element.clientWidth;
      this.element.style.bottom = "auto";
      this.element.style.right = "auto";

      if (this.indicatedElement.getBoundingClientRect().top > this.height) {

        var marginTop = getComputedStyle(this.indicatedElement).marginTop;

        this.element.style.top = (this.indicatedElement.getBoundingClientRect().top - this.height) + "px";


        if (this.indicatedElement.getBoundingClientRect().left > this.width) {

          var marginLeft = getComputedStyle(this.indicatedElement).marginLeft;
          this.element.style.left = (this.indicatedElement.getBoundingClientRect().left - this.width + Number(marginLeft.slice(0, (marginLeft.length - 2)))) + "px";
          this.element.style.backgroundImage =   defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left.svg)';
          this.element.style.backgroundPosition = 'bottom right';
          this.element.style.padding =  defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 88px 34px 10px';


        } else if ((window.innerWidth - this.indicatedElement.getBoundingClientRect().right) > this.width) {

          var marginRight = getComputedStyle(this.indicatedElement).marginRight;
          this.element.style.left = (this.indicatedElement.getBoundingClientRect().right - Number(marginRight.slice(0, (marginRight.length - 2)))) + "px";
          this.element.style.backgroundImage =  defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-right-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-right.svg)';
          this.element.style.backgroundPosition =  'left bottom';
          this.element.style.padding = defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 10px 34px 88px';
        } else {

          if (window.innerWidth / 2 < this.indicatedElement.getBoundingClientRect().left) {
            this.element.style.right = 30 + "px";
            this.element.style.left = "auto";
            if (window.innerWidth / 2 + window.innerWidth / 4 > this.indicatedElement.getBoundingClientRect().left) {

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '100px bottom' : 'bottom right';
              this.element.style.padding = defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 88px 34px 10px';
            } else {

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '60px bottom' : 'bottom right';
              this.element.style.padding = defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 88px 34px 10px';
            }

          } else {
            if (window.innerWidth / 4 > this.indicatedElement.getBoundingClientRect().left) {
              this.element.style.left = 0 + "px";

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-right-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-right.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '50px bottom' : 'left bottom';
              this.element.style.padding = defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 10px 34px 88px';
            } else {

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-top-left-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-top-right.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '50px bottom' : 'left bottom';
              this.element.style.padding = defineClient() === "mobile" ? '10px 10px 50px 10px' : '10px 10px 34px 88px';
            }



          }

        }
      } else {

        var marginBottom = getComputedStyle(this.indicatedElement).marginBottom;
        this.element.style.top = (this.indicatedElement.getBoundingClientRect().bottom) + "px";

        if (this.indicatedElement.getBoundingClientRect().left > this.width) {

          var marginLeft = getComputedStyle(this.indicatedElement).marginLeft;
          this.element.style.left = (this.indicatedElement.getBoundingClientRect().left - this.width) + "px";
          this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left.svg)';
          this.element.style.backgroundPosition = 'right top';
          this.element.style.padding = defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 88px 10px 10px';

        } else if ((window.innerWidth - this.indicatedElement.getBoundingClientRect().right) > this.width) {

          var marginRight = getComputedStyle(this.indicatedElement).marginRight;
          this.element.style.left = (this.indicatedElement.getBoundingClientRect().right - Number(marginRight.slice(0, (marginRight.length - 2)))) + "px";
          this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right-mobile.svg)' : 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right.svg)';
          this.element.style.backgroundPosition = 'left top';
          this.element.style.padding =  defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 10px 10px 88px';
        } else {

          if (window.innerWidth / 2 > this.indicatedElement.getBoundingClientRect().left) {

            this.element.style.left = 30 + "px";

            if (window.innerWidth / 4 > this.indicatedElement.getBoundingClientRect().left) {

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right-mobile.svg)' :  'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left.svg)';

              this.element.style.backgroundPosition = defineClient() === "mobile" ? '50px top' : 'right top';
              this.element.style.padding = defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 88px 10px 10px';
            } else {

              this.element.style.backgroundImage = defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left-mobile.svg)' :  'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '130px top' : 'right top';
              this.element.style.padding = defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 88px 10px 10px';

            }



          } else {

            this.element.style.right = 30 + "px";
            if (window.innerWidth / 4 > this.indicatedElement.getBoundingClientRect().left) {

              this.element.style.backgroundImage =  defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right-mobile.svg)' :  'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '30px top' : 'left top';
              this.element.style.padding = defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 10px 10px 88px';
            } else {

              this.element.style.backgroundImage =  defineClient() === "mobile" ? 'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-left-mobile.svg)' :  'url(https://www.domovenok.su/static/general/img/help-arrow-bottom-right.svg)';
              this.element.style.backgroundPosition = defineClient() === "mobile" ? '120px top' : 'left top';
              this.element.style.padding = defineClient() === "mobile" ? '50px 10px 10px 10px' : '34px 10px 10px 88px';
            }



          }
        }
      }




    };
    HelperBlock.prototype.updateCoordinate = function() {
      elementInView(this.indicatedElement, this.data[this.index].group);
      this.setCoordinate();
    };
    HelperBlock.prototype.setPosition = function() {
      if (this.indicatedElementPosition == 'static') {
        this.indicatedElement.style.position = "relative";
      }
    };
    HelperBlock.prototype.updateData = function() {
      var url = "";
      var json = JSON.stringify({
        item: "",
        passed: true
      });
      function response(data) {
        if (data.Success === true) {
          // перезаписать обьект helperObject
        }
      }

      sendData(url, json, response);
    };
    HelperBlock.prototype.addEventElement = function() {
      if (this.isClick) {
        if (this.indicatedElement.classList.contains('selection')) {
          this.list = this.indicatedElement.querySelector('.selection__list');
          this.list.addEventListener('click', this.close);
        } else if (this.indicatedElement.classList.contains('selection-btn')) {
          this.list = this.indicatedElement.querySelector('.selection-btn__list');
          this.list.addEventListener('click', this.close);
        } else {
          this.indicatedElement.addEventListener('click', this.close);
        }
      }
    };
    HelperBlock.prototype.removeEventElement = function() {
      if (this.isClick) {
        if (this.indicatedElement.classList.contains('selection')) {
          this.list = this.indicatedElement.querySelector('.selection__list');
          this.list.removeEventListener('click', this.close);
        } else if (this.indicatedElement.classList.contains('selection-btn')) {
          this.list = this.indicatedElement.querySelector('.selection-btn__list');
          this.list.removeEventListener('click', this.close);
        } else {
          this.indicatedElement.removeEventListener('click', this.close);
        }
      }
    };
    HelperBlock.prototype.isCheck = function() {
      if (parent.querySelector(this.data[this.index].item)) {
        var classContains = parent.querySelector(this.data[this.index].item).classList.contains(this.data[this.index].item + '--hide')
      }

      return parent.querySelector(this.data[this.index].item) !== null && classContains === false;
    };
    HelperBlock.prototype.updateButtonNext = function() {
      return this.data[this.index].buttonNext();
    };
    HelperBlock.prototype.updateIsClick = function() {
      return this.data[this.index].isClick();
    };
    HelperBlock.prototype.clickEvent= function() {
      this.close();
    };
    HelperBlock.prototype.resize = function() {

      this.updateCoordinate();
    };

    function defineHelper() {
      var helpWindow = document.querySelector('.help--form');

      if (!helpWindow && helpWindow ? helpWindow.parentNode.id !== "help--form" : true) {
        var template = document.getElementById('help-block');
        var elementToClone;
        var container;

        if ('content' in template) {
          elementToClone = template.content.querySelector('.help');
        } else {
          elementToClone = template.querySelector('.help');
        }

        var element = elementToClone.cloneNode(true);
        var newR = [];

        helpRemainder.forEach(function (item) {

          switch (item.group) {
            case helpUtils.group.left:
              item.parent = leftSide;
              break;
            case helpUtils.group.right:
              item.parent = getActiveOrder();
              break;
            case helpUtils.group.menu:
              item.parent = header;
              break;
            case helpUtils.group.menuClose:
              item.parent = header;
              break;
          }


          var exist = item.state.isExist(item);


          if (exist) {
            newR.push(item);
          }
        });

        if (defineClient() !== desktop && pageOrders.classList.contains('page--main-menu-open')) {
          container = document.querySelector('.page-header__wrap');
        } else {
          container = document.querySelector('.page__wrap');
        }

        container.appendChild(element);

        function compareNumeric(a, b) {
          return a.priority() - b.priority();
        }

        if (newR.length > 0) {
          newR.sort(compareNumeric);
          var help = new HelperBlock(newR, 0, container);
        }
      }
    }

    document.addEventListener('helper', defineHelper);

    if (!tipsIsAnswer) {
      showHelpAgreement();
    } else {
      eventHelper.need('open', false);
    }

    if (defineClient() === mobile) {
      window.onbeforeunload = function () {
        window.scrollTo(0,0)
      }
    }
})();




// (function () {
//   if (platform.name == "Safari" && Number(platform.version) >= 8 && platform.product == "iPad") {
//     var right = document.querySelector(".right-side__wrap");
//     var order = document.querySelector(".orders__wrap");
//     var contact = document.querySelector(".page-header__contact");
//     var left = document.querySelector(".left-side");
//     //right.style.paddingBottom = "150px";
//     //contact.style.paddingBottom = "110px";
//     var div = document.createElement("div");
//     div.classList.add("orders__bottom");
//     left.appendChild(div);
//     var contact45 = document.querySelector(".orders__bottom");
//     contact45.style.height = "150px";
//
//   }
// })();
// (function () {
//   function initContainer() {
//     var clientIsMobile = function () {
//       return (window.innerWidth < 768) ? true : false
//     };
//
//     if (!clientIsMobile()) {
//       var right = document.querySelector(".right-side");
//       var left = document.querySelector(".orders__wrap");
//       right.classList.add('scroll-container');
//       left.classList.add('scroll-container');
//     }
//   }
// })();

// (function () {
//   function resizeContainer() {
//     var clientIsMobile = function () {
//       return (window.innerWidth < 768) ? true : false
//     };
//
//     var containers = document.querySelectorAll('.scroll-container');
//     var leftSide = document.querySelector('.left-side');
//     var orderWrap = document.querySelector('.orders__wrap');
//
//     for (var i = 0; i < containers.length; i++) {
//       Ps.initialize(containers[i], {wheelPropagation: false});
//     }
//
//
//     if (!clientIsMobile()) {
//       var orderX = document.querySelector(".orders");
//       var orderY = document.querySelector(".orders__wrap");
//
//       var heightOrder = orderX.offsetHeight;
//
//       orderY.style.height = heightOrder + "px";
//     }
//   }
// })();

(function () {

// if ('addEventListener' in document) {
//   document.addEventListener('DOMContentLoaded', function() {
//     FastClick.attach(document.body);
//   }, false);
// }

})();



// console.log(tabs);
//
// function searchArr(arr) {
//   console.log(arr);
//
//   arr.filter(function(item) {
//     return item.id.replace(/-/g, '') == ctx.params.ordid;
//   });
// }
//
// searchArr(tabs);
//
// if (!searchArr()) {
//   searchArr(storeTabs);
// }
//
//
// if (searchArr()) {
//   console.log("новый способ");
//   if (tabs.length > 0) {
//
//     var oldViewRight = tabs[tabs.length - 1];
//   } else {
//
//     var oldViewRight = firstElement;
//   }
//
//   var newViewRight = 
//
//   tabs.push(newViewRight);
//
//   oldViewRight.item.classList.add('right-side__wrap--hide');
//   newViewRight.item.classList.remove('right-side__wrap--hide');
// } else {
//   getOrder(ctx);
// }
/**
 * Created by Lobova.A on 30.11.2016.
 */
"use strict";
var tabs = require('./../tabs/tabs');
var request = require('./../ajax-request/ajax-request');
//let init.orders = require('./../init.orders/init.orders');
var eventHelper = require('./../event-helper/event-helper');
var client = require('./../client-data/client-data');
var url = require('./../state-address/state-address');
//let page = require('./../page/page');
var init = require("./../init/init");
var renderOrder = require('./../render/render-order');
var renderSchedule = require('./../render/render-schedule');
var leftSide = document.querySelector('.left-side');
var rightSide = document.querySelector('.right-side');
console.log(init, "iiii");
console.log(init.orders, "iiii");
var pageState = {
    setAddress: function (ctx) {
        if ((ctx.path != ('/' + url.get())) || ctx.state.rerender) {
            tabs.clear();
            url.update(url.item, null);
            if ((ctx.params.adrid != url.address.id) || ctx.state.rerender) {
                init.orders.listElement.innerHTML = '';
                url.update(url.address, ctx.params.adrid, url.type.address);
                //utils.address.change(self.address.uuid);
                function render(data) {
                    init.orders.render(data);
                    init.orders.setActiveOrder(url.item);
                    eventHelper.open();
                }
                request.get(url.request(), render.bind(this));
            }
            else {
                init.orders.setActiveOrder(url.item);
                if (client.isMobile() && (ctx.state.delete == true)) {
                    var order = rightSide.querySelector('.right-side__wrap');
                    rightSide.removeChild(order);
                    leftSide.classList.remove('left-side--hide');
                    leftSide.classList.remove('left-side--mobile');
                    rightSide.classList.add('right-side--hide');
                    rightSide.classList.remove('right-side--mobile');
                    setTimeout(function () {
                        eventHelper.open();
                    }, 0);
                }
            }
        }
        else {
            if (ctx.state.addressActive === true) {
                setTimeout(function () {
                    eventHelper.open();
                }, 0);
            }
            ctx.handled = false;
        }
    },
    setAddressOrder: function (ctx) {
        console.log('заказы');
        if ((ctx.path != ('/' + url.get()) || ctx.state.cancelOrder == true) || ctx.state.rerender) {
            console.log('1');
            if ((ctx.params.adrid != url.address.id || (ctx.state.cancelOrder == true && !client.isMobile())) || ctx.state.rerender) {
                console.log('2');
                init.orders.listElement.innerHTML = '';
                if (client.isMobile() && !ctx.state.rerender) {
                    page.redirect('/adr' + ctx.params.adrid);
                    return;
                }
                tabs.clear();
                url.update(url.address, ctx.params.adrid, url.type.address);
                url.update(url.item, ctx.params.ordid, url.type.order);
                //utils.address.change(self.address.uuid, ctx.state.cancelOrder);
                function render1(data) {
                    init.orders.render(data);
                    renderSchedule(data);
                    renderOrder(data);
                    init.orders.setActiveOrder(url.item);
                    eventHelper.open();
                }
                request.get(url.request(), render1.bind(this));
            }
            else if (ctx.params.ordid != url.item.id || (client.isMobile() && ctx.state.cancelOrder == true)) {
                console.log('3');
                url.update(url.item, ctx.params.ordid, url.type.order);
                if (ctx.state.delete == true && tabs.canDelete(url.item.uuid)) {
                    console.log('4');
                    tabs.delete();
                    init.orders.setActiveOrder(url.item);
                }
                else {
                    console.log('5');
                    function render2(data) {
                        console.log(init.orders, "{");
                        console.log('открыть заказ');
                        //init.orders.render(data);
                        renderOrder(data);
                        console.log();
                        init.orders.setActiveOrder(url.item);
                        eventHelper.open();
                    }
                    request.get(url.requestItem(), render2);
                }
            }
        }
        else {
            console.log('6');
            if (ctx.state.orderActive === true || ctx.state.addressActive === true) {
                console.log('6');
                console.log('ничего');
                setTimeout(function () {
                    eventHelper.open();
                }, 0);
            }
            ctx.handled = false;
        }
    },
    setAddressSchedule: function (ctx) {
        if ((ctx.path != ('/' + url.get())) || ctx.state.rerender) {
            if ((ctx.params.adrid != url.address.id) || ctx.state.rerender) {
                init.orders.listElement.innerHTML = '';
                if (client.isMobile() && !ctx.state.rerender) {
                    page.redirect('/adr' + ctx.params.adrid);
                    return;
                }
                tabs.clear();
                url.update(url.address, ctx.params.adrid, url.type.address);
                url.update(url.item, ctx.params.shdid, url.type.schedule);
                //utils.address.change(self.address.uuid);
                function render1(data) {
                    init.orders.render(data);
                    renderSchedule(data);
                    init.orders.setActiveOrder(url.item);
                    eventHelper.open();
                }
                request.get(url.request(), render1.bind(this));
            }
            else if (ctx.params.shdid != url.item.id) {
                url.update(url.item, ctx.params.shdid, url.type.schedule);
                if (ctx.state.delete == true && tabs.canDelete(url.item.uuid)) {
                    tabs.delete();
                    init.orders.setActiveOrder(url.item);
                }
                else {
                    function render2(data) {
                        renderSchedule(data);
                        init.orders.setActiveOrder(url.item);
                        eventHelper.open();
                    }
                    request.get(url.requestItem(), render2.bind(this));
                }
            }
        }
        else {
            if ((ctx.state.addressActive === true) || (ctx.state.scheduleBtn === true)) {
                setTimeout(function () {
                    eventHelper.open();
                }, 0);
            }
            ctx.handled = false;
        }
    }
};
module.exports = pageState;

/**
 * Created by Lobova.A on 25.11.2016.
 */
"use strict";
var client = require('./../client-data/client-data');
var Application = require('./../application/application');
var Rating = require('./../rating/rating');
var Question = require('./../general-question/general-question');
var init = require('./../init/init');
var mainContent = document.querySelector('.main-content');
var PopUp = (function () {
    function PopUp(element) {
        this.element = element;
        this.buttonClose = this.element.querySelector('.pop-up__btn-close');
        this.isOpen = false;
        this.item = null;
        this.items = this.element.querySelectorAll('.pop-up__item');
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        document.addEventListener('open-popup', this.open);
        document.addEventListener('close-popup', this.close);
    }
    PopUp.prototype.open = function (e) {
        if (this.isOpen) {
            this.close();
        }
        if (!client.isDesktop()) {
            if (e.detail.menu) {
                e.detail.menu.close();
            }
        }
        if (this.items.length) {
            this.items.forEach(function (item) {
                if (item.classList.contains(e.detail.elem.dataset.name)) {
                    item.classList.remove('pop-up__item--hide');
                }
            });
        }
        switch (e.detail.elem.dataset.name) {
            case 'application':
                this.item = new Application(this, this.element);
                break;
            case 'rating-form':
                this.item = new Rating(this, this.element);
                break;
            case 'general-question':
                this.item = new Question(this, this.element, e.detail.elem.dataset.action);
                break;
        }
        console.log(this.item, "this");
        if (!client.isDesktop()) {
            mainContent.classList.add('main-content--hide');
        }
        this.element.classList.remove('pop-up--hide');
        this.buttonClose.addEventListener('click', this.close);
        this.isOpen = true;
    };
    PopUp.prototype.close = function (e) {
        if (e) {
            e.preventDefault();
        }
        this.buttonClose.removeEventListener('click', this.close);
        if (this.items.length) {
            this.items.forEach(function (item) {
                if (!item.classList.contains('pop-up__item--hide')) {
                    item.classList.add('pop-up__item--hide');
                }
            });
        }
        this.element.classList.add('pop-up--hide');
        this.item.close();
        if (!client.isDesktop()) {
            mainContent.classList.remove('main-content--hide');
        }
    };
    return PopUp;
}());
module.exports = PopUp;

/**
 * Created by Lobova.A on 28.11.2016.
 */
"use strict";
var client = require('./../client-data/client-data');
var Mustache = require('mustache');
var moment = require('moment');
var url = require('./../state-address/state-address');
var Order = require('./../order/order');
var init = require('./../init/init');
var leftSide = document.querySelector('.left-side');
var rightSide = document.querySelector('.right-side');
module.exports = function (data) {
    console.log('здесь');
    console.log(data);
    if (data.Data.ScheduleData) {
        console.log('здесь');
        console.log(data_1);
        var data_1 = data_1.Data.ScheduleData;
        var Periodicity = 4 * 7;
        if (client.isMobile()) {
            var orders = rightSide.querySelectorAll('.right-side__wrap');
            if (orders.length > 0) {
                for (var i = 0; orders.length > i; i++) {
                    rightSide.removeChild(orders[i]);
                }
            }
            leftSide.classList.add('left-side--hide');
            rightSide.classList.remove('right-side--hide');
        }
        var date = new Date();
        var mondayDay = date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);
        var firstDay = new Date(date.setDate(mondayDay));
        var dayScheduleArray_1 = [];
        var dayArray = [];
        var _loop_1 = function(i) {
            if (i == 0) {
                data_1.CalculationMapList[i].Active = true;
            }
            data_1.CalculationMapList[i].Days.forEach(function (item) {
                dayScheduleArray_1.push({
                    day: moment.parseZone(moment.utc(item).utcOffset(data_1.CalculationMapList[i].TimeZone).format())._d.getDate(),
                    month: moment.parseZone(moment.utc(item).utcOffset(data_1.CalculationMapList[i].TimeZone).format())._d.getMonth(),
                    index: i + 1
                });
            });
            data_1.CalculationMapList[i].formatTime = moment.parseZone(moment.utc(data_1.CalculationMapList[i].Time).utcOffset(data_1.CalculationMapList[i].TimeZone).format()).format("HH:mm");
            data_1.CalculationMapList[i].DiscountPercent = Math.round(data_1.CalculationMapList[i].Discount / (data_1.CalculationMapList[i].AmountWithDiscount + data_1.CalculationMapList[i].Discount) * 100);
            data_1.CalculationMapList[i].AmountWithDiscount = data_1.CalculationMapList[i].AmountWithDiscount.toFixed(2);
            data_1.CalculationMapList[i].DiscountAll = data_1.CalculationMapList[i].Discount.toFixed(2);
            data_1.CalculationMapList[i].index = i + 1;
            for (var j = 0; j < data_1.CalculationMapList[i].Services.length; j++) {
                data_1.CalculationMapList[i].Services[j].AmountWithDiscount = data_1.CalculationMapList[i].Services[j].AmountWithDiscount.toFixed(2);
                data_1.CalculationMapList[i].Services[j].Amount = data_1.CalculationMapList[i].Services[j].Amount.toFixed(2);
                for (var g = 0; g < data_1.CalculationMapList[i].Services[j].ObjectClass.length; g++) {
                    data_1.CalculationMapList[i].Services[j].ObjectClass[g].Amount = data_1.CalculationMapList[i].Services[j].ObjectClass[g].Amount.toFixed(2);
                    data_1.CalculationMapList[i].Services[j].ObjectClass[g].DiscountPercent = Math.round(data_1.CalculationMapList.Discount / (data_1.CalculationMapList.AmountWithDiscount + data_1.Discount) * 100);
                }
            }
        };
        for (var i = 0; i < data_1.CalculationMapList.length; i++) {
            _loop_1(i);
        }
        for (var i = 0; i < Periodicity; i++) {
            var day = firstDay;
            dayArray.push({
                day: day.getDate(),
                month: day.getMonth(),
                isActive: function () {
                    var sortday = dayScheduleArray_1.sort(function (a, b) {
                        if (a.month >= b.month) {
                            if (a.day > b.day) {
                                return 1;
                            }
                        }
                        if (a.month <= b.month) {
                            if (a.day < b.day) {
                                return -1;
                            }
                        }
                    }, this);
                    return sortday[0].day === this.day && sortday[0].month === this.month;
                },
                index: function () {
                    var day = dayScheduleArray_1.filter(function (item) {
                        return item.day === this.day && item.month === this.month;
                    }, this);
                    if (day.length > 0) {
                        return day[0].index;
                    }
                    else {
                        return 0;
                    }
                },
                isSchedule: function () {
                    var day = dayScheduleArray_1.filter(function (item) {
                        return item.day === this.day && item.month === this.month;
                    }, this);
                    if (day.length > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            });
            day.setDate(day.getDate() + 1);
        }
        var departureId = data_1.ObjectID;
        var newtemplate = document.getElementById('order-schedule').innerHTML;
        var html = Mustache.render(newtemplate, {
            'CalculationMapList': data_1.CalculationMapList,
            'OrderNumber': data_1.OrderNumber,
            'timeDay': moment(data_1.Date).format('DD.MM.YYYY'),
            'timeHour': moment(data_1.Date).format('HH:mm'),
            'Services': data_1.CalculationMapList.Services,
            'Employees': data_1.CalculationMapList.Employees,
            'Days': dayArray,
            'Periodicity': (Periodicity > 7),
            'RemoveValue': true
        });
        var div = document.createElement('div');
        div.classList.add('right-side__wrap--schedule');
        div.classList.add('right-side__wrap');
        div.setAttribute('data-departureId', departureId);
        div.innerHTML = html;
        rightSide.appendChild(div);
        var order = new Order(div);
    }
};

(function () {
    // var item = document.querySelector('.service__item');
    //
    // console.log(item);
    //
    // var toggleService = function(event) {
    //     event.preventDefault();
    //     item.classList.toggle("service__item--open");
    // }
    //
    // if(item != undefined) {
    //
    //     item.addEventListener("click", toggleService);
    //
    // }
})();





/**
 * Created by Lobova.A on 29.11.2016.
 */
"use strict";
var path = require('./../path/path');
var requestItemUrl = generalPath.buildUrl(path.item);
var Url = (function () {
    function Url() {
        this.address = {
            id: '',
            uuid: '',
            type: '',
            url: ''
        };
        this.item = {
            id: '',
            uuid: '',
            type: '',
            url: ''
        };
        this.type = {
            order: 'ord',
            schedule: 'shd',
            address: 'adr'
        };
        this.itemValue = window.location.pathname.split('/')[3];
        this.addressValue = window.location.pathname.split('/')[2];
        this.itemType = this.getItemType();
        this.update(this.address, this.addressValue, this.addressType);
        this.update(this.item, this.itemValue, this.itemType);
    }
    Url.prototype.update = function (props, value, type) {
        var newProps = this.parse(props, value, type);
        props.id = newProps.id;
        props.uuid = newProps.uuid;
        props.type = newProps.type;
        props.url = newProps.url;
    };
    Url.prototype.parse = function (props, value, type) {
        var newItem = {};
        if (!value) {
            newItem.url = '';
            newItem.id = '';
            newItem.uuid = '';
            newItem.type = '';
            return newItem;
        }
        switch (value.length) {
            case 35:
                newItem.url = value;
                newItem.id = value.substring(3);
                break;
            case 32:
                if (!type)
                    console.error('Not Type', arguments);
                newItem.url = type + value;
                newItem.id = value;
                break;
            case 36:
                if (!type)
                    console.error('Not Type', arguments);
                newItem.id = value.replace(/-/g, '');
                newItem.url = type + props.id;
                break;
            default:
                console.error('Error', arguments);
                break;
        }
        newItem.uuid = newItem.id.slice(0, 8) + '-' +
            newItem.id.slice(8, 12) + '-' +
            newItem.id.slice(12, 16) + '-' +
            newItem.id.slice(16, 20) + '-' +
            newItem.id.slice(20);
        newItem.type = type;
        return newItem;
    };
    Url.prototype.get = function () {
        var url = this.address.url;
        if (this.item.url) {
            return url += '/' + this.item.url;
        }
        return url;
    };
    Url.prototype.getItemType = function () {
        if (this.itemValue) {
            if (this.itemValue.substring(0, 3) === this.orderType) {
                return this.orderType;
            }
            else if (this.itemValue.substring(0, 3) === this.scheduleType) {
                return this.scheduleType;
            }
        }
        return null;
    };
    Url.prototype.request = function () {
        return requestItemUrl + this.get();
    };
    ;
    Url.prototype.requestItem = function () {
        return requestItemUrl + this.item.type + this.item.id;
    };
    ;
    return Url;
}());
var url = new Url;
module.exports = url;
