// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Panel, Row, Col, ButtonGroup, Button, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import moment from 'moment'

import * as snapshotActions from '../actions/snapshots.js'
import ConfirmModal from '../../common/components/ConfirmModal'
import ExportPatternsModal from '../../common/components/ExportPatternsModal.js'
import {getComponentMessages, getConfigProperty} from '../../common/util/config'
import CreateSnapshotModal from '../../editor/components/CreateSnapshotModal'
import * as versionActions from '../../manager/actions/versions'
import {isEditingDisabled} from '../../manager/util'
import type {Props as ContainerProps} from '../containers/ActiveEditorFeedSourcePanel'
import type {Feed, Snapshot} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  createFeedVersionFromSnapshot: typeof versionActions.createFeedVersionFromSnapshot,
  deleteSnapshot: typeof snapshotActions.deleteSnapshot,
  downloadSnapshot: typeof snapshotActions.downloadSnapshot,
  fetchSnapshots: typeof snapshotActions.fetchSnapshots,
  restoreSnapshot: typeof snapshotActions.restoreSnapshot,
  user: ManagerUserState
}

export default class EditorFeedSourcePanel extends Component<Props> {
  messages = getComponentMessages('EditorFeedSourcePanel')

  componentWillMount () {
    this.props.fetchSnapshots(this.props.feedSource)
  }

  _openModal = () => {
    // Note: this will need to change if react-redux is upgraded to v6+
    // https://medium.com/octopus-labs-london/how-to-access-a-redux-components-methods-with-createref-ca28a96efd59
    this.refs.snapshotModal.getWrappedInstance().open()
  }

  _sortBySnapshotTime = (a: Snapshot, b: Snapshot) => b.snapshotTime - a.snapshotTime

  render () {
    const {
      feedSource,
      project,
      user
    } = this.props
    const disabled = !user.permissions || !user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'manage-feed')
    const editDisabled = isEditingDisabled(user, feedSource, project)
    const snapshots = feedSource.editorSnapshots
      ? feedSource.editorSnapshots.sort(this._sortBySnapshotTime)
      : []

    return (
      <Row>
        <CreateSnapshotModal
          feedSource={feedSource}
          ref='snapshotModal'
        />
        <ConfirmModal ref='confirmModal' />
        <ExportPatternsModal
          createFeedVersionFromSnapshot={this.props.createFeedVersionFromSnapshot}
          feedSource={feedSource}
          ref='exportPatternsModal'
        />
        <Col xs={9}>
          {feedSource.editorSnapshots && feedSource.editorSnapshots.length
            ? <div>
              {/* These are the available snapshots */}
              <Panel bsStyle='success'>
                <Panel.Heading><Panel.Title componentClass='h3'>
                  {this.messages('availableSnapshots')}
                </Panel.Title></Panel.Heading>
                <ListGroup>
                  {snapshots.length === 0
                    ? <ListGroupItem>{this.messages('noOtherSnapshots')}</ListGroupItem>
                    : snapshots.map(s => {
                      return (
                        <SnapshotItem
                          disabled={disabled}
                          exportPatternsModal={this.refs.exportPatternsModal}
                          key={s.id}
                          modal={this.refs.confirmModal}
                          snapshot={s}
                          {...this.props} />
                      )
                    })
                  }
                </ListGroup>
              </Panel>
            </div>
            : <div>
              {this.messages('noSnapshotsExist')}
            </div>
          }
        </Col>
        <Col xs={3}>
          <LinkContainer to={`/feed/${feedSource.id}/edit`}>
            <Button
              block
              disabled={editDisabled}>
              <Icon type='pencil' /> {this.messages('editFeed')}
            </Button>
          </LinkContainer>
          <Button
            block
            bsStyle='primary'
            disabled={editDisabled}
            onClick={this._openModal}
            style={{marginBottom: '20px'}}>
            <Icon type='camera' /> {this.messages('snapshotLatest')}
          </Button>
          <Panel>
            <Panel.Heading><Panel.Title componentClass='h3'><Icon type='camera' /> {this.messages('help.title')}</Panel.Title></Panel.Heading>
            <Panel.Body>
              <p>{this.messages('help.body.0')}</p>
              <p>{this.messages('help.body.1')}</p>
            </Panel.Body>
          </Panel>
        </Col>
      </Row>
    )
  }
}

export type ItemProps = {
  createFeedVersionFromSnapshot: typeof versionActions.createFeedVersionFromSnapshot,
  deleteSnapshot: typeof snapshotActions.deleteSnapshot,
  disabled: boolean,
  downloadSnapshot: typeof snapshotActions.downloadSnapshot,
  exportPatternsModal: any,
  feedSource: Feed,
  modal: any,
  restoreSnapshot: typeof snapshotActions.restoreSnapshot,
  snapshot: Snapshot
}

class SnapshotItem extends Component<ItemProps> {
  messages = getComponentMessages('SnapshotItem')

  _onClickDownload = () => {
    const {downloadSnapshot, feedSource, snapshot} = this.props
    downloadSnapshot(feedSource, snapshot)
  }

  _onClickExport = () => {
    this.props.exportPatternsModal.open({snapshot: this.props.snapshot})
  }

  _onDeleteSnapshot = () => {
    const {deleteSnapshot, feedSource, snapshot} = this.props
    this.props.modal.open({
      title: `${this.messages('delete')}`,
      body: this.messages('confirmDelete'),
      onConfirm: () => deleteSnapshot(feedSource, snapshot)
    })
  }

  _onRestoreSnapshot = () => {
    const {feedSource, restoreSnapshot, snapshot} = this.props
    this.props.modal.open({
      title: `${this.messages('restore')}`,
      body: this.messages('confirmLoad'),
      onConfirm: () => restoreSnapshot(feedSource, snapshot)
    })
  }

  render () {
    const {disabled, snapshot} = this.props
    const dateFormat = getConfigProperty('application.date_format') || ''
    const timeFormat = 'h:MMa'
    const formattedTime = moment(snapshot.snapshotTime)
      .format(`${dateFormat}, ${timeFormat}`)
    return (
      <ListGroupItem>
        <h4
          className='list-group-item-heading'
          style={{
            width: '48%',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          title={snapshot.name}>
          {snapshot.name}
        </h4>
        <div>
          <ButtonGroup className='pull-right' style={{marginTop: '-20px'}}>
            {/* Restore in Editor button */}
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onRestoreSnapshot}>
              <Glyphicon glyph='pencil' />{' '}
              {this.messages('restore')}
            </Button>

            {/* Download button */}
            <Button
              bsSize='small'
              onClick={this._onClickDownload}>
              <Glyphicon glyph='download' />{' '}
              {this.messages('download')}
            </Button>

            {/* Publish as Version button */}
            <Button
              bsSize='small'
              data-test-id='publish-snapshot-button'
              disabled={disabled}
              onClick={this._onClickExport}
            >
              <Glyphicon glyph='export' />{' '}
              {this.messages('publish')}
            </Button>

            {/* Delete button */}
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onDeleteSnapshot}>
              <span className='text-danger'>
                <Icon type='trash' />{' '}
                {this.messages('delete')}
              </span>
            </Button>
          </ButtonGroup>
          <p
            className='list-group-item-text'
            title={formattedTime}>
            <Icon type='clock-o' />{' '}
            {this.messages('created')}{' '}
            {moment(snapshot.snapshotTime).fromNow()}
          </p>
          {snapshot.comment
            ? <p
              className='list-group-item-text'
              title={formattedTime}>
              <Icon type='info' />{' '}
              {snapshot.comment}
            </p>
            : null}
        </div>
      </ListGroupItem>
    )
  }
}
