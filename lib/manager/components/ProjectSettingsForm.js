// @flow

import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, { Component } from 'react'
import update from 'react-addons-update'
import {
  Button,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Panel,
  Row
} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import { shallowEqual } from 'react-pure-render'
import { browserHistory } from 'react-router'

import * as projectsActions from '../actions/projects'
import ConfirmModal from '../../common/components/ConfirmModal'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import { getComponentMessages } from '../../common/util/config'
import { parseBounds, validationState } from '../util'
import type { Bounds, Project } from '../../types'
import type { ManagerUserState } from '../../types/reducers'

import CustomCSVForm from './transform/CustomCSVForm'

type ProjectModel = {
  autoFetchFeeds?: boolean,
  autoFetchHour?: number,
  autoFetchMinute?: number,
  bounds?: Bounds,
  defaultTimeZone?: string,
  id?: string,
  name?: string,
  peliasWebhookUrl?: string,
  sharedStopsConfig?: string
}

type Props = {
  deleteProject?: typeof projectsActions.deleteProject,
  editDisabled?: boolean,
  onCancelUrl: string,
  project: Project | ProjectModel,
  showDangerZone?: boolean,
  updateProject: typeof projectsActions.updateProject,
  user: ManagerUserState
}

type State = {
  model: ProjectModel,
  validation: {
    bounds: boolean,
    defaultLocation: boolean,
    name: boolean,
    webhookUrl: boolean
  }
}

const DEFAULT_FETCH_TIME = moment().startOf('day').add(2, 'hours')

export default class ProjectSettingsForm extends Component<Props, State> {
  messages = getComponentMessages('ProjectSettingsForm')
  state = {
    model: {},
    validation: {
      bounds: true,
      defaultLocation: true,
      name: true,
      webhookUrl: true
    }
  }

  componentWillMount () {
    this._updateStateFromProps(this.props)
    window.addEventListener('keydown', this._handleKeyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this._handleKeyDown)
  }

