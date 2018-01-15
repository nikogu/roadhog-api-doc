## roadhog api doc

A simple api doc site for [roadhog](https://github.com/sorrycc/roadhog) project.

[![npm package](https://img.shields.io/npm/v/roadhog-api-doc.svg)](https://www.npmjs.com/package/roadhog-api-doc)

![proxy](https://user-images.githubusercontent.com/1179603/29698366-8c0302b0-8987-11e7-95de-7f119ea72905.gif)

### Feature

- Support build static data
- Support write docs
- Support request editable

### How to use

#### Install

```bash
$ npm install roadhog-api-doc -g
```

#### Start Server

```bash
# start api doc directly
$ cd [roadhog project]
$ roadhog-api-doc start
```

```bash
# start server with roadhog project server
$ cd [roadhog project]
$ roadhog-api-doc start [port] # your roadhog project server port
```

#### Build

```bash
$ cd [roadhog project]
$ roadhog-api-doc build
```

In your `dist` directory, you can see `api.html`, `api.js`, `api.css`

### Write docs

If you need to write doc, you can write mock data like this in `.roadhogrc.mock.js`: 
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

You should add `format` to wrapper `.roadhogrc.mock.js`'s export:

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

## QA

- Error: Module not found: Can't resolve 'babel' in '_roadhog-api-doc'
  - try [cnpm](https://npm.taobao.org/) install your project dependencies.

## CHANGELOG

### 1.0.0

- support roadhog@2.x

### 0.3.4

- support roadhog 2.x

### 0.3.0

- support dynamic update post & get when `.roadhog.mock.js` refresh
- support docs field
- upgrade Windows compatibility

