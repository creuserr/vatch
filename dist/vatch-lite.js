// https://github.com/creuserr/vatch
// the smallest foundation of Vatch

async function Vatch(key) {
  async function _getjson(path) {
    var req = await fetch(path);
    return await req.json();
  }
  function _hash(raw) {
    var hash = 0;
    var char = null;
    if(raw.length == 0) return 0;
    for(var i = 0; i < raw.length; i++) {
      char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
  var instance = {
    _cache: [],
    dataset: [],
    // get data: 0 request
    get(name) {
      if(!this.dataset.includes(name)) return;
      return JSON.parse(unescape(this._cache.find(function(c) {
        return c.title == `vdb-${btoa(name)}`;
      }).description));
    },
    // set data: 1 request
    async set(name, content) {
      content = escape(JSON.stringify(content));
      var reqc = encodeURI(JSON.stringify([{
        tag: "p",
        children: [content]
      }]));
      if(!this.dataset.includes(name)) {
        var req = await _getjson(`https://api.telegra.ph/createPage?access_token=${this.access}&title=vdb-${btoa(name)}&content=${reqc}`);
        if(req.ok != true) throw req.error;
        this._cache.push({
          title: `vdb-${btoa(name)}`,
          path: req.result.path,
          description: content
        });
        this.dataset.push(name);
      } else {
        var i = 0;
        var path = this._cache.find(function(c, a) {
          var b = c.title == `vdb-${btoa(escape(name))}`;
          if(c == true) i = a;
          return c;
        }).path;
        var req = await _getjson(`https://api.telegra.ph/editPage?access_token=${this.access}&path=${path}&title=vdb-${btoa(name)}&content=${reqc}`);
        this._cache[i].description = content;
      }
    }
  }
  if(key != null) {
    // init database: 1 request
    instance.access = key;
    var req = await _getjson(`https://api.telegra.ph/getPageList?access_token=${key}`);
    if(req.ok != true) throw req.error;
    instance._cache = req.result.pages;
  } else {
    // create database: 1 request
    var n = _hash(Math.random().toString());
    var req = await _getjson(`https://api.telegra.ph/createAccount?short_name=vdbx-${n}`);
    if(req.ok != true) throw req.error;
    instance.access = req.result.access_token;
    if(req.ok != true) throw req.error;
    instance.version = Vatch.version;
  }
  instance._cache.forEach(function(c) {
    instance.dataset.push(atob(c.title.replace(/vdb\-/, "")));
  });
  return instance;
}

Vatch.version = 1;


(async function() {
  var db = await Vatch();
  console.log(db);
})();