  _handleKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    switch (e.keyCode) {
      case 13: // ENTER
        this._onSaveSettings()
        break
      default:
        break
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    this._updateStateFromProps(nextProps)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state)
  }

  _updateStateFromProps (props: Props) {
    // cast to make flow happy
    const model: any = props.project
    this.setState({ model })
  }

  _onCancel = () => {
    browserHistory.push(this.props.onCancelUrl)
  }

  _onDeleteProject = () => {
    const {deleteProject, project} = this.props
    if (!deleteProject) {
      throw new Error('ProjectSettingsForm component missing deleteProject action')
    }
    // cast to make flow happy
    const _project = ((project): any)
    this.refs.confirm.open({
      title: this.messages('deleteProject'),
      body: this.messages('confirmDelete'),
      onConfirm: () => deleteProject(_project)
    })
  }

  _onChangeAutoFetch = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const autoFetchMinute = DEFAULT_FETCH_TIME.minutes()
    const autoFetchHour = DEFAULT_FETCH_TIME.hours()
    const autoFetchFeeds = evt.target.checked
    this.setState(update(this.state, {
      model: {
        $merge: {autoFetchFeeds, autoFetchHour, autoFetchMinute}
      }
    }))
  }

  _onChangeBounds = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    // Parse values found in string into floats
    const {value} = evt.target
    const boundsValidation = parseBounds(value)
    if (boundsValidation.valid) {
      this.setState(update(this.state, {
        model: {
          $merge: {bounds: boundsValidation.bounds}
        },
        validation: {
          bounds: {
            $set: true
          }
        }
      }))
    } else {
      this.setState(
        update(this.state, {
          validation: {
            bounds: {
              $set: !value || value === ''
            }
          }
        })
      )
    }
  }

  _onChangeDateTime = (seconds: number) => {
    const time = moment(+seconds)
    this.setState(update(this.state, {
      model: {
        $merge: {
          autoFetchHour: time.hours(),
          autoFetchMinute: time.minutes()
        }
      }
    }))
  }

  _onChangeTimeZone = ({value: defaultTimeZone}: { value: string }) => {
    this.setState(update(this.state, {model: {$merge: {defaultTimeZone}}}))
  }

  // TODO: shared type
  // https://github.com/ibi-group/datatools-ui/pull/986#discussion_r1362271761
  _onChangeTextInput = ({target}: {target: {name?: string, value: string}}) => {
    const {name, value} = target
    if (!name) return

    this.setState(
      update(
        this.state,
        {
          model: { $merge: { [ name ]: value } },
          validation: { [ name ]: { $set: value && value.length > 0 } }
        }
      )
    )
  }

  _onSaveSettings = () => {
    const {project, updateProject} = this.props
    // Prevent a save if there have been no edits or form is invalid
    if (this._settingsAreUnedited() || !this._formIsValid()) return
    // Only the things that have changed should be sent to the server. This avoids
    // persisting JSON properties derived from a Jackson method.
    updateProject(project.id || '', this._getChanges(), true)
  }

  _getChanges = () => {
    const {model} = this.state
    const {project} = this.props
    const changes: any = {}
    Object.keys(model).map(k => {
      if (model[k] !== project[k]) {
        changes[k] = model[k]
      }
    })
    return changes
  }

  _settingsAreUnedited = () => Object.keys(this._getChanges()).length === 0

  _formIsValid = () => {
    const {validation} = this.state
    return Object.keys(validation).every(k => validation[k])
  }

  // eslint-disable-next-line complexity
  render () {
    const {editDisabled, showDangerZone} = this.props
    const {model, validation} = this.state
    const {autoFetchHour, autoFetchMinute} = model
    const autoFetchChecked = model.autoFetchFeeds
    if (editDisabled) {
      return (
        <p className='lead text-center'>
          <strong>{this.messages('warning')}</strong>{' '}
          {this.messages('noPermissions')}
        </p>
      )
    }

    return (
      <div>
        <ConfirmModal ref='confirm' />
        <Panel>
          <Panel.Heading><Panel.Title componentClass='h3'>{this.messages('title')}</Panel.Title></Panel.Heading>
          <ListGroup>
            <ListGroupItem>
              <FormGroup
                data-test-id='project-name-input-container'
                validationState={validationState(validation.name)}>
                <ControlLabel>{this.messages('fields.name')}</ControlLabel>
                <FormControl
                  name={'name'}
                  onChange={this._onChangeTextInput}
                  value={model.name || ''}
                />
                <FormControl.Feedback />
                <HelpBlock>{this.messages('required')}</HelpBlock>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel>
          <Panel.Heading><Panel.Title componentClass='h4'>{this.messages('fields.updates.title')}</Panel.Title></Panel.Heading>
          <ListGroup>
            <ListGroupItem>
              <FormGroup>
                <Checkbox
                  checked={autoFetchChecked}
                  onChange={this._onChangeAutoFetch}>
                  <strong>
                    {this.messages('fields.updates.autoFetchFeeds')}
                  </strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                    dateTime={
                      typeof autoFetchMinute === 'number' && typeof autoFetchHour === 'number'
                        ? +moment().startOf('day').add(autoFetchHour, 'hours').add(
                          autoFetchMinute,
                          'minutes'
                        )
                        : DEFAULT_FETCH_TIME}
                    mode='time'
                    onChange={this._onChangeDateTime}
                  />
                  : ''}
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel >
          <Panel.Heading><Panel.Title componentClass='h4'>{this.messages('fields.location.title')}</Panel.Title></Panel.Heading>
          <ListGroup>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>
                  <Glyphicon glyph='fullscreen' />{' '}
                  {this.messages('fields.location.boundingBox')}
                </ControlLabel>
                <InputGroup ref='boundingBoxGroup'>
                  <FormControl
                    defaultValue={model.bounds
                      ? `${model.bounds.west},${model.bounds.south},${model.bounds.east},${model.bounds.north}`
                      : ''}
                    onChange={this._onChangeBounds}
                    placeholder={this.messages(
                      'fields.location.boundingBoxPlaceHolder'
                    )}
                    ref='boundingBox'
                    type='text'
                  />
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel>
                <Glyphicon glyph='time' />{' '}
                {this.messages('fields.location.defaultTimeZone')}
              </ControlLabel>
              <TimezoneSelect
                onChange={this._onChangeTimeZone}
                value={model.defaultTimeZone}
              />
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel>
          <Panel.Heading><Panel.Title componentClass='h4'>{this.messages('fields.sharedStops.title')}</Panel.Title></Panel.Heading>
          <ListGroup>
            <ListGroupItem>
              <FormGroup>
                {/* TODO: on enter, textarea should NOT submit. This causes strange behavior when
                editing in the textarea

                see: https://github.com/ibi-group/datatools-ui/pull/977#discussion_r1288916749 */}
                <CustomCSVForm
                  csvData={model.sharedStopsConfig || ''}
                  hideSaveButton
                  name={'sharedStopsConfig'}
                  onChangeCsvData={this._onChangeTextInput}
                  onSaveCsvData={() => {}}
                  placeholder={`stop_group_id,feed_id,stop_id,is_primary\n1,1,29240,1\n1,3,4705,0`}
                />
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel>
          <Panel.Heading><Panel.Title componentClass='h4'>{this.messages('fields.localPlacesIndex.title')}</Panel.Title></Panel.Heading>
          <ListGroup>
            <ListGroupItem>
              <FormGroup validationState={validationState(validation.webhookUrl)}>
                <ControlLabel>{this.messages('fields.localPlacesIndex.webhookUrl')}</ControlLabel>
                <FormControl
                  name={'peliasWebhookUrl'}
                  onChange={this._onChangeTextInput}
                  value={model.peliasWebhookUrl || ''}
                />
                <FormControl.Feedback />
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        {showDangerZone &&
          <Panel bsStyle='danger'>
            <Panel.Heading><Panel.Title componentClass='h3'>{this.messages('dangerZone')}</Panel.Title></Panel.Heading>
            <ListGroup>
              <ListGroupItem>
                <Button
                  bsStyle='danger'
                  className='pull-right'
                  data-test-id='delete-project-button'
                  onClick={this._onDeleteProject}
                >
                  <Icon type='trash' /> {this.messages('deleteProject')}
                </Button>
                <h4>{this.messages('deleteThisProject')}</h4>
                <p>{this.messages('deleteWarning')}</p>
              </ListGroupItem>
            </ListGroup>
          </Panel>
        }
        <Row>
          <Col xs={12}>
            {/* Cancel Button */}
            <Button onClick={this._onCancel} style={{ marginRight: 10 }}>
              {this.messages('cancel')}
            </Button>
            {/* Save Button */}
            <Button
              bsStyle='primary'
              data-test-id='project-settings-form-save-button'
              disabled={editDisabled || this._settingsAreUnedited() ||
          !this._formIsValid()}
              onClick={this._onSaveSettings}>
              {this.messages('save')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
