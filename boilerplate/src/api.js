import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button, Modal, Input, Card, Table, message } from 'antd';
import { stringify } from 'qs';

import mock from '../../.roadhogrc.mock';
import { port, isStatic } from './config';
import { isObject, parseKey, handleRequest } from './utils';

import styles from './api.less';

const { TextArea } = Input;
/* eslint no-underscore-dangle:0 */
const mockData = mock.__mockData || mock;

class ApiItem extends Component {
  state = {
    urlValue: '',
    theMockData: {},
    postParams: undefined,
  }
  handleChange = (e) => {
    this.setState({
      urlValue: e.target.value,
    });
  }

  handlePostParams = (e) => {
    let postParams;

    try {
      postParams = JSON.parse(e.target.value);
    } catch (err) {
      message.error(`params parse error: ${JSON.stringify(err, null, 2)} `);
      postParams = this.state.postParams;
    }

    this.setState({
      postParams,
    });
  }

  handleShowData = (data) => {
    if (this.props.onPostClick) {
      this.props.onPostClick(data);
    }
  }

  render() {
    const { req, data } = this.props;
    const { method, url: u } = parseKey(req);
    const url = `http://localhost${port ? `:${port}` : ''}${u}`;
    let { urlValue, postParams } = this.state;

    const params = data.$params || {};

    const columns = [
      {
        key: 'p',
        dataIndex: 'p',
        title: '参数',
      },
      {
        key: 'desc',
        dataIndex: 'desc',
        title: '说明',
      },
      {
        key: 'exp',
        dataIndex: 'exp',
        title: '样例',
      },
    ];

    const dataSource = [];
    const getParams = {};
    Object.keys(params).forEach((p) => {
      const pd = params[p];
      if (isObject(pd)) {
        getParams[p] = params[p].exp;
        dataSource.push({
          p,
          desc: params[p].desc,
          exp: params[p].exp,
        });
      } else {
        getParams[p] = params[p];
        dataSource.push({
          p,
          desc: '',
          exp: params[p],
        });
      }
    });

    if (method === 'GET') {
      if (!urlValue && dataSource.length > 0) {
        urlValue = `${url}?${stringify(getParams)}`;
      }
    }
    if (!urlValue) {
      urlValue = url;
    }

    if (!postParams) {
      postParams = getParams;
    }

    return (
      <Card
        className={styles.apiItem}
        title={<p className={styles.apiItemTitle}><span>{method}</span><span>{u}</span></p>}
      >
        {
          (!isStatic && method === 'GET') && <div className={styles.apiItemOperator}>
            <Row gutter={16}>
              <Col span={12}>
                <Input value={urlValue} onChange={this.handleChange} placeholder={url} />
              </Col>
              <Col span={8}>
                <a target="_blank" href={urlValue}>send</a>
              </Col>
            </Row>
          </div>
        }
        {
          ((isStatic && method === 'GET') || method !== 'GET') && <div className={styles.apiItemOperator}>
            <Row gutter={16}>
              <Col span={12}>
                <Input value={urlValue} onChange={this.handleChange} placeholder={url} />
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  onClick={() => handleRequest(u, url, postParams, this.handleShowData)}
                >
                  send
                </Button>
              </Col>
            </Row>
            {
              (method !== 'GET') && (dataSource.length > 0) && (
                <Row gutter={16}>
                  <Col span={12}>
                    <TextArea
                      style={{ marginTop: 16, width: '100%' }}
                      autosize={{ minRows: 2, maxRows: 20 }}
                      value={JSON.stringify(postParams, null, 2)}
                      onChange={this.handlePostParams}
                    />
                  </Col>
                </Row>
              )
            }
          </div>
        }
        {
          (dataSource.length > 0) && <div className={styles.apiItemDocs}>
            <h3>Params</h3>
            <Table
              rowKey={record => record.p}
              pagination={false}
              size="small"
              columns={columns}
              dataSource={dataSource}
            />
          </div>
        }
      </Card>
    );
  }
}

// eslint-disable-next-line
class ApiDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theMockData: {},
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
    return (
      <div className={styles.apiDoc}>
        <h1>Api Docs</h1>
        <div className={styles.list}>
          {
            Object.keys(mockData).map(key =>
              <ApiItem key={key} req={key} data={mockData[key]} onPostClick={this.handleShowData} />
            )
          }
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
