// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  ListGroup,
  ListGroupItem,
  Panel
} from 'react-bootstrap'

import SelectFileModal from '../../../common/components/SelectFileModal'
import ConfirmModal from '../../../common/components/ConfirmModal'
import { updateDeployment, uploadPeliasWebhookCsvFile, updatePelias } from '../../actions/deployments'
import { setErrorMessage } from '../../actions/status'
import type { Deployment, Project } from '../../../types'
import {
  formatTimestamp
} from '../../../common/util/date-time'

type Props = {
  deployment: Deployment,
  project: Project,
  setErrorMessage: typeof setErrorMessage,
  updateDeployment: typeof updateDeployment,
  updatePelias: typeof updatePelias,
  uploadPeliasWebhookCsvFile: typeof uploadPeliasWebhookCsvFile
}

type State = {
  fileToDeleteOnSuccesfulUpload: string | null,
  peliasCsvUploadsDates: Array<string>
}

class PeliasPanel extends Component<Props, State> {
  state = {
    fileToDeleteOnSuccesfulUpload: null,
    peliasCsvUploadsDates: []
  };

componentDidUpdate = (newProps) => {
  const { deployment } = newProps
  if (!deployment.peliasCsvFiles) {
    return
  }

  // Only update if the deployment has changed
  if (
    this.props.deployment.peliasCsvFiles &&
    this.props.deployment.peliasCsvFiles.every(
      // $FlowFixMe flow is wrong
      (file) => deployment.peliasCsvFiles.indexOf(file) > -1
    ) &&
    // $FlowFixMe flow is wrong
    deployment.peliasCsvFiles.every(
    // $FlowFixMe flow is wrong
      (file) => this.props.deployment.peliasCsvFiles.indexOf(file) > -1
    // And if there are no upload dates yet
    ) && this.state.peliasCsvUploadsDates.length > 0
  ) {
    return
  }

  // $FlowFixMe flow is wrong
  deployment.peliasCsvFiles.forEach(
    (file, index) => this.fetchAndUpdatePeliasDate(file, index)
  )
}

  fetchAndUpdatePeliasDate = (url, index) => {
    const { peliasCsvUploadsDates } = this.state
    fetch(url, {method: 'HEAD'}).then(data => {
      const lastModified = data.headers.get('last-modified')
      if (!lastModified) return

      peliasCsvUploadsDates[index] = lastModified
      this.setState({peliasCsvUploadsDates})
    })
  }

  /**
   * Method fired when Pelias *Update* button is pressed
   */
  _onClickPeliasUpdate = () => {
    const {deployment, updatePelias} = this.props
    updatePelias(deployment)
  }
  /**
   * Method fired when Pelias *Reset* button is pressed. The true
   * flag tells the webhook to wipe the Pelias database before updating.
   */
  _onClickPeliasReset = () => {
    const {deployment, updatePelias} = this.props
    updatePelias(deployment, true)
  }

