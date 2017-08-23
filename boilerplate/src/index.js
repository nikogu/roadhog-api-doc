import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, Input } from 'antd';
import { stringify } from 'qs';

import mock from '../../.roadhogrc.mock';
import { port } from './config';

import styles from './index.less';

const { TextArea } = Input;
/* eslint no-underscore-dangle:0 */
const mockData = mock._mockData || mock;

function isFunction(arg) {
  return Object.prototype.toString.call(arg) === '[object Function]';
}
function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}

function parseKey(key) {
  const arr = key.split(' ');
  const method = arr[0];
  const url = arr[1];
  return {
    method,
    url,
  };
}

function getRequest(url) {
  return mockData[Object.keys(mockData).filter(key => key.indexOf(url) > -1)[0]];
}

function handlePost(url, params, callback) {
  const r = getRequest(url);

  if (isFunction(r)) {
    let tempData;
    const req = {
      url: `http://localhost${port ? `:${port}` : ''}${url}`,
      query: params,
      body: params,
    };
    const res = {
      json: (data) => {
        callback(data);
        tempData = data;
      },
      send: (data) => {
        callback(data);
        tempData = data;
      },
    };
    r(req, res);
    return tempData;
  } else {
    callback(r);
  }
}

class ApiDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  handleShowData = (data) => {
    this.setState({
      theMockData: data,
      modalVisible: true,
    });
  }

  handleModalCancel = () => {
    this.setState({
      modalVisible: false,
    });
  }

  render() {
    const { modalVisible, theMockData } = this.state;

    const apiList = Object.keys(mockData).map((key) => {
      const keyData = parseKey(key);
      const data = mockData[key];

      // if have docs
      let p = {};
      let paramsList = [];
      if (data.$params) {
        Object.keys(data.$params).forEach((param) => {
          if (isObject(param)) {
            p[param] = data.$params[param].exp;
          } else {
            p[param] = data.$params[param];
          }
        });
        paramsList = Object.keys(data.$params).map((sp) => {
          const val = data.$params[sp];
          if (isObject(val)) {
            return (<li>
              {sp}: {val.description}: {val.exp}
            </li>);
          } else {
            return (<li>
              {sp}: {val}
            </li>);
          }
        });
      }

      if (keyData.method === 'GET') {
        p = stringify(p);
      }

      if (keyData.method === 'GET') {
        const url = `http://localhost${port ? `:${port}` : ''}${keyData.url}`;
        return (
          <li>
            <a target="_blank" href={`${url}${p ? `?${p}` : ''}`}>{url}</a>
            {
              paramsList.length > 0 && <ul>{paramsList}</ul>
            }
          </li>
        );
      } else {
        const url = keyData.url;
        return (
          <li>
            <span>{keyData.method} {url}</span>
            <Button
              size="small"
              type="primary"
              onClick={() => handlePost(url, p, this.handleShowData)}
            >
              send
            </Button>
            {
              paramsList.length > 0 && <ul>{paramsList}</ul>
            }
          </li>
        );
      }
    });

    return (
      <div className={styles.apiDoc}>
        <h1>Api Docs</h1>
        <div className={styles.list}>
          <ul>{apiList}</ul>
        </div>
        <Modal
          title="The data"
          visible={modalVisible}
          onOk={this.handleModalCancel}
          onCancel={this.handleModalCancel}
        >
          <TextArea
            autosize={{ minRows: 2, maxRows: 20 }}
            value={JSON.stringify(theMockData, null, 2)}
          />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<ApiDoc />, document.getElementById('root'));
