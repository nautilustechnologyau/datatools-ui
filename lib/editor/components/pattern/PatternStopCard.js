// @flow

import Icon from '@conveyal/woonerf/components/icon'
import clone from 'lodash/cloneDeep'
import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import {
  Checkbox,
  Col,
  Collapse,
  ControlLabel,
  FormControl,
  FormGroup,
  Row
} from 'react-bootstrap'

import * as activeActions from '../../actions/active'
import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import * as tripPatternActions from '../../actions/tripPattern'
import {getEntityName, getAbbreviatedStopName} from '../../util/gtfs'
import MinuteSecondInput from '../MinuteSecondInput'
import {getComponentMessages} from '../../../common/util/config'
import type {Feed, Pattern, PatternStop} from '../../../types'

import NormalizeStopTimesTip from './NormalizeStopTimesTip'
import PatternStopButtons from './PatternStopButtons'

type Props = {
  active: boolean,
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  // property is available through react dnd?
  connectDragSource: any,
  cumulativeTravelTime: number,
  feedSource: Feed,
  findCard: string => { card: PatternStop, index: number },
  id: string,
  index: number,
  isDragging: boolean,
  moveCard: (string, number) => void,
  patternEdited: boolean,
  patternStop: PatternStop,
  removeStopFromPattern: typeof stopStrategiesActions.removeStopFromPattern,
  rowStyle: {[string]: number | string},
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  setActiveStop: typeof tripPatternActions.setActiveStop,
  status: any,
  stop: any,
  stopIsActive: boolean,
  updateActiveGtfsEntity: typeof activeActions.updateActiveGtfsEntity,
  updatePatternStops: typeof tripPatternActions.updatePatternStops
}

type PickupDropoffSelectProps = {
  activePattern: Pattern,
  controlLabel: string,
  onChange: (evt: SyntheticInputEvent<HTMLInputElement>) => void,
  selectType: "pickupType" | "dropOffType" | "continuousPickup" | "continuousDropOff",
  shouldHaveDisabledOption: boolean,
  title: string,
  value: string | number
}

type State = {
  initialDwellTime: number,
  initialTravelTime: number,
  update: boolean
}

const patternStopCardMessages = getComponentMessages('PatternStopCard')

const pickupDropoffOptions = [
  {
    value: '' // Default text is defined conditionally based on the type of select (continuous-service or pickup-dropoff)
  },
  {
    text: patternStopCardMessages('PickupDropOffSelect.available'),
    value: 0
  },
  {
    text: patternStopCardMessages('PickupDropOffSelect.notAvailable'),
    value: 1
  },
  {
    text: patternStopCardMessages('PickupDropOffSelect.mustPhoneAgency'),
    value: 2
  },
  {
    text: patternStopCardMessages('PickupDropOffSelect.mustCoordinate'),
    value: 3
  }
]

/** renders the form control drop downs for dropOff/Pick up and also continuous */
const PickupDropoffSelect = (props: PickupDropoffSelectProps) => {
  const {
    activePattern,
    controlLabel,
    onChange,
    selectType,
    shouldHaveDisabledOption,
    title,
    value
  } = props
  const hasShapeId = activePattern.shapeId === null
  return (
    <FormGroup
      bsSize='small'
      controlId={selectType}
    >
      <ControlLabel
        className='small'
        title={title}
      >
        {controlLabel}
      </ControlLabel>
      <FormControl
        componentClass='select'
        disabled={shouldHaveDisabledOption && hasShapeId}
        onChange={onChange}
        placeholder='select'
        value={value}
      >
        {pickupDropoffOptions.map(o => (
          <option key={o.value} value={o.value}>
            {o.value !== '' ? o.text : selectType.includes('continuous')
              ? patternStopCardMessages('PickupDropOffSelect.continuousServiceDefault')
              : patternStopCardMessages('PickupDropOffSelect.pickupDropOffDefault') }
          </option>
        ))}
      </FormControl>
    </FormGroup>
  )
}

const cardSource = {
  beginDrag (props: Props) {
    return {
      id: props.id,
      originalIndex: props.findCard(props.id).index
    }
  },

  endDrag (props: Props, monitor: any) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    if (!didDrop) {
      console.log('endDrag')
      props.moveCard(droppedId, originalIndex)
    }
  },

  // disable dragging if request is pending (i.e., save trip pattern is in progress)
  canDrag (props: Props, monitor: any) {
    if (props.status.savePending || props.active) {
      const item = monitor.getItem()
      // Ensure item exists before getting ID.
      const id = item && item.id
      console.warn(`Cannot drag card (id=${id}). Card is active or save is in progress.`)
      return false
    }
    return true
  }
}