  /**
   * Updates state on input changes. Does not persist changes to deployment
   */
  _onChangeTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { id, value } = target
    this.setState({ [id]: value })
  };
  /**
   * Fires when input field is blurred, and persists state changes to the deployment by
   * making a network request
  */
  _onBlurTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { id, value } = target
    const { deployment } = this.props

    // Only make a network request if the value differs
    if (deployment[id] !== value) {
      this._updateDeployment({ [id]: value })
    }
  };

  _onCsvActionButtonClick = (event: SyntheticInputEvent<HTMLInputElement>, url: string) => {
    const { id } = event.target

    switch (id) {
      case 'replace':
        // Action is launched via a prop of the modal
        this.refs.uploadModal.open()
        this.setState({fileToDeleteOnSuccesfulUpload: url})
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this CSV file?')) {
          this._deleteCsvFile(url)
        }
        break
      default:
        console.error('CSV button click handler called from outside valid button')
    }
  }

  _onCustomNameCancel = () => {
    this.refs.confirm.open({
      title: `Are you sure you want to remove this file?`,
      body: 'This is irreversible',
      onConfirm: () => {
        this._updateDeployment({ peliasSynonymsBase64: null })
      }
    })
  }

  /**
   * Takes files submitted via the file uploader modal and sends them to datatools server where they are
   * uploaded to S3
   * @param files Array of files returned by the file upload modal
   * @returns     True or false depending on if the upload was a success
   */
  _onConfirmUpload = async (files: Array<File>) => {
    const { deployment, uploadPeliasWebhookCsvFile } = this.props
    const { fileToDeleteOnSuccesfulUpload } = this.state

    const file = files[0]
    // TODO: more extensive csv validation?
    if (file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      return false
    }

    // Extra step is required for flow to be appeased
    const uploadSuccess = await uploadPeliasWebhookCsvFile(deployment, file, fileToDeleteOnSuccesfulUpload)
    return uploadSuccess
  }

   /**
    * Takes files submitted via the file uploader modal and encodes it to base64, then
    * adds it to the deployment object
    * @param files Array of files returned by the file upload henmodal
    * @returns     True or false depending on if the upload was a success
    */
   _onConfirmSynonymsUpload = async (files: Array<File>) => {
     const file = files[0]

     if (!file) return false
     if (file.type !== 'text/plain') {
       return false
     }

     // Attempt base64 encode
     const toBase64 = file => new Promise((resolve, reject) => {
       const reader = new FileReader()
       reader.readAsDataURL(file)
       reader.onload = () => resolve(reader.result)
       reader.onerror = reject
     })

     try {
       const encoded = await toBase64(file)
       this._updateDeployment({
         peliasSynonymsBase64: encoded
       })
       return true
     } catch {
       return false
     }
   }

  /**
   * Removes a csv file from the list of Pelias csv files associated with a deployment
   * WARNING: DOES NOT REMOVE THE FILE FROM S3!
   * @param url   The URL of the csv file to remove from the deployment
   */
  _deleteCsvFile = async (url: string) => {
    const { deployment } = this.props
    if (!deployment.peliasCsvFiles) return

    const updatedCsvFiles = deployment.peliasCsvFiles.filter(u => u !== url)
    this._updateDeployment({'peliasCsvFiles': updatedCsvFiles})
  }

  /**
   * Persists changes to the deployment object by making a request to the datatools server
   */
  _updateDeployment = (props: { [string]: any }) => {
    const { deployment, updateDeployment } = this.props
    updateDeployment(deployment, props)
  };

  /**
   * Renders a csv link associated with the deployment. Renders the file name (or URI if not added by datatools) and
   * buttons to replace or remove the file
   * @param {*} url     The URL to add to the list of csv files associated with the deployment
   * @param {*} enabled Whether the buttons should be enabled
   * @param {*} label   An optional label to render next to the buttons
   * @returns           JSX including the file name and buttons
   */
  renderCsvUrl = (url: string, enabled: boolean, label?: string) => {
    // Usually, files will be rendered by https://github.com/ibi-group/datatools-server/blob/dev/src/main/java/com/conveyal/datatools/manager/controllers/api/DeploymentController.java
    // so we can take advantage of a predictable filename
    // As a fallback, render the full url
    const fileName = url.split('_').length === 2 ? url.split('_')[1] : url
    return (
      <li key={url}>
        {fileName}{' '}
        <Button
          bsSize='xsmall'
          disabled={!enabled}
          id='replace'
          onClick={(e) => this._onCsvActionButtonClick(e, url)}
        >
          Replace
        </Button>
        <Button
          bsSize='xsmall'
          disabled={!enabled}
          id='delete'
          onClick={(e) => this._onCsvActionButtonClick(e, url)}
        >
          Delete
        </Button>
        <Button
          bsSize='xsmall'
          disabled={!enabled}
          id='delete'
          onClick={() => { window.location = url }}
        >
          Download
        </Button>
        {label && <em style={{marginLeft: '1ch', verticalAlign: 'middle'}}>{label}</em>}
      </li>
    )
  }

  render () {
    const { deployment, project } = this.props

    // Don't show panel is no webhook url is set
    if (!project.peliasWebhookUrl) {
      return null
    }

    const peliasButtonsDisabled = !deployment || (deployment.ec2Instances && deployment.ec2Instances.length === 0)

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass='h3'>
            <Icon type='map-marker' /> Local Places Index Settings
          </Panel.Title>
        </Panel.Heading>
        <ListGroup>
          <ListGroupItem>
            <ButtonToolbar style={{ display: 'flex', flexDirection: 'row' }}>
              <h5>Local Places Index</h5>
              <ButtonGroup
                title={
                  peliasButtonsDisabled
                    ? 'Local Places Index can only be updated if there is a running OTP instance'
                    : ''
                }
              >
                {/* If there are no deployments don't allow user to update Pelias yet */}
                <Button
                  disabled={peliasButtonsDisabled}
                  onClick={this._onClickPeliasUpdate}
                >
                  Update
                </Button>
                <Button
                  disabled={peliasButtonsDisabled}
                  onClick={() => this.refs.reInitPeliasModal.open()}
                >
                  Reset
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
            <ConfirmModal
              body='This will cause custom geocoder responses to be unavailable for about 1 - 5 minutes after deploying. Regular addresses and landmarks will continue to be available. Stops and stations from feeds that are not part of this deployment will be removed from the suggestions.'
              onConfirm={this._onClickPeliasReset}
              ref='reInitPeliasModal'
              title='Are you sure you want to rebuild the Local Places Index database?'
            />
          </ListGroupItem>
          <ListGroupItem>
            <h5>Custom Point Of Interest CSV Files</h5>
            <p>
              These files are sent to the Local Places Index when it is updated
              or reset
            </p>
            <SelectFileModal
              body='Select a CSV file of local places/points of interest to upload:'
              errorMessage='Uploaded file must be a valid csv file (.csv).'
              onCancel={() =>
                this.setState({ fileToDeleteOnSuccesfulUpload: null })
              }
              onConfirm={async (files) => this._onConfirmUpload(files)}
              ref='uploadModal'
              title='Upload CSV File'
            />
            <ul>
              {deployment.peliasCsvFiles &&
                deployment.peliasCsvFiles.map((url, index) => {
                  const uploadDate = this.state.peliasCsvUploadsDates[index]
                  const label = uploadDate ? formatTimestamp(uploadDate) : ''
                  return this.renderCsvUrl(url, !peliasButtonsDisabled, label)
                }
                )}
            </ul>
            <Button
              disabled={peliasButtonsDisabled}
              onClick={() => this.refs.uploadModal.open()}
              style={{ marginTop: '5px' }}
            >
              Upload New CSV File
            </Button>
          </ListGroupItem>
          <ListGroupItem>
            <h5>Synonyms File</h5>
            <div>Upload your synonyms file here</div>
            <SelectFileModal
              body='Select a synonms file to upload:'
              errorMessage='Selected file was invalid. It must be a plain text file.'
              onConfirm={async (files) => this._onConfirmSynonymsUpload(files)}
              ref='uploadSynonymsModal'
              title='Upload Synonyms File'
            />
            <div>
              <Button
                disabled={peliasButtonsDisabled}
                onClick={() => this.refs.uploadSynonymsModal.open()}
                style={{ marginTop: 15 }}
              >
                {deployment.peliasSynonymsBase64 ? 'Replace' : 'Upload'} Synonyms File
              </Button>
              {deployment.peliasSynonymsBase64 &&
                <span style={{paddingLeft: '1ch'}}>Synonyms file currently loaded</span>}
            </div>
            <Button
              disabled={peliasButtonsDisabled || !deployment.peliasSynonymsBase64}
              style={{ marginTop: 5 }}
              onClick={this._onCustomNameCancel}
            >
              Remove Synonyms File
            </Button>
            <ConfirmModal ref='confirm' />
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}

const mapDispatchToProps = {uploadPeliasWebhookCsvFile, setErrorMessage, updatePelias}

export default connect(
  null,
  mapDispatchToProps
)(PeliasPanel)
