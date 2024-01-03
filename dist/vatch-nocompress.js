// https://github.com/creuserr/vatch

async function Vatch(key) {
  async function _getjson(path) {
    var req = await fetch(path);
    return await req.json();
  }
  function _compress(text) {
    return text;
  }
  function _decompress(text) {
    return text;
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
    cache: [],
    dataset: [],
    // get data: 0 request
    get(name) {
      if(!this.dataset.includes(name)) return;
      return JSON.parse(_decompress(this.cache.find(function(c) {
        return c.title == `vdb-${btoa(name)}`;
      }).description));
    },
    // set data: 1 request
    async set(name, content) {
      content = _compress(JSON.stringify(content));
      var reqc = encodeURI(JSON.stringify([{
        tag: "p",
        children: [content]
      }]));
      if(!this.dataset.includes(name)) {
        var req = await _getjson(`https://api.telegra.ph/createPage?access_token=${this.access}&title=vdb-${btoa(name)}&content=${reqc}`);
        if(req.ok != true) throw req.error;
        this.cache.push({
          title: `vdb-${btoa(name)}`,
          path: req.result.path,
          description: content
        });
        this.dataset.push(name);
      } else {
        var i = 0;
        var path = this.cache.find(function(c, a) {
          var b = c.title == `vdb-${btoa(escape(name))}`;
          if(c == true) i = a;
          return c;
        }).path;
        var req = await _getjson(`https://api.telegra.ph/editPage?access_token=${this.access}&path=${path}&title=vdb-${btoa(name)}&content=${reqc}`);
        this.cache[i].description = content;
      }
    }
  }
  if(key != null) {
    // init database: 1 request
    instance.access = key;
    var req = await _getjson(`https://api.telegra.ph/getPageList?access_token=${key}`);
    if(req.ok != true) throw req.error;
    var page = req.result.pages.filter(function(i) {
      return i.title.startsWith("vdbx-");
    })[0];
    var content = JSON.parse(_decompress(page.description));
    instance.creation = content.creation;
    instance.agent = content.agent;
    instance.version = content.version;
    instance.cache = req.result.pages;
    instance.root = page;
  } else {
    // create database: 2 requests
    var n = _hash(Math.random().toString());
    var req = await _getjson(`https://api.telegra.ph/createAccount?short_name=vdbx-${n}`);
    if(req.ok != true) throw req.error;
    instance.access = req.result.access_token;
    var date = Date.now();
    var req = await _getjson(`https://api.telegra.ph/createPage?access_token=${instance.access}&title=vdbx-${n}&content=${encodeURI(JSON.stringify([{
      tag: "p",
      children: [_compress(JSON.stringify({
        version: Vatch.version,
        agent: navigator.userAgent,
        creation: date
      }))]
    }]))}`);
    if(req.ok != true) throw req.error;
    instance.creation = date;
    instance.agent = navigator.userAgent;
    instance.version = Vatch.version;
    instance.root = req.result;
  }
  instance.cache.forEach(function(c) {
    if(c.title.startsWith("vdbx-")) return;
    instance.dataset.push(atob(c.title.replace(/vdb\-/, "")));
  });
  return instance;
}

Vatch.version = 1;