const cardTarget = {
  drop (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const { index: droppedIndex } = props.findCard(droppedId)
    if (droppedIndex !== originalIndex) {
      props.dropCard()
    }
  },

  hover (props, monitor) {
    const { id: draggedId } = monitor.getItem()
    const { id: overId } = props
    if (draggedId !== overId) {
      const { index: overIndex } = props.findCard(overId)
      props.moveCard(draggedId, overIndex)
    }
  }
}

class PatternStopCard extends Component<Props> {
  _formatTravelTime (cumulativeTravelTime, patternStop) {
    return `${Math.round(cumulativeTravelTime / 60)} (+${Math.round(patternStop.defaultTravelTime / 60)}${patternStop.defaultDwellTime > 0 ? ` +${Math.round(patternStop.defaultDwellTime / 60)}` : ''})`
  }

  handleClick = () => {
    const {active, id, index, setActiveStop} = this.props
    if (!active) setActiveStop({id, index})
    else setActiveStop({id: null, index: null})
  }

  _onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.handleClick()
    }
  }

  render () {
    const {
      active,
      connectDragSource,
      // $FlowFixMe https://github.com/flow-typed/flow-typed/issues/1564
      connectDropTarget,
      stop,
      index,
      patternStop,
      cumulativeTravelTime
    } = this.props
    const stopName = getEntityName(stop)
    const abbreviatedStopName = getAbbreviatedStopName(stop)
    const titleStopName = stop
      ? `${index + 1}. ${stopName}`
      : `${index + 1}. [unknown stop]`
    const fullStopName = stop
      ? `${index + 1}. ${abbreviatedStopName}`
      : `${index + 1}. [unknown stop]`
    return connectDragSource(connectDropTarget(
      <div
        className='pattern-stop-card'
        // Show pattern stop in warning color if travel time is zero (a zero value
        // is required for the first pattern stop).
        style={!patternStop.defaultTravelTime && index !== 0
          ? {backgroundColor: 'hsla(35, 84%, 87%, 1)'}
          : null
        }>
        {/* Main card title */}
        <div
          className='small'
          role='button'
          style={{cursor: 'pointer'}}
          tabIndex={0}
          onClick={this.handleClick}
          onKeyDown={this._onKeyDown}>
          <div className='pull-left'>
            <p
              style={{margin: '0px'}}
              title={titleStopName}>
              <Icon type={active ? 'caret-down' : 'caret-right'} />
              {fullStopName.length > 25
                ? fullStopName.substr(0, 25) + '...'
                : fullStopName
              }
            </p>
          </div>
          <div className='pull-right'>
            <p style={{margin: '0px'}} className='text-right'>
              <span>
                {this._formatTravelTime(cumulativeTravelTime, patternStop)}
              </span>
              {'    '}
              <span style={{cursor: '-webkit-grab', color: 'black'}} >
                <Icon type='bars' />
              </span>
            </p>
          </div>
          <div className='clearfix' />
        </div>
        <PatternStopContents {...this.props} />
      </div>
    ))
  }
}

