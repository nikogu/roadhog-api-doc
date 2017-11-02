## roadhog api doc

[![npm package](https://img.shields.io/npm/v/roadhog-api-doc.svg)](https://www.npmjs.com/package/roadhog-api-doc)

![proxy](https://user-images.githubusercontent.com/1179603/29698366-8c0302b0-8987-11e7-95de-7f119ea72905.gif)

#### Feature

- support build static data
- support request editable
- support write your docs

#### How to use

```
// install
npm install roadhog-api-doc -g

// start server
1. cd your dva(roadhog) project
2. roadhog-api-doc start 8000(this is your roadhog server port)
3. goto http://localhost:9898/api.html to look your docs which is depend on your .roadhogrc.mock.js

// build
1. cd your dva(roadhog) project
2. roadhog-api-doc build
3. in your dist dir, you can see `api.html`, `api.js`, `api.css`
```

#### Write docs

if you need to write doc like this in `.roadhogrc.mock.js`: 
```
  'GET /api/currentUser': {
    $desc: "this is the api description",
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

and you can use functional tool to enhance mock.

```
import { delay } from 'roadhog-api-doc';

const mock = {...};

export default delay(mock, 1000);
```

## Todo

- [ ] optimize style
- [ ] support more docs field type 

