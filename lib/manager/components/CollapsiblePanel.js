// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, type Element } from 'react'
import { Button, ButtonToolbar, Panel, Form } from 'react-bootstrap'

import FormInput from '../../common/components/FormInput'
import type { FormProps } from '../../types'

type Props = {
  children?: Element<*>,
  data: { [string]: any },
  defaultExpanded: boolean,
  fields: Array<FormProps>,
  index: number,
  onChange: (SyntheticInputEvent<HTMLInputElement>, number) => void,
  onEnter?: (number) => void,
  onRemove?: (number) => void,
  onSave?: (number) => any,
  saveDisabled: boolean,
  showButtonsOnBottom?: boolean,
  testId: string,
  title: Element<*> | string,
};

export default class CollapsiblePanel extends Component<Props> {
  static defaultProps = {
    saveDisabled: false
  };

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.onChange(evt, this.props.index);

  _onEnter = () => this.props.onEnter && this.props.onEnter(this.props.index);

  _onRemove = () =>
    this.props.onRemove && this.props.onRemove(this.props.index);

  _onSave = () => this.props.onSave && this.props.onSave(this.props.index);

  renderButtonToolbar = () => {
    const { onSave, saveDisabled } = this.props
    return (
      <ButtonToolbar className='pull-right'>
        {/* Only render save button is onSave prop is defined */}
        {typeof onSave === 'function' && (
          <Button
            bsSize='small'
            bsStyle='primary'
            data-test-id='save-item-button'
            disabled={saveDisabled}
            onClick={this._onSave}
          >
            <Icon type='floppy-o' /> Save
          </Button>
        )}
        <Button bsSize='small' bsStyle='danger' onClick={this._onRemove}>
          <Icon type='trash-o' /> Delete
        </Button>
      </ButtonToolbar>
    )
  };

  render () {
    const {
      data,
      defaultExpanded,
      fields,
      showButtonsOnBottom,
      testId,
      title
    } = this.props
    return (
      <Panel
        data-test-id={testId}
        defaultExpanded={defaultExpanded}
        onEnter={this._onEnter}
      >
        <Panel.Heading>
          <Panel.Title
            componentClass='h5'
            style={{ width: '100%', cursor: 'pointer' }}
            toggle
          >
            {title}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Form>
              {this.renderButtonToolbar()}
              {fields.map((f, i) => (
                <FormInput
                  field={f}
                  key={i}
                  onChange={this._onChange}
                  value={data[f.name.split('.').slice(-1)[0]]}
                />
              ))}
              {/* Additional (usually more complex) fields can go here. */}
              {this.props.children}
              {showButtonsOnBottom && (
                <div style={{ clear: 'both' }}>
                  {this.renderButtonToolbar()}
                </div>
              )}
            </Form>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    )
  }
}