class PatternStopContents extends Component<Props, State> {
  componentWillMount () {
    this.setState({
      initialDwellTime: this.props.patternStop.defaultDwellTime,
      initialTravelTime: this.props.patternStop.defaultTravelTime,
      update: false
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.patternEdited && this.props.patternEdited) {
      this.setState({update: false})
    }
  }

  /**
   * Only update component if id changes, active state changes, or if pattern has
   * been saved (patternEdited changes to false). This is to ensure that default
   * times are not overwritten.
   * FIXME: id shouldn't change anymore (not generated client-side). Check that
   * this has no negative effects (check elsewhere, too, for example, pattern geom).
   */
  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.active !== this.props.active ||
      nextProps.id !== this.props.id ||
      nextState !== this.state ||
      (!nextProps.patternEdited && this.props.patternEdited)
    ) {
      return true
    }
    return false
  }

  _onChangeTimepoint = () => {
    const {activePattern, index, patternStop, saveActiveGtfsEntity, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]
    const newValue = patternStop.timepoint ? 0 : 1
    patternStops[index].timepoint = newValue
    updatePatternStops(activePattern, patternStops)
    saveActiveGtfsEntity('trippattern')
  }

  _onClickRemovePatternStop = () => {
    const {activePattern, index, saveActiveGtfsEntity, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops.splice(index, 1)
    updatePatternStops(activePattern, patternStops)
    saveActiveGtfsEntity('trippattern')
  }

  _onDwellTimeChange = (defaultDwellTime: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops[index].defaultDwellTime = defaultDwellTime
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  _onTravelTimeChange = (defaultTravelTime: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops[index].defaultTravelTime = defaultTravelTime
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  _onPickupOrDropOffChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const selectedOptionValue: number = parseInt(evt.target.value, 10)
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]

    const newPatternStop = clone(patternStops[index])
    newPatternStop[evt.target.id] = selectedOptionValue
    patternStops[index] = newPatternStop
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  _onHeadsignChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops[index] = {
      ...patternStops[index],
      stopHeadsign: e.target.value
    }

    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  render () {
    const {active, activePattern, patternEdited, patternStop} = this.props
    // This component has a special shouldComponentUpdate to ensure that state
    // is not overwritten with new props, so use state.update to check edited
    // state.
    const isEdited = patternEdited || this.state.update

    let innerDiv
    if (active) {
      innerDiv = <div>
        {/* Remove from pattern button */}
        <Row>
          <Col xs={4}>
            <Checkbox
              checked={patternStop.timepoint}
              onChange={this._onChangeTimepoint}>
              {patternStopCardMessages('PatternStopContents.timepoint')}
            </Checkbox>
          </Col>
          <Col xs={8}>
            <PatternStopButtons
              {...this.props}
              patternEdited={isEdited}
              size='xsmall'
              style={{marginTop: '10px'}} />
          </Col>
        </Row>
        {/* default travel time inputs */}
        <Row>
          <Col xs={6}>
            <FormGroup
              controlId='defaultTravelTime'
              bsSize='small'>
              <ControlLabel
                title={this.props.index === 0
                  ? patternStopCardMessages('PatternStopContents.firstStopTravelTime')
                  : patternStopCardMessages('PatternStopContents.travelTimeHelp')
                }
                className='small'>{patternStopCardMessages('PatternStopContents.defaultTravelTime')}</ControlLabel>
              <MinuteSecondInput
                disabled={this.props.index === 0}
                seconds={this.state.initialTravelTime}
                onChange={this._onTravelTimeChange} />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup
              controlId='defaultDwellTime'
              bsSize='small'>
              <ControlLabel className='small'>{patternStopCardMessages('PatternStopContents.defaultDwellTime')}</ControlLabel>
              <MinuteSecondInput
                seconds={this.state.initialDwellTime}
                onChange={this._onDwellTimeChange} />
            </FormGroup>
          </Col>
        </Row>
        {/* Pickup and drop off type selectors */}
        <Row>
          <Col xs={6}>
            <PickupDropoffSelect
              activePattern={activePattern}
              controlLabel='Pickup'
              onChange={this._onPickupOrDropOffChange}
              selectType='pickupType'
              shouldHaveDisabledOption={false}
              title={patternStopCardMessages('PickupDropOffSelect.pickupTitle')}
              value={(patternStop.pickupType || patternStop.pickupType === 0) ? patternStop.pickupType : ''}
            />
          </Col>
          <Col xs={6}>
            <PickupDropoffSelect
              activePattern={activePattern}
              controlLabel='Drop-off'
              onChange={this._onPickupOrDropOffChange}
              selectType='dropOffType'
              shouldHaveDisabledOption={false}
              title={patternStopCardMessages('PickupDropOffSelect.dropOffTitle')}
              value={(patternStop.dropOffType || patternStop.dropOffType === 0) ? patternStop.dropOffType : ''}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <PickupDropoffSelect
              activePattern={activePattern}
              controlLabel='Continuous pickup'
              onChange={this._onPickupOrDropOffChange}
              selectType='continuousPickup'
              shouldHaveDisabledOption
              title={patternStopCardMessages('PickupDropOffSelect.continuousPickupTitle')}
              value={(patternStop.continuousPickup || patternStop.continuousPickup === 0) ? patternStop.continuousPickup : ''}
            />
          </Col>
          <Col xs={6}>
            <PickupDropoffSelect
              activePattern={activePattern}
              controlLabel='Continuous drop-off'
              onChange={this._onPickupOrDropOffChange}
              selectType='continuousDropOff'
              shouldHaveDisabledOption
              title={patternStopCardMessages('PickupDropOffSelect.continuousDropOffTitle')}
              value={(patternStop.continuousDropOff || patternStop.continuousDropOff === 0) ? patternStop.continuousDropOff : ''}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <FormGroup
              controlId='stopHeadsign'
              bsSize='small'>
              <ControlLabel
                className='small'
                title={patternStopCardMessages('PatternStopContents.stopHeadsignTitle')}>
                {patternStopCardMessages('PatternStopContents.stopHeadsignText')}
              </ControlLabel>
              <FormControl
                onChange={this._onHeadsignChange}
                placeholder={patternStopCardMessages('PatternStopContents.stopHeadsignPlaceholder')}
                type='text'
                value={patternStop.stopHeadsign || ''}
              />
            </FormGroup>
          </Col >
        </Row>
        <NormalizeStopTimesTip />
      </div>
    }
    return (
      <Collapse // collapsible div
        in={active}>
        <div>{innerDiv}</div>
      </Collapse>
    )
  }
}

const dropTargetCollect = (connect) => ({connectDropTarget: connect.dropTarget()})
const dragSourceCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
})

export default DropTarget('card', cardTarget, dropTargetCollect)(
  DragSource('card', cardSource, dragSourceCollect)(PatternStopCard)
)
