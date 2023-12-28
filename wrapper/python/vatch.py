# https://github.com/creuserr/vatch

import json
import urllib.request
import urllib.parse
import platform
import base64
import math
import random
import time

class Vatch:
    version = 1

    def __init__(self, key=None):
        self.cache = []
        self.dataset = []

        if key is not None:
            self.access = key
            req = self._getjson(f'https://api.telegra.ph/getPageList?access_token={key}')
            if not req['ok']:
                raise Exception(req['error'])

            page = next((i for i in req['result']['pages'] if i['title'].startswith("vdbx-")), None)
            content = json.loads(self._decompress(page['description']))
            self.creation = content['creation']
            self.agent = content['agent']
            self.version = content['version']
            self.cache = req['result']['pages']
            self.root = page
        else:
            n = self._hash(str(random.random()))
            req = self._getjson(f'https://api.telegra.ph/createAccount?short_name=vdbx-{n}')
            if not req['ok']:
                raise Exception(req['error'])
            self.access = req['result']['access_token']

            date = int(time.time() * 1000)
            content = json.dumps([{"tag": "p", "children": [self._compress(json.dumps({
              "version": Vatch.version,
              "agent": self._mockagent(),
              "creation": date
            }))]}])
            encoded_content = urllib.parse.quote(content)
            req = self._getjson(f'https://api.telegra.ph/createPage?access_token={self.access}&title=vdbx-{n}&content={encoded_content}')
            if not req['ok']:
                raise Exception(req['error'])
            self.creation = date
            self.agent = self._mockagent()
            self.version = Vatch.version
            self.root = req['result']

        for c in self.cache:
            if not c['title'].startswith("vdbx-"):
                self.dataset.append(base64.b64decode(c['title'].replace('vdb-', '')).decode())

    def _getjson(self, path):
        with urllib.request.urlopen(path) as response:
            return json.loads(response.read())

    def _pair(self, ab):
        a, b = ab
        return math.floor(0.5 * (a + b) * (a + b + 1) + b)

    def _unpair(self, n):
        w = math.floor((math.sqrt(8 * n + 1) - 1) / 2)
        t = (w ** 2 + w) / 2
        b = n - t
        a = w - b
        return [math.floor(a), math.floor(b)]

    def _compress(self, text):
        nums = [ord(char) for char in str(text)]
        pairs = []
        cur = None
        for num in nums:
            if cur is None:
                cur = num
            else:
                pairs.append([cur, num])
                cur = None
        if cur is not None:
            pairs.append([cur, 0])
        return ''.join([chr(self._pair(pair)) for pair in pairs])

    def _decompress(self, text):
        res = ""
        for item in text:
            pair = self._unpair(ord(item))
            for num in pair:
                if num != 0:
                    res += chr(num)
        return res

    def _hash(self, raw):
        hash_val = 0
        if len(raw) == 0:
            return 0
        for char in raw:
            char_val = ord(char)
            hash_val = ((hash_val << 5) - hash_val) + char_val
            hash_val &= 0xFFFFFFFF
        return format(hash_val, 'x')

    def get(self, name):
        if name not in self.dataset:
            return None
        return json.loads(self._decompress(next((c['description'] for c in self.cache if c['title'] == f'vdb-{base64.b64encode(name.encode()).decode()}'), None)))

    def set(self, name, content):
        content = self._compress(json.dumps(content))
        reqc = urllib.parse.quote(json.dumps([{"tag": "p", "children": [content]}]))
        if name not in self.dataset:
            req = self._getjson(f'https://api.telegra.ph/createPage?access_token={self.access}&title=vdb-{base64.b64encode(name.encode()).decode()}&content={reqc}')
            if not req['ok']:
                raise Exception(req['error'])
            self.cache.append({"title": f'vdb-{base64.b64encode(name.encode()).decode()}', "path": req['result']['path'], "description": content})
            self.dataset.append(name)
        else:
            i = 0
            path = next((c['path'] for a, c in enumerate(self.cache) if c['title'] == f'vdb-{base64.b64encode(name.encode()).decode()}' and (i := a) is not None), None)
            req = self._getjson(f'https://api.telegra.ph/editPage?access_token={self.access}&path={path}&title=vdb-{base64.b64encode(name.encode()).decode()}&content={reqc}')
            self.cache[i]['description'] = content

    def _mockagent(self):
      ver = platform.python_version()
      impl = platform.python_implementation()
      os = platform.system()
      arch = '.'.join(tuple(string for string in platform.architecture() if len(string) > 0))
      mch = platform.machine()
      return f'py: {impl} {os}/{ver} ({mch}-{arch})'