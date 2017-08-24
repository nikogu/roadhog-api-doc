## roadhog api doc

#### usage

if you need to write doc like this in `.roadhogrc.mock.js`: 
```
  'GET /api/currentUser': {
    $params: {
      pageSize: 1,
      page: {
        desc: '分页',
        exp: 2
      },
    },
    $body: {
      name: 'momo.zxy',
      avatar: imgMap.user,
      userid: '00000001',
      notifyCount: 12,
    }
  },
```
you should add `format` to wrapper `.roadhogrc.mock.js`'s export:
```
import { format } from 'roadhog-api-doc';

const mock = {...};

export default format(mock);
```


```
// start server
1. npm install roadhog-api-doc -g
2. cd your dva(roadhog) project
3. roadhog-api-doc start 8000(this is your roadhog server port)
6. goto http://localhost:9898/api.html to look your docs which is depend on your .roadhogrc.mock.js

// build
1. cd your dva(roadhog) project
2. roadhog-api-doc build
3. in your dist dir, you can see `api.html`, `api.js`, `api.css`
```
